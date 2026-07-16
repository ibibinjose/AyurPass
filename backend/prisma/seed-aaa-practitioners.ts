/**
 * Idempotent seed: Australian Association of Ayurveda (AAA) public directory.
 * Data scraped from https://www.ayurved.org.au/find-a-practitioner (69 practitioners).
 *
 * Run scrape first (or use committed JSON):
 *   node backend/scripts/scrape-aaa-practitioners.mjs
 *   npx ts-node backend/prisma/seed-aaa-practitioners.ts
 */
import { PrismaClient, ProviderType, Role } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const prisma = new PrismaClient();

const DATA_PATH = resolve(__dirname, '../data/aaa-practitioners.json');
const SOURCE_TAG = 'aaa';

interface AaaPractitioner {
  id: number;
  name: string;
  city?: string;
  state?: string;
  street?: string;
  postcode?: string;
  email?: string;
  phone?: string;
  description?: string;
  bio?: string;
  membership?: string;
  imageUrl?: string | null;
  profileUrl?: string;
}

function loadData(): AaaPractitioner[] {
  if (!existsSync(DATA_PATH)) {
    throw new Error(
      `Missing ${DATA_PATH}. Run: node backend/scripts/scrape-aaa-practitioners.mjs`,
    );
  }
  const raw = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  return raw.practitioners as AaaPractitioner[];
}

function importEmail(p: AaaPractitioner): string {
  const email = p.email?.trim().toLowerCase();
  if (email && email.includes('@')) return email;
  return `aaa-profile-${p.id}@directory.ayurpass.local`;
}

function membershipTags(membership?: string): string[] {
  const tags = ['Ayurveda', 'Australia'];
  if (membership) tags.push(membership);
  return tags;
}

async function findExisting(externalProfileId: number) {
  const rows = await prisma.professional.findMany({
    where: {
      verificationDocuments: {
        path: ['source'],
        equals: SOURCE_TAG,
      },
    },
    select: { id: true, verificationDocuments: true, userId: true, providerId: true },
  });
  return rows.find((r) => {
    const doc = r.verificationDocuments as { externalProfileId?: number } | null;
    return doc?.externalProfileId === externalProfileId;
  });
}

async function upsertPractitioner(p: AaaPractitioner) {
  const existing = await findExisting(p.id);
  const email = importEmail(p);
  const about = [p.description, p.bio].filter(Boolean).join('\n\n').trim() || undefined;
  const verificationDocuments = {
    source: SOURCE_TAG,
    externalProfileId: p.id,
    profileUrl: p.profileUrl ?? `https://www.ayurved.org.au/profile/${p.id}`,
    membership: p.membership ?? null,
    importedAt: new Date().toISOString(),
  };
  const address = {
    street: p.street || undefined,
    city: p.city || undefined,
    state: p.state || undefined,
    postcode: p.postcode || undefined,
    country: 'Australia',
  };
  const brandProfile = {
    about,
    contactEmail: p.email || undefined,
    contactPhone: p.phone || undefined,
    website: verificationDocuments.profileUrl,
    externalBookingUrl: verificationDocuments.profileUrl,
    logoUrl: p.imageUrl || undefined,
    tags: membershipTags(p.membership),
  };

  if (existing) {
    await prisma.user.update({
      where: { id: existing.userId },
      data: { fullName: p.name, phone: p.phone || undefined, avatarUrl: p.imageUrl || undefined },
    });
    await prisma.provider.update({
      where: { id: existing.providerId },
      data: {
        businessName: `${p.name} — Ayurveda`,
        address,
        brandProfile,
        verificationStatus: 'verified',
        listingTier: 'FREE_LISTING',
      },
    });
    await prisma.professional.update({
      where: { id: existing.id },
      data: {
        title: p.membership ?? 'Ayurvedic Practitioner',
        bio: about,
        specializations: ['Ayurveda'],
        verificationDocuments,
      },
    });
    return 'updated';
  }

  const user = await prisma.user.create({
    data: {
      email,
      fullName: p.name,
      phone: p.phone || undefined,
      avatarUrl: p.imageUrl || undefined,
      role: Role.PROFESSIONAL,
    },
  });

  const provider = await prisma.provider.create({
    data: {
      userId: user.id,
      businessName: `${p.name} — Ayurveda`,
      type: ProviderType.AYURVEDA_CLINIC,
      listingTier: 'FREE_LISTING',
      verificationStatus: 'verified',
      timezone: 'Australia/Sydney',
      address,
      brandProfile,
    },
  });

  await prisma.professional.create({
    data: {
      userId: user.id,
      providerId: provider.id,
      title: p.membership ?? 'Ayurvedic Practitioner',
      bio: about,
      specializations: ['Ayurveda'],
      verificationDocuments,
    },
  });

  return 'created';
}

async function main() {
  const practitioners = loadData();
  let created = 0;
  let updated = 0;

  for (const p of practitioners) {
    const result = await upsertPractitioner(p);
    if (result === 'created') created++;
    else updated++;
  }

  console.log(
    `✔ AAA practitioners: ${created} created, ${updated} updated (${practitioners.length} total in JSON)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());