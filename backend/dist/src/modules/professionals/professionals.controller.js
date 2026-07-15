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
exports.ProfessionalsController = void 0;
const common_1 = require("@nestjs/common");
const professionals_service_1 = require("./professionals.service");
const professional_dto_1 = require("../../dtos/professional.dto");
let ProfessionalsController = class ProfessionalsController {
    constructor(professionalsService) {
        this.professionalsService = professionalsService;
    }
    create(createProfessionalDto) {
        return this.professionalsService.createProfessional(createProfessionalDto);
    }
    findAll() {
        return this.professionalsService.findAll();
    }
    findByProvider(providerId) {
        return this.professionalsService.findByProvider(providerId);
    }
    findOne(id) {
        return this.professionalsService.findOne(id);
    }
    update(id, updateProfessionalDto) {
        return this.professionalsService.updateProfessional(id, updateProfessionalDto);
    }
};
exports.ProfessionalsController = ProfessionalsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [professional_dto_1.CreateProfessionalDto]),
    __metadata("design:returntype", void 0)
], ProfessionalsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProfessionalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('provider/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProfessionalsController.prototype, "findByProvider", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProfessionalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, professional_dto_1.UpdateProfessionalDto]),
    __metadata("design:returntype", void 0)
], ProfessionalsController.prototype, "update", null);
exports.ProfessionalsController = ProfessionalsController = __decorate([
    (0, common_1.Controller)('professionals'),
    __metadata("design:paramtypes", [professionals_service_1.ProfessionalsService])
], ProfessionalsController);
//# sourceMappingURL=professionals.controller.js.map