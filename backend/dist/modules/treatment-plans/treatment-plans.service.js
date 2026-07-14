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
exports.TreatmentPlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TreatmentPlansService = class TreatmentPlansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTreatmentPlan(data) {
        return this.prisma.treatmentPlan.create({ data });
    }
    async getPlansForConsumer(consumerId) {
        return this.prisma.treatmentPlan.findMany({
            where: { consumerId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updatePlan(id, data) {
        return this.prisma.treatmentPlan.update({
            where: { id },
            data,
        });
    }
    async findOne(id) {
        return this.prisma.treatmentPlan.findUnique({
            where: { id },
        });
    }
    async removePlan(id) {
        return this.prisma.treatmentPlan.delete({
            where: { id },
        });
    }
};
exports.TreatmentPlansService = TreatmentPlansService;
exports.TreatmentPlansService = TreatmentPlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TreatmentPlansService);
//# sourceMappingURL=treatment-plans.service.js.map