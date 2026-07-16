import { Controller, Post, Param, Get, Body } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/public.decorator';

export class RedemptionDto {
  @IsString()
  @IsOptional()
  giftCardCode?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  redeemPoints?: number;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Public()
  @Get('mode')
  mode() {
    return { provider: 'stripe', mock: this.service.mockMode };
  }

  @Post('checkout/:bookingId')
  checkout(@Param('bookingId') bookingId: string, @Body() body: RedemptionDto = {}) {
    return this.service.checkout(bookingId, body);
  }

  @Post('refund/:bookingId')
  refund(@Param('bookingId') bookingId: string) {
    return this.service.refund(bookingId);
  }

  @Post('checkout-order/:orderId')
  checkoutOrder(@Param('orderId') orderId: string, @Body() body: RedemptionDto = {}) {
    return this.service.checkoutOrder(orderId, body);
  }

  @Post('refund-order/:orderId')
  refundOrder(@Param('orderId') orderId: string) {
    return this.service.refundOrder(orderId);
  }
}
