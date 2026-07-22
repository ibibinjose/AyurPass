import type { Metadata } from "next";
import { api } from "@/lib/api";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, offerJsonLd, offerMetadata } from "@/lib/seo";
import OfferDetailClient from "./OfferDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const offer = await api.offer(id);
    return offerMetadata(offer);
  } catch {
    return { title: "Offer not found", robots: { index: false, follow: false } };
  }
}

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await api.offer(id).catch(() => null);

  return (
    <>
      {offer && (
        <JsonLd
          data={[
            offerJsonLd(offer),
            breadcrumbJsonLd([
              { name: "Offers", path: "/offers" },
              { name: offer.title, path: `/offers/${offer.id}` },
            ]),
          ]}
        />
      )}
      <OfferDetailClient />
    </>
  );
}