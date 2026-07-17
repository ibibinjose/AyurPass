import type { BrandSocialLinks, SocialCustomLink, SocialPlatform } from "@/lib/types";

export type SocialPlatformOption = {
  id: SocialPlatform;
  label: string;
  /**
   * Profile base URL shown as a fixed prefix (user only types the handle).
   * Omit for free-form URL platforms (Google, Tripadvisor, Other…).
   */
  baseUrl?: string;
  /** Placeholder for the handle field (when baseUrl is set). */
  handlePlaceholder?: string;
  /** Legacy full-URL placeholder when baseUrl is not set. */
  placeholder: string;
  /**
   * If true, URLs use /@handle (TikTok, Threads, YouTube).
   * Leading @ is stripped from input and re-applied in the path.
   */
  atInPath?: boolean;
};

/** Platforms users can pick when adding a social link. */
export const SOCIAL_PLATFORM_OPTIONS: SocialPlatformOption[] = [
  {
    id: "instagram",
    label: "Instagram",
    baseUrl: "https://instagram.com/",
    handlePlaceholder: "yourhandle",
    placeholder: "https://instagram.com/…",
  },
  {
    id: "facebook",
    label: "Facebook",
    baseUrl: "https://facebook.com/",
    handlePlaceholder: "yourpage",
    placeholder: "https://facebook.com/…",
  },
  {
    id: "youtube",
    label: "YouTube",
    baseUrl: "https://youtube.com/",
    handlePlaceholder: "channel",
    placeholder: "https://youtube.com/@…",
    atInPath: true,
  },
  {
    id: "x",
    label: "X (Twitter)",
    baseUrl: "https://x.com/",
    handlePlaceholder: "yourhandle",
    placeholder: "https://x.com/…",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    baseUrl: "https://linkedin.com/in/",
    handlePlaceholder: "your-profile",
    placeholder: "https://linkedin.com/in/…",
  },
  {
    id: "tiktok",
    label: "TikTok",
    baseUrl: "https://tiktok.com/",
    handlePlaceholder: "yourhandle",
    placeholder: "https://tiktok.com/@…",
    atInPath: true,
  },
  {
    id: "threads",
    label: "Threads",
    baseUrl: "https://threads.net/",
    handlePlaceholder: "yourhandle",
    placeholder: "https://threads.net/@…",
    atInPath: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    baseUrl: "https://wa.me/",
    handlePlaceholder: "15551234567",
    placeholder: "https://wa.me/…",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    baseUrl: "https://pinterest.com/",
    handlePlaceholder: "yourhandle",
    placeholder: "https://pinterest.com/…",
  },
  {
    id: "google",
    label: "Google Business",
    placeholder: "https://maps.google.com/… or share link",
  },
  {
    id: "tripadvisor",
    label: "Tripadvisor",
    placeholder: "https://tripadvisor.com/…",
  },
  {
    id: "yelp",
    label: "Yelp",
    placeholder: "https://yelp.com/biz/…",
  },
  {
    id: "other",
    label: "Other",
    placeholder: "https://…",
  },
];

export const SOCIAL_LABEL: Record<string, string> = Object.fromEntries(
  SOCIAL_PLATFORM_OPTIONS.map((p) => [p.id, p.label]),
);

export type SocialLinkRow = {
  /** Stable UI key */
  key: string;
  platform: SocialPlatform;
  /** Used when platform === "other" */
  label: string;
  /**
   * Full canonical URL (what we persist).
   * For handle-based platforms this is always baseUrl + handle.
   */
  url: string;
};

let rowSeq = 0;
function nextKey() {
  rowSeq += 1;
  return `sl-${Date.now()}-${rowSeq}`;
}

export function getSocialOption(platform: SocialPlatform): SocialPlatformOption | undefined {
  return SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === platform);
}

/** True when the platform uses a fixed base + handle field. */
export function platformUsesHandle(platform: SocialPlatform): boolean {
  return Boolean(getSocialOption(platform)?.baseUrl);
}

/** Short prefix shown in the input (e.g. "instagram.com/" or "x.com/"). */
export function platformPrefixLabel(platform: SocialPlatform): string {
  const opt = getSocialOption(platform);
  if (!opt?.baseUrl) return "";
  try {
    const u = new URL(opt.baseUrl);
    const path = u.pathname === "/" ? "" : u.pathname.replace(/^\//, "");
    return `${u.host.replace(/^www\./, "")}/${path}${opt.atInPath ? "@" : ""}`;
  } catch {
    return opt.baseUrl.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

/** Normalize user input into a bare handle (no @, no full URL paste). */
export function normalizeHandleInput(raw: string, platform: SocialPlatform): string {
  let h = raw.trim();
  if (!h) return "";

  // If they pasted a full URL, extract the handle.
  if (/^https?:\/\//i.test(h) || h.includes("://") || h.includes(".com/") || h.includes(".net/")) {
    return extractSocialHandle(platform, h.startsWith("http") ? h : `https://${h}`);
  }

  // Strip accidental scheme leftovers
  h = h.replace(/^@+/, "");
  // Strip trailing slashes and query
  h = h.split("?")[0].split("#")[0].replace(/\/+$/, "");
  // If they typed "instagram.com/foo" take the last path segment
  if (h.includes("/")) {
    const parts = h.split("/").filter(Boolean);
    h = parts[parts.length - 1] ?? h;
    h = h.replace(/^@+/, "");
  }
  return h;
}

/** Build full profile URL from platform + handle. */
export function composeSocialUrl(platform: SocialPlatform, handle: string): string {
  const opt = getSocialOption(platform);
  if (!opt?.baseUrl) return handle.trim();
  let h = normalizeHandleInput(handle, platform);
  if (!h) return "";
  // WhatsApp: digits only (wa.me/15551234567)
  if (platform === "whatsapp") {
    h = h.replace(/\D/g, "");
    if (!h) return "";
  }
  if (opt.atInPath) {
    return `${opt.baseUrl.replace(/\/?$/, "/")}@${h.replace(/^@+/, "")}`;
  }
  return `${opt.baseUrl.replace(/\/?$/, "/")}${h}`;
}

/** Extract handle from a stored full URL for a known platform. */
export function extractSocialHandle(platform: SocialPlatform, url: string): string {
  const raw = url.trim();
  if (!raw) return "";
  const opt = getSocialOption(platform);
  if (!opt?.baseUrl) return raw;

  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    // Drop empty segments
    const segments = u.pathname.split("/").filter(Boolean);

    // LinkedIn: /in/handle or /company/handle
    if (platform === "linkedin") {
      const inIdx = segments.findIndex((s) => s === "in" || s === "company");
      if (inIdx >= 0 && segments[inIdx + 1]) {
        return decodeURIComponent(segments[inIdx + 1]);
      }
    }

    // YouTube: /@handle, /c/name, /channel/id, /user/name
    if (platform === "youtube") {
      const at = segments.find((s) => s.startsWith("@"));
      if (at) return at.slice(1);
      const cIdx = segments.findIndex((s) => s === "c" || s === "user" || s === "channel");
      if (cIdx >= 0 && segments[cIdx + 1]) return decodeURIComponent(segments[cIdx + 1]);
      if (segments[0]) return decodeURIComponent(segments[0].replace(/^@/, ""));
    }

    // WhatsApp: path is the phone
    if (platform === "whatsapp") {
      return segments[0]?.replace(/\D/g, "") || raw.replace(/\D/g, "");
    }

    // Default: last non-empty path segment, strip leading @
    if (segments.length) {
      return decodeURIComponent(segments[segments.length - 1].replace(/^@+/, ""));
    }
  } catch {
    /* fall through */
  }

  // Fallback: strip known host prefixes
  const stripped = raw
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/^(instagram|facebook|x|twitter|tiktok|threads|pinterest|linkedin)\.(com|net)\//i, "")
    .replace(/^wa\.me\//i, "")
    .replace(/^in\//i, "")
    .replace(/^@+/, "")
    .split(/[/?#]/)[0];
  return stripped;
}

/** Flatten stored brand socialLinks into editable rows. */
export function socialLinksToRows(social?: BrandSocialLinks | null): SocialLinkRow[] {
  if (!social) return [];
  const rows: SocialLinkRow[] = [];
  for (const opt of SOCIAL_PLATFORM_OPTIONS) {
    if (opt.id === "other") continue;
    const url = social[opt.id as keyof BrandSocialLinks];
    if (typeof url === "string" && url.trim()) {
      rows.push({
        key: nextKey(),
        platform: opt.id,
        label: opt.label,
        url: url.trim(),
      });
    }
  }
  for (const c of social.custom ?? []) {
    if (c?.url?.trim()) {
      rows.push({
        key: nextKey(),
        platform: "other",
        label: c.label?.trim() || "Link",
        url: c.url.trim(),
      });
    }
  }
  return rows;
}

/** Build BrandSocialLinks payload from UI rows. */
export function rowsToSocialLinks(rows: SocialLinkRow[]): BrandSocialLinks {
  const out: BrandSocialLinks = {};
  const custom: SocialCustomLink[] = [];

  for (const row of rows) {
    const url = row.url.trim();
    if (!url) continue;
    if (row.platform === "other") {
      custom.push({ label: row.label.trim() || "Link", url });
      continue;
    }
    // First non-empty wins if duplicate platforms
    if (!out[row.platform]) {
      // Ensure handle-based platforms always persist a full URL
      if (platformUsesHandle(row.platform)) {
        const handle = extractSocialHandle(row.platform, url);
        out[row.platform] = composeSocialUrl(row.platform, handle) || url;
      } else {
        out[row.platform] = url;
      }
    }
  }
  if (custom.length) out.custom = custom.slice(0, 12);
  return out;
}

export function emptySocialRow(platform: SocialPlatform = "instagram"): SocialLinkRow {
  const opt = SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === platform) ?? SOCIAL_PLATFORM_OPTIONS[0];
  return {
    key: nextKey(),
    platform: opt.id,
    label: opt.label,
    url: "",
  };
}

/** Display label for public profiles. */
export function socialDisplayLabel(key: string, customLabel?: string): string {
  if (key === "custom" || key === "other") return customLabel || "Link";
  return SOCIAL_LABEL[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Pretty handle for profile UI — e.g. "@jane" or phone for WhatsApp.
 * Falls back to hostname when the platform is free-form.
 */
export function socialDisplayHandle(platform: string, url: string): string {
  const p = platform.toLowerCase();
  if (p === "other" || p === "google" || p === "tripadvisor" || p === "yelp") {
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      return u.hostname.replace(/^www\./, "") + (u.pathname !== "/" ? u.pathname.replace(/\/$/, "") : "");
    } catch {
      return url.replace(/^https?:\/\//, "").slice(0, 40);
    }
  }
  const h = extractSocialHandle(p as SocialPlatform, url);
  if (!h) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url.slice(0, 32);
    }
  }
  if (p === "whatsapp") return h;
  return h.startsWith("@") ? h : `@${h}`;
}

/** Known platforms from a brand socialLinks object → UI-ready rows. */
export function brandSocialToDisplay(
  social?: BrandSocialLinks | null,
): { platform: string; label: string; href: string; handle: string }[] {
  if (!social) return [];
  const out: { platform: string; label: string; href: string; handle: string }[] = [];
  for (const opt of SOCIAL_PLATFORM_OPTIONS) {
    if (opt.id === "other") continue;
    const url = social[opt.id as keyof BrandSocialLinks];
    if (typeof url === "string" && url.trim()) {
      out.push({
        platform: opt.id,
        label: opt.label,
        href: url.trim(),
        handle: socialDisplayHandle(opt.id, url.trim()),
      });
    }
  }
  for (const c of social.custom ?? []) {
    if (c?.url?.trim()) {
      out.push({
        platform: "other",
        label: c.label?.trim() || "Link",
        href: c.url.trim(),
        handle: socialDisplayHandle("other", c.url.trim()),
      });
    }
  }
  return out;
}
