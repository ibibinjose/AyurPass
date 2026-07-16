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
exports.EnquiriesController = void 0;
const common_1 = require("@nestjs/common");
const enquiries_service_1 = require("./enquiries.service");
const enquiry_dto_1 = require("../../dtos/enquiry.dto");
const public_decorator_1 = require("../../common/public.decorator");
let EnquiriesController = class EnquiriesController {
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    listMine(req) {
        return this.service.listMine(req.user.sub);
    }
    updateStatus(req, id, dto) {
        return this.service.updateStatus(req.user.sub, id, dto);
    }
};
exports.EnquiriesController = EnquiriesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enquiry_dto_1.CreateEnquiryDto]),
    __metadata("design:returntype", void 0)
], EnquiriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnquiriesController.prototype, "listMine", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, enquiry_dto_1.UpdateEnquiryDto]),
    __metadata("design:returntype", void 0)
], EnquiriesController.prototype, "updateStatus", null);
exports.EnquiriesController = EnquiriesController = __decorate([
    (0, common_1.Controller)('enquiries'),
    __metadata("design:paramtypes", [enquiries_service_1.EnquiriesService])
], EnquiriesController);
//# sourceMappingURL=enquiries.controller.js.map