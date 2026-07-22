import Link from "next/link";
import { formatMoney } from "@/lib/api";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { WellnessPackage } from "@/lib/types";
import { ArrowRightIcon, CalendarIcon, LeafIcon, SparkleIcon } from "./icons";

export function PackageCard({
  pkg,
  actions,
}: {
  pkg: WellnessPackage;
  actions?: React.ReactNode;
}) {
  const description = pkg.description?.replace(/\s+/g, " ").trim();
  const verified = pkg.provider?.verificationStatus === "verified";
  const bookable = Boolean(pkg.serviceId);
  const href = bookable ? `/book/${pkg.serviceId}` : pkg.provider?.id ? `/providers/${pkg.provider.id}` : "/discover";

  return (
    <article className="card-surface group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-clay">
        <div
          aria-hidden
          className="flex h-full w-full flex-col justify-between bg-[linear-gradient(135deg,var(--color-forest)_0%,var(--color-leaf)_55%,color-mix(in_srgb,var(--color-gold)_40%,var(--color-leaf))_100%)] p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              <SparkleIcon className="h-3 w-3" />
              Package
            </span>
            {pkg.isRecurring ? (
              <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-forest-deep shadow-sm">
                Recurring
              </span>
            ) : null}
          </div>
          <div className="flex items-end justify-between gap-3">
            <LeafIcon className="h-10 w-10 text-gold-soft/80" />
            {pkg.durationDays != null ? (
              <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {pkg.durationDays} {pkg.durationDays === 1 ? "day" : "days"}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="type-title text-[1.125rem] leading-snug sm:text-xl">{pkg.name}</h3>

        {pkg.provider ? (
          <p className="mt-2 text-sm font-semibold text-forest">
            {pkg.provider.businessName}
            {verified ? (
              <span className="font-medium text-ink-muted"> · Verified</span>
            ) : null}
          </p>
        ) : null}
        {pkg.provider ? (
          <p className="mt-0.5 text-xs font-medium text-ink-muted">
            {PROVIDER_TYPE_LABEL[pkg.provider.type] ?? pkg.provider.type}
          </p>
        ) : null}

        {description ? (
          <p className="mt-2.5 line-clamp-2 text-sm font-medium leading-relaxed text-ink-secondary">
            {description}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {pkg.durationDays != null ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--separator)] bg-clay/40 px-2.5 py-1 text-xs font-semibold text-ink-secondary">
              <CalendarIcon className="h-3.5 w-3.5 text-leaf" />
              {pkg.durationDays} {pkg.durationDays === 1 ? "day" : "days"}
            </span>
          ) : null}
          {pkg.isRecurring ? (
            <span className="rounded-full border border-[var(--separator)] bg-clay/40 px-2.5 py-1 text-xs font-semibold text-ink-secondary">
              Membership-style
            </span>
          ) : null}
          {bookable ? (
            <span className="rounded-full border border-[var(--separator)] bg-leaf/10 px-2.5 py-1 text-xs font-semibold text-forest">
              Bookable online
            </span>
          ) : (
            <span className="rounded-full border border-[var(--separator)] bg-clay/40 px-2.5 py-1 text-xs font-semibold text-ink-muted">
              Enquire with host
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--separator)] pt-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">From</p>
            <p className="font-display text-lg font-semibold tabular-nums text-forest sm:text-xl">
              {formatMoney(pkg.totalPrice)}
            </p>
          </div>
          {actions ?? (
            <Link
              href={href}
              className="profile-spring inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(36,56,46,0.18)] hover:bg-forest-deep"
            >
              {bookable ? "Book" : "View host"}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
