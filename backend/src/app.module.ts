import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './common/jwt-auth.guard';
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
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET || 'ayurpass_access_secret',
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
    HealthModule,
  ],
  providers: [
    // Global authentication: every route requires a valid access token
    // unless annotated @Public(). See src/common/jwt-auth.guard.ts.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}