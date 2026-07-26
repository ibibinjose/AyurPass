"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

/** Soft prompt when the signed-in user has not confirmed their email. */
export function EmailVerifyBanner() {
  const { user, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Load initial dismissal state from sessionStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const stored = sessionStorage.getItem("ayurpass_email_banner_dismissed");
        if (stored === "1") {
          queueMicrotask(() => setDismissed(true));
        }
      }
    } catch {
      /* ignore storage restriction exceptions */
    }
  }, []);

  // Automatically re-check profile status when user returns to this window/tab
  useEffect(() => {
    if (!user || user.emailVerifiedAt) return;

    function handleFocus() {
      void refreshProfile();
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, refreshProfile]);

  if (!user || user.emailVerifiedAt || dismissed) return null;

  async function resend() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await api.resendVerification();
      setMsg(res.message || "Verification email sent. Please check your inbox.");
      await refreshProfile();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not resend verification email.");
    } finally {
      setBusy(false);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("ayurpass_email_banner_dismissed", "1");
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      role="region"
      aria-label="Email verification status"
      className="border-b border-amber-200/90 bg-amber-50/95 px-3 py-2.5 text-xs text-amber-950 backdrop-blur-sm sm:px-4 sm:text-sm"
    >
      <div className="mx-auto flex max-w-[88rem] flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 font-medium">
          <span>Confirm your email to keep your account secure.</span>
          {msg ? (
            <span className="inline-flex items-center rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-900 shadow-2xs">
              {msg}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void resend()}
            disabled={busy}
            className="profile-spring inline-flex min-h-8 sm:min-h-9 items-center rounded-full bg-forest px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-forest-deep active:scale-95 disabled:opacity-60"
          >
            {busy ? "Sending…" : "Resend email"}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="profile-spring inline-flex min-h-8 sm:min-h-9 items-center rounded-full px-2.5 text-xs font-semibold text-amber-900/80 hover:bg-amber-200/50 hover:text-amber-950 active:scale-95"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
