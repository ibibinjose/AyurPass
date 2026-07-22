import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { accessSecret } from '../../common/env';

@Module({
  imports: [JwtModule.register({ secret: accessSecret() })],
  controllers: [LoyaltyController],
  providers: [LoyaltyService, JwtAuthGuard],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
