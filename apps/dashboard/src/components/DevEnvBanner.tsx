"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Industry-standard guardrail: warn if local UI is aimed at a non-local API.
 * Never blocks production builds on ayurpass.com.
 */
export function DevEnvBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname;
    const isLocalHost =
      host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
    const apiIsRemote =
      API.includes("ayurpass.com") ||
      API.includes("amazonaws.com") ||
      (API.startsWith("https://") && !API.includes("localhost"));

    if (isLocalHost && apiIsRemote) {
      setShow(true);
    }
  }, []);

  if (!show || dismissed) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-950"
    >
      <strong>Dev security:</strong> this local UI is calling a remote API (
      <code className="rounded bg-amber-100 px-1">{API}</code>
      ). Prefer <code className="rounded bg-amber-100 px-1">http://localhost:4000</code>{" "}
      and <code className="rounded bg-amber-100 px-1">npm run seed:local</code>. See{" "}
      <code className="rounded bg-amber-100 px-1">docs/ENVIRONMENTS.md</code>.
      <button
        type="button"
        className="ml-3 font-bold underline"
        onClick={() => setDismissed(true)}
      >
        Dismiss
      </button>
    </div>
  );
}
