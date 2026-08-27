import type { Metadata } from "next";
import type { Offer, ProfessionalDetail, Provider, Retreat } from "./types";
import { BRAND_ASSET_VERSION } from "./brand";
import { PROVIDER_TYPE_LABEL, RETREAT_CATEGORY_LABEL, formatAddress } from "./catalog";
import { practicePath, practitionerPath } from "./paths";

/** Canonical site origin — override per environment via NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ayurpass.com"
).replace(/\/$/, "");

export const SITE_NAME = "AyurPass";

/** Primary brand promise — find *and* book trusted wellness. */
export const SITE_TAGLINE =
  "Find & book Ayurveda, Yoga, Spa, Meditation & Wellness with verified practices worldwide.";

export const SITE_TITLE_DEFAULT =
  "AyurPass — Find and Book Ayurveda, Yoga and Wellness";

/** Canonical social card supplied by the root Open Graph image route. */
export const DEFAULT_SOCIAL_IMAGE = abs("/opengraph-image");

export const DEFAULT_KEYWORDS = [
  "Ayurveda",
  "Yoga retreat",
  "book Ayurveda",
  "book yoga class",
  "Meditation retreat",
  "Panchakarma",
  "Luxury spa",
  "Wellness retreat",
  "Yoga teacher training",
  "Detox retreat",
  "Health club",
  "Wellness directory",
  "wellness booking",
  "Ayurvedic treatment near me",
  "best yoga studios",
  "wellness spa bookings",
  "holistic health directory",
  "Panchakarma centers",
  "Ayurvedic massage",
  "Yoga instructor",
  "wellness app",
  "global wellness marketplace",
  "book spa online",
  "meditation classes near me",
  "Ayurveda Australia",
  "Ayurveda India",
  "yoga UAE",
  "wellness UK",
  "wellness USA",
];

/** Open Graph locales for a global English-first product. */
export const OG_LOCALES = [
  "en_AU",
  "en_US",
  "en_GB",
  "en_IN",
  "en_SG",
  "en_AE",
] as const;

/** Absolute URL for a site-relative path — needed for canonical & OG tags. */
export function abs(path: string): string {
  return new URL(path, SITE_URL).toString();
}

// ---------------------------------------------------------------------------
// JSON-LD builders (schema.org) — rendered via <JsonLd/> into page <head>/body.
// ---------------------------------------------------------------------------

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    logo: abs(`/brand/ayurpass-logo.png?v=${BRAND_ASSET_VERSION}`),
    image: abs(`/brand/ayurpass-logo.png?v=${BRAND_ASSET_VERSION}`),
    knowsAbout: ["Ayurveda", "Yoga", "Wellness", "Spa", "Meditation", "Holistic Health", "Panchakarma"],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/retreats?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

/** A retreat as a schema.org Event (dated program) — rich results eligible. */
export function retreatEventJsonLd(retreat: Retreat) {
  const image = retreat.images?.filter(Boolean) ?? [];
  const place =
    retreat.city || retreat.country
      ? {
          "@type": "Place",
          name: [retreat.city, retreat.country].filter(Boolean).join(", "),
          address: {
            "@type": "PostalAddress",
            addressLocality: retreat.city ?? undefined,
            addressCountry: retreat.country ?? undefined,
          },
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: retreat.title,
    description: retreat.summary ?? retreat.description ?? undefined,
    startDate: retreat.startDate ?? undefined,
    endDate: retreat.endDate ?? undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: image.length ? image : undefined,
    location: place,
    organizer: retreat.provider
      ? { "@type": "Organization", name: retreat.provider.businessName }
      : undefined,
    offers:
      retreat.priceFrom != null
        ? {
            "@type": "Offer",
            price: Number(retreat.priceFrom),
            priceCurrency: retreat.currency || "AUD",
            url: abs(`/retreats/${retreat.slug}`),
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };
}

/** A provider/venue as a schema.org LocalBusiness. */
export function providerLocalBusinessJsonLd(provider: Provider) {
  const brand = provider.brandProfile;
  const a = provider.address;
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: provider.businessName,
    description: brand?.about ?? undefined,
    url: abs(practicePath(provider)),
    image: brand?.coverImageUrl ?? brand?.logoUrl ?? undefined,
    telephone: brand?.contactPhone ?? undefined,
    email: brand?.contactEmail ?? undefined,
    priceRange: brand?.priceBand ?? undefined,
    address: a
      ? {
          "@type": "PostalAddress",
          streetAddress: a.street ?? undefined,
          addressLocality: a.city ?? undefined,
          addressRegion: a.state ?? undefined,
          postalCode: a.postcode ?? undefined,
          addressCountry: a.country ?? undefined,
        }
      : undefined,
  };
}

/** An ordered list of retreats (for category hub pages). */
export function itemListJsonLd(retreats: Retreat[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: retreats.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: abs(`/retreats/${r.slug}`),
      name: r.title,
    })),
  };
}

// ---------------------------------------------------------------------------
// Metadata builders
// ---------------------------------------------------------------------------

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  images?: string[];
  keywords?: string[];
  noindex?: boolean;
}

/** Compose a full Metadata object with canonical, OpenGraph and Twitter tags. */
export function pageMetadata({
  title,
  description,
  path,
  images,
  keywords,
  noindex,
}: PageMetaInput): Metadata {
  const url = abs(path);
  const suppliedImages = (images ?? []).filter(Boolean).map((u) => ({ url: u, alt: title }));
  const ogImages = suppliedImages.length
    ? suppliedImages
    : [
        {
          url: DEFAULT_SOCIAL_IMAGE,
          width: 1200,
          height: 630,
          alt: "AyurPass — Find and book Ayurveda, Yoga and Wellness",
        },
      ];
  return {
    title,
    description,
    keywords: keywords ?? undefined,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_AU",
      alternateLocale: [...OG_LOCALES.filter((locale) => locale !== "en_AU")],
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((image) => ({ url: image.url, alt: image.alt })),
    },
  };
}

export function retreatMetadata(retreat: Retreat): Metadata {
  const where = [retreat.city, retreat.country].filter(Boolean).join(", ");
  const cat = RETREAT_CATEGORY_LABEL[retreat.category] ?? "Retreat";
  return pageMetadata({
    title: `${retreat.title} — ${cat}${where ? ` in ${where}` : ""}`,
    description:
      retreat.summary ??
      retreat.description?.slice(0, 155) ??
      `${cat}${where ? ` in ${where}` : ""} on AyurPass — enquire or book directly.`,
    path: `/retreats/${retreat.slug}`,
    images: retreat.images ?? undefined,
    keywords: [cat, where, "retreat", retreat.title].filter(Boolean) as string[],
  });
}

export function offerJsonLd(offer: Offer) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: offer.title,
    description: offer.description ?? undefined,
    image: offer.imageUrl ?? undefined,
    url: abs(`/offers/${offer.id}`),
    category: offer.discipline ?? undefined,
    validFrom: offer.startDate ?? undefined,
    validThrough: offer.endDate ?? undefined,
  };
}

export function offerMetadata(offer: Offer): Metadata {
  return pageMetadata({
    title: `${offer.title} — Wellness Offer`,
    description:
      offer.description?.slice(0, 155) ??
      `${offer.title}${offer.discountLabel ? ` — ${offer.discountLabel}` : ""} on AyurPass.`,
    path: `/offers/${offer.id}`,
    images: offer.imageUrl ? [offer.imageUrl] : undefined,
    keywords: [offer.discipline, offer.title, "wellness offer", "spa deal"].filter(
      Boolean,
    ) as string[],
    noindex: !offer.active,
  });
}

export function practitionerJsonLd(professional: ProfessionalDetail) {
  const name = professional.user?.fullName || professional.title || "Practitioner";
  const provider = professional.provider;
  const where = provider ? formatAddress(provider.address) : undefined;
  const path = practitionerPath(professional);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: professional.title ?? undefined,
    description: professional.bio ?? provider?.brandProfile?.about ?? undefined,
    image: professional.user?.avatarUrl ?? provider?.brandProfile?.logoUrl ?? undefined,
    url: abs(path),
    worksFor: provider
      ? {
          "@type": "HealthAndBeautyBusiness",
          name: provider.businessName,
          address: where || undefined,
        }
      : undefined,
  };
}

function getDynamicKeywords(type: string | undefined, name: string, location: string): string[] {
  const base = [name, type || "", location].filter(Boolean);
  if (!type) return base;

  switch (type.toUpperCase()) {
    case "AYURVEDA_CLINIC":
    case "AYURVEDA_DOCTOR":
    case "AYURVEDA":
      return [
        ...base,
        "Ayurveda clinic",
        "Ayurvedic doctor",
        "Panchakarma detox",
        "Abhyanga massage",
        "Ayurvedic consultation",
        "Vedic healing",
        "natural medicine",
      ];
    case "YOGA_STUDIO":
    case "YOGA_INSTRUCTOR":
    case "YOGA":
      return [
        ...base,
        "yoga classes",
        "yoga teacher",
        "vinyasa flow",
        "hatha yoga",
        "yin yoga",
        "pranayama",
        "meditation classes",
      ];
    case "LUXURY_SPA":
    case "SPA":
      return [
        ...base,
        "spa massage",
        "body treatment",
        "facials",
        "rejuvenation spa",
        "deep tissue massage",
        "hot stone therapy",
      ];
    case "MEDITATION_CENTER":
    case "MEDITATION":
      return [
        ...base,
        "meditation sessions",
        "mindfulness training",
        "sound healing",
        "vipassana",
        "spiritual growth",
      ];
    case "HEALTH_CLUB":
      return [
        ...base,
        "gym membership",
        "personal training",
        "wellness club",
        "sauna steam room",
        "fitness center",
      ];
    default:
      return base;
  }
}

export function practitionerMetadata(professional: ProfessionalDetail): Metadata {
  const name = professional.user?.fullName || professional.title || "Practitioner";
  const title = professional.title || "Wellness practitioner";
  const where = professional.provider
    ? formatAddress(professional.provider.address)
    : "";
  const path = practitionerPath(professional);
  const dynKeywords = getDynamicKeywords(professional.title || undefined, name, where);
  return pageMetadata({
    title: `${name} — ${title}${where ? ` in ${where}` : ""}`,
    description:
      professional.bio?.slice(0, 155) ??
      `${name}, ${title.toLowerCase()}${where ? ` in ${where}` : ""}. View profile, enquire and book on AyurPass.`,
    path,
    images: [
      professional.user?.avatarUrl,
      professional.provider?.brandProfile?.coverImageUrl,
      professional.provider?.brandProfile?.logoUrl,
    ].filter(Boolean) as string[],
    keywords: [
      title,
      ...(professional.specializations ?? []),
      ...dynKeywords,
    ].filter(Boolean) as string[],
  });
}

export function providerMetadata(provider: Provider): Metadata {
  const type = PROVIDER_TYPE_LABEL[provider.type] ?? "Wellness";
  const where = formatAddress(provider.address);
  const dynKeywords = getDynamicKeywords(provider.type, provider.businessName, where);
  return pageMetadata({
    title: `${provider.businessName} — ${type}${where ? ` in ${where}` : ""}`,
    description:
      provider.brandProfile?.about?.slice(0, 155) ??
      `${provider.businessName}, ${type.toLowerCase()}${where ? ` in ${where}` : ""}. Discover, enquire and book on AyurPass.`,
    path: practicePath(provider),
    images: [provider.brandProfile?.coverImageUrl, provider.brandProfile?.logoUrl].filter(
      Boolean,
    ) as string[],
    keywords: dynKeywords,
  });
}
