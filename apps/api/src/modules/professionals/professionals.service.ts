import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from '../../dtos/professional.dto';
import { slugifyPublicName, withSlugSuffix } from '../../common/slug';
import {
  assertHandle,
  HANDLE_NAMESPACES,
  isReservedRoot,
  normalizeHandle,
  TITLE_KINDS,
  TITLE_TO_NAMESPACE,
} from '../../common/handles';


const PLACEHOLDER_EMAIL_DOMAIN = '@directory.ayurpass.local';

function redactPublicUser<T extends { email?: string | null } | null | undefined>(user: T): T {
  if (!user || typeof user !== 'object') return user;
  const email = user.email;
  if (typeof email === 'string' && email.toLowerCase().endsWith(PLACEHOLDER_EMAIL_DOMAIN)) {
    return { ...user, email: null };
  }
  return user;
}

function redactProfessionalRow<T extends { user?: { email?: string | null } | null; provider?: { brandProfile?: unknown } | null }>(row: T): T {
  const next = { ...row, user: redactPublicUser(row.user) };
  const brand = next.provider?.brandProfile;
  if (brand && typeof brand === 'object' && !Array.isArray(brand)) {
    const bp = { ...(brand as Record<string, unknown>) };
    const ce = bp.contactEmail;
    if (typeof ce === 'string' && ce.toLowerCase().endsWith(PLACEHOLDER_EMAIL_DOMAIN)) {
      delete bp.contactEmail;
      next.provider = { ...next.provider!, brandProfile: bp };
    }
  }
  return next;
}

const PROVIDER_PUBLIC = {
  select: {
    id: true,
    code: true,
    slug: true,
    vanityHandle: true,
    vanityStatus: true,
    businessName: true,
    type: true,
    verificationStatus: true,
    listingTier: true,
    brandProfile: true,
    address: true,
    registrationNumber: true,
    licenceNumber: true,
    healthAuthorities: true,
  },
} as const;

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  private async uniqueSlug(name: string, excludeId?: string): Promise<string> {
    const base = slugifyPublicName(name, 'practitioner');
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
      include: { user: this.publicUser },
    });
  }

  /** Public user fields only — never expose passwordHash. */
  private readonly publicUser = {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      coverImageUrl: true,
    },
  } as const;

  async findAll() {
    const rows = await this.prisma.professional.findMany({
      include: {
        user: this.publicUser,
        provider: {
          select: {
            id: true,
            code: true,
            slug: true,
            vanityHandle: true,
            vanityStatus: true,
            businessName: true,
            type: true,
            verificationStatus: true,
            listingTier: true,
            brandProfile: true,
            address: true,
            healthAuthorities: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    });
    return rows.map((r) => redactProfessionalRow(r));
  }

  async findByProvider(providerId: string) {
    const rows = await this.prisma.professional.findMany({
      where: { providerId },
      include: {
        user: this.publicUser,
        provider: PROVIDER_PUBLIC,
      },
    });
    return rows.map((r) => redactProfessionalRow(r));
  }

  async findOne(id: string) {
    const row = await this.prisma.professional.findUnique({
      where: { id },
      include: {
        user: this.publicUser,
        services: true,
        provider: PROVIDER_PUBLIC,
      },
    });
    return row ? redactProfessionalRow(row) : row;
  }

  private readonly publicInclude = {
    user: {
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        coverImageUrl: true,
      },
    },
    provider: PROVIDER_PUBLIC,
    services: {
      orderBy: { createdAt: 'desc' as const },
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
  };

  /** Public practitioner profile — /me/:slug */
  async findBySlug(slug: string) {
    const normalized = slug.trim().toLowerCase();
    const professional = await this.prisma.professional.findFirst({
      where: {
        OR: [{ slug: normalized }, { handle: normalized }],
      },
      include: this.publicInclude,
    });
    if (!professional) throw new NotFoundException('Practitioner not found');
    return redactProfessionalRow(professional);
  }

  /** Public — /:namespace/:handle (e.g. /ayur/anita, /yoga/maya, /pro/dr-sharma) */
  async findByHandle(namespace: string, handle: string) {
    const ns = namespace.trim().toLowerCase();
    const h = normalizeHandle(handle);
    if (!HANDLE_NAMESPACES.has(ns) || !h) {
      throw new NotFoundException('Practitioner not found');
    }
    const professional = await this.prisma.professional.findFirst({
      where: { handleNamespace: ns, handle: h },
      include: this.publicInclude,
    });
    if (!professional) throw new NotFoundException('Practitioner not found');
    return redactProfessionalRow(professional);
  }

  /** Public — root vanity /:handle (admin-approved only) */
  async findByVanity(handle: string) {
    const h = normalizeHandle(handle);
    if (!h || isReservedRoot(h)) throw new NotFoundException('Profile not found');
    const professional = await this.prisma.professional.findFirst({
      where: { vanityHandle: h, vanityStatus: 'approved' },
      include: this.publicInclude,
    });
    if (!professional) throw new NotFoundException('Profile not found');
    return redactProfessionalRow(professional);
  }

  async updateProfessional(id: string, data: UpdateProfessionalDto) {
    const existing = await this.prisma.professional.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Practitioner not found');

    let titleKind: string | null | undefined = undefined;
    if (data.titleKind !== undefined) {
      if (data.titleKind === null || data.titleKind === '') {
        titleKind = null;
      } else if (!TITLE_KINDS.has(data.titleKind)) {
        throw new BadRequestException('Invalid professional title kind.');
      } else {
        titleKind = data.titleKind;
      }
    }

    let handle: string | null | undefined = undefined;
    let handleNamespace: string | null | undefined = undefined;

    if (data.handle !== undefined || data.handleNamespace !== undefined || titleKind !== undefined) {
      const nextTitleKind =
        titleKind !== undefined ? titleKind : existing.titleKind;
      const suggestedNs =
        (nextTitleKind && TITLE_TO_NAMESPACE[nextTitleKind]) || 'pro';

      if (data.handle === null || data.handle === '') {
        handle = null;
        handleNamespace = null;
      } else {
        const rawHandle = data.handle ?? existing.handle;
        if (rawHandle) {
          try {
            handle = assertHandle(rawHandle);
          } catch (e) {
            throw new BadRequestException(
              e instanceof Error ? e.message : 'Invalid handle.',
            );
          }
          const nsRaw = (
            data.handleNamespace ??
            existing.handleNamespace ??
            suggestedNs
          )
            .toString()
            .toLowerCase();
          if (!HANDLE_NAMESPACES.has(nsRaw)) {
            throw new BadRequestException('Invalid handle namespace.');
          }
          handleNamespace = nsRaw;

          // Uniqueness within namespace
          const clash = await this.prisma.professional.findFirst({
            where: {
              handle,
              handleNamespace,
              NOT: { id },
            },
            select: { id: true },
          });
          if (clash) {
            throw new ConflictException(
              `The handle @${handle} is already taken in /${handleNamespace}.`,
            );
          }
        }
      }
    }

    // Root vanity request (admin must approve)
    let vanityHandle: string | null | undefined = undefined;
    let vanityStatus: string | undefined = undefined;
    let vanityRequestedAt: Date | undefined = undefined;
    let vanityReviewNote: string | null | undefined = undefined;

    if (data.vanityHandle !== undefined || data.requestVanity) {
      if (data.vanityHandle === null || data.vanityHandle === '') {
        vanityHandle = null;
        vanityStatus = 'none';
        vanityReviewNote = null;
      } else if (data.vanityHandle || data.requestVanity) {
        let h: string;
        try {
          h = assertHandle(data.vanityHandle || existing.vanityHandle || existing.handle || '');
        } catch (e) {
          throw new BadRequestException(
            e instanceof Error ? e.message : 'Invalid vanity handle.',
          );
        }
        if (isReservedRoot(h)) {
          throw new BadRequestException(
            'That username is reserved for platform use. Choose another.',
          );
        }
        // Global uniqueness across professionals + providers (approved or pending)
        const [proClash, providerClash] = await Promise.all([
          this.prisma.professional.findFirst({
            where: {
              vanityHandle: h,
              vanityStatus: { in: ['pending', 'approved'] },
              NOT: { id },
            },
            select: { id: true },
          }),
          this.prisma.provider.findFirst({
            where: {
              vanityHandle: h,
              vanityStatus: { in: ['pending', 'approved'] },
            },
            select: { id: true },
          }),
        ]);
        if (proClash || providerClash) {
          throw new ConflictException(
            `The root username @${h} is already claimed or pending approval.`,
          );
        }
        vanityHandle = h;
        if (data.requestVanity || existing.vanityStatus !== 'approved') {
          vanityStatus = 'pending';
          vanityRequestedAt = new Date();
          vanityReviewNote = null;
        }
      }
    }

    // Keep legacy slug in sync with handle for /me/:slug redirects
    const slug =
      handle !== undefined
        ? handle || (await this.uniqueSlug(existing.title || 'practitioner', id))
        : undefined;

    try {
      return await this.prisma.professional.update({
        where: { id },
        data: {
          title: data.title,
          titleKind,
          handle,
          handleNamespace,
          slug,
          vanityHandle,
          vanityStatus,
          vanityRequestedAt,
          vanityReviewNote,
          specializations: data.specializations,
          doshaExpertise: data.doshaExpertise,
          bio: data.bio,
          certifications: data.certifications,
          yearsExperience: data.yearsExperience,
          hourlyRate: data.hourlyRate,
          availabilityPreferences: data.availabilityPreferences,
          verificationDocuments: data.verificationDocuments,
          registrationNumber:
            data.registrationNumber === undefined ? undefined : data.registrationNumber,
          licenceNumber: data.licenceNumber === undefined ? undefined : data.licenceNumber,
          healthAuthorities:
            data.healthAuthorities === undefined
              ? undefined
              : (data.healthAuthorities as Prisma.InputJsonValue),
        },
        include: { user: this.publicUser, provider: PROVIDER_PUBLIC },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('That handle is already taken.');
      }
      throw e;
    }
  }

  /**
   * Remove practitioner from a practice: detach bookings/services, then delete profile.
   * The user account remains (they can be re-added later).
   */
  async removeFromPractice(id: string) {
    await this.prisma.$transaction([
      this.prisma.booking.updateMany({
        where: { professionalId: id },
        data: { professionalId: null },
      }),
      this.prisma.service.updateMany({
        where: { professionalId: id },
        data: { professionalId: null },
      }),
      this.prisma.professional.delete({ where: { id } }),
    ]);
    return { id, removed: true };
  }
}