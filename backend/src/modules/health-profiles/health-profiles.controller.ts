import { Controller, Get, Post, Param, Body, Put, Req } from '@nestjs/common';
import { HealthProfilesService } from './health-profiles.service';
import { CreateHealthProfileDto, UpdateHealthProfileDto } from '../../dtos/health-profile.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertSelfOrAdmin } from '../../common/ownership';

@Controller('health-profiles')
export class HealthProfilesController {
  constructor(private readonly service: HealthProfilesService) {}

  @Post('consumer/:id')
  createOrUpdate(
    @Param('id') consumerId: string,
    @Body() data: CreateHealthProfileDto,
    @Req() req: AuthedRequest,
  ) {
    assertSelfOrAdmin(req.user, consumerId);
    return this.service.createOrUpdateProfile(consumerId, data);
  }

  @Get('consumer/:id')
  getProfile(@Param('id') consumerId: string, @Req() req: AuthedRequest) {
    assertSelfOrAdmin(req.user, consumerId);
    return this.service.getProfile(consumerId);
  }

  @Put('consumer/:id')
  update(
    @Param('id') consumerId: string,
    @Body() updateHealthProfileDto: UpdateHealthProfileDto,
    @Req() req: AuthedRequest,
  ) {
    assertSelfOrAdmin(req.user, consumerId);
    return this.service.updateProfile(consumerId, updateHealthProfileDto);
  }
}