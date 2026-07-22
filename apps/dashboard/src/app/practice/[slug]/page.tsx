import type { Metadata } from "next";
import { api } from "@/lib/api";
import { practicePath } from "@/lib/paths";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  providerLocalBusinessJsonLd,
  providerMetadata,
} from "@/lib/seo";
import ProviderProfileClient from "@/app/providers/[id]/ProviderProfileClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const profile = await api.providerProfileBySlug(slug);
    return providerMetadata(profile.provider);
  } catch {
    return { title: "Practice not found", robots: { index: false, follow: false } };
  }
}

export default async function PracticeProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await api.providerProfileBySlug(slug).catch(() => null);
  const provider = profile?.provider ?? null;

  return (
    <>
      {provider && (
        <JsonLd
          data={[
            providerLocalBusinessJsonLd(provider),
            breadcrumbJsonLd([
              { name: "Discover", path: "/discover" },
              { name: provider.businessName, path: practicePath(provider) },
            ]),
          ]}
        />
      )}
      <ProviderProfileClient initialProfile={profile} />
    </>
  );
}
