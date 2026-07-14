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
exports.PackagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const PROVIDER_SELECT = {
    select: { id: true, businessName: true, type: true, verificationStatus: true },
};
let PackagesService = class PackagesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPackage(data) {
        const bookable = await this.prisma.service.create({
            data: {
                providerId: data.providerId,
                category: 'PACKAGE',
                name: data.name,
                description: data.description,
                durationMinutes: 60,
                price: data.totalPrice,
            },
        });
        return this.prisma.package.create({
            data: { ...data, serviceId: bookable.id },
            include: { provider: PROVIDER_SELECT },
        });
    }
    async findAll() {
        return this.prisma.package.findMany({
            include: { provider: PROVIDER_SELECT },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByProvider(providerId) {
        return this.prisma.package.findMany({
            where: { providerId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.package.findUnique({
            where: { id },
            include: { provider: PROVIDER_SELECT },
        });
    }
    async updatePackage(id, data) {
        const pkg = await this.prisma.package.update({
            where: { id },
            data,
            include: { provider: PROVIDER_SELECT },
        });
        if (pkg.serviceId && (data.name || data.description || data.totalPrice !== undefined)) {
            await this.prisma.service.update({
                where: { id: pkg.serviceId },
                data: {
                    ...(data.name ? { name: data.name } : {}),
                    ...(data.description !== undefined ? { description: data.description } : {}),
                    ...(data.totalPrice !== undefined ? { price: data.totalPrice } : {}),
                },
            });
        }
        return pkg;
    }
    async removePackage(id) {
        const pkg = await this.prisma.package.delete({ where: { id } });
        if (pkg.serviceId) {
            await this.prisma.service
                .delete({ where: { id: pkg.serviceId } })
                .catch(() => undefined);
        }
        return pkg;
    }
};
exports.PackagesService = PackagesService;
exports.PackagesService = PackagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PackagesService);
//# sourceMappingURL=packages.service.js.map