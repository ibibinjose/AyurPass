"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { OFFER_DISCIPLINES } from "@/lib/catalog";
import type { Offer } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { OfferCard } from "@/components/OfferCard";
import { EmptyState } from "@/components/ui";
import { SparkleIcon } from "@/components/icons";

export default function OffersClient() {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [error, setError] = useState(false);
  const [discipline, setDiscipline] = useState<string>("All");

  useEffect(() => {
    api
      .offers()
      .then(setOffers)
      .catch(() => setError(true));
  }, []);

  const shown = useMemo(
    () =>
      (offers ?? []).filter((o) => discipline === "All" || o.discipline === discipline),
    [offers, discipline],
  );

  const loading = !error && offers === null;

  return (
    <LayoutWrapper>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
          <SparkleIcon className="h-3.5 w-3.5" />
          Limited-time
        </span>
        <h1 className="mt-3 font-display text-3xl text-forest sm:text-4xl">Offers &amp; deals</h1>
        <p className="mt-2 max-w-2xl text-ink-secondary">
          Handpicked promotions across Ayurveda, yoga, luxury spa, meditation, health clubs,
          nutrition and retreats — curated by AyurPass.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {["All", ...OFFER_DISCIPLINES].map((d) => (
            <button
              key={d}
              onClick={() => setDiscipline(d)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                discipline === d
                  ? "bg-forest text-white"
                  : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {error ? (
            <EmptyState
              title="We couldn't load offers"
              body="Please try again in a moment."
            />
          ) : loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-clay/70" />
              ))}
            </div>
          ) : shown.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No offers right now"
              body="Check back soon — new promotions are added regularly."
            />
          )}
        </div>
      </main>
    </LayoutWrapper>
  );
}
