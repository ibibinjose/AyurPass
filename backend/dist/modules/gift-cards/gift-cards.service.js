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
exports.GiftCardsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randomGroup(len) {
    let out = '';
    for (let i = 0; i < len; i++)
        out += CODE_ALPHABET[(0, crypto_1.randomInt)(CODE_ALPHABET.length)];
    return out;
}
let GiftCardsService = class GiftCardsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateUniqueCode() {
        for (let attempt = 0; attempt < 5; attempt++) {
            const code = `AYUR-${randomGroup(4)}-${randomGroup(4)}-${randomGroup(4)}`;
            const existing = await this.prisma.giftCard.findUnique({ where: { code } });
            if (!existing)
                return code;
        }
        throw new common_1.BadRequestException('Could not allocate a gift card code, please retry');
    }
    async purchase(purchaserId, dto) {
        const code = await this.generateUniqueCode();
        return this.prisma.giftCard.create({
            data: {
                code,
                initialBalance: dto.amount,
                balance: dto.amount,
                purchaserId,
                recipientEmail: dto.recipientEmail,
                message: dto.message,
                transactions: {
                    create: { type: 'ISSUE', amount: dto.amount, reason: 'Gift card purchased' },
                },
            },
            include: { transactions: true },
        });
    }
    async myCards(purchaserId) {
        return this.prisma.giftCard.findMany({
            where: { purchaserId },
            include: { transactions: { orderBy: { createdAt: 'desc' } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    normalise(code) {
        return code.trim().toUpperCase();
    }
    async lookup(code) {
        const card = await this.prisma.giftCard.findUnique({
            where: { code: this.normalise(code) },
            select: { code: true, balance: true, status: true },
        });
        if (!card)
            throw new common_1.NotFoundException('No gift card with that code');
        return card;
    }
    async redeem(code, maxDollars, reason) {
        if (maxDollars <= 0)
            return 0;
        const card = await this.prisma.giftCard.findUnique({ where: { code: this.normalise(code) } });
        if (!card)
            throw new common_1.NotFoundException('No gift card with that code');
        if (card.status === 'void')
            throw new common_1.BadRequestException('This gift card is no longer valid');
        const applied = Math.min(Number(card.balance), maxDollars);
        if (applied <= 0)
            throw new common_1.BadRequestException('This gift card has no remaining balance');
        const result = await this.prisma.giftCard.updateMany({
            where: { id: card.id, balance: { gte: applied } },
            data: { balance: { decrement: applied } },
        });
        if (result.count !== 1) {
            throw new common_1.BadRequestException('Gift card balance changed, please retry');
        }
        const remaining = Number(card.balance) - applied;
        await this.prisma.$transaction([
            this.prisma.giftCardTransaction.create({
                data: { giftCardId: card.id, type: 'REDEEM', amount: applied, reason },
            }),
            this.prisma.giftCard.update({
                where: { id: card.id },
                data: { status: remaining <= 0 ? 'depleted' : 'active' },
            }),
        ]);
        return applied;
    }
};
exports.GiftCardsService = GiftCardsService;
exports.GiftCardsService = GiftCardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GiftCardsService);
//# sourceMappingURL=gift-cards.service.js.map