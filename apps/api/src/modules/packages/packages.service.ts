import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackageDto, UpdatePackageDto } from '../../dtos/package.dto';

const PROVIDER_SELECT = {
  select: { id: true, businessName: true, type: true, verificationStatus: true },
} as const;

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * A package is sold through a linked Service row (category PACKAGE) so the
   * standard booking flow can reserve it. Create/update/delete keep the pair in sync.
   */
  async createPackage(data: CreatePackageDto) {
    const bookable = await this.prisma.service.create({
      data: {
        providerId: data.providerId,
        category: 'PACKAGE',
        name: data.name,
        description: data.description,
        durationMinutes: 60,
        price: data.totalPrice,
      },
    });
    return this.prisma.package.create({
      data: { ...data, serviceId: bookable.id },
      include: { provider: PROVIDER_SELECT },
    });
  }

  async findAll() {
    return this.prisma.package.findMany({
      include: { provider: PROVIDER_SELECT },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProvider(providerId: string) {
    return this.prisma.package.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.package.findUnique({
      where: { id },
      include: { provider: PROVIDER_SELECT },
    });
  }

  async updatePackage(id: string, data: UpdatePackageDto) {
    const pkg = await this.prisma.package.update({
      where: { id },
      data,
      include: { provider: PROVIDER_SELECT },
    });
    if (pkg.serviceId && (data.name || data.description || data.totalPrice !== undefined)) {
      await this.prisma.service.update({
        where: { id: pkg.serviceId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.totalPrice !== undefined ? { price: data.totalPrice } : {}),
        },
      });
    }
    return pkg;
  }

  async removePackage(id: string) {
    const pkg = await this.prisma.package.delete({ where: { id } });
    if (pkg.serviceId) {
      // Keep the service if bookings already reference it; otherwise remove it.
      await this.prisma.service
        .delete({ where: { id: pkg.serviceId } })
        .catch(() => undefined);
    }
    return pkg;
  }
}
