import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScanPassDto } from '../../dtos/event.dto';
import * as crypto from 'crypto';

/**
 * Permanent AyurPass Wellness Pass.
 *
 * Product model:
 * - One pass per seeker (Consumer), lifelong serial AP-XXXXXXX
 * - Every booking & event ticket is *associated* with the pass
 * - QR payload encodes pass serial + optional entitlement token
 * - Providers scan at appointment desk or event door
 * - Apple Wallet / Google Wallet: pass.json / save URL when certs configured;
 *   always works as in-app digital pass with QR
 */
@Injectable()
export class WellnessPassService {
  constructor(private prisma: PrismaService) {}

  async ensureForConsumer(userId: string) {
    let consumer = await this.prisma.consumer.findUnique({
      where: { userId },
      include: { user: { select: { fullName: true, email: true } }, wellnessPass: true },
    });
    if (!consumer) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      consumer = await this.prisma.consumer.create({
        data: {
          userId,
          preferences: {},
          prakritiScores: {},
        },
        include: {
          user: { select: { fullName: true, email: true } },
          wellnessPass: true,
        },
      });
    }
    if (consumer.wellnessPass) {
      if (!consumer.wellnessPass.holderName && consumer.user?.fullName) {
        return this.prisma.wellnessPass.update({
          where: { id: consumer.wellnessPass.id },
          data: { holderName: consumer.user.fullName },
        });
      }
      return consumer.wellnessPass;
    }
    return this.prisma.wellnessPass.create({
      data: {
        consumerId: userId,
        holderName: consumer.user?.fullName || null,
      },
    });
  }

  async getMyPass(userId: string) {
    const pass = await this.ensureForConsumer(userId);
    const now = new Date();
    const [bookings, tickets] = await Promise.all([
      this.prisma.booking.findMany({
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
      }),
      this.prisma.eventTicket.findMany({
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
      }),
    ]);

    // Attach any bookings missing pass link
    await this.prisma.booking.updateMany({
      where: { consumerId: userId, wellnessPassId: null },
      data: { wellnessPassId: pass.id },
    });

    const qrPayload = this.buildPassPayload(pass.serialNumber, pass.publicToken);

    return {
      ...pass,
      qrPayload,
      wallet: this.buildWalletDescriptors(pass, bookings, tickets),
      entitlements: {
        upcomingBookings: bookings,
        upcomingTickets: tickets,
      },
    };
  }

  buildPassPayload(serialNumber: string, publicToken: string, entitlement?: string) {
    // AYPASS:serial:token[:entitlement]
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
    // Bare check-in token (12+ hex/alnum)
    if (/^[A-Z0-9]{8,16}$/i.test(s)) {
      return { kind: 'unknown', entitlement: s.toUpperCase(), raw: s };
    }
    return { kind: 'unknown', raw: s };
  }

  private buildWalletDescriptors(
    pass: { id: string; serialNumber: string; publicToken: string; holderName: string | null },
    bookings: { id: string; startTime: Date; service: { name: string } | null; provider: { businessName: string } | null; checkInToken: string | null }[],
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

    // Apple Wallet pass.json skeleton (signed .pkpass when certs present)
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
          {
            key: 'serial',
            label: 'PASS ID',
            value: pass.serialNumber,
          },
          {
            key: 'next',
            label: 'UPCOMING',
            value: secondary.slice(0, 48),
          },
        ],
        backFields: [
          {
            key: 'info',
            label: 'About',
            value:
              'This is your permanent AyurPass. Appointments and event tickets are linked automatically. Present this pass at the venue for check-in.',
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

    // Google Wallet generic pass object skeleton
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
      textModulesData: [
        { id: 'upcoming', header: 'Upcoming', body: secondary },
      ],
    };

    const googleSaveUrl =
      process.env.GOOGLE_WALLET_SAVE_ENABLED === 'true' && process.env.GOOGLE_WALLET_ISSUER_ID
        ? null // real JWT URL issued when service account configured
        : null;

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
        saveUrl: googleSaveUrl,
        note: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT
          ? 'Save to Google Wallet available'
          : 'Object ready — configure GOOGLE_WALLET_SERVICE_ACCOUNT for Save button',
      },
    };
  }

  /**
   * Provider scans a QR at the door / appointment desk.
   * Accepts full AYPASS payload, pass serial, or entitlement check-in token.
   */
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

    // Resolve pass
    let pass =
      parsed.serial
        ? await this.prisma.wellnessPass.findFirst({
            where: {
              OR: [
                { serialNumber: parsed.serial },
                { publicToken: parsed.token },
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

    // Entitlement: ticket token
    const token = parsed.entitlement || (parsed.kind === 'unknown' ? parsed.raw.toUpperCase() : null);
    if (token) {
      const ticket = await this.prisma.eventTicket.findFirst({
        where: { checkInToken: token },
        include: {
          event: true,
          consumer: {
            include: { user: { select: { id: true, fullName: true, email: true } } },
          },
          wellnessPass: true,
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
            wellnessPass: true,
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

    // Pure pass scan (identify holder + list today's entitlements at this venue)
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

    if (result === 'invalid' && !pass) {
      throw new BadRequestException('Unrecognised pass or ticket. Ask the guest to open AyurPass.');
    }

    return {
      result,
      targetKind,
      targetId,
      wellnessPassId,
      ...detail,
    };
  }

  /** Link a new booking to the permanent pass (called from bookings create). */
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

  /** Deterministic entitlement QR for a ticket or booking. */
  entitlementPayload(passSerial: string, passToken: string, checkInToken: string) {
    return this.buildPassPayload(passSerial, passToken, checkInToken);
  }

  hashForLog(value: string) {
    return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
  }
}
