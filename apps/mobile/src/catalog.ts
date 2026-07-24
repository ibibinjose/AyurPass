import type { Ionicons } from "@expo/vector-icons";
import {
  colorForServiceCategory,
  softColorForServiceCategory,
  serviceCategoryColor,
} from "@ayurpass/shared";
import type { BusinessAddress, ProviderType, ServiceCategory } from "./types";

type IoniconName = keyof typeof Ionicons.glyphMap;

export { colorForServiceCategory, softColorForServiceCategory, serviceCategoryColor };

export const PROVIDER_TYPE_LABEL: Record<ProviderType, string> = {
  AYURVEDA_CLINIC: "Ayurveda Clinic",
  AYURVEDA_RESORT: "Ayurvedic Resort",
  PANCHAKARMA_CENTER: "Panchakarma Center",
  WELLNESS_RETREAT: "Wellness Retreat",
  YOGA_STUDIO: "Yoga Studio",
  LUXURY_SPA: "Luxury Spa",
  MEDITATION_CENTER: "Meditation Center",
  HEALTH_CLUB: "Health Club",
  NUTRITIONIST: "Nutritionist",
  COACHING: "Coaching",
  WELLNESS_KITCHEN: "Wellness Kitchen",
  HYBRID: "Wellness Center",
};

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
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

export const PROVIDER_TYPE_ICON: Record<ProviderType, IoniconName> = {
  AYURVEDA_CLINIC: "leaf-outline",
  AYURVEDA_RESORT: "leaf-outline",
  PANCHAKARMA_CENTER: "leaf-outline",
  WELLNESS_RETREAT: "sparkles-outline",
  YOGA_STUDIO: "flower-outline",
  LUXURY_SPA: "flame-outline",
  MEDITATION_CENTER: "moon-outline",
  HEALTH_CLUB: "barbell-outline",
  NUTRITIONIST: "nutrition-outline",
  COACHING: "compass-outline",
  WELLNESS_KITCHEN: "restaurant-outline",
  HYBRID: "sparkles-outline",
};

export const SERVICE_CATEGORY_ICON: Record<ServiceCategory, IoniconName> = {
  AYURVEDA: "leaf-outline",
  YOGA: "flower-outline",
  SPA: "flame-outline",
  MEDITATION: "moon-outline",
  FITNESS: "barbell-outline",
  NUTRITION: "nutrition-outline",
  COACHING: "compass-outline",
  CONSULTATION: "chatbubbles-outline",
  PACKAGE: "gift-outline",
  COOKING: "restaurant-outline",
};

/** Ordered legend for calendar colour codes */
export const CALENDAR_CATEGORY_LEGEND: {
  id: ServiceCategory;
  label: string;
  color: string;
}[] = (
  [
    "AYURVEDA",
    "YOGA",
    "SPA",
    "MEDITATION",
    "FITNESS",
    "NUTRITION",
    "CONSULTATION",
  ] as ServiceCategory[]
).map((id) => ({
  id,
  label: SERVICE_CATEGORY_LABEL[id],
  color: colorForServiceCategory(id),
}));

export function formatAddress(address?: BusinessAddress | null): string | null {
  if (!address) return null;
  const parts = [address.city, address.state, address.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

/** Render entity code badge, e.g. "#FEA8B75". */
export function formatCode(code?: string | null): string {
  return code ? `#${code}` : "";
}
