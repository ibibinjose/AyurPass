import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET || 'ayurpass_access_secret' })],
  controllers: [LoyaltyController],
  providers: [LoyaltyService, JwtAuthGuard],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
