"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { RETREAT_CATEGORY_LABEL, RETREAT_CATEGORIES } from "@/lib/catalog";
import type { Retreat, RetreatCategory } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { RetreatCard } from "@/components/RetreatCard";
import { EmptyState, Input } from "@/components/ui";
import { MapPinIcon, SearchIcon, SparkleIcon } from "@/components/icons";

function includesText(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-forest text-white"
          : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
      }`}
    >
      {children}
    </button>
  );
}

export default function RetreatsClient({ initialQuery = "" }: { initialQuery?: string }) {
  const [retreats, setRetreats] = useState<Retreat[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<RetreatCategory | "ALL">("ALL");
  const [handpicked, setHandpicked] = useState(false);

  useEffect(() => {
    api
      .retreats()
      .then(setRetreats)
      .catch(() => setError(true));
  }, []);

  const loading = !error && retreats === null;
  const q = query.trim();
  const loc = location.trim();

  const shown = useMemo(() => {
    return (retreats ?? []).filter((r) => {
      if (category !== "ALL" && r.category !== category) return false;
      if (handpicked && !r.featured) return false;
      if (
        q &&
        !includesText(r.title, q) &&
        !includesText(r.summary ?? "", q) &&
        !includesText(r.provider?.businessName ?? "", q)
      )
        return false;
      if (loc && !includesText([r.city, r.country].filter(Boolean).join(" "), loc)) return false;
      return true;
    });
  }, [retreats, category, handpicked, q, loc]);

  const skeleton = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-2xl bg-clay/70" />
      ))}
    </div>
  );

  return (
    <LayoutWrapper>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
          <SparkleIcon className="h-3.5 w-3.5" />
          Handpicked worldwide
        </span>
        <h1 className="mt-3 font-display text-3xl text-forest sm:text-4xl">
          Retreats &amp; trainings
        </h1>
        <p className="mt-2 max-w-2xl text-ink-secondary">
          Discover the best yoga, meditation, Ayurveda, detox and wellness retreats and trainings on
          the planet — then enquire or book directly with the host.
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          Host retreats?{" "}
          <Link href="/dashboard/retreats" className="font-medium text-forest hover:underline">
            List your retreat →
          </Link>
        </p>

        {/* Search */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search retreats, trainings or hosts…"
              aria-label="Search retreats"
              className="pl-10"
            />
          </div>
          <div className="relative">
            <MapPinIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-muted" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Destination — city or country…"
              aria-label="Search by destination"
              className="pl-10"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Chip active={category === "ALL" && !handpicked} onClick={() => { setCategory("ALL"); setHandpicked(false); }}>
            All
          </Chip>
          <Chip active={handpicked} onClick={() => setHandpicked((v) => !v)}>
            ✦ Handpicked
          </Chip>
          {RETREAT_CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {RETREAT_CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </div>

        {/* Results */}
        <div className="mt-8">
          {error ? (
            <EmptyState
              title="We couldn't load retreats"
              body="The retreat directory is unreachable right now. Please try again shortly."
            />
          ) : loading ? (
            skeleton
          ) : shown.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-ink-muted">
                {shown.length} retreat{shown.length === 1 ? "" : "s"}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((r) => (
                  <RetreatCard key={r.id} retreat={r} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No retreats match those filters"
              body="Try a broader search, a different discipline, or clear your destination filter."
            />
          )}
        </div>
      </main>
    </LayoutWrapper>
  );
}
