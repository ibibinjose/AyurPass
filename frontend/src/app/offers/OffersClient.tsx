"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { OFFER_DISCIPLINES } from "@/lib/catalog";
import { buildQueryString, type ActiveFilterChip } from "@/lib/directory";
import type { Offer } from "@/lib/types";
import {
  DirectoryLayout,
  DirectoryResultGrid,
  FilterOption,
  FilterSearch,
  FilterSection,
  FilterStack,
} from "@/components/DirectoryLayout";
import { OfferCard } from "@/components/OfferCard";
import { EmptyState, Input } from "@/components/ui";
import {
  GiftIcon,
  LeafIcon,
  LotusIcon,
  MoonIcon,
  SearchIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";

type SortKey = "featured" | "ending_soon" | "newest";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured first" },
  { key: "ending_soon", label: "Ending soon" },
  { key: "newest", label: "Newest" },
];

const DISCIPLINE_ICON: Record<string, typeof LeafIcon> = {
  Ayurveda: LeafIcon,
  Yoga: LotusIcon,
  "Luxury Spa": MoonIcon,
  Meditation: MoonIcon,
  "Health Club": UsersIcon,
  Nutrition: LeafIcon,
  Retreat: SparkleIcon,
  Coaching: UsersIcon,
  General: GiftIcon,
};

function includesText(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}


function ResultSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[1.125rem] border border-[var(--separator)] bg-surface"
        >
          <div className="aspect-[16/10] animate-pulse bg-clay/80" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-clay/90" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-clay/70" />
            <div className="h-3 w-full animate-pulse rounded bg-clay/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function endTime(o: Offer): number {
  if (!o.endDate) return Number.POSITIVE_INFINITY;
  const t = new Date(o.endDate).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

function sortOffers(list: Offer[], sort: SortKey): Offer[] {
  const copy = [...list];
  copy.sort((a, b) => {
    if (sort === "featured") {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return endTime(a) - endTime(b);
    }
    if (sort === "ending_soon") {
      const ae = endTime(a);
      const be = endTime(b);
      if (ae !== be) return ae - be;
      return a.featured === b.featured ? 0 : a.featured ? -1 : 1;
    }
    // newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return copy;
}

export default function OffersClient() {
  const pathname = usePathname();
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [error, setError] = useState(false);
  const [discipline, setDiscipline] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");

  useEffect(() => {
    api
      .offers()
      .then(setOffers)
      .catch(() => setError(true));
  }, []);

  const loading = !error && offers === null;
  const all = offers ?? [];
  const q = query.trim();

  const disciplineCounts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("All", all.length);
    map.set("Featured", all.filter((o) => o.featured).length);
    for (const d of OFFER_DISCIPLINES) {
      map.set(d, all.filter((o) => o.discipline === d).length);
    }
    // Catch custom/unknown disciplines from the API
    for (const o of all) {
      if (o.discipline && !map.has(o.discipline)) {
        map.set(o.discipline, (map.get(o.discipline) ?? 0) + 1);
      }
    }
    return map;
  }, [all]);

  const disciplineOptions = useMemo(() => {
    const known = OFFER_DISCIPLINES.filter((d) => (disciplineCounts.get(d) ?? 0) > 0 || loading);
    const extras = [...disciplineCounts.keys()].filter(
      (k) => k !== "All" && k !== "Featured" && !(OFFER_DISCIPLINES as readonly string[]).includes(k),
    );
    return [...known, ...extras];
  }, [disciplineCounts, loading]);

  const shown = useMemo(() => {
    const filtered = all.filter((o) => {
      if (featuredOnly && !o.featured) return false;
      if (discipline !== "All" && o.discipline !== discipline) return false;
      if (
        q &&
        !includesText(o.title, q) &&
        !includesText(o.description ?? "", q) &&
        !includesText(o.discipline ?? "", q) &&
        !includesText(o.discountLabel ?? "", q) &&
        !includesText(o.code ?? "", q)
      )
        return false;
      return true;
    });
    return sortOffers(filtered, sort);
  }, [all, discipline, featuredOnly, q, sort]);

  const filterActive = Boolean(q || discipline !== "All" || featuredOnly);

  function clearFilters() {
    setQuery("");
    setDiscipline("All");
    setFeaturedOnly(false);
  }

  const activeFilters: ActiveFilterChip[] = [];
  if (query.trim())
    activeFilters.push({ id: "q", label: `“${query.trim()}”`, onRemove: () => setQuery("") });
  if (featuredOnly)
    activeFilters.push({ id: "f", label: "Featured", onRemove: () => setFeaturedOnly(false) });
  if (discipline !== "All")
    activeFilters.push({ id: "d", label: discipline, onRemove: () => setDiscipline("All") });

  const sharePath = `${pathname}${buildQueryString({
    q: query.trim() || undefined,
    d: discipline !== "All" ? discipline : undefined,
    featured: featuredOnly ? "1" : undefined,
    sort: sort !== "featured" ? sort : undefined,
  })}`;

  const featuredPreview = useMemo(
    () => (!filterActive ? sortOffers(all.filter((o) => o.featured), "ending_soon").slice(0, 3) : []),
    [all, filterActive],
  );

  return (
    <DirectoryLayout
      eyebrow="Limited-time promotions"
      title="Offers & deals"
      description="Handpicked savings across Ayurveda, yoga, spa, meditation, health clubs, nutrition and retreats — curated by AyurPass."
      heroExtra={
        <p className="text-sm font-semibold text-ink-muted">
          Looking for immersions?{" "}
          <Link href="/retreats" className="font-bold text-[var(--system-blue)] hover:underline">
            Browse retreats →
          </Link>
        </p>
      }
      filterActive={filterActive}
      resultCount={loading ? null : shown.length}
      resultLabel="offers"
      sort={SORT_OPTIONS}
      sortValue={sort}
      onSortChange={(k) => setSort(k as SortKey)}
      onClearFilters={clearFilters}
      activeFilters={activeFilters}
      sharePath={sharePath}
      sidebar={
        <>
          <FilterSection title="Search">
            <FilterSearch icon={<SearchIcon className="h-4 w-4" />}>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Offers, codes, disciplines…"
                aria-label="Search offers"
                className="border-0 bg-transparent px-0 py-0.5 shadow-none focus:ring-0"
              />
            </FilterSearch>
          </FilterSection>

          <FilterSection title="Spotlight">
            <FilterStack>
              <FilterOption
                active={discipline === "All" && !featuredOnly}
                count={disciplineCounts.get("All")}
                onClick={() => {
                  setDiscipline("All");
                  setFeaturedOnly(false);
                }}
              >
                All offers
              </FilterOption>
              <FilterOption
                active={featuredOnly}
                count={disciplineCounts.get("Featured")}
                onClick={() => setFeaturedOnly((v) => !v)}
              >
                <span className="inline-flex items-center gap-1.5">
                  <SparkleIcon className="h-3.5 w-3.5" />
                  Featured
                </span>
              </FilterOption>
            </FilterStack>
          </FilterSection>

          <FilterSection title="Discipline">
            <FilterStack>
              {disciplineOptions.map((d) => {
                const n = disciplineCounts.get(d) ?? 0;
                if (!loading && n === 0) return null;
                const Icon = DISCIPLINE_ICON[d];
                return (
                  <FilterOption
                    key={d}
                    active={discipline === d}
                    count={loading ? undefined : n}
                    onClick={() => {
                      setDiscipline(d);
                      setFeaturedOnly(false);
                    }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {Icon ? <Icon className="h-3.5 w-3.5 opacity-80" /> : null}
                      {d}
                    </span>
                  </FilterOption>
                );
              })}
            </FilterStack>
          </FilterSection>

          <FilterSection title="Sort">
            <FilterStack>
              {SORT_OPTIONS.map((o) => (
                <FilterOption key={o.key} active={sort === o.key} onClick={() => setSort(o.key)}>
                  {o.label}
                </FilterOption>
              ))}
            </FilterStack>
          </FilterSection>
        </>
      }
    >
      {featuredPreview.length > 0 ? (
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
                Spotlight
              </p>
              <h2 className="type-title mt-1 text-xl sm:text-2xl">Featured offers</h2>
            </div>
            <button
              type="button"
              onClick={() => setFeaturedOnly(true)}
              className="shrink-0 text-sm font-bold text-[var(--system-blue)] hover:underline"
            >
              See all
            </button>
          </div>
          <DirectoryResultGrid>
            {featuredPreview.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </DirectoryResultGrid>
        </section>
      ) : null}

      <div className="min-h-[16rem]">
        {error ? (
          <EmptyState title="We couldn't load offers" body="Please try again in a moment." />
        ) : loading ? (
          <ResultSkeleton />
        ) : shown.length > 0 ? (
          <DirectoryResultGrid>
            {shown.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </DirectoryResultGrid>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--separator)] bg-surface/70 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-forest">
              <GiftIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl text-forest">
              {filterActive ? "No offers match" : "No offers right now"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-ink-secondary">
              {filterActive
                ? "Try another discipline or clear your search."
                : "New promotions are added regularly — check back soon."}
            </p>
            {filterActive ? (
              <button
                type="button"
                onClick={clearFilters}
                className="profile-spring mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/discover"
                className="profile-spring mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
              >
                Browse practices
              </Link>
            )}
          </div>
        )}
      </div>
    </DirectoryLayout>
  );
}
