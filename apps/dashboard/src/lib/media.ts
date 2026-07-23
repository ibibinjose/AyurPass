/** Same base as `api.API_URL` — kept local to avoid circular imports. */
function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

/**
 * Normalize media URLs stored in the DB or returned by the API.
 *
 * - Relative `/files/…` paths → absolute against NEXT_PUBLIC_API_URL
 * - Accidental `http://localhost:4000/files/…` (API missing PUBLIC_API_URL) → rewrite to API base
 * - External links (LinkedIn, Instagram CDN, X, etc.) left as-is
 * - blob: / data: previews left as-is
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (url == null) return null;
  const raw = String(url).trim();
  if (!raw) return null;

  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;

  const apiBase = apiBaseUrl();

  if (raw.startsWith("/files/") || raw.startsWith("/uploads/")) {
    return apiBase ? `${apiBase}${raw}` : raw;
  }

  try {
    const parsed = new URL(raw);
    const isLoopback =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0";

    if (
      isLoopback &&
      (parsed.pathname.startsWith("/files/") || parsed.pathname.startsWith("/uploads/"))
    ) {
      if (apiBase && !apiBase.includes("localhost") && !apiBase.includes("127.0.0.1")) {
        return `${apiBase}${parsed.pathname}${parsed.search}`;
      }
      // Dev: keep loopback if the client also talks to localhost
      if (apiBase) return `${apiBase}${parsed.pathname}${parsed.search}`;
    }

    return raw;
  } catch {
    // Bare filename or non-URL string — treat as files path if it looks like one
    if (/^[\w.-]+\.(jpe?g|png|webp|gif)$/i.test(raw)) {
      return apiBase ? `${apiBase}/files/${raw}` : `/files/${raw}`;
    }
    return raw;
  }
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
