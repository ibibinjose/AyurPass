import {
  isHandleNamespace,
  practicePublicPath,
  practitionerPublicPath,
  titleKindLabel,
  type HandleNamespace,
} from "@ayurpass/shared";
import type { Professional, Provider } from "./types";

/** Canonical public URL for a practice profile. */
export function practicePath(
  provider: Pick<Provider, "slug" | "id"> &
    Partial<Pick<Provider, "vanityHandle" | "vanityStatus">>,
): string {
  return practicePublicPath(provider);
}

/**
 * Link-in-bio share page — put this URL in Instagram / TikTok / etc. bios.
 * Always under /practice/:slug/bio or /providers/:id/bio (not root vanity).
 */
export function practiceBioPath(
  provider: Pick<Provider, "slug" | "id">,
): string {
  if (provider.slug) return `/practice/${provider.slug}/bio`;
  return `/providers/${provider.id}/bio`;
}

/** Canonical public URL for a practitioner profile. */
export function practitionerPath(
  pro: Pick<Professional, "id"> &
    Partial<
      Pick<
        Professional,
        | "slug"
        | "handle"
        | "handleNamespace"
        | "vanityHandle"
        | "vanityStatus"
      >
    >,
): string {
  return practitionerPublicPath(pro);
}

/** Display title preferring structured titleKind, then free-text title. */
export function professionalDisplayTitle(pro: {
  title?: string | null;
  titleKind?: string | null;
}): string | null {
  return titleKindLabel(pro.titleKind) || pro.title?.trim() || null;
}

/** Build a namespaced path like /ayur/anita */
export function namespacedHandlePath(namespace: string, handle: string): string {
  const ns = namespace.toLowerCase();
  if (!isHandleNamespace(ns)) return `/pro/${handle}`;
  return `/${ns}/${handle}`;
}

export function isValidNamespace(ns: string): ns is HandleNamespace {
  return isHandleNamespace(ns);
}

/**
 * Canonical SEO path for a wellness center with Category and Hex-ID:
 * e.g. /ayurveda/ayur-healthcare-parramatta-1a2b3c4d
 */
export function centerPublicPath(provider: {
  id: string;
  slug?: string | null;
  type?: string | null;
}): string {
  const category = (provider.type?.toLowerCase() || "ayurveda").replace(/_/g, "-");
  const hex = provider.id.replace(/-/g, "").slice(0, 8);
  const baseSlug = provider.slug || "center";
  return `/${category}/${baseSlug}-${hex}`;
}

/**
 * Short Fresha-style path: /a/:slug-:hexId
 */
export function centerShortPath(provider: {
  id: string;
  slug?: string | null;
}): string {
  const hex = provider.id.replace(/-/g, "").slice(0, 8);
  const baseSlug = provider.slug || "center";
  return `/a/${baseSlug}-${hex}`;
}

