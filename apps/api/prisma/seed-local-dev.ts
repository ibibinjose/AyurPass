/**
 * Local-only demo users for development.
 *
 * NEVER run against production. Aborts if DATABASE_URL looks like RDS/prod.
 *
 *   cd apps/api && npx ts-node --transpile-only prisma/seed-local-dev.ts
 *   # or from monorepo root:
 *   npm run seed:local
 *
 * Credentials (password for both):
 *   seeker@local.ayurpass.dev  / LocalDev!23456
 *   provider@local.ayurpass.dev / LocalDev!23456
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEEKER_EMAIL = 'seeker@local.ayurpass.dev';
const PROVIDER_EMAIL = 'provider@local.ayurpass.dev';
const PASSWORD = 'LocalDev!23456';

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL || '';
  const blocked = [
    'rds.amazonaws.com',
    'ayurpass-db',
    'amazonaws.com',
    'neon.tech',
    'supabase.co',
    'railway.app',
  ];
  const lower = url.toLowerCase();
  if (blocked.some((b) => lower.includes(b))) {
    throw new Error(
      'Refusing to seed: DATABASE_URL looks like a remote/production database. Use local Postgres only.',
    );
  }
  if (process.env.NODE_ENV === 'production' || process.env.AYURPASS_STRICT === '1') {
    throw new Error('Refusing to seed in production / strict mode.');
  }
}

async function upsertUser(opts: {
  email: string;
  fullName: string;
  role: 'CONSUMER' | 'PROVIDER_ADMIN';
  passwordHash: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash: opts.passwordHash,
        fullName: opts.fullName,
        role: opts.role,
        emailVerifiedAt: new Date(),
      },
    });
    return existing.id;
  }
  const user = await prisma.user.create({
    data: {
      email: opts.email,
      fullName: opts.fullName,
      role: opts.role,
      passwordHash: opts.passwordHash,
      emailVerifiedAt: new Date(),
    },
  });
  return user.id;
}

async function main() {
  assertLocalDatabase();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const seekerId = await upsertUser({
    email: SEEKER_EMAIL,
    fullName: 'Local Seeker',
    role: 'CONSUMER',
    passwordHash,
  });
  await prisma.consumer.upsert({
    where: { userId: seekerId },
    create: {
      userId: seekerId,
      preferences: { location: { city: 'Melbourne', country: 'Australia' } },
      prakritiScores: {},
    },
    update: {},
  });
  await prisma.loyaltyAccount.upsert({
    where: { consumerId: seekerId },
    create: {
      consumerId: seekerId,
      pointsBalance: 250,
      lifetimePoints: 250,
    },
    update: {},
  });
  await prisma.wellnessPass.upsert({
    where: { consumerId: seekerId },
    create: {
      consumerId: seekerId,
      holderName: 'Local Seeker',
      status: 'ACTIVE',
    },
    update: { holderName: 'Local Seeker', status: 'ACTIVE' },
  });

  const providerId = await upsertUser({
    email: PROVIDER_EMAIL,
    fullName: 'Local Practice Owner',
    role: 'PROVIDER_ADMIN',
    passwordHash,
  });

  let provider = await prisma.provider.findFirst({ where: { userId: providerId } });
  if (!provider) {
    provider = await prisma.provider.create({
      data: {
        userId: providerId,
        businessName: 'Local Wellness Studio',
        type: 'HYBRID',
        listingTier: 'BOOKING',
        verificationStatus: 'verified',
        currency: 'AUD',
        slug: 'local-wellness-studio',
        address: {
          city: 'Melbourne',
          country: 'Australia',
          street: '100 Demo Street',
        },
        brandProfile: {
          about: 'Local development demo practice. Safe to edit.',
          tags: ['ayurveda', 'yoga', 'demo'],
        },
      },
    });
  }

  const pro = await prisma.professional.findFirst({ where: { userId: providerId } });
  if (!pro) {
    await prisma.professional.create({
      data: {
        userId: providerId,
        providerId: provider.id,
        title: 'Founder',
        specializations: ['Ayurveda', 'Yoga'],
      },
    });
  }

  const staff = await prisma.providerStaff.findFirst({
    where: { providerId: provider.id, userId: providerId },
  });
  if (!staff) {
    await prisma.providerStaff.create({
      data: {
        providerId: provider.id,
        userId: providerId,
        role: 'OWNER',
        inviteStatus: 'ACCEPTED',
        acceptedAt: new Date(),
        displayName: 'Local Practice Owner',
      },
    });
  }

  // Demo bookable sessions (Ayurvedic therapies + cooking)
  const demoServices: {
    category: 'AYURVEDA' | 'COOKING' | 'SPA';
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
  }[] = [
    {
      category: 'AYURVEDA',
      name: 'Abhyanga',
      description:
        'Full body Ayurvedic oil massage. Supports chronic pain, stress and insomnia.',
      durationMinutes: 60,
      price: 120,
    },
    {
      category: 'AYURVEDA',
      name: 'Shirodhara',
      description:
        'Warm oil forehead pour. Supports anxiety and stress, migraines and headaches, insomnia.',
      durationMinutes: 45,
      price: 95,
    },
    {
      category: 'AYURVEDA',
      name: 'Panchakarma – Detox',
      description:
        'Ayurvedic detox cleanse programme introduction. Supports gastritis, IBS and fatty liver care pathways.',
      durationMinutes: 90,
      price: 180,
    },
    {
      category: 'AYURVEDA',
      name: 'Nasya',
      description: 'Ayurveda Nasya treatment for sinusitis, allergies and head congestion.',
      durationMinutes: 30,
      price: 75,
    },
    {
      category: 'SPA',
      name: 'Full Body Massage',
      description: 'Relaxing full body massage with optional Champi (head massage).',
      durationMinutes: 60,
      price: 110,
    },
    {
      category: 'COOKING',
      name: 'Demo Ayurvedic Cooking Class',
      description: 'Local-only demo cooking class for calendar and booking tests.',
      durationMinutes: 90,
      price: 45,
    },
  ];

  for (const s of demoServices) {
    const exists = await prisma.service.findFirst({
      where: { providerId: provider.id, name: s.name },
    });
    if (!exists) {
      await prisma.service.create({
        data: {
          providerId: provider.id,
          category: s.category,
          name: s.name,
          description: s.description,
          durationMinutes: s.durationMinutes,
          price: s.price,
          currency: 'AUD',
          isVirtual: false,
          maxParticipants: s.category === 'COOKING' ? 12 : 1,
        },
      });
    }
  }

  // Brand tags so Discover treatment filters match the practice
  await prisma.provider.update({
    where: { id: provider.id },
    data: {
      brandProfile: {
        about:
          'Local development demo practice offering Abhyanga, Shirodhara, Nasya, Panchakarma and more.',
        tags: [
          'Abhyanga',
          'Shirodhara',
          'Nasya',
          'Panchakarma',
          'Chronic Pain',
          'Anxiety and Stress',
          'Insomnia',
        ],
      },
    },
  });

  console.log('\n✅ Local dev seed complete (database is local only).\n');
  console.log('  Seeker:   ', SEEKER_EMAIL);
  console.log('  Provider: ', PROVIDER_EMAIL);
  console.log('  Password: ', PASSWORD);
  console.log('\n  Open http://localhost:3000/login\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
