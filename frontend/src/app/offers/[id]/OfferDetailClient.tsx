"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Offer } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { EmptyState } from "@/components/ui";
import { ArrowRightIcon, SparkleIcon } from "@/components/icons";

export default function OfferDetailClient() {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null | undefined>(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .offer(id)
      .then(setOffer)
      .catch(() => setError(true));
  }, [id]);

  const loading = !error && offer === undefined;

  return (
    <LayoutWrapper>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <Link
          href="/offers"
          className="text-sm font-medium text-forest hover:underline"
        >
          ← All offers
        </Link>

        {error ? (
          <div className="mt-8">
            <EmptyState
              title="Offer not found"
              body="This promotion may have expired or been removed."
            />
          </div>
        ) : loading ? (
          <div className="mt-8 h-96 animate-pulse rounded-2xl bg-clay/70" />
        ) : offer ? (
          <article className="mt-8 overflow-hidden rounded-2xl border border-hairline bg-surface">
            <div className="relative">
              {offer.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={offer.imageUrl}
                  alt=""
                  className="h-56 w-full object-cover sm:h-72"
                />
              ) : (
                <div
                  aria-hidden
                  className="h-56 w-full bg-[linear-gradient(120deg,var(--color-forest),var(--color-leaf))] sm:h-72"
                />
              )}
              {offer.discountLabel && (
                <span className="absolute right-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-forest-deep">
                  {offer.discountLabel}
                </span>
              )}
              {offer.featured && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
                  <SparkleIcon className="h-3.5 w-3.5" />
                  Featured
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8">
              {offer.discipline && (
                <p className="text-xs font-medium uppercase tracking-wide text-leaf">
                  {offer.discipline}
                </p>
              )}
              <h1 className="mt-2 font-display text-3xl text-forest sm:text-4xl">
                {offer.title}
              </h1>
              {offer.description && (
                <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                  {offer.description}
                </p>
              )}

              {offer.code && (
                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                    Promo code
                  </p>
                  <p className="mt-1 inline-block rounded-lg border border-dashed border-hairline px-3 py-2 font-mono text-sm text-forest">
                    {offer.code}
                  </p>
                </div>
              )}

              {(offer.startDate || offer.endDate) && (
                <p className="mt-4 text-sm text-ink-muted">
                  {offer.startDate && <>Valid from {offer.startDate}</>}
                  {offer.startDate && offer.endDate && " · "}
                  {offer.endDate && <>Ends {offer.endDate}</>}
                </p>
              )}

              {offer.ctaUrl && (
                <a
                  href={offer.ctaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-deep"
                >
                  {offer.ctaLabel || "Claim offer"}
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </article>
        ) : (
          <div className="mt-8">
            <EmptyState title="Offer not found" body="This promotion is no longer available." />
          </div>
        )}
      </main>
    </LayoutWrapper>
  );
}