import Link from "next/link";
import { formatMoney } from "@/lib/api";
import { formatRetreatDates, RETREAT_CATEGORY_LABEL } from "@/lib/catalog";
import type { Retreat } from "@/lib/types";
import { VerifiedTick } from "./VerifiedTick";
import { CalendarIcon, MapPinIcon, SparkleIcon } from "./icons";

export function RetreatCard({ retreat }: { retreat: Retreat }) {
  const image = retreat.images?.[0];
  const location = [retreat.city, retreat.country].filter(Boolean).join(", ");
  const verified = retreat.verificationStatus === "verified";

  return (
    <Link
      href={`/retreats/${retreat.slug}`}
      className="card-surface group flex flex-col overflow-hidden"
    >
      <div className="relative h-44 w-full">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={retreat.title}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className="h-44 w-full bg-[linear-gradient(120deg,var(--color-forest),var(--color-leaf))]"
          />
        )}
        {retreat.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest-deep">
            <SparkleIcon className="h-3.5 w-3.5" />
            Handpicked
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="type-label text-leaf">
          {RETREAT_CATEGORY_LABEL[retreat.category] ?? retreat.category}
        </p>
        <h3 className="type-title mt-1.5 text-[1.125rem] leading-snug sm:text-xl">{retreat.title}</h3>

        {location ? (
          <p className="mt-2.5 inline-flex items-start gap-1.5 text-sm font-medium text-ink-secondary">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
            <span>{location}</span>
          </p>
        ) : null}
        <p className="mt-1.5 inline-flex items-start gap-1.5 text-sm font-medium text-ink-secondary">
          <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
          <span>
            {formatRetreatDates(retreat.startDate, retreat.endDate)}
            {retreat.durationDays ? ` · ${retreat.durationDays} days` : ""}
          </span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            {retreat.priceFrom != null ? (
              <p className="text-sm font-medium text-ink-muted">
                from{" "}
                <span className="font-display text-lg font-semibold text-forest sm:text-xl">
                  {formatMoney(retreat.priceFrom, retreat.currency)}
                </span>
              </p>
            ) : (
              <p className="text-sm font-medium text-ink-muted">Price on request</p>
            )}
            {retreat.provider ? (
              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink-secondary">
                {verified ? <VerifiedTick size="sm" /> : null}
                <span className="truncate">{retreat.provider.businessName}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
