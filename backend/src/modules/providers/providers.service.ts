import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';

const PUBLIC_COUNTS = {
  select: { professionals: true, services: true, products: true, packages: true, rooms: true },
} as const;

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
      include: { _count: PUBLIC_COUNTS },
    });
  }

  async updateProvider(id: string, data: UpdateProviderDto) {
    return this.prisma.provider.update({
      where: { id },
      data: {
        ...data,
        brandProfile: data.brandProfile as Prisma.InputJsonValue | undefined,
        address: data.address as Prisma.InputJsonValue | undefined,
      },
      include: { _count: PUBLIC_COUNTS },
    });
  }
}
