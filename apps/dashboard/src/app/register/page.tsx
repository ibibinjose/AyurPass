"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Button, ErrorNote, Field, Input, Select } from "@/components/ui";
import { AuthBanner } from "@/components/auth/AuthBanner";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { loginUrl, postAuthHome, safeNextPath } from "@/lib/auth-redirect";
import { COUNTRIES_WITH_DIAL, countryByCode } from "@/lib/countries";
import type { ProviderType } from "@/lib/types";

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

function getPasswordStrength(p: string): { label: string; score: number; color: string } {
  if (!p) return { label: "", score: 0, color: "bg-transparent" };
  let s = 0;
  if (p.length >= 8) s += 1;
  if (/[A-Z]/.test(p)) s += 1;
  if (/[0-9]/.test(p)) s += 1;
  if (/[^A-Za-z0-9]/.test(p)) s += 1;

  if (s <= 1) return { label: "Weak", score: 25, color: "bg-red-500" };
  if (s <= 3) return { label: "Moderate", score: 60, color: "bg-amber-500" };
  return { label: "Strong", score: 100, color: "bg-leaf" };
}

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const asProvider = search.get("as") === "provider";
  const nextParam = search.get("next");

  const [kind, setKind] = useState<"consumer" | "provider">(asProvider ? "provider" : "consumer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [countryCode, setCountryCode] = useState("AU");
  const [businessName, setBusinessName] = useState("");
  const [providerType, setProviderType] = useState<ProviderType>("AYURVEDA_CLINIC");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!city.trim()) {
      setError("Please add your city so we can show practices near you.");
      return;
    }
    if (!countryCode) {
      setError("Please select your country.");
      return;
    }
    const countryName = countryByCode(countryCode)?.name || countryCode;
    setBusy(true);
    try {
      const profile = await register({
        email,
        password,
        fullName,
        role: kind === "provider" ? "PROVIDER_ADMIN" : "CONSUMER",
        city: city.trim(),
        country: countryName,
        countryCode,
        ...(kind === "provider" ? { businessName, providerType } : {}),
      });
      // New seekers → verify email notice + dosha quiz; providers → practice hub
      const fallback =
        kind === "consumer" ? "/dashboard/assessment?verify=1" : postAuthHome(profile);
      router.push(safeNextPath(nextParam, fallback));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const status = err && typeof err === "object" && "status" in err ? Number((err as { status: number }).status) : 0;
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

  const strength = getPasswordStrength(password);

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
            <h1 className="font-display text-2xl font-semibold text-forest">Begin your journey</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {kind === "consumer"
                ? "Create an account and discover your dosha."
                : "List your practice on AyurPass."}
            </p>

            <div className="mt-5 grid grid-cols-2 rounded-full border border-hairline bg-clay/60 p-1 text-sm font-medium">
              {(
                [
                  ["consumer", "I'm seeking wellness"],
                  ["provider", "I'm a provider"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value)}
                  className={`rounded-full px-3 py-2 transition-all duration-200 ${
                    kind === value
                      ? "bg-forest text-white shadow-sm"
                      : "text-ink-secondary hover:text-forest"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <SocialAuthButtons />
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
              <Field label="Full name">
                <Input
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ananya Sharma"
                />
              </Field>

              {kind === "provider" && (
                <>
                  <Field label="Business name">
                    <Input
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Veda Wellness Retreat"
                    />
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

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="City" hint="Used for Near me & local results.">
                  <Input
                    required
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Melbourne"
                  />
                </Field>
                <Field label="Country" hint="Required — sets currency & region defaults.">
                  <Select
                    required
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    autoComplete="country"
                  >
                    {COUNTRIES_WITH_DIAL.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div>
                <Field label="Password" hint="At least 8 characters.">
                  <PasswordInput
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>

                {password && (
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-ink-muted">Password Strength</span>
                      <span
                        className={`font-bold transition-colors duration-300 ${
                          strength.color === "bg-leaf" ? "text-forest" : "text-foreground"
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1 w-full rounded bg-clay/50 overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <ErrorNote message={error} />

              <Button type="submit" disabled={busy} className="w-full">
                {busy ? "Creating account…" : "Create account"}
              </Button>
              <p className="text-center text-[11px] font-medium leading-relaxed text-ink-muted">
                We’ll send a verification link to your email. Please confirm it to keep your account
                secure — you can still browse while you verify.
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{" "}
            <Link
              href={loginUrl(nextParam || undefined)}
              className="font-semibold text-forest hover:underline"
            >
              Sign in
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

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
