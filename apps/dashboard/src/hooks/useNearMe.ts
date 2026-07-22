"use client";

import { useCallback, useState } from "react";

/**
 * Resolve browser geolocation → city/country string via Nominatim (OSM).
 * Used by directory "Near me" controls. Fails softly with a message.
 */
export function useNearMe(onResolved: (label: string) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(() => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location isn’t available in this browser.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, {
            headers: { Accept: "application/json" },
          });
          if (!res.ok) throw new Error("lookup failed");
          const data = (await res.json()) as {
            address?: {
              city?: string;
              town?: string;
              village?: string;
              state?: string;
              country?: string;
            };
          };
          const a = data.address ?? {};
          const city = a.city || a.town || a.village || a.state || "";
          const country = a.country || "";
          const label = [city, country].filter(Boolean).join(", ");
          if (!label) throw new Error("empty");
          onResolved(label);
        } catch {
          setError("Couldn’t resolve your city. Try typing a location.");
        } finally {
          setBusy(false);
        }
      },
      () => {
        setBusy(false);
        setError("Location permission denied. Type a city instead.");
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300_000 },
    );
  }, [onResolved]);

  return { locate, busy, error, clearError: () => setError(null) };
}
