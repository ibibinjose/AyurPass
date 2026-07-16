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
exports.RetreatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const PROVIDER_CARD = {
    select: {
        id: true,
        code: true,
        businessName: true,
        type: true,
        verificationStatus: true,
        brandProfile: true,
    },
};
function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'retreat';
}
function randomSuffix() {
    return Math.random().toString(36).slice(2, 7);
}
let RetreatsService = class RetreatsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query = {}) {
        const where = { status: 'published' };
        if (query.q?.trim())
            where.title = { contains: query.q.trim(), mode: 'insensitive' };
        if (query.category)
            where.category = query.category;
        if (query.city?.trim())
            where.city = { contains: query.city.trim(), mode: 'insensitive' };
        if (query.country?.trim())
            where.country = { contains: query.country.trim(), mode: 'insensitive' };
        if (query.featured)
            where.featured = true;
        if (query.maxPrice != null)
            where.priceFrom = { lte: query.maxPrice };
        if (query.maxDuration != null)
            where.durationDays = { lte: query.maxDuration };
        if (query.month && /^\d{4}-\d{2}$/.test(query.month)) {
            const [y, m] = query.month.split('-').map(Number);
            const start = new Date(Date.UTC(y, m - 1, 1));
            const end = new Date(Date.UTC(y, m, 1));
            where.startDate = { gte: start, lt: end };
        }
        return this.prisma.retreat.findMany({
            where,
            include: { provider: PROVIDER_CARD },
            orderBy: [{ featured: 'desc' }, { startDate: 'asc' }, { createdAt: 'desc' }],
        });
    }
    async findBySlug(slug) {
        const retreat = await this.prisma.retreat.findUnique({
            where: { slug },
            include: { provider: PROVIDER_CARD },
        });
        if (!retreat)
            throw new common_1.NotFoundException('Retreat not found');
        return retreat;
    }
    findByProvider(providerId) {
        return this.prisma.retreat.findMany({
            where: { providerId, status: 'published' },
            include: { provider: PROVIDER_CARD },
            orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
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
        return this.prisma.retreat.findMany({
            where: { providerId: provider.id },
            orderBy: { createdAt: 'desc' },
        });
    }
    async uniqueSlug(title) {
        const base = slugify(title);
        for (let i = 0; i < 5; i++) {
            const slug = i === 0 ? base : `${base}-${randomSuffix()}`;
            const exists = await this.prisma.retreat.findUnique({
                where: { slug },
                select: { id: true },
            });
            if (!exists)
                return slug;
        }
        return `${base}-${randomSuffix()}${randomSuffix()}`;
    }
    toData(dto) {
        return {
            title: dto.title,
            category: dto.category,
            summary: dto.summary,
            description: dto.description,
            city: dto.city,
            country: dto.country,
            address: dto.address,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            durationDays: dto.durationDays,
            priceFrom: dto.priceFrom,
            currency: dto.currency,
            capacity: dto.capacity,
            skillLevel: dto.skillLevel,
            images: dto.images,
            highlights: dto.highlights,
            inclusions: dto.inclusions,
            externalBookingUrl: dto.externalBookingUrl,
            status: dto.status,
        };
    }
    async create(userSub, dto) {
        const provider = await this.providerForUser(userSub);
        if (!provider)
            throw new common_1.ForbiddenException('Only providers can create retreats');
        return this.prisma.retreat.create({
            data: {
                ...this.toData(dto),
                title: dto.title,
                category: dto.category,
                slug: await this.uniqueSlug(dto.title),
                providerId: provider.id,
            },
            include: { provider: PROVIDER_CARD },
        });
    }
    async assertOwner(userSub, role, retreatId) {
        const retreat = await this.prisma.retreat.findUnique({
            where: { id: retreatId },
            select: { id: true, providerId: true },
        });
        if (!retreat)
            throw new common_1.NotFoundException('Retreat not found');
        if (role === 'PLATFORM_ADMIN')
            return retreat;
        const provider = await this.providerForUser(userSub);
        if (!provider || provider.id !== retreat.providerId) {
            throw new common_1.ForbiddenException('You can only manage your own retreats');
        }
        return retreat;
    }
    async update(userSub, role, id, dto) {
        await this.assertOwner(userSub, role, id);
        return this.prisma.retreat.update({
            where: { id },
            data: this.toData(dto),
            include: { provider: PROVIDER_CARD },
        });
    }
    async remove(userSub, role, id) {
        await this.assertOwner(userSub, role, id);
        return this.prisma.retreat.delete({ where: { id } });
    }
    async curate(id, dto) {
        const exists = await this.prisma.retreat.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Retreat not found');
        return this.prisma.retreat.update({
            where: { id },
            data: {
                featured: dto.featured,
                verificationStatus: dto.verificationStatus,
            },
            include: { provider: PROVIDER_CARD },
        });
    }
};
exports.RetreatsService = RetreatsService;
exports.RetreatsService = RetreatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RetreatsService);
//# sourceMappingURL=retreats.service.js.map