import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import EmbedBookingClient from "./EmbedBookingClient";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ color?: string; serviceId?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const h = handle.toLowerCase();
  const profile = await api
    .providerProfileByVanity(h)
    .catch(() => api.providerProfileBySlug(h))
    .catch(() => api.providerProfile(h))
    .catch(() => null);

  if (!profile) return { title: "Booking Widget | AyurPass", robots: { index: false } };

  return {
    title: `Book Online · ${profile.provider.businessName} | AyurPass`,
    description: `Book appointments with ${profile.provider.businessName} directly online.`,
    robots: { index: false, follow: false },
  };
}

export default async function EmbedBookingPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const { color, serviceId } = await searchParams;
  const h = handle.toLowerCase();

  const profile = await api
    .providerProfileByVanity(h)
    .catch(() => api.providerProfileBySlug(h))
    .catch(() => api.providerProfile(h))
    .catch(() => null);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-transparent p-2 sm:p-4 text-foreground antialiased font-sans">
      <EmbedBookingClient
        profile={profile}
        brandColor={color}
        initialServiceId={serviceId}
      />
    </div>
  );
}
