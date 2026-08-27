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
import { Mail, Lock, Shield, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = search.get("next");
  const verificationRequired = search.get("verification_required") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleContext, setRoleContext] = useState<"seeker" | "provider">("seeker");
  const [error, setError] = useState<string | null>(
    verificationRequired
      ? "Please verify your email to continue. Check your inbox for the verification link."
      : null,
  );
  const [busy, setBusy] = useState(false);
  const roleContextCopy =
    roleContext === "seeker"
      ? {
          label: "Wellness seeker",
          description: "Access your appointments, wellness preferences, and care journey.",
        }
      : {
          label: "Practitioner or practice",
          description: "Access your schedule, services, and business workspace.",
        };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

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
          : "We couldn't sign you in — please verify your email and password.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground antialiased selection:bg-gold-soft selection:text-forest-deep">
      {/* Left Pane — Immersive Holistic Sanctuary Showcase */}
      <AuthBanner />

      {/* Right Pane — Elevated Form Container */}
      <div className="flex w-full flex-col justify-between px-6 py-10 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-forest transition-colors py-1 px-2.5 rounded-full hover:bg-sand/60"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-saffron uppercase tracking-widest bg-saffron-soft px-3 py-1 rounded-full border border-saffron/20">
            <Sparkles className="h-3 w-3 text-saffron" />
            <span>Secure Portal</span>
          </span>
        </div>

        {/* Form Card Shell */}
        <div className="mx-auto w-full max-w-md py-6">
          {/* Mobile Logo */}
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo variant="horizontal" />
          </div>

          <div className="rounded-3xl border border-hairline/90 bg-surface p-8 shadow-[0_16px_50px_rgba(26,58,46,0.06)] relative overflow-hidden backdrop-blur-xl">
            {/* Subtle Gradient Accent Bar at Top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-forest via-saffron to-gold-bright" />

            <div className="space-y-1">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-forest tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">
                Use one account to access the workspace that matches your role after sign-in.
              </p>
            </div>

            {/* Quick Context Switcher */}
            <div
              className="mt-5 grid grid-cols-2 gap-1 rounded-2xl border border-hairline/60 bg-sand/60 p-1"
              role="group"
              aria-label="Sign-in context"
            >
              <button
                type="button"
                onClick={() => setRoleContext("seeker")}
                aria-pressed={roleContext === "seeker"}
                className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                  roleContext === "seeker"
                    ? "bg-surface text-forest shadow-xs"
                    : "text-ink-muted hover:text-foreground"
                }`}
              >
                🌿 Wellness Seeker
              </button>
              <button
                type="button"
                onClick={() => setRoleContext("provider")}
                aria-pressed={roleContext === "provider"}
                className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                  roleContext === "provider"
                    ? "bg-surface text-forest shadow-xs"
                    : "text-ink-muted hover:text-foreground"
                }`}
              >
                🩺 Practitioner / Practice
              </button>
            </div>

            <p
              className="mt-3 rounded-xl border border-hairline/70 bg-clay/25 px-3 py-2 text-xs leading-relaxed text-ink-secondary"
              aria-live="polite"
            >
              <span className="font-semibold text-forest">{roleContextCopy.label}:</span>{" "}
              {roleContextCopy.description}
            </p>

            {/* Social OAuth Buttons */}
            <div className="mt-6">
              <SocialAuthButtons />
            </div>

            {/* Login Form */}
            <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
              <Field label="Email address" required>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted/70 pointer-events-none" />
                </div>
              </Field>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-foreground">
                    Password <span className="text-red-600" aria-hidden>*</span>
                  </span>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-saffron-deep hover:text-saffron hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <PasswordInput
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted/70 pointer-events-none z-10" />
                </div>
              </div>

              <p className="rounded-xl border border-hairline/70 bg-clay/25 px-3 py-2 text-xs leading-relaxed text-ink-secondary">
                Sign in with the email address linked to your AyurPass account. Need access help?{" "}
                <Link
                  href="/forgot-password"
                  className="font-semibold text-forest hover:text-forest-deep hover:underline"
                >
                  Reset your password
                </Link>
                .
              </p>

              <ErrorNote message={error} />

              <Button
                type="submit"
                disabled={busy}
                className="w-full py-3 text-sm font-bold bg-gradient-to-r from-forest to-forest-deep hover:from-forest-deep hover:to-forest text-white shadow-md hover:shadow-lg transition-all rounded-full min-h-[46px]"
              >
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Signing in…</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <span>Sign in to AyurPass</span>
                    <CheckCircle2 className="h-4 w-4 text-gold-bright" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Registration Prompt */}
          <div className="mt-6 text-center text-sm text-ink-muted">
            New to AyurPass?{" "}
            <Link
              href={`/account-type${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`}
              className="font-bold text-forest hover:text-forest-deep hover:underline transition-colors"
            >
              Create a free account
            </Link>
          </div>
        </div>

          {/* Account-access footer — states supported product capabilities only. */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-hairline/60 pt-4 text-[11px] text-ink-muted/80">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-leaf" /> Account access
            </span>
            <span aria-hidden>•</span>
            <span>Email verification</span>
            <span aria-hidden>•</span>
            <span>Password recovery</span>
          </div>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-sm text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-hairline border-t-forest" />
            <span>Loading secure portal…</span>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
