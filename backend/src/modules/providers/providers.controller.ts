import { Controller, Get, Param, Body, Put, Query } from '@nestjs/common';
import { ProviderType } from '@prisma/client';
import { ProvidersService } from './providers.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly service: ProvidersService) {}

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('type') type?: ProviderType,
    @Query('city') city?: string,
    @Query('country') country?: string,
  ) {
    return this.service.findAll({ q, type, city, country });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProviderDto: UpdateProviderDto) {
    return this.service.updateProvider(id, updateProviderDto);
  }
}
