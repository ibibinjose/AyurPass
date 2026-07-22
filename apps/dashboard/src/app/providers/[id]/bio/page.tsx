import type { Metadata } from "next";
import { api } from "@/lib/api";
import { practiceBioPath } from "@/lib/paths";
import { SITE_URL } from "@/lib/seo";
import PracticeLinkBioClient from "@/app/practice/[slug]/bio/PracticeLinkBioClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const profile = await api.providerProfile(id);
    const provider = profile.provider;
    const title = `${provider.businessName} · Links`;
    const description =
      provider.brandProfile?.about?.replace(/\s+/g, " ").trim().slice(0, 160) ||
      `Book, enquire and follow ${provider.businessName} on AyurPass.`;
    const path = practiceBioPath(provider);
    const image =
      provider.brandProfile?.coverImageUrl ||
      provider.brandProfile?.logoUrl ||
      undefined;
    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}${path}` },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}${path}`,
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch {
    return { title: "Links", robots: { index: false, follow: false } };
  }
}

export default async function ProviderBioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await api.providerProfile(id).catch(() => null);
  return <PracticeLinkBioClient providerId={id} initialProfile={profile} />;
}
