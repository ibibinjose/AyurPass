import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { abs, pageMetadata, SITE_NAME } from "@/lib/seo";
import PartnersClient from "./PartnersClient";

export const metadata: Metadata = pageMetadata({
  title: "Partner Programs — Clinics, Corporate & Retreats",
  description:
    "Partner with AyurPass — for wellness clinics, corporate employee benefits, retreat resorts, and authentic Ayurvedic brands across 48+ countries.",
  path: "/partners",
  keywords: [
    "wellness partner program",
    "Ayurveda clinic partnership",
    "corporate wellness passes",
    "retreat booking platform",
    "wellness business growth",
  ],
});

export default function PartnersPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "AyurPass Partner Programs",
          url: abs("/partners"),
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") },
          description:
            "Grow your clinic, retreat, corporate wellness program or herbal brand with AyurPass.",
        }}
      />
      <PartnersClient />
    </>
  );
}
