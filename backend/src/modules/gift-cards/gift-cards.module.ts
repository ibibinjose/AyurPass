import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GiftCardsService } from './gift-cards.service';
import { GiftCardsController } from './gift-cards.controller';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'ayurpass_access_secret' })],
  controllers: [GiftCardsController],
  providers: [GiftCardsService, JwtAuthGuard],
  exports: [GiftCardsService],
})
export class GiftCardsModule {}
