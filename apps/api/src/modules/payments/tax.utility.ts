export interface TaxDetails {
  rate: number;       // e.g. 0.10 for 10%
  amount: number;     // calculated tax amount
  name: string;       // e.g. "GST" or "VAT"
  inclusive: boolean;
  baseAmount: number; // pre-tax amount
}

/**
 * Calculates GST/VAT tax details based on the provider's country and transaction amount.
 * Handles both tax-inclusive countries (AU, NZ, UK, EU, IN) and tax-exclusive countries (US, CA).
 *
 * @param countryName The country of the provider
 * @param amount The transaction amount (acts as pre-tax subtotal for exclusive, or final total for inclusive)
 */
export function calculateTaxForCountry(
  countryName: string | undefined | null,
  amount: number,
  fallbackCurrency?: string | null,
): TaxDetails {
  const iso = resolveIsoCountry(countryName, fallbackCurrency);

  let rate = 0.10; // Default rate
  let name = 'GST';
  let inclusive = true;

  if (iso === 'AU') {
    rate = 0.10;
    name = 'GST';
    inclusive = true;
  } else if (iso === 'NZ') {
    rate = 0.15;
    name = 'GST';
    inclusive = true;
  } else if (iso === 'GB') {
    rate = 0.20;
    name = 'VAT';
    inclusive = true;
  } else if (iso === 'DE') {
    rate = 0.19;
    name = 'VAT';
    inclusive = true;
  } else if (iso === 'FR') {
    rate = 0.20;
    name = 'VAT';
    inclusive = true;
  } else if (iso === 'IE') {
    rate = 0.23;
    name = 'VAT';
    inclusive = true;
  } else if (iso === 'CA') {
    rate = 0.05; // Standard Canadian GST
    name = 'GST';
    inclusive = false;
  } else if (iso === 'IN') {
    rate = 0.18;
    name = 'GST';
    inclusive = true;
  } else if (iso === 'US') {
    rate = 0.00;
    name = 'Sales Tax';
    inclusive = false;
  } else if (iso === 'SG') {
    rate = 0.10;
    name = 'GST';
    inclusive = true;
  } else {
    // Default fallback: 10% inclusive GST
    rate = 0.10;
    name = 'GST';
    inclusive = true;
  }

  let taxAmount = 0;
  let baseAmount = amount;

  if (inclusive) {
    // Tax is already included in the displayed amount
    taxAmount = Math.round((amount - amount / (1 + rate)) * 100) / 100;
    baseAmount = Math.round((amount - taxAmount) * 100) / 100;
  } else {
    // Tax is added on top of the displayed amount
    taxAmount = Math.round((amount * rate) * 100) / 100;
    baseAmount = amount;
  }

  return {
    rate,
    amount: taxAmount,
    name,
    inclusive,
    baseAmount,
  };
}

/**
 * Resolves a 2-letter ISO 3166-1 alpha-2 country code from a country name or currency code.
 */
export function resolveIsoCountry(countryInput?: string | null, fallbackCurrency?: string | null): string {
  if (countryInput) {
    const norm = countryInput.trim().toLowerCase();
    if (norm === 'australia' || norm === 'au') return 'AU';
    if (norm === 'united states' || norm === 'us' || norm === 'usa' || norm === 'united states of america') return 'US';
    if (norm === 'united kingdom' || norm === 'uk' || norm === 'gb' || norm === 'great britain') return 'GB';
    if (norm === 'new zealand' || norm === 'nz') return 'NZ';
    if (norm === 'canada' || norm === 'ca') return 'CA';
    if (norm === 'india' || norm === 'in') return 'IN';
    if (norm === 'germany' || norm === 'de') return 'DE';
    if (norm === 'france' || norm === 'fr') return 'FR';
    if (norm === 'ireland' || norm === 'ie') return 'IE';
    if (norm === 'singapore' || norm === 'sg') return 'SG';
    if (norm.length === 2) return norm.toUpperCase();
  }
  if (fallbackCurrency) {
    const curr = fallbackCurrency.trim().toUpperCase();
    if (curr === 'AUD') return 'AU';
    if (curr === 'USD') return 'US';
    if (curr === 'GBP') return 'GB';
    if (curr === 'NZD') return 'NZ';
    if (curr === 'CAD') return 'CA';
    if (curr === 'INR') return 'IN';
    if (curr === 'EUR') return 'DE';
    if (curr === 'SGD') return 'SG';
  }
  return 'AU';
}

