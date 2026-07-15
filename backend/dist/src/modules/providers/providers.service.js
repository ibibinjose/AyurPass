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
exports.ProvidersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const PUBLIC_COUNTS = {
    select: { professionals: true, services: true, products: true, packages: true, rooms: true },
};
function addressText(address) {
    if (!address || typeof address !== 'object' || Array.isArray(address))
        return '';
    const parts = ['city', 'state', 'postcode', 'country', 'street']
        .map((k) => address[k])
        .filter((v) => typeof v === 'string');
    return parts.join(' ').toLowerCase();
}
let ProvidersService = class ProvidersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query = {}) {
        const where = {};
        if (query.q?.trim()) {
            where.businessName = { contains: query.q.trim(), mode: 'insensitive' };
        }
        if (query.type)
            where.type = query.type;
        const providers = await this.prisma.provider.findMany({
            where,
            include: { _count: PUBLIC_COUNTS },
            orderBy: { createdAt: 'desc' },
        });
        const locationNeedle = [query.city, query.country]
            .filter((v) => Boolean(v && v.trim()))
            .map((v) => v.trim().toLowerCase());
        const filtered = locationNeedle.length
            ? providers.filter((p) => {
                const haystack = addressText(p.address);
                return locationNeedle.every((needle) => haystack.includes(needle));
            })
            : providers;
        const verifiedRank = (status) => (status === 'verified' ? 0 : 1);
        return filtered.sort((a, b) => verifiedRank(a.verificationStatus) - verifiedRank(b.verificationStatus));
    }
    async findOne(id) {
        return this.prisma.provider.findUnique({
            where: { id },
            include: { _count: PUBLIC_COUNTS },
        });
    }
    async updateProvider(id, data) {
        return this.prisma.provider.update({
            where: { id },
            data: {
                ...data,
                brandProfile: data.brandProfile,
                address: data.address,
            },
            include: { _count: PUBLIC_COUNTS },
        });
    }
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProvidersService);
//# sourceMappingURL=providers.service.js.map