import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from '../../dtos/booking.dto';

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

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(data: CreateBookingDto) {
    let totalAmount = data.totalAmount;
    if (totalAmount === undefined) {
      const service = await this.prisma.service.findUnique({
        where: { id: data.serviceId },
        select: { price: true },
      });
      totalAmount = service ? Number(service.price) : 0;
    }
    const platformCommission =
      Math.round(totalAmount * PLATFORM_COMMISSION_RATE * 100) / 100;

    const booking = await this.prisma.booking.create({
      data: {
        ...data,
        totalAmount,
        platformCommission,
        providerPayout: Math.round((totalAmount - platformCommission) * 100) / 100,
      },
      include: BOOKING_INCLUDES,
    });

    await this.grantBookingHealthConsents(booking);

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

    // Grant (or refresh) scoped health permissions for the booked provider / practitioner.
    // Re-using existing active grants avoids duplicate rows when a client re-books.
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

  async findByProvider(providerId: string) {
    return this.prisma.booking.findMany({
      where: { providerId },
      include: {
        ...BOOKING_INCLUDES,
        consumer: {
          select: {
            userId: true,
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDES,
    });
  }

  async updateBooking(id: string, data: UpdateBookingDto) {
    return this.prisma.booking.update({
      where: { id },
      data,
      include: BOOKING_INCLUDES,
    });
  }
}
