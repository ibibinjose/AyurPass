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
exports.HealthProfilesController = void 0;
const common_1 = require("@nestjs/common");
const health_profiles_service_1 = require("./health-profiles.service");
const health_profile_dto_1 = require("../../dtos/health-profile.dto");
let HealthProfilesController = class HealthProfilesController {
    constructor(service) {
        this.service = service;
    }
    createOrUpdate(consumerId, data) {
        return this.service.createOrUpdateProfile(consumerId, data);
    }
    getProfile(consumerId) {
        return this.service.getProfile(consumerId);
    }
    update(consumerId, updateHealthProfileDto) {
        return this.service.updateProfile(consumerId, updateHealthProfileDto);
    }
};
exports.HealthProfilesController = HealthProfilesController;
__decorate([
    (0, common_1.Post)('consumer/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, health_profile_dto_1.CreateHealthProfileDto]),
    __metadata("design:returntype", void 0)
], HealthProfilesController.prototype, "createOrUpdate", null);
__decorate([
    (0, common_1.Get)('consumer/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HealthProfilesController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('consumer/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, health_profile_dto_1.UpdateHealthProfileDto]),
    __metadata("design:returntype", void 0)
], HealthProfilesController.prototype, "update", null);
exports.HealthProfilesController = HealthProfilesController = __decorate([
    (0, common_1.Controller)('health-profiles'),
    __metadata("design:paramtypes", [health_profiles_service_1.HealthProfilesService])
], HealthProfilesController);
//# sourceMappingURL=health-profiles.controller.js.map