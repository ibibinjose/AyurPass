import Link from "next/link";
import { formatCode, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Professional } from "@/lib/types";
import { BrandMark } from "./BrandMark";
import { ArrowRightIcon, MapPinIcon, ShieldIcon, UsersIcon } from "./icons";

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
  const stats = [
    professional.specializations.length > 0 
      ? countLabel(professional.specializations.length, "specialization") 
      : null,
    professional.yearsExperience 
      ? `${professional.yearsExperience} years exp.` 
      : null,
    professional.reviewCount > 0 
      ? countLabel(professional.reviewCount, "review") 
      : null,
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/providers/${provider?.id}/team/${professional.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface transition-shadow hover:shadow-[0_8px_30px_rgba(36,56,46,0.08)]"
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-gold-soft">
              <UsersIcon className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-display text-lg text-forest">
                {professional.user?.fullName || professional.title || "Professional"}
              </h3>
              <p className="text-sm text-ink-secondary">
                {professional.title || "Practitioner"}
              </p>
            </div>
          </div>
          {verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
              <ShieldIcon className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        {provider && (
          <p className="mt-3 text-sm text-ink-secondary">
            At <span className="font-medium text-forest">{provider.businessName}</span>
            <span className="mx-1">•</span>
            <span>{PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}</span>
          </p>
        )}

        {professional.code && (
          <p className="mt-2 text-xs font-mono tracking-wide text-ink-secondary">
            {formatCode(professional.code)}
          </p>
        )}

        {location && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-secondary">
            <MapPinIcon className="h-4 w-4 shrink-0 text-leaf" />
            {location}
          </p>
        )}

        {professional.specializations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {professional.specializations.slice(0, 3).map((spec, idx) => (
              <span 
                key={idx} 
                className="rounded-full bg-clay px-3 py-1 text-xs font-medium text-ink-secondary"
              >
                {spec}
              </span>
            ))}
            {professional.specializations.length > 3 && (
              <span className="rounded-full bg-clay px-3 py-1 text-xs font-medium text-ink-secondary">
                +{professional.specializations.length - 3} more
              </span>
            )}
          </div>
        )}

        {stats.length > 0 && (
          <p className="mt-3 text-xs text-ink-muted">{stats.join(" · ")}</p>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-forest group-hover:gap-2.5">
          View profile
          <ArrowRightIcon className="h-4 w-4 transition-all" />
        </span>
      </div>
    </Link>
  );
}