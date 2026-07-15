"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { CATEGORY_LABEL } from "@/lib/catalog";
import type { Service, ServiceCategory } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { EmptyState, Input } from "@/components/ui";

const FILTERS: { value: ServiceCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "AYURVEDA", label: "Ayurveda" },
  { value: "YOGA", label: "Yoga" },
  { value: "SPA", label: "Spa" },
  { value: "MEDITATION", label: "Meditation" },
  { value: "FITNESS", label: "Fitness" },
  { value: "CONSULTATION", label: "Consultations" },
  { value: "PACKAGE", label: "Packages" },
];

export default function ExplorePage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<ServiceCategory | "ALL">("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .services()
      .then(setServices)
      .catch(() => setError(true));
  }, []);

  const visible = useMemo(() => {
    if (!services) return null;
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      if (category !== "ALL" && s.category !== category) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.provider?.businessName ?? "").toLowerCase().includes(q) ||
        (s.professional?.user?.fullName ?? "").toLowerCase().includes(q)
      );
    });
  }, [services, category, query]);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <h1 className="font-display text-3xl text-forest sm:text-4xl">Book a session</h1>
        <p className="mt-2 max-w-xl text-ink-secondary">
          Consultations, classes, treatments and programs — book directly with verified
          practitioners. Free cancellation until 24 hours before your session.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setCategory(f.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category === f.value
                    ? "bg-forest text-white"
                    : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="sm:w-64">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search treatments, studios…"
              aria-label="Search services"
            />
          </div>
        </div>

        <div className="mt-8">
          {error ? (
            <EmptyState
              title="We couldn't load the catalog"
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
              title={
                query || category !== "ALL"
                  ? "Nothing matches those filters"
                  : "The catalog is being curated"
              }
              body={
                query || category !== "ALL"
                  ? `No ${category === "ALL" ? "sessions" : CATEGORY_LABEL[category as ServiceCategory].toLowerCase() + " sessions"} found${query ? ` for “${query}”` : ""}. Try a different filter.`
                  : "Providers are publishing their first sessions. Check back soon."
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
