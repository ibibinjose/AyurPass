"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildQueryString } from "@/lib/directory";

/**
 * URL-synced directory filters. Text keys can be debounced via setText / setMany.
 * Defaults are omitted from the query string for clean shareable URLs.
 */
export function useDirectoryUrlState<T extends Record<string, string>>(
  defaults: T,
  opts?: { debounceMs?: number },
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultsString = JSON.stringify(defaults);
  const stableDefaults = useMemo(() => JSON.parse(defaultsString) as T, [defaultsString]);
  const debounceMs = opts?.debounceMs ?? 300;

  const fromUrl = useMemo(() => {
    const next = { ...stableDefaults };
    for (const key of Object.keys(stableDefaults) as (keyof T)[]) {
      const v = searchParams.get(String(key));
      if (v != null) next[key] = v as T[keyof T];
    }
    return next;
  }, [searchParams, stableDefaults]);

  const [local, setLocal] = useState<T>(fromUrl);
  const [prevFromUrl, setPrevFromUrl] = useState<T>(fromUrl);
  const skipUrlWrite = useRef(false);

  // Hydrate when the URL changes externally (back/forward, shared link) during render phase.
  if (fromUrl !== prevFromUrl) {
    setPrevFromUrl(fromUrl);
    setLocal(fromUrl);
  }

  useEffect(() => {
    skipUrlWrite.current = true;
  }, [fromUrl]);

  // Push local state to URL (debounced as a whole to batch rapid edits).
  useEffect(() => {
    if (skipUrlWrite.current) {
      skipUrlWrite.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      const qs = buildQueryString(local, stableDefaults);
      const target = `${pathname}${qs}`;
      const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      if (target !== current) {
        router.replace(target, { scroll: false });
      }
    }, debounceMs);
    return () => window.clearTimeout(t);
  }, [local, pathname, router, searchParams, debounceMs, stableDefaults]);

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setLocal((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const setMany = useCallback((patch: Partial<T>) => {
    setLocal((prev) => ({ ...prev, ...patch }));
  }, []);

  const clear = useCallback(() => {
    setLocal({ ...stableDefaults });
  }, [stableDefaults]);

  const sharePath = useMemo(
    () => `${pathname}${buildQueryString(local, stableDefaults)}`,
    [pathname, local, stableDefaults],
  );

  return { values: local, set, setMany, clear, sharePath, pathname };
}
