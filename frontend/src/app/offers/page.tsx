import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import OffersClient from "./OffersClient";

export const metadata: Metadata = pageMetadata({
  title: "Offers & Deals — Wellness Promotions",
  description:
    "Handpicked wellness offers and deals across Ayurveda, yoga, luxury spa, meditation, health clubs, nutrition and retreats — curated by AyurPass.",
  path: "/offers",
  keywords: ["wellness offers", "spa deals", "yoga discounts", "retreat deals", "Ayurveda offers"],
});

export default function OffersPage() {
  return <OffersClient />;
}
