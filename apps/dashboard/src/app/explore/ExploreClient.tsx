"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { CATEGORY_LABEL } from "@/lib/catalog";
import type { Service, ServiceCategory } from "@/lib/types";
import {
  DirectoryLayout,
  DirectoryResultGrid,
  FilterOption,
  FilterSearch,
  FilterSection,
  FilterStack,
} from "@/components/DirectoryLayout";
import { ServiceCard } from "@/components/ServiceCard";
import { Button, EmptyState, Input } from "@/components/ui";
import {
  CompassIcon,
  DumbbellIcon,
  LeafIcon,
  LotusIcon,
  MapPinIcon,
  MoonIcon,
  SearchIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";

type CategoryFilter = ServiceCategory | "ALL";
type SortKey = "recommended" | "rating" | "price_asc" | "price_desc" | "duration";
type ModeFilter = "ALL" | "IN_PERSON" | "VIRTUAL";

const CATEGORIES: CategoryFilter[] = [
  "ALL",
  "AYURVEDA",
  "YOGA",
  "SPA",
  "MEDITATION",
  "FITNESS",
  "NUTRITION",
  "COACHING",
  "CONSULTATION",
  "PACKAGE",
];

const CATEGORY_ICON: Partial<Record<ServiceCategory, typeof LeafIcon>> = {
  AYURVEDA: LeafIcon,
  YOGA: LotusIcon,
  SPA: MoonIcon,
  MEDITATION: MoonIcon,
  FITNESS: DumbbellIcon,
  NUTRITION: LeafIcon,
  COACHING: UsersIcon,
  CONSULTATION: CompassIcon,
  PACKAGE: SparkleIcon,
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "rating", label: "Top rated" },
  { key: "price_asc", label: "Price · low to high" },
  { key: "price_desc", label: "Price · high to low" },
  { key: "duration", label: "Duration" },
];

function includesText(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function priceNum(s: Service): number {
  const n = Number(s.price);
  return Number.isFinite(n) ? n : 0;
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
            <div className="mt-4 flex justify-between">
              <div className="h-6 w-20 animate-pulse rounded bg-clay/70" />
              <div className="h-10 w-20 animate-pulse rounded-full bg-clay/80" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ratingNum(s: Service): number {
  const n = Number(s.rating ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function sortServices(list: Service[], sort: SortKey): Service[] {
  const copy = [...list];
  copy.sort((a, b) => {
    if (sort === "price_asc") return priceNum(a) - priceNum(b);
    if (sort === "price_desc") return priceNum(b) - priceNum(a);
    if (sort === "duration") return a.durationMinutes - b.durationMinutes;
    if (sort === "rating") {
      const rd = ratingNum(b) - ratingNum(a);
      if (rd !== 0) return rd;
      return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    }
    // recommended: verified hosts first, then higher service rating, then packages mildly demoted
    const av = a.provider?.verificationStatus === "verified" ? 0 : 1;
    const bv = b.provider?.verificationStatus === "verified" ? 0 : 1;
    if (av !== bv) return av - bv;
    const rd = ratingNum(b) - ratingNum(a);
    if (rd !== 0) return rd;
    const ap = a.category === "PACKAGE" ? 1 : 0;
    const bp = b.category === "PACKAGE" ? 1 : 0;
    if (ap !== bp) return ap - bp;
    return a.name.localeCompare(b.name);
  });
  return copy;
}

export default function ExploreClient() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<ModeFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("recommended");

  const load = useCallback(() => {
    setError(false);
    setServices(null);
    api
      .services()
      .then(setServices)
      .catch(() => {
        setError(true);
        setServices([]);
      });
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) load();
    };
    run();
    return () => {
      active = false;
    };
  }, [load]);

  const loading = !error && services === null;
  const all = useMemo(() => services ?? [], [services]);
  const q = query.trim();

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("ALL", all.length);
    for (const c of CATEGORIES) {
      if (c === "ALL") continue;
      map.set(c, all.filter((s) => s.category === c).length);
    }
    map.set("IN_PERSON", all.filter((s) => !s.isVirtual).length);
    map.set("VIRTUAL", all.filter((s) => s.isVirtual).length);
    return map;
  }, [all]);

  const visible = useMemo(() => {
    const filtered = all.filter((s) => {
      if (category !== "ALL" && s.category !== category) return false;
      if (mode === "VIRTUAL" && !s.isVirtual) return false;
      if (mode === "IN_PERSON" && s.isVirtual) return false;
      if (
        q &&
        !includesText(s.name, q) &&
        !includesText(s.description ?? "", q) &&
        !includesText(s.provider?.businessName ?? "", q) &&
        !includesText(s.professional?.user?.fullName ?? "", q) &&
        !includesText(CATEGORY_LABEL[s.category] ?? "", q)
      )
        return false;
      return true;
    });
    return sortServices(filtered, sort);
  }, [all, category, mode, q, sort]);

  const filterActive = Boolean(q || category !== "ALL" || mode !== "ALL");

  function clearFilters() {
    setQuery("");
    setCategory("ALL");
    setMode("ALL");
  }

  const activeFilters = [
    category !== "ALL"
      ? {
          id: "cat",
          label: CATEGORY_LABEL[category] ?? category,
          onRemove: () => setCategory("ALL"),
        }
      : null,
    mode !== "ALL"
      ? {
          id: "mode",
          label: mode === "VIRTUAL" ? "Virtual" : "In person",
          onRemove: () => setMode("ALL"),
        }
      : null,
    q
      ? {
          id: "q",
          label: `“${q}”`,
          onRemove: () => setQuery(""),
        }
      : null,
  ].filter(Boolean) as { id: string; label: string; onRemove: () => void }[];

  return (
    <DirectoryLayout
      eyebrow="Sessions"
      title="Book a session"
      description="Consultations, classes, treatments and programs — they land on your Calendar, colour-coded by Ayurveda, Yoga, Spa and more."
      heroExtra={
        <p className="text-sm font-semibold text-ink-muted">
          Prefer to browse practices first?{" "}
          <Link href="/discover" className="font-bold text-[var(--system-blue)] hover:underline">
            Open Discover →
          </Link>
        </p>
      }
      filterActive={filterActive}
      activeFilters={activeFilters}
      resultCount={loading ? null : visible.length}
      resultLabel="sessions"
      sort={SORT_OPTIONS}
      sortValue={sort}
      onSortChange={(k) => setSort(k as SortKey)}
      onClearFilters={clearFilters}
      sharePath={
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/explore"
      }
      sidebar={
        <>
          <FilterSection title="Search">
            <FilterSearch icon={<SearchIcon className="h-4 w-4" />}>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Treatments, hosts…"
                aria-label="Search sessions"
                className="border-0 bg-transparent px-0 py-0.5 shadow-none focus:ring-0"
              />
            </FilterSearch>
          </FilterSection>

          <FilterSection title="Mode">
            <FilterStack>
              <FilterOption
                active={mode === "ALL"}
                count={categoryCounts.get("ALL")}
                onClick={() => setMode("ALL")}
              >
                All modes
              </FilterOption>
              <FilterOption
                active={mode === "IN_PERSON"}
                count={categoryCounts.get("IN_PERSON")}
                onClick={() => setMode(mode === "IN_PERSON" ? "ALL" : "IN_PERSON")}
              >
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  In person
                </span>
              </FilterOption>
              <FilterOption
                active={mode === "VIRTUAL"}
                count={categoryCounts.get("VIRTUAL")}
                onClick={() => setMode(mode === "VIRTUAL" ? "ALL" : "VIRTUAL")}
              >
                Virtual
              </FilterOption>
            </FilterStack>
          </FilterSection>

          <FilterSection title="Category">
            <FilterStack>
              {CATEGORIES.map((c) => {
                const n = c === "ALL" ? categoryCounts.get("ALL") : categoryCounts.get(c);
                if (c !== "ALL" && !loading && (n ?? 0) === 0) return null;
                const Icon = c === "ALL" ? null : CATEGORY_ICON[c];
                const label = c === "ALL" ? "All categories" : CATEGORY_LABEL[c];
                return (
                  <FilterOption
                    key={c}
                    active={category === c}
                    count={loading ? undefined : n}
                    onClick={() => setCategory(c)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {Icon ? <Icon className="h-3.5 w-3.5 opacity-80" /> : null}
                      {label}
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
      {/* Mobile quick session category filter chips */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((c) => {
          const label = c === "ALL" ? "All Sessions" : CATEGORY_LABEL[c];
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`profile-spring inline-flex shrink-0 min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all active:scale-95 ${
                category === c
                  ? "bg-forest text-white shadow-xs"
                  : "border border-hairline bg-surface text-ink-secondary hover:border-forest/40"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mb-6 grid gap-2 sm:grid-cols-3">
        {[
          { t: "Verified hosts", d: "Practices reviewed before going live" },
          { t: "Instant booking", d: "Pick a time and confirm online" },
          { t: "Free cancel", d: "Until 24 hours before your session" },
        ].map((item) => (
          <div
            key={item.t}
            className="rounded-2xl border border-[var(--separator)] bg-surface/80 px-4 py-3"
          >
            <p className="text-sm font-bold text-forest">{item.t}</p>
            <p className="mt-0.5 text-xs font-medium text-ink-muted">{item.d}</p>
          </div>
        ))}
      </div>

      <div className="min-h-[16rem]">
        {error ? (
          <EmptyState
            title="We couldn't load the catalog"
            body="The wellness network is unreachable right now. Please try again shortly."
            action={
              <Button type="button" variant="ghost" onClick={load}>
                Try again
              </Button>
            }
          />
        ) : loading ? (
          <ResultSkeleton />
        ) : visible.length > 0 ? (
          <DirectoryResultGrid>
            {visible.map((s) => (
              <ServiceCard key={s.id} service={s} compact />
            ))}
          </DirectoryResultGrid>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--separator)] bg-surface/70 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay text-forest">
              <CompassIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl text-forest">
              {filterActive ? "Nothing matches those filters" : "The catalog is being curated"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-ink-secondary">
              {filterActive
                ? `No ${category === "ALL" ? "sessions" : CATEGORY_LABEL[category].toLowerCase() + " sessions"} found${q ? ` for “${q}”` : ""}. Try a different filter.`
                : "Providers are publishing their first sessions. Check back soon, or browse practices."}
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

      {!loading && !error ? (
        <section className="mt-12 grid gap-3 border-t border-[var(--separator)] pt-8 sm:grid-cols-3">
          {[
            { href: "/discover", title: "Discover practices", body: "Clinics, studios and spas near you" },
            { href: "/retreats", title: "Retreats & trainings", body: "Multi-day immersions worldwide" },
            { href: "/offers", title: "Offers & deals", body: "Limited-time promotions" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="profile-spring rounded-2xl border border-[var(--separator)] bg-surface px-4 py-4 transition-colors hover:border-[var(--system-blue)]/35"
            >
              <p className="text-sm font-bold text-forest">{item.title}</p>
              <p className="mt-0.5 text-xs font-medium text-ink-muted">{item.body}</p>
            </Link>
          ))}
        </section>
      ) : null}
    </DirectoryLayout>
  );
}
