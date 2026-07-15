import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from '../../dtos/professional.dto';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  async createProfessional(data: CreateProfessionalDto) {
    return this.prisma.professional.create({
      data,
      include: { user: true },
    });
  }

  async findAll() {
    return this.prisma.professional.findMany({
      include: {
        user: true,
        provider: {
          select: {
            id: true,
            businessName: true,
            type: true,
            verificationStatus: true,
            brandProfile: true,
            address: true
          }
        },
      },
    });
  }

  async findByProvider(providerId: string) {
    return this.prisma.professional.findMany({
      where: { providerId },
      include: { user: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.professional.findUnique({
      where: { id },
      include: {
        user: true,
        services: true,
        bookings: true,
        treatmentPlans: true,
      },
    });
  }

  async updateProfessional(id: string, data: UpdateProfessionalDto) {
    return this.prisma.professional.update({
      where: { id },
      data,
      include: { user: true },
    });
  }
}