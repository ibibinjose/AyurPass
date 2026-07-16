import Link from "next/link";
import type { Offer } from "@/lib/types";
import { ArrowRightIcon, SparkleIcon } from "./icons";

function CardShell({
  href,
  children,
}: {
  href?: string | null;
  children: React.ReactNode;
}) {
  const cls =
    "group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface transition-shadow hover:shadow-[0_8px_30px_rgba(36,56,46,0.08)]";
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
  return (
    <CardShell href={`/offers/${offer.id}`}>
      <div className="relative h-40 w-full">
        {offer.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={offer.imageUrl} alt="" className="h-40 w-full object-cover" />
        ) : (
          <div
            aria-hidden
            className="h-40 w-full bg-[linear-gradient(120deg,var(--color-forest),var(--color-leaf))]"
          />
        )}
        {offer.discountLabel && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-forest-deep">
            {offer.discountLabel}
          </span>
        )}
        {offer.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
            <SparkleIcon className="h-3.5 w-3.5" />
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {offer.discipline && (
          <p className="text-xs font-medium uppercase tracking-wide text-leaf">
            {offer.discipline}
          </p>
        )}
        <h3 className="mt-1 font-display text-lg leading-snug text-forest">{offer.title}</h3>
        {offer.description && (
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary line-clamp-3">
            {offer.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          {offer.code ? (
            <span className="rounded-lg border border-dashed border-hairline px-2.5 py-1 font-mono text-xs text-ink-secondary">
              {offer.code}
            </span>
          ) : (
            <span />
          )}
          {offer.ctaUrl && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-forest group-hover:gap-2.5">
              {offer.ctaLabel || "View offer"}
              <ArrowRightIcon className="h-4 w-4 transition-all" />
            </span>
          )}
        </div>
      </div>
    </CardShell>
  );
}
