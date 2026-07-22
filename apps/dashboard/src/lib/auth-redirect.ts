/**
 * Safe post-auth return paths and login/register URLs.
 * Only allows same-origin relative paths (blocks open redirects).
 */

export function safeNextPath(path: string | null | undefined, fallback = "/dashboard"): string {
  if (!path) return fallback;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  // Block protocol-relative and scheme-like tricks
  if (trimmed.includes("://")) return fallback;
  return trimmed;
}

/** Build /login?next=… preserving the page the user was on. */
export function loginUrl(next?: string | null): string {
  const dest = safeNextPath(next, "");
  if (!dest) return "/login";
  return `/login?next=${encodeURIComponent(dest)}`;
}

/** Build /register?next=… (and optional as=provider). */
export function registerUrl(next?: string | null, asProvider = false): string {
  const params = new URLSearchParams();
  const dest = safeNextPath(next, "");
  if (dest) params.set("next", dest);
  if (asProvider) params.set("as", "provider");
  const q = params.toString();
  return q ? `/register?${q}` : "/register";
}
