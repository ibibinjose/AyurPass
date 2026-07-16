import Link from "next/link";
import { formatCode, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Professional } from "@/lib/types";
import { VerifiedTick } from "./VerifiedTick";
import { AuthorityBadgeRow } from "./AuthorityBadge";
import { authoritiesForProfessional } from "@/lib/credentials";
import { ArrowRightIcon, MapPinIcon, UsersIcon } from "./icons";

function countLabel(n: number, singular: string) {
  return `${n} ${n === 1 ? singular : `${singular}s`}`;
}

export function ProfessionalCard({ professional }: { professional: Professional }) {
  const provider = professional.provider;
  const location = provider?.address
    ? [provider.address.city, provider.address.state, provider.address.country]
        .filter(Boolean)
        .join(", ")
    : "";
  const verified = provider?.verificationStatus === "verified";
  const authorities = authoritiesForProfessional(professional);
  const aaaProfileUrl = professional.verificationDocuments?.profileUrl;
  const name = professional.user?.fullName || professional.title || "Professional";
  const stats = [
    professional.specializations.length > 0
      ? countLabel(professional.specializations.length, "specialization")
      : null,
    professional.yearsExperience ? `${professional.yearsExperience} years exp.` : null,
    professional.reviewCount > 0 ? countLabel(professional.reviewCount, "review") : null,
  ].filter(Boolean) as string[];

  const href = professional.slug
    ? `/me/${professional.slug}`
    : provider?.id
      ? `/providers/${provider.id}`
      : aaaProfileUrl ?? "/discover";

  return (
    <Link
      href={href}
      {...(aaaProfileUrl && !professional.slug && !provider?.id
        ? { target: "_blank", rel: "noreferrer" }
        : {})}
      className="card-surface group flex flex-col overflow-hidden"
    >
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-gold-soft sm:h-14 sm:w-14">
              <UsersIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <h3 className="type-title truncate text-[1.125rem] sm:text-xl">{name}</h3>
                {verified ? <VerifiedTick size="sm" /> : null}
              </div>
              <p className="mt-0.5 text-sm font-medium text-ink-secondary">
                {professional.title || "Practitioner"}
              </p>
            </div>
          </div>
        </div>
        {authorities.length > 0 ? (
          <div className="mt-3">
            <AuthorityBadgeRow authorities={authorities} size="sm" />
          </div>
        ) : null}
        {(professional.registrationNumber || professional.licenceNumber) && (
          <p className="mt-2 text-xs font-medium text-ink-muted">
            {professional.registrationNumber ? `Reg ${professional.registrationNumber}` : null}
            {professional.registrationNumber && professional.licenceNumber ? " · " : null}
            {professional.licenceNumber ? `Lic ${professional.licenceNumber}` : null}
          </p>
        )}

        {provider ? (
          <p className="mt-3 text-sm font-medium leading-snug text-ink-secondary">
            At <span className="font-semibold text-foreground">{provider.businessName}</span>
            <span className="mx-1.5 text-ink-muted">·</span>
            <span>{PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}</span>
          </p>
        ) : null}

        {professional.code ? (
          <p className="mt-2 font-mono text-xs font-medium tracking-wide text-ink-muted">
            {formatCode(professional.code)}
          </p>
        ) : null}

        {location ? (
          <p className="mt-2 inline-flex items-start gap-1.5 text-sm font-medium text-ink-secondary">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
            <span>{location}</span>
          </p>
        ) : null}

        {professional.specializations.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {professional.specializations.slice(0, 3).map((spec, idx) => (
              <span
                key={idx}
                className="rounded-full bg-clay px-3 py-1 text-xs font-semibold text-ink-secondary"
              >
                {spec}
              </span>
            ))}
            {professional.specializations.length > 3 ? (
              <span className="rounded-full bg-clay px-3 py-1 text-xs font-semibold text-ink-secondary">
                +{professional.specializations.length - 3} more
              </span>
            ) : null}
          </div>
        ) : null}

        {stats.length > 0 ? (
          <p className="mt-3 text-sm font-medium text-ink-muted">{stats.join(" · ")}</p>
        ) : null}

        <span className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-sm font-semibold text-forest group-hover:gap-2.5 sm:pt-5">
          View profile
          <ArrowRightIcon className="h-4 w-4 transition-all" />
        </span>
      </div>
    </Link>
  );
}
