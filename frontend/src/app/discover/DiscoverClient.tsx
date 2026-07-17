"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { CATEGORY_LABEL, formatAddress } from "@/lib/catalog";
import { matchesDoshaText, type ActiveFilterChip } from "@/lib/directory";
import type {
  Product,
  Provider,
  Service,
  ServiceCategory,
  ProviderType,
  Professional,
} from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
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
import { ProviderCard } from "@/components/ProviderCard";
import { ServiceCard } from "@/components/ServiceCard";
import { ProductCard } from "@/components/ProductCard";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { Button, EmptyState, Input } from "@/components/ui";
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

type Tab = "providers" | "services" | "products" | "professionals";
type ProSortKey = "recommended" | "rating" | "experience" | "name";

const PRO_SORT: { key: ProSortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "rating", label: "Top rated" },
  { key: "experience", label: "Most experience" },
  { key: "name", label: "Name A–Z" },
];

const PROVIDER_GROUPS: { label: string; types: ProviderType[]; icon: typeof LeafIcon }[] = [
  { label: "Ayurveda", types: ["AYURVEDA_CLINIC", "AYURVEDA_RESORT", "PANCHAKARMA_CENTER"], icon: LeafIcon },
  { label: "Yoga", types: ["YOGA_STUDIO"], icon: LotusIcon },
  { label: "Spa", types: ["LUXURY_SPA"], icon: MoonIcon },
  { label: "Meditation", types: ["MEDITATION_CENTER"], icon: MoonIcon },
  { label: "Health Club", types: ["HEALTH_CLUB"], icon: UsersIcon },
  { label: "Nutrition", types: ["NUTRITIONIST"], icon: LeafIcon },
  { label: "Retreats", types: ["WELLNESS_RETREAT"], icon: CompassIcon },
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

const TABS: { key: Tab; label: string }[] = [
  { key: "providers", label: "Practices" },
  { key: "professionals", label: "Practitioners" },
  { key: "services", label: "Sessions" },
  { key: "products", label: "Products" },
];

const URL_DEFAULTS = {
  tab: "providers",
  q: "",
  loc: "",
  group: "",
  cat: "ALL",
  pcat: "ALL",
  verified: "",
  dosha: "",
  sort: "recommended",
};

function sortProfessionals(list: Professional[], sort: ProSortKey): Professional[] {
  const copy = [...list];
  copy.sort((a, b) => {
    if (sort === "name") {
      const an = (a.user?.fullName || a.title || "").toLowerCase();
      const bn = (b.user?.fullName || b.title || "").toLowerCase();
      return an.localeCompare(bn);
    }
    if (sort === "experience") {
      return (b.yearsExperience ?? 0) - (a.yearsExperience ?? 0);
    }
    if (sort === "rating") {
      const rd = Number(b.rating ?? 0) - Number(a.rating ?? 0);
      if (rd !== 0) return rd;
      return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    }
    // recommended: verified first, then rating, then reviews, then experience
    const av =
      a.provider?.verificationStatus === "verified" ||
      (a.healthAuthorities ?? []).some((x) => x.code?.toUpperCase() === "AAA")
        ? 0
        : 1;
    const bv =
      b.provider?.verificationStatus === "verified" ||
      (b.healthAuthorities ?? []).some((x) => x.code?.toUpperCase() === "AAA")
        ? 0
        : 1;
    if (av !== bv) return av - bv;
    const rd = Number(b.rating ?? 0) - Number(a.rating ?? 0);
    if (rd !== 0) return rd;
    const rc = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    if (rc !== 0) return rc;
    return (b.yearsExperience ?? 0) - (a.yearsExperience ?? 0);
  });
  return copy;
}

function includesText(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function ResultSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[1.125rem] border border-[var(--separator)] bg-surface"
        >
          <div className="aspect-[16/10] animate-pulse bg-clay/80" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-clay/90" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-clay/70" />
            <div className="h-3 w-full animate-pulse rounded bg-clay/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function primaryDoshaName(scores: {
  vataScore?: string | number | null;
  pittaScore?: string | number | null;
  kaphaScore?: string | number | null;
}): string | null {
  const pairs: [string, number][] = [
    ["vata", Number(scores.vataScore ?? 0)],
    ["pitta", Number(scores.pittaScore ?? 0)],
    ["kapha", Number(scores.kaphaScore ?? 0)],
  ];
  pairs.sort((a, b) => b[1] - a[1]);
  if (!pairs[0][1]) return null;
  return pairs[0][0];
}

function DiscoverInner() {
  const { user } = useAuth();
  const { values, set, clear, sharePath } = useDirectoryUrlState(URL_DEFAULTS);

  const tab = (["providers", "services", "products", "professionals"].includes(values.tab)
    ? values.tab
    : "providers") as Tab;
  const query = values.q;
  const location = values.loc;
  const providerGroup = values.group || null;
  const professionalGroup = values.group || null;
  const serviceCategory = (values.cat || "ALL") as ServiceCategory | "ALL";
  const productCategory = values.pcat || "ALL";
  const verifiedOnly = values.verified === "1";
  const doshaOnly = values.dosha === "1";
  const proSort = (
    ["recommended", "rating", "experience", "name"].includes(values.sort)
      ? values.sort
      : "recommended"
  ) as ProSortKey;

  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [services, setServices] = useState<Service[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [professionals, setProfessionals] = useState<Professional[] | null>(null);
  const [error, setError] = useState(false);
  const [myDosha, setMyDosha] = useState<string | null>(null);

  const nearMe = useNearMe((label) => set("loc", label));

  const load = useCallback(() => {
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user || user.role !== "CONSUMER") {
      setMyDosha(null);
      return;
    }
    api
      .healthProfile(user.id)
      .then((h) => setMyDosha(h ? primaryDoshaName(h) : null))
      .catch(() => setMyDosha(null));
  }, [user]);

  const loading =
    !error &&
    (providers === null || services === null || products === null || professionals === null);

  const providersById = useMemo(() => {
    const map = new Map<string, Provider>();
    (providers ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [providers]);

  const providerLocation = (providerId: string) =>
    formatAddress(providersById.get(providerId)?.address);

  const q = query.trim();
  const loc = location.trim();

  const base = useMemo(() => {
    const filterProviders = (list: Provider[]) =>
      list.filter((p) => {
        if (q && !includesText(p.businessName, q)) return false;
        if (loc && !includesText(formatAddress(p.address), loc)) return false;
        if (verifiedOnly && p.verificationStatus !== "verified") return false;
        if (
          doshaOnly &&
          myDosha &&
          !matchesDoshaText(
            `${p.businessName} ${p.brandProfile?.about ?? ""} ${(p.brandProfile?.tags ?? []).join(" ")}`,
            myDosha,
          )
        )
          return false;
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
        if (verifiedOnly && s.provider?.verificationStatus !== "verified") return false;
        if (
          doshaOnly &&
          myDosha &&
          !matchesDoshaText(`${s.name} ${s.description ?? ""} ${s.category}`, myDosha)
        )
          return false;
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
        if (verifiedOnly && p.provider?.verificationStatus !== "verified") return false;
        if (
          doshaOnly &&
          myDosha &&
          !matchesDoshaText(`${p.name} ${p.description ?? ""} ${p.category ?? ""}`, myDosha)
        )
          return false;
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
        if (verifiedOnly && prof.provider?.verificationStatus !== "verified") return false;
        if (
          doshaOnly &&
          myDosha &&
          !matchesDoshaText(
            `${prof.title ?? ""} ${prof.specializations.join(" ")}`,
            myDosha,
          )
        )
          return false;
        return true;
      });

    return {
      providers: providers ? filterProviders(providers) : null,
      services: services ? filterServices(services) : null,
      products: products ? filterProducts(products) : null,
      professionals: professionals ? filterProfessionals(professionals) : null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers, services, products, professionals, q, loc, verifiedOnly, doshaOnly, myDosha]);

  const activeTypes = providerGroup
    ? (PROVIDER_GROUPS.find((g) => g.label === providerGroup)?.types ?? [])
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
    ? (PROVIDER_GROUPS.find((g) => g.label === professionalGroup)?.types ?? [])
    : null;

  const shownProfessionals = useMemo(() => {
    const filtered = (base.professionals ?? []).filter((prof) => {
      if (!professionalGroupTypes) return true;
      if (prof.provider?.type && professionalGroupTypes.includes(prof.provider.type)) return true;
      const needle = professionalGroup!.toLowerCase();
      return prof.specializations.some(
        (s) => s.toLowerCase().includes(needle) || needle.includes(s.toLowerCase()),
      );
    });
    return sortProfessionals(filtered, proSort);
  }, [base.professionals, professionalGroupTypes, professionalGroup, proSort]);

  const productCategories = useMemo(() => {
    const set = new Set<string>();
    (products ?? []).forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [products]);

  const counts = {
    providers: shownProviders?.length ?? 0,
    services: shownServices?.length ?? 0,
    products: shownProducts?.length ?? 0,
    professionals: shownProfessionals.length,
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

  const filterActive =
    Boolean(q || loc) ||
    Boolean(providerGroup) ||
    serviceCategory !== "ALL" ||
    productCategory !== "ALL" ||
    verifiedOnly ||
    doshaOnly;

  const resultLabel =
    tab === "providers"
      ? "practices"
      : tab === "professionals"
        ? "practitioners"
        : tab === "services"
          ? "sessions"
          : "products";

  const activeFilters: ActiveFilterChip[] = [];
  if (q)
    activeFilters.push({ id: "q", label: `“${q}”`, onRemove: () => set("q", "") });
  if (loc)
    activeFilters.push({ id: "loc", label: loc, onRemove: () => set("loc", "") });
  if (values.group)
    activeFilters.push({
      id: "group",
      label: values.group,
      onRemove: () => set("group", ""),
    });
  if (tab === "services" && serviceCategory !== "ALL")
    activeFilters.push({
      id: "cat",
      label: CATEGORY_LABEL[serviceCategory as ServiceCategory] ?? serviceCategory,
      onRemove: () => set("cat", "ALL"),
    });
  if (tab === "products" && productCategory !== "ALL")
    activeFilters.push({
      id: "pcat",
      label: productCategory,
      onRemove: () => set("pcat", "ALL"),
    });
  if (verifiedOnly)
    activeFilters.push({
      id: "verified",
      label: "Verified only",
      onRemove: () => set("verified", ""),
    });
  if (doshaOnly && myDosha)
    activeFilters.push({
      id: "dosha",
      label: `My dosha · ${myDosha}`,
      onRemove: () => set("dosha", ""),
    });

  const heroTitle =
    tab === "professionals"
      ? "Find your practitioner"
      : tab === "services"
        ? "Find sessions"
        : tab === "products"
          ? "Shop wellness"
          : "Discover wellness near you";

  const heroDescription =
    tab === "professionals"
      ? "Ayurvedic doctors, yoga teachers, spa therapists and coaches — filter by discipline, credentials and ratings."
      : "Ayurveda, yoga, spa, meditation, health clubs and retreats — practices, practitioners, sessions and products in one place.";

  const verifiedProCount = useMemo(
    () =>
      (base.professionals ?? []).filter(
        (p) =>
          p.provider?.verificationStatus === "verified" ||
          (p.healthAuthorities ?? []).some((a) => a.code?.toUpperCase() === "AAA"),
      ).length,
    [base.professionals],
  );

  return (
    <DirectoryLayout
      eyebrow={tab === "professionals" ? "Practitioners" : "Directory"}
      title={heroTitle}
      description={heroDescription}
      heroExtra={
        tab === "professionals" ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <p className="text-sm font-semibold text-ink-muted">
              Looking for a clinic or studio?{" "}
              <button
                type="button"
                onClick={() => set("tab", "providers")}
                className="font-bold text-[var(--system-blue)] hover:underline"
              >
                Browse practices →
              </button>
            </p>
            {!loading && tabTotals.professionals > 0 ? (
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-bold text-forest shadow-sm">
                  {tabTotals.professionals} practitioners
                </span>
                {verifiedProCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => set("verified", verifiedOnly ? "" : "1")}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-sm transition-colors ${
                      verifiedOnly
                        ? "bg-forest text-white"
                        : "border border-hairline bg-surface text-forest hover:border-leaf"
                    }`}
                  >
                    <SparkleIcon className="h-3 w-3" />
                    {verifiedProCount} verified
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-semibold text-ink-muted">
            Run a wellness practice?{" "}
            <Link
              href="/list-your-business"
              className="font-bold text-[var(--system-blue)] hover:underline"
            >
              List it free →
            </Link>
          </p>
        )
      }
      filterActive={filterActive}
      onClearFilters={clear}
      filterSummary={`${activeFilters.length || ""}`.trim() || undefined}
      activeFilters={activeFilters}
      resultCount={loading ? null : counts[tab]}
      resultLabel={resultLabel}
      sharePath={sharePath}
      sort={tab === "professionals" ? PRO_SORT : undefined}
      sortValue={tab === "professionals" ? proSort : undefined}
      onSortChange={
        tab === "professionals" ? (k) => set("sort", k) : undefined
      }
      nearMe={{
        onLocate: nearMe.locate,
        busy: nearMe.busy,
        error: nearMe.error,
      }}
      sidebar={
        <>
          <FilterSection title="Search">
            <div className="space-y-2">
              <FilterSearch icon={<SearchIcon className="h-4 w-4" />}>
                <Input
                  value={query}
                  onChange={(e) => set("q", e.target.value)}
                  placeholder={
                    tab === "professionals"
                      ? "Name, title, specialisation…"
                      : "Name, treatment…"
                  }
                  aria-label="Search by name"
                />
              </FilterSearch>
              <FilterSearch icon={<MapPinIcon className="h-4 w-4" />}>
                <Input
                  value={location}
                  onChange={(e) => set("loc", e.target.value)}
                  placeholder="City or country"
                  aria-label="Search by location"
                />
              </FilterSearch>
            </div>
          </FilterSection>

          <FilterSection title="Browse">
            <FilterStack>
              {TABS.map((t) => (
                <FilterOption
                  key={t.key}
                  active={tab === t.key}
                  count={loading ? undefined : tabTotals[t.key]}
                  onClick={() => set("tab", t.key)}
                >
                  {t.label}
                </FilterOption>
              ))}
            </FilterStack>
          </FilterSection>

          <FilterSection title="Quality">
            <FilterStack>
              <FilterOption
                active={verifiedOnly}
                onClick={() => set("verified", verifiedOnly ? "" : "1")}
              >
                <span className="inline-flex items-center gap-1.5">
                  <SparkleIcon className="h-3.5 w-3.5" />
                  Verified only
                </span>
              </FilterOption>
              {myDosha ? (
                <FilterOption
                  active={doshaOnly}
                  onClick={() => set("dosha", doshaOnly ? "" : "1")}
                >
                  Matches my dosha ({myDosha})
                </FilterOption>
              ) : user?.role === "CONSUMER" ? (
                <Link
                  href="/dashboard/assessment"
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-[var(--system-blue)] hover:underline"
                >
                  Take dosha assessment →
                </Link>
              ) : null}
            </FilterStack>
          </FilterSection>

          {tab === "providers" || tab === "professionals" ? (
            <FilterSection title="Discipline">
              <FilterStack>
                <FilterOption
                  active={!values.group}
                  count={
                    loading
                      ? undefined
                      : tab === "providers"
                        ? providerGroupCounts.get("All")
                        : professionalGroupCounts.get("All")
                  }
                  onClick={() => set("group", "")}
                >
                  All disciplines
                </FilterOption>
                {PROVIDER_GROUPS.map((g) => {
                  const Icon = g.icon;
                  const n =
                    tab === "providers"
                      ? providerGroupCounts.get(g.label)
                      : professionalGroupCounts.get(g.label);
                  return (
                    <FilterOption
                      key={g.label}
                      active={values.group === g.label}
                      count={loading ? undefined : n}
                      onClick={() => set("group", g.label)}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 opacity-80" />
                        {g.label}
                      </span>
                    </FilterOption>
                  );
                })}
              </FilterStack>
            </FilterSection>
          ) : null}

          {tab === "services" ? (
            <FilterSection title="Session type">
              <FilterStack>
                <FilterOption
                  active={serviceCategory === "ALL"}
                  count={loading ? undefined : serviceCategoryCounts.get("ALL")}
                  onClick={() => set("cat", "ALL")}
                >
                  All sessions
                </FilterOption>
                {SERVICE_CATEGORIES.map((c) => (
                  <FilterOption
                    key={c}
                    active={serviceCategory === c}
                    count={loading ? undefined : serviceCategoryCounts.get(c)}
                    onClick={() => set("cat", c)}
                  >
                    {CATEGORY_LABEL[c]}
                  </FilterOption>
                ))}
              </FilterStack>
            </FilterSection>
          ) : null}

          {tab === "products" ? (
            <FilterSection title="Product category">
              <FilterStack>
                <FilterOption
                  active={productCategory === "ALL"}
                  count={loading ? undefined : productCategoryCounts.get("ALL")}
                  onClick={() => set("pcat", "ALL")}
                >
                  All products
                </FilterOption>
                {productCategories.map((c) => (
                  <FilterOption
                    key={c}
                    active={productCategory === c}
                    count={loading ? undefined : productCategoryCounts.get(c)}
                    onClick={() => set("pcat", c)}
                  >
                    {c}
                  </FilterOption>
                ))}
              </FilterStack>
            </FilterSection>
          ) : null}
        </>
      }
    >
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
        <ResultSkeleton />
      ) : tab === "providers" ? (
        shownProviders && shownProviders.length > 0 ? (
          <DirectoryResultGrid>
            {shownProviders.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </DirectoryResultGrid>
        ) : (
          <EmptyState
            title={filterActive ? "No practices match those filters" : "No practices yet"}
            body="Try a broader search, a different discipline, or clear your location filter."
            action={
              filterActive ? (
                <Button type="button" variant="ghost" onClick={clear}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )
      ) : tab === "services" ? (
        shownServices && shownServices.length > 0 ? (
          <DirectoryResultGrid>
            {shownServices.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </DirectoryResultGrid>
        ) : (
          <EmptyState
            title={filterActive ? "No sessions match those filters" : "No sessions yet"}
            body="Try a broader search or clear filters."
            action={
              filterActive ? (
                <Button type="button" variant="ghost" onClick={clear}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )
      ) : tab === "products" ? (
        shownProducts && shownProducts.length > 0 ? (
          <DirectoryResultGrid>
            {shownProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </DirectoryResultGrid>
        ) : (
          <EmptyState
            title={filterActive ? "No products match those filters" : "No products yet"}
            body="Try a broader search or clear filters."
            action={
              filterActive ? (
                <Button type="button" variant="ghost" onClick={clear}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )
      ) : shownProfessionals.length > 0 ? (
        <>
          {tab === "professionals" && !filterActive && shownProfessionals.length >= 4 ? (
            <p className="mb-1 text-sm font-medium text-ink-muted">
              Sorted by{" "}
              <span className="font-semibold text-forest">
                {PRO_SORT.find((s) => s.key === proSort)?.label ?? "Recommended"}
              </span>
              {" · "}
              change sort above to prioritise ratings or experience.
            </p>
          ) : null}
          <DirectoryResultGrid>
            {shownProfessionals.map((prof) => (
              <ProfessionalCard key={prof.id} professional={prof} />
            ))}
          </DirectoryResultGrid>
        </>
      ) : (
        <EmptyState
          title={
            filterActive ? "No practitioners match those filters" : "No practitioners yet"
          }
          body={
            filterActive
              ? "Try another discipline, clear location, or turn off Verified only."
              : "Practitioners appear here once practices add their team."
          }
          action={
            filterActive ? (
              <Button type="button" variant="ghost" onClick={clear}>
                Clear filters
              </Button>
            ) : (
              <Button type="button" variant="soft" onClick={() => set("tab", "providers")}>
                Browse practices
              </Button>
            )
          }
        />
      )}
    </DirectoryLayout>
  );
}

export default function DiscoverClient() {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <DiscoverInner />
    </Suspense>
  );
}
