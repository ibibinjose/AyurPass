#!/usr/bin/env node
/**
 * Assigns unique public slugs to all providers missing one.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugifyName(name) {
  return (name || 'practice')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

async function uniqueSlug(base, excludeId) {
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

const rows = await prisma.provider.findMany({
  where: { OR: [{ slug: null }, { slug: '' }] },
  select: { id: true, businessName: true },
});

let updated = 0;
for (const row of rows) {
  const base = slugifyName(row.businessName);
  const slug = await uniqueSlug(base, row.id);
  await prisma.provider.update({ where: { id: row.id }, data: { slug } });
  updated++;
}

console.log(`✔ Assigned slugs to ${updated} providers`);
await prisma.$disconnect();