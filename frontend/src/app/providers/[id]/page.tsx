import type { Metadata } from "next";
import { api } from "@/lib/api";
import { JsonLd } from "@/components/JsonLd";
import { practicePath } from "@/lib/paths";
import {
  breadcrumbJsonLd,
  providerLocalBusinessJsonLd,
  providerMetadata,
} from "@/lib/seo";
import ProviderProfileClient from "./ProviderProfileClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await api.providerProfile(id).catch(() => null);
  const provider = profile?.provider ?? null;
  if (!provider) {
    return { title: "Practice not found", robots: { index: false, follow: false } };
  }
  return providerMetadata(provider);
}

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await api.providerProfile(id).catch(() => null);
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
