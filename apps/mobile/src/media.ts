import { API_URL } from "./api";

/**
 * Normalize avatar/cover URLs (rewrite accidental localhost /files paths to API base).
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (url == null) return null;
  const raw = String(url).trim();
  if (!raw) return null;
  if (raw.startsWith("blob:") || raw.startsWith("data:") || raw.startsWith("file:")) return raw;

  const apiBase = (API_URL || "").replace(/\/$/, "");

  if (raw.startsWith("/files/") || raw.startsWith("/uploads/")) {
    return apiBase ? `${apiBase}${raw}` : raw;
  }

  try {
    const parsed = new URL(raw);
    const loopback =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0";
    if (
      loopback &&
      (parsed.pathname.startsWith("/files/") || parsed.pathname.startsWith("/uploads/"))
    ) {
      return apiBase ? `${apiBase}${parsed.pathname}${parsed.search}` : raw;
    }
    return raw;
  } catch {
    return raw;
  }
}
