import Link from "next/link";
import { formatMoney } from "@/lib/api";
import { formatRetreatDates, RETREAT_CATEGORY_LABEL } from "@/lib/catalog";
import type { Retreat } from "@/lib/types";
import { CalendarIcon, MapPinIcon, SparkleIcon } from "./icons";

export function RetreatCard({ retreat }: { retreat: Retreat }) {
  const image = retreat.images?.[0];
  const location = [retreat.city, retreat.country].filter(Boolean).join(", ");
  const verified = retreat.verificationStatus === "verified";

  return (
    <Link
      href={`/retreats/${retreat.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface transition-shadow hover:shadow-[0_8px_30px_rgba(36,56,46,0.08)]"
    >
      <div className="relative h-44 w-full">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-44 w-full object-cover" />
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

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-leaf">
          {RETREAT_CATEGORY_LABEL[retreat.category] ?? retreat.category}
        </p>
        <h3 className="mt-1.5 font-display text-lg leading-snug text-forest">{retreat.title}</h3>

        {location && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-secondary">
            <MapPinIcon className="h-4 w-4 shrink-0 text-leaf" />
            {location}
          </p>
        )}
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-secondary">
          <CalendarIcon className="h-4 w-4 shrink-0 text-leaf" />
          {formatRetreatDates(retreat.startDate, retreat.endDate)}
          {retreat.durationDays ? ` · ${retreat.durationDays} days` : ""}
        </p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            {retreat.priceFrom != null ? (
              <p className="text-sm text-ink-muted">
                from{" "}
                <span className="font-display text-lg text-forest">
                  {formatMoney(retreat.priceFrom, retreat.currency)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-ink-muted">Price on request</p>
            )}
            {retreat.provider && (
              <p className="mt-0.5 truncate text-xs text-ink-muted">
                {verified && "✓ "}
                {retreat.provider.businessName}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
