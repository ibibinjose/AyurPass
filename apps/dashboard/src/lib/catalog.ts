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
  NUTRITIONIST: "Nutritionist",
  COACHING: "Health & Lifestyle Coach",
  WELLNESS_KITCHEN: "Wellness Kitchen",
  HYBRID: "Wellness Center",
};

export const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  AYURVEDA: "Ayurveda",
  YOGA: "Yoga",
  SPA: "Spa",
  MEDITATION: "Meditation",
  FITNESS: "Fitness",
  NUTRITION: "Nutrition",
  COACHING: "Coaching",
  CONSULTATION: "Consultation",
  PACKAGE: "Package",
  COOKING: "Cooking Class",
};

/** Tag colors per category — muted washes so text stays readable. */
export const CATEGORY_TAG_CLASS: Record<ServiceCategory, string> = {
  AYURVEDA: "bg-clay text-forest",
  YOGA: "bg-clay text-forest",
  SPA: "bg-gold-soft text-forest",
  MEDITATION: "bg-clay text-forest",
  FITNESS: "bg-forest text-white",
  NUTRITION: "bg-leaf/15 text-forest",
  COACHING: "bg-gold-soft text-forest",
  CONSULTATION: "bg-gold-soft text-forest",
  PACKAGE: "bg-forest text-white",
  COOKING: "bg-gold-soft text-forest",
};

export const EVENT_CATEGORY_LABEL: Record<string, string> = {
  AYURVEDA: "Ayurveda",
  YOGA: "Yoga",
  SPA: "Spa",
  MEDITATION: "Meditation",
  FITNESS: "Fitness",
  NUTRITION: "Nutrition",
  COACHING: "Coaching",
  COOKING_CLASS: "Cooking Class",
  SOUND_HEALING: "Sound Healing",
  COMMUNITY: "Community",
  WORKSHOP: "Workshop",
  OPEN_DAY: "Open Day",
  RETREAT_PREVIEW: "Retreat Preview",
  OTHER: "Other",
};

export const EVENT_CATEGORIES = Object.keys(EVENT_CATEGORY_LABEL);

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
  NUTRITION_DETOX: "Nutrition & Detox",
};

export const RETREAT_CATEGORIES = Object.keys(RETREAT_CATEGORY_LABEL) as RetreatCategory[];

/** Wellness disciplines an admin offer can be tagged to (shared vocabulary). */
export const OFFER_DISCIPLINES = [
  "Ayurveda",
  "Yoga",
  "Luxury Spa",
  "Meditation",
  "Health Club",
  "Nutrition",
  "Cooking",
  "Retreat",
  "Events",
  "Coaching",
  "General",
] as const;

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

/**
 * Format a date in the provider's timezone so consumers see local practice time.
 * Falls back to the user's browser locale if no timezone is given.
 */
export function formatDate(
  iso: string | Date | null | undefined,
  timezone?: string | null,
): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(timezone ? { timeZone: timezone } : {}),
  };
  return d.toLocaleDateString(undefined, opts);
}

/**
 * Format a time (HH:MM) in the provider's timezone.
 * Useful for booking slot display — consumers always see the practice's local clock.
 */
export function formatTime(
  iso: string | Date | null | undefined,
  timezone?: string | null,
): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    ...(timezone ? { timeZone: timezone } : {}),
  };
  return d.toLocaleTimeString(undefined, opts);
}

/**
 * Format a full date + time in the provider's timezone.
 * Example: "20 Jul 2026, 2:30 pm" (varies by user locale).
 */
export function formatDateTime(
  iso: string | Date | null | undefined,
  timezone?: string | null,
): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(timezone ? { timeZone: timezone } : {}),
  };
  return d.toLocaleString(undefined, opts);
}

/**
 * Short timezone abbreviation for display next to times.
 * e.g. "AEST", "IST", "GMT"
 */
export function timezoneAbbr(timezone?: string | null): string {
  if (!timezone) return "";
  try {
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    const tz = parts.find((p) => p.type === "timeZoneName");
    return tz?.value ?? "";
  } catch {
    return "";
  }
}
