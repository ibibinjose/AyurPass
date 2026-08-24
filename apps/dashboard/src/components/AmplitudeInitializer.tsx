"use client";

import { useEffect } from "react";
import * as amplitude from "@amplitude/unified";

let initialized = false;

export function AmplitudeInitializer() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialized) return;

    const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY?.trim();

    // Analytics is optional. Keep local and preview environments quiet unless
    // tracking has been deliberately enabled with a real ingestion key.
    if (!enabled || !apiKey) return;

    amplitude.initAll(apiKey, {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
    initialized = true;

    amplitude.track("Viewed Home Page", { prompt_version: "BA400.4" });
  }, []);

  return null;
}

