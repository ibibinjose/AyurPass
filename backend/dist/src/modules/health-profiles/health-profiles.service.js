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
exports.HealthProfilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let HealthProfilesService = class HealthProfilesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrUpdateProfile(consumerId, data) {
        const existing = await this.prisma.healthProfile.findFirst({ where: { consumerId } });
        if (existing) {
            return this.prisma.healthProfile.update({
                where: { id: existing.id },
                data: { ...data, consumerId }
            });
        }
        return this.prisma.healthProfile.create({ data: { ...data, consumerId } });
    }
    async getProfile(consumerId) {
        return this.prisma.healthProfile.findFirst({ where: { consumerId } });
    }
    async updateProfile(consumerId, data) {
        const existing = await this.prisma.healthProfile.findFirst({ where: { consumerId } });
        if (!existing) {
            throw new Error('Health profile not found');
        }
        return this.prisma.healthProfile.update({
            where: { id: existing.id },
            data
        });
    }
};
exports.HealthProfilesService = HealthProfilesService;
exports.HealthProfilesService = HealthProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthProfilesService);
//# sourceMappingURL=health-profiles.service.js.map