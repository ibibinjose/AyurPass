import Link from "next/link";
import { formatMoney } from "@/lib/api";
import { formatRetreatDates, RETREAT_CATEGORY_LABEL } from "@/lib/catalog";
import type { Retreat } from "@/lib/types";
import { VerifiedTick } from "./VerifiedTick";
import { QualityCardStrip } from "./QualityControls";
import {
  ArrowRightIcon,
  CalendarIcon,
  MapPinIcon,
  SparkleIcon,
  UsersIcon,
} from "./icons";

export function RetreatCard({ retreat }: { retreat: Retreat }) {
  const image = retreat.images?.[0];
  const location = [retreat.city, retreat.country].filter(Boolean).join(", ");
  const verified =
    retreat.verificationStatus === "verified" ||
    retreat.provider?.verificationStatus === "verified";
  const summary = retreat.summary?.replace(/\s+/g, " ").trim();

  return (
    <Link
      href={`/retreats/${retreat.slug}`}
      className="card-surface group flex flex-col overflow-hidden"
    >
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
            className="h-full w-full bg-[linear-gradient(135deg,var(--color-forest),var(--color-leaf))]"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {retreat.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-forest-deep shadow-sm">
              <SparkleIcon className="h-3 w-3" />
              Handpicked
            </span>
          ) : null}
          {retreat.durationDays ? (
            <span className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              {retreat.durationDays} days
            </span>
          ) : null}
        </div>
        <span className="absolute bottom-3 left-3 rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-forest shadow-sm backdrop-blur-sm">
          {RETREAT_CATEGORY_LABEL[retreat.category] ?? retreat.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="type-title text-[1.125rem] leading-snug sm:text-xl">{retreat.title}</h3>

        {summary ? (
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-ink-secondary">
            {summary}
          </p>
        ) : null}

        <div className="mt-3 space-y-1.5">
          {location ? (
            <p className="inline-flex items-start gap-1.5 text-sm font-medium text-ink-secondary">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
              <span>{location}</span>
            </p>
          ) : null}
          <p className="inline-flex items-start gap-1.5 text-sm font-medium text-ink-secondary">
            <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
            <span>{formatRetreatDates(retreat.startDate, retreat.endDate)}</span>
          </p>
          {retreat.capacity ? (
            <p className="inline-flex items-start gap-1.5 text-sm font-medium text-ink-secondary">
              <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
              <span>Up to {retreat.capacity} guests</span>
            </p>
          ) : null}
          {retreat.skillLevel ? (
            <p className="text-sm font-medium text-ink-muted">
              Level: <span className="text-ink-secondary">{retreat.skillLevel}</span>
            </p>
          ) : null}
        </div>

        <QualityCardStrip target={{ type: "retreat", id: retreat.id }} />

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--separator)] pt-4">
          <div className="min-w-0">
            {retreat.priceFrom != null ? (
              <p className="text-sm font-medium text-ink-muted">
                from{" "}
                <span className="font-display text-lg font-semibold tabular-nums text-forest sm:text-xl">
                  {formatMoney(retreat.priceFrom, retreat.currency)}
                </span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-ink-secondary">Price on request</p>
            )}
            {retreat.provider ? (
              <p className="mt-1 flex min-w-0 items-center gap-1 text-sm font-semibold text-ink-secondary">
                <span className="truncate">{retreat.provider.businessName}</span>
                {verified ? <VerifiedTick size="sm" /> : null}
              </p>
            ) : null}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-forest transition-all group-hover:gap-1.5">
            View
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
