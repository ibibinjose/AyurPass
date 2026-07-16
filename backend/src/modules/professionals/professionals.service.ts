import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from '../../dtos/professional.dto';
import { slugifyName, withSlugSuffix } from '../../common/slug';

const PROVIDER_PUBLIC = {
  select: {
    id: true,
    code: true,
    businessName: true,
    type: true,
    verificationStatus: true,
    listingTier: true,
    brandProfile: true,
    address: true,
  },
} as const;

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  private async uniqueSlug(name: string, excludeId?: string): Promise<string> {
    const base = slugifyName(name) || 'practitioner';
    let n = 0;
    while (true) {
      const slug = n === 0 ? base : withSlugSuffix(base, n);
      const hit = await this.prisma.professional.findFirst({
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

  async createProfessional(data: CreateProfessionalDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
      select: { fullName: true },
    });
    const slug = await this.uniqueSlug(user?.fullName ?? data.title ?? 'practitioner');
    return this.prisma.professional.create({
      data: { ...data, slug },
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
      include: {
        user: true,
        provider: PROVIDER_PUBLIC,
      },
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

  /** Public practitioner profile — /me/:slug */
  async findBySlug(slug: string) {
    const normalized = slug.trim().toLowerCase();
    const professional = await this.prisma.professional.findFirst({
      where: { slug: normalized },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        provider: PROVIDER_PUBLIC,
        services: {
          orderBy: { createdAt: 'desc' },
          include: {
            provider: {
              select: {
                id: true,
                code: true,
                businessName: true,
                type: true,
                verificationStatus: true,
                brandProfile: true,
              },
            },
          },
        },
      },
    });
    if (!professional) throw new NotFoundException('Practitioner not found');
    return professional;
  }

  async updateProfessional(id: string, data: UpdateProfessionalDto) {
    return this.prisma.professional.update({
      where: { id },
      data,
      include: { user: true },
    });
  }
}