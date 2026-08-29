import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { centerPublicPath } from "@/lib/paths";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  providerLocalBusinessJsonLd,
  providerMetadata,
} from "@/lib/seo";
import ProviderProfileClient from "@/app/providers/[id]/ProviderProfileClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const profile = await api.providerProfileBySlug(slug);
    return providerMetadata(profile.provider);
  } catch {
    return { title: "Wellness Center Not Found", robots: { index: false, follow: false } };
  }
}

export default async function ShortCenterPage({ params }: Props) {
  const { slug } = await params;
  const profile = await api.providerProfileBySlug(slug).catch(() => null);

  if (!profile?.provider) {
    notFound();
  }

  const provider = profile.provider;

  return (
    <>
      <JsonLd
        data={[
          providerLocalBusinessJsonLd(provider),
          breadcrumbJsonLd([
            { name: "Discover", path: "/discover" },
            { name: provider.businessName, path: centerPublicPath(provider) },
          ]),
        ]}
      />
      <ProviderProfileClient initialProfile={profile} />
    </>
  );
}
