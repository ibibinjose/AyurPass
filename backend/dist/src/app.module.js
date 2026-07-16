"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const jwt_auth_guard_1 = require("./common/jwt-auth.guard");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./modules/users/users.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const consents_module_1 = require("./modules/consents/consents.module");
const professionals_module_1 = require("./modules/professionals/professionals.module");
const auth_module_1 = require("./modules/auth/auth.module");
const treatment_plans_module_1 = require("./modules/treatment-plans/treatment-plans.module");
const packages_module_1 = require("./modules/packages/packages.module");
const services_module_1 = require("./modules/services/services.module");
const rooms_module_1 = require("./modules/rooms/rooms.module");
const payments_module_1 = require("./modules/payments/payments.module");
const admin_module_1 = require("./modules/admin/admin.module");
const providers_module_1 = require("./modules/providers/providers.module");
const products_module_1 = require("./modules/products/products.module");
const orders_module_1 = require("./modules/orders/orders.module");
const integrations_module_1 = require("./modules/integrations/integrations.module");
const loyalty_module_1 = require("./modules/loyalty/loyalty.module");
const gift_cards_module_1 = require("./modules/gift-cards/gift-cards.module");
const health_profiles_module_1 = require("./modules/health-profiles/health-profiles.module");
const enquiries_module_1 = require("./modules/enquiries/enquiries.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_ACCESS_SECRET || 'ayurpass_access_secret',
            }),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            bookings_module_1.BookingsModule,
            consents_module_1.ConsentsModule,
            professionals_module_1.ProfessionalsModule,
            auth_module_1.AuthModule,
            treatment_plans_module_1.TreatmentPlansModule,
            packages_module_1.PackagesModule,
            services_module_1.ServicesModule,
            rooms_module_1.RoomsModule,
            payments_module_1.PaymentsModule,
            admin_module_1.AdminModule,
            providers_module_1.ProvidersModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            integrations_module_1.IntegrationsModule,
            loyalty_module_1.LoyaltyModule,
            gift_cards_module_1.GiftCardsModule,
            health_profiles_module_1.HealthProfilesModule,
            enquiries_module_1.EnquiriesModule,
            health_module_1.HealthModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map