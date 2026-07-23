/**
 * Currency conversion and localization rates relative to AUD (base currency).
 * Automatically converts prices when user switches location/currency preferences.
 */

export const CURRENCY_RATES_FROM_AUD: Record<string, number> = {
  AUD: 1.0,
  USD: 0.66,
  INR: 55.2,
  GBP: 0.52,
  EUR: 0.61,
  AED: 2.42,
  CAD: 0.90,
  NZD: 1.09,
  SGD: 0.88,
  LKR: 202.5,
  NPR: 88.3,
  THB: 23.4,
  IDR: 10450.0,
  MYR: 3.12,
  JPY: 103.5,
  KRW: 915.0,
  CHF: 0.58,
  SEK: 7.02,
  NOK: 7.18,
  DKK: 4.54,
  ZAR: 12.1,
  MXN: 12.6,
  BRL: 3.65,
  ARS: 620.0,
  QAR: 2.40,
  SAR: 2.48,
  OMR: 0.25,
  KWD: 0.20,
  BHD: 0.25,
  ILS: 2.42,
  PHP: 38.6,
  VND: 16800.0,
  TRY: 21.5,
  HKD: 5.15,
  TWD: 21.2,
  MUR: 30.5,
  MVR: 10.2,
  BDT: 78.5,
  PKR: 184.0,
};

/**
 * Convert an amount from one currency to another using AUD as base pivot.
 */
export function convertCurrency(
  amount: number | string | null | undefined,
  fromCurrency = "AUD",
  toCurrency = "AUD",
): number {
  const numericAmount = Number(amount ?? 0);
  if (isNaN(numericAmount) || numericAmount <= 0) return 0;

  const fromRate = CURRENCY_RATES_FROM_AUD[fromCurrency.toUpperCase()] || 1.0;
  const toRate = CURRENCY_RATES_FROM_AUD[toCurrency.toUpperCase()] || 1.0;

  // Convert to AUD first, then to target currency
  const amountInAud = numericAmount / fromRate;
  const converted = amountInAud * toRate;

  // Round JPY, IDR, KRW, VND to whole numbers
  if (["JPY", "IDR", "KRW", "VND"].includes(toCurrency.toUpperCase())) {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

/**
 * Formats a price with location-aware currency conversion.
 */
export function formatLocalizedPrice(
  amount: number | string | null | undefined,
  userLocationCurrency = "AUD",
  itemOriginalCurrency = "AUD",
): string {
  const numericAmount = Number(amount ?? 0);
  if (isNaN(numericAmount) || numericAmount <= 0) return "Free";

  const targetCurrency = userLocationCurrency.toUpperCase();
  const originalCurrency = (itemOriginalCurrency || "AUD").toUpperCase();

  const convertedAmount = convertCurrency(numericAmount, originalCurrency, targetCurrency);
  const fractionDigits = Number.isInteger(convertedAmount) || ["JPY", "IDR", "KRW", "VND"].includes(targetCurrency) ? 0 : 2;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: targetCurrency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(convertedAmount);
  } catch {
    return `${targetCurrency} ${convertedAmount}`;
  }
}
