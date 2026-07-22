import { Controller, Get, Post, Patch, Param, Body, Delete, Req } from '@nestjs/common';
import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from '../../dtos/treatment-plan.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import {
  assertSelfOrAdmin,
  assertProviderAccess,
  assertTreatmentPlanParty,
} from '../../common/ownership';
import {
  assertHealthProfileAccess,
  hasActiveHealthConsent,
  TREATMENT_PLAN_CONSENT_TYPES,
} from '../../common/consent';
import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('treatment-plans')
export class TreatmentPlansController {
  constructor(
    private readonly service: TreatmentPlansService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(
    @Body() createTreatmentPlanDto: CreateTreatmentPlanDto,
    @Req() req: AuthedRequest,
  ) {
    if (req.user.role === 'CONSUMER') {
      assertSelfOrAdmin(req.user, createTreatmentPlanDto.consumerId);
    } else {
      await assertProviderAccess(this.prisma, req.user, createTreatmentPlanDto.providerId);
    }
    return this.service.createTreatmentPlan(createTreatmentPlanDto);
  }

  @Get('consumer/:id')
  async findByConsumer(@Param('id') consumerId: string, @Req() req: AuthedRequest) {
    // Self / admin: full access.
    // Care team: need view_treatment_plans, full_health_access, or basic health consents.
    if (req.user.role === 'PLATFORM_ADMIN' || req.user.sub === consumerId) {
      return this.service.getPlansForConsumer(consumerId);
    }
    try {
      await assertHealthProfileAccess(this.prisma, req.user, consumerId);
      return this.service.getPlansForConsumer(consumerId);
    } catch {
      // Fall through to plan-specific consent check
    }

    const granteeIds: string[] = [];
    if (req.user.role === 'PROVIDER_ADMIN') {
      const provider = await this.prisma.provider.findFirst({
        where: { userId: req.user.sub },
        select: { id: true },
      });
      if (provider) granteeIds.push(provider.id);
    }
    const professional = await this.prisma.professional.findFirst({
      where: { userId: req.user.sub },
      select: { id: true, providerId: true },
    });
    if (professional) granteeIds.push(professional.id, professional.providerId);

    const ok = await hasActiveHealthConsent(
      this.prisma,
      consumerId,
      granteeIds,
      TREATMENT_PLAN_CONSENT_TYPES,
    );
    if (!ok) {
      throw new ForbiddenException(
        'Active treatment-plan or health consent is required to view these plans.',
      );
    }
    return this.service.getPlansForConsumer(consumerId);
  }

  @Get('provider/:id')
  async findByProvider(@Param('id') providerId: string, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.getPlansForProvider(providerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertTreatmentPlanParty(this.prisma, req.user, id);
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTreatmentPlanDto: UpdateTreatmentPlanDto,
    @Req() req: AuthedRequest,
  ) {
    await assertTreatmentPlanParty(this.prisma, req.user, id);
    return this.service.updatePlan(id, updateTreatmentPlanDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertTreatmentPlanParty(this.prisma, req.user, id);
    return this.service.removePlan(id);
  }
}