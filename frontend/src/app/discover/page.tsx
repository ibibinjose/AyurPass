"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { CATEGORY_LABEL, formatAddress } from "@/lib/catalog";
import type { Product, Provider, Service, ServiceCategory, ProviderType, Professional } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProviderCard } from "@/components/ProviderCard";
import { ServiceCard } from "@/components/ServiceCard";
import { ProductCard } from "@/components/ProductCard";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { EmptyState, Input } from "@/components/ui";
import { MapPinIcon, SearchIcon } from "@/components/icons";

type Tab = "providers" | "services" | "products" | "professionals";

const PROVIDER_GROUPS: { label: string; types: ProviderType[] }[] = [
  { label: "Ayurveda", types: ["AYURVEDA_CLINIC", "AYURVEDA_RESORT", "PANCHAKARMA_CENTER"] },
  { label: "Yoga", types: ["YOGA_STUDIO"] },
  { label: "Spa", types: ["LUXURY_SPA"] },
  { label: "Meditation", types: ["MEDITATION_CENTER"] },
  { label: "Health Club", types: ["HEALTH_CLUB"] },
  { label: "Retreats", types: ["WELLNESS_RETREAT"] },
];

const SERVICE_CATEGORIES: ServiceCategory[] = [
  "AYURVEDA",
  "YOGA",
  "SPA",
  "MEDITATION",
  "FITNESS",
  "COACHING",
  "CONSULTATION",
  "PACKAGE",
];

function includesText(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/** Chip button used for every filter row. */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-forest text-white"
          : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
      }`}
    >
      {children}
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
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | "ALL">("ALL");
  const [productCategory, setProductCategory] = useState<string>("ALL");

  useEffect(() => {
    Promise.all([
      api.providers(), 
      api.services(), 
      api.products(),
      api.professionals()
    ])
      .then(([p, s, pr, prof]) => {
        setProviders(p);
        setServices(s);
        setProducts(pr);
        setProfessionals(prof);
      })
      .catch(() => setError(true));
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
  const shownProfessionals = base.professionals;

  const productCategories = useMemo(() => {
    const set = new Set<string>();
    (products ?? []).forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [products]);

  const counts = {
    providers: base.providers?.length ?? 0,
    services: base.services?.length ?? 0,
    products: base.products?.length ?? 0,
    professionals: base.professionals?.length ?? 0,
  };

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
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <h1 className="font-display text-3xl text-forest sm:text-4xl">Discover wellness near you</h1>
        <p className="mt-2 max-w-2xl text-ink-secondary">
          Search verified clinics, studios, spas, meditation centers and health clubs — plus every
          treatment, practitioner and product they offer. Filter by name, location and discipline.
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

        {/* Tabs with live result counts */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-hairline">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-forest text-forest"
                  : "border-transparent text-ink-muted hover:text-forest"
              }`}
            >
              {t.label}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  tab === t.key ? "bg-forest text-white" : "bg-clay text-ink-secondary"
                }`}
              >
                {loading ? "…" : counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Category filters — contextual to the active tab */}
        <div className="mt-6 flex flex-wrap gap-2">
          {tab === "providers" && (
            <>
              <Chip active={!providerGroup} onClick={() => setProviderGroup(null)}>
                All
              </Chip>
              {PROVIDER_GROUPS.map((g) => (
                <Chip
                  key={g.label}
                  active={providerGroup === g.label}
                  onClick={() => setProviderGroup(g.label)}
                >
                  {g.label}
                </Chip>
              ))}
            </>
          )}
          {tab === "services" && (
            <>
              <Chip active={serviceCategory === "ALL"} onClick={() => setServiceCategory("ALL")}>
                All
              </Chip>
              {SERVICE_CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  active={serviceCategory === c}
                  onClick={() => setServiceCategory(c)}
                >
                  {CATEGORY_LABEL[c]}
                </Chip>
              ))}
            </>
          )}
          {tab === "products" && (
            <>
              <Chip active={productCategory === "ALL"} onClick={() => setProductCategory("ALL")}>
                All
              </Chip>
              {productCategories.map((c) => (
                <Chip key={c} active={productCategory === c} onClick={() => setProductCategory(c)}>
                  {c}
                </Chip>
              ))}
            </>
          )}
          {tab === "professionals" && (
            <div className="text-sm text-ink-secondary">
              Filter by location and search terms
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mt-8">
          {error ? (
            <EmptyState
              title="We couldn't load the directory"
              body="The wellness network is unreachable right now. Please try again shortly."
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
              title={searchActive ? "No practitioners match those filters" : "No practitioners yet"}
              body="Try a broader search or clear your location filter."
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}