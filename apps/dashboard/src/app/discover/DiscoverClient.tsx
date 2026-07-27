"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  AYURVEDA_CATALOG_BY_ID,
  AYURVEDA_CONDITIONS,
  AYURVEDA_KIND_LABEL,
  AYURVEDA_THERAPIES,
  CATEGORY_LABEL,
  formatAddress,
  listingMatchesAyurveda,
  PROVIDER_TYPE_LABEL,
  searchAyurvedaCatalog,
} from "@/lib/catalog";
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
import { useLocation } from "@/context/LocationContext";
import { useDirectoryUrlState } from "@/hooks/useDirectoryUrlState";
import { useNearMe } from "@/hooks/useNearMe";
import { useRecentViews } from "@/hooks/useRecentViews";
import {
  DensityCtx,
  DirectoryLayout,
  DirectoryResultGrid,
  FilterOption,
  FilterSearch,
  FilterSection,
  FilterStack,
  useDirectoryDensity,
} from "@/components/DirectoryLayout";
import { DirectoryMapView, type MapMarkerItem } from "@/components/DirectoryMapView";
import { ProviderCard } from "@/components/ProviderCard";
import { ServiceCard } from "@/components/ServiceCard";
import { ProductCard } from "@/components/ProductCard";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { Button, EmptyState, Input } from "@/components/ui";
import {
  CalendarIcon,
  LeafIcon,
  LotusIcon,
  MapPinIcon,
  MoonIcon,
  SearchIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";
import { haversineKm, readCoordsFromAddress, type LatLng } from "@/lib/geo";
import { practicePath, practitionerPath } from "@/lib/paths";

type Tab = "providers" | "services" | "products" | "professionals";
type ProSortKey = "recommended" | "rating" | "experience" | "name";

const PRO_SORT: { key: ProSortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "rating", label: "Top rated" },
  { key: "experience", label: "Most experience" },
  { key: "name", label: "Name A–Z" },
];

const PROVIDER_GROUPS: { label: string; types: ProviderType[]; icon: typeof LeafIcon; color: string; bg: string }[] = [
  { label: "Ayurveda", types: ["AYURVEDA_CLINIC", "AYURVEDA_RESORT", "PANCHAKARMA_CENTER"], icon: LeafIcon, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { label: "Yoga", types: ["YOGA_STUDIO"], icon: LotusIcon, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  { label: "Spa", types: ["LUXURY_SPA"], icon: MoonIcon, color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-500/10 border-teal-500/30" },
  { label: "Meditation", types: ["MEDITATION_CENTER"], icon: MoonIcon, color: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30" },
  { label: "Fitness", types: ["HEALTH_CLUB"], icon: UsersIcon, color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
  { label: "Consult", types: ["NUTRITIONIST"], icon: SparkleIcon, color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  { label: "Cooking", types: ["WELLNESS_KITCHEN"], icon: SparkleIcon, color: "text-lime-800 dark:text-lime-400", bg: "bg-lime-500/10 border-lime-500/30" },
  { label: "Nutrition", types: ["NUTRITIONIST"], icon: LeafIcon, color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  { label: "Events", types: ["WELLNESS_RETREAT"], icon: CalendarIcon, color: "text-sky-700 dark:text-sky-400", bg: "bg-sky-500/10 border-sky-500/30" },
];

const SERVICE_CATEGORIES: ServiceCategory[] = [
  "AYURVEDA",
  "YOGA",
  "SPA",
  "MEDITATION",
  "FITNESS",
  "COOKING",
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
  /** Near-me coordinates (stringified for URL state). */
  lat: "",
  lng: "",
  /** Ayurvedic treatment / condition catalog id */
  tx: "",
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
  const { countryName: activeCountryName } = useLocation();
  const { values, set, setMany, clear, sharePath } = useDirectoryUrlState(URL_DEFAULTS);

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
  const treatmentId = values.tx || "";
  const treatmentItem = treatmentId ? AYURVEDA_CATALOG_BY_ID[treatmentId] : undefined;
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
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const recentViews = useRecentViews(6);

  const userCoords: LatLng | null = useMemo(() => {
    const lat = Number(values.lat);
    const lng = Number(values.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng };
    }
    return null;
  }, [values.lat, values.lng]);

  const nearMe = useNearMe(
    useCallback(
      (result) => {
        setMany({
          loc: result.label,
          lat: String(result.lat),
          lng: String(result.lng),
        });
      },
      [setMany],
    ),
  );

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

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      if (!user || user.role !== "CONSUMER") {
        setMyDosha(null);
        return;
      }
      api
        .healthProfile(user.id)
        .then((h) => {
          if (active) setMyDosha(h ? primaryDoshaName(h) : null);
        })
        .catch(() => {
          if (active) setMyDosha(null);
        });
    };
    run();
    return () => {
      active = false;
    };
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
    const ayurOpts = { treatmentId: treatmentId || null, query: q || null };

    const filterProviders = (list: Provider[]) =>
      list.filter((p) => {
        const typeLabel = PROVIDER_TYPE_LABEL[p.type] ?? p.type;
        const hay = [
          p.businessName,
          typeLabel,
          p.code ?? "",
          formatAddress(p.address),
          p.brandProfile?.about ?? "",
          (p.brandProfile?.tags ?? []).join(" "),
        ].join(" ");
        if (q) {
          const plain = includesText(hay, q);
          const ayur = listingMatchesAyurveda(hay, ayurOpts);
          if (!plain && !ayur) return false;
        }
        if (treatmentId && !listingMatchesAyurveda(hay, { treatmentId })) return false;
        // When Near Me coords are set, don't hard-filter by city string — sort by distance instead.
        if (loc && !userCoords && !includesText(formatAddress(p.address), loc)) return false;
        if (verifiedOnly && p.verificationStatus !== "verified") return false;
        if (
          doshaOnly &&
          myDosha &&
          !matchesDoshaText(hay, myDosha)
        )
          return false;
        return true;
      });

    const filterServices = (list: Service[]) =>
      list.filter((s) => {
        const cat = CATEGORY_LABEL[s.category] ?? s.category;
        const hay = [
          s.name,
          s.description ?? "",
          cat,
          s.category,
          s.code ?? "",
          s.provider?.businessName ?? "",
          s.professional?.user?.fullName ?? "",
          providerLocation(s.providerId),
        ].join(" ");
        if (q) {
          const plain = includesText(hay, q);
          const ayur = listingMatchesAyurveda(hay, ayurOpts);
          if (!plain && !ayur) return false;
        }
        if (treatmentId && !listingMatchesAyurveda(hay, { treatmentId })) return false;
        if (loc && !userCoords && !includesText(providerLocation(s.providerId), loc)) return false;
        if (verifiedOnly && s.provider?.verificationStatus !== "verified") return false;
        if (
          doshaOnly &&
          myDosha &&
          !matchesDoshaText(hay, myDosha)
        )
          return false;
        return true;
      });

    const filterProducts = (list: Product[]) =>
      list.filter((p) => {
        const hay = [
          p.name,
          p.description ?? "",
          p.category ?? "",
          p.code ?? "",
          p.provider?.businessName ?? "",
          providerLocation(p.providerId),
        ].join(" ");
        if (q) {
          const plain = includesText(hay, q);
          const ayur = listingMatchesAyurveda(hay, ayurOpts);
          if (!plain && !ayur) return false;
        }
        if (treatmentId && !listingMatchesAyurveda(hay, { treatmentId })) return false;
        if (loc && !userCoords && !includesText(providerLocation(p.providerId), loc)) return false;
        if (verifiedOnly && p.provider?.verificationStatus !== "verified") return false;
        if (
          doshaOnly &&
          myDosha &&
          !matchesDoshaText(hay, myDosha)
        )
          return false;
        return true;
      });

    const filterProfessionals = (list: Professional[]) =>
      list.filter((prof) => {
        const typeLabel = prof.provider?.type
          ? PROVIDER_TYPE_LABEL[prof.provider.type] ?? prof.provider.type
          : "";
        const hay = [
          prof.user?.fullName ?? "",
          prof.title ?? "",
          prof.specializations.join(" "),
          prof.bio ?? "",
          prof.code ?? "",
          prof.provider?.businessName ?? "",
          typeLabel,
          providerLocation(prof.providerId),
        ].join(" ");
        if (q) {
          const plain = includesText(hay, q);
          const ayur = listingMatchesAyurveda(hay, ayurOpts);
          if (!plain && !ayur) return false;
        }
        if (treatmentId && !listingMatchesAyurveda(hay, { treatmentId })) return false;
        if (loc && !userCoords && !includesText(providerLocation(prof.providerId), loc)) return false;
        if (verifiedOnly && prof.provider?.verificationStatus !== "verified") return false;
        if (
          doshaOnly &&
          myDosha &&
          !matchesDoshaText(hay, myDosha)
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
  }, [providers, services, products, professionals, q, loc, userCoords, verifiedOnly, doshaOnly, myDosha, treatmentId]);

  const getProximityScore = useCallback(
    (addr?: { city?: string; state?: string; country?: string; lat?: number | null; lng?: number | null } | null, isVirtual?: boolean) => {
      const addrText = formatAddress(addr);
      if (userCoords) {
        const c = readCoordsFromAddress(addr);
        if (c) return haversineKm(userCoords, c);
        // No coords: soft-boost city string match, else deprioritise.
        if (loc && addrText && includesText(addrText, loc.split(",")[0] || loc)) return 50;
        return isVirtual ? 200 : 500;
      }
      const targetCountry = (activeCountryName || "").toLowerCase();
      const targetCity = (loc || "").toLowerCase();
      if (!addrText) return isVirtual ? 1 : 2;
      const lower = addrText.toLowerCase();
      if (targetCity && lower.includes(targetCity)) return 0;
      if (targetCountry && lower.includes(targetCountry)) return 0;
      if (isVirtual) return 1;
      return 2;
    },
    [activeCountryName, loc, userCoords],
  );

  const activeTypes = useMemo(
    () =>
      providerGroup
        ? (PROVIDER_GROUPS.find((g) => g.label === providerGroup)?.types ?? [])
        : null,
    [providerGroup],
  );

  const shownProviders = useMemo(() => {
    const filtered = base.providers?.filter(
      (p) => !activeTypes || activeTypes.includes(p.type),
    );
    if (!filtered) return null;
    return [...filtered].sort(
      (a, b) => getProximityScore(a.address) - getProximityScore(b.address),
    );
  }, [base.providers, activeTypes, getProximityScore]);

  const shownServices = useMemo(() => {
    const filtered = base.services?.filter(
      (s) => serviceCategory === "ALL" || s.category === serviceCategory,
    );
    if (!filtered) return null;
    return [...filtered].sort(
      (a, b) =>
        getProximityScore(providersById.get(a.providerId)?.address, a.isVirtual) -
        getProximityScore(providersById.get(b.providerId)?.address, b.isVirtual),
    );
  }, [base.services, serviceCategory, getProximityScore, providersById]);

  const shownProducts = useMemo(() => {
    const filtered = base.products?.filter(
      (p) => productCategory === "ALL" || p.category === productCategory,
    );
    if (!filtered) return null;
    return [...filtered].sort(
      (a, b) =>
        getProximityScore(providersById.get(a.providerId)?.address) -
        getProximityScore(providersById.get(b.providerId)?.address),
    );
  }, [base.products, productCategory, getProximityScore, providersById]);

  const professionalGroupTypes = useMemo(
    () =>
      providerGroup
        ? (PROVIDER_GROUPS.find((g) => g.label === providerGroup)?.types ?? [])
        : null,
    [providerGroup],
  );

  const shownProfessionals = useMemo(() => {
    const filtered = (base.professionals ?? []).filter((prof) => {
      if (!professionalGroupTypes) return true;
      if (prof.provider?.type && professionalGroupTypes.includes(prof.provider.type)) return true;
      const needle = professionalGroup!.toLowerCase();
      return prof.specializations.some(
        (s) => s.toLowerCase().includes(needle) || needle.includes(s.toLowerCase()),
      );
    });
    const sorted = sortProfessionals(filtered, proSort);
    return [...sorted].sort(
      (a, b) =>
        getProximityScore(a.provider?.address ?? providersById.get(a.providerId)?.address) -
        getProximityScore(b.provider?.address ?? providersById.get(b.providerId)?.address),
    );
  }, [base.professionals, professionalGroupTypes, professionalGroup, proSort, getProximityScore, providersById]);

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
    Boolean(q || loc || treatmentId) ||
    Boolean(providerGroup) ||
    serviceCategory !== "ALL" ||
    productCategory !== "ALL" ||
    verifiedOnly ||
    doshaOnly;

  const treatmentSuggestions = useMemo(
    () => (q.length >= 2 ? searchAyurvedaCatalog(q, 6) : []),
    [q],
  );

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
  if (treatmentItem)
    activeFilters.push({
      id: "tx",
      label: treatmentItem.label,
      onRemove: () => set("tx", ""),
    });
  if (loc || userCoords)
    activeFilters.push({
      id: "loc",
      label: userCoords ? `Near me · ${loc || "your area"}` : loc,
      onRemove: () => setMany({ loc: "", lat: "", lng: "" }),
    });
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
      showRecent={false}
      showTopToolbar={false}
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
                      ? "Name, Shirodhara, diabetes…"
                      : tab === "products"
                        ? "Product, brand, category…"
                        : "Abhyanga, Panchakarma, IBS…"
                  }
                  aria-label="Search by name, treatment or condition"
                />
              </FilterSearch>
              {treatmentSuggestions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 px-0.5">
                  {treatmentSuggestions.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setMany({ tx: t.id, q: "" });
                      }}
                      className="rounded-full border border-leaf/30 bg-leaf/10 px-2.5 py-1 text-[11px] font-bold text-forest hover:bg-leaf/20"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <FilterSearch icon={<MapPinIcon className="h-4 w-4" />}>
                <Input
                  value={location}
                  onChange={(e) => {
                    setMany({ loc: e.target.value, lat: "", lng: "" });
                  }}
                  placeholder="City, region or country"
                  aria-label="Search by location"
                />
              </FilterSearch>
            </div>
          </FilterSection>

          <FilterSection title="Ayurvedic treatments">
            <div className="max-h-48 space-y-2 overflow-y-auto overscroll-contain pr-0.5">
              <FilterOption active={!treatmentId} onClick={() => set("tx", "")}>
                All treatments
              </FilterOption>
              <p className="px-2.5 pt-1 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                {AYURVEDA_KIND_LABEL.therapy}
              </p>
              {AYURVEDA_THERAPIES.map((t) => (
                <FilterOption
                  key={t.id}
                  active={treatmentId === t.id}
                  onClick={() => set("tx", treatmentId === t.id ? "" : t.id)}
                >
                  {t.label}
                </FilterOption>
              ))}
              <p className="px-2.5 pt-2 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                {AYURVEDA_KIND_LABEL.condition}
              </p>
              {AYURVEDA_CONDITIONS.map((t) => (
                <FilterOption
                  key={t.id}
                  active={treatmentId === t.id}
                  onClick={() => set("tx", treatmentId === t.id ? "" : t.id)}
                >
                  {t.label}
                </FilterOption>
              ))}
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
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${g.bg} ${g.color}`}>
                          <Icon className="mr-1 h-3.5 w-3.5" />
                          {g.label}
                        </span>
                      </span>
                    </FilterOption>
                  );
                })}
              </FilterStack>
            </FilterSection>
          ) : null}

          <FilterSection title="Wellness Calendar">
            <WellnessCalendarWidget />
          </FilterSection>

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
      ) : (
        <>
          {/* Mobile quick filter tab chips */}
          <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => set("tab", t.key)}
                className={`profile-spring inline-flex shrink-0 min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all active:scale-95 ${
                  tab === t.key
                    ? "bg-forest text-white shadow-xs"
                    : "border border-hairline bg-surface text-ink-secondary hover:border-forest/40"
                }`}
              >
                <span>{t.label}</span>
                {tabTotals[t.key] ? (
                  <span className={`text-[10px] tabular-nums ${tab === t.key ? "text-white/80" : "text-ink-muted"}`}>
                    ({tabTotals[t.key]})
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Controls & Filter Bar: Near me · your area | Live Count | View Mode Switcher */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={nearMe.locate}
                disabled={nearMe.busy}
                className="profile-spring inline-flex items-center gap-1.5 rounded-full border border-leaf/40 bg-leaf/10 px-3.5 py-1.5 text-xs font-bold text-forest hover:bg-leaf/20 active:scale-95 disabled:opacity-60"
              >
                <MapPinIcon className="h-3.5 w-3.5" />
                {nearMe.busy ? "Locating…" : "Near me · your area"}
              </button>

              {filterActive ? (
                <button
                  type="button"
                  onClick={clear}
                  className="profile-spring inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-forest">
                {counts[tab]} {tab === "providers" ? "practices" : tab === "professionals" ? "practitioners" : tab === "services" ? "sessions" : "products"}
              </span>

              <div className="inline-flex items-center rounded-xl border border-hairline bg-clay/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    viewMode === "grid"
                      ? "bg-surface text-forest shadow-2xs"
                      : "text-ink-muted hover:text-forest"
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    viewMode === "list"
                      ? "bg-surface text-forest shadow-2xs"
                      : "text-ink-muted hover:text-forest"
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    viewMode === "map"
                      ? "bg-surface text-forest shadow-2xs"
                      : "text-ink-muted hover:text-forest"
                  }`}
                >
                  Map
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Seeker Intent & Goal Shortcuts */}
          <div className="sticky top-14 sm:top-16 z-30 mb-4 rounded-2xl border border-[var(--separator)] bg-surface/95 p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-forest">
                🌿 What is your wellness goal today?
              </span>
              <Link
                href="/dashboard/assessment"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--system-blue)] hover:underline"
              >
                <SparkleIcon className="h-3.5 w-3.5" />
                Take 2-Min Dosha Quiz →
              </Link>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                { label: "🧘 Panchakarma Detox", tx: "panchakarma" },
                { label: "💆 Stress & Shirodhara", tx: "shirodhara" },
                { label: "🦴 Joint & Pain Care", tx: "kati-basti" },
                { label: "🌿 Abhyanga Massage", tx: "abhyanga" },
                { label: "😴 Sleep & Insomnia", tx: "insomnia" },
                { label: "🍵 Gut & Digestive Health", tx: "ibs-digestive" },
                { label: "🌸 Skin & Rejuvenation", tx: "mukha-lepam" },
              ].map((goal) => (
                <button
                  key={goal.tx}
                  type="button"
                  onClick={() => setMany({ tx: goal.tx, q: "" })}
                  className={`profile-spring inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                    treatmentId === goal.tx
                      ? "bg-gradient-to-r from-forest to-emerald-800 text-white shadow-md"
                      : "border border-leaf/30 bg-leaf/10 text-forest hover:bg-leaf/20"
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <DensityCtx.Provider value={viewMode}>
            <DiscoverResults
              tab={tab}
              viewMode={viewMode}
              filterActive={filterActive}
              shownProviders={shownProviders}
              shownServices={shownServices}
              shownProducts={shownProducts}
              shownProfessionals={shownProfessionals}
              userCoords={userCoords}
              proSort={proSort}
              recentViews={recentViews}
              onClear={clear}
              onBrowsePractices={() => set("tab", "providers")}
            />
          </DensityCtx.Provider>
        </>
      )}
    </DirectoryLayout>
  );
}

function DiscoverResults({
  tab,
  viewMode,
  filterActive,
  shownProviders,
  shownServices,
  shownProducts,
  shownProfessionals,
  userCoords,
  proSort,
  recentViews,
  onClear,
  onBrowsePractices,
}: {
  tab: Tab;
  viewMode: "grid" | "list" | "map";
  filterActive: boolean;
  shownProviders: Provider[] | null;
  shownServices: Service[] | null;
  shownProducts: Product[] | null;
  shownProfessionals: Professional[];
  userCoords: LatLng | null;
  proSort: ProSortKey;
  recentViews: import("@/lib/directory").RecentItem[];
  onClear: () => void;
  onBrowsePractices: () => void;
}) {
  const density = useDirectoryDensity();
  const effectiveView = viewMode === "map" || density === "map" ? "map" : viewMode;

  const mapItems: MapMarkerItem[] = useMemo(() => {
    if (tab === "providers") {
      return (shownProviders ?? []).map((p) => ({
        id: p.id,
        title: p.businessName,
        subtitle: PROVIDER_TYPE_LABEL[p.type] ?? p.type,
        href: practicePath(p),
        address: p.address,
        coords: readCoordsFromAddress(p.address),
      }));
    }
    if (tab === "professionals") {
      return shownProfessionals.map((prof) => ({
        id: prof.id,
        title: prof.user?.fullName || prof.title || "Practitioner",
        subtitle: prof.provider?.businessName,
        href:
          prof.slug || prof.handle || prof.vanityHandle
            ? practitionerPath(prof)
            : prof.provider
              ? practicePath(prof.provider)
              : "/discover",
        address: prof.provider?.address,
        coords: readCoordsFromAddress(prof.provider?.address),
      }));
    }
    if (tab === "services") {
      return (shownServices ?? [])
        .filter((s) => s.provider)
        .map((s) => ({
          id: s.id,
          title: s.name,
          subtitle: s.provider?.businessName,
          href: `/book/${s.id}`,
          address: undefined,
          coords: null,
        }));
    }
    return (shownProducts ?? [])
      .filter((p) => p.provider)
      .map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.provider?.businessName,
        href: `/shop/${p.id}`,
        address: undefined,
        coords: null,
      }));
  }, [tab, shownProviders, shownProfessionals, shownServices, shownProducts]);

  const recentStrip = recentViews && recentViews.length > 0 ? (
    <div className="mt-8 rounded-2xl border border-hairline bg-surface/80 p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-forest">
          🕒 Recently viewed
        </span>
        <span className="text-[11px] font-semibold text-ink-muted">
          {recentViews.length} items
        </span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recentViews.map((item) => (
          <Link
            key={`${item.kind}-${item.id}`}
            href={item.href}
            className="profile-spring inline-flex shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-bold text-forest shadow-2xs hover:border-forest/40 active:scale-95"
          >
            <span>{item.title}</span>
            {item.subtitle ? (
              <span className="text-[10px] font-normal text-ink-muted">· {item.subtitle}</span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  ) : null;

  if (effectiveView === "map") {
    return (
      <>
        <DirectoryMapView
          items={mapItems}
          userCoords={userCoords}
          emptyLabel="No locations match these filters"
        />
        {recentStrip}
      </>
    );
  }

  if (tab === "providers") {
    if (!shownProviders || shownProviders.length === 0) {
      return (
        <>
          <EmptyState
            title={filterActive ? "No practices match those filters" : "No practices yet"}
            body="Try a broader search, a different discipline, or clear your location filter."
            action={
              filterActive ? (
                <Button type="button" variant="ghost" onClick={onClear}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
          {recentStrip}
        </>
      );
    }

    return (
      <>
        {effectiveView === "list" ? (
          <div className="space-y-4 divide-y divide-hairline/60">
            {shownProviders.map((p) => (
              <div key={p.id} className="pt-4 first:pt-0">
                <ProviderCard provider={p} />
              </div>
            ))}
          </div>
        ) : (
          <DirectoryResultGrid>
            {shownProviders.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </DirectoryResultGrid>
        )}
        {recentStrip}
      </>
    );
  }

  if (tab === "services") {
    return shownServices && shownServices.length > 0 ? (
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
            <Button type="button" variant="ghost" onClick={onClear}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (tab === "products") {
    return shownProducts && shownProducts.length > 0 ? (
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
            <Button type="button" variant="ghost" onClick={onClear}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (shownProfessionals.length > 0) {
    return (
      <>
        {!filterActive && shownProfessionals.length >= 4 ? (
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
    );
  }

  return (
    <EmptyState
      title={filterActive ? "No practitioners match those filters" : "No practitioners yet"}
      body={
        filterActive
          ? "Try another discipline, clear location, or turn off Verified only."
          : "Practitioners appear here once practices add their team."
      }
      action={
        filterActive ? (
          <Button type="button" variant="ghost" onClick={onClear}>
            Clear filters
          </Button>
        ) : (
          <Button type="button" variant="soft" onClick={onBrowsePractices}>
            Browse practices
          </Button>
        )
      }
    />
  );
}

function WellnessCalendarWidget({
  onSelectDate,
}: {
  onSelectDate?: (date: Date) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // July 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(26);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
  };
  const jumpToToday = () => {
    setCurrentDate(new Date(2026, 6, 1));
    setSelectedDay(26);
  };

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-3 shadow-2xs">
      <div className="flex items-center justify-between gap-1 mb-2.5">
        <button
          type="button"
          onClick={prevMonth}
          className="profile-spring rounded-lg px-2 py-0.5 text-xs font-bold text-ink-muted hover:bg-clay hover:text-forest"
        >
          ← Prev
        </button>
        <span className="font-display text-xs font-bold text-forest">
          {monthName} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="profile-spring rounded-lg px-2 py-0.5 text-xs font-bold text-ink-muted hover:bg-clay hover:text-forest"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day} className="text-[9px] font-bold uppercase tracking-wider text-ink-muted">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isSelected = selectedDay === day;
          const isToday = year === 2026 && monthIndex === 6 && day === 26;

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                setSelectedDay(day);
                if (onSelectDate) onSelectDate(new Date(year, monthIndex, day));
              }}
              className={`profile-spring flex h-7 w-full items-center justify-center rounded-md text-[11px] font-semibold transition-all ${
                isSelected
                  ? "bg-forest text-white shadow-2xs font-bold"
                  : isToday
                    ? "border border-leaf bg-leaf/10 font-bold text-forest"
                    : "hover:bg-clay text-foreground"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-hairline/60 pt-2">
        <button
          type="button"
          onClick={jumpToToday}
          className="text-[11px] font-bold text-[var(--system-blue)] hover:underline"
        >
          Jump to today
        </button>
        {selectedDay ? (
          <span className="text-[10px] font-medium text-ink-muted">
            {monthName} {selectedDay}, {year}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function DiscoverClient() {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <DiscoverInner />
    </Suspense>
  );
}
