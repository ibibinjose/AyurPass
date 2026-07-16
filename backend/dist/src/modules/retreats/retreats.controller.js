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
exports.RetreatsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const retreats_service_1 = require("./retreats.service");
const retreat_dto_1 = require("../../dtos/retreat.dto");
const public_decorator_1 = require("../../common/public.decorator");
let RetreatsController = class RetreatsController {
    constructor(service) {
        this.service = service;
    }
    findAll(q, category, city, country, month, maxPrice, maxDuration, featured) {
        return this.service.findAll({
            q,
            category,
            city,
            country,
            month,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            maxDuration: maxDuration ? Number(maxDuration) : undefined,
            featured: featured === 'true',
        });
    }
    listMine(req) {
        return this.service.listMine(req.user.sub);
    }
    byProvider(providerId) {
        return this.service.findByProvider(providerId);
    }
    bySlug(slug) {
        return this.service.findBySlug(slug);
    }
    create(req, dto) {
        return this.service.create(req.user.sub, dto);
    }
    update(req, id, dto) {
        return this.service.update(req.user.sub, req.user.role, id, dto);
    }
    remove(req, id) {
        return this.service.remove(req.user.sub, req.user.role, id);
    }
    curate(req, id, dto) {
        if (req.user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException('Platform admin access required');
        }
        return this.service.curate(id, dto);
    }
};
exports.RetreatsController = RetreatsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('city')),
    __param(3, (0, common_1.Query)('country')),
    __param(4, (0, common_1.Query)('month')),
    __param(5, (0, common_1.Query)('maxPrice')),
    __param(6, (0, common_1.Query)('maxDuration')),
    __param(7, (0, common_1.Query)('featured')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], RetreatsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('mine'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RetreatsController.prototype, "listMine", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('provider/:providerId'),
    __param(0, (0, common_1.Param)('providerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetreatsController.prototype, "byProvider", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('slug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetreatsController.prototype, "bySlug", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, retreat_dto_1.CreateRetreatDto]),
    __metadata("design:returntype", void 0)
], RetreatsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, retreat_dto_1.UpdateRetreatDto]),
    __metadata("design:returntype", void 0)
], RetreatsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RetreatsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/curation'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, retreat_dto_1.CurateRetreatDto]),
    __metadata("design:returntype", void 0)
], RetreatsController.prototype, "curate", null);
exports.RetreatsController = RetreatsController = __decorate([
    (0, common_1.Controller)('retreats'),
    __metadata("design:paramtypes", [retreats_service_1.RetreatsService])
], RetreatsController);
//# sourceMappingURL=retreats.controller.js.map