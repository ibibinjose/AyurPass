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
exports.LoyaltyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const loyalty_constants_1 = require("./loyalty.constants");
let LoyaltyService = class LoyaltyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateAccount(consumerId) {
        return this.prisma.loyaltyAccount.upsert({
            where: { consumerId },
            create: { consumerId },
            update: {},
        });
    }
    async summary(consumerId) {
        const account = await this.getOrCreateAccount(consumerId);
        const transactions = await this.prisma.loyaltyTransaction.findMany({
            where: { accountId: account.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const { current, next, pointsToNext } = (0, loyalty_constants_1.tierFor)(account.lifetimePoints);
        return {
            pointsBalance: account.pointsBalance,
            lifetimePoints: account.lifetimePoints,
            pointsValue: (0, loyalty_constants_1.pointsToDollars)(account.pointsBalance),
            pointRedemptionValue: loyalty_constants_1.POINT_REDEMPTION_VALUE,
            tier: current.name,
            tierKey: current.key,
            nextTier: next?.name ?? null,
            pointsToNextTier: pointsToNext,
            transactions,
        };
    }
    async award(consumerId, dollarsPaid, reason) {
        const points = (0, loyalty_constants_1.pointsForSpend)(dollarsPaid);
        if (points <= 0)
            return 0;
        const account = await this.getOrCreateAccount(consumerId);
        await this.prisma.$transaction([
            this.prisma.loyaltyAccount.update({
                where: { id: account.id },
                data: {
                    pointsBalance: { increment: points },
                    lifetimePoints: { increment: points },
                },
            }),
            this.prisma.loyaltyTransaction.create({
                data: { accountId: account.id, type: 'EARN', points, reason },
            }),
        ]);
        return points;
    }
    async redeem(consumerId, requestedPoints, maxDollars, reason) {
        if (requestedPoints <= 0 || maxDollars <= 0)
            return { pointsUsed: 0, value: 0 };
        const account = await this.getOrCreateAccount(consumerId);
        const maxByDollars = Math.floor(maxDollars / loyalty_constants_1.POINT_REDEMPTION_VALUE);
        const pointsUsed = Math.min(requestedPoints, account.pointsBalance, maxByDollars);
        if (pointsUsed <= 0)
            return { pointsUsed: 0, value: 0 };
        const result = await this.prisma.loyaltyAccount.updateMany({
            where: { id: account.id, pointsBalance: { gte: pointsUsed } },
            data: { pointsBalance: { decrement: pointsUsed } },
        });
        if (result.count !== 1) {
            throw new common_1.BadRequestException('Insufficient points balance');
        }
        await this.prisma.loyaltyTransaction.create({
            data: { accountId: account.id, type: 'REDEEM', points: -pointsUsed, reason },
        });
        return { pointsUsed, value: (0, loyalty_constants_1.pointsToDollars)(pointsUsed) };
    }
};
exports.LoyaltyService = LoyaltyService;
exports.LoyaltyService = LoyaltyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoyaltyService);
//# sourceMappingURL=loyalty.service.js.map