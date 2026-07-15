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
exports.CreateGiftCardDto = exports.RedeemGiftCardDto = exports.PurchaseGiftCardDto = exports.GiftCardLookup = exports.GiftCard = exports.GiftCardStatus = void 0;
const class_validator_1 = require("class-validator");
var GiftCardStatus;
(function (GiftCardStatus) {
    GiftCardStatus["ACTIVE"] = "active";
    GiftCardStatus["DEPLETED"] = "depleted";
    GiftCardStatus["VOID"] = "void";
    GiftCardStatus["EXPIRED"] = "expired";
})(GiftCardStatus || (exports.GiftCardStatus = GiftCardStatus = {}));
class GiftCard {
}
exports.GiftCard = GiftCard;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GiftCard.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GiftCard.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GiftCard.prototype, "initialBalance", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GiftCard.prototype, "balance", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(GiftCardStatus),
    __metadata("design:type", String)
], GiftCard.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GiftCard.prototype, "purchaserId", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GiftCard.prototype, "recipientEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GiftCard.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], GiftCard.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], GiftCard.prototype, "updatedAt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], GiftCard.prototype, "expiryDate", void 0);
class GiftCardLookup {
}
exports.GiftCardLookup = GiftCardLookup;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GiftCardLookup.prototype, "code", void 0);
class PurchaseGiftCardDto {
}
exports.PurchaseGiftCardDto = PurchaseGiftCardDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], PurchaseGiftCardDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PurchaseGiftCardDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PurchaseGiftCardDto.prototype, "message", void 0);
class RedeemGiftCardDto {
}
exports.RedeemGiftCardDto = RedeemGiftCardDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RedeemGiftCardDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RedeemGiftCardDto.prototype, "amount", void 0);
class CreateGiftCardDto {
}
exports.CreateGiftCardDto = CreateGiftCardDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateGiftCardDto.prototype, "initialBalance", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGiftCardDto.prototype, "purchaserId", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGiftCardDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGiftCardDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateGiftCardDto.prototype, "expiryDate", void 0);
//# sourceMappingURL=gift-card.dto.js.map