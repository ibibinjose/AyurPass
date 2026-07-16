import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertProviderAccess } from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

export class RedemptionDto {
  @IsString()
  @IsOptional()
  giftCardCode?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  redeemPoints?: number;
}

export class ConnectOnboardDto {
  @IsUrl({ require_tld: false })
  returnUrl: string;

  @IsUrl({ require_tld: false })
  refreshUrl: string;
}

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly service: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get('mode')
  mode() {
    return this.service.getPlatformConfig();
  }

  @Post('checkout/:bookingId')
  checkout(@Param('bookingId') bookingId: string, @Body() body: RedemptionDto = {}) {
    return this.service.checkout(bookingId, body);
  }

  @Post('confirm/:bookingId')
  confirmBooking(@Param('bookingId') bookingId: string) {
    return this.service.confirmBookingPayment(bookingId);
  }

  @Post('refund/:bookingId')
  refund(@Param('bookingId') bookingId: string) {
    return this.service.refund(bookingId);
  }

  @Post('checkout-order/:orderId')
  checkoutOrder(@Param('orderId') orderId: string, @Body() body: RedemptionDto = {}) {
    return this.service.checkoutOrder(orderId, body);
  }

  @Post('confirm-order/:orderId')
  confirmOrder(@Param('orderId') orderId: string) {
    return this.service.confirmOrderPayment(orderId);
  }

  @Post('refund-order/:orderId')
  refundOrder(@Param('orderId') orderId: string) {
    return this.service.refundOrder(orderId);
  }

  @Post('connect/:providerId/onboard')
  async connectOnboard(
    @Param('providerId') providerId: string,
    @Body() body: ConnectOnboardDto,
    @Req() req: AuthedRequest,
  ) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.connectOnboard(providerId, body.returnUrl, body.refreshUrl);
  }

  @Get('connect/:providerId/status')
  async connectStatus(@Param('providerId') providerId: string, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.connectStatus(providerId);
  }

  @Public()
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!signature) throw new BadRequestException('Missing stripe-signature header');
    const raw = req.rawBody;
    if (!raw) throw new BadRequestException('Webhook requires raw request body');
    return this.service.handleWebhookPayload(raw, signature);
  }
}