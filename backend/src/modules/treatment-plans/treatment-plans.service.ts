import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from '../../dtos/treatment-plan.dto';

@Injectable()
export class TreatmentPlansService {
  constructor(private prisma: PrismaService) {}

  async createTreatmentPlan(data: CreateTreatmentPlanDto) {
    return this.prisma.treatmentPlan.create({ data });
  }

  async getPlansForConsumer(consumerId: string) {
    return this.prisma.treatmentPlan.findMany({
      where: { consumerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePlan(id: string, data: UpdateTreatmentPlanDto) {
    return this.prisma.treatmentPlan.update({
      where: { id },
      data,
    });
  }

  async findOne(id: string) {
    return this.prisma.treatmentPlan.findUnique({
      where: { id },
    });
  }

  async removePlan(id: string) {
    return this.prisma.treatmentPlan.delete({
      where: { id },
    });
  }
}