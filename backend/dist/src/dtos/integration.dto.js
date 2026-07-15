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
exports.SyncReport = exports.LoyaltySummary = exports.Channel = exports.ChannelType = void 0;
const class_validator_1 = require("class-validator");
var ChannelType;
(function (ChannelType) {
    ChannelType["WEB"] = "web";
    ChannelType["MOBILE"] = "mobile";
    ChannelType["API"] = "api";
    ChannelType["POS"] = "pos";
    ChannelType["EMAIL"] = "email";
    ChannelType["SMS"] = "sms";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
class Channel {
}
exports.Channel = Channel;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Channel.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ChannelType),
    __metadata("design:type", String)
], Channel.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Channel.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Channel.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Channel.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Channel.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Channel.prototype, "webhookUrl", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], Channel.prototype, "lastSyncAt", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], Channel.prototype, "syncFrequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], Channel.prototype, "config", void 0);
class LoyaltySummary {
}
exports.LoyaltySummary = LoyaltySummary;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoyaltySummary.prototype, "accountId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LoyaltySummary.prototype, "pointsBalance", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LoyaltySummary.prototype, "lifetimePoints", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LoyaltySummary.prototype, "pointsToNextReward", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoyaltySummary.prototype, "tier", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LoyaltySummary.prototype, "tierProgress", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LoyaltySummary.prototype, "totalRewardsRedeemed", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LoyaltySummary.prototype, "totalValueRedeemed", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], LoyaltySummary.prototype, "lastActivityDate", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], LoyaltySummary.prototype, "tierExpirationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], LoyaltySummary.prototype, "rewardsAvailable", void 0);
class SyncReport {
}
exports.SyncReport = SyncReport;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncReport.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncReport.prototype, "integrationId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncReport.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], SyncReport.prototype, "syncStartAt", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SyncReport.prototype, "syncEndAt", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SyncReport.prototype, "recordsProcessed", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SyncReport.prototype, "recordsCreated", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SyncReport.prototype, "recordsUpdated", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SyncReport.prototype, "recordsFailed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SyncReport.prototype, "errors", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SyncReport.prototype, "summary", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SyncReport.prototype, "message", void 0);
//# sourceMappingURL=integration.dto.js.map