"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState, Input } from "@/components/ui";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<string>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .products()
      .then(setProducts)
      .catch(() => setError(true));
  }, []);

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
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <h1 className="font-display text-3xl text-forest sm:text-4xl">Wellness shop</h1>
        <p className="mt-2 max-w-xl text-ink-secondary">
          Herbal formulations, oils and wellness goods from verified providers — with dosha
          guidance where it matters.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category === c
                    ? "bg-forest text-white"
                    : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
                }`}
              >
                {c === "ALL" ? "All" : c}
              </button>
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
            />
          ) : visible === null ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-clay/70" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              title={query || category !== "ALL" ? "Nothing matches those filters" : "The shelves are being stocked"}
              body={
                query || category !== "ALL"
                  ? "Try a different category or search term."
                  : "Providers are adding their first products. Check back soon."
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </LayoutWrapper>
  );
}
