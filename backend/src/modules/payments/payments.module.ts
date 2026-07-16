import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { PaymentSettlementService } from './payment-settlement.service';
import { StripeConnectService } from './stripe-connect.service';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { GiftCardsModule } from '../gift-cards/gift-cards.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [LoyaltyModule, GiftCardsModule, PrismaModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeService,
    PaymentSettlementService,
    StripeConnectService,
  ],
  exports: [PaymentsService, StripeService, PaymentSettlementService, StripeConnectService],
})
export class PaymentsModule {}