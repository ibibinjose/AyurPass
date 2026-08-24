import { API_URL } from "@/lib/env";

/** Same API base used by the typed dashboard client. */
function apiBaseUrl(): string {
  return API_URL.replace(/\/$/, "");
}

/** Public S3 media base (production). Used to heal legacy /files/ keys when possible. */
function s3MediaBase(): string {
  return (
    process.env.NEXT_PUBLIC_S3_MEDIA_BASE?.replace(/\/$/, "") ||
    "https://ayurpass-media-143326172833.s3.ap-southeast-2.amazonaws.com"
  );
}

/**
 * True when URL points at ephemeral API disk storage (`/files/…`).
 * Those objects are often lost after ECS redeploys — prefer re-upload to S3.
 */
export function isEphemeralApiFileUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const raw = url.trim();
  if (raw.startsWith("/files/") || raw.startsWith("/uploads/")) return true;
  try {
    const u = new URL(raw);
    return u.pathname.startsWith("/files/") || u.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}

/**
 * Normalize media URLs stored in the DB or returned by the API.
 *
 * - Relative `/files/…` → try S3 `media/` first (durable), fall back to API base
 * - Accidental localhost /files → rewrite
 * - External links left as-is
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (url == null) return null;
  const raw = String(url).trim();
  if (!raw) return null;

  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;

  const apiBase = apiBaseUrl();
  const s3Base = s3MediaBase();

  // Relative API disk path — also expose S3 candidate via getMediaUrlCandidates
  if (raw.startsWith("/files/") || raw.startsWith("/uploads/")) {
    const name = raw.split("/").pop() || "";
    if (name && s3Base) return `${s3Base}/media/${name}`;
    return apiBase ? `${apiBase}${raw}` : raw;
  }

  if (raw.startsWith("/media/")) {
    return s3Base ? `${s3Base}${raw}` : raw;
  }

  try {
    const parsed = new URL(raw);
    const isLoopback =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0";

    if (
      (isLoopback ||
        parsed.hostname === "api.ayurpass.com" ||
        parsed.hostname.endsWith(".ayurpass.com")) &&
      (parsed.pathname.startsWith("/files/") || parsed.pathname.startsWith("/uploads/"))
    ) {
      const name = parsed.pathname.split("/").pop() || "";
      // Prefer durable S3 object with the same filename (re-uploads use this key pattern)
      if (name && s3Base) return `${s3Base}/media/${name}`;
      if (apiBase && !apiBase.includes("localhost")) {
        return `${apiBase}${parsed.pathname}${parsed.search}`;
      }
      if (apiBase) return `${apiBase}${parsed.pathname}${parsed.search}`;
    }

    return raw;
  } catch {
    if (/^[\w.-]+\.(jpe?g|png|webp|gif)$/i.test(raw)) {
      if (s3Base) return `${s3Base}/media/${raw}`;
      return apiBase ? `${apiBase}/files/${raw}` : `/files/${raw}`;
    }
    return raw;
  }
}

/**
 * Ordered URL candidates for preview: primary resolve, then raw, then S3/API variants.
 * MediaField tries these until one loads.
 */
export function getMediaUrlCandidates(url: string | null | undefined): string[] {
  if (!url?.trim()) return [];
  const raw = url.trim();
  const out: string[] = [];
  const add = (u: string | null | undefined) => {
    if (u && !out.includes(u)) out.push(u);
  };

  add(resolveMediaUrl(raw));
  add(raw);

  try {
    const path = raw.startsWith("/") ? raw : new URL(raw).pathname;
    const name = path.split("/").pop() || "";
    if (name && /\.(jpe?g|png|webp|gif)$/i.test(name)) {
      add(`${s3MediaBase()}/media/${name}`);
      const api = apiBaseUrl();
      if (api) add(`${api}/files/${name}`);
    }
  } catch {
    /* ignore */
  }

  return out;
}

/** True when a URL is a remote http(s) image link (not blob/data). */
export function isHttpImageUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Light validation for the “paste image link” path.
 * Social CDNs (LinkedIn, X, Instagram, etc.) are allowed; we only check shape.
 */
export function validateImageLink(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return "Paste an image URL.";
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return "Use a public https image link, not a local preview.";
  }
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return "Image link must start with https://";
    }
    return null;
  } catch {
    return "Enter a full image URL (https://…).";
  }
}
