import type { HealthAuthorityBadge, Professional, Provider } from "./types";

/** Common local health / professional authorities (extensible). */
export const HEALTH_AUTHORITY_PRESETS: {
  code: string;
  name: string;
  region: string;
}[] = [
  { code: "AAA", name: "Australian Association of Ayurveda", region: "AU" },
  { code: "AHPRA", name: "Australian Health Practitioner Regulation Agency", region: "AU" },
  { code: "CMBA", name: "Chinese Medicine Board of Australia", region: "AU" },
  { code: "ATMS", name: "Australian Traditional-Medicine Society", region: "AU" },
  { code: "Yoga Aus", name: "Yoga Australia", region: "AU" },
  { code: "NMC", name: "National Medical Commission", region: "IN" },
  { code: "CCIM", name: "Central Council of Indian Medicine (legacy)", region: "IN" },
  { code: "CQC", name: "Care Quality Commission", region: "UK" },
  { code: "GMC", name: "General Medical Council", region: "UK" },
  { code: "CNHC", name: "Complementary & Natural Healthcare Council", region: "UK" },
  { code: "NCCAOM", name: "National Certification Commission for Acupuncture", region: "US" },
];

export function normalizeAuthorities(
  raw: HealthAuthorityBadge[] | null | undefined,
): HealthAuthorityBadge[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a) => a && typeof a.code === "string" && a.code.trim())
    .map((a) => ({
      code: a.code.trim(),
      name: (a.name || a.code).trim(),
      region: a.region?.trim() || undefined,
      registrationNumber: a.registrationNumber?.trim() || undefined,
      profileUrl: a.profileUrl?.trim() || undefined,
      verified: Boolean(a.verified),
    }));
}

/**
 * Merge explicit healthAuthorities with legacy AAA fields on verificationDocuments.
 */
export function authoritiesForProfessional(
  pro: Pick<Professional, "healthAuthorities" | "verificationDocuments">,
): HealthAuthorityBadge[] {
  const list = normalizeAuthorities(pro.healthAuthorities);
  const docs = pro.verificationDocuments;
  if (docs?.source === "aaa") {
    const existing = list.find((a) => a.code.toUpperCase() === "AAA");
    if (!existing) {
      list.unshift({
        code: "AAA",
        name: "Australian Association of Ayurveda",
        region: "AU",
        profileUrl: docs.profileUrl ?? undefined,
        registrationNumber: docs.membership ?? undefined,
        // Directory attribution only — never an AyurPass verified checkmark
        verified: false,
      });
    } else {
      // Ensure region / profile URL are populated for AAA imports.
      // Do not force verified=true — AAA membership is attribution metadata.
      if (!existing.region) existing.region = "AU";
      if (existing.verified == null) existing.verified = false;
      if (!existing.profileUrl && docs.profileUrl) existing.profileUrl = docs.profileUrl;
      if (!existing.registrationNumber && docs.membership) {
        existing.registrationNumber = docs.membership;
      }
    }
  }
  // Prefer AAA first when mixed with other marks
  list.sort((a, b) => {
    const ap = a.code.toUpperCase() === "AAA" ? 0 : 1;
    const bp = b.code.toUpperCase() === "AAA" ? 0 : 1;
    return ap - bp;
  });
  return list;
}

export function authoritiesForProvider(
  provider: Pick<Provider, "healthAuthorities">,
): HealthAuthorityBadge[] {
  return normalizeAuthorities(provider.healthAuthorities);
}

export function hasCredentials(
  reg?: string | null,
  licence?: string | null,
  authorities?: HealthAuthorityBadge[] | null,
): boolean {
  return Boolean(reg?.trim() || licence?.trim() || (authorities && authorities.length > 0));
}
