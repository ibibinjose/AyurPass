import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { abs, pageMetadata, SITE_NAME } from "@/lib/seo";
import DiscoverClient from "./DiscoverClient";

export const metadata: Metadata = pageMetadata({
  title: "Discover Wellness — Ayurveda, Yoga, Spa & Retreats",
  description:
    "Search Ayurveda clinics, yoga studios, luxury spas, meditation centres, health clubs, nutritionists and retreat venues worldwide. Filter by name, location and discipline.",
  path: "/discover",
  keywords: [
    "wellness directory",
    "Ayurveda clinic",
    "yoga studio",
    "luxury spa",
    "meditation centre",
    "wellness finder",
    "retreat directory",
  ],
});

export default function DiscoverPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Discover Wellness",
          url: abs("/discover"),
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") },
        }}
      />
      <DiscoverClient />
    </>
  );
}