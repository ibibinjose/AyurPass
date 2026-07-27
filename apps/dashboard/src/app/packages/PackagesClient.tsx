"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { WellnessPackage } from "@/lib/types";
import {
  DirectoryLayout,
  DirectoryResultGrid,
  FilterOption,
  FilterSearch,
  FilterSection,
  FilterStack,
} from "@/components/DirectoryLayout";
import { PackageCard } from "@/components/PackageCard";
import { Button, EmptyState, Input } from "@/components/ui";
import {
  LeafIcon,
  SearchIcon,
  SparkleIcon,
} from "@/components/icons";

type SortKey = "recommended" | "price_asc" | "price_desc" | "duration" | "newest";
type DurationBucket = "ALL" | "SHORT" | "MEDIUM" | "LONG";
type TypeFilter = "ALL" | "BOOKABLE" | "RECURRING" | "ONE_TIME";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "price_asc", label: "Price · low to high" },
  { key: "price_desc", label: "Price · high to low" },
  { key: "duration", label: "Duration" },
  { key: "newest", label: "Newest" },
];

function includesText(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function priceNum(p: WellnessPackage): number {
  const n = Number(p.totalPrice ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function durationBucket(days?: number | null): DurationBucket {
  if (days == null) return "ALL";
  if (days <= 3) return "SHORT";
  if (days <= 14) return "MEDIUM";
  return "LONG";
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

function sortPackages(list: WellnessPackage[], sort: SortKey): WellnessPackage[] {
  const copy = [...list];
  copy.sort((a, b) => {
    if (sort === "price_asc") return priceNum(a) - priceNum(b);
    if (sort === "price_desc") return priceNum(b) - priceNum(a);
    if (sort === "duration") {
      const ad = a.durationDays ?? Number.POSITIVE_INFINITY;
      const bd = b.durationDays ?? Number.POSITIVE_INFINITY;
      return ad - bd;
    }
    if (sort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // recommended: verified + bookable first
    const ascore =
      (a.provider?.verificationStatus === "verified" ? 0 : 2) + (a.serviceId ? 0 : 1);
    const bscore =
      (b.provider?.verificationStatus === "verified" ? 0 : 2) + (b.serviceId ? 0 : 1);
    if (ascore !== bscore) return ascore - bscore;
    return a.name.localeCompare(b.name);
  });
  return copy;
}

export default function PackagesClient() {
  const [packages, setPackages] = useState<WellnessPackage[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("ALL");
  const [duration, setDuration] = useState<DurationBucket>("ALL");
  const [providerType, setProviderType] = useState<string>("ALL");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended");

  const load = useCallback(() => {
    setError(false);
    setPackages(null);
    api
      .packages()
      .then(setPackages)
      .catch(() => {
        setError(true);
        setPackages([]);
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

  const loading = !error && packages === null;
  const all = useMemo(() => packages ?? [], [packages]);
  const q = query.trim();

  const providerTypes = useMemo(() => {
    const set = new Set<string>();
    for (const p of all) {
      if (p.provider?.type) set.add(p.provider.type);
    }
    return [...set].sort((a, b) =>
      (PROVIDER_TYPE_LABEL[a] ?? a).localeCompare(PROVIDER_TYPE_LABEL[b] ?? b),
    );
  }, [all]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("ALL", all.length);
    map.set("BOOKABLE", all.filter((p) => Boolean(p.serviceId)).length);
    map.set("RECURRING", all.filter((p) => p.isRecurring).length);
    map.set("ONE_TIME", all.filter((p) => !p.isRecurring).length);
    map.set("SHORT", all.filter((p) => durationBucket(p.durationDays) === "SHORT").length);
    map.set("MEDIUM", all.filter((p) => durationBucket(p.durationDays) === "MEDIUM").length);
    map.set("LONG", all.filter((p) => durationBucket(p.durationDays) === "LONG").length);
    map.set(
      "VERIFIED",
      all.filter((p) => p.provider?.verificationStatus === "verified").length,
    );
    for (const t of providerTypes) {
      map.set(`PT:${t}`, all.filter((p) => p.provider?.type === t).length);
    }
    return map;
  }, [all, providerTypes]);

  const visible = useMemo(() => {
    const filtered = all.filter((p) => {
      if (type === "BOOKABLE" && !p.serviceId) return false;
      if (type === "RECURRING" && !p.isRecurring) return false;
      if (type === "ONE_TIME" && p.isRecurring) return false;
      if (duration !== "ALL" && durationBucket(p.durationDays) !== duration) return false;
      if (providerType !== "ALL" && p.provider?.type !== providerType) return false;
      if (verifiedOnly && p.provider?.verificationStatus !== "verified") return false;
      if (
        q &&
        !includesText(p.name, q) &&
        !includesText(p.description ?? "", q) &&
        !includesText(p.provider?.businessName ?? "", q) &&
        !includesText(PROVIDER_TYPE_LABEL[p.provider?.type ?? ""] ?? "", q)
      )
        return false;
      return true;
    });
    return sortPackages(filtered, sort);
  }, [all, type, duration, providerType, verifiedOnly, q, sort]);

  const filterActive = Boolean(
    q || type !== "ALL" || duration !== "ALL" || providerType !== "ALL" || verifiedOnly,
  );

  function clearFilters() {
    setQuery("");
    setType("ALL");
    setDuration("ALL");
    setProviderType("ALL");
    setVerifiedOnly(false);
  }

  const featuredPreview = useMemo(() => {
    if (filterActive) return [];
    return sortPackages(
      all.filter(
        (p) => p.provider?.verificationStatus === "verified" || Boolean(p.serviceId),
      ),
      "recommended",
    ).slice(0, 3);
  }, [all, filterActive]);

  return (
    <DirectoryLayout
      eyebrow="Multi-session programs"
      title="Wellness packages"
      description="Curated programs from verified clinics, studios and spas — day intensives, multi-week paths and recurring memberships."
      heroExtra={
        <p className="text-sm font-semibold text-ink-muted">
          Prefer a single session?{" "}
          <Link href="/explore" className="font-bold text-[var(--system-blue)] hover:underline">
            Book one-off treatments →
          </Link>
        </p>
      }
      filterActive={filterActive}
      resultCount={loading ? null : visible.length}
      resultLabel="packages"
      sort={SORT_OPTIONS}
      sortValue={sort}
      onSortChange={(k) => setSort(k as SortKey)}
      onClearFilters={clearFilters}
      sidebar={
        <>
          <FilterSection title="Search">
            <FilterSearch icon={<SearchIcon className="h-4 w-4" />}>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Packages or hosts…"
                aria-label="Search packages"
                className="border-0 bg-transparent px-0 py-0.5 shadow-none focus:ring-0"
              />
            </FilterSearch>
          </FilterSection>

          <FilterSection title="Duration">
            <FilterStack>
              {(
                [
                  { key: "ALL" as const, label: "Any length" },
                  { key: "SHORT" as const, label: "1–3 days" },
                  { key: "MEDIUM" as const, label: "4–14 days" },
                  { key: "LONG" as const, label: "15+ days" },
                ] as const
              ).map(({ key, label }) => {
                const n = key === "ALL" ? counts.get("ALL") : counts.get(key);
                if (key !== "ALL" && !loading && (n ?? 0) === 0) return null;
                return (
                  <FilterOption
                    key={key}
                    active={duration === key}
                    count={loading ? undefined : n}
                    onClick={() => setDuration(key)}
                  >
                    {label}
                  </FilterOption>
                );
              })}
            </FilterStack>
          </FilterSection>

          <FilterSection title="Type">
            <FilterStack>
              <FilterOption active={type === "ALL"} count={counts.get("ALL")} onClick={() => setType("ALL")}>
                All types
              </FilterOption>
              <FilterOption
                active={type === "BOOKABLE"}
                count={counts.get("BOOKABLE")}
                onClick={() => setType(type === "BOOKABLE" ? "ALL" : "BOOKABLE")}
              >
                Bookable online
              </FilterOption>
              <FilterOption
                active={type === "RECURRING"}
                count={counts.get("RECURRING")}
                onClick={() => setType(type === "RECURRING" ? "ALL" : "RECURRING")}
              >
                Recurring
              </FilterOption>
              <FilterOption
                active={type === "ONE_TIME"}
                count={counts.get("ONE_TIME")}
                onClick={() => setType(type === "ONE_TIME" ? "ALL" : "ONE_TIME")}
              >
                One-time
              </FilterOption>
              <FilterOption
                active={verifiedOnly}
                count={counts.get("VERIFIED")}
                onClick={() => setVerifiedOnly((v) => !v)}
              >
                <span className="inline-flex items-center gap-1.5">
                  <SparkleIcon className="h-3.5 w-3.5" />
                  Verified hosts
                </span>
              </FilterOption>
            </FilterStack>
          </FilterSection>

          {providerTypes.length > 0 ? (
            <FilterSection title="Practice type">
              <FilterStack>
                <FilterOption
                  active={providerType === "ALL"}
                  count={counts.get("ALL")}
                  onClick={() => setProviderType("ALL")}
                >
                  All practices
                </FilterOption>
                {providerTypes.map((t) => {
                  const n = counts.get(`PT:${t}`) ?? 0;
                  if (!loading && n === 0) return null;
                  return (
                    <FilterOption
                      key={t}
                      active={providerType === t}
                      count={loading ? undefined : n}
                      onClick={() => setProviderType(t)}
                    >
                      {PROVIDER_TYPE_LABEL[t] ?? t}
                    </FilterOption>
                  );
                })}
              </FilterStack>
            </FilterSection>
          ) : null}

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
      {/* Mobile quick package duration filter chips */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { key: "ALL" as const, label: "All Packages" },
          { key: "SHORT" as const, label: "1–3 days" },
          { key: "MEDIUM" as const, label: "4–14 days" },
          { key: "LONG" as const, label: "15+ days" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setDuration(key)}
            className={`profile-spring inline-flex shrink-0 min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all active:scale-95 ${
              duration === key
                ? "bg-forest text-white shadow-xs"
                : "border border-hairline bg-surface text-ink-secondary hover:border-forest/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {featuredPreview.length > 0 ? (
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
                Start here
              </p>
              <h2 className="type-title mt-1 text-xl sm:text-2xl">Recommended packages</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setType("BOOKABLE");
                setVerifiedOnly(true);
              }}
              className="shrink-0 text-sm font-bold text-[var(--system-blue)] hover:underline"
            >
              Bookable & verified
            </button>
          </div>
          <DirectoryResultGrid>
            {featuredPreview.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </DirectoryResultGrid>
        </section>
      ) : null}

      <div className="min-h-[16rem]">
        {error ? (
          <EmptyState
            title="We couldn't load packages"
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
            {visible.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </DirectoryResultGrid>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--separator)] bg-surface/70 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay text-forest">
              <LeafIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl text-forest">
              {filterActive ? "Nothing matches those filters" : "The collection is being curated"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-ink-secondary">
              {filterActive
                ? "Try another length, practice type, or clear your search."
                : "Providers are crafting their first packages. List your practice to be among the first."}
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
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/list-your-business"
                  className="profile-spring inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
                >
                  List your practice
                </Link>
                <Link
                  href="/explore"
                  className="profile-spring inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--separator)] bg-surface px-5 text-sm font-semibold text-ink-secondary hover:border-[var(--system-blue)]/40 hover:text-foreground"
                >
                  Book a session
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && !error ? (
        <section className="mt-12 grid gap-3 border-t border-[var(--separator)] pt-8 sm:grid-cols-3">
          {[
            { href: "/explore", title: "Book a session", body: "Single treatments and classes" },
            { href: "/retreats", title: "Retreats & trainings", body: "Multi-day immersions worldwide" },
            { href: "/shop", title: "Wellness shop", body: "Oils, herbs and goods" },
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
