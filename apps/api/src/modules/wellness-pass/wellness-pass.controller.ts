import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { WellnessPassService } from './wellness-pass.service';
import { ScanPassDto } from '../../dtos/event.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';

@Controller('wellness-pass')
export class WellnessPassController {
  constructor(private readonly service: WellnessPassService) {}

  /** Seeker's permanent pass + linked appointments & event tickets. */
  @Get('me')
  myPass(@Req() req: AuthedRequest) {
    return this.service.getMyPass(req.user.sub);
  }

  /** Issue / refresh pass if missing (idempotent). */
  @Post('issue')
  issue(@Req() req: AuthedRequest) {
    return this.service.ensureForConsumer(req.user.sub);
  }

  /** Apple Wallet pass.json skeleton (signed .pkpass when certs configured). */
  @Get('wallet/apple')
  appleWallet(@Req() req: AuthedRequest) {
    return this.service.walletApplePayload(req.user.sub);
  }

  /** Google Wallet object skeleton / save URL when configured. */
  @Get('wallet/google')
  googleWallet(@Req() req: AuthedRequest) {
    return this.service.walletGooglePayload(req.user.sub);
  }

  /** Provider door / desk scan. */
  @Post('scan')
  scan(@Req() req: AuthedRequest, @Body() dto: ScanPassDto) {
    return this.service.scan(req.user.sub, dto);
  }
}
