import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { HealthProfilesService } from './health-profiles.service';
import { CreateHealthProfileDto, UpdateHealthProfileDto } from '../../dtos/health-profile.dto';

@Controller('health-profiles')
export class HealthProfilesController {
  constructor(private readonly service: HealthProfilesService) {}

  @Post('consumer/:id')
  createOrUpdate(@Param('id') consumerId: string, @Body() data: CreateHealthProfileDto) {
    return this.service.createOrUpdateProfile(consumerId, data);
  }

  @Get('consumer/:id')
  getProfile(@Param('id') consumerId: string) {
    return this.service.getProfile(consumerId);
  }

  @Put('consumer/:id')
  update(@Param('id') consumerId: string, @Body() updateHealthProfileDto: UpdateHealthProfileDto) {
    return this.service.updateProfile(consumerId, updateHealthProfileDto);
  }
}