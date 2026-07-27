import { Controller, Get, Post, Param, Body, Put, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from '../../dtos/order.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import {
  assertSelfOrAdmin,
  assertProviderAccess,
  assertOrderParty,
} from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';
import { AmplitudeService } from '../../amplitude/amplitude.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly service: OrdersService,
    private readonly prisma: PrismaService,
    private readonly amplitude: AmplitudeService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: AuthedRequest) {
    assertSelfOrAdmin(req.user, createOrderDto.consumerId);
    const result = await this.service.createOrder(createOrderDto);
    this.amplitude.track(createOrderDto.consumerId, 'Order Created', {
      order_id: result.id,
      provider_id: result.providerId,
      item_count: Array.isArray(result.items) ? result.items.length : undefined,
    });
    return result;
  }

  @Get('consumer/:id')
  findByConsumer(@Param('id') consumerId: string, @Req() req: AuthedRequest) {
    assertSelfOrAdmin(req.user, consumerId);
    return this.service.findByConsumer(consumerId);
  }

  @Get('provider/:id')
  async findByProvider(@Param('id') providerId: string, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.findByProvider(providerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertOrderParty(this.prisma, req.user, id);
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: AuthedRequest,
  ) {
    await assertOrderParty(this.prisma, req.user, id);
    return this.service.updateOrder(id, updateOrderDto);
  }
}