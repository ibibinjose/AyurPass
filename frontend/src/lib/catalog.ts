import type { ServiceCategory } from "./types";

export const PROVIDER_TYPE_LABEL: Record<string, string> = {
  AYURVEDA_CLINIC: "Ayurveda Clinic",
  AYURVEDA_RESORT: "Ayurvedic Resort",
  PANCHAKARMA_CENTER: "Panchakarma Center",
  WELLNESS_RETREAT: "Wellbeing Retreat Center",
  YOGA_STUDIO: "Yoga Studio",
  LUXURY_SPA: "Luxury Spa",
  MEDITATION_CENTER: "Meditation Center",
  HYBRID: "Wellness Center",
};

export const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  AYURVEDA: "Ayurveda",
  YOGA: "Yoga",
  SPA: "Spa",
  MEDITATION: "Meditation",
  CONSULTATION: "Consultation",
  PACKAGE: "Package",
};

/** Tag colors per category — muted washes so text stays readable. */
export const CATEGORY_TAG_CLASS: Record<ServiceCategory, string> = {
  AYURVEDA: "bg-clay text-forest",
  YOGA: "bg-clay text-forest",
  SPA: "bg-gold-soft text-forest",
  MEDITATION: "bg-clay text-forest",
  CONSULTATION: "bg-gold-soft text-forest",
  PACKAGE: "bg-forest text-white",
};

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
