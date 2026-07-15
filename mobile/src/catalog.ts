import type { Ionicons } from "@expo/vector-icons";
import type { BusinessAddress, ProviderType, ServiceCategory } from "./types";

type IoniconName = keyof typeof Ionicons.glyphMap;

export const PROVIDER_TYPE_LABEL: Record<ProviderType, string> = {
  AYURVEDA_CLINIC: "Ayurveda Clinic",
  AYURVEDA_RESORT: "Ayurvedic Resort",
  PANCHAKARMA_CENTER: "Panchakarma Center",
  WELLNESS_RETREAT: "Wellness Retreat",
  YOGA_STUDIO: "Yoga Studio",
  LUXURY_SPA: "Luxury Spa",
  MEDITATION_CENTER: "Meditation Center",
  HEALTH_CLUB: "Health Club",
  COACHING: "Coaching",
  HYBRID: "Wellness Center",
};

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  AYURVEDA: "Ayurveda",
  YOGA: "Yoga",
  SPA: "Spa",
  MEDITATION: "Meditation",
  FITNESS: "Fitness",
  COACHING: "Coaching",
  CONSULTATION: "Consultation",
  PACKAGE: "Package",
};

export const PROVIDER_TYPE_ICON: Record<ProviderType, IoniconName> = {
  AYURVEDA_CLINIC: "leaf-outline",
  AYURVEDA_RESORT: "leaf-outline",
  PANCHAKARMA_CENTER: "leaf-outline",
  WELLNESS_RETREAT: "sparkles-outline",
  YOGA_STUDIO: "flower-outline",
  LUXURY_SPA: "flame-outline",
  MEDITATION_CENTER: "moon-outline",
  HEALTH_CLUB: "barbell-outline",
  COACHING: "compass-outline",
  HYBRID: "sparkles-outline",
};

export const SERVICE_CATEGORY_ICON: Record<ServiceCategory, IoniconName> = {
  AYURVEDA: "leaf-outline",
  YOGA: "flower-outline",
  SPA: "flame-outline",
  MEDITATION: "moon-outline",
  FITNESS: "barbell-outline",
  COACHING: "compass-outline",
  CONSULTATION: "chatbubbles-outline",
  PACKAGE: "gift-outline",
};

export function formatAddress(address?: BusinessAddress | null): string | null {
  if (!address) return null;
  const parts = [address.city, address.state, address.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}
