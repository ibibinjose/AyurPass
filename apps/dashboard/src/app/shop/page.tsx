import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { abs, pageMetadata, SITE_NAME } from "@/lib/seo";
import ShopClient from "./ShopClient";

export const metadata: Metadata = pageMetadata({
  title: "Wellness Shop — Herbs, Oils & Goods",
  description:
    "Herbal formulations, oils and wellness goods from verified providers. Shop authentic Ayurvedic and holistic products on AyurPass.",
  path: "/shop",
  keywords: [
    "Ayurveda products",
    "wellness shop",
    "herbal oils",
    "Ayurvedic supplements",
    "buy wellness goods",
  ],
});

export default function ShopPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Wellness Shop",
          url: abs("/shop"),
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") },
        }}
      />
      <ShopClient />
    </>
  );
}
