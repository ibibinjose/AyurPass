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
exports.GiftCardsController = void 0;
const common_1 = require("@nestjs/common");
const gift_cards_service_1 = require("./gift-cards.service");
const gift_card_dto_1 = require("../../dtos/gift-card.dto");
const jwt_auth_guard_1 = require("../../common/jwt-auth.guard");
let GiftCardsController = class GiftCardsController {
    constructor(service) {
        this.service = service;
    }
    purchase(req, dto) {
        return this.service.purchase(req.user.sub, dto);
    }
    mine(req) {
        return this.service.myCards(req.user.sub);
    }
    lookup(code) {
        return this.service.lookup(code);
    }
};
exports.GiftCardsController = GiftCardsController;
__decorate([
    (0, common_1.Post)('purchase'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gift_card_dto_1.PurchaseGiftCardDto]),
    __metadata("design:returntype", void 0)
], GiftCardsController.prototype, "purchase", null);
__decorate([
    (0, common_1.Get)('mine'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GiftCardsController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)('lookup/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GiftCardsController.prototype, "lookup", null);
exports.GiftCardsController = GiftCardsController = __decorate([
    (0, common_1.Controller)('gift-cards'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [gift_cards_service_1.GiftCardsService])
], GiftCardsController);
//# sourceMappingURL=gift-cards.controller.js.map