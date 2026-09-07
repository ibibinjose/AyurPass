import type { HealthAuthorityBadge, Professional, Provider } from "./types";

export const AAA_PLACEHOLDER_EMAIL_DOMAIN = "@directory.ayurpass.local";

/** Account-only placeholder — never show as public contact. */
export function isDirectoryPlaceholderEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith(AAA_PLACEHOLDER_EMAIL_DOMAIN);
}

export function publicContactEmail(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  for (const c of candidates) {
    const v = c?.trim();
    if (v && v.includes("@") && !isDirectoryPlaceholderEmail(v)) return v;
  }
  return undefined;
}

export function hasAaaAttribution(
  authorities?: HealthAuthorityBadge[] | null,
  docs?: Professional["verificationDocuments"] | null,
): boolean {
  if (docs?.source === "aaa") return true;
  return (authorities ?? []).some((a) => a?.code?.toUpperCase() === "AAA");
}

/** Unclaimed AAA import: attribution present, not AyurPass-verified. */
export function isUnclaimedAaaListing(input: {
  verificationStatus?: string | null;
  healthAuthorities?: HealthAuthorityBadge[] | null;
  verificationDocuments?: Professional["verificationDocuments"] | null;
}): boolean {
  if (input.verificationStatus === "verified") return false;
  return hasAaaAttribution(input.healthAuthorities, input.verificationDocuments);
}

export function isUnclaimedAaaProvider(
  provider: Pick<Provider, "verificationStatus" | "healthAuthorities">,
): boolean {
  return isUnclaimedAaaListing({
    verificationStatus: provider.verificationStatus,
    healthAuthorities: provider.healthAuthorities,
  });
}

export function isUnclaimedAaaProfessional(
  pro: Pick<Professional, "verificationDocuments" | "healthAuthorities"> & {
    provider?: Pick<Provider, "verificationStatus" | "healthAuthorities"> | null;
  },
): boolean {
  const status = pro.provider?.verificationStatus;
  if (status === "verified") return false;
  return hasAaaAttribution(
    pro.healthAuthorities ?? pro.provider?.healthAuthorities,
    pro.verificationDocuments,
  );
}

/** Robots noindex for unclaimed AAA directory imports. */
export function shouldNoindexAaaDirectoryListing(
  providerOrPro:
    | Pick<Provider, "verificationStatus" | "healthAuthorities">
    | (Pick<Professional, "verificationDocuments" | "healthAuthorities"> & {
        provider?: Pick<Provider, "verificationStatus" | "healthAuthorities"> | null;
      }),
): boolean {
  if ("verificationDocuments" in providerOrPro || "provider" in providerOrPro) {
    return isUnclaimedAaaProfessional(
      providerOrPro as Pick<Professional, "verificationDocuments" | "healthAuthorities"> & {
        provider?: Pick<Provider, "verificationStatus" | "healthAuthorities"> | null;
      },
    );
  }
  return isUnclaimedAaaProvider(
    providerOrPro as Pick<Provider, "verificationStatus" | "healthAuthorities">,
  );
}
