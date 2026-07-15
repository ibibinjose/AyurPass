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
exports.PaymentsController = exports.RedemptionDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const payments_service_1 = require("./payments.service");
class RedemptionDto {
}
exports.RedemptionDto = RedemptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RedemptionDto.prototype, "giftCardCode", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], RedemptionDto.prototype, "redeemPoints", void 0);
let PaymentsController = class PaymentsController {
    constructor(service) {
        this.service = service;
    }
    mode() {
        return { provider: 'stripe', mock: this.service.mockMode };
    }
    checkout(bookingId, body = {}) {
        return this.service.checkout(bookingId, body);
    }
    refund(bookingId) {
        return this.service.refund(bookingId);
    }
    checkoutOrder(orderId, body = {}) {
        return this.service.checkoutOrder(orderId, body);
    }
    refundOrder(orderId) {
        return this.service.refundOrder(orderId);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('mode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "mode", null);
__decorate([
    (0, common_1.Post)('checkout/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RedemptionDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)('refund/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "refund", null);
__decorate([
    (0, common_1.Post)('checkout-order/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RedemptionDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "checkoutOrder", null);
__decorate([
    (0, common_1.Post)('refund-order/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "refundOrder", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map