import type { Provider } from "./types";

/** Canonical public URL for a practice listing. */
export function practicePath(provider: Pick<Provider, "slug" | "id">): string {
  return provider.slug ? `/practice/${provider.slug}` : `/providers/${provider.id}`;
}

/** Canonical public URL for a practitioner profile. */
export function practitionerPath(pro: { slug?: string | null; id: string }): string {
  return pro.slug ? `/me/${pro.slug}` : `/providers/${pro.id}`;
}