import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { PurchaseGiftCardDto } from '../../dtos/gift-card.dto';
import { JwtAuthGuard, AuthedRequest } from '../../common/jwt-auth.guard';

@Controller('gift-cards')
@UseGuards(JwtAuthGuard)
export class GiftCardsController {
  constructor(private readonly service: GiftCardsService) {}

  @Post('purchase')
  purchase(@Req() req: AuthedRequest, @Body() dto: PurchaseGiftCardDto) {
    return this.service.purchase(req.user.sub, dto);
  }

  @Get('mine')
  mine(@Req() req: AuthedRequest) {
    return this.service.myCards(req.user.sub);
  }

  @Get('lookup/:code')
  lookup(@Param('code') code: string) {
    return this.service.lookup(code);
  }
}
