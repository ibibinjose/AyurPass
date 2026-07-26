"use client";

import Link from "next/link";
import { CalendarDays, Hash, MapPin, Users } from "lucide-react";

import {
  CATEGORY_LABEL,
  CATEGORY_TAG_CLASS,
  formatCode,
  formatDuration,
  PROVIDER_TYPE_LABEL,
} from "@/lib/catalog";
import type { Service } from "@/lib/types";
import { BrandMark } from "./BrandMark";
import { QualityCardStrip } from "./QualityControls";
import { useDirectoryDensity } from "@/components/DirectoryLayout";
import { CardListMedia } from "@/components/CardListMedia";
import { formatLocalizedPrice } from "@/lib/api";
import { useLocation } from "@/context/LocationContext";

export function ServiceCard({
  service,
  actions,
  compact = true,
}: {
  service: Service;
  actions?: React.ReactNode;
  compact?: boolean;
}) {
  const density = useDirectoryDensity();
  const isList = density === "list";
  const { currency: userCurrency } = useLocation();

  const practitioner = service.professional?.user?.fullName;
  const image = service.imageUrl;
  const description = service.description?.replace(/\s+/g, " ").trim();
  const verified = service.provider?.verificationStatus === "verified";
  const isPackage = service.category === "PACKAGE";
  const serviceRating =
    service.rating != null && Number(service.rating) > 0
      ? service.rating
      : service.professional?.rating;
  const serviceReviews =
    service.reviewCount != null && service.reviewCount > 0
      ? service.reviewCount
      : service.professional?.reviewCount;
  const priceLabel = formatLocalizedPrice(service.price, userCurrency, service.currency || "AUD");
  const durationLabel = formatDuration(service.durationMinutes);
  const uniqueCode = service.code ? formatCode(service.code) : null;

  const quality = (
    <QualityCardStrip
      dense
      target={{ type: "service", id: service.id }}
      rating={serviceRating}
      reviewCount={serviceReviews}
      likeCount={service.likeCount}
      dislikeCount={service.dislikeCount}
      className="min-w-0"
    />
  );

  const bookBtn = actions ?? (
    <Link
      href={`/book/${service.id}`}
      className="profile-spring btn-press inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-forest to-forest-deep px-4.5 text-xs font-bold text-white shadow-sm hover:from-forest-deep hover:to-forest hover:shadow-md sm:text-sm"
      title={`Book for ${priceLabel}`}
      aria-label={`Book ${service.name} for ${priceLabel}`}
      onClick={(e) => e.stopPropagation()}
    >
      <CalendarDays className="h-4 w-4" strokeWidth={2} aria-hidden />
      Book
    </Link>
  );

  if (isList) {
    return (
      <article className="card-surface card-list-row card-lift group rounded-2xl">
        <CardListMedia
          src={image}
          alt=""
          fallback={
            <span className="font-display text-sm font-semibold text-white/90">
              {CATEGORY_LABEL[service.category]}
            </span>
          }
          badge={
            <>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${CATEGORY_TAG_CLASS[service.category]}`}
              >
                {CATEGORY_LABEL[service.category]}
              </span>
              {service.isVirtual ? (
                <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Online
                </span>
              ) : null}
            </>
          }
          topRight={
            <span className="rounded-full bg-surface/95 px-2 py-0.5 font-display text-xs font-semibold tabular-nums text-forest shadow-sm">
              {priceLabel}
            </span>
          }
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-3 sm:p-4">
          <div className="min-w-0">
            <h3 className="line-clamp-1 font-display text-base font-semibold text-forest sm:text-lg">
              {service.name}
            </h3>
            {service.provider ? (
              <p className="mt-0.5 truncate text-sm font-medium text-ink-secondary">
                {service.provider.businessName}
                {verified ? " · Verified" : ""}
                {practitioner ? ` · ${practitioner}` : ""}
              </p>
            ) : null}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold uppercase text-ink-secondary">
                {service.isVirtual ? "Virtual" : "In person"}
              </span>
              <span className="rounded-full bg-clay/80 px-2 py-0.5 text-[10px] font-bold tabular-nums text-ink-muted">
                {durationLabel}
              </span>
              {isPackage ? (
                <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-bold uppercase text-forest">
                  Package
                </span>
              ) : null}
              {uniqueCode ? (
                <span className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-hairline px-2 py-0.5 font-mono text-[10px] font-bold text-ink-muted">
                  <Hash className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                  {uniqueCode.replace(/^#/, "")}
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {quality}
            <span className="ml-auto flex items-center gap-2">{bookBtn}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card-surface card-lift group flex flex-col overflow-hidden rounded-3xl">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-clay">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-end bg-[linear-gradient(135deg,var(--color-forest),var(--color-leaf))] p-4"
          >
            <span className="font-display text-xl font-semibold text-white/90">
              {CATEGORY_LABEL[service.category]}
            </span>
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm ${CATEGORY_TAG_CLASS[service.category]}`}
            >
              {CATEGORY_LABEL[service.category]}
            </span>
            {service.isVirtual ? (
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-md">
                Online
              </span>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full bg-surface/95 px-2.5 py-1 font-display text-sm font-semibold tabular-nums text-forest shadow-sm backdrop-blur-sm">
            {priceLabel}
          </span>
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "gap-2 p-4" : "gap-2.5 p-4 sm:p-5"}`}>
        <h3 className="type-title line-clamp-2 text-[1.125rem] leading-snug sm:text-xl">
          {service.name}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${CATEGORY_TAG_CLASS[service.category]}`}
          >
            {CATEGORY_LABEL[service.category]}
          </span>
          {uniqueCode ? (
            <span className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-hairline bg-clay/40 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-ink-muted">
              <Hash className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
              {uniqueCode.replace(/^#/, "")}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full bg-clay px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-secondary">
            {service.isVirtual ? "Virtual" : "In person"}
          </span>
          <span className="inline-flex items-center rounded-full bg-clay/80 px-2.5 py-1 text-[10px] font-bold tabular-nums tracking-wide text-ink-muted">
            {durationLabel}
          </span>
          {service.maxParticipants > 1 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-clay/80 px-2.5 py-1 text-[10px] font-bold tabular-nums tracking-wide text-ink-muted">
              <Users className="h-3 w-3" strokeWidth={2} aria-hidden />
              {service.maxParticipants}
            </span>
          ) : null}
        </div>

        {service.provider ? (
          <div className="flex items-center gap-2.5">
            <BrandMark provider={service.provider} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-forest">
                {service.provider.businessName}
                {verified ? (
                  <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--system-blue)]">
                    Verified
                  </span>
                ) : null}
              </p>
              <p className="truncate text-xs font-medium text-ink-muted">
                {PROVIDER_TYPE_LABEL[service.provider.type] ?? service.provider.type}
                {practitioner ? ` · ${practitioner}` : ""}
              </p>
            </div>
          </div>
        ) : null}

        {description ? (
          <p className="line-clamp-2 text-sm font-medium leading-relaxed text-ink-secondary">
            {description}
          </p>
        ) : null}

        {!compact ? (
          <div className="flex flex-wrap items-center gap-x-3 text-sm font-medium text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-leaf" strokeWidth={2} aria-hidden />
              {service.isVirtual ? "Online session" : "In-person session"}
            </span>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[var(--separator)] pt-4">
          {quality}
          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2.5">
            <div className="text-right leading-tight">
              <p className="font-display text-lg font-semibold tabular-nums text-forest sm:text-xl">
                {priceLabel}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                {durationLabel}
              </p>
            </div>
            {bookBtn}
          </div>
        </div>
      </div>
    </article>
  );
}
