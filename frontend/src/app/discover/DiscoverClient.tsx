"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { CATEGORY_LABEL, formatAddress } from "@/lib/catalog";
import type { Product, Provider, Service, ServiceCategory, ProviderType, Professional } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ProviderCard } from "@/components/ProviderCard";
import { ServiceCard } from "@/components/ServiceCard";
import { ProductCard } from "@/components/ProductCard";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { Button, EmptyState, Input } from "@/components/ui";
import { MapPinIcon, SearchIcon } from "@/components/icons";

type Tab = "providers" | "services" | "products" | "professionals";

const PROVIDER_GROUPS: { label: string; types: ProviderType[] }[] = [
  { label: "Ayurveda", types: ["AYURVEDA_CLINIC", "AYURVEDA_RESORT", "PANCHAKARMA_CENTER"] },
  { label: "Yoga", types: ["YOGA_STUDIO"] },
  { label: "Spa", types: ["LUXURY_SPA"] },
  { label: "Meditation", types: ["MEDITATION_CENTER"] },
  { label: "Health Club", types: ["HEALTH_CLUB"] },
  { label: "Nutrition", types: ["NUTRITIONIST"] },
  { label: "Retreats", types: ["WELLNESS_RETREAT"] },
];

const SERVICE_CATEGORIES: ServiceCategory[] = [
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

function includesText(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/** Chip button — optional count badge (e.g. Providers 84). */
function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-forest text-white shadow-[0_2px_8px_rgba(36,56,46,0.12)]"
          : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
      }`}
    >
      <span>{children}</span>
      {count !== undefined ? (
        <span
          className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none ${
            active ? "bg-white/20 text-white" : "bg-clay text-ink-muted"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export default function DiscoverPage() {
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [services, setServices] = useState<Service[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [professionals, setProfessionals] = useState<Professional[] | null>(null);
  const [error, setError] = useState(false);

  const [tab, setTab] = useState<Tab>("providers");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [providerGroup, setProviderGroup] = useState<string | null>(null);
  const [professionalGroup, setProfessionalGroup] = useState<string | null>(null);
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | "ALL">("ALL");
  const [productCategory, setProductCategory] = useState<string>("ALL");

  const load = () => {
    setError(false);
    setProviders(null);
    setServices(null);
    setProducts(null);
    setProfessionals(null);
    Promise.all([api.providers(), api.services(), api.products(), api.professionals()])
      .then(([p, s, pr, prof]) => {
        setProviders(p);
        setServices(s);
        setProducts(pr);
        setProfessionals(prof);
      })
      .catch(() => {
        setError(true);
        setProviders([]);
        setServices([]);
        setProducts([]);
        setProfessionals([]);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const loading = !error && (providers === null || services === null || products === null || professionals === null);

  // Provider address by id — lets services, products and professionals inherit their venue's location.
  const providersById = useMemo(() => {
    const map = new Map<string, Provider>();
    (providers ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [providers]);

  const providerLocation = (providerId: string) =>
    formatAddress(providersById.get(providerId)?.address);

  const q = query.trim();
  const loc = location.trim();

  // Base lists filtered by the shared name + location search (category applied later).
  // These drive the per-tab result counts so the search spans all four catalogues.
  const base = useMemo(() => {
    const filterProviders = (list: Provider[]) =>
      list.filter((p) => {
        if (q && !includesText(p.businessName, q)) return false;
        if (loc && !includesText(formatAddress(p.address), loc)) return false;
        return true;
      });

    const filterServices = (list: Service[]) =>
      list.filter((s) => {
        if (
          q &&
          !includesText(s.name, q) &&
          !includesText(s.provider?.businessName ?? "", q) &&
          !includesText(s.professional?.user?.fullName ?? "", q)
        )
          return false;
        if (loc && !includesText(providerLocation(s.providerId), loc)) return false;
        return true;
      });

    const filterProducts = (list: Product[]) =>
      list.filter((p) => {
        if (
          q &&
          !includesText(p.name, q) &&
          !includesText(p.provider?.businessName ?? "", q) &&
          !includesText(p.category ?? "", q)
        )
          return false;
        if (loc && !includesText(providerLocation(p.providerId), loc)) return false;
        return true;
      });

    const filterProfessionals = (list: Professional[]) =>
      list.filter((prof) => {
        if (
          q &&
          !includesText(prof.user?.fullName ?? "", q) &&
          !includesText(prof.title ?? "", q) &&
          !includesText(prof.specializations.join(" "), q) &&
          !includesText(prof.provider?.businessName ?? "", q)
        )
          return false;
        if (loc && !includesText(providerLocation(prof.providerId), loc)) return false;
        return true;
      });

    return {
      providers: providers ? filterProviders(providers) : null,
      services: services ? filterServices(services) : null,
      products: products ? filterProducts(products) : null,
      professionals: professionals ? filterProfessionals(professionals) : null,
    };
    // providersById is derived from providers; listed deps cover it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers, services, products, professionals, q, loc]);

  const activeTypes = providerGroup
    ? PROVIDER_GROUPS.find((g) => g.label === providerGroup)?.types ?? []
    : null;

  const shownProviders = base.providers?.filter(
    (p) => !activeTypes || activeTypes.includes(p.type),
  );
  const shownServices = base.services?.filter(
    (s) => serviceCategory === "ALL" || s.category === serviceCategory,
  );
  const shownProducts = base.products?.filter(
    (p) => productCategory === "ALL" || p.category === productCategory,
  );
  const professionalGroupTypes = professionalGroup
    ? PROVIDER_GROUPS.find((g) => g.label === professionalGroup)?.types ?? []
    : null;

  const shownProfessionals = base.professionals?.filter((prof) => {
    if (!professionalGroupTypes) return true;
    if (prof.provider?.type && professionalGroupTypes.includes(prof.provider.type)) return true;
    const needle = professionalGroup!.toLowerCase();
    return prof.specializations.some(
      (s) => s.toLowerCase().includes(needle) || needle.includes(s.toLowerCase()),
    );
  });

  const productCategories = useMemo(() => {
    const set = new Set<string>();
    (products ?? []).forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [products]);

  const counts = {
    providers: shownProviders?.length ?? base.providers?.length ?? 0,
    services: shownServices?.length ?? base.services?.length ?? 0,
    products: shownProducts?.length ?? base.products?.length ?? 0,
    professionals: shownProfessionals?.length ?? base.professionals?.length ?? 0,
  };

  const tabTotals = {
    providers: base.providers?.length ?? 0,
    services: base.services?.length ?? 0,
    products: base.products?.length ?? 0,
    professionals: base.professionals?.length ?? 0,
  };

  const providerGroupCounts = useMemo(() => {
    const list = base.providers ?? [];
    const map = new Map<string, number>();
    map.set("All", list.length);
    for (const g of PROVIDER_GROUPS) {
      map.set(g.label, list.filter((p) => g.types.includes(p.type)).length);
    }
    return map;
  }, [base.providers]);

  const professionalGroupCounts = useMemo(() => {
    const list = base.professionals ?? [];
    const map = new Map<string, number>();
    map.set("All", list.length);
    for (const g of PROVIDER_GROUPS) {
      map.set(
        g.label,
        list.filter((prof) => {
          if (prof.provider?.type && g.types.includes(prof.provider.type)) return true;
          const needle = g.label.toLowerCase();
          return prof.specializations.some(
            (s) => s.toLowerCase().includes(needle) || needle.includes(s.toLowerCase()),
          );
        }).length,
      );
    }
    return map;
  }, [base.professionals]);

  const serviceCategoryCounts = useMemo(() => {
    const list = base.services ?? [];
    const map = new Map<string, number>();
    map.set("ALL", list.length);
    for (const c of SERVICE_CATEGORIES) {
      map.set(c, list.filter((s) => s.category === c).length);
    }
    return map;
  }, [base.services]);

  const productCategoryCounts = useMemo(() => {
    const list = base.products ?? [];
    const map = new Map<string, number>();
    map.set("ALL", list.length);
    for (const c of productCategories) {
      map.set(c, list.filter((p) => p.category === c).length);
    }
    return map;
  }, [base.products, productCategories]);

  const TABS: { key: Tab; label: string }[] = [
    { key: "providers", label: "Providers" },
    { key: "services", label: "Services" },
    { key: "products", label: "Products" },
    { key: "professionals", label: "Practitioners" },
  ];

  const skeleton = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-2xl bg-clay/70" />
      ))}
    </div>
  );

  const searchActive = Boolean(q || loc);

  return (
    <LayoutWrapper>
      <div className="page-shell flex-1">
        <h1 className="type-display">Discover wellness near you</h1>
        <p className="type-body mt-2 max-w-2xl font-medium">
          The dedicated finder for Ayurveda, yoga, luxury spa, meditation, health-club and retreat
          places — search every clinic, studio and sanctuary, plus the treatments, practitioners and
          products they offer. Filter by name, location and discipline.
        </p>
        <p className="mt-3 text-sm font-semibold text-ink-muted">
          Run a wellness business?{" "}
          <Link href="/list-your-business" className="font-bold text-forest hover:underline">
            List it free →
          </Link>
        </p>

        {/* Search: name + location */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, treatment, practitioner or product…"
              aria-label="Search by name"
              className="pl-10"
            />
          </div>
          <div className="relative">
            <MapPinIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-muted" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, state or country…"
              aria-label="Search by location"
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs + discipline filters — one chip bar */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <Chip
              key={t.key}
              active={tab === t.key}
              count={loading ? undefined : tabTotals[t.key]}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Chip>
          ))}

          <span className="mx-0.5 hidden h-7 w-px shrink-0 bg-hairline sm:inline" aria-hidden />

          {tab === "providers" && (
            <>
              <Chip
                active={!providerGroup}
                count={loading ? undefined : providerGroupCounts.get("All")}
                onClick={() => setProviderGroup(null)}
              >
                All
              </Chip>
              {PROVIDER_GROUPS.map((g) => (
                <Chip
                  key={g.label}
                  active={providerGroup === g.label}
                  count={loading ? undefined : providerGroupCounts.get(g.label)}
                  onClick={() => setProviderGroup(g.label)}
                >
                  {g.label}
                </Chip>
              ))}
            </>
          )}

          {tab === "services" && (
            <>
              <Chip
                active={serviceCategory === "ALL"}
                count={loading ? undefined : serviceCategoryCounts.get("ALL")}
                onClick={() => setServiceCategory("ALL")}
              >
                All
              </Chip>
              {SERVICE_CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  active={serviceCategory === c}
                  count={loading ? undefined : serviceCategoryCounts.get(c)}
                  onClick={() => setServiceCategory(c)}
                >
                  {CATEGORY_LABEL[c]}
                </Chip>
              ))}
            </>
          )}

          {tab === "products" && (
            <>
              <Chip
                active={productCategory === "ALL"}
                onClick={() => setProductCategory("ALL")}
                count={loading ? undefined : productCategoryCounts.get("ALL")}
              >
                All
              </Chip>
              {productCategories.map((c) => (
                <Chip
                  key={c}
                  active={productCategory === c}
                  count={loading ? undefined : productCategoryCounts.get(c)}
                  onClick={() => setProductCategory(c)}
                >
                  {c}
                </Chip>
              ))}
            </>
          )}

          {tab === "professionals" && (
            <>
              <Chip
                active={!professionalGroup}
                count={loading ? undefined : professionalGroupCounts.get("All")}
                onClick={() => setProfessionalGroup(null)}
              >
                All
              </Chip>
              {PROVIDER_GROUPS.map((g) => (
                <Chip
                  key={g.label}
                  active={professionalGroup === g.label}
                  count={loading ? undefined : professionalGroupCounts.get(g.label)}
                  onClick={() => setProfessionalGroup(g.label)}
                >
                  {g.label}
                </Chip>
              ))}
            </>
          )}
        </div>

        {!loading && (
          <p className="mt-3 text-sm text-ink-muted">
            Showing{" "}
            <span className="font-medium text-foreground">{counts[tab]}</span>{" "}
            {tab === "professionals" ? "practitioners" : tab}
            {tab === "providers" && providerGroup ? ` · ${providerGroup}` : ""}
            {tab === "professionals" && professionalGroup ? ` · ${professionalGroup}` : ""}
            {tab === "services" && serviceCategory !== "ALL"
              ? ` · ${CATEGORY_LABEL[serviceCategory]}`
              : ""}
            {tab === "products" && productCategory !== "ALL" ? ` · ${productCategory}` : ""}
          </p>
        )}

        {/* Results */}
        <div className="mt-8">
          {error ? (
            <EmptyState
              title="We couldn't load the directory"
              body="The wellness network is unreachable right now. Please try again shortly."
              action={
                <Button type="button" variant="ghost" onClick={load}>
                  Try again
                </Button>
              }
            />
          ) : loading ? (
            skeleton
          ) : tab === "providers" ? (
            shownProviders && shownProviders.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {shownProviders.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={searchActive || providerGroup ? "No practices match those filters" : "No practices yet"}
                body="Try a broader search, a different discipline, or clear your location filter."
              />
            )
          ) : tab === "services" ? (
            shownServices && shownServices.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {shownServices.map((s) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={searchActive || serviceCategory !== "ALL" ? "No sessions match those filters" : "No sessions yet"}
                body="Try a broader search, a different discipline, or clear your location filter."
              />
            )
          ) : tab === "products" ? (
            shownProducts && shownProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {shownProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={searchActive || productCategory !== "ALL" ? "No products match those filters" : "No products yet"}
                body="Try a broader search, a different category, or clear your location filter."
              />
            )
          ) : shownProfessionals && shownProfessionals.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shownProfessionals.map((prof) => (
                <ProfessionalCard key={prof.id} professional={prof} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                searchActive || professionalGroup
                  ? "No practitioners match those filters"
                  : "No practitioners yet"
              }
              body="Try a broader search, a different discipline, or clear your location filter."
            />
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}