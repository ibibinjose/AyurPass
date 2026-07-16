import { Controller, Get, Post, Patch, Param, Body, Delete, Req } from '@nestjs/common';
import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from '../../dtos/treatment-plan.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import {
  assertSelfOrAdmin,
  assertProviderAccess,
  assertTreatmentPlanParty,
} from '../../common/ownership';
import { assertHealthProfileAccess } from '../../common/consent';
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
    await assertHealthProfileAccess(this.prisma, req.user, consumerId);
    return this.service.getPlansForConsumer(consumerId);
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