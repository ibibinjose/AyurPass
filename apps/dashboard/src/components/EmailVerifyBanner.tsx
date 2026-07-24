"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

/** Soft prompt when the signed-in user has not confirmed their email. */
export function EmailVerifyBanner() {
  const { user, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.emailVerifiedAt || dismissed) return null;

  async function resend() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await api.resendVerification();
      setMsg(res.message || "Verification email sent.");
      await refreshProfile();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not resend.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-amber-200/80 bg-amber-50/95 px-4 py-2.5 text-sm text-amber-950">
      <div className="mx-auto flex max-w-[88rem] flex-wrap items-center justify-between gap-2">
        <p className="font-medium">
          Confirm your email to keep your account secure.
          {msg ? <span className="ml-2 text-amber-800/90">{msg}</span> : null}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void resend()}
            disabled={busy}
            className="rounded-full bg-forest px-3 py-1.5 text-xs font-bold text-white hover:bg-forest-deep disabled:opacity-60"
          >
            {busy ? "Sending…" : "Resend email"}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full px-2 py-1.5 text-xs font-semibold text-amber-900/70 hover:text-amber-950"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
