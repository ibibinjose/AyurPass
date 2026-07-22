import { Injectable } from '@nestjs/common';
import { ServiceCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';

const PUBLIC_INCLUDES = {
  provider: {
    select: { id: true, code: true, businessName: true, type: true, verificationStatus: true, brandProfile: true },
  },
  professional: {
    select: {
      id: true,
      title: true,
      specializations: true,
      rating: true,
      reviewCount: true,
      user: { select: { id: true, fullName: true } },
    },
  },
} as const;

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async createService(data: CreateServiceDto) {
    return this.prisma.service.create({ data, include: PUBLIC_INCLUDES });
  }

  async findAll(category?: ServiceCategory) {
    return this.prisma.service.findMany({
      where: category ? { category } : undefined,
      include: PUBLIC_INCLUDES,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProvider(providerId: string) {
    return this.prisma.service.findMany({
      where: { providerId },
      include: PUBLIC_INCLUDES,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
      include: PUBLIC_INCLUDES,
    });
  }

  async updateService(id: string, data: UpdateServiceDto) {
    return this.prisma.service.update({
      where: { id },
      data,
      include: PUBLIC_INCLUDES,
    });
  }

  async removeService(id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}
