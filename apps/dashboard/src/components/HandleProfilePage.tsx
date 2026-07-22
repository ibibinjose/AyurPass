import type { Metadata } from "next";
import { api } from "@/lib/api";
import { JsonLd } from "@/components/JsonLd";
import { practitionerPath } from "@/lib/paths";
import {
  breadcrumbJsonLd,
  practitionerJsonLd,
  practitionerMetadata,
} from "@/lib/seo";
import type { HandleNamespace } from "@ayurpass/shared";
import PractitionerProfileClient from "@/app/me/[slug]/PractitionerProfileClient";

/** Shared server page for /pro|/ayur|/yoga|/spa|…/:handle */
export function makeHandleMetadata(namespace: HandleNamespace) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ handle: string }>;
  }): Promise<Metadata> {
    const { handle } = await params;
    try {
      const pro = await api.professionalByHandle(namespace, handle);
      return practitionerMetadata(pro);
    } catch {
      return { title: "Practitioner not found", robots: { index: false, follow: false } };
    }
  };
}

export function HandleProfilePage({
  namespace,
}: {
  namespace: HandleNamespace;
}) {
  return async function Page({ params }: { params: Promise<{ handle: string }> }) {
    const { handle } = await params;
    const professional = await api
      .professionalByHandle(namespace, handle)
      .catch(() => null);
    const name =
      professional?.user?.fullName || professional?.title || "Practitioner";
    const path = professional
      ? practitionerPath(professional)
      : `/${namespace}/${handle}`;

    return (
      <>
        {professional && (
          <JsonLd
            data={[
              practitionerJsonLd(professional),
              breadcrumbJsonLd([
                { name: "Discover", path: "/discover" },
                { name, path },
              ]),
            ]}
          />
        )}
        <PractitionerProfileClient mode="handle" namespace={namespace} />
      </>
    );
  };
}
