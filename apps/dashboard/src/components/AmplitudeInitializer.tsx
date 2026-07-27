"use client";

import { useEffect } from "react";
import * as amplitude from "@amplitude/unified";

let initialized = false;

export function AmplitudeInitializer() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialized) return;

    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || "4c1d5feb9a7527afedfc1d104185750e";

    amplitude.initAll(apiKey, {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
    initialized = true;

    amplitude.track("Viewed Home Page", { prompt_version: "BA400.4" });
  }, []);

  return null;
}

