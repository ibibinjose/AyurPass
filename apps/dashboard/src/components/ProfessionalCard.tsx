"use client";

import Link from "next/link";
import { Hash, MapPin, Sparkles } from "lucide-react";
import { formatCode, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Professional } from "@/lib/types";
import { VerifiedTick } from "./VerifiedTick";
import { VerifiedLogoBadge } from "./VerifiedLogoBadge";
import { TagAuthorityRow } from "./AuthorityBadge";
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
  // Practice focus tags (e.g. Ayurveda) — de-dupe with specialisations
  const brandTags =
    provider?.brandProfile &&
    typeof provider.brandProfile === "object" &&
    Array.isArray((provider.brandProfile as { tags?: string[] }).tags)
      ? ((provider.brandProfile as { tags?: string[] }).tags ?? []).filter(Boolean)
      : [];
  const disciplineTags = Array.from(
    new Set(
      [
        ...specs,
        ...brandTags,
        // Fallback label from practice type when no tags/specs
        !specs.length && !brandTags.length && provider?.type
          ? PROVIDER_TYPE_LABEL[provider.type] ?? null
          : null,
      ].filter(Boolean) as string[],
    ),
  );
  const years = professional.yearsExperience;
  const cover =
    provider?.brandProfile &&
    typeof provider.brandProfile === "object" &&
    "coverImageUrl" in provider.brandProfile
      ? ((provider.brandProfile as { coverImageUrl?: string | null }).coverImageUrl ?? null)
      : null;
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
    <span className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-forest px-4 text-xs font-bold text-white shadow-[0_4px_14px_rgba(36,56,46,0.16)] transition-colors group-hover:bg-forest-deep sm:text-sm">
      View profile
      <span aria-hidden className="text-white/80">
        →
      </span>
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
          badge={
            verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1D9BF0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                <VerifiedTick size="sm" />
                Verified
              </span>
            ) : null
          }
          topRight={
            rate != null ? (
              <span className="rounded-full bg-surface/95 px-2 py-0.5 font-display text-xs font-semibold tabular-nums text-forest shadow-sm">
                ${Number.isInteger(rate) ? rate : Math.round(rate)}
                <span className="text-[9px] font-bold text-ink-muted">/hr</span>
              </span>
            ) : null
          }
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-3.5 sm:p-4">
          <div className="min-w-0">
            <h3 className="flex min-w-0 items-center gap-1.5 font-display text-base font-semibold text-forest sm:text-lg">
              <span className="truncate">{name}</span>
              {verified ? <VerifiedTick size="sm" /> : null}
            </h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm font-medium text-ink-secondary">
              <span className="truncate">{title}</span>
              {code ? (
                <span className="inline-flex items-center gap-0.5 font-mono text-[10px] font-bold text-ink-muted">
                  <Hash className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                  {code}
                </span>
              ) : null}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
              {years != null && years > 0 ? (
                <span className="rounded-full bg-clay px-2 py-0.5 tabular-nums">
                  {years}+ yrs
                </span>
              ) : null}
              {rating > 0 ? (
                <span className="rounded-full bg-gold-soft/50 px-2 py-0.5 tabular-nums text-forest">
                  ★ {rating.toFixed(1)}
                  {reviews > 0 ? ` · ${reviews}` : ""}
                </span>
              ) : null}
              {location ? (
                <span className="inline-flex max-w-[12rem] items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
                  {location}
                </span>
              ) : null}
            </div>
            {provider ? (
              <p className="mt-1 truncate text-xs font-medium text-ink-muted">
                {provider.businessName}
                <span className="text-ink-muted/80">
                  {" "}
                  · {PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}
                </span>
              </p>
            ) : null}
            {disciplineTags.length > 0 || authorities.length > 0 ? (
              <TagAuthorityRow
                tags={disciplineTags}
                authorities={authorities}
                size="sm"
                maxTags={3}
                maxAuthorities={2}
                linkable={false}
                className="mt-2"
              />
            ) : null}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
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
      className="card-surface group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(36,56,46,0.12)]"
    >
      <div className="relative z-0 aspect-[5/3] w-full overflow-hidden bg-clay">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className="h-full w-full bg-[linear-gradient(145deg,#1e3228_0%,#3d6650_50%,#c4a35a_130%)]"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
        />
        {verified ? (
          <VerifiedLogoBadge size="md" className="absolute right-2.5 top-2.5 z-[1]" />
        ) : null}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-[1] flex flex-wrap items-end justify-between gap-2">
          {years != null && years > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface/95 px-2 py-0.5 text-[10px] font-bold tabular-nums text-forest shadow-sm backdrop-blur-sm">
              <Sparkles className="h-2.5 w-2.5 text-gold" strokeWidth={2.2} aria-hidden />
              {years}+ years
            </span>
          ) : (
            <span />
          )}
          {rate != null ? (
            <span className="rounded-full bg-surface/95 px-2.5 py-1 font-display text-sm font-semibold tabular-nums text-forest shadow-sm backdrop-blur-sm">
              ${Number.isInteger(rate) ? rate : Math.round(rate)}
              <span className="text-[10px] font-bold text-ink-muted">/hr</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col bg-surface px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
        <div className="relative z-20 -mt-10 mb-3 flex items-end gap-3 sm:-mt-11">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt=""
              className="h-[4.5rem] w-[4.5rem] rounded-[1.15rem] border-[3px] border-surface object-cover shadow-[0_8px_24px_rgba(36,56,46,0.22)] ring-1 ring-black/5 sm:h-20 sm:w-20"
            />
          ) : (
            <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.15rem] border-[3px] border-surface bg-forest font-display text-xl font-semibold text-gold-soft shadow-[0_8px_24px_rgba(36,56,46,0.22)] ring-1 ring-black/5 sm:h-20 sm:w-20">
              {initials(name)}
            </span>
          )}
          {rating > 0 ? (
            <div className="mb-1 rounded-xl border border-hairline bg-surface px-2.5 py-1.5 shadow-sm">
              <p className="text-xs font-bold tabular-nums text-forest">
                ★ {rating.toFixed(1)}
                {reviews > 0 ? (
                  <span className="ml-1 font-semibold text-ink-muted">({reviews})</span>
                ) : null}
              </p>
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <h3 className="flex min-w-0 items-center gap-1.5 font-display text-[1.15rem] font-semibold leading-snug text-forest sm:text-xl">
            <span className="truncate">{name}</span>
            {verified ? <VerifiedTick size="sm" /> : null}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-ink-secondary">
            <span className="line-clamp-1">{title}</span>
            {code ? (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-hairline bg-clay/40 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-ink-muted">
                <Hash className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                {code}
              </span>
            ) : null}
          </p>
        </div>

        {disciplineTags.length > 0 || authorities.length > 0 ? (
          <TagAuthorityRow
            tags={disciplineTags}
            authorities={authorities}
            size="sm"
            maxTags={3}
            maxAuthorities={2}
            linkable={false}
            className="mt-3"
          />
        ) : null}

        <div className="mt-3 space-y-1">
          {provider ? (
            <p className="truncate text-sm font-medium text-ink-secondary">
              <span className="text-ink-muted">At </span>
              <span className="font-semibold text-foreground">{provider.businessName}</span>
            </p>
          ) : null}
          {location ? (
            <p className="inline-flex max-w-full items-start gap-1.5 text-sm font-medium text-ink-muted">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
              <span className="line-clamp-1">{location}</span>
            </p>
          ) : null}
          {code ? (
            <p className="inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-wide text-ink-muted">
              <Hash className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
              {code}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[var(--separator)] pt-3.5">
          {quality}
          <span className="ml-auto">{cta}</span>
        </div>
      </div>
    </Link>
  );
}
