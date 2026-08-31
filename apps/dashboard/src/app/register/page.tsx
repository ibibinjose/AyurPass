"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Button, ErrorNote, Field, Input, Select } from "@/components/ui";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { loginUrl, postAuthHome, safeNextPath } from "@/lib/auth-redirect";
import type { ProviderType } from "@/lib/types";
import { Mail, Lock, User, MapPin, Building2, ArrowLeft } from "lucide-react";

const PROVIDER_TYPES: { value: ProviderType; label: string }[] = [
  { value: "AYURVEDA_CLINIC", label: "Ayurveda clinic" },
  { value: "AYURVEDA_RESORT", label: "Ayurvedic resort" },
  { value: "PANCHAKARMA_CENTER", label: "Panchakarma center" },
  { value: "WELLNESS_RETREAT", label: "Wellbeing retreat center" },
  { value: "YOGA_STUDIO", label: "Yoga studio" },
  { value: "LUXURY_SPA", label: "Luxury spa" },
  { value: "MEDITATION_CENTER", label: "Meditation center" },
  { value: "HEALTH_CLUB", label: "Health club" },
  { value: "NUTRITIONIST", label: "Nutritionist" },
  { value: "WELLNESS_KITCHEN", label: "Wellness kitchen / cooking school" },
  { value: "HYBRID", label: "Hybrid wellness center" },
];

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const asProvider = search.get("as") === "provider";
  const roleParam = search.get("role");
  const nextParam = search.get("next");

  const initialRole =
    roleParam === "PROVIDER_ADMIN"
      ? "PROVIDER_ADMIN"
      : roleParam === "PROFESSIONAL"
        ? "PROFESSIONAL"
        : asProvider
          ? "PROVIDER_ADMIN"
          : "CONSUMER";

  const [role] = useState<"CONSUMER" | "PROFESSIONAL" | "PROVIDER_ADMIN">(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [providerType, setProviderType] = useState<ProviderType>("AYURVEDA_CLINIC");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isConsumer = role === "CONSUMER";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (role === "PROVIDER_ADMIN" && !businessName.trim()) {
      setError("Please enter your business or practice name.");
      return;
    }

    setBusy(true);
    try {
      const profile = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        ...(city.trim() ? { city: city.trim() } : {}),
        ...(role === "PROVIDER_ADMIN"
          ? { businessName: businessName.trim(), providerType }
          : {}),
      });

      const fallback =
        role === "CONSUMER"
          ? "/dashboard/assessment?verify=1"
          : postAuthHome(profile);
      router.push(safeNextPath(nextParam, fallback));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const status =
        err && typeof err === "object" && "status" in err
          ? Number((err as { status: number }).status)
          : 0;
      setError(
        status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : msg.toLowerCase().includes("exist")
            ? "An account with this email already exists — try signing in instead."
            : msg.toLowerCase().includes("8 character")
              ? "Password must be at least 8 characters."
              : "We couldn't create your account. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-sand selection:text-forest">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href={roleParam || asProvider ? "/account-type" : "/"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{roleParam || asProvider ? "Change role" : "Home"}</span>
        </Link>
        <Link
          href={loginUrl(nextParam || undefined)}
          className="text-xs font-semibold text-sage hover:underline transition-colors"
        >
          Already registered? Sign in
        </Link>
      </div>

      {/* Centred Card Container */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-hairline bg-surface p-8 sm:p-10 shadow-sm">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Logo variant="horizontal" />
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-forest">
              {isConsumer
                ? "Create your account"
                : role === "PROFESSIONAL"
                  ? "Practitioner registration"
                  : "List your practice"}
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              {isConsumer
                ? "Find vetted clinics, book sessions & discover your Dosha."
                : role === "PROFESSIONAL"
                  ? "Create your verified profile to connect with seekers."
                  : "Set up your venue, services, and team on AyurPass."}
            </p>
          </div>

          {/* 1-Click Social Sign-in for Seekers */}
          {isConsumer && (
            <>
              <SocialAuthButtons />
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-hairline" />
                <span className="text-xs font-medium text-ink-muted">or register with email</span>
                <div className="h-px flex-1 bg-hairline" />
              </div>
            </>
          )}

          {/* Registration Form */}
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Field label="Full name" required>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted/60 pointer-events-none" />
                <Input
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="pl-10"
                />
              </div>
            </Field>

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

            {/* Provider specific fields */}
            {role === "PROVIDER_ADMIN" && (
              <>
                <Field label="Business or clinic name" required>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted/60 pointer-events-none" />
                    <Input
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Veda Wellness Retreat"
                      className="pl-10"
                    />
                  </div>
                </Field>
                <Field label="Practice type">
                  <Select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value as ProviderType)}
                  >
                    {PROVIDER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </>
            )}

            {/* Location: Single clean optional city field */}
            <Field
              label={isConsumer ? "City (optional)" : "City"}
              hint={isConsumer ? "Helps suggest wellness spots near you" : undefined}
            >
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted/60 pointer-events-none" />
                <Input
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Melbourne, Sydney, London"
                  className="pl-10"
                />
              </div>
            </Field>

            <Field label="Password" hint="At least 8 characters" required>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted/60 pointer-events-none z-10" />
                <PasswordInput
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </Field>

            <ErrorNote message={error} />

            <Button
              type="submit"
              disabled={busy}
              className="w-full py-3 text-sm font-bold bg-sage hover:bg-sage-dark text-white rounded-xl transition-all min-h-[46px] shadow-sm hover:shadow-md mt-2"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </span>
              ) : (
                "Create free account"
              )}
            </Button>

            <p className="text-center text-[11px] font-medium text-ink-muted pt-1">
              By joining, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{" "}
            <Link
              href={loginUrl(nextParam || undefined)}
              className="font-semibold text-sage hover:text-sage-dark hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-hairline border-t-sage" />
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
