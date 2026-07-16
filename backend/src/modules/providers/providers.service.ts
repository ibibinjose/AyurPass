import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProviderType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';
import { slugifyName, withSlugSuffix } from '../../common/slug';

const PUBLIC_COUNTS = {
  select: { professionals: true, services: true, products: true, packages: true, rooms: true },
} as const;

export interface ProviderQuery {
  q?: string;
  type?: ProviderType;
  city?: string;
  country?: string;
}

/** Pull a normalised location string out of the provider's JSON address. */
function addressText(address: Prisma.JsonValue | null | undefined): string {
  if (!address || typeof address !== 'object' || Array.isArray(address)) return '';
  const parts = ['city', 'state', 'postcode', 'country', 'street']
    .map((k) => (address as Record<string, unknown>)[k])
    .filter((v): v is string => typeof v === 'string');
  return parts.join(' ').toLowerCase();
}

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async uniqueSlug(businessName: string, excludeId?: string): Promise<string> {
    const base = slugifyName(businessName) || 'practice';
    let n = 0;
    while (true) {
      const slug = n === 0 ? base : withSlugSuffix(base, n);
      const hit = await this.prisma.provider.findFirst({
        where: {
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (!hit) return slug;
      n += 1;
    }
  }

  /**
   * Public discovery listing. Filters by business name and type in the database;
   * location lives in the JSON `address` column, so city/country are matched in
   * memory. Verified practices surface first, then most recently joined.
   */
  async findAll(query: ProviderQuery = {}) {
    const where: Prisma.ProviderWhereInput = {};
    if (query.q?.trim()) {
      where.businessName = { contains: query.q.trim(), mode: 'insensitive' };
    }
    if (query.type) where.type = query.type;

    const providers = await this.prisma.provider.findMany({
      where,
      include: { _count: PUBLIC_COUNTS },
      orderBy: { createdAt: 'desc' },
    });

    const locationNeedle = [query.city, query.country]
      .filter((v): v is string => Boolean(v && v.trim()))
      .map((v) => v.trim().toLowerCase());

    const filtered = locationNeedle.length
      ? providers.filter((p) => {
          const haystack = addressText(p.address);
          return locationNeedle.every((needle) => haystack.includes(needle));
        })
      : providers;

    const verifiedRank = (status: string) => (status === 'verified' ? 0 : 1);
    return filtered.sort((a, b) => verifiedRank(a.verificationStatus) - verifiedRank(b.verificationStatus));
  }

  async findOne(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
      include: { _count: PUBLIC_COUNTS },
    });
  }

  /** Public practice profile — /practice/:slug */
  async findBySlug(slug: string) {
    const normalized = slug.trim().toLowerCase();
    const provider = await this.prisma.provider.findFirst({
      where: { slug: normalized },
      include: { _count: PUBLIC_COUNTS },
    });
    if (!provider) throw new NotFoundException('Practice not found');
    return provider;
  }

  async updateProvider(id: string, data: UpdateProviderDto) {
    return this.prisma.provider.update({
      where: { id },
      data: {
        businessName: data.businessName,
        type: data.type,
        timezone: data.timezone,
        listingTier: data.listingTier,
        registrationNumber: data.registrationNumber === undefined ? undefined : data.registrationNumber,
        licenceNumber: data.licenceNumber === undefined ? undefined : data.licenceNumber,
        brandProfile: data.brandProfile as Prisma.InputJsonValue | undefined,
        address: data.address as Prisma.InputJsonValue | undefined,
        healthAuthorities:
          data.healthAuthorities === undefined
            ? undefined
            : (data.healthAuthorities as Prisma.InputJsonValue),
      },
      include: { _count: PUBLIC_COUNTS },
    });
  }
}
