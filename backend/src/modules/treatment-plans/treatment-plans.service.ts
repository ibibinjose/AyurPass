import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from '../../dtos/treatment-plan.dto';

const PLAN_INCLUDE = {
  provider: {
    select: {
      id: true,
      businessName: true,
      type: true,
      slug: true,
      brandProfile: true,
    },
  },
  professional: {
    select: {
      id: true,
      title: true,
      titleKind: true,
      slug: true,
      handle: true,
      handleNamespace: true,
      user: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  },
  consumer: {
    select: {
      userId: true,
      user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
    },
  },
} as const;

@Injectable()
export class TreatmentPlansService {
  constructor(private prisma: PrismaService) {}

  async createTreatmentPlan(data: CreateTreatmentPlanDto) {
    return this.prisma.treatmentPlan.create({
      data,
      include: PLAN_INCLUDE,
    });
  }

  async getPlansForConsumer(consumerId: string) {
    return this.prisma.treatmentPlan.findMany({
      where: { consumerId },
      orderBy: { createdAt: 'desc' },
      include: PLAN_INCLUDE,
    });
  }

  /** Plans authored by this practice (provider dashboard). */
  async getPlansForProvider(providerId: string) {
    return this.prisma.treatmentPlan.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: PLAN_INCLUDE,
    });
  }

  async updatePlan(id: string, data: UpdateTreatmentPlanDto) {
    return this.prisma.treatmentPlan.update({
      where: { id },
      data,
      include: PLAN_INCLUDE,
    });
  }

  async findOne(id: string) {
    return this.prisma.treatmentPlan.findUnique({
      where: { id },
      include: PLAN_INCLUDE,
    });
  }

  async removePlan(id: string) {
    return this.prisma.treatmentPlan.delete({
      where: { id },
    });
  }
}