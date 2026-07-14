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
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    get mockMode() {
        const key = process.env.STRIPE_SECRET_KEY ?? '';
        return !key || key.endsWith('...');
    }
    async checkout(bookingId) {
        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Cannot pay for a cancelled booking');
        }
        if (booking.paymentStatus === 'paid') {
            throw new common_1.BadRequestException('Booking is already paid');
        }
        const paymentIntentId = `pi_test_${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 24)}`;
        return this.prisma.booking.update({
            where: { id: bookingId },
            data: { paymentIntentId, paymentStatus: 'paid' },
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
    async checkoutOrder(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Cannot pay for a cancelled order');
        }
        if (order.paymentStatus === 'paid') {
            throw new common_1.BadRequestException('Order is already paid');
        }
        const paymentIntentId = `pi_test_${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 24)}`;
        return this.prisma.order.update({
            where: { id: orderId },
            data: { paymentIntentId, paymentStatus: 'paid', status: 'PAID' },
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map