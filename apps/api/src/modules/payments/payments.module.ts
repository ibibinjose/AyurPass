import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { PaymentSettlementService } from './payment-settlement.service';
import { StripeConnectService } from './stripe-connect.service';
import { ClinicBillingService } from './clinic-billing.service';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { GiftCardsModule } from '../gift-cards/gift-cards.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommunicationsModule } from '../communications/communications.module';

@Module({
  imports: [LoyaltyModule, GiftCardsModule, PrismaModule, CommunicationsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeService,
    PaymentSettlementService,
    StripeConnectService,
    ClinicBillingService,
  ],
  exports: [
    PaymentsService,
    StripeService,
    PaymentSettlementService,
    StripeConnectService,
    ClinicBillingService,
  ],
})
export class PaymentsModule {}