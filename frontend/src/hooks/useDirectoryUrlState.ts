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
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;
  const debounceMs = opts?.debounceMs ?? 300;

  const fromUrl = useMemo(() => {
    const next = { ...defaultsRef.current };
    for (const key of Object.keys(defaultsRef.current) as (keyof T)[]) {
      const v = searchParams.get(String(key));
      if (v != null) next[key] = v as T[keyof T];
    }
    return next;
  }, [searchParams]);

  const [local, setLocal] = useState<T>(fromUrl);
  const skipUrlWrite = useRef(false);

  // Hydrate when the URL changes externally (back/forward, shared link).
  useEffect(() => {
    skipUrlWrite.current = true;
    setLocal(fromUrl);
  }, [fromUrl]);

  // Push local state to URL (debounced as a whole to batch rapid edits).
  useEffect(() => {
    if (skipUrlWrite.current) {
      skipUrlWrite.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      const qs = buildQueryString(local, defaultsRef.current);
      const target = `${pathname}${qs}`;
      const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      if (target !== current) {
        router.replace(target, { scroll: false });
      }
    }, debounceMs);
    return () => window.clearTimeout(t);
  }, [local, pathname, router, searchParams, debounceMs]);

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setLocal((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const setMany = useCallback((patch: Partial<T>) => {
    setLocal((prev) => ({ ...prev, ...patch }));
  }, []);

  const clear = useCallback(() => {
    setLocal({ ...defaultsRef.current });
  }, []);

  const sharePath = useMemo(
    () => `${pathname}${buildQueryString(local, defaultsRef.current)}`,
    [pathname, local],
  );

  return { values: local, set, setMany, clear, sharePath, pathname };
}
