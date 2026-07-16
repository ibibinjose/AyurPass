import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { IsString } from 'class-validator';
import { IntegrationsService } from './integrations.service';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertProviderAccess } from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

export class ConnectChannelDto {
  @IsString()
  providerId: string;

  @IsString()
  type: string;
}

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly service: IntegrationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('provider/:id')
  async channels(@Param('id') providerId: string, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.channelsForProvider(providerId);
  }

  @Post('connect')
  async connect(@Body() dto: ConnectChannelDto, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, dto.providerId);
    return this.service.connect(dto.providerId, dto.type);
  }

  @Post(':id/disconnect')
  async disconnect(@Param('id') id: string, @Req() req: AuthedRequest) {
    const integration = await this.service.findIntegration(id);
    await assertProviderAccess(this.prisma, req.user, integration.providerId);
    return this.service.disconnect(id);
  }

  @Post(':id/sync')
  async sync(@Param('id') id: string, @Req() req: AuthedRequest) {
    const integration = await this.service.findIntegration(id);
    await assertProviderAccess(this.prisma, req.user, integration.providerId);
    return this.service.sync(id);
  }
}