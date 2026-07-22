/**
 * Idempotent demo seed: one flagship Health Club provider so the new
 * HEALTH_CLUB provider type, FITNESS service category, location search and the
 * /discover gallery all have real content to render.
 *
 * Run:  npx ts-node prisma/seed-health-club.ts
 */
import { PrismaClient, ProviderType, ServiceCategory } from '@prisma/client';

const prisma = new PrismaClient();

const BUSINESS_NAME = 'Luxury Health Club';

async function main() {
  const existing = await prisma.provider.findFirst({ where: { businessName: BUSINESS_NAME } });
  if (existing) {
    console.log(`✔ "${BUSINESS_NAME}" already exists (${existing.id}); nothing to do.`);
    return;
  }

  const provider = await prisma.provider.create({
    data: {
      businessName: BUSINESS_NAME,
      type: ProviderType.HEALTH_CLUB,
      verificationStatus: 'verified',
      timezone: 'America/Los_Angeles',
      brandProfile: {
        about:
          'A members-only luxury health club blending strength, mobility and recovery with an Ayurvedic lens — personal training, sculpted group classes, contrast therapy and a curated recovery lounge.',
        contactEmail: 'concierge@luxuryhealthclub.example',
        website: 'https://luxuryhealthclub.example',
        openingHours: 'Mon–Sun · 5:00–23:00',
      },
      address: {
        street: '1 Halcyon Avenue',
        city: 'Los Angeles',
        state: 'California',
        postcode: '90048',
        country: 'United States',
      },
    },
  });

  await prisma.service.createMany({
    data: [
      {
        providerId: provider.id,
        category: ServiceCategory.FITNESS,
        name: 'Signature Personal Training',
        description:
          'One-to-one session with a master coach — strength, conditioning and mobility programmed to your goals and constitution.',
        durationMinutes: 60,
        price: 120,
        currency: 'USD',
        isVirtual: false,
        maxParticipants: 1,
      },
      {
        providerId: provider.id,
        category: ServiceCategory.FITNESS,
        name: 'Sculpt & Flow Group Class',
        description:
          'A high-energy studio class fusing functional strength with breath-led flow. Small groups, big results.',
        durationMinutes: 45,
        price: 35,
        currency: 'USD',
        isVirtual: false,
        maxParticipants: 12,
      },
      {
        providerId: provider.id,
        category: ServiceCategory.FITNESS,
        name: 'Contrast Recovery Ritual',
        description:
          'Guided sauna, cold plunge and breathwork recovery circuit to reset the nervous system after training.',
        durationMinutes: 50,
        price: 60,
        currency: 'USD',
        isVirtual: false,
        maxParticipants: 6,
      },
    ],
  });

  await prisma.product.create({
    data: {
      providerId: provider.id,
      name: 'Ashwagandha Recovery Blend',
      category: 'Supplements',
      description:
        'Post-training adaptogen blend with ashwagandha and magnesium to support recovery and calm.',
      price: 42,
      inventoryQuantity: 40,
    },
  });

  console.log(`✔ Created "${BUSINESS_NAME}" (${provider.id}) with 3 fitness services + 1 product.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
