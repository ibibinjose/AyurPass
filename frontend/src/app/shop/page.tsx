"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ProductCard } from "@/components/ProductCard";
import {
  Button,
  CardSkeletonGrid,
  EmptyState,
  FilterChip,
  Input,
  PageHeader,
} from "@/components/ui";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<string>("ALL");
  const [query, setQuery] = useState("");

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
    load();
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set((products ?? []).map((p) => p.category).filter(Boolean) as string[]);
    return ["ALL", ...Array.from(set).sort()];
  }, [products]);

  const visible = useMemo(() => {
    if (!products) return null;
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "ALL" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.provider?.businessName ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, category, query]);

  return (
    <LayoutWrapper>
      <div className="page-shell flex-1">
        <PageHeader
          title="Wellness shop"
          description="Herbal formulations, oils and wellness goods from verified providers — with dosha guidance where it matters."
        />

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="chip-scroll flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c === "ALL" ? "All" : c}
              </FilterChip>
            ))}
          </div>
          <div className="sm:w-64">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands…"
              aria-label="Search products"
            />
          </div>
        </div>

        <div className="mt-8">
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
          ) : visible === null ? (
            <CardSkeletonGrid count={6} />
          ) : visible.length === 0 ? (
            <EmptyState
              title={query || category !== "ALL" ? "Nothing matches those filters" : "Shop is being stocked"}
              body={
                query || category !== "ALL"
                  ? "Try a different category or clear your search."
                  : "Providers are listing their first products. Check back soon."
              }
            />
          ) : (
            <>
              <p className="mb-4 text-sm text-ink-muted" aria-live="polite">
                {visible.length} {visible.length === 1 ? "product" : "products"}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
