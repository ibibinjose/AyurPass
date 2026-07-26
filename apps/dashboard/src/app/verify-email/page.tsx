"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { loginUrl } from "@/lib/auth-redirect";

function VerifyInner() {
  const search = useSearchParams();
  const token = search.get("token") || "";
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => {
        setStatus("error");
        setMessage("Missing verification link. Check your email for the latest link.");
      });
      return;
    }
    let active = true;
    queueMicrotask(() => {
      if (active) setStatus("loading");
    });
    api
      .verifyEmail(token)
      .then(async (res) => {
        if (!active) return;
        setStatus("ok");
        setMessage(res.message || "Email verified successfully.");
        try {
          await refreshProfile();
        } catch {
          /* optional */
        }
      })
      .catch((err) => {
        if (!active) return;
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "This verification link is invalid or has expired.",
        );
      });
    return () => {
      active = false;
    };
  }, [token, refreshProfile]);

  async function resend() {
    if (!user) return;
    setResendBusy(true);
    setResendMsg(null);
    try {
      const res = await api.resendVerification();
      setResendMsg(res.message || "Verification email sent.");
    } catch (err) {
      setResendMsg(err instanceof Error ? err.message : "Could not resend email.");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-16">
      <div className="mb-8">
        <Logo variant="stacked" />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-hairline bg-surface p-8 shadow-[0_12px_40px_rgba(36,56,46,0.06)]">
        <h1 className="font-display text-2xl font-semibold text-forest">Email verification</h1>
        {status === "loading" || status === "idle" ? (
          <p className="mt-3 text-sm font-medium text-ink-secondary">Confirming your email…</p>
        ) : status === "ok" ? (
          <>
            <p className="mt-3 text-sm font-medium text-leaf">{message}</p>
            <p className="mt-2 text-sm text-ink-muted">
              You’re all set — explore practices near you or finish your dosha profile.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/discover"
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-deep"
              >
                Discover
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-medium text-foreground hover:border-leaf"
              >
                Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm font-medium text-red-700">{message}</p>
            <div className="mt-6 space-y-3">
              {user ? (
                <>
                  <Button type="button" onClick={resend} disabled={resendBusy} className="w-full">
                    {resendBusy ? "Sending…" : "Resend verification email"}
                  </Button>
                  {resendMsg ? (
                    <p className="text-center text-xs font-medium text-ink-muted">{resendMsg}</p>
                  ) : null}
                </>
              ) : (
                <Link
                  href={loginUrl("/verify-email")}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-deep"
                >
                  Sign in to resend
                </Link>
              )}
              <p className="text-center text-sm text-ink-muted">
                <Link href="/" className="font-semibold text-forest hover:underline">
                  ← Back home
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface">
          <p className="text-sm text-ink-muted">Loading…</p>
        </main>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
