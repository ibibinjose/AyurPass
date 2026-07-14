import { Controller, Get, Param, Body, Put } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly service: ProvidersService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProviderDto: UpdateProviderDto) {
    return this.service.updateProvider(id, updateProviderDto);
  }
}
