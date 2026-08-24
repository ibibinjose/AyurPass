import { Injectable, Logger } from '@nestjs/common';
import {
  CommunicationKind,
  CommunicationStatus,
  ReceiptType,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import type { BookingCommunicationSnapshot, CommunicationPayload, ReceiptSnapshot } from './communications.types';

const MAX_DELIVERY_ATTEMPTS = 5;
const DISPATCH_BATCH_SIZE = 50;

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: currency || 'AUD' }).format(amount);

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async queueBookingCreated(bookingId: string): Promise<void> {
    const snapshot = await this.bookingSnapshot(bookingId);
    if (!snapshot) return;

    await this.queue({
      idempotencyKey: `booking-confirmation:${bookingId}`,
      kind: CommunicationKind.BOOKING_CONFIRMATION,
      recipientEmail: snapshot.consumerEmail,
      recipientName: snapshot.consumerName,
      providerId: snapshot.providerId,
      bookingId,
      subject: `Booking confirmed · ${snapshot.serviceName}`,
      payload: snapshot,
    });

    for (const recipient of await this.providerRecipients(snapshot.providerId)) {
      await this.queue({
        idempotencyKey: `provider-new-booking:${bookingId}:${recipient.email}`,
        kind: CommunicationKind.PROVIDER_NEW_BOOKING,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        providerId: snapshot.providerId,
        bookingId,
        subject: `New booking · ${snapshot.serviceName}`,
        payload: snapshot,
      });
    }

    const startTime = new Date(snapshot.startTime);
    await this.queueReminder(snapshot, CommunicationKind.BOOKING_REMINDER_24H, new Date(startTime.getTime() - 24 * 60 * 60 * 1000));
    await this.queueReminder(snapshot, CommunicationKind.BOOKING_REMINDER_2H, new Date(startTime.getTime() - 2 * 60 * 60 * 1000));
  }

  async queueBookingPaymentReceipt(bookingId: string): Promise<void> {
    const snapshot = await this.bookingSnapshot(bookingId);
    if (!snapshot || snapshot.paymentStatus !== 'paid') return;

    const receipt = await this.findOrCreateBookingReceipt(snapshot, ReceiptType.PAYMENT);
    const receiptSnapshot = receipt.snapshot as unknown as ReceiptSnapshot;
    await this.queue({
      idempotencyKey: `payment-receipt:${receipt.id}`,
      kind: CommunicationKind.PAYMENT_RECEIPT,
      recipientEmail: receipt.recipientEmail,
      recipientName: receipt.recipientName,
      providerId: receipt.providerId,
      bookingId,
      receiptId: receipt.id,
      subject: `Payment receipt ${receipt.number}`,
      payload: receiptSnapshot,
    });

    for (const recipient of await this.providerRecipients(snapshot.providerId)) {
      await this.queue({
        idempotencyKey: `provider-payment:${bookingId}:${recipient.email}`,
        kind: CommunicationKind.PROVIDER_PAYMENT_RECEIVED,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        providerId: snapshot.providerId,
        bookingId,
        receiptId: receipt.id,
        subject: `Payment received · ${snapshot.serviceName}`,
        payload: receiptSnapshot,
      });
    }
  }

  async queueBookingRefundReceipt(bookingId: string): Promise<void> {
    const snapshot = await this.bookingSnapshot(bookingId);
    if (!snapshot || snapshot.paymentStatus !== 'refunded') return;

    const receipt = await this.findOrCreateBookingReceipt(snapshot, ReceiptType.REFUND);
    await this.queue({
      idempotencyKey: `refund-receipt:${receipt.id}`,
      kind: CommunicationKind.PAYMENT_REFUND,
      recipientEmail: receipt.recipientEmail,
      recipientName: receipt.recipientName,
      providerId: receipt.providerId,
      bookingId,
      receiptId: receipt.id,
      subject: `Refund receipt ${receipt.number}`,
      payload: receipt.snapshot as unknown as ReceiptSnapshot,
    });
  }

  async queueProviderEnquiry(enquiryId: string): Promise<void> {
    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: { provider: true },
    });
    if (!enquiry) return;

    const payload: CommunicationPayload = {
      enquiryId: enquiry.id,
      providerName: enquiry.provider.businessName,
      customerName: enquiry.name,
      customerEmail: enquiry.email,
      customerPhone: enquiry.phone,
      message: enquiry.message,
      createdAt: enquiry.createdAt.toISOString(),
    };
    for (const recipient of await this.providerRecipients(enquiry.providerId)) {
      await this.queue({
        idempotencyKey: `provider-enquiry:${enquiry.id}:${recipient.email}`,
        kind: CommunicationKind.PROVIDER_NEW_ENQUIRY,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        providerId: enquiry.providerId,
        subject: `New enquiry from ${enquiry.name}`,
        payload,
      });
    }
  }

  /** Called by the scheduler. Claims rows conditionally so multiple ECS tasks cannot deliver duplicates. */
  async dispatchDue(workerId = `api-${process.pid}`): Promise<{ sent: number; retried: number; failed: number }> {
    const now = new Date();
    const candidates = await this.prisma.communicationDelivery.findMany({
      where: {
        status: CommunicationStatus.PENDING,
        scheduledFor: { lte: now },
      },
      orderBy: { scheduledFor: 'asc' },
      take: DISPATCH_BATCH_SIZE,
    });
    const totals = { sent: 0, retried: 0, failed: 0 };

    for (const candidate of candidates) {
      const claimed = await this.prisma.communicationDelivery.updateMany({
        where: { id: candidate.id, status: CommunicationStatus.PENDING },
        data: {
          status: CommunicationStatus.PROCESSING,
          lockedAt: now,
          lockedBy: workerId,
          attemptCount: { increment: 1 },
        },
      });
      if (claimed.count !== 1) continue;

      if (await this.shouldCancel(candidate.kind, candidate.bookingId)) {
        await this.prisma.communicationDelivery.update({
          where: { id: candidate.id },
          data: {
            status: CommunicationStatus.CANCELLED,
            lockedAt: null,
            lockedBy: null,
            lastError: 'Booking was cancelled before this reminder was due.',
          },
        });
        continue;
      }

      try {
        await this.deliver(candidate.kind, candidate.recipientEmail, candidate.subject, candidate.payload as CommunicationPayload);
        await this.prisma.communicationDelivery.update({
          where: { id: candidate.id },
          data: {
            status: CommunicationStatus.SENT,
            sentAt: new Date(),
            lockedAt: null,
            lockedBy: null,
            lastError: null,
          },
        });
        totals.sent += 1;
      } catch (error) {
        const attempts = candidate.attemptCount + 1;
        const lastError = error instanceof Error ? error.message.slice(0, 1000) : 'Unknown delivery error';
        const exhausted = attempts >= MAX_DELIVERY_ATTEMPTS;
        const retryDelayMinutes = Math.min(60, 2 ** Math.min(attempts, 6));
        await this.prisma.communicationDelivery.update({
          where: { id: candidate.id },
          data: {
            status: exhausted ? CommunicationStatus.FAILED : CommunicationStatus.PENDING,
            scheduledFor: exhausted ? candidate.scheduledFor : new Date(Date.now() + retryDelayMinutes * 60_000),
            lockedAt: null,
            lockedBy: null,
            lastError,
          },
        });
        if (exhausted) totals.failed += 1;
        else totals.retried += 1;
        this.logger.error(`Communication ${candidate.id} delivery failed`, error instanceof Error ? error.stack : undefined);
      }
    }
    return totals;
  }

  private async shouldCancel(kind: CommunicationKind, bookingId: string | null): Promise<boolean> {
    const isReminder =
      kind === CommunicationKind.BOOKING_REMINDER_24H ||
      kind === CommunicationKind.BOOKING_REMINDER_2H;
    if (!isReminder || !bookingId) return false;
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { status: true },
    });
    return !booking || booking.status === 'CANCELLED';
  }

  private async queueReminder(
    snapshot: BookingCommunicationSnapshot,
    kind: 'BOOKING_REMINDER_24H' | 'BOOKING_REMINDER_2H',
    scheduledFor: Date,
  ): Promise<void> {
    if (scheduledFor <= new Date()) return;
    const suffix = kind === CommunicationKind.BOOKING_REMINDER_24H ? '24h' : '2h';
    await this.queue({
      idempotencyKey: `booking-reminder-${suffix}:${snapshot.bookingId}`,
      kind,
      recipientEmail: snapshot.consumerEmail,
      recipientName: snapshot.consumerName,
      providerId: snapshot.providerId,
      bookingId: snapshot.bookingId,
      subject: `Reminder · ${snapshot.serviceName}`,
      payload: snapshot,
      scheduledFor,
    });
  }

  private async queue(input: {
    idempotencyKey: string;
    kind: CommunicationKind;
    recipientEmail: string;
    recipientName?: string | null;
    providerId?: string;
    bookingId?: string;
    orderId?: string;
    receiptId?: string;
    subject: string;
    payload: CommunicationPayload | BookingCommunicationSnapshot | ReceiptSnapshot;
    scheduledFor?: Date;
  }): Promise<void> {
    await this.prisma.communicationDelivery.upsert({
      where: { idempotencyKey: input.idempotencyKey },
      create: {
        idempotencyKey: input.idempotencyKey,
        kind: input.kind,
        recipientEmail: input.recipientEmail,
        recipientName: input.recipientName ?? undefined,
        providerId: input.providerId,
        bookingId: input.bookingId,
        orderId: input.orderId,
        receiptId: input.receiptId,
        subject: input.subject,
        payload: input.payload as Prisma.InputJsonValue,
        scheduledFor: input.scheduledFor ?? new Date(),
      },
      update: {},
    });
  }

  private async bookingSnapshot(bookingId: string): Promise<BookingCommunicationSnapshot | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        consumer: { include: { user: true } },
        provider: true,
        service: true,
      },
    });
    if (!booking) return null;
    return {
      bookingId: booking.id,
      consumerName: booking.consumer.user.fullName || 'there',
      consumerEmail: booking.consumer.user.email,
      providerId: booking.providerId,
      providerName: booking.provider.businessName,
      serviceName: booking.service.name,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      timezone: booking.timezone,
      totalAmount: Number(booking.totalAmount ?? 0),
      currency: booking.provider.currency || booking.service.currency || 'AUD',
      paymentStatus: booking.paymentStatus,
    };
  }

  private async findOrCreateBookingReceipt(snapshot: BookingCommunicationSnapshot, type: ReceiptType) {
    const existing = await this.prisma.receipt.findUnique({
      where: { bookingId_type: { bookingId: snapshot.bookingId, type } },
    });
    if (existing) return existing;

    const booking = await this.prisma.booking.findUnique({ where: { id: snapshot.bookingId } });
    if (!booking) throw new Error(`Booking ${snapshot.bookingId} was not found for receipt issuance`);
    const number = `AP-${new Date().getUTCFullYear()}-${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
    const receiptSnapshot: ReceiptSnapshot = {
      ...snapshot,
      receiptNumber: number,
      receiptType: type,
      taxAmount: Number(booking.taxAmount ?? 0),
      taxName: booking.taxName,
      paymentReference: booking.paymentIntentId || booking.posTransactionId,
    };

    try {
      return await this.prisma.receipt.create({
        data: {
          number,
          type,
          bookingId: booking.id,
          providerId: booking.providerId,
          recipientEmail: snapshot.consumerEmail,
          recipientName: snapshot.consumerName,
          currency: snapshot.currency,
          totalAmount: booking.totalAmount ?? 0,
          taxAmount: booking.taxAmount ?? undefined,
          taxRate: booking.taxRate ?? undefined,
          taxName: booking.taxName ?? undefined,
          paymentIntentId: booking.paymentIntentId ?? booking.posTransactionId ?? undefined,
          snapshot: receiptSnapshot as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      const duplicate = await this.prisma.receipt.findUnique({
        where: { bookingId_type: { bookingId: snapshot.bookingId, type } },
      });
      if (duplicate) return duplicate;
      throw error;
    }
  }

  private async providerRecipients(providerId: string): Promise<Array<{ email: string; name: string | null }>> {
    const [owner, staff] = await Promise.all([
      this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { user: { select: { email: true, fullName: true } } },
      }),
      this.prisma.providerStaff.findMany({
        where: { providerId, role: { in: ['OWNER', 'MANAGER'] }, userId: { not: null } },
        select: { user: { select: { email: true, fullName: true } } },
      }),
    ]);
    const recipients = [owner?.user, ...staff.map((row) => row.user)]
      .filter((user): user is { email: string; fullName: string | null } => Boolean(user?.email));
    return [...new Map(recipients.map((recipient) => [recipient.email.toLowerCase(), {
      email: recipient.email,
      name: recipient.fullName,
    }])).values()];
  }

  private async deliver(kind: CommunicationKind, to: string, subject: string, payload: CommunicationPayload): Promise<void> {
    const html = this.renderHtml(kind, payload);
    const text = this.renderText(kind, payload);
    await this.mail.sendTransactionalEmail({ to, subject, html, text });
  }

  private renderHtml(kind: CommunicationKind, payload: CommunicationPayload): string {
    const title = escapeHtml(this.titleFor(kind));
    const name = escapeHtml(payload.consumerName || payload.customerName || 'there');
    const service = escapeHtml(payload.serviceName);
    const provider = escapeHtml(payload.providerName);
    const time = payload.startTime ? escapeHtml(new Date(String(payload.startTime)).toLocaleString('en-AU')) : '';
    const amount = payload.totalAmount !== undefined ? money(Number(payload.totalAmount), String(payload.currency || 'AUD')) : '';
    let content = '';
    switch (kind) {
      case CommunicationKind.BOOKING_CONFIRMATION:
        content = `<p>Your booking for <strong>${service}</strong> with <strong>${provider}</strong> is confirmed.</p><p><strong>When:</strong> ${time}</p><p><strong>Reference:</strong> ${escapeHtml(payload.bookingId)}</p>`;
        break;
      case CommunicationKind.PROVIDER_NEW_BOOKING:
        content = `<p>A new booking has been created for <strong>${service}</strong>.</p><p><strong>Customer:</strong> ${escapeHtml(payload.consumerName)}<br/><strong>When:</strong> ${time}<br/><strong>Reference:</strong> ${escapeHtml(payload.bookingId)}</p>`;
        break;
      case CommunicationKind.BOOKING_REMINDER_24H:
      case CommunicationKind.BOOKING_REMINDER_2H:
        content = `<p>This is a reminder for your upcoming <strong>${service}</strong> session with <strong>${provider}</strong>.</p><p><strong>When:</strong> ${time}</p>`;
        break;
      case CommunicationKind.PAYMENT_RECEIPT:
      case CommunicationKind.PAYMENT_REFUND:
        content = `<p>Your ${kind === CommunicationKind.PAYMENT_REFUND ? 'refund' : 'payment'} record is ready.</p><p><strong>Receipt:</strong> ${escapeHtml(payload.receiptNumber)}<br/><strong>Service:</strong> ${service}<br/><strong>Provider:</strong> ${provider}<br/><strong>Total:</strong> ${escapeHtml(amount)}<br/><strong>Tax:</strong> ${escapeHtml(payload.taxName || 'Tax')} ${escapeHtml(payload.taxAmount ?? 0)}</p>`;
        break;
      case CommunicationKind.PROVIDER_PAYMENT_RECEIVED:
        content = `<p>Payment has been recorded for <strong>${service}</strong>.</p><p><strong>Customer:</strong> ${escapeHtml(payload.consumerName)}<br/><strong>Total:</strong> ${escapeHtml(amount)}<br/><strong>Receipt:</strong> ${escapeHtml(payload.receiptNumber)}</p>`;
        break;
      case CommunicationKind.PROVIDER_NEW_ENQUIRY:
        content = `<p>You have a new enquiry from <strong>${escapeHtml(payload.customerName)}</strong>.</p><p><strong>Email:</strong> ${escapeHtml(payload.customerEmail)}<br/><strong>Phone:</strong> ${escapeHtml(payload.customerPhone || 'Not provided')}</p><p>${escapeHtml(payload.message)}</p>`;
        break;
      default:
        content = '<p>You have a new AyurPass update.</p>';
    }
    return `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f8f6;font-family:Arial,sans-serif;color:#23362d"><main style="max-width:620px;margin:auto;background:#fff;border:1px solid #e1e8e4;border-radius:16px;padding:32px"><div style="font-weight:700;color:#1b3d2f;font-size:20px">AyurPass</div><h1 style="font-size:24px;color:#1b3d2f">${title}</h1><p>Hello ${name},</p>${content}<hr style="border:0;border-top:1px solid #e1e8e4;margin:28px 0"/><p style="font-size:12px;color:#66776d">This is a transactional AyurPass message about your account or booking.</p></main></body></html>`;
  }

  private renderText(kind: CommunicationKind, payload: CommunicationPayload): string {
    const lines = [this.titleFor(kind), '', `Hello ${payload.consumerName || payload.customerName || 'there'},`];
    if (payload.serviceName) lines.push(`Service: ${payload.serviceName}`);
    if (payload.providerName) lines.push(`Provider: ${payload.providerName}`);
    if (payload.startTime) lines.push(`When: ${new Date(String(payload.startTime)).toLocaleString('en-AU')}`);
    if (payload.receiptNumber) lines.push(`Receipt: ${payload.receiptNumber}`);
    if (payload.totalAmount !== undefined) lines.push(`Total: ${money(Number(payload.totalAmount), String(payload.currency || 'AUD'))}`);
    if (payload.message) lines.push('', String(payload.message));
    return lines.join('\n');
  }

  private titleFor(kind: CommunicationKind): string {
    return {
      [CommunicationKind.BOOKING_CONFIRMATION]: 'Your booking is confirmed',
      [CommunicationKind.PROVIDER_NEW_BOOKING]: 'You have a new booking',
      [CommunicationKind.BOOKING_REMINDER_24H]: 'Your session is tomorrow',
      [CommunicationKind.BOOKING_REMINDER_2H]: 'Your session starts soon',
      [CommunicationKind.PAYMENT_RECEIPT]: 'Your payment receipt',
      [CommunicationKind.PROVIDER_PAYMENT_RECEIVED]: 'Payment received',
      [CommunicationKind.PAYMENT_REFUND]: 'Your refund receipt',
      [CommunicationKind.PROVIDER_NEW_ENQUIRY]: 'You have a new enquiry',
    }[kind];
  }
}
