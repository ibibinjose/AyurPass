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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const PLATFORM_COMMISSION_RATE = 0.18;
const BOOKING_INCLUDES = {
    service: true,
    professional: {
        select: {
            id: true,
            title: true,
            user: { select: { id: true, fullName: true } },
        },
    },
    provider: {
        select: { id: true, businessName: true, type: true },
    },
    room: {
        select: { id: true, name: true, capacity: true, hourlyCost: true },
    },
};
let BookingsService = class BookingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBooking(data) {
        let totalAmount = data.totalAmount;
        if (totalAmount === undefined) {
            const service = await this.prisma.service.findUnique({
                where: { id: data.serviceId },
                select: { price: true },
            });
            totalAmount = service ? Number(service.price) : 0;
        }
        const platformCommission = Math.round(totalAmount * PLATFORM_COMMISSION_RATE * 100) / 100;
        return this.prisma.booking.create({
            data: {
                ...data,
                totalAmount,
                platformCommission,
                providerPayout: Math.round((totalAmount - platformCommission) * 100) / 100,
            },
            include: BOOKING_INCLUDES,
        });
    }
    async findByConsumer(consumerId) {
        return this.prisma.booking.findMany({
            where: { consumerId },
            include: BOOKING_INCLUDES,
            orderBy: { startTime: 'desc' },
        });
    }
    async findByProvider(providerId) {
        return this.prisma.booking.findMany({
            where: { providerId },
            include: {
                ...BOOKING_INCLUDES,
                consumer: {
                    select: {
                        userId: true,
                        user: { select: { id: true, fullName: true, email: true } },
                    },
                },
            },
            orderBy: { startTime: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.booking.findUnique({
            where: { id },
            include: BOOKING_INCLUDES,
        });
    }
    async updateBooking(id, data) {
        return this.prisma.booking.update({
            where: { id },
            data,
            include: BOOKING_INCLUDES,
        });
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map