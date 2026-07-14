import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { IntegrationsService } from './integrations.service';

export class ConnectChannelDto {
  @IsString()
  providerId: string;

  @IsString()
  type: string;
}

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Get('provider/:id')
  channels(@Param('id') providerId: string) {
    return this.service.channelsForProvider(providerId);
  }

  @Post('connect')
  connect(@Body() dto: ConnectChannelDto) {
    return this.service.connect(dto.providerId, dto.type);
  }

  @Post(':id/disconnect')
  disconnect(@Param('id') id: string) {
    return this.service.disconnect(id);
  }

  @Post(':id/sync')
  sync(@Param('id') id: string) {
    return this.service.sync(id);
  }
}
