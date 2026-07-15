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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const PRODUCT_COMMISSION_RATE = 0.12;
const ORDER_INCLUDES = {
    items: { include: { product: { select: { id: true, name: true, category: true } } } },
    provider: { select: { id: true, businessName: true, type: true } },
    consumer: {
        select: { userId: true, user: { select: { id: true, fullName: true, email: true } } },
    },
};
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(data) {
        return this.prisma.$transaction(async (tx) => {
            const products = await tx.product.findMany({
                where: { id: { in: data.items.map((i) => i.productId) } },
            });
            if (products.length !== data.items.length) {
                throw new common_1.NotFoundException('One or more products no longer exist');
            }
            const providerIds = new Set(products.map((p) => p.providerId));
            if (providerIds.size !== 1) {
                throw new common_1.BadRequestException('All items in an order must be from the same provider');
            }
            let subtotal = 0;
            for (const item of data.items) {
                const product = products.find((p) => p.id === item.productId);
                if (product.inventoryQuantity != null && product.inventoryQuantity < item.quantity) {
                    throw new common_1.BadRequestException(`“${product.name}” has only ${product.inventoryQuantity} in stock`);
                }
                subtotal += Number(product.price ?? 0) * item.quantity;
                if (product.inventoryQuantity != null) {
                    await tx.product.update({
                        where: { id: product.id },
                        data: { inventoryQuantity: { decrement: item.quantity } },
                    });
                }
            }
            const platformCommission = Math.round(subtotal * PRODUCT_COMMISSION_RATE * 100) / 100;
            return tx.order.create({
                data: {
                    consumerId: data.consumerId,
                    providerId: products[0].providerId,
                    subtotal,
                    platformCommission,
                    providerPayout: Math.round((subtotal - platformCommission) * 100) / 100,
                    shippingAddress: data.shippingAddress,
                    notes: data.notes,
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: products.find((p) => p.id === item.productId).price ?? 0,
                        })),
                    },
                },
                include: ORDER_INCLUDES,
            });
        });
    }
    async findByConsumer(consumerId) {
        return this.prisma.order.findMany({
            where: { consumerId },
            include: ORDER_INCLUDES,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByProvider(providerId) {
        return this.prisma.order.findMany({
            where: { providerId },
            include: ORDER_INCLUDES,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDES });
    }
    async updateOrder(id, data) {
        const existing = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Order not found');
        if (data.status === 'CANCELLED' && existing.status !== 'CANCELLED') {
            await this.prisma.$transaction(existing.items.map((item) => this.prisma.product.update({
                where: { id: item.productId },
                data: { inventoryQuantity: { increment: item.quantity } },
            })));
        }
        return this.prisma.order.update({ where: { id }, data, include: ORDER_INCLUDES });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map