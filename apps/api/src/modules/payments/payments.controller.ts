import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import {
  assertBookingParty,
  assertBookingPayer,
  assertOrderParty,
  assertOrderPayer,
  assertProviderAccess,
} from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

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

  @IsString()
  @IsOptional()
  country?: string;
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

  /** Consumer (payer) only — prevents redeeming another user's points/gift cards. */
  @Post('checkout/:bookingId')
  async checkout(
    @Param('bookingId') bookingId: string,
    @Body() body: RedemptionDto = {},
    @Req() req: AuthedRequest,
  ) {
    await assertBookingPayer(this.prisma, req.user, bookingId);
    return this.service.checkout(bookingId, body);
  }

  @Post('confirm/:bookingId')
  async confirmBooking(@Param('bookingId') bookingId: string, @Req() req: AuthedRequest) {
    await assertBookingPayer(this.prisma, req.user, bookingId);
    return this.service.confirmBookingPayment(bookingId);
  }

  @Post('pay-counter/:bookingId')
  async payCounter(
    @Param('bookingId') bookingId: string,
    @Body() body: { paymentMethod: PaymentMethod; posTransactionId?: string },
    @Req() req: AuthedRequest,
  ) {
    await assertBookingParty(this.prisma, req.user, bookingId);
    return this.service.payCounter(bookingId, body.paymentMethod, body.posTransactionId);
  }

  /** Consumer or provider staff may refund a booking they are party to. */
  @Post('refund/:bookingId')
  async refund(@Param('bookingId') bookingId: string, @Req() req: AuthedRequest) {
    await assertBookingParty(this.prisma, req.user, bookingId);
    return this.service.refund(bookingId);
  }

  @Post('checkout-order/:orderId')
  async checkoutOrder(
    @Param('orderId') orderId: string,
    @Body() body: RedemptionDto = {},
    @Req() req: AuthedRequest,
  ) {
    await assertOrderPayer(this.prisma, req.user, orderId);
    return this.service.checkoutOrder(orderId, body);
  }

  @Post('confirm-order/:orderId')
  async confirmOrder(@Param('orderId') orderId: string, @Req() req: AuthedRequest) {
    await assertOrderPayer(this.prisma, req.user, orderId);
    return this.service.confirmOrderPayment(orderId);
  }

  @Post('pay-order-counter/:orderId')
  async payOrderCounter(
    @Param('orderId') orderId: string,
    @Body() body: { paymentMethod: PaymentMethod; posTransactionId?: string },
    @Req() req: AuthedRequest,
  ) {
    await assertOrderParty(this.prisma, req.user, orderId);
    return this.service.payOrderCounter(orderId, body.paymentMethod, body.posTransactionId);
  }

  @Post('refund-order/:orderId')
  async refundOrder(@Param('orderId') orderId: string, @Req() req: AuthedRequest) {
    await assertOrderParty(this.prisma, req.user, orderId);
    return this.service.refundOrder(orderId);
  }

  @Post('connect/:providerId/onboard')
  async connectOnboard(
    @Param('providerId') providerId: string,
    @Body() body: ConnectOnboardDto,
    @Req() req: AuthedRequest,
  ) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.connectOnboard(providerId, body.returnUrl, body.refreshUrl, body.country);
  }

  @Get('connect/:providerId/status')
  async connectStatus(@Param('providerId') providerId: string, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.connectStatus(providerId);
  }

  /** Stripe delivers bursts; signature verification is the real gate. */
  @Public()
  @SkipThrottle()
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
