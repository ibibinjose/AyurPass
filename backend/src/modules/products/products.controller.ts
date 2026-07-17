import { Controller, Get, Post, Param, Body, Put, Delete, Query, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from '../../dtos/product.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import {
  assertProviderAccess,
  assertProductProviderAccess,
} from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly service: ProductsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, createProductDto.providerId);
    return this.service.createProduct(createProductDto);
  }

  @Public()
  @Get()
  findAll(@Query('category') category?: string) {
    return this.service.findAll(category);
  }

  @Public()
  @Get('provider/:id')
  findByProvider(@Param('id') providerId: string) {
    return this.service.findByProvider(providerId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: AuthedRequest,
  ) {
    await assertProductProviderAccess(this.prisma, req.user, id);
    return this.service.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertProductProviderAccess(this.prisma, req.user, id);
    return this.service.removeProduct(id);
  }

  @Post(':id/inventory')
  async adjustInventory(
    @Param('id') id: string,
    @Body() body: { quantity: number; type: 'ADJUSTMENT' | 'RESTOCK'; reason?: string },
    @Req() req: AuthedRequest,
  ) {
    await assertProductProviderAccess(this.prisma, req.user, id);
    return this.service.adjustInventory(
      id,
      body.quantity,
      body.type,
      body.reason,
      req.user.sub,
    );
  }

  @Get(':id/inventory')
  async getInventory(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
  ) {
    await assertProductProviderAccess(this.prisma, req.user, id);
    return this.service.getInventoryTransactions(id);
  }
}