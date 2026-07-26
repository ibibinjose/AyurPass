"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import {
  DirectoryLayout,
  DirectoryResultGrid,
  FilterOption,
  FilterSearch,
  FilterSection,
  FilterStack,
} from "@/components/DirectoryLayout";
import { ProductCard } from "@/components/ProductCard";
import { Button, EmptyState, Input } from "@/components/ui";
import {
  LeafIcon,
  LotusIcon,
  SearchIcon,
  SparkleIcon,
} from "@/components/icons";

type SortKey = "featured" | "price_asc" | "price_desc" | "newest" | "name";
type StockFilter = "ALL" | "IN_STOCK" | "LOW";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Recommended" },
  { key: "price_asc", label: "Price · low to high" },
  { key: "price_desc", label: "Price · high to low" },
  { key: "newest", label: "Newest" },
  { key: "name", label: "Name A–Z" },
];

/** Common wellness product categories — shown first when present in inventory. */
const CATEGORY_PRIORITY = [
  "Oils",
  "Herbs",
  "Supplements",
  "Skincare",
  "Tea",
  "Wellness",
  "Equipment",
  "Books",
];

function includesText(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function priceNum(p: Product): number {
  const n = Number(p.price ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function isSoldOut(p: Product): boolean {
  return p.inventoryQuantity != null && p.inventoryQuantity <= 0;
}

function isLowStock(p: Product): boolean {
  return (
    p.inventoryQuantity != null && p.inventoryQuantity > 0 && p.inventoryQuantity <= 5
  );
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

function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  copy.sort((a, b) => {
    // Always sink sold-out items unless sorting by name only.
    if (sort !== "name") {
      const as = isSoldOut(a) ? 1 : 0;
      const bs = isSoldOut(b) ? 1 : 0;
      if (as !== bs) return as - bs;
    }
    if (sort === "price_asc") return priceNum(a) - priceNum(b);
    if (sort === "price_desc") return priceNum(b) - priceNum(a);
    if (sort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sort === "name") return a.name.localeCompare(b.name);
    // featured / recommended: verified hosts, then in stock, then name
    const av = a.provider?.verificationStatus === "verified" ? 0 : 1;
    const bv = b.provider?.verificationStatus === "verified" ? 0 : 1;
    if (av !== bv) return av - bv;
    return a.name.localeCompare(b.name);
  });
  return copy;
}

export default function ShopClient() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [stock, setStock] = useState<StockFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("featured");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setProducts(null);
    api
      .products()
      .then(setProducts)
      .catch(() => {
        setError(true);
        setProducts([]);
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

  const loading = !error && products === null;
  const all = products ?? [];
  const q = query.trim();

  const categories = useMemo(() => {
    const set = new Set(
      all.map((p) => p.category?.trim()).filter((c): c is string => Boolean(c)),
    );
    const ordered = [
      ...CATEGORY_PRIORITY.filter((c) => set.has(c)),
      ...[...set].filter((c) => !CATEGORY_PRIORITY.includes(c)).sort(),
    ];
    return ordered;
  }, [all]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("ALL", all.length);
    map.set("IN_STOCK", all.filter((p) => !isSoldOut(p)).length);
    map.set("LOW", all.filter(isLowStock).length);
    map.set("VERIFIED", all.filter((p) => p.provider?.verificationStatus === "verified").length);
    for (const c of categories) {
      map.set(c, all.filter((p) => p.category === c).length);
    }
    return map;
  }, [all, categories]);

  const visible = useMemo(() => {
    const filtered = all.filter((p) => {
      if (category !== "ALL" && p.category !== category) return false;
      if (stock === "IN_STOCK" && isSoldOut(p)) return false;
      if (stock === "LOW" && !isLowStock(p)) return false;
      if (verifiedOnly && p.provider?.verificationStatus !== "verified") return false;
      if (
        q &&
        !includesText(p.name, q) &&
        !includesText(p.description ?? "", q) &&
        !includesText(p.category ?? "", q) &&
        !includesText(p.provider?.businessName ?? "", q) &&
        !includesText(p.code ?? "", q)
      )
        return false;
      return true;
    });
    return sortProducts(filtered, sort);
  }, [all, category, stock, verifiedOnly, q, sort]);

  const filterActive = Boolean(
    q || category !== "ALL" || stock !== "ALL" || verifiedOnly,
  );

  function clearFilters() {
    setQuery("");
    setCategory("ALL");
    setStock("ALL");
    setVerifiedOnly(false);
  }

  return (
    <DirectoryLayout
      eyebrow="Curated goods"
      title="Wellness shop"
      description="Herbal formulations, oils and wellness goods from verified providers — with care for authenticity and stock you can trust."
      heroExtra={
        <p className="text-sm font-semibold text-ink-muted">
          Looking for treatments?{" "}
          <Link href="/explore" className="font-bold text-[var(--system-blue)] hover:underline">
            Book a session →
          </Link>
        </p>
      }
      filterActive={filterActive}
      resultCount={loading ? null : visible.length}
      resultLabel="products"
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
                placeholder="Products, brands…"
                aria-label="Search products"
                className="border-0 bg-transparent px-0 py-0.5 shadow-none focus:ring-0"
              />
            </FilterSearch>
          </FilterSection>

          <FilterSection title="Availability">
            <FilterStack>
              <FilterOption
                active={stock === "ALL" && !verifiedOnly}
                count={categoryCounts.get("ALL")}
                onClick={() => {
                  setStock("ALL");
                  setVerifiedOnly(false);
                }}
              >
                All products
              </FilterOption>
              <FilterOption
                active={stock === "IN_STOCK"}
                count={categoryCounts.get("IN_STOCK")}
                onClick={() => setStock(stock === "IN_STOCK" ? "ALL" : "IN_STOCK")}
              >
                In stock
              </FilterOption>
              {(categoryCounts.get("LOW") ?? 0) > 0 || loading ? (
                <FilterOption
                  active={stock === "LOW"}
                  count={categoryCounts.get("LOW")}
                  onClick={() => setStock(stock === "LOW" ? "ALL" : "LOW")}
                >
                  Low stock
                </FilterOption>
              ) : null}
              <FilterOption
                active={verifiedOnly}
                count={categoryCounts.get("VERIFIED")}
                onClick={() => setVerifiedOnly((v) => !v)}
              >
                <span className="inline-flex items-center gap-1.5">
                  <SparkleIcon className="h-3.5 w-3.5" />
                  Verified hosts
                </span>
              </FilterOption>
            </FilterStack>
          </FilterSection>

          {categories.length > 0 ? (
            <FilterSection title="Category">
              <FilterStack>
                <FilterOption
                  active={category === "ALL"}
                  count={categoryCounts.get("ALL")}
                  onClick={() => setCategory("ALL")}
                >
                  All categories
                </FilterOption>
                {categories.map((c) => {
                  const n = categoryCounts.get(c) ?? 0;
                  if (!loading && n === 0) return null;
                  return (
                    <FilterOption
                      key={c}
                      active={category === c}
                      count={loading ? undefined : n}
                      onClick={() => setCategory(c)}
                    >
                      {c}
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
      {/* Mobile quick product category chips */}
      {categories.length > 0 ? (
        <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setCategory("ALL")}
            className={`profile-spring inline-flex shrink-0 min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all active:scale-95 ${
              category === "ALL"
                ? "bg-forest text-white shadow-xs"
                : "border border-hairline bg-surface text-ink-secondary hover:border-forest/40"
            }`}
          >
            All Products
          </button>
          {categories.map((c) => (
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
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mb-6 grid gap-2 sm:grid-cols-3">
        {[
          { t: "Verified makers", d: "Goods from reviewed wellness practices" },
          { t: "Secure checkout", d: "Pay safely when you complete your order" },
          { t: "Real inventory", d: "Stock levels reflected as hosts update them" },
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
            title="We couldn't load the shop"
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
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </DirectoryResultGrid>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--separator)] bg-surface/70 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay text-forest">
              <LotusIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl text-forest">
              {filterActive ? "Nothing matches those filters" : "Shop is being stocked"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-ink-secondary">
              {filterActive
                ? "Try another category, clear stock filters, or broaden your search."
                : "Providers are listing their first products. Check back soon, or book a session."}
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
                href="/explore"
                className="profile-spring mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
              >
                Book a session
              </Link>
            )}
          </div>
        )}
      </div>

      {!loading && !error ? (
        <section className="mt-12 grid gap-3 border-t border-[var(--separator)] pt-8 sm:grid-cols-3">
          {[
            { href: "/explore", title: "Book a session", body: "Treatments, classes and consults" },
            { href: "/discover", title: "Discover practices", body: "Clinics, studios and spas" },
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
