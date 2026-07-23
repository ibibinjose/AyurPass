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
export function calculateTaxForCountry(countryName: string | undefined | null, amount: number): TaxDetails {
  const normalizedCountry = (countryName || '').trim().toLowerCase();

  let rate = 0.10; // Default rate
  let name = 'GST';
  let inclusive = true;

  if (normalizedCountry === 'australia' || normalizedCountry === 'au') {
    rate = 0.10;
    name = 'GST';
    inclusive = true;
  } else if (normalizedCountry === 'new zealand' || normalizedCountry === 'nz') {
    rate = 0.15;
    name = 'GST';
    inclusive = true;
  } else if (normalizedCountry === 'united kingdom' || normalizedCountry === 'uk' || normalizedCountry === 'gb' || normalizedCountry === 'great britain') {
    rate = 0.20;
    name = 'VAT';
    inclusive = true;
  } else if (normalizedCountry === 'germany' || normalizedCountry === 'de') {
    rate = 0.19;
    name = 'VAT';
    inclusive = true;
  } else if (normalizedCountry === 'france' || normalizedCountry === 'fr') {
    rate = 0.20;
    name = 'VAT';
    inclusive = true;
  } else if (normalizedCountry === 'ireland' || normalizedCountry === 'ie') {
    rate = 0.23;
    name = 'VAT';
    inclusive = true;
  } else if (normalizedCountry === 'canada' || normalizedCountry === 'ca') {
    rate = 0.05; // Standard Canadian GST (provincial PST/HST can be added on top, standard is 5%)
    name = 'GST';
    inclusive = false;
  } else if (normalizedCountry === 'india' || normalizedCountry === 'in') {
    rate = 0.18;
    name = 'GST';
    inclusive = true;
  } else if (normalizedCountry === 'united states' || normalizedCountry === 'us' || normalizedCountry === 'usa' || normalizedCountry === 'united states of america') {
    rate = 0.00;
    name = 'Sales Tax';
    inclusive = false;
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
