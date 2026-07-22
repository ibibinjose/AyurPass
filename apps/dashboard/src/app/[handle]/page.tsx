import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { JsonLd } from "@/components/JsonLd";
import { isReservedRootHandle } from "@ayurpass/shared";
import { practicePath, practitionerPath } from "@/lib/paths";
import {
  breadcrumbJsonLd,
  practitionerJsonLd,
  practitionerMetadata,
  providerLocalBusinessJsonLd,
  providerMetadata,
} from "@/lib/seo";
import PractitionerProfileClient from "@/app/me/[slug]/PractitionerProfileClient";
import ProviderProfileClient from "@/app/providers/[id]/ProviderProfileClient";

type Props = { params: Promise<{ handle: string }> };

/**
 * Root vanity URLs — https://www.ayurpass.com/:username
 * Only live after platform admin approval (brands & celebrities protection).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const h = handle.toLowerCase();
  if (isReservedRootHandle(h)) return { title: "Not found", robots: { index: false } };

  const pro = await api.professionalByVanity(h).catch(() => null);
  if (pro) return practitionerMetadata(pro);

  const providerProfile = await api.providerProfileByVanity(h).catch(() => null);
  if (providerProfile) return providerMetadata(providerProfile.provider);

  return { title: "Not found", robots: { index: false, follow: false } };
}

export default async function RootVanityPage({ params }: Props) {
  const { handle } = await params;
  const h = handle.toLowerCase();

  if (isReservedRootHandle(h)) notFound();

  const pro = await api.professionalByVanity(h).catch(() => null);
  if (pro) {
    // Prefer redirect to namespaced canonical if vanity is approved but we want
    // both to work; keep vanity as the live URL (no redirect).
    const name = pro.user?.fullName || pro.title || "Practitioner";
    return (
      <>
        <JsonLd
          data={[
            practitionerJsonLd(pro),
            breadcrumbJsonLd([
              { name: "Discover", path: "/discover" },
              { name, path: practitionerPath(pro) },
            ]),
          ]}
        />
        <PractitionerProfileClient mode="vanity" vanity />
      </>
    );
  }

  const providerProfile = await api.providerProfileByVanity(h).catch(() => null);
  if (providerProfile) {
    const provider = providerProfile.provider;
    // ProviderProfileClient resolves by id or slug from params — inject via redirect
    // to stable practice path so the existing client works, OR render with query.
    // Cleanest: redirect id-based providers page is ugly. Update client instead.
    // For now redirect to /practice/:slug if available, else /providers/:id with vanity preserved...
    // User wants /username to work — render ProviderProfileClient that can load by vanity.
    return (
      <>
        <JsonLd
          data={[
            providerLocalBusinessJsonLd(provider),
            breadcrumbJsonLd([
              { name: "Discover", path: "/discover" },
              { name: provider.businessName, path: practicePath(provider) },
            ]),
          ]}
        />
        <ProviderVanityBridge handle={h} initialProfile={providerProfile} />
      </>
    );
  }

  notFound();
}

/** Thin client bridge: ProviderProfileClient expects id/slug params. */
function ProviderVanityBridge({
  handle,
  initialProfile,
}: {
  handle: string;
  initialProfile: NonNullable<Awaited<ReturnType<typeof api.providerProfileByVanity>>>;
}) {
  // Re-export as provider client with vanity mode — update ProviderProfileClient.
  return <ProviderProfileClient vanityHandle={handle} initialProfile={initialProfile} />;
}
