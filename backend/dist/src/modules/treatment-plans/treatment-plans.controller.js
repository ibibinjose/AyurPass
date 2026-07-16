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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentPlansController = void 0;
const common_1 = require("@nestjs/common");
const treatment_plans_service_1 = require("./treatment-plans.service");
const treatment_plan_dto_1 = require("../../dtos/treatment-plan.dto");
const ownership_1 = require("../../common/ownership");
let TreatmentPlansController = class TreatmentPlansController {
    constructor(service) {
        this.service = service;
    }
    create(createTreatmentPlanDto) {
        return this.service.createTreatmentPlan(createTreatmentPlanDto);
    }
    findByConsumer(consumerId, req) {
        (0, ownership_1.assertSelfOrAdmin)(req.user, consumerId);
        return this.service.getPlansForConsumer(consumerId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, updateTreatmentPlanDto) {
        return this.service.updatePlan(id, updateTreatmentPlanDto);
    }
    remove(id) {
        return this.service.removePlan(id);
    }
};
exports.TreatmentPlansController = TreatmentPlansController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [treatment_plan_dto_1.CreateTreatmentPlanDto]),
    __metadata("design:returntype", void 0)
], TreatmentPlansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('consumer/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TreatmentPlansController.prototype, "findByConsumer", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TreatmentPlansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, treatment_plan_dto_1.UpdateTreatmentPlanDto]),
    __metadata("design:returntype", void 0)
], TreatmentPlansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TreatmentPlansController.prototype, "remove", null);
exports.TreatmentPlansController = TreatmentPlansController = __decorate([
    (0, common_1.Controller)('treatment-plans'),
    __metadata("design:paramtypes", [treatment_plans_service_1.TreatmentPlansService])
], TreatmentPlansController);
//# sourceMappingURL=treatment-plans.controller.js.map