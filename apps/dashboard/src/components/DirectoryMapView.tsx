"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import {
  boundsOf,
  geocodePlace,
  haversineKm,
  projectToPane,
  readCoordsFromAddress,
  type LatLng,
} from "@/lib/geo";
import { formatAddress } from "@/lib/catalog";
import type { BusinessAddress } from "@/lib/types";

export type MapMarkerItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  address?: BusinessAddress | null;
  /** Pre-resolved coords when available. */
  coords?: LatLng | null;
};

/**
 * Lightweight pin board for directory results — no map SDK.
 * Uses address lat/lng when present, otherwise geocodes city/country via Nominatim.
 */
export function DirectoryMapView({
  items,
  userCoords,
  emptyLabel = "No locations to show on the map",
}: {
  items: MapMarkerItem[];
  userCoords?: LatLng | null;
  emptyLabel?: string;
}) {
  const [resolved, setResolved] = useState<Record<string, LatLng>>({});
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const seed = useMemo(() => {
    const map: Record<string, LatLng> = {};
    for (const item of items) {
      const fromProp = item.coords ?? readCoordsFromAddress(item.address);
      if (fromProp) map[item.id] = fromProp;
    }
    return map;
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const next = { ...seed };
      const need = items.filter((i) => !next[i.id]);
      if (!need.length) {
        if (!cancelled) setResolved(next);
        return;
      }
      setBusy(true);
      // Cap concurrent geocodes to respect Nominatim (1 req/s guidance).
      for (const item of need.slice(0, 24)) {
        if (cancelled) return;
        const label =
          formatAddress(item.address) ||
          [item.address?.city, item.address?.country].filter(Boolean).join(", ");
        if (!label) continue;
        const point = await geocodePlace(label);
        if (point) next[item.id] = point;
        // Soft throttle
        await new Promise((r) => setTimeout(r, 350));
      }
      if (!cancelled) {
        setResolved(next);
        setBusy(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [items, seed]);

  const points = useMemo(() => {
    return items
      .map((item) => {
        const coords = resolved[item.id] ?? seed[item.id];
        if (!coords) return null;
        return { item, coords };
      })
      .filter(Boolean) as { item: MapMarkerItem; coords: LatLng }[];
  }, [items, resolved, seed]);

  const bounds = useMemo(() => {
    const all = points.map((p) => p.coords);
    if (userCoords) all.push(userCoords);
    return boundsOf(all);
  }, [points, userCoords]);

  const selectedItem = selected
    ? points.find((p) => p.item.id === selected) ?? null
    : points[0] ?? null;

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--separator)] bg-clay/20 px-6 py-16 text-center text-sm font-medium text-ink-muted">
        {emptyLabel}
      </div>
    );
  }

  if (!bounds || points.length === 0) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-[var(--separator)] bg-surface px-5 py-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-leaf" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-forest">
            {busy ? "Placing pins on the map…" : "Location data is still loading"}
          </p>
          <p className="mt-1 text-xs font-medium text-ink-muted">
            {busy
              ? "We’re resolving cities for map pins."
              : "Add a city filter or use Near me so we can place results."}
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.slice(0, 12).map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex flex-col rounded-xl border border-[var(--separator)] bg-surface px-3.5 py-3 transition-shadow hover:shadow-md"
              >
                <span className="truncate font-display text-sm font-semibold text-forest">
                  {item.title}
                </span>
                {item.subtitle ? (
                  <span className="mt-0.5 truncate text-xs font-medium text-ink-muted">
                    {item.subtitle}
                  </span>
                ) : null}
                {formatAddress(item.address) ? (
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                    <MapPin className="h-3 w-3 text-leaf" aria-hidden />
                    {formatAddress(item.address)}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const osmLink = userCoords
    ? `https://www.openstreetmap.org/#map=12/${userCoords.lat}/${userCoords.lng}`
    : selectedItem
      ? `https://www.openstreetmap.org/#map=12/${selectedItem.coords.lat}/${selectedItem.coords.lng}`
      : "https://www.openstreetmap.org/";

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)]">
      <div className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-[var(--separator)] bg-[linear-gradient(160deg,#e8f0ea_0%,#d4e4d8_40%,#c5d9cb_100%)] shadow-inner sm:min-h-[28rem]">
        {/* Subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(36,56,46,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(36,56,46,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {userCoords ? (
          <button
            type="button"
            className="absolute z-20 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--system-blue)] ring-4 ring-[var(--system-blue)]/25"
            style={{
              left: `${projectToPane(userCoords, bounds).x * 100}%`,
              top: `${projectToPane(userCoords, bounds).y * 100}%`,
            }}
            title="You are here"
            aria-label="You are here"
          />
        ) : null}
        {points.map(({ item, coords }) => {
          const { x, y } = projectToPane(coords, bounds);
          const active = selectedItem?.item.id === item.id;
          const dist =
            userCoords != null ? haversineKm(userCoords, coords) : null;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              className={`absolute z-10 -translate-x-1/2 -translate-y-full transition-transform ${
                active ? "scale-110" : "hover:scale-105"
              }`}
              style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              title={item.title}
              aria-label={`${item.title}${dist != null ? `, ${dist.toFixed(1)} km` : ""}`}
            >
              <span
                className={`flex flex-col items-center drop-shadow-md ${
                  active ? "text-forest" : "text-leaf"
                }`}
              >
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold shadow-sm ${
                    active
                      ? "bg-forest text-white"
                      : "bg-surface/95 text-forest"
                  }`}
                >
                  {item.title.slice(0, 18)}
                  {item.title.length > 18 ? "…" : ""}
                </span>
                <MapPin
                  className={`h-7 w-7 ${active ? "fill-forest text-forest" : "fill-leaf/90 text-leaf"}`}
                  strokeWidth={1.5}
                  aria-hidden
                />
              </span>
            </button>
          );
        })}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
          <p className="rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-ink-secondary shadow-sm backdrop-blur-sm">
            {points.length} on map
            {busy ? " · resolving…" : ""}
            {userCoords ? " · Near me active" : ""}
          </p>
          <a
            href={osmLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-[var(--system-blue)] shadow-sm backdrop-blur-sm hover:underline"
          >
            Open in OpenStreetMap
          </a>
        </div>
      </div>

      <aside className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto overscroll-contain rounded-2xl border border-[var(--separator)] bg-surface p-2.5 sm:max-h-[32rem]">
        <p className="px-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Map results
        </p>
        {points.map(({ item, coords }) => {
          const active = selectedItem?.item.id === item.id;
          const dist =
            userCoords != null ? haversineKm(userCoords, coords) : null;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                active
                  ? "border-forest/40 bg-leaf/10"
                  : "border-transparent hover:border-[var(--separator)] hover:bg-clay/30"
              }`}
            >
              <p className="truncate font-display text-sm font-semibold text-forest">
                {item.title}
              </p>
              {item.subtitle ? (
                <p className="mt-0.5 truncate text-xs font-medium text-ink-muted">
                  {item.subtitle}
                </p>
              ) : null}
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                <MapPin className="h-3 w-3 shrink-0 text-leaf" aria-hidden />
                <span className="truncate">
                  {formatAddress(item.address) || "Location"}
                  {dist != null ? ` · ${dist < 1 ? "<1" : dist.toFixed(0)} km` : ""}
                </span>
              </p>
              <Link
                href={item.href}
                className="mt-1.5 inline-block text-[11px] font-bold text-[var(--system-blue)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View details →
              </Link>
            </button>
          );
        })}
      </aside>
    </div>
  );
}
