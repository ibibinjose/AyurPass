"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { CATEGORY_LABEL } from "@/lib/catalog";
import type { Service, ServiceCategory } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ServiceCard } from "@/components/ServiceCard";
import {
  Button,
  CardSkeletonGrid,
  EmptyState,
  FilterChip,
  Input,
  PageHeader,
} from "@/components/ui";

const FILTERS: { value: ServiceCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "AYURVEDA", label: "Ayurveda" },
  { value: "YOGA", label: "Yoga" },
  { value: "SPA", label: "Spa" },
  { value: "MEDITATION", label: "Meditation" },
  { value: "FITNESS", label: "Fitness" },
  { value: "NUTRITION", label: "Nutrition" },
  { value: "CONSULTATION", label: "Consultations" },
  { value: "PACKAGE", label: "Packages" },
];

export default function ExploreClient() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<ServiceCategory | "ALL">("ALL");
  const [query, setQuery] = useState("");

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
    load();
  }, [load]);

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
    <LayoutWrapper>
      <div className="page-shell flex-1">
        <PageHeader
          title="Book a session"
          description="Consultations, classes, treatments and programs — book directly with verified practitioners. Free cancellation until 24 hours before your session."
        />

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="chip-scroll flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <FilterChip
                key={f.value}
                active={category === f.value}
                onClick={() => setCategory(f.value)}
              >
                {f.label}
              </FilterChip>
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
            <>
              <p className="mb-4 text-sm text-ink-muted" aria-live="polite">
                {visible.length} {visible.length === 1 ? "session" : "sessions"}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((s) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}