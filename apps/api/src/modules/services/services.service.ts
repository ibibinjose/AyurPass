import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';
import {
  LIVE_LISTING_WHERE,
  PUBLIC_SERVICE_WHERE,
  assertPubliclyVisible,
  parseListingStatus,
} from '../../common/listing-status';

const PUBLIC_INCLUDES = {
  provider: {
    select: {
      id: true,
      code: true,
      businessName: true,
      type: true,
      verificationStatus: true,
      brandProfile: true,
      listingStatus: true,
    },
  },
  professional: {
    select: {
      id: true,
      title: true,
      specializations: true,
      rating: true,
      reviewCount: true,
      listingStatus: true,
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
      where: {
        ...PUBLIC_SERVICE_WHERE,
        ...(category ? { category } : {}),
      },
      include: PUBLIC_INCLUDES,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProvider(providerId: string, opts: { includeNonLive?: boolean } = {}) {
    // Parent practice gate for public callers: if practice is paused/closed, expose nothing.
    if (!opts.includeNonLive) {
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { listingStatus: true },
      });
      if (!provider || provider.listingStatus !== 'live') return [];
    }

    return this.prisma.service.findMany({
      where: {
        providerId,
        ...(opts.includeNonLive
          ? {}
          : {
              ...LIVE_LISTING_WHERE,
              OR: [{ professionalId: null }, { professional: LIVE_LISTING_WHERE }],
            }),
      },
      include: PUBLIC_INCLUDES,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePublic(id: string) {
    const row = await this.prisma.service.findUnique({
      where: { id },
      include: PUBLIC_INCLUDES,
    });
    if (!row) throw new NotFoundException('Service not found');
    assertPubliclyVisible(row, 'Service');
    assertPubliclyVisible(row.provider, 'Practice');
    if (row.professional) assertPubliclyVisible(row.professional, 'Practitioner');
    return row;
  }

  async updateService(id: string, data: UpdateServiceDto) {
    return this.prisma.service.update({
      where: { id },
      data,
      include: PUBLIC_INCLUDES,
    });
  }

  async updateListingStatus(
    id: string,
    statusRaw: string,
    reason: string | undefined,
    userId: string,
  ) {
    const status = parseListingStatus(statusRaw);
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service not found');
    return this.prisma.service.update({
      where: { id },
      data: {
        listingStatus: status,
        statusChangedAt: new Date(),
        statusReason: reason?.trim() ? reason.trim().slice(0, 500) : null,
        statusChangedBy: userId,
      },
      include: PUBLIC_INCLUDES,
    });
  }

  async removeService(id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}
