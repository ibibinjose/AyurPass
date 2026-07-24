import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { LoyaltyService } from './loyalty.service';
import { AuthedRequest } from '../../common/jwt-auth.guard';

class RedeemCatalogDto {
  @IsString()
  @IsNotEmpty()
  rewardId: string;
}

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  /** The caller's own rewards summary — identity comes from the token. */
  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.service.summary(req.user.sub);
  }

  /** Redeem a catalog reward (points → booking/shop credit). */
  @Post('redeem')
  redeem(@Req() req: AuthedRequest, @Body() dto: RedeemCatalogDto) {
    return this.service.redeemCatalog(req.user.sub, dto.rewardId);
  }
}
