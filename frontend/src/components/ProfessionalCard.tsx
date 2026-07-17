"use client";

import Link from "next/link";
import { Hash, MapPin, Stethoscope } from "lucide-react";
import { formatCode, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Professional } from "@/lib/types";
import { VerifiedTick } from "./VerifiedTick";
import { VerifiedLogoBadge } from "./VerifiedLogoBadge";
import { AuthorityBadgeRow } from "./AuthorityBadge";
import { authoritiesForProfessional } from "@/lib/credentials";
import { QualityCardStrip } from "./QualityControls";
import { practicePath, practitionerPath, professionalDisplayTitle } from "@/lib/paths";
import { useDirectoryDensity } from "@/components/DirectoryLayout";
import { CardListMedia } from "@/components/CardListMedia";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "AP"
  );
}

export function ProfessionalCard({ professional }: { professional: Professional }) {
  const density = useDirectoryDensity();
  const isList = density === "list";

  const provider = professional.provider;
  const location = provider?.address
    ? [provider.address.city, provider.address.state, provider.address.country]
        .filter(Boolean)
        .join(", ")
    : "";
  const authorities = authoritiesForProfessional(professional);
  const verified =
    provider?.verificationStatus === "verified" ||
    authorities.some((a) => a.verified || a.code.toUpperCase() === "AAA");
  const aaaProfileUrl = professional.verificationDocuments?.profileUrl;
  const name = professional.user?.fullName || professional.title || "Practitioner";
  const title =
    professionalDisplayTitle(professional) || professional.title || "Practitioner";
  const avatar = professional.user?.avatarUrl;
  const rating = Number(professional.rating ?? 0);
  const reviews = professional.reviewCount ?? 0;
  const rate =
    professional.hourlyRate != null && Number(professional.hourlyRate) > 0
      ? Number(professional.hourlyRate)
      : null;
  const code = professional.code ? formatCode(professional.code).replace(/^#/, "") : null;
  const specs = professional.specializations.filter(Boolean);
  const cover =
    provider?.brandProfile &&
    typeof provider.brandProfile === "object" &&
    "coverImageUrl" in provider.brandProfile
      ? ((provider.brandProfile as { coverImageUrl?: string | null }).coverImageUrl ?? null)
      : null;
  // Prefer portrait avatar for list thumb; fall back to practice cover
  const listImage = avatar || cover;

  const href =
    professional.slug || professional.handle || professional.vanityHandle
      ? practitionerPath(professional)
      : provider?.id
        ? practicePath(provider)
        : (aaaProfileUrl ?? "/discover");

  const external = Boolean(
    aaaProfileUrl && !professional.slug && !professional.handle && !provider?.id,
  );

  const quality = (
    <QualityCardStrip
      dense
      target={{ type: "professional", id: professional.id }}
      rating={rating}
      reviewCount={reviews}
      likeCount={professional.likeCount}
      dislikeCount={professional.dislikeCount}
      className="min-w-0"
    />
  );

  const cta = (
    <span className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-forest px-4 text-xs font-bold text-white shadow-[0_3px_12px_rgba(36,56,46,0.14)] transition-colors group-hover:bg-forest-deep sm:text-sm">
      View profile
      <span aria-hidden>→</span>
    </span>
  );

  if (isList) {
    return (
      <Link
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="card-surface card-list-row group"
      >
        <CardListMedia
          src={listImage}
          alt={name}
          fallback={
            <span className="font-display text-lg font-semibold text-gold-soft">
              {initials(name)}
            </span>
          }
          badge={verified ? <VerifiedLogoBadge size="sm" /> : null}
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="flex min-w-0 items-center gap-1.5 font-display text-base font-semibold text-forest sm:text-lg">
                <span className="truncate">{name}</span>
                {verified ? <VerifiedTick size="sm" /> : null}
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-ink-secondary">
                <Stethoscope className="h-3.5 w-3.5 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
                <span className="truncate">{title}</span>
                {professional.yearsExperience ? (
                  <span className="hidden shrink-0 text-ink-muted sm:inline">
                    · {professional.yearsExperience}+ yrs
                  </span>
                ) : null}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-medium text-ink-muted">
                {provider ? (
                  <span className="truncate">
                    {provider.businessName}
                    <span className="text-ink-muted/80">
                      {" "}
                      · {PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}
                    </span>
                  </span>
                ) : null}
                {location ? (
                  <span className="inline-flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
                    {location}
                  </span>
                ) : null}
              </div>
              {specs.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {specs.slice(0, 3).map((spec) => (
                    <span
                      key={spec}
                      className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-semibold text-ink-secondary"
                    >
                      {spec}
                    </span>
                  ))}
                  {specs.length > 3 ? (
                    <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                      +{specs.length - 3}
                    </span>
                  ) : null}
                  {code ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-hairline px-2 py-0.5 font-mono text-[10px] font-bold text-ink-muted">
                      <Hash className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                      {code}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            {rate != null ? (
              <p className="shrink-0 font-display text-base font-semibold tabular-nums text-forest">
                ${Number.isInteger(rate) ? rate : Math.round(rate)}
                <span className="text-[10px] font-bold text-ink-muted">/hr</span>
              </p>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {quality}
            <span className="ml-auto">{cta}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="card-surface group relative flex flex-col overflow-hidden transition-shadow hover:shadow-[0_12px_32px_rgba(36,56,46,0.1)]"
    >
      {/* Cover stays below avatar stacking context */}
      <div className="relative z-0 aspect-[16/10] w-full overflow-hidden bg-clay">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className="h-full w-full bg-[linear-gradient(135deg,var(--forest)_0%,var(--leaf)_55%,var(--gold-soft)_140%)]"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
        />
        {verified ? (
          <VerifiedLogoBadge size="md" className="absolute right-2.5 top-2.5 z-[1]" />
        ) : null}
        {code ? (
          <span className="absolute bottom-3 right-3 z-[1] rounded-full bg-surface/95 px-2 py-1 font-mono text-[10px] font-semibold tracking-wide text-ink-muted shadow-sm backdrop-blur-sm">
            #{code}
          </span>
        ) : null}
      </div>

      {/* Body sits above cover so avatar can overlap cleanly */}
      <div className="relative z-10 flex flex-1 flex-col bg-surface px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
        <div className="relative z-20 -mt-9 mb-3 flex items-end justify-between gap-3 sm:-mt-10">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt=""
              className="h-[4.25rem] w-[4.25rem] rounded-2xl border-[3px] border-surface object-cover shadow-[0_6px_18px_rgba(36,56,46,0.2)] ring-1 ring-black/5 sm:h-[4.75rem] sm:w-[4.75rem]"
            />
          ) : (
            <span className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl border-[3px] border-surface bg-forest font-display text-lg font-semibold text-gold-soft shadow-[0_6px_18px_rgba(36,56,46,0.2)] ring-1 ring-black/5 sm:h-[4.75rem] sm:w-[4.75rem] sm:text-xl">
              {initials(name)}
            </span>
          )}
          {rate != null ? (
            <div className="relative z-20 mb-0.5 rounded-xl border border-hairline bg-surface px-2.5 py-1.5 text-right shadow-sm">
              <p className="font-display text-sm font-semibold tabular-nums text-forest">
                ${Number.isInteger(rate) ? rate : Math.round(rate)}
                <span className="text-[10px] font-bold text-ink-muted">/hr</span>
              </p>
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <h3 className="flex min-w-0 items-center gap-1.5 font-display text-lg font-semibold leading-snug text-forest sm:text-[1.2rem]">
            <span className="truncate">{name}</span>
            {verified ? <VerifiedTick size="sm" /> : null}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-ink-secondary">
            <Stethoscope className="h-3.5 w-3.5 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
            <span className="truncate">{title}</span>
          </p>
        </div>

        {specs.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {specs.slice(0, 4).map((spec) => (
              <span
                key={spec}
                className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-semibold text-ink-secondary"
              >
                {spec}
              </span>
            ))}
            {specs.length > 4 ? (
              <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
                +{specs.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}

        {authorities.length > 0 ? (
          <div className="mt-2.5">
            <AuthorityBadgeRow authorities={authorities.slice(0, 3)} size="sm" linkable={false} />
          </div>
        ) : null}

        <div className="mt-3 space-y-1.5">
          {provider ? (
            <p className="truncate text-sm font-medium text-ink-secondary">
              At <span className="font-semibold text-foreground">{provider.businessName}</span>
              <span className="text-ink-muted">
                {" "}
                · {PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}
              </span>
            </p>
          ) : null}
          {location ? (
            <p className="inline-flex items-start gap-1.5 text-sm font-medium text-ink-muted">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
              <span className="line-clamp-1">{location}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[var(--separator)] pt-3">
          {quality}
          <span className="ml-auto">{cta}</span>
        </div>
      </div>
    </Link>
  );
}
