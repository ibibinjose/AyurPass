"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Button, ErrorNote, Field, Input, Select } from "@/components/ui";
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
  { value: "HYBRID", label: "Hybrid wellness center" },
];

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const asProvider = useSearchParams().get("as") === "provider";

  const [kind, setKind] = useState<"consumer" | "provider">(asProvider ? "provider" : "consumer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [providerType, setProviderType] = useState<ProviderType>("AYURVEDA_CLINIC");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({
        email,
        password,
        fullName,
        role: kind === "provider" ? "PROVIDER_ADMIN" : "CONSUMER",
        ...(kind === "provider" ? { businessName, providerType } : {}),
      });
      router.push(kind === "consumer" ? "/dashboard/assessment" : "/dashboard");
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

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo variant="stacked" />
        </div>
        <div className="rounded-3xl border border-hairline bg-surface p-8">
          <h1 className="font-display text-2xl text-forest">Begin your journey</h1>
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
                className={`rounded-full px-3 py-2 transition-colors ${
                  kind === value ? "bg-forest text-white" : "text-ink-secondary hover:text-forest"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
            <Field label="Email">
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password" hint="At least 8 characters.">
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <ErrorNote message={error} />
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>
        <p className="mt-5 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-forest hover:underline">
            Sign in
          </Link>
        </p>
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
