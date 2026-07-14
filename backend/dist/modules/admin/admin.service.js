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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const SAFE_USER_SELECT = {
    id: true,
    email: true,
    fullName: true,
    role: true,
    phone: true,
    createdAt: true,
};
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async overview() {
        const [users, consumers, providers, professionals, services, packages, bookings, products, orders, pendingVerifications, bookingRevenue, orderRevenue] = await this.prisma.$transaction([
            this.prisma.user.count(),
            this.prisma.consumer.count(),
            this.prisma.provider.count(),
            this.prisma.professional.count(),
            this.prisma.service.count(),
            this.prisma.package.count(),
            this.prisma.booking.count(),
            this.prisma.product.count(),
            this.prisma.order.count(),
            this.prisma.provider.count({ where: { verificationStatus: 'pending' } }),
            this.prisma.booking.aggregate({
                where: { status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
                _sum: { totalAmount: true, platformCommission: true },
            }),
            this.prisma.order.aggregate({
                where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
                _sum: { subtotal: true, platformCommission: true },
            }),
        ]);
        const [paidBookings, paidOrders] = await this.prisma.$transaction([
            this.prisma.booking.aggregate({ where: { paymentStatus: 'paid' }, _sum: { totalAmount: true } }),
            this.prisma.order.aggregate({ where: { paymentStatus: 'paid' }, _sum: { subtotal: true } }),
        ]);
        const grossVolume = Number(bookingRevenue._sum.totalAmount ?? 0) + Number(orderRevenue._sum.subtotal ?? 0);
        const platformRevenue = Number(bookingRevenue._sum.platformCommission ?? 0) + Number(orderRevenue._sum.platformCommission ?? 0);
        const paidVolume = Number(paidBookings._sum.totalAmount ?? 0) + Number(paidOrders._sum.subtotal ?? 0);
        return {
            users,
            consumers,
            providers,
            professionals,
            services,
            packages,
            bookings,
            products,
            orders,
            pendingVerifications,
            grossVolume,
            platformRevenue,
            paidVolume,
        };
    }
    async listProviders() {
        return this.prisma.provider.findMany({
            include: {
                user: { select: SAFE_USER_SELECT },
                _count: { select: { professionals: true, services: true, bookings: true, rooms: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async setVerification(providerId, status) {
        return this.prisma.provider.update({
            where: { id: providerId },
            data: { verificationStatus: status },
            include: { user: { select: SAFE_USER_SELECT } },
        });
    }
    async listBookings() {
        return this.prisma.booking.findMany({
            take: 200,
            include: {
                service: { select: { id: true, name: true, category: true } },
                provider: { select: { id: true, businessName: true } },
                room: { select: { id: true, name: true } },
                consumer: { select: { userId: true, user: { select: { id: true, fullName: true, email: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async listUsers() {
        return this.prisma.user.findMany({
            select: { ...SAFE_USER_SELECT, provider: { select: { id: true, businessName: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map