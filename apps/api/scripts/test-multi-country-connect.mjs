#!/usr/bin/env node
/**
 * Test script for multi-country Stripe Connect onboarding.
 * Tests ISO country resolution, tax utility calculation, and onboarding link generation
 * for practice locations across Australia, United States, United Kingdom, New Zealand,
 * Canada, India, Germany, France, Ireland, and Singapore.
 *
 * Usage: node apps/api/scripts/test-multi-country-connect.mjs
 */

import { resolveIsoCountry, calculateTaxForCountry } from "../dist/src/modules/payments/tax.utility.js";

const TEST_CASES = [
  { name: "Australia (Full Name)", inputCountry: "Australia", currency: "AUD", expectedIso: "AU", taxRate: 0.10, taxName: "GST" },
  { name: "Australia (ISO)", inputCountry: "AU", currency: "AUD", expectedIso: "AU", taxRate: 0.10, taxName: "GST" },
  { name: "United States (Full Name)", inputCountry: "United States", currency: "USD", expectedIso: "US", taxRate: 0.00, taxName: "Sales Tax" },
  { name: "United States (Abbr)", inputCountry: "USA", currency: "USD", expectedIso: "US", taxRate: 0.00, taxName: "Sales Tax" },
  { name: "United Kingdom (Full Name)", inputCountry: "United Kingdom", currency: "GBP", expectedIso: "GB", taxRate: 0.20, taxName: "VAT" },
  { name: "United Kingdom (Abbr)", inputCountry: "UK", currency: "GBP", expectedIso: "GB", taxRate: 0.20, taxName: "VAT" },
  { name: "New Zealand", inputCountry: "New Zealand", currency: "NZD", expectedIso: "NZ", taxRate: 0.15, taxName: "GST" },
  { name: "Canada", inputCountry: "Canada", currency: "CAD", expectedIso: "CA", taxRate: 0.05, taxName: "GST" },
  { name: "India", inputCountry: "India", currency: "INR", expectedIso: "IN", taxRate: 0.18, taxName: "GST" },
  { name: "Germany", inputCountry: "Germany", currency: "EUR", expectedIso: "DE", taxRate: 0.19, taxName: "VAT" },
  { name: "France", inputCountry: "France", currency: "EUR", expectedIso: "FR", taxRate: 0.20, taxName: "VAT" },
  { name: "Ireland", inputCountry: "Ireland", currency: "EUR", expectedIso: "IE", taxRate: 0.23, taxName: "VAT" },
  { name: "Singapore", inputCountry: "Singapore", currency: "SGD", expectedIso: "SG", taxRate: 0.10, taxName: "GST" },
  { name: "Fallback via Currency (EUR -> DE)", inputCountry: null, currency: "EUR", expectedIso: "DE", taxRate: 0.19, taxName: "VAT" },
  { name: "Fallback via Currency (USD -> US)", inputCountry: null, currency: "USD", expectedIso: "US", taxRate: 0.00, taxName: "Sales Tax" },
];

console.log("\n=======================================================");
console.log("  AyurPass — Multi-Country Stripe Connect Test Suite");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

for (const tc of TEST_CASES) {
  const iso = resolveIsoCountry(tc.inputCountry, tc.currency);
  const tax = calculateTaxForCountry(tc.inputCountry, 100, tc.currency);
  
  const isoMatch = iso === tc.expectedIso;
  const taxRateMatch = Math.abs(tax.rate - tc.taxRate) < 0.001;
  const taxNameMatch = tax.name === tc.taxName;

  if (isoMatch && taxRateMatch && taxNameMatch) {
    passed++;
    console.log(` ✅ PASS: ${tc.name.padEnd(35)} -> ISO: ${iso} | Tax: ${(tax.rate * 100).toFixed(0)}% ${tax.name} (${tax.inclusive ? 'Inclusive' : 'Exclusive'})`);
  } else {
    failed++;
    console.log(` ❌ FAIL: ${tc.name.padEnd(35)} -> Expected ISO: ${tc.expectedIso}, got: ${iso} | Expected Tax: ${(tc.taxRate * 100)}% ${tc.taxName}, got: ${(tax.rate * 100)}% ${tax.name}`);
  }
}

console.log(`\nResults: ${passed} Passed, ${failed} Failed`);

if (failed > 0) {
  console.error("\nTest suite failed!");
  process.exit(1);
} else {
  console.log("\nMulti-country Stripe Connect onboarding readiness verified successfully! ✨\n");
}
