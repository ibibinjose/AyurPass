import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import EmbedBookingClient from "../../[handle]/EmbedBookingClient";

type Props = {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{ color?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serviceId } = await params;
  const service = await api.service(serviceId).catch(() => null);
  if (!service) return { title: "Booking Widget | AyurPass", robots: { index: false } };

  return {
    title: `Book ${service.name} | AyurPass`,
    description: service.description ?? "Book your session online.",
    robots: { index: false, follow: false },
  };
}

export default async function EmbedServicePage({ params, searchParams }: Props) {
  const { serviceId } = await params;
  const { color } = await searchParams;

  const service = await api.service(serviceId).catch(() => null);
  if (!service) notFound();

  const profile = await api.providerProfile(service.providerId).catch(() => null);
  if (!profile) notFound();

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
