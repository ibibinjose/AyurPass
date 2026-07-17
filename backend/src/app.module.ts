import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { accessSecret } from './common/env';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ConsentsModule } from './modules/consents/consents.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { AuthModule } from './modules/auth/auth.module';
import { TreatmentPlansModule } from './modules/treatment-plans/treatment-plans.module';
import { PackagesModule } from './modules/packages/packages.module';
import { ServicesModule } from './modules/services/services.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { GiftCardsModule } from './modules/gift-cards/gift-cards.module';
import { HealthProfilesModule } from './modules/health-profiles/health-profiles.module';
import { EnquiriesModule } from './modules/enquiries/enquiries.module';
import { RetreatsModule } from './modules/retreats/retreats.module';
import { OffersModule } from './modules/offers/offers.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { QualityModule } from './modules/quality/quality.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Global baseline: 120 requests / minute per IP. Auth routes set tighter
    // limits via @Throttle on the controller methods.
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 120,
      },
    ]),
    JwtModule.register({
      global: true,
      secret: accessSecret(),
    }),
    PrismaModule,
    UsersModule,
    BookingsModule,
    ConsentsModule,
    ProfessionalsModule,
    AuthModule,
    TreatmentPlansModule,
    PackagesModule,
    ServicesModule,
    RoomsModule,
    PaymentsModule,
    AdminModule,
    ProvidersModule,
    ProductsModule,
    OrdersModule,
    IntegrationsModule,
    LoyaltyModule,
    GiftCardsModule,
    HealthProfilesModule,
    EnquiriesModule,
    RetreatsModule,
    OffersModule,
    UploadsModule,
    QualityModule,
    HealthModule,
  ],
  providers: [
    // Global authentication: every route requires a valid access token
    // unless annotated @Public(). See src/common/jwt-auth.guard.ts.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Rate limiting (IP-based). Override per-route with @Throttle / @SkipThrottle.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
