import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
    HealthModule,
  ],
})
export class AppModule {}