/**
 * Cleanup Script: Removes local demo/mock seed data prior to production launch.
 *
 * Safe to run against development or staging databases to purge test users,
 * demo providers, demo services, and demo mock transactions, while keeping
 * authentic practitioner data (e.g. AAA directory import).
 *
 * Usage:
 *   cd apps/api && npx ts-node --transpile-only prisma/clean-mock-data.ts
 *   # or from monorepo root:
 *   npm run db:clean-mock
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_EMAILS = [
  'seeker@local.ayurpass.dev',
  'provider@local.ayurpass.dev',
  'concierge@luxuryhealthclub.example',
];

const MOCK_PROVIDER_NAMES = [
  'Local Wellness Studio',
  'Luxury Health Club',
];

async function main() {
  console.log('🧹 Starting mock data cleanup...\n');

  // 1. Delete mock providers & associated records
  const mockProviders = await prisma.provider.findMany({
    where: {
      OR: [
        { businessName: { in: MOCK_PROVIDER_NAMES } },
        { slug: 'local-wellness-studio' },
      ],
    },
    select: { id: true, businessName: true, userId: true },
  });

  for (const prov of mockProviders) {
    console.log(`  Deleting mock provider: "${prov.businessName}" (${prov.id})...`);

    // Delete bookings & dependencies first
    const bookings = await prisma.booking.deleteMany({
      where: { providerId: prov.id },
    });
    console.log(`    - Removed ${bookings.count} booking(s)`);

    // Delete orders & order items
    const orders = await prisma.order.deleteMany({
      where: { providerId: prov.id },
    });
    console.log(`    - Removed ${orders.count} order(s)`);

    // Delete services
    const services = await prisma.service.deleteMany({
      where: { providerId: prov.id },
    });
    console.log(`    - Removed ${services.count} service(s)`);

    // Delete products
    const products = await prisma.product.deleteMany({
      where: { providerId: prov.id },
    });
    console.log(`    - Removed ${products.count} product(s)`);

    // Delete professionals
    const professionals = await prisma.professional.deleteMany({
      where: { providerId: prov.id },
    });
    console.log(`    - Removed ${professionals.count} professional(s)`);

    // Delete staff
    const staff = await prisma.providerStaff.deleteMany({
      where: { providerId: prov.id },
    });
    console.log(`    - Removed ${staff.count} staff record(s)`);

    // Delete client records
    const clientRecords = await prisma.clientRecord.deleteMany({
      where: { providerId: prov.id },
    });
    console.log(`    - Removed ${clientRecords.count} client record(s)`);

    // Delete provider
    await prisma.provider.delete({
      where: { id: prov.id },
    });
    console.log(`    ✔ Deleted provider "${prov.businessName}"`);
  }

  // 2. Delete mock users
  const mockUsers = await prisma.user.findMany({
    where: {
      email: { in: MOCK_EMAILS },
    },
    select: { id: true, email: true },
  });

  for (const u of mockUsers) {
    console.log(`  Deleting mock user: "${u.email}" (${u.id})...`);

    // Delete consumer relations
    await prisma.booking.deleteMany({ where: { consumerId: u.id } });
    await prisma.order.deleteMany({ where: { consumerId: u.id } });
    await prisma.loyaltyAccount.deleteMany({ where: { consumerId: u.id } });
    await prisma.wellnessPass.deleteMany({ where: { consumerId: u.id } });
    await prisma.consumer.deleteMany({ where: { userId: u.id } });

    // Delete user record
    await prisma.user.delete({
      where: { id: u.id },
    });
    console.log(`    ✔ Deleted user "${u.email}"`);
  }

  console.log('\n✅ Mock data cleanup completed successfully.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during mock data cleanup:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
