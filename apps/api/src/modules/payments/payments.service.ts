import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';
import type Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { calculateTaxForCountry } from './tax.utility';
import { StripeService } from './stripe.service';
import { PaymentSettlementService } from './payment-settlement.service';
import { StripeConnectService } from './stripe-connect.service';
import type { PaymentIntentPayload, RedemptionInput, Settlement } from './payment.types';

export type { RedemptionInput, PaymentIntentPayload } from './payment.types';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private loyalty: LoyaltyService,
    private stripe: StripeService,
    private settlement: PaymentSettlementService,
    private connect: StripeConnectService,
  ) {}

  get mockMode(): boolean {
    return this.settlement.mockMode;
  }

  async checkout(bookingId: string, redemption: RedemptionInput = {}) {
    let booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay for a cancelled booking');
    }
    if (booking.paymentStatus === 'paid') {
      throw new BadRequestException('Booking is already paid');
    }

    // Dynamic tax calculation fallback for legacy/existing bookings
    if (booking.taxAmount === null || booking.taxAmount === undefined) {
      const address = booking.provider?.address as Record<string, any> | null;
      const country = address?.country;
      const currentTotal = Number(booking.totalAmount ?? 0);
      const tax = calculateTaxForCountry(country, currentTotal);
      
      const finalTotalAmount = tax.inclusive ? currentTotal : currentTotal + tax.amount;
      const platformCommission = Math.round(currentTotal * 0.18 * 100) / 100;

      booking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          totalAmount: finalTotalAmount,
          taxAmount: tax.amount,
          taxRate: tax.rate,
          taxName: tax.name,
          taxExclusive: !tax.inclusive,
          platformCommission,
          providerPayout: Math.round((finalTotalAmount - platformCommission) * 100) / 100,
        },
        include: { provider: true },
      });
    }

    const settled = await this.settlement.settle(
      booking.consumerId,
      Number(booking.totalAmount ?? 0),
      redemption,
      `Booking ${booking.id.slice(0, 8)}`,
    );

    if (settled.cardCharge === 0) {
      const updated = await this.settlement.markBookingPaid(
        bookingId,
        settled,
        this.settlement.freePaymentIntentId(),
      );
      return { ...updated, payment: { mock: true } satisfies PaymentIntentPayload };
    }

    if (this.mockMode) {
      // Dev-only: refuse mock auto-pay in production / strict mode.
      this.settlement.assertMockPaymentsAllowed();
      const updated = await this.settlement.markBookingPaid(
        bookingId,
        settled,
        this.settlement.mockPaymentIntentId(),
      );
      return { ...updated, payment: { mock: true } satisfies PaymentIntentPayload };
    }

    if (!booking.provider?.stripeAccountId) {
      throw new BadRequestException(
        'This practice has not finished payment setup yet. Card checkout is unavailable — pay at the venue or contact them to complete Stripe onboarding. (In local dev, run payments in mock mode without live Stripe keys.)',
      );
    }

    const payment = await this.settlement.createStripeCharge({
      cardCharge: settled.cardCharge,
      currency: 'aud',
      stripeAccountId: booking.provider.stripeAccountId,
      platformCommission: Number(booking.platformCommission ?? 0),
      metadata: { bookingId, type: 'booking' },
    });

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentIntentId: payment.paymentIntentId,
        giftCardRedeemed: settled.giftCardApplied,
        pointsRedeemed: settled.pointsRedeemed,
      },
    });

    const updated = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true, room: true },
    });

    return { ...updated, payment };
  }

  async confirmBookingPayment(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.paymentStatus === 'paid') {
      return this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: true, room: true },
      });
    }
    if (!booking.paymentIntentId || this.mockMode) {
      throw new BadRequestException('No pending Stripe payment for this booking');
    }

    const intent = await this.stripe.retrievePaymentIntent(booking.paymentIntentId);
    if (intent.status !== 'succeeded') {
      throw new BadRequestException(`Payment not completed (status: ${intent.status})`);
    }

    const settled: Settlement = {
      total: Number(booking.totalAmount ?? 0),
      giftCardApplied: Number(booking.giftCardRedeemed ?? 0),
      pointsRedeemed: Number(booking.pointsRedeemed ?? 0),
      pointsValue: 0,
      cardCharge: intent.amount_received / 100,
      pointsEarned: Number(booking.pointsEarned ?? 0),
    };

    if (!booking.pointsEarned) {
      settled.pointsEarned = await this.loyalty.award(
        booking.consumerId,
        settled.cardCharge,
        `Earned · Booking ${booking.id.slice(0, 8)}`,
      );
    }

    return this.settlement.markBookingPaid(bookingId, settled, booking.paymentIntentId);
  }

  async refund(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.paymentStatus !== 'paid') {
      throw new BadRequestException('Only paid bookings can be refunded');
    }

    if (!this.mockMode && booking.paymentIntentId && !booking.paymentIntentId.startsWith('pi_free_')) {
      await this.stripe.refundPaymentIntent(
        booking.paymentIntentId,
        `refund_booking_${bookingId}`,
      );
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'refunded' },
      include: { service: true, room: true },
    });
  }

  async checkoutOrder(orderId: string, redemption: RedemptionInput = {}) {
    let order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { provider: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }
    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Order is already paid');
    }

    // Dynamic tax calculation fallback for legacy/existing orders
    if (order.taxAmount === null || order.taxAmount === undefined) {
      const address = order.provider?.address as Record<string, any> | null;
      const country = address?.country;
      const currentSubtotal = Number(order.subtotal);
      const tax = calculateTaxForCountry(country, currentSubtotal);
      
      const finalSubtotal = tax.inclusive ? currentSubtotal : currentSubtotal + tax.amount;
      const platformCommission = Math.round(currentSubtotal * 0.12 * 100) / 100;

      order = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          subtotal: finalSubtotal,
          taxAmount: tax.amount,
          taxRate: tax.rate,
          taxName: tax.name,
          taxExclusive: !tax.inclusive,
          platformCommission,
          providerPayout: Math.round((finalSubtotal - platformCommission) * 100) / 100,
        },
        include: { provider: true },
      });
    }

    const settled = await this.settlement.settle(
      order.consumerId,
      Number(order.subtotal),
      redemption,
      `Order ${order.id.slice(0, 8)}`,
    );

    if (settled.cardCharge === 0) {
      const updated = await this.settlement.markOrderPaid(
        orderId,
        settled,
        this.settlement.freePaymentIntentId(),
      );
      return { ...updated, payment: { mock: true } satisfies PaymentIntentPayload };
    }

    if (this.mockMode) {
      this.settlement.assertMockPaymentsAllowed();
      const updated = await this.settlement.markOrderPaid(
        orderId,
        settled,
        this.settlement.mockPaymentIntentId(),
      );
      return { ...updated, payment: { mock: true } satisfies PaymentIntentPayload };
    }

    if (!order.provider?.stripeAccountId) {
      throw new BadRequestException(
        'This practice has not finished payment setup yet. Card checkout is unavailable — pay at the venue or contact them. (In local dev, use mock payments without live Stripe keys.)',
      );
    }

    const platformCommission = Math.round(Number(order.subtotal) * 0.12 * 100) / 100;
    const payment = await this.settlement.createStripeCharge({
      cardCharge: settled.cardCharge,
      currency: 'aud',
      stripeAccountId: order.provider.stripeAccountId,
      platformCommission,
      metadata: { orderId, type: 'order' },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentIntentId: payment.paymentIntentId,
        giftCardRedeemed: settled.giftCardApplied,
        pointsRedeemed: settled.pointsRedeemed,
      },
    });

    const updated = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    return { ...updated, payment };
  }

  async confirmOrderPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'paid') {
      return this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });
    }
    if (!order.paymentIntentId || this.mockMode) {
      throw new BadRequestException('No pending Stripe payment for this order');
    }

    const intent = await this.stripe.retrievePaymentIntent(order.paymentIntentId);
    if (intent.status !== 'succeeded') {
      throw new BadRequestException(`Payment not completed (status: ${intent.status})`);
    }

    const settled: Settlement = {
      total: Number(order.subtotal),
      giftCardApplied: Number(order.giftCardRedeemed ?? 0),
      pointsRedeemed: Number(order.pointsRedeemed ?? 0),
      pointsValue: 0,
      cardCharge: intent.amount_received / 100,
      pointsEarned: Number(order.pointsEarned ?? 0),
    };

    if (!order.pointsEarned) {
      settled.pointsEarned = await this.loyalty.award(
        order.consumerId,
        settled.cardCharge,
        `Earned · Order ${order.id.slice(0, 8)}`,
      );
    }

    return this.settlement.markOrderPaid(orderId, settled, order.paymentIntentId);
  }

  async refundOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus !== 'paid') {
      throw new BadRequestException('Only paid orders can be refunded');
    }

    if (!this.mockMode && order.paymentIntentId && !order.paymentIntentId.startsWith('pi_free_')) {
      await this.stripe.refundPaymentIntent(
        order.paymentIntentId,
        `refund_order_${orderId}`,
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'refunded', status: 'REFUNDED' },
      include: { items: { include: { product: true } } },
    });
  }

  connectOnboard(providerId: string, returnUrl: string, refreshUrl: string, country?: string) {
    return this.connect.connectOnboard(providerId, returnUrl, refreshUrl, country);
  }

  connectStatus(providerId: string) {
    return this.connect.connectStatus(providerId);
  }

  getPlatformConfig() {
    return this.connect.getPlatformConfig();
  }

  handleWebhookPayload(payload: Buffer, signature: string) {
    const event = this.stripe.constructWebhookEvent(payload, signature);
    return this.handleWebhookEvent(event);
  }

  async handleWebhookEvent(event: Stripe.Event) {
    // Stripe delivers events at-least-once; skip anything we've already handled
    // so side effects (marking paid, awarding loyalty) stay exactly-once.
    const seen = await this.prisma.processedWebhookEvent.findUnique({
      where: { id: event.id },
    });
    if (seen) {
      return { handled: true, duplicate: true, type: event.type };
    }

    const result = await this.processWebhookEvent(event);

    // Only record events we actually acted on. Unhandled event types are left
    // unrecorded so a future handler can still pick them up on redelivery.
    if (result.handled) {
      await this.prisma.processedWebhookEvent.create({
        data: { id: event.id, type: event.type },
      });
    }
    return result;
  }

  private async processWebhookEvent(event: Stripe.Event) {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;
      const orderId = intent.metadata?.orderId;

      if (bookingId) {
        await this.confirmBookingPayment(bookingId);
        return { handled: true, type: event.type, bookingId };
      }
      if (orderId) {
        await this.confirmOrderPayment(orderId);
        return { handled: true, type: event.type, orderId };
      }
      return { handled: false, type: event.type };
    }

    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;
      const provider = await this.prisma.provider.findFirst({
        where: { stripeAccountId: account.id },
        select: { id: true },
      });
      if (provider) {
        const connected = Boolean(account.charges_enabled && account.payouts_enabled);
        await this.connect.syncStripeIntegration(provider.id, account.id, connected);
        return { handled: true, type: event.type, providerId: provider.id, connected };
      }
      return { handled: false, type: event.type };
    }

    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object as Stripe.Dispute;
      const paymentIntentId = this.paymentIntentIdOf(dispute.payment_intent);
      const record = await this.findByPaymentIntent(paymentIntentId);
      if (record?.kind === 'booking') {
        await this.prisma.booking.update({
          where: { id: record.id },
          data: { paymentStatus: 'disputed' },
        });
        return { handled: true, type: event.type, bookingId: record.id };
      }
      if (record?.kind === 'order') {
        await this.prisma.order.update({
          where: { id: record.id },
          data: { paymentStatus: 'disputed' },
        });
        return { handled: true, type: event.type, orderId: record.id };
      }
      return { handled: false, type: event.type };
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = this.paymentIntentIdOf(charge.payment_intent);
      const record = await this.findByPaymentIntent(paymentIntentId);
      // Reflect refunds initiated outside our own refund() path (e.g. from the
      // Stripe Dashboard) back into our records. Skip records we already marked
      // refunded so our own refund flow and this webhook don't fight.
      if (record?.kind === 'booking' && record.paymentStatus !== 'refunded') {
        await this.prisma.booking.update({
          where: { id: record.id },
          data: { paymentStatus: 'refunded' },
        });
        return { handled: true, type: event.type, bookingId: record.id };
      }
      if (record?.kind === 'order' && record.paymentStatus !== 'refunded') {
        await this.prisma.order.update({
          where: { id: record.id },
          data: { paymentStatus: 'refunded', status: 'REFUNDED' },
        });
        return { handled: true, type: event.type, orderId: record.id };
      }
      return { handled: false, type: event.type };
    }

    return { handled: false, type: event.type };
  }

  /** Normalize a Stripe payment_intent reference (string | expanded | null) to its id. */
  private paymentIntentIdOf(
    ref: string | Stripe.PaymentIntent | null | undefined,
  ): string | null {
    if (!ref) return null;
    return typeof ref === 'string' ? ref : ref.id;
  }

  /** Resolve a PaymentIntent id back to the booking or order it paid for. */
  private async findByPaymentIntent(
    paymentIntentId: string | null,
  ): Promise<{ kind: 'booking' | 'order'; id: string; paymentStatus: string } | null> {
    if (!paymentIntentId) return null;

    const booking = await this.prisma.booking.findFirst({
      where: { paymentIntentId },
      select: { id: true, paymentStatus: true },
    });
    if (booking) return { kind: 'booking', id: booking.id, paymentStatus: booking.paymentStatus };

    const order = await this.prisma.order.findFirst({
      where: { paymentIntentId },
      select: { id: true, paymentStatus: true },
    });
    if (order) return { kind: 'order', id: order.id, paymentStatus: order.paymentStatus };

    return null;
  }

  async payCounter(bookingId: string, paymentMethod: PaymentMethod, posTransactionId?: string) {
    let booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.paymentStatus === 'paid') {
      return this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: true, room: true },
      });
    }

    // Dynamic tax calculation fallback for legacy/existing bookings
    if (booking.taxAmount === null || booking.taxAmount === undefined) {
      const address = booking.provider?.address as Record<string, any> | null;
      const country = address?.country;
      const currentTotal = Number(booking.totalAmount ?? 0);
      const tax = calculateTaxForCountry(country, currentTotal);
      
      const finalTotalAmount = tax.inclusive ? currentTotal : currentTotal + tax.amount;
      const platformCommission = Math.round(currentTotal * 0.18 * 100) / 100;

      booking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          totalAmount: finalTotalAmount,
          taxAmount: tax.amount,
          taxRate: tax.rate,
          taxName: tax.name,
          taxExclusive: !tax.inclusive,
          platformCommission,
          providerPayout: Math.round((finalTotalAmount - platformCommission) * 100) / 100,
        },
        include: { provider: true },
      });
    }

    const settled: Settlement = {
      total: Number(booking.totalAmount ?? 0),
      giftCardApplied: Number(booking.giftCardRedeemed ?? 0),
      pointsRedeemed: Number(booking.pointsRedeemed ?? 0),
      pointsValue: 0,
      cardCharge: Number(booking.totalAmount ?? 0) - Number(booking.giftCardRedeemed ?? 0),
      pointsEarned: Number(booking.pointsEarned ?? 0),
    };

    if (!booking.pointsEarned) {
      settled.pointsEarned = await this.loyalty.award(
        booking.consumerId,
        settled.cardCharge,
        `Earned · Counter Booking ${booking.id.slice(0, 8)}`,
      );
    }

    const trxId = posTransactionId || `pos_b_${bookingId.slice(0, 8)}_${Date.now()}`;
    return this.settlement.markBookingPaid(bookingId, settled, trxId, paymentMethod, trxId);
  }

  async payOrderCounter(orderId: string, paymentMethod: PaymentMethod, posTransactionId?: string) {
    let order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { provider: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'paid') {
      return this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });
    }

    // Dynamic tax calculation fallback for legacy/existing orders
    if (order.taxAmount === null || order.taxAmount === undefined) {
      const address = order.provider?.address as Record<string, any> | null;
      const country = address?.country;
      const currentSubtotal = Number(order.subtotal);
      const tax = calculateTaxForCountry(country, currentSubtotal);
      
      const finalSubtotal = tax.inclusive ? currentSubtotal : currentSubtotal + tax.amount;
      const platformCommission = Math.round(currentSubtotal * 0.12 * 100) / 100;

      order = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          subtotal: finalSubtotal,
          taxAmount: tax.amount,
          taxRate: tax.rate,
          taxName: tax.name,
          taxExclusive: !tax.inclusive,
          platformCommission,
          providerPayout: Math.round((finalSubtotal - platformCommission) * 100) / 100,
        },
        include: { provider: true },
      });
    }

    const settled: Settlement = {
      total: Number(order.subtotal),
      giftCardApplied: Number(order.giftCardRedeemed ?? 0),
      pointsRedeemed: Number(order.pointsRedeemed ?? 0),
      pointsValue: 0,
      cardCharge: Number(order.subtotal) - Number(order.giftCardRedeemed ?? 0),
      pointsEarned: Number(order.pointsEarned ?? 0),
    };

    if (!order.pointsEarned) {
      settled.pointsEarned = await this.loyalty.award(
        order.consumerId,
        settled.cardCharge,
        `Earned · Counter Order ${order.id.slice(0, 8)}`,
      );
    }

    const trxId = posTransactionId || `pos_o_${orderId.slice(0, 8)}_${Date.now()}`;
    return this.settlement.markOrderPaid(orderId, settled, trxId, paymentMethod, trxId);
  }
}