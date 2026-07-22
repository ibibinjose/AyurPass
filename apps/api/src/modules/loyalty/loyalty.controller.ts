import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard, AuthedRequest } from '../../common/jwt-auth.guard';

@Controller('loyalty')
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  /** The caller's own rewards summary — identity comes from the token. */
  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.service.summary(req.user.sub);
  }
}
