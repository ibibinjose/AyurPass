import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProviderType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';
import { slugifyPublicName, withSlugSuffix } from '../../common/slug';
import {
  assertHandle,
  isReservedRoot,
} from '../../common/handles';
import { CacheService } from '../cache/cache.service';

const PUBLIC_COUNTS = {
  select: { professionals: true, services: true, products: true, packages: true, rooms: true },
} as const;

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

const PROFESSIONAL_PROVIDER_PUBLIC = {
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
} as const;

const SERVICE_PUBLIC_INCLUDES = {
  provider: PROVIDER_CARD,
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

const PROFESSIONAL_PUBLIC_INCLUDES = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
    },
  },
  provider: PROFESSIONAL_PROVIDER_PUBLIC,
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

function asObject(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

/**
 * Soft-clean URL strings.
 * - null / "" → null (explicit clear, so merge can drop the field)
 * - missing / wrong type → undefined (leave existing value alone)
 */
function cleanUrl(v: unknown): string | null | undefined {
  if (v === null) return null;
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  if (!t) return null;
  if (t.length > 2048) throw new BadRequestException('URL is too long.');
  // Allow relative paths for internal CTAs and local uploads (/uploads/…).
  if (t.startsWith('/')) return t;
  try {
     
    new URL(t);
    return t;
  } catch {
    throw new BadRequestException(`Invalid URL: ${t.slice(0, 48)}`);
  }
}

function cleanStringList(v: unknown, max = 20): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return Array.from(
    new Set(
      v
        .filter((x): x is string => typeof x === 'string')
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  ).slice(0, max);
}

function sanitizeBrandProfile(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (typeof input.about === 'string') out.about = input.about.trim().slice(0, 4000);
  if (typeof input.contactEmail === 'string') out.contactEmail = input.contactEmail.trim().slice(0, 200);
  if (typeof input.contactPhone === 'string') out.contactPhone = input.contactPhone.trim().slice(0, 60);
  if (typeof input.openingHours === 'string') out.openingHours = input.openingHours.trim().slice(0, 200);
  if (input.website !== undefined) out.website = cleanUrl(input.website);
  if (input.logoUrl !== undefined) out.logoUrl = cleanUrl(input.logoUrl);
  if (input.coverImageUrl !== undefined) out.coverImageUrl = cleanUrl(input.coverImageUrl);
  if (input.externalBookingUrl !== undefined) out.externalBookingUrl = cleanUrl(input.externalBookingUrl);
  if (input.priceBand !== undefined) {
    const pb = String(input.priceBand);
    out.priceBand = ['$', '$$', '$$$', '$$$$'].includes(pb) ? pb : undefined;
  }
  const tags = cleanStringList(input.tags, 24);
  if (tags) out.tags = tags;
  const amenities = cleanStringList(input.amenities, 24);
  if (amenities) out.amenities = amenities;
  const gallery = cleanStringList(input.gallery, 24)
    ?.map((u) => cleanUrl(u))
    .filter((u): u is string => Boolean(u));
  if (gallery) out.gallery = gallery;
  if (input.socialLinks && typeof input.socialLinks === 'object' && !Array.isArray(input.socialLinks)) {
    const s = input.socialLinks as Record<string, unknown>;
    const knownKeys = [
      'instagram',
      'facebook',
      'youtube',
      'x',
      'linkedin',
      'tiktok',
      'threads',
      'whatsapp',
      'pinterest',
      'google',
      'tripadvisor',
      'yelp',
    ] as const;
    const social: Record<string, unknown> = {};
    for (const key of knownKeys) {
      if (s[key] !== undefined) {
        const cleaned = cleanUrl(s[key]);
        if (cleaned) social[key] = cleaned;
      }
    }
    if (Array.isArray(s.custom)) {
      social.custom = s.custom
        .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'))
        .map((row) => ({
          label: String(row.label ?? 'Link').trim().slice(0, 40) || 'Link',
          url: cleanUrl(row.url),
        }))
        .filter((row) => Boolean(row.url))
        .slice(0, 12);
    }
    out.socialLinks = social;
  }
  return out;
}

/** Drop nullish media fields so cleared logo/cover actually disappear from JSON. */
function pruneBrandProfile(profile: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(profile)) {
    if (v === null || v === undefined || v === '') continue;
    out[k] = v;
  }
  return out;
}

function sanitizeAddress(input: Record<string, unknown>): Record<string, string> {
  const keys = ['street', 'city', 'state', 'postcode', 'country'] as const;
  const out: Record<string, string> = {};
  for (const k of keys) {
    if (typeof input[k] === 'string') out[k] = (input[k] as string).trim().slice(0, 120);
  }
  return out;
}

@Injectable()
export class ProvidersService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  private async invalidateCache() {
    await this.cache.delByPrefix('cache:providers:');
  }

  async uniqueSlug(businessName: string, excludeId?: string): Promise<string> {
    const base = slugifyPublicName(businessName, 'practice');
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
    const cacheKey = `cache:providers:${JSON.stringify(query)}`;
    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

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

    const locationNeedles = [query.city, query.country]
      .filter((v): v is string => Boolean(v && v.trim()))
      .map((v) => v.trim().toLowerCase());

    const countryNeedle = query.country?.trim().toLowerCase();
    const cityNeedle = query.city?.trim().toLowerCase();

    const locationScore = (p: (typeof providers)[number]) => {
      const haystack = addressText(p.address);
      if (cityNeedle && haystack.includes(cityNeedle)) return 0; // City match top priority
      if (countryNeedle && haystack.includes(countryNeedle)) return 1; // Country match
      if (locationNeedles.some((n) => haystack.includes(n))) return 2;
      return 3; // Foreign / non-matching
    };

    const verifiedRank = (status: string) => (status === 'verified' ? 0 : 1);

    const sorted = providers.sort((a, b) => {
      const locDiff = locationScore(a) - locationScore(b);
      if (locDiff !== 0) return locDiff;
      return verifiedRank(a.verificationStatus) - verifiedRank(b.verificationStatus);
    });

    await this.cache.set(cacheKey, sorted, 60);
    return sorted;
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

  /**
   * Public profile bundle for practice pages. Keeps SSR, metadata, and the
   * interactive client on one contract instead of making the browser waterfall
   * provider -> services -> products -> retreats -> team.
   */
  async findProfileBundleById(id: string) {
    const provider = await this.findOne(id);
    if (!provider) throw new NotFoundException('Practice not found');
    return this.profileBundle(provider);
  }

  async findProfileBundleBySlug(slug: string) {
    const provider = await this.findBySlug(slug);
    return this.profileBundle(provider);
  }

  async findProfileBundleByVanity(handle: string) {
    const provider = await this.findByVanity(handle);
    return this.profileBundle(provider);
  }

  private async profileBundle(provider: NonNullable<Awaited<ReturnType<ProvidersService['findOne']>>>) {
    const [services, products, retreats, team] = await Promise.all([
      this.prisma.service.findMany({
        where: { providerId: provider.id },
        include: SERVICE_PUBLIC_INCLUDES,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.findMany({
        where: { providerId: provider.id },
        include: { provider: PROVIDER_CARD },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.retreat.findMany({
        where: { providerId: provider.id, status: 'published' },
        include: { provider: PROVIDER_CARD },
        orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.professional.findMany({
        where: { providerId: provider.id },
        include: PROFESSIONAL_PUBLIC_INCLUDES,
        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      }),
    ]);

    return { provider, services, products, retreats, team };
  }

  async updateProvider(id: string, data: UpdateProviderDto) {
    const existing = await this.prisma.provider.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Practice not found');

    const businessName =
      typeof data.businessName === 'string' && data.businessName.trim()
        ? data.businessName.trim().slice(0, 160)
        : undefined;

    // Keep public URL in sync when the practice renames.
    let slug: string | undefined;
    if (businessName && businessName !== existing.businessName) {
      slug = await this.uniqueSlug(businessName, id);
    }

    let brandProfile: Prisma.InputJsonValue | undefined;
    if (data.brandProfile !== undefined) {
      const merged = pruneBrandProfile({
        ...asObject(existing.brandProfile),
        ...sanitizeBrandProfile(data.brandProfile as Record<string, unknown>),
      });
      brandProfile = merged as Prisma.InputJsonValue;
    }

    let address: Prisma.InputJsonValue | undefined;
    if (data.address !== undefined) {
      const merged = {
        ...asObject(existing.address),
        ...sanitizeAddress(data.address as Record<string, unknown>),
      };
      address = merged as Prisma.InputJsonValue;
    }

    let healthAuthorities: Prisma.InputJsonValue | undefined;
    if (data.healthAuthorities !== undefined) {
      if (!Array.isArray(data.healthAuthorities)) {
        throw new BadRequestException('healthAuthorities must be an array.');
      }
      healthAuthorities = data.healthAuthorities
        .filter((a) => a && typeof a === 'object')
        .map((a) => {
          const row = a as Record<string, unknown>;
          const code = String(row.code ?? '').trim().slice(0, 32);
          if (!code) return null;
          return {
            code,
            name: String(row.name ?? code).trim().slice(0, 120),
            region: row.region ? String(row.region).trim().slice(0, 16) : undefined,
            registrationNumber: row.registrationNumber
              ? String(row.registrationNumber).trim().slice(0, 80)
              : undefined,
            profileUrl: row.profileUrl ? cleanUrl(row.profileUrl) : undefined,
            verified: Boolean(row.verified),
          };
        })
        .filter(Boolean) as Prisma.InputJsonValue;
    }

    // Root vanity — live at ayurpass.com/:handle only after platform admin approval.
    let vanityHandle: string | null | undefined = undefined;
    let vanityStatus: string | undefined = undefined;
    let vanityRequestedAt: Date | null | undefined = undefined;
    let vanityReviewedAt: Date | null | undefined = undefined;
    let vanityReviewNote: string | null | undefined = undefined;

    if (data.vanityHandle !== undefined || data.requestVanity) {
      if (data.vanityHandle === null || data.vanityHandle === '') {
        vanityHandle = null;
        vanityStatus = 'none';
        vanityRequestedAt = null;
        vanityReviewedAt = null;
        vanityReviewNote = null;
      } else {
        let h: string;
        try {
          h = assertHandle(data.vanityHandle || existing.vanityHandle || '');
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
        const [proClash, providerClash] = await Promise.all([
          this.prisma.professional.findFirst({
            where: {
              vanityHandle: h,
              vanityStatus: { in: ['pending', 'approved'] },
            },
            select: { id: true },
          }),
          this.prisma.provider.findFirst({
            where: {
              vanityHandle: h,
              vanityStatus: { in: ['pending', 'approved'] },
              NOT: { id },
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
        const sameAsApproved =
          existing.vanityStatus === 'approved' &&
          existing.vanityHandle === h &&
          !data.requestVanity;
        if (sameAsApproved) {
          // Keep live handle — no re-review when saving other profile fields.
          vanityStatus = 'approved';
        } else {
          // New or changed handle, or explicit re-request → admin queue.
          vanityStatus = 'pending';
          vanityRequestedAt = new Date();
          vanityReviewedAt = null;
          vanityReviewNote = null;
        }
      }
    }

    try {
      const res = await this.prisma.provider.update({
        where: { id },
        data: {
          businessName,
          type: data.type,
          timezone: data.timezone?.trim().slice(0, 64),
          currency: data.currency?.trim().toUpperCase().slice(0, 3),
          listingTier: data.listingTier,
          slug,
          vanityHandle,
          vanityStatus,
          vanityRequestedAt,
          vanityReviewedAt,
          vanityReviewNote,
          registrationNumber:
            data.registrationNumber === undefined ? undefined : data.registrationNumber,
          licenceNumber: data.licenceNumber === undefined ? undefined : data.licenceNumber,
          brandProfile,
          address,
          healthAuthorities,
        },
        include: { _count: PUBLIC_COUNTS },
      });
      await this.invalidateCache();
      return res;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('That vanity handle is already taken.');
      }
      throw e;
    }
  }

  /** Public — root vanity for practices (admin-approved). */
  async findByVanity(handle: string) {
    const h = handle.trim().toLowerCase();
    if (!h || isReservedRoot(h)) throw new NotFoundException('Practice not found');
    const provider = await this.prisma.provider.findFirst({
      where: { vanityHandle: h, vanityStatus: 'approved' },
      include: { _count: PUBLIC_COUNTS },
    });
    if (!provider) throw new NotFoundException('Practice not found');
    return provider;
  }
}
