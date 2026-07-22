import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { abs, pageMetadata, SITE_NAME } from "@/lib/seo";
import RetreatsClient from "./RetreatsClient";

export const metadata: Metadata = pageMetadata({
  title: "Retreats & Trainings — Handpicked Worldwide",
  description:
    "Discover the best yoga, meditation, Ayurveda, detox and wellness retreats and trainings on the planet. Filter by discipline and destination, then enquire or book directly.",
  path: "/retreats",
  keywords: [
    "wellness retreats",
    "yoga retreats",
    "meditation retreats",
    "Ayurveda retreats",
    "yoga teacher training",
    "detox retreat",
    "retreat finder",
  ],
});

export default async function RetreatsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Retreats & Trainings",
          url: abs("/retreats"),
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") },
        }}
      />
      <RetreatsClient initialQuery={q ?? ""} />
    </>
  );
}
