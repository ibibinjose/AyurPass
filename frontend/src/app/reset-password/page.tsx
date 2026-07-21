"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button, Field, ErrorNote } from "@/components/ui";
import { AuthBanner } from "@/components/auth/AuthBanner";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
import { api, ApiError } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset token is missing from the link. Please request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await api.resetPassword(token, password);
      setBusy(false);
      setSuccess(true);
    } catch (err) {
      setBusy(false);
      const msg = err instanceof ApiError ? err.message : "Failed to reset password. The link may have expired.";
      setError(msg);
    }
  };

  return (
    <main className="flex min-h-screen bg-surface">
      <AuthBanner />

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo on mobile only */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo variant="stacked" />
          </div>

          <div className="rounded-3xl border border-hairline bg-surface p-8 shadow-[0_12px_40px_rgba(36,56,46,0.04)]">
            {!success ? (
              <>
                <h1 className="font-display text-2xl font-semibold text-forest">Choose new password</h1>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                  Enter your new password below. Make sure it is at least 8 characters long.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  {!token && (
                    <ErrorNote message="No password reset token was detected in the URL. Please verify the link you clicked." />
                  )}

                  <div>
                    <span className="text-sm font-semibold text-foreground block mb-1.5">New password</span>
                    <PasswordInput
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={!token}
                    />
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-foreground block mb-1.5">Confirm new password</span>
                    <PasswordInput
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={!token}
                    />
                  </div>

                  {error && <ErrorNote message={error} />}

                  <Button type="submit" disabled={busy || !token} className="w-full mt-2">
                    {busy ? "Resetting password…" : "Reset password"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-leaf/10 text-forest">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-semibold text-forest">Password updated</h1>
                <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                  Your password has been successfully updated. You can now use your new password to sign in.
                </p>

                <Button onClick={() => router.push("/login")} className="w-full mt-6">
                  Sign in
                </Button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-forest transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-ink-muted">
          Loading…
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
