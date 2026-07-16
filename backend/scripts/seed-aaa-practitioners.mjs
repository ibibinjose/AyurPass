#!/usr/bin/env node
/**
 * Idempotent seed: AAA practitioner directory → AyurPass professionals.
 * Requires backend/data/aaa-practitioners.json (run scrape-aaa-practitioners.mjs first).
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '../data/aaa-practitioners.json');
const SOURCE_TAG = 'aaa';

const prisma = new PrismaClient();

function loadData() {
  if (!existsSync(DATA_PATH)) {
    throw new Error(`Missing ${DATA_PATH}. Run: node backend/scripts/scrape-aaa-practitioners.mjs`);
  }
  return JSON.parse(readFileSync(DATA_PATH, 'utf8')).practitioners;
}

function importEmail(p) {
  const email = p.email?.trim().toLowerCase();
  if (email && email.includes('@')) return email;
  return `aaa-profile-${p.id}@directory.ayurpass.local`;
}

function membershipTags(membership) {
  const tags = ['Ayurveda', 'Australia'];
  if (membership) tags.push(membership);
  return tags;
}

async function loadExistingByProfileId() {
  const rows = await prisma.professional.findMany({
    where: {
      verificationDocuments: { path: ['source'], equals: SOURCE_TAG },
    },
    select: { id: true, verificationDocuments: true, userId: true, providerId: true },
  });
  const map = new Map();
  for (const r of rows) {
    const id = r.verificationDocuments?.externalProfileId;
    if (id != null) map.set(id, r);
  }
  return map;
}

async function upsertPractitioner(p, existingById) {
  const existing = existingById.get(p.id);
  let email = importEmail(p);
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
  const listingNote =
    'Listed via the Australian Association of Ayurveda (AAA) public directory.';
  const brandProfile = {
    about: about ? `${about}\n\n— ${listingNote}` : listingNote,
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
      data: {
        fullName: p.name,
        phone: p.phone || undefined,
        avatarUrl: p.imageUrl || undefined,
      },
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
      email = `aaa-profile-${p.id}@directory.ayurpass.local`;
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

  const provider = await prisma.provider.create({
    data: {
      userId: user.id,
      businessName: `${p.name} — Ayurveda`,
      type: 'AYURVEDA_CLINIC',
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

const practitioners = loadData();
const existingById = await loadExistingByProfileId();
let created = 0;
let updated = 0;

for (const p of practitioners) {
  const result = await upsertPractitioner(p, existingById);
  if (result === 'created') created++;
  else updated++;
}

console.log(`✔ AAA practitioners: ${created} created, ${updated} updated (${practitioners.length} total)`);
await prisma.$disconnect();