"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { RETREAT_CATEGORY_LABEL, RETREAT_CATEGORIES } from "@/lib/catalog";
import type { ActiveFilterChip } from "@/lib/directory";
import type { Retreat, RetreatCategory } from "@/lib/types";
import { useDirectoryUrlState } from "@/hooks/useDirectoryUrlState";
import { useNearMe } from "@/hooks/useNearMe";
import {
  DirectoryLayout,
  DirectoryResultGrid,
  FilterOption,
  FilterSearch,
  FilterSection,
  FilterStack,
} from "@/components/DirectoryLayout";
import { RetreatCard } from "@/components/RetreatCard";
import { EmptyState, Input } from "@/components/ui";
import {
  CompassIcon,
  LeafIcon,
  LotusIcon,
  MapPinIcon,
  MoonIcon,
  SearchIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";

function includesText(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

type SortKey = "featured" | "soonest" | "price_asc" | "price_desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured first" },
  { key: "soonest", label: "Starting soon" },
  { key: "price_asc", label: "Price · low to high" },
  { key: "price_desc", label: "Price · high to low" },
];

/** Short labels for filter chips (full names stay on collection pages). */
const CATEGORY_SHORT: Record<RetreatCategory, string> = {
  YOGA_RETREAT: "Yoga",
  YOGA_TEACHER_TRAINING: "Teacher training",
  MEDITATION_RETREAT: "Meditation",
  AYURVEDA_PANCHAKARMA: "Ayurveda",
  DETOX_CLEANSE: "Detox",
  SPA_WELLNESS: "Spa",
  FITNESS_ADVENTURE: "Fitness",
  SILENT_RETREAT: "Silent",
  WOMENS_RETREAT: "Women's",
  HEALING_RETREAT: "Healing",
  NUTRITION_DETOX: "Nutrition",
};

const CATEGORY_ICONS: Partial<Record<RetreatCategory, typeof LeafIcon>> = {
  YOGA_RETREAT: LotusIcon,
  YOGA_TEACHER_TRAINING: LotusIcon,
  MEDITATION_RETREAT: MoonIcon,
  AYURVEDA_PANCHAKARMA: LeafIcon,
  DETOX_CLEANSE: LeafIcon,
  SPA_WELLNESS: MoonIcon,
  FITNESS_ADVENTURE: CompassIcon,
  SILENT_RETREAT: MoonIcon,
  WOMENS_RETREAT: UsersIcon,
  HEALING_RETREAT: SparkleIcon,
  NUTRITION_DETOX: LeafIcon,
};


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
            <div className="h-3 w-2/3 animate-pulse rounded bg-clay/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

function priceNum(r: Retreat): number | null {
  if (r.priceFrom == null || r.priceFrom === "") return null;
  const n = Number(r.priceFrom);
  return Number.isFinite(n) ? n : null;
}

function sortRetreats(list: Retreat[], sort: SortKey): Retreat[] {
  const copy = [...list];
  copy.sort((a, b) => {
    if (sort === "featured") {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const as = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const bs = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      return as - bs;
    }
    if (sort === "soonest") {
      const as = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const bs = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      if (as !== bs) return as - bs;
      return a.featured === b.featured ? 0 : a.featured ? -1 : 1;
    }
    const ap = priceNum(a);
    const bp = priceNum(b);
    // Null prices sink to the end for both directions.
    if (ap == null && bp == null) return 0;
    if (ap == null) return 1;
    if (bp == null) return -1;
    return sort === "price_asc" ? ap - bp : bp - ap;
  });
  return copy;
}

const URL_DEFAULTS = {
  q: "",
  loc: "",
  cat: "ALL",
  handpicked: "",
  sort: "featured",
  verified: "",
};

function RetreatsInner({ initialQuery = "" }: { initialQuery?: string }) {
  const { values, set, clear, sharePath } = useDirectoryUrlState({
    ...URL_DEFAULTS,
    q: initialQuery || "",
  });
  const [retreats, setRetreats] = useState<Retreat[] | null>(null);
  const [error, setError] = useState(false);

  const query = values.q;
  const location = values.loc;
  const category = (values.cat || "ALL") as RetreatCategory | "ALL";
  const handpicked = values.handpicked === "1";
  const sort = (values.sort || "featured") as SortKey;
  const verifiedOnly = values.verified === "1";
  const nearMe = useNearMe((label) => set("loc", label));

  useEffect(() => {
    api
      .retreats()
      .then(setRetreats)
      .catch(() => setError(true));
  }, []);

  const loading = !error && retreats === null;
  const q = query.trim();
  const loc = location.trim();
  const all = retreats ?? [];

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("ALL", all.length);
    map.set("HANDPICKED", all.filter((r) => r.featured).length);
    for (const c of RETREAT_CATEGORIES) {
      map.set(c, all.filter((r) => r.category === c).length);
    }
    return map;
  }, [all]);

  const shown = useMemo(() => {
    const filtered = all.filter((r) => {
      if (category !== "ALL" && r.category !== category) return false;
      if (handpicked && !r.featured) return false;
      if (
        q &&
        !includesText(r.title, q) &&
        !includesText(r.summary ?? "", q) &&
        !includesText(r.description ?? "", q) &&
        !includesText(r.provider?.businessName ?? "", q) &&
        !includesText(RETREAT_CATEGORY_LABEL[r.category] ?? "", q)
      )
        return false;
      if (
        loc &&
        !includesText([r.city, r.country, r.address?.city, r.address?.country].filter(Boolean).join(" "), loc)
      )
        return false;
      if (verifiedOnly && r.verificationStatus !== "verified" && r.provider?.verificationStatus !== "verified")
        return false;
      return true;
    });
    return sortRetreats(filtered, sort);
  }, [all, category, handpicked, q, loc, sort, verifiedOnly]);

  const filterActive = Boolean(q || loc || category !== "ALL" || handpicked || verifiedOnly);

  const activeFilters: ActiveFilterChip[] = [];
  if (q) activeFilters.push({ id: "q", label: `“${q}”`, onRemove: () => set("q", "") });
  if (loc) activeFilters.push({ id: "loc", label: loc, onRemove: () => set("loc", "") });
  if (handpicked)
    activeFilters.push({ id: "hp", label: "Handpicked", onRemove: () => set("handpicked", "") });
  if (category !== "ALL")
    activeFilters.push({
      id: "cat",
      label: CATEGORY_SHORT[category] ?? category,
      onRemove: () => set("cat", "ALL"),
    });
  if (verifiedOnly)
    activeFilters.push({ id: "v", label: "Verified hosts", onRemove: () => set("verified", "") });

  const featuredPreview = useMemo(
    () => (!filterActive ? sortRetreats(all.filter((r) => r.featured), "soonest").slice(0, 3) : []),
    [all, filterActive],
  );

  const destinations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of all) {
      const key = r.country?.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8);
  }, [all]);

  return (
    <DirectoryLayout
      eyebrow="Handpicked worldwide"
      title="Retreats & trainings"
      description="Yoga, meditation, Ayurveda, detox and wellness immersions — find a host, then enquire or book directly."
      heroExtra={
        <p className="text-sm font-semibold text-ink-muted">
          Host retreats?{" "}
          <Link href="/dashboard/retreats" className="font-bold text-[var(--system-blue)] hover:underline">
            List yours →
          </Link>
        </p>
      }
      filterActive={filterActive}
      resultCount={loading ? null : shown.length}
      resultLabel="retreats"
      sort={SORT_OPTIONS}
      sortValue={sort}
      onSortChange={(k) => set("sort", k)}
      onClearFilters={clear}
      activeFilters={activeFilters}
      sharePath={sharePath}
      nearMe={{ onLocate: nearMe.locate, busy: nearMe.busy, error: nearMe.error }}
      sidebar={
        <>
          <FilterSection title="Search">
            <div className="space-y-2">
              <FilterSearch icon={<SearchIcon className="h-4 w-4" />}>
                <Input
                  value={query}
                  onChange={(e) => set("q", e.target.value)}
                  placeholder="Retreats, trainings, hosts…"
                  aria-label="Search retreats"
                />
              </FilterSearch>
              <FilterSearch icon={<MapPinIcon className="h-4 w-4" />}>
                <Input
                  value={location}
                  onChange={(e) => set("loc", e.target.value)}
                  placeholder="City or country"
                  aria-label="Search by destination"
                />
              </FilterSearch>
            </div>
          </FilterSection>

          {destinations.length > 0 ? (
            <FilterSection title="Destination">
              <FilterStack>
                {destinations.map(([country, n]) => (
                  <FilterOption
                    key={country}
                    active={loc.toLowerCase() === country.toLowerCase()}
                    count={n}
                    onClick={() =>
                      set("loc", loc.toLowerCase() === country.toLowerCase() ? "" : country)
                    }
                  >
                    {country}
                  </FilterOption>
                ))}
              </FilterStack>
            </FilterSection>
          ) : null}

          <FilterSection title="Curated">
            <FilterStack>
              <FilterOption
                active={category === "ALL" && !handpicked}
                count={categoryCounts.get("ALL")}
                onClick={() => {
                  set("cat", "ALL");
                  set("handpicked", "");
                }}
              >
                All retreats
              </FilterOption>
              <FilterOption
                active={handpicked}
                count={categoryCounts.get("HANDPICKED")}
                onClick={() => set("handpicked", handpicked ? "" : "1")}
              >
                <span className="inline-flex items-center gap-1.5">
                  <SparkleIcon className="h-3.5 w-3.5" />
                  Handpicked
                </span>
              </FilterOption>
              <FilterOption
                active={verifiedOnly}
                onClick={() => set("verified", verifiedOnly ? "" : "1")}
              >
                Verified hosts
              </FilterOption>
            </FilterStack>
          </FilterSection>

          <FilterSection title="Discipline">
            <FilterStack>
              {RETREAT_CATEGORIES.map((c) => {
                const n = categoryCounts.get(c) ?? 0;
                if (!loading && n === 0) return null;
                const Icon = CATEGORY_ICONS[c];
                return (
                  <FilterOption
                    key={c}
                    active={category === c}
                    count={loading ? undefined : n}
                    onClick={() => {
                      set("cat", c);
                      set("handpicked", "");
                    }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {Icon ? <Icon className="h-3.5 w-3.5 opacity-80" /> : null}
                      {CATEGORY_SHORT[c]}
                    </span>
                  </FilterOption>
                );
              })}
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
                Editor&apos;s picks
              </p>
              <h2 className="type-title mt-1 text-xl sm:text-2xl">Handpicked immersions</h2>
            </div>
            <button
              type="button"
              onClick={() => set("handpicked", "1")}
              className="shrink-0 text-sm font-bold text-[var(--system-blue)] hover:underline"
            >
              See all
            </button>
          </div>
          <DirectoryResultGrid>
            {featuredPreview.map((r) => (
              <RetreatCard key={r.id} retreat={r} />
            ))}
          </DirectoryResultGrid>
        </section>
      ) : null}

      <div className="min-h-[16rem]">
        {error ? (
          <EmptyState
            title="We couldn't load retreats"
            body="The retreat directory is unreachable right now. Please try again shortly."
          />
        ) : loading ? (
          <ResultSkeleton />
        ) : shown.length > 0 ? (
          <DirectoryResultGrid>
            {shown.map((r) => (
              <RetreatCard key={r.id} retreat={r} />
            ))}
          </DirectoryResultGrid>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--separator)] bg-surface/70 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay text-forest">
              <CompassIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl text-forest">No retreats match</h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-ink-secondary">
              Try a broader search, another discipline, or clear destination filters.
            </p>
            <button
              type="button"
              onClick={clear}
              className="profile-spring mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {!loading && !error ? (
        <section className="mt-12 border-t border-[var(--separator)] pt-8">
          <h2 className="type-title text-xl">Browse by discipline</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {RETREAT_CATEGORIES.map((c) => {
              const n = categoryCounts.get(c) ?? 0;
              return (
                <Link
                  key={c}
                  href={`/retreats/collection/${c.toLowerCase()}`}
                  className="profile-spring inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--separator)] bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary hover:border-[var(--system-blue)]/40 hover:text-foreground"
                >
                  {RETREAT_CATEGORY_LABEL[c]}
                  {n > 0 ? (
                    <span className="rounded-full bg-clay px-1.5 py-0.5 text-[11px] font-bold text-ink-muted">
                      {n}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </DirectoryLayout>
  );
}

export default function RetreatsClient({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <RetreatsInner initialQuery={initialQuery} />
    </Suspense>
  );
}
