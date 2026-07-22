#!/usr/bin/env node
/**
 * Quick Stripe readiness check — run after pasting your keys into apps/api/.env
 * Usage: node apps/api/scripts/stripe-status.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

function mask(key) {
  if (!key || key.length < 8) return "(missing)";
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

function isPlaceholder(val) {
  return !val || val.endsWith("...") || val.includes("REPLACE");
}

const env = loadEnv(envPath);
const secret = env.STRIPE_SECRET_KEY;
const publishable = env.STRIPE_PUBLISHABLE_KEY;
const webhook = env.STRIPE_WEBHOOK_SECRET;
const mock = isPlaceholder(secret);

console.log("\nAyurPass Stripe configuration\n");
console.log(`  apps/api/.env      ${existsSync(envPath) ? "found" : "MISSING"}`);
console.log(`  Mode               ${mock ? "MOCK (demo payments)" : "LIVE (Stripe test/live keys detected)"}`);
console.log(`  STRIPE_SECRET_KEY  ${isPlaceholder(secret) ? "placeholder — paste sk_test_… or sk_live_…" : mask(secret)}`);
console.log(
  `  STRIPE_PUBLISHABLE ${isPlaceholder(publishable) ? "placeholder — paste pk_test_… or pk_live_…" : mask(publishable)}`,
);
console.log(
  `  STRIPE_WEBHOOK     ${isPlaceholder(webhook) ? "placeholder — run: npm run stripe:listen" : mask(webhook)}`,
);
console.log(`  FRONTEND_URL       ${env.FRONTEND_URL ?? "(default http://localhost:3000)"}`);
console.log(`  CORS_ORIGIN        ${env.CORS_ORIGIN ?? "(default *)"}`);

if (mock) {
  console.log("\nNext steps:");
  console.log("  1. Paste your Stripe test keys into apps/api/.env");
  console.log("  2. Copy STRIPE_PUBLISHABLE_KEY to frontend/.env.local");
  console.log("  3. Run: npm run stripe:listen  (in a separate terminal)");
  console.log("  4. Restart backend + frontend");
  console.log("  5. Provider: Dashboard → Payments → Connect with Stripe\n");
} else if (isPlaceholder(webhook)) {
  console.log("\nKeys look good. Start webhook forwarding:");
  console.log("  npm run stripe:listen");
  console.log("  Copy the whsec_… secret into STRIPE_WEBHOOK_SECRET and restart the backend.\n");
} else {
  console.log("\nStripe looks fully configured. Restart the backend if you just changed .env.\n");
}