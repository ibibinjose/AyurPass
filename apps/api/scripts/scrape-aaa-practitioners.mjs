#!/usr/bin/env node
/**
 * Scrapes the public AAA practitioner directory (69 profiles).
 * Source: https://www.ayurved.org.au/find-a-practitioner
 *
 * Usage:
 *   node apps/api/scripts/scrape-aaa-practitioners.mjs
 *   node apps/api/scripts/scrape-aaa-practitioners.mjs --out apps/api/data/aaa-practitioners.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const BASE = 'https://www.ayurved.org.au';
const LISTING_PAGES = 6;
const DELAY_MS = 350;

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultOut = resolve(__dirname, '../data/aaa-practitioners.json');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AyurPass-Directory-Importer/1.0 (+https://ayurpass.com)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseListingPage(html) {
  const cards = [];
  const blocks = html.split(/<div class="col-md-6 col-lg-4">/g).slice(1);
  for (const block of blocks) {
    const idMatch = block.match(/profile\/(\d+)/);
    if (!idMatch) continue;
    const id = Number(idMatch[1]);

    const nameMatch = block.match(
      /<h3 class="team-card__title[^"]*">\s*<a[^>]*>\s*([^<]+?)\s*<\/a>/s,
    );
    const name = nameMatch ? decodeHtml(nameMatch[1]) : null;

    const locMatch = block.match(/team-card__location[^>]*>([\s\S]*?)<\/p>/);
    let city;
    let state;
    if (locMatch) {
      const locText = decodeHtml(locMatch[1].replace(/<[^>]+>/g, ' '));
      const parts = locText.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        city = parts[0];
        state = parts.slice(1).join(', ');
      } else if (parts.length === 1) {
        state = parts[0];
      }
    }

    const membershipMatch = block.match(/team-card__membership[\s\S]*?<small>([^<]+)<\/small>/);
    const membership = membershipMatch ? decodeHtml(membershipMatch[1]) : null;

    const imgMatch = block.match(/src="(https:\/\/www\.ayurved\.org\.au\/storage\/profile_images\/[^"]+)"/);
    const imageUrl = imgMatch ? imgMatch[1] : null;

    cards.push({ id, name, city, state, membership, imageUrl });
  }
  return cards;
}

function fieldAfterLabel(html, label) {
  const re = new RegExp(
    `<a>${label}<\\/a>\\s*<p class="service-sidebar__discount__text">([\\s\\S]*?)<\\/p>`,
    'i',
  );
  const m = html.match(re);
  return m ? decodeHtml(m[1].replace(/<[^>]+>/g, '')) : '';
}

function parseProfilePage(html, id) {
  const taglineMatch = html.match(/service-sidebar__discount__tagline">\s*([^<]+?)\s*</);
  const name = taglineMatch ? decodeHtml(taglineMatch[1]) : '';

  const imgMatch = html.match(
    /service-sidebar__discount__image[\s\S]*?src="(https:\/\/www\.ayurved\.org\.au\/storage\/profile_images\/[^"]+)"/,
  );
  const imageUrl = imgMatch ? imgMatch[1] : null;

  const street = fieldAfterLabel(html, 'Address');
  const state = fieldAfterLabel(html, 'State');
  const postcode = fieldAfterLabel(html, 'Zip Code');
  const email = fieldAfterLabel(html, 'Email');
  const phone = fieldAfterLabel(html, 'Phone');

  const descMatch = html.match(
    /Profile Description[\s\S]*?<p class="service-details__text">([\s\S]*?)<\/p>/,
  );
  const description = descMatch ? decodeHtml(descMatch[1].replace(/<[^>]+>/g, '')) : '';

  const bioBlocks = [...html.matchAll(/<h3 class="service-details__title">About\/Bio[\s\S]*?<p class="service-details__text">([\s\S]*?)<\/p>/g)];
  const bio = bioBlocks.length
    ? decodeHtml(bioBlocks[0][1].replace(/<[^>]+>/g, ''))
    : '';

  return {
    id,
    name,
    street,
    state,
    postcode,
    email,
    phone,
    description,
    bio,
    imageUrl,
    profileUrl: `${BASE}/profile/${id}`,
  };
}

async function scrapeAll() {
  const listingById = new Map();

  for (let page = 1; page <= LISTING_PAGES; page++) {
    const url = page === 1 ? `${BASE}/find-a-practitioner` : `${BASE}/find-a-practitioner?page=${page}`;
    process.stdout.write(`Listing page ${page}/${LISTING_PAGES}…\n`);
    const html = await fetchText(url);
    for (const card of parseListingPage(html)) {
      listingById.set(card.id, card);
    }
    await sleep(DELAY_MS);
  }

  const ids = [...listingById.keys()].sort((a, b) => a - b);
  process.stdout.write(`Found ${ids.length} practitioner IDs\n`);

  const practitioners = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    process.stdout.write(`Profile ${i + 1}/${ids.length} (#${id})…\n`);
    const html = await fetchText(`${BASE}/profile/${id}`);
    const profile = parseProfilePage(html, id);
    const listing = listingById.get(id) ?? {};
    practitioners.push({
      ...listing,
      ...profile,
      name: profile.name || listing.name || `Practitioner ${id}`,
      city: listing.city || undefined,
      state: profile.state || listing.state || undefined,
      membership: listing.membership || 'AAA Member',
      imageUrl: profile.imageUrl || listing.imageUrl || null,
      scrapedAt: new Date().toISOString(),
      source: 'aaa',
    });
    await sleep(DELAY_MS);
  }

  return practitioners;
}

const outArg = process.argv.indexOf('--out');
const outPath = outArg >= 0 ? resolve(process.argv[outArg + 1]) : defaultOut;

const practitioners = await scrapeAll();
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify(
    {
      source: 'https://www.ayurved.org.au/find-a-practitioner',
      count: practitioners.length,
      scrapedAt: new Date().toISOString(),
      practitioners,
    },
    null,
    2,
  ),
);
console.log(`Wrote ${practitioners.length} practitioners → ${outPath}`);