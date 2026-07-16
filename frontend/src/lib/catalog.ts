import type { BusinessAddress, RetreatCategory, ServiceCategory } from "./types";

export const PROVIDER_TYPE_LABEL: Record<string, string> = {
  AYURVEDA_CLINIC: "Ayurveda Clinic",
  AYURVEDA_RESORT: "Ayurvedic Resort",
  PANCHAKARMA_CENTER: "Panchakarma Center",
  WELLNESS_RETREAT: "Wellbeing Retreat Center",
  YOGA_STUDIO: "Yoga Studio",
  LUXURY_SPA: "Luxury Spa",
  MEDITATION_CENTER: "Meditation Center",
  HEALTH_CLUB: "Health Club",
  COACHING: "Health & Lifestyle Coach",
  HYBRID: "Wellness Center",
};

export const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  AYURVEDA: "Ayurveda",
  YOGA: "Yoga",
  SPA: "Spa",
  MEDITATION: "Meditation",
  FITNESS: "Fitness",
  COACHING: "Coaching",
  CONSULTATION: "Consultation",
  PACKAGE: "Package",
};

/** Tag colors per category — muted washes so text stays readable. */
export const CATEGORY_TAG_CLASS: Record<ServiceCategory, string> = {
  AYURVEDA: "bg-clay text-forest",
  YOGA: "bg-clay text-forest",
  SPA: "bg-gold-soft text-forest",
  MEDITATION: "bg-clay text-forest",
  FITNESS: "bg-forest text-white",
  COACHING: "bg-gold-soft text-forest",
  CONSULTATION: "bg-gold-soft text-forest",
  PACKAGE: "bg-forest text-white",
};

export const RETREAT_CATEGORY_LABEL: Record<RetreatCategory, string> = {
  YOGA_RETREAT: "Yoga Retreat",
  YOGA_TEACHER_TRAINING: "Yoga Teacher Training",
  MEDITATION_RETREAT: "Meditation Retreat",
  AYURVEDA_PANCHAKARMA: "Ayurveda & Panchakarma",
  DETOX_CLEANSE: "Detox & Cleanse",
  SPA_WELLNESS: "Spa & Wellness",
  FITNESS_ADVENTURE: "Fitness & Adventure",
  SILENT_RETREAT: "Silent Retreat",
  WOMENS_RETREAT: "Women's Retreat",
  HEALING_RETREAT: "Healing Retreat",
};

export const RETREAT_CATEGORIES = Object.keys(RETREAT_CATEGORY_LABEL) as RetreatCategory[];

/** Format a retreat's date range, e.g. "12–19 Oct 2026" or "Flexible dates". */
export function formatRetreatDates(start?: string | null, end?: string | null): string {
  if (!start) return "Flexible dates";
  const s = new Date(start);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  if (!end) return s.toLocaleDateString(undefined, opts);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()}–${e.toLocaleDateString(undefined, opts)}`;
  }
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}

/** Render a short entity code as a recognisable badge, e.g. "#A3F9C21". */
export function formatCode(code?: string | null): string {
  return code ? `#${code}` : "";
}

/** Compact "City, Country" line from a provider's stored address. */
export function formatAddress(address?: BusinessAddress | null): string {
  if (!address) return "";
  return [address.city, address.state, address.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
