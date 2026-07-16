import { Controller, Get, Post, Param, Body, Put, Delete, Query } from '@nestjs/common';
import { ServiceCategory } from '@prisma/client';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';
import { Public } from '../../common/public.decorator';

@Controller('services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
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
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.service.updateService(id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removeService(id);
  }
}
