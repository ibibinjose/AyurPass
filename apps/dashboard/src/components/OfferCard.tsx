import Link from "next/link";
import type { Offer } from "@/lib/types";
import { formatOfferValidity, offerDaysLeft } from "@/lib/offers";
import { QualityCardStrip } from "./QualityControls";
import { ArrowRightIcon, CalendarIcon, SparkleIcon } from "./icons";

function CardShell({
  href,
  children,
}: {
  href?: string | null;
  children: React.ReactNode;
}) {
  const cls = "card-surface group flex flex-col overflow-hidden";
  if (!href) return <div className={cls}>{children}</div>;
  if (href.startsWith("/"))
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {children}
    </a>
  );
}

export function OfferCard({ offer }: { offer: Offer }) {
  const validity = formatOfferValidity(offer.startDate, offer.endDate);
  const daysLeft = offerDaysLeft(offer.endDate);
  const urgent = daysLeft != null && daysLeft > 0 && daysLeft <= 7;
  const description = offer.description?.replace(/\s+/g, " ").trim();

  return (
    <CardShell href={`/offers/${offer.id}`}>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-clay">
        {offer.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.imageUrl}
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {offer.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-forest shadow-sm backdrop-blur-sm">
              <SparkleIcon className="h-3 w-3" />
              Featured
            </span>
          ) : null}
          {urgent ? (
            <span className="rounded-full bg-red-600/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
              {daysLeft === 1 ? "Ends tomorrow" : `${daysLeft} days left`}
            </span>
          ) : null}
        </div>
        {offer.discountLabel ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-forest-deep shadow-sm">
            {offer.discountLabel}
          </span>
        ) : null}
        {offer.discipline ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-forest shadow-sm backdrop-blur-sm">
            {offer.discipline}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="type-title text-[1.125rem] leading-snug sm:text-xl">{offer.title}</h3>

        {description ? (
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-ink-secondary">
            {description}
          </p>
        ) : null}

        {validity ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted">
            <CalendarIcon className="h-4 w-4 shrink-0 text-leaf" />
            <span>{validity}</span>
          </p>
        ) : null}

        <QualityCardStrip target={{ type: "offer", id: offer.id }} />

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--separator)] pt-4">
          {offer.code ? (
            <span className="rounded-lg border border-dashed border-[var(--separator)] bg-clay/40 px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-ink-secondary">
              {offer.code}
            </span>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              No code needed
            </span>
          )}
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-forest transition-all group-hover:gap-1.5">
            {offer.ctaLabel || "View offer"}
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </CardShell>
  );
}
