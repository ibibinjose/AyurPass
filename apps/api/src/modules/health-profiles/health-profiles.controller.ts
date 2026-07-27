import { Controller, Get, Post, Param, Body, Put, Req } from '@nestjs/common';
import { HealthProfilesService } from './health-profiles.service';
import { CreateHealthProfileDto, UpdateHealthProfileDto } from '../../dtos/health-profile.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertSelfOrAdmin } from '../../common/ownership';
import { assertHealthProfileAccess } from '../../common/consent';
import { logAccess } from '../../common/access-audit';
import { PrismaService } from '../../prisma/prisma.service';
import { AmplitudeService } from '../../amplitude/amplitude.service';

@Controller('health-profiles')
export class HealthProfilesController {
  constructor(
    private readonly service: HealthProfilesService,
    private readonly prisma: PrismaService,
    private readonly amplitude: AmplitudeService,
  ) {}

  @Post('consumer/:id')
  async createOrUpdate(
    @Param('id') consumerId: string,
    @Body() data: CreateHealthProfileDto,
    @Req() req: AuthedRequest,
  ) {
    assertSelfOrAdmin(req.user, consumerId);
    const result = await this.service.createOrUpdateProfile(consumerId, data);
    
    // Convert the DTO to a plain object for accessing dynamic properties safely
    const dataAsRecord = data as unknown as Record<string, unknown>;
    const hasDoshaScores = !!(dataAsRecord.doshaScores || 
                              (data.vataScore !== undefined || 
                               data.pittaScore !== undefined || 
                               data.kaphaScore !== undefined));
    
    this.amplitude.track(req.user.sub, 'Health Profile Saved', {
      consumer_id: consumerId,
      has_dosha_scores: hasDoshaScores,
    });
    return result;
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
  async updateProfile(
    @Param('id') consumerId: string,
    @Body() data: UpdateHealthProfileDto,
    @Req() req: AuthedRequest,
  ) {
    assertSelfOrAdmin(req.user, consumerId);
    const result = await this.service.updateProfile(consumerId, data);
    this.amplitude.track(req.user.sub, 'Health Profile Updated', {
      consumer_id: consumerId,
    });
    return result;
  }
}