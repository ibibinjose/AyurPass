import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { GiftCardsService } from '../gift-cards/gift-cards.service';

export interface RedemptionInput {
  giftCardCode?: string;
  redeemPoints?: number;
}

interface Settlement {
  total: number;
  giftCardApplied: number;
  pointsRedeemed: number;
  pointsValue: number;
  cardCharge: number;
  pointsEarned: number;
}

/**
 * Stripe Connect placeholder for the card charge, plus REAL loyalty + gift-card
 * settlement (internal ledgers, no external service).
 *
 * The real Stripe integration (when STRIPE_SECRET_KEY is a live key) replaces the
 * mock PaymentIntent block with:
 *   stripe.paymentIntents.create({ amount: cardCharge * 100, currency: 'usd',
 *     application_fee_amount: platformCommission * 100,
 *     transfer_data: { destination: provider.stripeAccountId } })
 * The loyalty/gift-card settlement around it stays exactly as written.
 */
@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private loyalty: LoyaltyService,
    private giftCards: GiftCardsService,
  ) {}

  get mockMode(): boolean {
    const key = process.env.STRIPE_SECRET_KEY ?? '';
    return !key || key.endsWith('...');
  }

  /**
   * Applies a gift card then points against the total, charges the remainder to
   * the card (mock), and awards loyalty points on the cash-paid portion. Each
   * redemption is an atomic guarded decrement, so nothing can be double-spent.
   */
  private async settle(
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
    const pointsEarned = await this.loyalty.award(consumerId, cardCharge, `Earned · ${reason}`);

    return { total, giftCardApplied, pointsRedeemed, pointsValue, cardCharge, pointsEarned };
  }

  async checkout(bookingId: string, redemption: RedemptionInput = {}) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay for a cancelled booking');
    }
    if (booking.paymentStatus === 'paid') {
      throw new BadRequestException('Booking is already paid');
    }

    const settlement = await this.settle(
      booking.consumerId,
      Number(booking.totalAmount ?? 0),
      redemption,
      `Booking ${booking.id.slice(0, 8)}`,
    );

    // --- MOCK: instant success. Real mode charges settlement.cardCharge.
    const paymentIntentId = `pi_test_${randomUUID().replace(/-/g, '').slice(0, 24)}`;

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

  async refund(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.paymentStatus !== 'paid') {
      throw new BadRequestException('Only paid bookings can be refunded');
    }

    // --- MOCK: instant refund. Real mode calls stripe.refunds.create().
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'refunded' },
      include: { service: true, room: true },
    });
  }

  async checkoutOrder(orderId: string, redemption: RedemptionInput = {}) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }
    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Order is already paid');
    }

    const settlement = await this.settle(
      order.consumerId,
      Number(order.subtotal),
      redemption,
      `Order ${order.id.slice(0, 8)}`,
    );

    // --- MOCK: instant success (same Stripe PaymentIntent flow as bookings).
    const paymentIntentId = `pi_test_${randomUUID().replace(/-/g, '').slice(0, 24)}`;

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

  async refundOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus !== 'paid') {
      throw new BadRequestException('Only paid orders can be refunded');
    }

    // --- MOCK: instant refund.
    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'refunded', status: 'REFUNDED' },
      include: { items: { include: { product: true } } },
    });
  }
}
