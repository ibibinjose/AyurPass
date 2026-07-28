"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Button, ErrorNote, Field, Input } from "@/components/ui";
import { AuthBanner } from "@/components/auth/AuthBanner";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { ApiError } from "@/lib/api";
import { postAuthHome, safeNextPath } from "@/lib/auth-redirect";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = search.get("next");
  const verificationRequired = search.get("verification_required") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    verificationRequired
      ? "Please verify your email to continue. Check your inbox for the verification link."
      : null,
  );
  const [busy, setBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const profile = await login(email.trim(), password);
      // Explicit ?next= wins; otherwise role-based home (admin / practice / seeker)
      const dest = nextParam
        ? safeNextPath(nextParam, postAuthHome(profile))
        : postAuthHome(profile);
      router.push(dest);
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      setError(
        status === 429
          ? "Too many sign-in attempts. Please wait a minute and try again."
          : "We couldn't sign you in — please check your email and password.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-surface">
      <AuthBanner />

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Stacked Logo on mobile/tablet */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo variant="stacked" />
          </div>

          <div className="rounded-3xl border border-hairline bg-surface p-8 shadow-[0_12px_40px_rgba(36,56,46,0.04)]">
            <h1 className="font-display text-2xl font-semibold text-forest">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-muted">Continue your wellness journey.</p>

            <div className="mt-6">
              <SocialAuthButtons />
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
              <Field label="Email address">
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-foreground">Password</span>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-forest hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-hairline text-forest focus:ring-leaf/20"
                  />
                  <span className="text-xs font-medium text-ink-secondary">Remember me</span>
                </label>
              </div>

              <ErrorNote message={error} />

              <Button type="submit" disabled={busy} className="w-full">
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-ink-muted">
            New to AyurPass?{" "}
            <Link href={`/account-type${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`} className="font-semibold text-forest hover:underline">
              Create an account
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-forest transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-ink-muted">
          Loading…
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
