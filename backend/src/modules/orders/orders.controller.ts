import { Controller, Get, Post, Param, Body, Put, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from '../../dtos/order.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertSelfOrAdmin } from '../../common/ownership';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: AuthedRequest) {
    assertSelfOrAdmin(req.user, createOrderDto.consumerId);
    return this.service.createOrder(createOrderDto);
  }

  @Get('consumer/:id')
  findByConsumer(@Param('id') consumerId: string, @Req() req: AuthedRequest) {
    assertSelfOrAdmin(req.user, consumerId);
    return this.service.findByConsumer(consumerId);
  }

  @Get('provider/:id')
  findByProvider(@Param('id') providerId: string) {
    return this.service.findByProvider(providerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.service.updateOrder(id, updateOrderDto);
  }
}
