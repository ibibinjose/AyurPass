import type { Metadata } from "next";
import { api } from "@/lib/api";
import { RETREAT_CATEGORY_LABEL } from "@/lib/catalog";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, retreatEventJsonLd, retreatMetadata } from "@/lib/seo";
import RetreatDetailClient from "./RetreatDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const retreat = await api.retreatBySlug(slug);
    return retreatMetadata(retreat);
  } catch {
    return { title: "Retreat not found", robots: { index: false, follow: false } };
  }
}

export default async function RetreatDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const retreat = await api.retreatBySlug(slug).catch(() => null);

  return (
    <>
      {retreat && (
        <JsonLd
          data={[
            retreatEventJsonLd(retreat),
            breadcrumbJsonLd([
              { name: "Retreats", path: "/retreats" },
              {
                name: RETREAT_CATEGORY_LABEL[retreat.category] ?? "Retreat",
                path: `/retreats/collection/${retreat.category.toLowerCase()}`,
              },
              { name: retreat.title, path: `/retreats/${retreat.slug}` },
            ]),
          ]}
        />
      )}
      <RetreatDetailClient />
    </>
  );
}
