/**
 * Global locale & market foundation for AyurPass.
 * UI copy is English-first; structure is ready for additional languages.
 */

export type AppLocale = {
  /** BCP 47 language tag */
  code: string;
  /** English name */
  name: string;
  /** Native name */
  nativeName: string;
  /** Primary markets that default to this locale */
  markets?: string[];
  dir?: "ltr" | "rtl";
};

/** Languages we plan to support (English ships fully; others ready for content). */
export const SUPPORTED_LOCALES: AppLocale[] = [
  { code: "en", name: "English", nativeName: "English", markets: ["AU", "US", "GB", "IN", "SG", "AE"] },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", markets: ["IN"] },
  { code: "es", name: "Spanish", nativeName: "Español", markets: ["ES", "MX", "AR"] },
  { code: "pt", name: "Portuguese", nativeName: "Português", markets: ["PT", "BR"] },
  { code: "fr", name: "French", nativeName: "Français", markets: ["FR", "CA", "CH"] },
  { code: "de", name: "German", nativeName: "Deutsch", markets: ["DE", "AT", "CH"] },
  { code: "ar", name: "Arabic", nativeName: "العربية", markets: ["AE", "SA", "QA"], dir: "rtl" },
  { code: "ja", name: "Japanese", nativeName: "日本語", markets: ["JP"] },
  { code: "ko", name: "Korean", nativeName: "한국어", markets: ["KR"] },
  { code: "zh-Hans", name: "Chinese (Simplified)", nativeName: "简体中文", markets: ["SG", "MY"] },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", markets: ["ID"] },
  { code: "th", name: "Thai", nativeName: "ไทย", markets: ["TH"] },
];

export const DEFAULT_LOCALE = "en";

/** ISO markets with launch priority (store listings, marketing, support hours). */
export const GLOBAL_MARKETS = [
  { code: "AU", name: "Australia", tier: 1 },
  { code: "IN", name: "India", tier: 1 },
  { code: "US", name: "United States", tier: 1 },
  { code: "GB", name: "United Kingdom", tier: 1 },
  { code: "AE", name: "United Arab Emirates", tier: 1 },
  { code: "SG", name: "Singapore", tier: 1 },
  { code: "NZ", name: "New Zealand", tier: 1 },
  { code: "CA", name: "Canada", tier: 2 },
  { code: "DE", name: "Germany", tier: 2 },
  { code: "FR", name: "France", tier: 2 },
  { code: "NL", name: "Netherlands", tier: 2 },
  { code: "IE", name: "Ireland", tier: 2 },
  { code: "LK", name: "Sri Lanka", tier: 2 },
  { code: "NP", name: "Nepal", tier: 2 },
  { code: "TH", name: "Thailand", tier: 2 },
  { code: "ID", name: "Indonesia", tier: 2 },
  { code: "MY", name: "Malaysia", tier: 2 },
  { code: "JP", name: "Japan", tier: 2 },
  { code: "KR", name: "South Korea", tier: 3 },
  { code: "ZA", name: "South Africa", tier: 3 },
  { code: "BR", name: "Brazil", tier: 3 },
  { code: "MX", name: "Mexico", tier: 3 },
  { code: "PH", name: "Philippines", tier: 3 },
  { code: "VN", name: "Vietnam", tier: 3 },
] as const;

export function localeFromBrowser(navLang?: string | null): string {
  if (!navLang) return DEFAULT_LOCALE;
  const base = navLang.toLowerCase().split("-")[0];
  if (SUPPORTED_LOCALES.some((l) => l.code === navLang || l.code === base)) {
    return SUPPORTED_LOCALES.find((l) => l.code === navLang)?.code
      ?? SUPPORTED_LOCALES.find((l) => l.code === base)?.code
      ?? DEFAULT_LOCALE;
  }
  // zh-CN → zh-Hans
  if (navLang.toLowerCase().startsWith("zh")) return "zh-Hans";
  return DEFAULT_LOCALE;
}

export function localeDir(code: string): "ltr" | "rtl" {
  return SUPPORTED_LOCALES.find((l) => l.code === code)?.dir ?? "ltr";
}

/** Format money using the user's preferred locale + currency. */
export function formatMoneyGlobal(
  amount: number,
  currency = "AUD",
  locale = DEFAULT_LOCALE,
): string {
  try {
    return new Intl.NumberFormat(locale === "zh-Hans" ? "zh-CN" : locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: ["JPY", "KRW", "VND", "IDR"].includes(currency.toUpperCase())
        ? 0
        : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Format a date/time in a practice timezone for any locale. */
export function formatDateTimeGlobal(
  iso: string | Date,
  opts?: {
    locale?: string;
    timeZone?: string;
    dateStyle?: Intl.DateTimeFormatOptions["dateStyle"];
    timeStyle?: Intl.DateTimeFormatOptions["timeStyle"];
  },
): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const locale = opts?.locale ?? DEFAULT_LOCALE;
  try {
    return new Intl.DateTimeFormat(locale === "zh-Hans" ? "zh-CN" : locale, {
      dateStyle: opts?.dateStyle ?? "medium",
      timeStyle: opts?.timeStyle ?? "short",
      timeZone: opts?.timeZone,
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}
