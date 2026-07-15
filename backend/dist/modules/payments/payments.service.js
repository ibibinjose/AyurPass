"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const loyalty_service_1 = require("../loyalty/loyalty.service");
const gift_cards_service_1 = require("../gift-cards/gift-cards.service");
let PaymentsService = class PaymentsService {
    constructor(prisma, loyalty, giftCards) {
        this.prisma = prisma;
        this.loyalty = loyalty;
        this.giftCards = giftCards;
    }
    get mockMode() {
        const key = process.env.STRIPE_SECRET_KEY ?? '';
        return !key || key.endsWith('...');
    }
    async settle(consumerId, total, redemption, reason) {
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
    async checkout(bookingId, redemption = {}) {
        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Cannot pay for a cancelled booking');
        }
        if (booking.paymentStatus === 'paid') {
            throw new common_1.BadRequestException('Booking is already paid');
        }
        const settlement = await this.settle(booking.consumerId, Number(booking.totalAmount ?? 0), redemption, `Booking ${booking.id.slice(0, 8)}`);
        const paymentIntentId = `pi_test_${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 24)}`;
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
    async refund(bookingId) {
        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.paymentStatus !== 'paid') {
            throw new common_1.BadRequestException('Only paid bookings can be refunded');
        }
        return this.prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'refunded' },
            include: { service: true, room: true },
        });
    }
    async checkoutOrder(orderId, redemption = {}) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Cannot pay for a cancelled order');
        }
        if (order.paymentStatus === 'paid') {
            throw new common_1.BadRequestException('Order is already paid');
        }
        const settlement = await this.settle(order.consumerId, Number(order.subtotal), redemption, `Order ${order.id.slice(0, 8)}`);
        const paymentIntentId = `pi_test_${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 24)}`;
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
    async refundOrder(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.paymentStatus !== 'paid') {
            throw new common_1.BadRequestException('Only paid orders can be refunded');
        }
        return this.prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'refunded', status: 'REFUNDED' },
            include: { items: { include: { product: true } } },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        loyalty_service_1.LoyaltyService,
        gift_cards_service_1.GiftCardsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map