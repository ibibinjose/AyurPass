#!/usr/bin/env node
/**
 * Assigns unique public slugs to all professionals missing one.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugifyName(name) {
  return (name || 'practitioner')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

async function uniqueSlug(base, excludeId) {
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

const rows = await prisma.professional.findMany({
  where: { OR: [{ slug: null }, { slug: '' }] },
  include: { user: { select: { fullName: true } } },
});

let updated = 0;
for (const row of rows) {
  const base = slugifyName(row.user?.fullName ?? row.title ?? 'practitioner');
  const slug = await uniqueSlug(base, row.id);
  await prisma.professional.update({ where: { id: row.id }, data: { slug } });
  updated++;
}

console.log(`✔ Assigned slugs to ${updated} professionals`);
await prisma.$disconnect();