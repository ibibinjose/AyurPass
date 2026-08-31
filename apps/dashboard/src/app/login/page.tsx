"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Button, ErrorNote, Field, Input } from "@/components/ui";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { ApiError } from "@/lib/api";
import { postAuthHome, safeNextPath } from "@/lib/auth-redirect";
import { Mail, Lock } from "lucide-react";

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
      ? "Please verify your email before signing in. Check your inbox."
      : null,
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email address and password.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const profile = await login(email.trim(), password);
      const dest = nextParam
        ? safeNextPath(nextParam, postAuthHome(profile))
        : postAuthHome(profile);
      router.push(dest);
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      setError(
        status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : "Incorrect email or password. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-sand selection:text-forest">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          className="text-xs font-semibold text-ink-muted hover:text-foreground transition-colors"
        >
          ← Home
        </Link>
        <Link
          href={`/account-type${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`}
          className="text-xs font-semibold text-sage hover:underline transition-colors"
        >
          Create account
        </Link>
      </div>

      {/* Centred Card Container */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-hairline bg-surface p-8 sm:p-10 shadow-sm">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Logo variant="horizontal" />
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-forest">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              Sign in to your AyurPass account
            </p>
          </div>

          {/* Social login */}
          <SocialAuthButtons />

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-hairline" />
            <span className="text-xs font-medium text-ink-muted">or continue with email</span>
            <div className="h-px flex-1 bg-hairline" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Field label="Email address" required>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted/60 pointer-events-none" />
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
            </Field>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-foreground">
                  Password <span className="text-red-500" aria-hidden>*</span>
                </span>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-sage hover:text-sage-dark hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted/60 pointer-events-none z-10" />
                <PasswordInput
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>

            <ErrorNote message={error} />

            <Button
              type="submit"
              disabled={busy}
              className="w-full py-3 text-sm font-bold bg-sage hover:bg-sage-dark text-white rounded-xl transition-all min-h-[46px] shadow-sm hover:shadow-md mt-2"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-ink-muted">
            New to AyurPass?{" "}
            <Link
              href={`/account-type${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`}
              className="font-semibold text-sage hover:text-sage-dark hover:underline transition-colors"
            >
              Create a free account
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
        <main className="flex min-h-screen items-center justify-center bg-background">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-hairline border-t-sage" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
