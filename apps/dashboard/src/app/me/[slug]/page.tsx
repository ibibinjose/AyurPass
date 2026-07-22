import type { Metadata } from "next";
import { api } from "@/lib/api";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  practitionerJsonLd,
  practitionerMetadata,
} from "@/lib/seo";
import PractitionerProfileClient from "./PractitionerProfileClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const professional = await api.professionalBySlug(slug);
    return practitionerMetadata(professional);
  } catch {
    return { title: "Practitioner not found", robots: { index: false, follow: false } };
  }
}

export default async function PractitionerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const professional = await api.professionalBySlug(slug).catch(() => null);
  const name =
    professional?.user?.fullName || professional?.title || "Practitioner";

  return (
    <>
      {professional && (
        <JsonLd
          data={[
            practitionerJsonLd(professional),
            breadcrumbJsonLd([
              { name: "Discover", path: "/discover" },
              { name, path: `/me/${professional.slug ?? slug}` },
            ]),
          ]}
        />
      )}
      <PractitionerProfileClient />
    </>
  );
}