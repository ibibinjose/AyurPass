import type { Metadata } from "next";
import type { Provider, Retreat } from "./types";
import { BRAND_ASSET_VERSION } from "./brand";
import { PROVIDER_TYPE_LABEL, RETREAT_CATEGORY_LABEL, formatAddress } from "./catalog";

/** Canonical site origin — override per environment via NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ayurpass.com"
).replace(/\/$/, "");

export const SITE_NAME = "AyurPass";

export const SITE_TAGLINE =
  "The dedicated finder for Ayurveda, yoga, luxury spa, meditation, health-club & retreat places worldwide.";

export const DEFAULT_KEYWORDS = [
  "Ayurveda",
  "Yoga retreat",
  "Meditation retreat",
  "Panchakarma",
  "Luxury spa",
  "Wellness retreat",
  "Yoga teacher training",
  "Detox retreat",
  "Health club",
  "Wellness directory",
  "Retreat finder",
];

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
            priceCurrency: retreat.currency || "USD",
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
    url: abs(`/providers/${provider.id}`),
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
  const ogImages = (images ?? []).filter(Boolean).map((u) => ({ url: u }));
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
      locale: "en_US",
      images: ogImages.length ? ogImages : undefined,
    },
    twitter: {
      card: ogImages.length ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImages.length ? ogImages.map((i) => i.url) : undefined,
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

export function providerMetadata(provider: Provider): Metadata {
  const type = PROVIDER_TYPE_LABEL[provider.type] ?? "Wellness";
  const where = formatAddress(provider.address);
  return pageMetadata({
    title: `${provider.businessName} — ${type}${where ? ` in ${where}` : ""}`,
    description:
      provider.brandProfile?.about?.slice(0, 155) ??
      `${provider.businessName}, ${type.toLowerCase()}${where ? ` in ${where}` : ""}. Discover, enquire and book on AyurPass.`,
    path: `/providers/${provider.id}`,
    images: [provider.brandProfile?.coverImageUrl, provider.brandProfile?.logoUrl].filter(
      Boolean,
    ) as string[],
    keywords: [type, where, provider.businessName].filter(Boolean) as string[],
  });
}
