import type { Metadata } from "next";
import { api } from "@/lib/api";
import { practiceBioPath } from "@/lib/paths";
import { SITE_URL } from "@/lib/seo";
import PracticeLinkBioClient from "./PracticeLinkBioClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const profile = await api.providerProfileBySlug(slug);
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
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return { title: "Links", robots: { index: false, follow: false } };
  }
}

export default async function PracticeBioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await api.providerProfileBySlug(slug).catch(() => null);
  return <PracticeLinkBioClient slug={slug} initialProfile={profile} />;
}
