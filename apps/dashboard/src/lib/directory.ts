/** Shared directory UX: URL state helpers, density, recent views, saved searches. */

export type DensityMode = "grid" | "list";

const DENSITY_KEY = "ayurpass.directory.density";
const FILTERS_OPEN_KEY = "ayurpass.directory.filtersOpen";
const RECENT_KEY = "ayurpass.directory.recent";
const SAVED_SEARCHES_KEY = "ayurpass.directory.savedSearches";

export type RecentKind =
  | "provider"
  | "professional"
  | "retreat"
  | "product"
  | "service"
  | "offer"
  | "package";

export type RecentItem = {
  kind: RecentKind;
  id: string;
  title: string;
  href: string;
  subtitle?: string;
  at: number;
};

export type SavedSearch = {
  id: string;
  label: string;
  path: string;
  query: string;
  createdAt: number;
};

export function readDensity(): DensityMode {
  if (typeof window === "undefined") return "grid";
  try {
    const v = window.localStorage.getItem(DENSITY_KEY);
    return v === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

export function writeDensity(mode: DensityMode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DENSITY_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function readFiltersOpen(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(FILTERS_OPEN_KEY);
    if (v === "1") return true;
    if (v === "0") return false;
    return null;
  } catch {
    return null;
  }
}

export function writeFiltersOpen(open: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FILTERS_OPEN_KEY, open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function readRecent(limit = 8): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as RecentItem[];
    return Array.isArray(arr) ? arr.slice(0, limit) : [];
  } catch {
    return [];
  }
}

export function pushRecent(item: Omit<RecentItem, "at">, limit = 12) {
  if (typeof window === "undefined") return;
  try {
    const prev = readRecent(50);
    const next: RecentItem[] = [
      { ...item, at: Date.now() },
      ...prev.filter((x) => !(x.kind === item.kind && x.id === item.id)),
    ].slice(0, limit);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("ayurpass-recent"));
  } catch {
    /* ignore */
  }
}

export function readSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_SEARCHES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedSearch[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveSearch(entry: Omit<SavedSearch, "id" | "createdAt">): SavedSearch {
  const item: SavedSearch = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  if (typeof window === "undefined") return item;
  try {
    const prev = readSavedSearches().filter((s) => s.path + s.query !== entry.path + entry.query);
    const next = [item, ...prev].slice(0, 20);
    window.localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return item;
}

export function deleteSavedSearch(id: string) {
  if (typeof window === "undefined") return;
  try {
    const next = readSavedSearches().filter((s) => s.id !== id);
    window.localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** Build a query string from a record, omitting empty / default values. */
export function buildQueryString(
  values: Record<string, string | undefined | null>,
  defaults: Record<string, string> = {},
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) {
    if (v == null || v === "") continue;
    if (defaults[k] !== undefined && v === defaults[k]) continue;
    params.set(k, v);
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function parseQueryRecord(
  search: string | URLSearchParams,
  keys: string[],
): Record<string, string> {
  const sp = typeof search === "string" ? new URLSearchParams(search) : search;
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = sp.get(k);
    if (v != null && v !== "") out[k] = v;
  }
  return out;
}

/** Soft text match for dosha tags in free-text fields. */
export function matchesDoshaText(haystack: string, dosha: string): boolean {
  const h = haystack.toLowerCase();
  const d = dosha.toLowerCase();
  return h.includes(d);
}

export type ActiveFilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};
