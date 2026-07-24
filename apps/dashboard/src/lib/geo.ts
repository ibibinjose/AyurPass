/** Lightweight geo helpers for Near Me + map view (no map SDK required). */

export type LatLng = { lat: number; lng: number };

const GEOCODE_CACHE_KEY = "ayurpass.geocode.v1";

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function readCoordsFromAddress(address?: {
  lat?: number | null;
  lng?: number | null;
  city?: string;
  country?: string;
} | null): LatLng | null {
  if (!address) return null;
  const lat = Number(address.lat);
  const lng = Number(address.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return { lat, lng };
  }
  return null;
}

function cacheGet(): Record<string, LatLng> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(GEOCODE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LatLng>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function cacheSet(map: Record<string, LatLng>) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Geocode a free-text place via Nominatim (cached in sessionStorage). */
export async function geocodePlace(query: string): Promise<LatLng | null> {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const cache = cacheGet();
  if (cache[q]) return cache[q];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AyurPass/1.0 (wellness directory)",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat?: string; lon?: string }[];
    const hit = data?.[0];
    if (!hit?.lat || !hit?.lon) return null;
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const point = { lat, lng };
    cache[q] = point;
    cacheSet(cache);
    return point;
  } catch {
    return null;
  }
}

/**
 * Project lat/lng into 0–1 pane coordinates (Web Mercator-ish, simple).
 * Good enough for a pin board; not for navigation.
 */
export function projectToPane(
  point: LatLng,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
): { x: number; y: number } {
  const padLat = Math.max(0.02, (bounds.maxLat - bounds.minLat) * 0.12 || 0.5);
  const padLng = Math.max(0.02, (bounds.maxLng - bounds.minLng) * 0.12 || 0.5);
  const minLat = bounds.minLat - padLat;
  const maxLat = bounds.maxLat + padLat;
  const minLng = bounds.minLng - padLng;
  const maxLng = bounds.maxLng + padLng;
  const x = (point.lng - minLng) / (maxLng - minLng || 1);
  const y = 1 - (point.lat - minLat) / (maxLat - minLat || 1);
  return {
    x: Math.min(0.96, Math.max(0.04, x)),
    y: Math.min(0.96, Math.max(0.04, y)),
  };
}

export function boundsOf(points: LatLng[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} | null {
  if (!points.length) return null;
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  return { minLat, maxLat, minLng, maxLng };
}
