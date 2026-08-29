import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from '../../dtos/booking.dto';
import { calculateTaxForCountry } from '../payments/tax.utility';
import { AmplitudeService } from '../../amplitude/amplitude.service';
import { CommunicationsService } from '../communications/communications.service';

/** Marketplace commission on bookings (see docs/01-BUSINESS-STRATEGY.md: 15–22%). */
const PLATFORM_COMMISSION_RATE = 0.18;

const BOOKING_INCLUDES = {
  service: true,
  professional: {
    select: {
      id: true,
      title: true,
      user: { select: { id: true, fullName: true } },
    },
  },
  provider: {
    select: { id: true, businessName: true, type: true },
  },
  room: {
    select: { id: true, name: true, capacity: true, hourlyCost: true },
  },
} as const;

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] as const;

export type ProviderBookingQuery = {
  from?: string;
  to?: string;
  professionalId?: string;
  roomId?: string;
};

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private amplitude: AmplitudeService,
    private communications: CommunicationsService,
  ) {}

  /**
   * Prevent double-booking the same practitioner or room.
   * Concurrent sessions are allowed when they use different resources.
   */
  private async assertNoConflicts(params: {
    providerId: string;
    startTime: Date;
    endTime: Date;
    professionalId?: string | null;
    roomId?: string | null;
    excludeBookingId?: string;
    serviceId?: string | null;
    maxParticipants?: number | null;
  }) {
    const start = new Date(params.startTime);
    const end = new Date(params.endTime);
    if (!(end > start)) {
      throw new BadRequestException('End time must be after start time.');
    }

    // Check capacity for group classes / workshops
    const isGroupClass = Boolean(
      params.serviceId && params.maxParticipants && params.maxParticipants > 1,
    );
    if (isGroupClass && params.serviceId && params.maxParticipants) {
      const attendeesCount = await this.prisma.booking.count({
        where: {
          serviceId: params.serviceId,
          startTime: params.startTime,
          status: { in: [...ACTIVE_STATUSES] },
          ...(params.excludeBookingId ? { NOT: { id: params.excludeBookingId } } : {}),
        },
      });

      if (attendeesCount >= params.maxParticipants) {
        throw new BadRequestException(
          `This class or workshop is fully booked (${attendeesCount}/${params.maxParticipants} spots filled). Please choose another session.`,
        );
      }
    }

    // Overlapping bookings query
    // If it's a group class, fellow attendees sharing this exact class slot are not in conflict
    const overlapWhere: Prisma.BookingWhereInput = {
      providerId: params.providerId,
      status: { in: [...ACTIVE_STATUSES] },
      startTime: { lt: end },
      endTime: { gt: start },
      ...(params.excludeBookingId ? { NOT: { id: params.excludeBookingId } } : {}),
      ...(isGroupClass && params.serviceId
        ? {
            NOT: {
              AND: [
                { serviceId: params.serviceId },
                { startTime: params.startTime },
              ],
            },
          }
        : {}),
    };

    if (params.professionalId) {
      const hit = await this.prisma.booking.findFirst({
        where: { ...overlapWhere, professionalId: params.professionalId },
        include: {
          professional: { select: { title: true, user: { select: { fullName: true } } } },
          service: { select: { name: true } },
        },
      });
      if (hit) {
        const who =
          hit.professional?.user?.fullName || hit.professional?.title || 'This practitioner';
        throw new BadRequestException(
          `${who} already has “${hit.service?.name ?? 'a session'}” overlapping this time. Pick another therapist or slot.`,
        );
      }
    }

    if (params.roomId) {
      const hit = await this.prisma.booking.findFirst({
        where: { ...overlapWhere, roomId: params.roomId },
        include: {
          room: { select: { name: true } },
          service: { select: { name: true } },
        },
      });
      if (hit) {
        throw new BadRequestException(
          `Room “${hit.room?.name ?? 'selected'}” is occupied during this time. Choose another room or slot.`,
        );
      }
    }
  }

  async createBooking(data: CreateBookingDto) {
    let totalAmount = data.totalAmount;
    let professionalId = data.professionalId;
    let bufferMinutes = 0;
    let maxParticipants = 1;
    if (data.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: data.serviceId },
        select: {
          price: true,
          professionalId: true,
          doshaCompatibility: true,
          maxParticipants: true,
        },
      });
      if (totalAmount === undefined) {
        totalAmount = service ? Number(service.price) : 0;
      }
      if (!professionalId && service?.professionalId) {
        professionalId = service.professionalId;
      }
      if (service?.maxParticipants) {
        maxParticipants = service.maxParticipants;
      }
      if (service?.doshaCompatibility) {
        bufferMinutes =
          Number((service.doshaCompatibility as Record<string, any>)?.bufferMinutes) || 0;
      }
    }

    const safeTotalAmount = totalAmount ?? 0;
    const provider = await this.prisma.provider.findUnique({
      where: { id: data.providerId },
      select: { address: true },
    });
    const country = (provider?.address as Record<string, any> | null)?.country;
    const tax = calculateTaxForCountry(country, safeTotalAmount);
    
    // For tax exclusive, tax is added on top of the base totalAmount.
    const finalTotalAmount = tax.inclusive ? safeTotalAmount : safeTotalAmount + tax.amount;
    const platformCommission =
      Math.round(safeTotalAmount * PLATFORM_COMMISSION_RATE * 100) / 100;

    const effectiveEndTime =
      bufferMinutes > 0
        ? new Date(new Date(data.endTime).getTime() + bufferMinutes * 60_000)
        : data.endTime;

    await this.assertNoConflicts({
      providerId: data.providerId,
      startTime: data.startTime,
      endTime: effectiveEndTime,
      professionalId,
      roomId: data.roomId,
      serviceId: data.serviceId,
      maxParticipants,
    });

    // Link to permanent Wellness Pass (Apple/Google Wallet identity).
    let wellnessPassId: string | undefined;
    try {
      const consumer = await this.prisma.consumer.findUnique({
        where: { userId: data.consumerId },
        include: {
          wellnessPass: true,
          user: { select: { fullName: true } },
        },
      });
      if (consumer?.wellnessPass) {
        wellnessPassId = consumer.wellnessPass.id;
      } else if (consumer) {
        const pass = await this.prisma.wellnessPass.create({
          data: {
            consumerId: data.consumerId,
            holderName: consumer.user?.fullName || null,
          },
        });
        wellnessPassId = pass.id;
      }
    } catch {
      /* pass linking is best-effort — never block booking */
    }

    // Contact phone for the appointment (required by clients; optional for legacy API)
    const contactPhone = data.contactPhone?.trim();
    if (contactPhone) {
      try {
        await this.prisma.user.update({
          where: { id: data.consumerId },
          data: { phone: contactPhone.slice(0, 40) },
        });
      } catch {
        /* non-fatal */
      }
    }

    // Check if client is blocked by this provider in CRM
    const clientRecord = await this.prisma.clientRecord.findUnique({
      where: {
        providerId_consumerId: {
          providerId: data.providerId,
          consumerId: data.consumerId,
        },
      },
    });
    if (clientRecord?.status === 'blocked') {
      throw new BadRequestException(
        'This provider is currently unable to accept online appointments from this account.',
      );
    }

    const {
      contactPhone: _drop,
      recurrence,
      recurrenceCount,
      ...bookingFields
    } = data as CreateBookingDto & {
      contactPhone?: string;
      recurrence?: string;
      recurrenceCount?: number;
    };

    const isRecurring =
      recurrence && recurrence !== 'none' && (recurrenceCount ?? 1) > 1;
    const totalOccurrences = isRecurring ? Math.min(recurrenceCount!, 12) : 1;

    const baseNote = [
      data.notes?.trim(),
      contactPhone ? `Contact phone: ${contactPhone}` : '',
      isRecurring ? `[Recurring: ${recurrence} · 1/${totalOccurrences}]` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const booking = await this.prisma.booking.create({
      data: {
        ...bookingFields,
        professionalId,
        wellnessPassId,
        notes: baseNote || data.notes,
        totalAmount: finalTotalAmount,
        taxAmount: tax.amount,
        taxRate: tax.rate,
        taxName: tax.name,
        taxExclusive: !tax.inclusive,
        platformCommission,
        providerPayout: Math.round((finalTotalAmount - platformCommission) * 100) / 100,
      },
      include: BOOKING_INCLUDES,
    });

    // Schedule remaining recurring occurrences if requested
    if (isRecurring) {
      const durationMs = new Date(data.endTime).getTime() - new Date(data.startTime).getTime();
      const intervalDays =
        recurrence === 'biweekly' ? 14 : recurrence === 'monthly' ? 28 : 7;

      for (let i = 2; i <= totalOccurrences; i++) {
        const offsetDays = (i - 1) * intervalDays;
        const nextStart = new Date(new Date(data.startTime).getTime() + offsetDays * 86_400_000);
        const nextEnd = new Date(nextStart.getTime() + durationMs);

        try {
          const occurrenceEffectiveEnd =
            bufferMinutes > 0
              ? new Date(nextEnd.getTime() + bufferMinutes * 60_000)
              : nextEnd;

          await this.assertNoConflicts({
            providerId: data.providerId,
            startTime: nextStart,
            endTime: occurrenceEffectiveEnd,
            professionalId,
            roomId: data.roomId,
            serviceId: data.serviceId,
            maxParticipants,
          });

          await this.prisma.booking.create({
            data: {
              ...bookingFields,
              startTime: nextStart,
              endTime: nextEnd,
              professionalId,
              wellnessPassId,
              notes: [
                data.notes?.trim(),
                contactPhone ? `Contact phone: ${contactPhone}` : '',
                `[Recurring: ${recurrence} · ${i}/${totalOccurrences}] (Series parent: ${booking.id})`,
              ]
                .filter(Boolean)
                .join('\n'),
              totalAmount: finalTotalAmount,
              taxAmount: tax.amount,
              taxRate: tax.rate,
              taxName: tax.name,
              taxExclusive: !tax.inclusive,
              platformCommission,
              providerPayout: Math.round((finalTotalAmount - platformCommission) * 100) / 100,
            },
          });
        } catch (err) {
          // If a slot in the series has a conflict, skip or continue without failing the primary booking
        }
      }
    }

    await this.grantBookingHealthConsents(booking);
    await this.communications.queueBookingCreated(booking.id);

    this.amplitude.track(booking.consumerId, 'Booking Created', {
      booking_id: booking.id,
      provider_id: booking.providerId,
      service_id: booking.serviceId,
      total_amount: Number(booking.totalAmount),
      currency: 'AUD',
      is_recurring: isRecurring,
      recurrence_frequency: recurrence || 'none',
    });

    return booking;
  }

  /** Scoped consent so practitioners can read dosha data for a booked session. */
  private async grantBookingHealthConsents(booking: {
    id: string;
    consumerId: string;
    providerId: string;
    professionalId: string | null;
    endTime: Date;
  }) {
    const expiresAt = new Date(booking.endTime);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const grants: {
      granteeId: string;
      permissionType: string;
      scope: object;
    }[] = [
      {
        granteeId: booking.providerId,
        permissionType: 'view_health_profile',
        scope: { bookingId: booking.id, dataCategories: ['dosha_scores'] },
      },
    ];

    if (booking.professionalId) {
      grants.push({
        granteeId: booking.professionalId,
        permissionType: 'view_dosha_history',
        scope: {
          bookingId: booking.id,
          dataCategories: ['dosha_scores', 'treatment_plans'],
        },
      });
    }

    for (const grant of grants) {
      const existing = await this.prisma.clientConsent.findFirst({
        where: {
          consumerId: booking.consumerId,
          granteeId: grant.granteeId,
          permissionType: grant.permissionType,
          status: 'active',
        },
      });
      if (existing) {
        await this.prisma.clientConsent.update({
          where: { id: existing.id },
          data: {
            scope: grant.scope as Prisma.InputJsonValue,
            expiresAt,
          },
        });
      } else {
        await this.prisma.clientConsent.create({
          data: {
            consumerId: booking.consumerId,
            granteeId: grant.granteeId,
            permissionType: grant.permissionType,
            scope: grant.scope as Prisma.InputJsonValue,
            expiresAt,
            status: 'active',
          },
        });
      }
    }
  }

  async findByConsumer(consumerId: string) {
    return this.prisma.booking.findMany({
      where: { consumerId },
      include: BOOKING_INCLUDES,
      orderBy: { startTime: 'desc' },
    });
  }

  async findByProvider(providerId: string, query: ProviderBookingQuery = {}) {
    const where: Prisma.BookingWhereInput = { providerId };
    if (query.from || query.to) {
      where.startTime = {};
      if (query.from) where.startTime.gte = new Date(query.from);
      if (query.to) where.startTime.lt = new Date(query.to);
    }
    if (query.professionalId) where.professionalId = query.professionalId;
    if (query.roomId) where.roomId = query.roomId;

    return this.prisma.booking.findMany({
      where,
      include: {
        ...BOOKING_INCLUDES,
        consumer: {
          select: {
            userId: true,
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDES,
    });
  }

  async updateBooking(id: string, data: UpdateBookingDto) {
    const existing = await this.prisma.booking.findUnique({ where: { id } });
    if (!existing) throw new BadRequestException('Booking not found.');

    const startTime = data.startTime ?? existing.startTime;
    const endTime = data.endTime ?? existing.endTime;
    const professionalId =
      data.professionalId !== undefined ? data.professionalId : existing.professionalId;
    const roomId = data.roomId !== undefined ? data.roomId : existing.roomId;
    const nextStatus = data.status ?? existing.status;

    if (ACTIVE_STATUSES.includes(nextStatus as (typeof ACTIVE_STATUSES)[number])) {
      let bufferMinutes = 0;
      let maxParticipants = 1;
      if (existing.serviceId) {
        const service = await this.prisma.service.findUnique({
          where: { id: existing.serviceId },
          select: { doshaCompatibility: true, maxParticipants: true },
        });
        if (service?.doshaCompatibility) {
          bufferMinutes =
            Number((service.doshaCompatibility as Record<string, any>)?.bufferMinutes) || 0;
        }
        if (service?.maxParticipants) {
          maxParticipants = service.maxParticipants;
        }
      }

      const effectiveEndTime =
        bufferMinutes > 0
          ? new Date(new Date(endTime).getTime() + bufferMinutes * 60_000)
          : endTime;

      await this.assertNoConflicts({
        providerId: existing.providerId,
        startTime,
        endTime: effectiveEndTime,
        professionalId,
        roomId,
        excludeBookingId: id,
        serviceId: existing.serviceId,
        maxParticipants,
      });
    }

    let notes = data.notes !== undefined ? data.notes : existing.notes;
    if (
      data.startTime &&
      new Date(data.startTime).getTime() !== new Date(existing.startTime).getTime()
    ) {
      const auditMsg = `[Rescheduled from ${new Date(existing.startTime).toLocaleString()} to ${new Date(data.startTime).toLocaleString()}]`;
      notes = notes ? `${notes}\n${auditMsg}` : auditMsg;
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        ...data,
        notes,
      },
      include: BOOKING_INCLUDES,
    });
  }
}
