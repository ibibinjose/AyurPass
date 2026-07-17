import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { abs, pageMetadata, SITE_NAME } from "@/lib/seo";
import PackagesClient from "./PackagesClient";

export const metadata: Metadata = pageMetadata({
  title: "Wellness Packages — Programs & Memberships",
  description:
    "Curated multi-session wellness packages from verified clinics, studios and spas. Day intensives, multi-week paths and recurring memberships on AyurPass.",
  path: "/packages",
  keywords: [
    "wellness packages",
    "Ayurveda package",
    "spa membership",
    "treatment program",
    "yoga package",
  ],
});

export default function PackagesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Wellness Packages",
          url: abs("/packages"),
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") },
        }}
      />
      <PackagesClient />
    </>
  );
}
