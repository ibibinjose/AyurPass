import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Stripe Connect placeholder.
 *
 * The real integration (when STRIPE_SECRET_KEY is a live/test key) replaces the
 * mock blocks below with the `stripe` SDK:
 *
 *   1. checkout():   stripe.paymentIntents.create({
 *        amount: totalAmount * 100, currency: 'usd',
 *        application_fee_amount: platformCommission * 100,   // marketplace cut
 *        transfer_data: { destination: provider.stripeAccountId },
 *      }) → return client_secret for the frontend Payment Element.
 *   2. A webhook on `payment_intent.succeeded` marks the booking paid.
 *   3. refund():     stripe.refunds.create({ payment_intent: booking.paymentIntentId })
 *
 * In placeholder mode the payment succeeds instantly and no card is charged.
 */
@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  get mockMode(): boolean {
    const key = process.env.STRIPE_SECRET_KEY ?? '';
    return !key || key.endsWith('...');
  }

  async checkout(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay for a cancelled booking');
    }
    if (booking.paymentStatus === 'paid') {
      throw new BadRequestException('Booking is already paid');
    }

    // --- MOCK: instant success. Real mode returns a PaymentIntent client_secret instead.
    const paymentIntentId = `pi_test_${randomUUID().replace(/-/g, '').slice(0, 24)}`;

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { paymentIntentId, paymentStatus: 'paid' },
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

  async checkoutOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }
    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Order is already paid');
    }

    // --- MOCK: instant success (same Stripe PaymentIntent flow as bookings).
    const paymentIntentId = `pi_test_${randomUUID().replace(/-/g, '').slice(0, 24)}`;

    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentIntentId, paymentStatus: 'paid', status: 'PAID' },
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
