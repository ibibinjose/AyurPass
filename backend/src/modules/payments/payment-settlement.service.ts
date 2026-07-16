import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { GiftCardsService } from '../gift-cards/gift-cards.service';
import { StripeService } from './stripe.service';
import { isStrictEnv } from '../../common/env';
import type { PaymentIntentPayload, RedemptionInput, Settlement } from './payment.types';

@Injectable()
export class PaymentSettlementService {
  constructor(
    private prisma: PrismaService,
    private loyalty: LoyaltyService,
    private giftCards: GiftCardsService,
    private stripe: StripeService,
  ) {}

  get mockMode(): boolean {
    return !this.stripe.enabled;
  }

  /**
   * Mock auto-pay is for local/dev only. Production (or AYURPASS_STRICT=1) must
   * have real Stripe keys — never mark a booking/order paid without a charge path.
   * Full gift-card/points cover (cardCharge === 0) is still allowed without Stripe.
   */
  assertMockPaymentsAllowed(): void {
    if (this.mockMode && isStrictEnv()) {
      throw new BadRequestException(
        'Card payments are not configured. Set STRIPE_SECRET_KEY before taking live payments.',
      );
    }
  }

  async settle(
    consumerId: string,
    total: number,
    redemption: RedemptionInput,
    reason: string,
  ): Promise<Settlement> {
    let remaining = total;

    let giftCardApplied = 0;
    if (redemption.giftCardCode) {
      giftCardApplied = await this.giftCards.redeem(redemption.giftCardCode, remaining, reason);
      remaining = Math.round((remaining - giftCardApplied) * 100) / 100;
    }

    let pointsRedeemed = 0;
    let pointsValue = 0;
    if (redemption.redeemPoints && redemption.redeemPoints > 0) {
      const r = await this.loyalty.redeem(consumerId, redemption.redeemPoints, remaining, reason);
      pointsRedeemed = r.pointsUsed;
      pointsValue = r.value;
      remaining = Math.round((remaining - pointsValue) * 100) / 100;
    }

    const cardCharge = Math.max(0, Math.round(remaining * 100) / 100);
    const pointsEarned =
      cardCharge > 0 ? await this.loyalty.award(consumerId, cardCharge, `Earned · ${reason}`) : 0;

    return { total, giftCardApplied, pointsRedeemed, pointsValue, cardCharge, pointsEarned };
  }

  async markBookingPaid(bookingId: string, settlement: Settlement, paymentIntentId: string) {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentIntentId,
        paymentStatus: 'paid',
        giftCardRedeemed: settlement.giftCardApplied,
        pointsRedeemed: settlement.pointsRedeemed,
        pointsEarned: settlement.pointsEarned,
      },
      include: { service: true, room: true },
    });
  }

  async markOrderPaid(orderId: string, settlement: Settlement, paymentIntentId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentIntentId,
        paymentStatus: 'paid',
        status: 'PAID',
        giftCardRedeemed: settlement.giftCardApplied,
        pointsRedeemed: settlement.pointsRedeemed,
        pointsEarned: settlement.pointsEarned,
      },
      include: { items: { include: { product: true } } },
    });
  }

  async createStripeCharge(params: {
    cardCharge: number;
    currency: string;
    stripeAccountId: string;
    platformCommission: number;
    metadata: Record<string, string>;
  }): Promise<PaymentIntentPayload> {
    const amountCents = Math.round(params.cardCharge * 100);
    const feeCents = Math.round(params.platformCommission * 100);

    // Derive a stable idempotency key from the booking/order so a double-clicked
    // or retried checkout reuses the same PaymentIntent instead of creating a
    // duplicate. Includes the amount so a legitimately changed total is a new key.
    const ref = params.metadata.bookingId ?? params.metadata.orderId ?? 'unknown';
    const idempotencyKey = `pi_${params.metadata.type ?? 'charge'}_${ref}_${amountCents}`;

    const intent = await this.stripe.createPaymentIntent({
      amountCents,
      currency: params.currency,
      destinationAccountId: params.stripeAccountId,
      applicationFeeCents: feeCents,
      metadata: params.metadata,
      idempotencyKey,
    });

    return {
      mock: false,
      clientSecret: intent.client_secret ?? undefined,
      publishableKey: this.stripe.publishableKey,
      paymentIntentId: intent.id,
    };
  }

  freePaymentIntentId(): string {
    return `pi_free_${randomUUID().slice(0, 12)}`;
  }

  mockPaymentIntentId(): string {
    return `pi_test_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
  }
}