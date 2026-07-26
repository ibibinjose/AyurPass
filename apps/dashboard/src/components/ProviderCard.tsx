"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatAddress, formatCode, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { practicePath } from "@/lib/paths";
import type { Provider } from "@/lib/types";
import { BrandMark } from "./BrandMark";
import { VerifiedTick } from "./VerifiedTick";
import { VerifiedLogoBadge } from "./VerifiedLogoBadge";
import { TagAuthorityRow } from "./AuthorityBadge";
import { authoritiesForProvider } from "@/lib/credentials";
import { QualityCardStrip } from "./QualityControls";
import { useDirectoryDensity } from "@/components/DirectoryLayout";
import { CardListMedia } from "./CardListMedia";

function countLabel(n: number, singular: string) {
  return `${n} ${n === 1 ? singular : `${singular}s`}`;
}

export function ProviderCard({ provider }: { provider: Provider }) {
  const density = useDirectoryDensity();
  const isList = density === "list";

  const location = formatAddress(provider.address);
  const authorities = authoritiesForProvider(provider);
  const verified =
    provider.verificationStatus === "verified" ||
    authorities.some((a) => a.verified || a.code.toUpperCase() === "AAA");
  const brand = provider.brandProfile;
  const cover = brand?.coverImageUrl ?? brand?.logoUrl ?? null;
  const counts = provider._count;
  const bookable = (counts?.services ?? 0) > 0;
  const showDiscoveryTags = provider.listingTier === "FREE_LISTING" || !bookable;
  const tags = (brand?.tags ?? []).filter(Boolean).slice(0, 3);
  const stats = counts
    ? [
        counts.services ? countLabel(counts.services, "service") : null,
        counts.products ? countLabel(counts.products, "product") : null,
        counts.professionals ? countLabel(counts.professionals, "practitioner") : null,
      ].filter(Boolean)
    : [];

  const quality = (
    <QualityCardStrip
      dense
      target={{ type: "provider", id: provider.id }}
      rating={provider.rating}
      reviewCount={provider.reviewCount}
      likeCount={provider.likeCount}
      dislikeCount={provider.dislikeCount}
    />
  );

  const cta = (
    <span className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-forest to-forest-deep px-3.5 text-xs font-bold text-white shadow-xs transition-all group-hover:from-forest-deep group-hover:to-forest group-hover:shadow-md sm:min-h-9 sm:px-4">
      View practice
      <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
    </span>
  );

  if (isList) {
    return (
      <Link href={practicePath(provider)} className="card-surface card-list-row card-lift group rounded-2xl">
        <CardListMedia
          src={cover}
          alt={`${provider.businessName} cover`}
          fallback={
            <span className="font-display text-sm font-semibold text-white/90">
              {(provider.businessName || "P").slice(0, 1)}
            </span>
          }
          badge={verified ? <VerifiedLogoBadge size="sm" /> : null}
          footer={
            brand?.priceBand ? (
              <span className="rounded-full bg-surface/95 px-2 py-0.5 text-[10px] font-bold text-forest shadow-xs">
                {brand.priceBand}
              </span>
            ) : undefined
          }
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-2.5 sm:p-3">
          <div className="flex items-start gap-2.5">
            <BrandMark provider={provider} size="sm" className="mt-0.5 hidden sm:flex" />
            <div className="min-w-0 flex-1">
              <h3 className="flex min-w-0 items-center gap-1.5 font-display text-base font-semibold text-forest sm:text-lg">
                <span className="truncate">{provider.businessName}</span>
                {verified ? <VerifiedTick size="sm" /> : null}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-ink-secondary">
                {PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}
                {provider.code ? (
                  <span className="ml-2 font-mono text-[10px] text-ink-muted">
                    {formatCode(provider.code)}
                  </span>
                ) : null}
              </p>
              {location ? (
                <p className="mt-1 inline-flex max-w-full items-center gap-1 text-xs font-medium text-ink-muted">
                  <MapPin className="h-3 w-3 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
                  <span className="truncate">{location}</span>
                </p>
              ) : null}
              {tags.length > 0 || authorities.length > 0 ? (
                <TagAuthorityRow
                  tags={tags}
                  authorities={authorities}
                  size="sm"
                  maxTags={3}
                  maxAuthorities={2}
                  linkable={false}
                  className="mt-1.5"
                />
              ) : stats.length > 0 ? (
                <p className="mt-1 text-xs font-medium text-ink-muted">{stats.join(" · ")}</p>
              ) : null}
            </div>
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
      href={practicePath(provider)}
      className="card-surface card-lift group relative flex flex-col overflow-hidden rounded-3xl"
    >
      <div className="relative z-0 aspect-[16/10] w-full overflow-hidden bg-clay">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`${provider.businessName} cover`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className="h-full w-full bg-[linear-gradient(120deg,var(--color-forest),var(--color-leaf))]"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        />
        {verified ? (
          <VerifiedLogoBadge size="md" className="absolute right-2.5 top-2.5 z-[1]" />
        ) : null}
        {brand?.priceBand ? (
          <span className="absolute bottom-3 left-3 z-[1] rounded-full bg-surface/95 px-2.5 py-1 text-xs font-bold text-forest shadow-sm backdrop-blur-sm">
            {brand.priceBand}
          </span>
        ) : null}
      </div>

      <div className="relative z-10 flex flex-1 flex-col bg-surface p-4 sm:p-5">
        <div className="relative z-20 -mt-10 flex items-end justify-between gap-2 sm:-mt-11">
          <BrandMark
            provider={provider}
            size="lg"
            className="ring-[3px] ring-surface shadow-[0_6px_18px_rgba(36,56,46,0.2)]"
          />
        </div>

        <h3 className="type-title mt-3 flex min-w-0 items-center gap-1.5 text-[1.125rem] sm:mt-4 sm:text-xl">
          <span className="min-w-0 truncate">{provider.businessName}</span>
          {verified ? <VerifiedTick size="md" /> : null}
        </h3>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-ink-secondary">
          <span>{PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}</span>
          {provider.code ? (
            <span className="inline-flex items-center rounded-full border border-dashed border-hairline bg-clay/40 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-ink-muted">
              {formatCode(provider.code)}
            </span>
          ) : null}
        </p>

        {location ? (
          <p className="mt-2.5 inline-flex items-start gap-1.5 text-sm font-medium leading-snug text-ink-secondary">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf" strokeWidth={2} aria-hidden />
            <span>{location}</span>
          </p>
        ) : null}

        {tags.length > 0 || authorities.length > 0 ? (
          <TagAuthorityRow
            tags={tags}
            authorities={authorities}
            size="sm"
            maxTags={showDiscoveryTags ? 4 : 3}
            maxAuthorities={3}
            linkable={false}
            className="mt-3"
          />
        ) : stats.length > 0 ? (
          <p className="mt-3 text-sm font-medium text-ink-muted">{stats.join(" · ")}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[var(--separator)] pt-4">
          {quality}
          <span className="ml-auto">{cta}</span>
        </div>
      </div>
    </Link>
  );
}
