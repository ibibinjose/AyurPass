import type { HealthAuthorityBadge } from "@/lib/types";

/**
 * Local health-authority approval chip (AAA, AHPRA, NMC…).
 * Apple-like capsule: clear code + optional region.
 */
export function AuthorityBadge({
  authority,
  size = "md",
}: {
  authority: HealthAuthorityBadge;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  const inner = (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-[var(--separator)] bg-[var(--fill-secondary)] font-semibold uppercase tracking-wide text-foreground ${pad}`}
      title={[authority.name, authority.region, authority.registrationNumber]
        .filter(Boolean)
        .join(" · ")}
    >
      <span className="text-[var(--system-blue)]" aria-hidden>
        ✓
      </span>
      <span>{authority.code}</span>
      {authority.region ? (
        <span className="font-medium normal-case tracking-normal text-ink-muted">
          {authority.region}
        </span>
      ) : null}
    </span>
  );

  if (authority.profileUrl) {
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
}: {
  authorities: HealthAuthorityBadge[];
  size?: "sm" | "md";
}) {
  if (!authorities.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {authorities.map((a) => (
        <AuthorityBadge key={`${a.code}-${a.region ?? ""}-${a.registrationNumber ?? ""}`} authority={a} size={size} />
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
