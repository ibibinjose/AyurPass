import { Controller, Post, Param, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get('mode')
  mode() {
    return { provider: 'stripe', mock: this.service.mockMode };
  }

  @Post('checkout/:bookingId')
  checkout(@Param('bookingId') bookingId: string) {
    return this.service.checkout(bookingId);
  }

  @Post('refund/:bookingId')
  refund(@Param('bookingId') bookingId: string) {
    return this.service.refund(bookingId);
  }

  @Post('checkout-order/:orderId')
  checkoutOrder(@Param('orderId') orderId: string) {
    return this.service.checkoutOrder(orderId);
  }

  @Post('refund-order/:orderId')
  refundOrder(@Param('orderId') orderId: string) {
    return this.service.refundOrder(orderId);
  }
}
