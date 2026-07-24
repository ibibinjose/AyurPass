"use client";

import { useCallback, useState } from "react";

export type NearMeResult = {
  label: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
};

/**
 * Resolve browser geolocation → city/country + coords via Nominatim (OSM).
 * Used by directory "Near me" controls. Fails softly with a message.
 */
export function useNearMe(onResolved: (result: NearMeResult) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

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
          setCoords({ lat: latitude, lng: longitude });

          // Prefer reverse-geocode for a friendly city label; always keep coords.
          let city = "";
          let country = "";
          try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
            const res = await fetch(url, {
              headers: {
                Accept: "application/json",
                // Nominatim usage policy: identify the app.
                "User-Agent": "AyurPass/1.0 (wellness directory)",
              },
            });
            if (res.ok) {
              const data = (await res.json()) as {
                address?: {
                  city?: string;
                  town?: string;
                  village?: string;
                  municipality?: string;
                  county?: string;
                  state?: string;
                  country?: string;
                };
              };
              const a = data.address ?? {};
              city = a.city || a.town || a.village || a.municipality || a.county || a.state || "";
              country = a.country || "";
            }
          } catch {
            /* reverse geocode optional */
          }

          const label =
            [city, country].filter(Boolean).join(", ") ||
            `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

          onResolved({
            label,
            city,
            country,
            lat: latitude,
            lng: longitude,
          });
        } catch {
          setError("Couldn’t resolve your location. Try typing a city.");
        } finally {
          setBusy(false);
        }
      },
      (err) => {
        setBusy(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied. Type a city instead.");
        } else if (err.code === err.TIMEOUT) {
          setError("Location timed out. Try again or type a city.");
        } else {
          setError("Couldn’t get your location. Type a city instead.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 120_000 },
    );
  }, [onResolved]);

  return {
    locate,
    busy,
    error,
    coords,
    clearError: () => setError(null),
  };
}
