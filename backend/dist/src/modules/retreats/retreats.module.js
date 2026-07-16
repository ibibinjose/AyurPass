"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetreatsModule = void 0;
const common_1 = require("@nestjs/common");
const retreats_service_1 = require("./retreats.service");
const retreats_controller_1 = require("./retreats.controller");
let RetreatsModule = class RetreatsModule {
};
exports.RetreatsModule = RetreatsModule;
exports.RetreatsModule = RetreatsModule = __decorate([
    (0, common_1.Module)({
        controllers: [retreats_controller_1.RetreatsController],
        providers: [retreats_service_1.RetreatsService],
        exports: [retreats_service_1.RetreatsService],
    })
], RetreatsModule);
//# sourceMappingURL=retreats.module.js.map