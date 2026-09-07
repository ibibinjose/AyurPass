#!/usr/bin/env node
/**
 * Production-safe, idempotent importer: AAA public directory → claimable
 * unclaimed AyurPass practitioner (+ minimal practice shell) profiles.
 *
 * Idempotent by verificationDocuments.source === "aaa" + externalProfileId.
 *
 * Usage (staging / local):
 *   DATABASE_URL=... node apps/api/scripts/import-aaa-practitioners.mjs
 *
 * Usage (production-looking DATABASE_URL):
 *   DATABASE_URL=... node apps/api/scripts/import-aaa-practitioners.mjs --confirm-production
 *
 * Requires apps/api/data/aaa-practitioners.json (from scrape-aaa-practitioners.mjs).
 *
 * Safety / product rules:
 * - Does NOT set verificationStatus to "verified" (profiles stay claimable)
 * - AAA membership is attribution metadata only (never an AyurPass verified checkmark)
 * - Placeholder @directory.ayurpass.local emails are account-only, never public contact
 * - Practitioner-first; practice/provider shell is minimal (AAA has no clinic name fields)
 * - No services / no externalBookingUrl → not bookable until claimed & configured
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '../data/aaa-practitioners.json');
const SOURCE_TAG = 'aaa';
const PLACEHOLDER_EMAIL_DOMAIN = '@directory.ayurpass.local';

const args = new Set(process.argv.slice(2));
const CONFIRM_PRODUCTION = args.has('--confirm-production');
const DRY_RUN = args.has('--dry-run');

const prisma = new PrismaClient();

function looksLikeProductionDb(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.toLowerCase();
  return (
    u.includes('ayurpass-db') ||
    u.includes('rds.amazonaws.com') ||
    u.includes('/ayurpass_prod') ||
    u.includes('production') ||
    /(^|[\/._-])prod([\/._-]|$)/.test(u)
  );
}

function assertSafeDatabaseTarget() {
  const url = process.env.DATABASE_URL || '';
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  if (looksLikeProductionDb(url) && !CONFIRM_PRODUCTION) {
    console.error(
      [
        'Refusing to run: DATABASE_URL looks like production/RDS.',
        'Re-run with --confirm-production only after explicit operator approval.',
        'Example:',
        '  DATABASE_URL=... node apps/api/scripts/import-aaa-practitioners.mjs --confirm-production',
      ].join('\n'),
    );
    process.exit(2);
  }
  if (looksLikeProductionDb(url) && CONFIRM_PRODUCTION) {
    console.warn('⚠ --confirm-production set; proceeding against a production-looking DATABASE_URL');
  }
}

function loadData() {
  if (!existsSync(DATA_PATH)) {
    throw new Error(
      `Missing ${DATA_PATH}. Run: node apps/api/scripts/scrape-aaa-practitioners.mjs`,
    );
  }
  const raw = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  if (!Array.isArray(raw.practitioners)) {
    throw new Error('aaa-practitioners.json missing practitioners[]');
  }
  return raw.practitioners;
}

function realEmail(p) {
  const email = p.email?.trim().toLowerCase();
  if (email && email.includes('@') && !email.endsWith(PLACEHOLDER_EMAIL_DOMAIN)) {
    return email;
  }
  return null;
}

function accountEmail(p) {
  return realEmail(p) || `aaa-profile-${p.id}${PLACEHOLDER_EMAIL_DOMAIN}`;
}

function isPlaceholderEmail(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith(PLACEHOLDER_EMAIL_DOMAIN);
}

function membershipTags(membership) {
  const tags = ['Ayurveda', 'Australia', 'AAA directory'];
  if (membership) tags.push(membership);
  return tags;
}

function slugifyName(name) {
  return (name || 'practitioner')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function hasRealClinicFields(p) {
  // AAA scrape has no clinic/business fields today; keep gate for future scrapes.
  const clinicName =
    p.clinicName || p.practiceName || p.businessName || p.clinic || p.centreName;
  return Boolean(clinicName && String(clinicName).trim());
}

function aaaAttribution(p, profileUrl) {
  return {
    code: 'AAA',
    name: 'Australian Association of Ayurveda',
    region: 'AU',
    profileUrl,
    registrationNumber: p.membership ?? undefined,
    // Attribution only — never AyurPass platform verification
    verified: false,
  };
}

async function uniqueProfessionalSlug(base, excludeId) {
  let slug = base || 'practitioner';
  let n = 0;
  while (true) {
    const hit = await prisma.professional.findFirst({
      where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
      select: { id: true },
    });
    if (!hit) return slug;
    n += 1;
    slug = `${base}-${n}`.slice(0, 80);
  }
}

async function uniqueProviderSlug(base, excludeId) {
  let slug = base || 'practice';
  let n = 0;
  while (true) {
    const hit = await prisma.provider.findFirst({
      where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
      select: { id: true },
    });
    if (!hit) return slug;
    n += 1;
    slug = `${base}-${n}`.slice(0, 80);
  }
}

async function loadExistingByProfileId() {
  const rows = await prisma.professional.findMany({
    where: {
      verificationDocuments: { path: ['source'], equals: SOURCE_TAG },
    },
    select: {
      id: true,
      slug: true,
      providerId: true,
      verificationDocuments: true,
      userId: true,
    },
  });
  const map = new Map();
  for (const r of rows) {
    const id = r.verificationDocuments?.externalProfileId;
    if (id != null) map.set(Number(id), r);
  }
  return map;
}

function buildBrandProfile(p, profileUrl, about, clinicMode) {
  const contact = realEmail(p);
  const listingNote =
    'Listed in the AAA directory (Australian Association of Ayurveda). This profile is unclaimed on AyurPass — claim it to manage details and bookings.';
  return {
    about: about ? `${about}\n\n— ${listingNote}` : listingNote,
    // Never publish placeholder directory emails as public contact
    contactEmail: contact || undefined,
    contactPhone: p.phone || undefined,
    website: profileUrl,
    // Not bookable until claimed — do not point "Book online" at AAA
    logoUrl: p.imageUrl || undefined,
    tags: membershipTags(p.membership),
    ...(clinicMode
      ? {}
      : {
          // Practitioner-first shell: keep discovery tags clear
        }),
  };
}

async function upsertPractitioner(p, existingById) {
  const existing = existingById.get(Number(p.id));
  let email = accountEmail(p);
  const about = [p.description, p.bio].filter(Boolean).join('\n\n').trim() || undefined;
  const profileUrl = p.profileUrl ?? `https://www.ayurved.org.au/profile/${p.id}`;
  const verificationDocuments = {
    source: SOURCE_TAG,
    externalProfileId: p.id,
    profileUrl,
    membership: p.membership ?? null,
    importedAt: new Date().toISOString(),
    claimable: true,
  };
  const aaaMark = aaaAttribution(p, profileUrl);
  const clinicMode = hasRealClinicFields(p);
  const clinicName = clinicMode
    ? String(p.clinicName || p.practiceName || p.businessName || p.clinic || p.centreName).trim()
    : null;
  const businessName = clinicName || `${p.name}`;
  const address = {
    street: p.street || undefined,
    city: p.city || undefined,
    state: p.state || undefined,
    postcode: p.postcode || undefined,
    country: 'Australia',
  };
  const brandProfile = buildBrandProfile(p, profileUrl, about, clinicMode);

  if (DRY_RUN) {
    return existing ? 'would-update' : 'would-create';
  }

  if (existing) {
    const user = await prisma.user.findUnique({
      where: { id: existing.userId },
      select: { email: true },
    });
    // Keep placeholder account emails private; upgrade to real email when scrape gains one
    const userUpdate = {
      fullName: p.name,
      phone: p.phone || undefined,
      avatarUrl: p.imageUrl || undefined,
    };
    if (realEmail(p) && (!user?.email || isPlaceholderEmail(user.email))) {
      userUpdate.email = realEmail(p);
    }
    try {
      await prisma.user.update({ where: { id: existing.userId }, data: userUpdate });
    } catch (err) {
      if (err?.code === 'P2002' && userUpdate.email) {
        delete userUpdate.email;
        await prisma.user.update({ where: { id: existing.userId }, data: userUpdate });
      } else {
        throw err;
      }
    }

    const providerSlug =
      (await prisma.provider.findUnique({
        where: { id: existing.providerId },
        select: { slug: true },
      }))?.slug?.trim() ||
      (await uniqueProviderSlug(
        slugifyName(clinicMode ? businessName : `${p.name}-ayurveda`),
        existing.providerId,
      ));

    await prisma.provider.update({
      where: { id: existing.providerId },
      data: {
        slug: providerSlug,
        businessName,
        address,
        brandProfile,
        // Keep claimable — never mark imported AAA as AyurPass-verified
        verificationStatus: 'pending',
        listingTier: 'FREE_LISTING',
        healthAuthorities: [aaaMark],
      },
    });

    const slug =
      existing.slug?.trim() ||
      (await uniqueProfessionalSlug(slugifyName(p.name), existing.id));

    await prisma.professional.update({
      where: { id: existing.id },
      data: {
        slug,
        title: p.membership ?? 'Ayurvedic Practitioner',
        bio: about,
        specializations: ['Ayurveda'],
        verificationDocuments,
        healthAuthorities: [aaaMark],
      },
    });
    return 'updated';
  }

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email,
        fullName: p.name,
        phone: p.phone || undefined,
        avatarUrl: p.imageUrl || undefined,
        role: 'PROFESSIONAL',
      },
    });
  } catch (err) {
    if (err?.code === 'P2002') {
      email = `aaa-profile-${p.id}${PLACEHOLDER_EMAIL_DOMAIN}`;
      user = await prisma.user.create({
        data: {
          email,
          fullName: p.name,
          phone: p.phone || undefined,
          avatarUrl: p.imageUrl || undefined,
          role: 'PROFESSIONAL',
        },
      });
    } else {
      throw err;
    }
  }

  const providerSlug = await uniqueProviderSlug(
    slugifyName(clinicMode ? businessName : `${p.name}-ayurveda`),
  );
  const provider = await prisma.provider.create({
    data: {
      userId: user.id,
      slug: providerSlug,
      businessName,
      type: 'AYURVEDA_CLINIC',
      listingTier: 'FREE_LISTING',
      verificationStatus: 'pending',
      timezone: 'Australia/Sydney',
      address,
      brandProfile,
      healthAuthorities: [aaaMark],
    },
  });

  const slug = await uniqueProfessionalSlug(slugifyName(p.name));
  await prisma.professional.create({
    data: {
      userId: user.id,
      providerId: provider.id,
      slug,
      title: p.membership ?? 'Ayurvedic Practitioner',
      bio: about,
      specializations: ['Ayurveda'],
      verificationDocuments,
      healthAuthorities: [aaaMark],
    },
  });

  return 'created';
}

assertSafeDatabaseTarget();
const practitioners = loadData();
const existingById = await loadExistingByProfileId();
let created = 0;
let updated = 0;
let wouldCreate = 0;
let wouldUpdate = 0;

for (const p of practitioners) {
  const result = await upsertPractitioner(p, existingById);
  if (result === 'created') created += 1;
  else if (result === 'updated') updated += 1;
  else if (result === 'would-create') wouldCreate += 1;
  else if (result === 'would-update') wouldUpdate += 1;
}

if (DRY_RUN) {
  console.log(
    `DRY RUN AAA import: ${wouldCreate} would create, ${wouldUpdate} would update (${practitioners.length} total)`,
  );
} else {
  console.log(
    `✔ AAA import: ${created} created, ${updated} updated (${practitioners.length} total) — claimable, unverified, attribution-only`,
  );
}
await prisma.$disconnect();
