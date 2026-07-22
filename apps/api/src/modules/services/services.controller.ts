import { Controller, Get, Post, Param, Body, Put, Delete, Query, Req } from '@nestjs/common';
import { ServiceCategory } from '@prisma/client';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import {
  assertProviderAccess,
  assertServiceProviderAccess,
} from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly service: ServicesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() createServiceDto: CreateServiceDto, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, createServiceDto.providerId);
    return this.service.createService(createServiceDto);
  }

  @Public()
  @Get()
  findAll(@Query('category') category?: ServiceCategory) {
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
    @Body() updateServiceDto: UpdateServiceDto,
    @Req() req: AuthedRequest,
  ) {
    await assertServiceProviderAccess(this.prisma, req.user, id);
    return this.service.updateService(id, updateServiceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertServiceProviderAccess(this.prisma, req.user, id);
    return this.service.removeService(id);
  }
}