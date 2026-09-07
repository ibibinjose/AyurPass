import type { HealthAuthorityBadge } from "@/lib/types";
import { CheckIcon } from "@/components/icons";

/**
 * Local health-authority approval chip (AAA, AHPRA, NMC…).
 * Apple-like capsule: clear code + optional region.
 *
 * Set linkable=false when nested inside another <a>/Link (e.g. discover cards)
 * to avoid invalid nested anchors and hydration errors.
 */
export function AuthorityBadge({
  authority,
  size = "md",
  linkable = true,
}: {
  authority: HealthAuthorityBadge;
  size?: "sm" | "md";
  /** When false, never wrap in <a> (use inside parent links). */
  linkable?: boolean;
}) {
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  const checkClass = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const isVerifiedMark = Boolean(authority.verified);
  const isAaaAttribution =
    authority.code.toUpperCase() === "AAA" && !isVerifiedMark;
  const titleBits = [
    authority.name,
    authority.region,
    authority.registrationNumber,
    isAaaAttribution ? "Listed in the AAA directory" : null,
  ].filter(Boolean);
  const inner = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide ${pad} ${
        isAaaAttribution
          ? "border-leaf/30 bg-leaf/10 text-forest"
          : "border-[var(--separator)] bg-[var(--fill-secondary)] text-foreground"
      }`}
      title={titleBits.join(" · ")}
    >
      {isVerifiedMark ? (
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_0_0_1px_rgba(22,163,74,0.2)]"
          style={{ width: size === "sm" ? 13 : 15, height: size === "sm" ? 13 : 15 }}
          aria-hidden
        >
          <CheckIcon className={checkClass} strokeWidth={2.8} />
        </span>
      ) : null}
      <span>{isAaaAttribution ? "AAA directory" : authority.code}</span>
      {authority.region ? (
        <span className="font-medium normal-case tracking-normal text-ink-muted">
          {authority.region}
        </span>
      ) : null}
    </span>
  );

  if (linkable && authority.profileUrl) {
    return (
      <a
        href={authority.profileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex transition-opacity hover:opacity-80"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

export function AuthorityBadgeRow({
  authorities,
  size = "md",
  linkable = true,
}: {
  authorities: HealthAuthorityBadge[];
  size?: "sm" | "md";
  /** When false, badges are non-linking (safe inside parent <a>/Link). */
  linkable?: boolean;
}) {
  if (!authorities.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {authorities.map((a) => (
        <AuthorityBadge
          key={`${a.code}-${a.region ?? ""}-${a.registrationNumber ?? ""}`}
          authority={a}
          size={size}
          linkable={linkable}
        />
      ))}
    </div>
  );
}

/**
 * Discipline / focus tags + authority chips on one row
 * (e.g. Ayurveda · AAA AU) for cards and profiles.
 */
export function TagAuthorityRow({
  tags = [],
  authorities = [],
  size = "sm",
  maxTags = 4,
  maxAuthorities = 3,
  linkable = false,
  className = "",
}: {
  tags?: string[];
  authorities?: HealthAuthorityBadge[];
  size?: "sm" | "md";
  maxTags?: number;
  maxAuthorities?: number;
  linkable?: boolean;
  className?: string;
}) {
  const cleanTags = tags.map((t) => t.trim()).filter(Boolean);
  const auth = authorities.slice(0, maxAuthorities);
  // Avoid repeating a tag that is already an authority code (e.g. "AAA")
  const authCodes = new Set(auth.map((a) => a.code.toUpperCase()));
  const visibleTags = cleanTags
    .filter((t) => !authCodes.has(t.toUpperCase()))
    .slice(0, maxTags);
  const extraTags = Math.max(0, cleanTags.length - visibleTags.length);

  if (!visibleTags.length && !auth.length) return null;

  const tagPad =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-[11px]";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {visibleTags.map((t) => (
        <span
          key={t}
          className={`inline-flex items-center rounded-full border border-leaf/25 bg-leaf/10 font-semibold text-forest ${tagPad}`}
        >
          {t}
        </span>
      ))}
      {extraTags > 0 ? (
        <span
          className={`inline-flex items-center rounded-full bg-clay font-semibold text-ink-muted ${tagPad}`}
        >
          +{extraTags}
        </span>
      ) : null}
      {auth.map((a) => (
        <AuthorityBadge
          key={`${a.code}-${a.region ?? ""}-${a.registrationNumber ?? ""}`}
          authority={a}
          size={size}
          linkable={linkable}
        />
      ))}
    </div>
  );
}

/** Compact credential lines — registration & licence. */
export function CredentialLines({
  registrationNumber,
  licenceNumber,
  className = "",
}: {
  registrationNumber?: string | null;
  licenceNumber?: string | null;
  className?: string;
}) {
  const reg = registrationNumber?.trim();
  const lic = licenceNumber?.trim();
  if (!reg && !lic) return null;
  return (
    <dl className={`grid gap-1 text-sm ${className}`}>
      {reg ? (
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-ink-muted">Registration</dt>
          <dd className="font-semibold tabular-nums text-foreground">{reg}</dd>
        </div>
      ) : null}
      {lic ? (
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-ink-muted">Licence</dt>
          <dd className="font-semibold tabular-nums text-foreground">{lic}</dd>
        </div>
      ) : null}
    </dl>
  );
}
