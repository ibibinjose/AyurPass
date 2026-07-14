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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const PUBLIC_INCLUDES = {
    provider: {
        select: { id: true, businessName: true, type: true, verificationStatus: true },
    },
    professional: {
        select: {
            id: true,
            title: true,
            specializations: true,
            rating: true,
            reviewCount: true,
            user: { select: { id: true, fullName: true } },
        },
    },
};
let ServicesService = class ServicesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createService(data) {
        return this.prisma.service.create({ data, include: PUBLIC_INCLUDES });
    }
    async findAll(category) {
        return this.prisma.service.findMany({
            where: category ? { category } : undefined,
            include: PUBLIC_INCLUDES,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByProvider(providerId) {
        return this.prisma.service.findMany({
            where: { providerId },
            include: PUBLIC_INCLUDES,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.service.findUnique({
            where: { id },
            include: PUBLIC_INCLUDES,
        });
    }
    async updateService(id, data) {
        return this.prisma.service.update({
            where: { id },
            data,
            include: PUBLIC_INCLUDES,
        });
    }
    async removeService(id) {
        return this.prisma.service.delete({ where: { id } });
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map