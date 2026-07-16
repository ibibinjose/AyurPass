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
exports.EnquiriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let EnquiriesService = class EnquiriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: dto.providerId },
            select: { id: true },
        });
        if (!provider)
            throw new common_1.NotFoundException('Provider not found');
        return this.prisma.enquiry.create({
            data: {
                providerId: dto.providerId,
                retreatId: dto.retreatId || null,
                name: dto.name.trim(),
                email: dto.email.trim(),
                phone: dto.phone?.trim() || null,
                message: dto.message.trim(),
            },
        });
    }
    async providerForUser(userSub) {
        return this.prisma.provider.findFirst({
            where: {
                OR: [
                    { userId: userSub },
                    { professionals: { some: { userId: userSub } } },
                ],
            },
            select: { id: true },
        });
    }
    async listMine(userSub) {
        const provider = await this.providerForUser(userSub);
        if (!provider)
            return [];
        return this.prisma.enquiry.findMany({
            where: { providerId: provider.id },
            orderBy: { createdAt: 'desc' },
            include: { retreat: { select: { title: true, slug: true } } },
        });
    }
    async updateStatus(userSub, id, dto) {
        const provider = await this.providerForUser(userSub);
        const enquiry = provider
            ? await this.prisma.enquiry.findUnique({ where: { id } })
            : null;
        if (!enquiry || enquiry.providerId !== provider.id) {
            throw new common_1.ForbiddenException('You can only manage your own enquiries');
        }
        return this.prisma.enquiry.update({
            where: { id },
            data: { status: dto.status },
        });
    }
};
exports.EnquiriesService = EnquiriesService;
exports.EnquiriesService = EnquiriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnquiriesService);
//# sourceMappingURL=enquiries.service.js.map