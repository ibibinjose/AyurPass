import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RetreatCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRetreatDto,
  CurateRetreatDto,
  UpdateRetreatDto,
} from '../../dtos/retreat.dto';

const PROVIDER_CARD = {
  select: {
    id: true,
    code: true,
    businessName: true,
    type: true,
    verificationStatus: true,
    brandProfile: true,
  },
} as const;

export interface RetreatQuery {
  q?: string;
  category?: RetreatCategory;
  city?: string;
  country?: string;
  month?: string; // "YYYY-MM"
  maxPrice?: number;
  maxDuration?: number;
  featured?: boolean;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'retreat';
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

@Injectable()
export class RetreatsService {
  constructor(private prisma: PrismaService) {}

  /** Public directory listing — published retreats, handpicked & upcoming first. */
  async findAll(query: RetreatQuery = {}) {
    const where: Prisma.RetreatWhereInput = { status: 'published' };
    if (query.q?.trim())
      where.title = { contains: query.q.trim(), mode: 'insensitive' };
    if (query.category) where.category = query.category;
    if (query.city?.trim())
      where.city = { contains: query.city.trim(), mode: 'insensitive' };
    if (query.country?.trim())
      where.country = { contains: query.country.trim(), mode: 'insensitive' };
    if (query.featured) where.featured = true;
    if (query.maxPrice != null) where.priceFrom = { lte: query.maxPrice };
    if (query.maxDuration != null)
      where.durationDays = { lte: query.maxDuration };
    if (query.month && /^\d{4}-\d{2}$/.test(query.month)) {
      const [y, m] = query.month.split('-').map(Number);
      const start = new Date(Date.UTC(y, m - 1, 1));
      const end = new Date(Date.UTC(y, m, 1));
      where.startDate = { gte: start, lt: end };
    }

    return this.prisma.retreat.findMany({
      where,
      include: { provider: PROVIDER_CARD },
      orderBy: [{ featured: 'desc' }, { startDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findBySlug(slug: string) {
    const retreat = await this.prisma.retreat.findUnique({
      where: { slug },
      include: { provider: PROVIDER_CARD },
    });
    if (!retreat) throw new NotFoundException('Retreat not found');
    return retreat;
  }

  /** Published retreats for a given provider — shown on their public profile. */
  findByProvider(providerId: string) {
    return this.prisma.retreat.findMany({
      where: { providerId, status: 'published' },
      include: { provider: PROVIDER_CARD },
      orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /** The provider the acting user administers — resolved from the token's sub. */
  private async providerForUser(userSub: string) {
    return this.prisma.provider.findFirst({
      where: {
        OR: [
          { userId: userSub },
          { professionals: { some: { userId: userSub } } },
        ],
      },
      select: { id: true },
    });
  }

  /** All retreats the acting provider owns (any status), for their dashboard. */
  async listMine(userSub: string) {
    const provider = await this.providerForUser(userSub);
    if (!provider) return [];
    return this.prisma.retreat.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async uniqueSlug(title: string): Promise<string> {
    const base = slugify(title);
    for (let i = 0; i < 5; i++) {
      const slug = i === 0 ? base : `${base}-${randomSuffix()}`;
      const exists = await this.prisma.retreat.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!exists) return slug;
    }
    return `${base}-${randomSuffix()}${randomSuffix()}`;
  }

  private toData(dto: CreateRetreatDto | UpdateRetreatDto) {
    return {
      title: dto.title,
      category: dto.category,
      summary: dto.summary,
      description: dto.description,
      city: dto.city,
      country: dto.country,
      address: dto.address as Prisma.InputJsonValue | undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      durationDays: dto.durationDays,
      priceFrom: dto.priceFrom,
      currency: dto.currency,
      capacity: dto.capacity,
      skillLevel: dto.skillLevel,
      images: dto.images as Prisma.InputJsonValue | undefined,
      highlights: dto.highlights as Prisma.InputJsonValue | undefined,
      inclusions: dto.inclusions as Prisma.InputJsonValue | undefined,
      externalBookingUrl: dto.externalBookingUrl,
      status: dto.status,
    };
  }

  async create(userSub: string, dto: CreateRetreatDto) {
    const provider = await this.providerForUser(userSub);
    if (!provider)
      throw new ForbiddenException('Only providers can create retreats');
    return this.prisma.retreat.create({
      data: {
        ...this.toData(dto),
        title: dto.title,
        category: dto.category,
        slug: await this.uniqueSlug(dto.title),
        providerId: provider.id,
      },
      include: { provider: PROVIDER_CARD },
    });
  }

  /** Ensure the acting user owns the retreat (or is a platform admin). */
  private async assertOwner(userSub: string, role: string, retreatId: string) {
    const retreat = await this.prisma.retreat.findUnique({
      where: { id: retreatId },
      select: { id: true, providerId: true },
    });
    if (!retreat) throw new NotFoundException('Retreat not found');
    if (role === 'PLATFORM_ADMIN') return retreat;
    const provider = await this.providerForUser(userSub);
    if (!provider || provider.id !== retreat.providerId) {
      throw new ForbiddenException('You can only manage your own retreats');
    }
    return retreat;
  }

  async update(
    userSub: string,
    role: string,
    id: string,
    dto: UpdateRetreatDto,
  ) {
    await this.assertOwner(userSub, role, id);
    return this.prisma.retreat.update({
      where: { id },
      data: this.toData(dto),
      include: { provider: PROVIDER_CARD },
    });
  }

  async remove(userSub: string, role: string, id: string) {
    await this.assertOwner(userSub, role, id);
    return this.prisma.retreat.delete({ where: { id } });
  }

  /** Platform-admin "handpick" + verification. */
  async curate(id: string, dto: CurateRetreatDto) {
    const exists = await this.prisma.retreat.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Retreat not found');
    return this.prisma.retreat.update({
      where: { id },
      data: {
        featured: dto.featured,
        verificationStatus: dto.verificationStatus,
      },
      include: { provider: PROVIDER_CARD },
    });
  }
}
