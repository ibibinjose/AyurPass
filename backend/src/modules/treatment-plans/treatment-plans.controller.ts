import { Controller, Get, Post, Patch, Param, Body, Delete, Req } from '@nestjs/common';
import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from '../../dtos/treatment-plan.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertSelfOrAdmin } from '../../common/ownership';

@Controller('treatment-plans')
export class TreatmentPlansController {
  constructor(private readonly service: TreatmentPlansService) {}

  @Post()
  create(@Body() createTreatmentPlanDto: CreateTreatmentPlanDto) {
    return this.service.createTreatmentPlan(createTreatmentPlanDto);
  }

  @Get('consumer/:id')
  findByConsumer(@Param('id') consumerId: string, @Req() req: AuthedRequest) {
    assertSelfOrAdmin(req.user, consumerId);
    return this.service.getPlansForConsumer(consumerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTreatmentPlanDto: UpdateTreatmentPlanDto) {
    return this.service.updatePlan(id, updateTreatmentPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removePlan(id);
  }
}