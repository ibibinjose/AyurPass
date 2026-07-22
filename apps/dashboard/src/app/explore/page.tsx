import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { abs, pageMetadata, SITE_NAME } from "@/lib/seo";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = pageMetadata({
  title: "Book a Session — Treatments, Classes & Consultations",
  description:
    "Book Ayurveda treatments, yoga classes, spa sessions, meditation, fitness, nutrition consults and wellness packages directly with verified practitioners.",
  path: "/explore",
  keywords: [
    "book wellness session",
    "Ayurveda treatment booking",
    "yoga class booking",
    "spa appointment",
    "wellness consultation",
  ],
});

export default function ExplorePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Book a Session",
          url: abs("/explore"),
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") },
        }}
      />
      <ExploreClient />
    </>
  );
}