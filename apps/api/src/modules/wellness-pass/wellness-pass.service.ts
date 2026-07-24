import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScanPassDto } from '../../dtos/event.dto';
import * as crypto from 'crypto';

/**
 * Permanent AyurPass Wellness Pass.
 * One pass per seeker; bookings & event tickets attach for venue scan.
 */
@Injectable()
export class WellnessPassService {
  private readonly logger = new Logger(WellnessPassService.name);

  constructor(private prisma: PrismaService) {}

  async ensureForConsumer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // Ensure Consumer row exists (seekers; also providers who attend events)
    let consumer = await this.prisma.consumer.findUnique({ where: { userId } });
    if (!consumer) {
      consumer = await this.prisma.consumer.create({
        data: {
          userId,
          preferences: {},
          prakritiScores: {},
        },
      });
    }

    const existing = await this.prisma.wellnessPass.findUnique({
      where: { consumerId: userId },
    });
    if (existing) {
      if (!existing.holderName && user.fullName) {
        return this.prisma.wellnessPass.update({
          where: { id: existing.id },
          data: { holderName: user.fullName },
        });
      }
      return existing;
    }

    try {
      return await this.prisma.wellnessPass.create({
        data: {
          consumerId: userId,
          holderName: user.fullName || null,
        },
      });
    } catch (err) {
      // Race: another request created the pass
      const again = await this.prisma.wellnessPass.findUnique({
        where: { consumerId: userId },
      });
      if (again) return again;
      this.logger.error('Failed to create WellnessPass', err);
      throw err;
    }
  }

  async getMyPass(userId: string) {
    const pass = await this.ensureForConsumer(userId);
    const now = new Date();

    let bookings: Awaited<ReturnType<typeof this.loadBookings>> = [];
    let tickets: Awaited<ReturnType<typeof this.loadTickets>> = [];

    try {
      bookings = await this.loadBookings(userId, now);
    } catch (err) {
      this.logger.warn(`Bookings load for pass failed: ${String(err)}`);
    }
    try {
      tickets = await this.loadTickets(userId, now);
    } catch (err) {
      this.logger.warn(`Tickets load for pass failed: ${String(err)}`);
    }

    // Best-effort: attach unlinked bookings to this pass
    try {
      await this.prisma.booking.updateMany({
        where: { consumerId: userId, wellnessPassId: null },
        data: { wellnessPassId: pass.id },
      });
    } catch {
      /* column may be mid-migration on older deploys */
    }

    const qrPayload = this.buildPassPayload(pass.serialNumber, pass.publicToken);

    return {
      id: pass.id,
      consumerId: pass.consumerId,
      serialNumber: pass.serialNumber,
      publicToken: pass.publicToken,
      status: pass.status,
      holderName: pass.holderName,
      createdAt: pass.createdAt,
      updatedAt: pass.updatedAt,
      qrPayload,
      wallet: this.buildWalletDescriptors(pass, bookings, tickets),
      entitlements: {
        upcomingBookings: bookings,
        upcomingTickets: tickets,
      },
    };
  }

  private loadBookings(userId: string, now: Date) {
    return this.prisma.booking.findMany({
      where: {
        consumerId: userId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        endTime: { gte: now },
      },
      include: {
        service: { select: { id: true, name: true, category: true } },
        provider: { select: { id: true, businessName: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 20,
    });
  }

  private loadTickets(userId: string, now: Date) {
    return this.prisma.eventTicket.findMany({
      where: {
        consumerId: userId,
        status: { in: ['CONFIRMED', 'PENDING', 'WAITLISTED'] },
        event: { endTime: { gte: now } },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            startTime: true,
            endTime: true,
            venueName: true,
            slug: true,
            provider: { select: { id: true, businessName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  buildPassPayload(serialNumber: string, publicToken: string, entitlement?: string) {
    const base = `AYPASS:${serialNumber}:${publicToken}`;
    return entitlement ? `${base}:${entitlement}` : base;
  }

  parsePayload(raw: string): {
    kind: 'pass' | 'ticket' | 'booking' | 'unknown';
    serial?: string;
    token?: string;
    entitlement?: string;
    raw: string;
  } {
    const s = raw.trim();
    if (s.startsWith('AYPASS:')) {
      const parts = s.split(':');
      return {
        kind: 'pass',
        serial: parts[1],
        token: parts[2],
        entitlement: parts[3],
        raw: s,
      };
    }
    if (/^[A-Z0-9]{8,16}$/i.test(s)) {
      return { kind: 'unknown', entitlement: s.toUpperCase(), raw: s };
    }
    return { kind: 'unknown', raw: s };
  }

  private buildWalletDescriptors(
    pass: { id: string; serialNumber: string; publicToken: string; holderName: string | null },
    bookings: {
      id: string;
      startTime: Date;
      service: { name: string } | null;
      provider: { businessName: string } | null;
    }[],
    tickets: {
      id: string;
      checkInToken: string;
      event: { title: string; startTime: Date; venueName: string | null } | null;
    }[],
  ) {
    const qrPayload = this.buildPassPayload(pass.serialNumber, pass.publicToken);
    const nextBooking = bookings[0];
    const nextTicket = tickets[0];
    const secondary =
      nextTicket?.event
        ? `Event: ${nextTicket.event.title}`
        : nextBooking?.service
          ? `Next: ${nextBooking.service.name}`
          : 'Your permanent AyurPass';

    const applePassJson = {
      formatVersion: 1,
      passTypeIdentifier:
        process.env.APPLE_PASS_TYPE_ID || 'pass.com.ayurpass.wellness',
      serialNumber: pass.serialNumber,
      teamIdentifier: process.env.APPLE_TEAM_ID || 'XXXXXXXXXX',
      organizationName: 'AyurPass',
      description: 'AyurPass Wellness Pass',
      logoText: 'AyurPass',
      foregroundColor: 'rgb(255, 253, 249)',
      backgroundColor: 'rgb(30, 50, 40)',
      labelColor: 'rgb(233, 217, 184)',
      barcode: {
        format: 'PKBarcodeFormatQR',
        message: qrPayload,
        messageEncoding: 'iso-8859-1',
        altText: pass.serialNumber,
      },
      generic: {
        primaryFields: [
          {
            key: 'member',
            label: 'WELLNESS MEMBER',
            value: pass.holderName || 'Seeker',
          },
        ],
        secondaryFields: [
          { key: 'serial', label: 'PASS ID', value: pass.serialNumber },
          { key: 'next', label: 'UPCOMING', value: secondary.slice(0, 48) },
        ],
        backFields: [
          {
            key: 'info',
            label: 'About',
            value:
              'Permanent AyurPass. Appointments and event tickets are linked automatically. Present this pass at the venue for check-in.',
          },
          {
            key: 'bookings',
            label: 'Linked appointments',
            value:
              bookings
                .slice(0, 5)
                .map(
                  (b) =>
                    `${b.service?.name ?? 'Session'} · ${new Date(b.startTime).toLocaleString()}`,
                )
                .join('\n') || 'None upcoming',
          },
          {
            key: 'events',
            label: 'Event tickets',
            value:
              tickets
                .slice(0, 5)
                .map(
                  (t) =>
                    `${t.event?.title ?? 'Event'} · ${t.event ? new Date(t.event.startTime).toLocaleString() : ''}`,
                )
                .join('\n') || 'None upcoming',
          },
        ],
      },
    };

    const googleObject = {
      id: `${process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000000000000'}.${pass.serialNumber}`,
      classId: `${process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000000000000'}.ayurpass_wellness`,
      state: 'ACTIVE',
      cardTitle: { defaultValue: { language: 'en', value: 'AyurPass' } },
      header: {
        defaultValue: {
          language: 'en',
          value: pass.holderName || 'Wellness Pass',
        },
      },
      subheader: {
        defaultValue: { language: 'en', value: pass.serialNumber },
      },
      barcode: {
        type: 'QR_CODE',
        value: qrPayload,
        alternateText: pass.serialNumber,
      },
      hexBackgroundColor: '#1e3228',
      textModulesData: [{ id: 'upcoming', header: 'Upcoming', body: secondary }],
    };

    return {
      qrPayload,
      apple: {
        available: Boolean(process.env.APPLE_PASS_SIGNER_CERT),
        passJson: applePassJson,
        downloadPath: `/wellness-pass/wallet/apple`,
        note: process.env.APPLE_PASS_SIGNER_CERT
          ? 'Signed .pkpass available'
          : 'Pass payload ready — configure APPLE_PASS_SIGNER_CERT for device install',
      },
      google: {
        available: Boolean(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT),
        object: googleObject,
        saveUrl: null as string | null,
        note: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT
          ? 'Save to Google Wallet available'
          : 'Object ready — configure GOOGLE_WALLET_SERVICE_ACCOUNT for Save button',
      },
    };
  }

  async scan(scannerUserId: string, dto: ScanPassDto) {
    const provider = await this.prisma.user.findUnique({
      where: { id: scannerUserId },
      include: {
        provider: true,
        staffMemberships: { where: { inviteStatus: 'ACCEPTED' }, take: 5 },
      },
    });
    if (!provider) throw new NotFoundException('User not found');
    const providerId =
      provider.provider?.id || provider.staffMemberships[0]?.providerId;
    if (!providerId) {
      throw new ForbiddenException('Only practice staff can scan passes.');
    }

    const parsed = this.parsePayload(dto.payload);
    let wellnessPassId: string | null = null;
    let result = 'invalid';
    let targetKind = 'pass';
    let targetId: string | null = null;
    let detail: Record<string, unknown> = {};

    let pass =
      parsed.serial
        ? await this.prisma.wellnessPass.findFirst({
            where: {
              OR: [
                { serialNumber: parsed.serial },
                ...(parsed.token ? [{ publicToken: parsed.token }] : []),
              ],
            },
            include: {
              consumer: {
                include: { user: { select: { id: true, fullName: true, email: true } } },
              },
            },
          })
        : null;

    if (!pass && parsed.token) {
      pass = await this.prisma.wellnessPass.findFirst({
        where: { publicToken: parsed.token },
        include: {
          consumer: {
            include: { user: { select: { id: true, fullName: true, email: true } } },
          },
        },
      });
    }

    const token =
      parsed.entitlement ||
      (parsed.kind === 'unknown' && /^[A-Z0-9]{8,16}$/i.test(parsed.raw)
        ? parsed.raw.toUpperCase()
        : null);

    if (token) {
      const ticket = await this.prisma.eventTicket.findFirst({
        where: { checkInToken: token },
        include: {
          event: true,
          consumer: {
            include: { user: { select: { id: true, fullName: true, email: true } } },
          },
        },
      });
      if (ticket) {
        targetKind = 'ticket';
        targetId = ticket.id;
        wellnessPassId = ticket.wellnessPassId;
        if (ticket.event.providerId !== providerId) {
          result = 'wrong_venue';
          detail = { message: 'Ticket is for a different practice.' };
        } else if (ticket.status === 'CHECKED_IN') {
          result = 'already_checked_in';
          detail = {
            message: 'Already checked in',
            checkedInAt: ticket.checkedInAt,
            holder: ticket.consumer.user?.fullName,
            event: ticket.event.title,
          };
        } else if (['CANCELLED', 'REFUNDED'].includes(ticket.status)) {
          result = 'invalid';
          detail = { message: 'Ticket cancelled or refunded' };
        } else {
          await this.prisma.eventTicket.update({
            where: { id: ticket.id },
            data: {
              status: 'CHECKED_IN',
              checkedInAt: new Date(),
              checkedInByUserId: scannerUserId,
            },
          });
          result = 'ok';
          detail = {
            message: 'Event check-in successful',
            holder: ticket.consumer.user?.fullName,
            event: ticket.event.title,
            ticketCode: ticket.code,
          };
        }
      } else {
        const booking = await this.prisma.booking.findFirst({
          where: { checkInToken: token },
          include: {
            service: true,
            consumer: {
              include: { user: { select: { id: true, fullName: true, email: true } } },
            },
          },
        });
        if (booking) {
          targetKind = 'booking';
          targetId = booking.id;
          wellnessPassId = booking.wellnessPassId;
          if (booking.providerId !== providerId) {
            result = 'wrong_venue';
            detail = { message: 'Appointment is for a different practice.' };
          } else if (booking.checkedInAt) {
            result = 'already_checked_in';
            detail = {
              message: 'Already checked in',
              checkedInAt: booking.checkedInAt,
              holder: booking.consumer.user?.fullName,
              service: booking.service.name,
            };
          } else if (['CANCELLED', 'NO_SHOW'].includes(booking.status)) {
            result = 'invalid';
            detail = { message: 'Booking cancelled or no-show' };
          } else {
            await this.prisma.booking.update({
              where: { id: booking.id },
              data: {
                checkedInAt: new Date(),
                checkedInByUserId: scannerUserId,
                status:
                  booking.status === 'PENDING' || booking.status === 'CONFIRMED'
                    ? 'IN_PROGRESS'
                    : booking.status,
                wellnessPassId: booking.wellnessPassId || pass?.id || undefined,
              },
            });
            result = 'ok';
            detail = {
              message: 'Appointment check-in successful',
              holder: booking.consumer.user?.fullName,
              service: booking.service.name,
              startTime: booking.startTime,
            };
          }
        }
      }
    }

    if (result === 'invalid' && pass) {
      wellnessPassId = pass.id;
      targetKind = 'pass';
      targetId = pass.id;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const [todayBookings, todayTickets] = await Promise.all([
        this.prisma.booking.findMany({
          where: {
            consumerId: pass.consumerId,
            providerId,
            startTime: { lte: end },
            endTime: { gte: start },
            status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
          },
          include: { service: { select: { name: true, category: true } } },
        }),
        this.prisma.eventTicket.findMany({
          where: {
            consumerId: pass.consumerId,
            status: { in: ['CONFIRMED', 'PENDING', 'CHECKED_IN'] },
            event: {
              providerId,
              startTime: { lte: end },
              endTime: { gte: start },
            },
          },
          include: { event: { select: { title: true, startTime: true } } },
        }),
      ]);

      result = 'ok';
      detail = {
        message: 'Wellness Pass verified',
        holder: pass.consumer.user?.fullName || pass.holderName,
        serialNumber: pass.serialNumber,
        todayBookings,
        todayTickets,
      };
    }

    try {
      await this.prisma.passScanLog.create({
        data: {
          wellnessPassId,
          providerId,
          scannedByUserId: scannerUserId,
          targetKind,
          targetId,
          result,
          rawPayload: dto.payload.slice(0, 500),
        },
      });
    } catch {
      /* audit best-effort */
    }

    if (result === 'invalid' && !pass) {
      throw new BadRequestException(
        'Unrecognised pass or ticket. Ask the guest to open AyurPass.',
      );
    }

    return {
      result,
      targetKind,
      targetId,
      wellnessPassId,
      ...detail,
    };
  }

  async attachBooking(userId: string, bookingId: string) {
    const pass = await this.ensureForConsumer(userId);
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { wellnessPassId: pass.id },
    });
  }

  walletApplePayload(userId: string) {
    return this.getMyPass(userId).then((p) => p.wallet.apple);
  }

  walletGooglePayload(userId: string) {
    return this.getMyPass(userId).then((p) => p.wallet.google);
  }

  hashForLog(value: string) {
    return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
  }
}
