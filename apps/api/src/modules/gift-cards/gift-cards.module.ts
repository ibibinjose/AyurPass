import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GiftCardsService } from './gift-cards.service';
import { GiftCardsController } from './gift-cards.controller';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { accessSecret } from '../../common/env';

@Module({
  imports: [JwtModule.register({ secret: accessSecret() })],
  controllers: [GiftCardsController],
  providers: [GiftCardsService, JwtAuthGuard],
  exports: [GiftCardsService],
})
export class GiftCardsModule {}
