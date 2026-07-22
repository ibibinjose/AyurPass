"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Offer } from "@/lib/types";
import { formatOfferValidity, offerDaysLeft } from "@/lib/offers";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { EmptyState } from "@/components/ui";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  GiftIcon,
  SparkleIcon,
} from "@/components/icons";

export default function OfferDetailClient() {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null | undefined>(undefined);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .offer(id)
      .then((o) => {
        setOffer(o);
        if (o) {
          void import("@/hooks/useRecentViews").then(({ trackRecentView }) =>
            trackRecentView({
              kind: "offer",
              id: o.id,
              title: o.title,
              href: `/offers/${o.id}`,
              subtitle: o.discountLabel ?? o.discipline ?? undefined,
            }),
          );
        }
      })
      .catch(() => setError(true));
  }, [id]);

  const loading = !error && offer === undefined;

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <LayoutWrapper>
      <div className="flex-1 pb-10">
        <div className="page-shell !pt-8 !pb-0">
          <Link
            href="/offers"
            className="profile-spring inline-flex min-h-10 items-center rounded-full px-1 text-sm font-semibold text-ink-muted transition-colors hover:text-forest"
          >
            ← All offers
          </Link>
        </div>

        {error ? (
          <div className="page-shell">
            <EmptyState
              title="Offer not found"
              body="This promotion may have expired or been removed."
            />
          </div>
        ) : loading ? (
          <div className="page-shell">
            <div className="overflow-hidden rounded-[1.25rem] border border-[var(--separator)] bg-surface">
              <div className="aspect-[21/9] animate-pulse bg-clay/80" />
              <div className="space-y-3 p-6 sm:p-8">
                <div className="h-4 w-24 animate-pulse rounded bg-clay/80" />
                <div className="h-8 w-2/3 animate-pulse rounded bg-clay/90" />
                <div className="h-4 w-full animate-pulse rounded bg-clay/60" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-clay/50" />
              </div>
            </div>
          </div>
        ) : offer ? (
          <OfferArticle offer={offer} copied={copied} onCopyCode={copyCode} />
        ) : (
          <div className="page-shell">
            <EmptyState title="Offer not found" body="This promotion is no longer available." />
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}

function OfferArticle({
  offer,
  copied,
  onCopyCode,
}: {
  offer: Offer;
  copied: boolean;
  onCopyCode: (code: string) => void;
}) {
  const validity = formatOfferValidity(offer.startDate, offer.endDate);
  const daysLeft = offerDaysLeft(offer.endDate);
  const urgent = daysLeft != null && daysLeft > 0 && daysLeft <= 7;
  const ctaIsInternal = Boolean(offer.ctaUrl?.startsWith("/"));

  return (
    <div className="page-shell !pt-4">
      <article className="overflow-hidden rounded-[1.25rem] border border-[var(--separator)] bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
        <div className="relative aspect-[21/9] min-h-[12rem] w-full overflow-hidden bg-clay sm:min-h-[16rem]">
          {offer.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={offer.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              aria-hidden
              className="h-full w-full bg-[linear-gradient(135deg,var(--color-forest),var(--color-leaf))]"
            />
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
          />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
            {offer.featured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-forest shadow-sm">
                <SparkleIcon className="h-3.5 w-3.5" />
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
            <span className="absolute bottom-4 right-4 rounded-full bg-gold px-3.5 py-1.5 text-sm font-bold uppercase tracking-wide text-forest-deep shadow-sm sm:bottom-6 sm:right-6">
              {offer.discountLabel}
            </span>
          ) : null}
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          {offer.discipline ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
              {offer.discipline}
            </p>
          ) : null}
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
            {offer.title}
          </h1>
          {offer.description ? (
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-ink-secondary">
              {offer.description}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {validity ? (
              <div className="flex items-start gap-3 rounded-2xl border border-[var(--separator)] bg-clay/30 px-4 py-3.5">
                <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Validity</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{validity}</p>
                </div>
              </div>
            ) : null}
            <div className="flex items-start gap-3 rounded-2xl border border-[var(--separator)] bg-clay/30 px-4 py-3.5">
              <GiftIcon className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Promo code</p>
                {offer.code ? (
                  <p className="mt-0.5 font-mono text-sm font-bold tracking-wide text-forest">
                    {offer.code}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm font-semibold text-foreground">No code needed</p>
                )}
              </div>
            </div>
          </div>

          {offer.code ? (
            <button
              type="button"
              onClick={() => void onCopyCode(offer.code!)}
              className="profile-spring mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-[var(--separator)] bg-surface px-5 text-sm font-semibold text-forest hover:border-leaf"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Code copied
                </>
              ) : (
                <>Copy code · {offer.code}</>
              )}
            </button>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {offer.ctaUrl ? (
              ctaIsInternal ? (
                <Link
                  href={offer.ctaUrl}
                  className="profile-spring inline-flex min-h-12 items-center gap-2 rounded-full bg-forest px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(36,56,46,0.2)] hover:bg-forest-deep"
                >
                  {offer.ctaLabel || "Claim offer"}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href={offer.ctaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-spring inline-flex min-h-12 items-center gap-2 rounded-full bg-forest px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(36,56,46,0.2)] hover:bg-forest-deep"
                >
                  {offer.ctaLabel || "Claim offer"}
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
              )
            ) : null}
            <Link
              href="/offers"
              className="profile-spring inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--separator)] bg-surface px-6 text-sm font-semibold text-ink-secondary hover:border-[var(--system-blue)]/40 hover:text-foreground"
            >
              More offers
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
