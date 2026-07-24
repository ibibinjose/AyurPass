"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginUrl } from "@/lib/auth-redirect";
import {
  readDensity,
  readFiltersOpen,
  saveSearch,
  writeDensity,
  writeFiltersOpen,
  type ActiveFilterChip,
  type DensityMode,
} from "@/lib/directory";
import { useRecentViews } from "@/hooks/useRecentViews";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { MapPinIcon, SearchIcon, XIcon } from "@/components/icons";

/** Navbar-aware sticky offset used across directory + app side panels. */
export const STICKY_BELOW_NAV =
  "top-[calc(3.5rem+var(--safe-top)+0.5rem)] sm:top-[calc(4rem+var(--safe-top)+0.5rem)]";

export type SortOption = { key: string; label: string };

const DensityCtx = createContext<DensityMode>("grid");
export function useDirectoryDensity(): DensityMode {
  return useContext(DensityCtx);
}

/**
 * Shared directory shell with sticky sidebar, active chips, density toggle,
 * sort toolbar, recent views, save-search, and mobile filter persistence.
 */
export function DirectoryLayout({
  eyebrow,
  title,
  description,
  heroExtra,
  sidebar,
  children,
  filterActive = false,
  onClearFilters,
  filterSummary,
  activeFilters = [],
  resultCount,
  resultLabel = "results",
  sort,
  sortValue,
  onSortChange,
  density,
  onDensityChange,
  sharePath,
  nearMe,
  showRecent = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  heroExtra?: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  filterActive?: boolean;
  onClearFilters?: () => void;
  filterSummary?: string;
  activeFilters?: ActiveFilterChip[];
  resultCount?: number | null;
  resultLabel?: string;
  sort?: SortOption[];
  sortValue?: string;
  onSortChange?: (key: string) => void;
  density?: DensityMode;
  onDensityChange?: (mode: DensityMode) => void;
  /** Current path+query for save-search / share. */
  sharePath?: string;
  nearMe?: {
    onLocate: () => void;
    busy?: boolean;
    error?: string | null;
  };
  showRecent?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [localDensity, setLocalDensity] = useState<DensityMode>("grid");
  const [savedFlash, setSavedFlash] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const recent = useRecentViews(6);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      const storedOpen = readFiltersOpen();
      if (storedOpen != null) setMobileOpen(storedOpen);
      else if (filterActive) setMobileOpen(true);
      setLocalDensity(readDensity());
      setHydrated(true);
    };
    run();
    return () => {
      active = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- hydrate once

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      // Auto-open mobile filters when something becomes active.
      if (filterActive && readFiltersOpen() == null) setMobileOpen(true);
    };
    run();
    return () => {
      active = false;
    };
  }, [filterActive, hydrated]);

  function toggleMobile() {
    setMobileOpen((v) => {
      const next = !v;
      writeFiltersOpen(next);
      return next;
    });
  }

  const densityMode = density ?? localDensity;
  function setDensityMode(mode: DensityMode) {
    writeDensity(mode);
    setLocalDensity(mode);
    onDensityChange?.(mode);
  }

  function onSaveSearch() {
    if (!sharePath) return;
    if (!user) {
      router.push(loginUrl(sharePath));
      return;
    }
    const [path, qs = ""] = sharePath.split("?");
    saveSearch({
      label: title,
      path: path || "/",
      query: qs ? `?${qs}` : "",
    });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <LayoutWrapper>
      <div className="flex-1 pb-10">
        <section className="relative border-b border-[var(--separator)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(47,90,68,0.12),_transparent_55%),linear-gradient(180deg,var(--clay)_0%,var(--background)_75%)]"
          />
          <div className="page-shell relative !max-w-[88rem] !pb-6 !pt-7 sm:!pb-7 sm:!pt-9">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--system-blue)]">
              {eyebrow}
            </p>
            <h1 className="type-display mt-2 max-w-2xl">{title}</h1>
            <p className="type-body mt-2 max-w-xl text-[0.9375rem] font-medium sm:text-base">
              {description}
            </p>
            {heroExtra ? <div className="mt-2.5">{heroExtra}</div> : null}
          </div>
        </section>

        <div className="page-shell !max-w-[88rem] !pt-4 sm:!pt-5">
          {/* Mobile sticky filter bar */}
          <div
            className={`sticky z-30 -mx-[var(--space-page-x)] mb-3 border-b border-[var(--separator)] bg-background/90 px-[var(--space-page-x)] py-2 backdrop-blur-xl lg:hidden ${STICKY_BELOW_NAV}`}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMobile}
                className="profile-spring inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--separator)] bg-surface px-3.5 text-xs font-bold text-foreground shadow-sm"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? "Hide filters" : "Search & filters"}
                {filterActive && !mobileOpen ? (
                  <span className="rounded-full bg-[var(--system-blue)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {filterSummary || "On"}
                  </span>
                ) : null}
              </button>
              {filterActive && onClearFilters ? (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="profile-spring inline-flex min-h-9 items-center gap-1 rounded-full border border-[var(--separator)] bg-surface px-3 text-xs font-semibold text-ink-secondary"
                >
                  <XIcon className="h-3 w-3" />
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(15rem,16.5rem)_minmax(0,1fr)] lg:items-start lg:gap-7">
            <aside
              className={`directory-sidebar ${
                mobileOpen ? "block" : "hidden"
              } lg:sticky lg:block lg:self-start ${STICKY_BELOW_NAV}`}
            >
              <div className="directory-sidebar-panel rounded-[1rem] border border-[var(--separator)] bg-surface p-3 shadow-[0_6px_20px_rgba(0,0,0,0.04)] sm:p-3.5 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:overscroll-contain">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                    Search &amp; filters
                  </p>
                  {filterActive && onClearFilters ? (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="text-[11px] font-bold text-[var(--system-blue)] hover:underline"
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>

                {nearMe ? (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={nearMe.onLocate}
                      disabled={nearMe.busy}
                      className="profile-spring inline-flex w-full min-h-8 items-center justify-center gap-1.5 rounded-lg border border-[var(--separator)] bg-clay/30 px-2.5 text-xs font-bold text-forest hover:bg-clay disabled:opacity-60"
                    >
                      <MapPinIcon className="h-3.5 w-3.5" />
                      {nearMe.busy ? "Locating…" : "Near me"}
                    </button>
                    {nearMe.error ? (
                      <p className="mt-1.5 text-[11px] font-medium text-red-700">{nearMe.error}</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-4">{sidebar}</div>

                {sharePath ? (
                  <div className="mt-4 border-t border-[var(--separator)] pt-3">
                    <button
                      type="button"
                      onClick={onSaveSearch}
                      className="profile-spring inline-flex w-full min-h-8 items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--separator)] px-2.5 text-xs font-bold text-ink-secondary hover:border-[var(--system-blue)]/40 hover:text-foreground"
                    >
                      <SearchIcon className="h-3.5 w-3.5" />
                      {savedFlash ? "Search saved" : user ? "Save this search" : "Sign in to save search"}
                    </button>
                  </div>
                ) : null}
              </div>
            </aside>

            <div className="min-w-0">
              {/* Toolbar: count · sort · density */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground" aria-live="polite">
                  {resultCount == null ? (
                    "…"
                  ) : (
                    <>
                      <span className="tabular-nums">{resultCount}</span>{" "}
                      <span className="font-medium text-ink-muted">{resultLabel}</span>
                      {filterActive ? (
                        <span className="font-medium text-ink-muted"> · filtered</span>
                      ) : null}
                    </>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {sort && sort.length > 0 && onSortChange ? (
                    <label className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[var(--separator)] bg-surface px-2.5 text-xs font-semibold text-ink-secondary">
                      <span className="sr-only">Sort by</span>
                      <select
                        value={sortValue}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="max-w-[10.5rem] cursor-pointer bg-transparent py-1.5 text-xs font-semibold text-foreground outline-none"
                      >
                        {sort.map((o) => (
                          <option key={o.key} value={o.key}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  <div
                    className="inline-flex items-center rounded-full border border-[var(--separator)] bg-surface p-0.5"
                    role="group"
                    aria-label="Result view"
                  >
                    {(
                      [
                        ["grid", "Grid"],
                        ["list", "List"],
                        ["map", "Map"],
                      ] as const
                    ).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDensityMode(mode)}
                        className={`min-h-8 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          densityMode === mode
                            ? "bg-forest text-white"
                            : "text-ink-muted hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilters.length > 0 ? (
                <div className="mb-4 flex flex-wrap items-center gap-1.5">
                  {activeFilters.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={f.onRemove}
                      className="profile-spring inline-flex min-h-7 items-center gap-1 rounded-full border border-[var(--separator)] bg-surface px-2.5 py-1 text-[11px] font-bold text-ink-secondary hover:border-[var(--system-blue)]/40 hover:text-foreground"
                    >
                      {f.label}
                      <XIcon className="h-3 w-3 opacity-70" />
                    </button>
                  ))}
                  {onClearFilters ? (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="text-[11px] font-bold text-[var(--system-blue)] hover:underline"
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>
              ) : null}

              {/* Recently viewed */}
              {showRecent && recent.length > 0 ? (
                <section className="mb-5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                    Recently viewed
                  </p>
                  <div className="chip-scroll flex gap-2 overflow-x-auto pb-1">
                    {recent.map((r) => (
                      <Link
                        key={`${r.kind}:${r.id}`}
                        href={r.href}
                        className="profile-spring inline-flex max-w-[14rem] shrink-0 flex-col rounded-xl border border-[var(--separator)] bg-surface px-3 py-2 hover:border-[var(--system-blue)]/35"
                      >
                        <span className="truncate text-xs font-bold text-forest">{r.title}</span>
                        {r.subtitle ? (
                          <span className="truncate text-[10px] font-medium text-ink-muted">
                            {r.subtitle}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              <DensityCtx.Provider value={densityMode}>
                <div data-density={densityMode} className="directory-results min-h-[16rem]">
                  {children}
                </div>
              </DensityCtx.Provider>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function FilterStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

export function FilterOption({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`profile-spring flex w-full min-h-8 items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all sm:text-[0.8125rem] ${
        active
          ? "bg-[var(--system-blue)] text-white shadow-[0_2px_8px_rgba(0,122,255,0.2)]"
          : "bg-clay/45 text-ink-secondary hover:bg-clay hover:text-foreground"
      }`}
    >
      <span className="min-w-0 truncate">{children}</span>
      {count !== undefined ? (
        <span
          className={`shrink-0 tabular-nums text-[10px] font-bold sm:text-[11px] ${
            active ? "text-white/80" : "text-ink-muted"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function FilterSearch({
  icon,
  children,
  className = "",
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`filter-search flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--separator)] bg-clay/25 px-2 py-1 focus-within:border-[var(--system-blue)]/45 focus-within:ring-1 focus-within:ring-[var(--system-blue)]/20 ${className}`}
    >
      {icon ? <span className="shrink-0 text-ink-muted [&_svg]:h-3.5 [&_svg]:w-3.5">{icon}</span> : null}
      <div className="filter-search-field min-w-0 flex-1">{children}</div>
    </label>
  );
}

/** Grid/list result shell — uses directory density context when density omitted. */
export function DirectoryResultGrid({
  density: densityProp,
  children,
}: {
  density?: DensityMode;
  children: ReactNode;
}) {
  const ctx = useDirectoryDensity();
  const density = densityProp ?? ctx;
  if (density === "map") {
    // Map view renders its own layout; children still mount for accessibility fallbacks.
    return <div className="flex w-full flex-col gap-3">{children}</div>;
  }
  return (
    <div
      className={
        density === "list"
          ? "flex w-full flex-col gap-3"
          : "grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-4"
      }
    >
      {children}
    </div>
  );
}
