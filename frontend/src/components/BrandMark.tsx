import type { BrandProfile, ProviderType } from "@/lib/types";
import {
  CoachIcon,
  DumbbellIcon,
  FlameIcon,
  LeafIcon,
  LotusIcon,
  MoonIcon,
  SparkleIcon,
} from "./icons";

type IconType = (props: { className?: string }) => React.ReactElement;

/** Simple, recognisable mark per discipline — used as the brand-mark fallback. */
export const PROVIDER_TYPE_ICON: Record<ProviderType, IconType> = {
  AYURVEDA_CLINIC: LeafIcon,
  AYURVEDA_RESORT: LeafIcon,
  PANCHAKARMA_CENTER: LeafIcon,
  WELLNESS_RETREAT: SparkleIcon,
  YOGA_STUDIO: LotusIcon,
  LUXURY_SPA: FlameIcon,
  MEDITATION_CENTER: MoonIcon,
  HEALTH_CLUB: DumbbellIcon,
  NUTRITIONIST: LeafIcon,
  COACHING: CoachIcon,
  HYBRID: SparkleIcon,
};

/** Minimal shape a brand mark needs — satisfied by Provider and the card Picks. */
export interface Branded {
  businessName: string;
  type: ProviderType;
  brandProfile?: BrandProfile | null;
}

const SIZES = {
  sm: { box: "h-9 w-9", icon: "h-4.5 w-4.5" },
  md: { box: "h-11 w-11", icon: "h-5.5 w-5.5" },
  lg: { box: "h-14 w-14", icon: "h-7 w-7" },
} as const;

export function BrandMark({
  provider,
  size = "md",
  className = "",
}: {
  provider: Branded;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const logo = provider.brandProfile?.logoUrl;
  const dims = SIZES[size];

  if (logo) {
    return (
      // Data-URL / arbitrary host logos — plain img avoids next/image domain config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={`${provider.businessName} brand mark`}
        className={`${dims.box} shrink-0 rounded-full object-cover ring-1 ring-hairline ${className}`}
      />
    );
  }

  const Icon = PROVIDER_TYPE_ICON[provider.type] ?? SparkleIcon;
  return (
    <span
      className={`flex ${dims.box} shrink-0 items-center justify-center rounded-full bg-forest text-gold-soft ${className}`}
    >
      <Icon className={dims.icon} />
    </span>
  );
}
