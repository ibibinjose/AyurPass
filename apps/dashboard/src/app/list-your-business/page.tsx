import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { abs, pageMetadata, SITE_NAME } from "@/lib/seo";
import ListYourBusinessClient from "./ListYourBusinessClient";

export const metadata: Metadata = pageMetadata({
  title: "List Your Wellness Practice — Free",
  description:
    "List your Ayurveda clinic, yoga studio, spa, meditation center, health club or retreat on AyurPass for free. Get discovered and receive enquiries — no card required.",
  path: "/list-your-business",
  keywords: [
    "list wellness business",
    "Ayurveda clinic directory",
    "yoga studio listing",
    "spa marketing",
    "wellness provider signup",
  ],
});

export default function ListYourBusinessPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "List Your Wellness Practice",
          url: abs("/list-your-business"),
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") },
          description:
            "Create a free public practice page on AyurPass and get discovered by wellness seekers.",
        }}
      />
      <ListYourBusinessClient />
    </>
  );
}
