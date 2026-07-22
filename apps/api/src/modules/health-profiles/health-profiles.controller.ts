import { Controller, Get, Post, Param, Body, Put, Req } from '@nestjs/common';
import { HealthProfilesService } from './health-profiles.service';
import { CreateHealthProfileDto, UpdateHealthProfileDto } from '../../dtos/health-profile.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertSelfOrAdmin } from '../../common/ownership';
import { assertHealthProfileAccess } from '../../common/consent';
import { logAccess } from '../../common/access-audit';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health-profiles')
export class HealthProfilesController {
  constructor(
    private readonly service: HealthProfilesService,
    private readonly prisma: PrismaService,
  ) {}

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
  async getProfile(@Param('id') consumerId: string, @Req() req: AuthedRequest) {
    const { purpose } = await assertHealthProfileAccess(this.prisma, req.user, consumerId);
    const profile = await this.service.getProfile(consumerId);
    if (profile) {
      await logAccess(this.prisma, {
        consumerId,
        accessorId: req.user.sub,
        action: 'READ',
        resourceType: 'HealthProfile',
        resourceId: profile.id,
        purpose,
        ipAddress: req.ip,
      });
    }
    return profile;
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