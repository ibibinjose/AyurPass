"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Compass,
  UserCheck,
} from "lucide-react";
import { Button, Card, CardContent, ErrorNote } from "@/components/ui";
import { loginUrl } from "@/lib/auth-redirect";
import { Logo } from "@/components/Logo";

type AccountRole = "CONSUMER" | "PROFESSIONAL" | "PROVIDER_ADMIN";

type AccountOption = {
  role: AccountRole;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  perks: string[];
  accent: string;        // tailwind text color
  accentBg: string;     // tailwind bg color (soft)
  ring: string;         // ring color class when selected
};

const ACCOUNT_OPTIONS: AccountOption[] = [
  {
    role: "CONSUMER",
    icon: <Compass className="h-6 w-6" />,
    emoji: "🌿",
    title: "Seeker",
    subtitle: "Wellness Explorer & Client",
    description:
      "Find vetted Ayurveda clinics, yoga studios and spas near you. Take your Prakriti quiz and book instantly.",
    perks: [
      "Personalised Prakriti Dosha quiz",
      "Discover & book near you",
      "AyurPass rewards & loyalty points",
    ],
    accent: "text-sage",
    accentBg: "bg-sage/10",
    ring: "ring-sage",
  },
  {
    role: "PROFESSIONAL",
    icon: <UserCheck className="h-6 w-6" />,
    emoji: "🧘",
    title: "Practitioner",
    subtitle: "Therapist & Professional",
    description:
      "Build a verified public profile, accept client leads and manage your schedule — solo or inside a clinic.",
    perks: [
      "Verified practitioner profile",
      "Schedule & consultation tools",
      "Connect with clinics or studios",
    ],
    accent: "text-terracotta",
    accentBg: "bg-terracotta/10",
    ring: "ring-terracotta",
  },
  {
    role: "PROVIDER_ADMIN",
    icon: <Building2 className="h-6 w-6" />,
    emoji: "🏛️",
    title: "Provider",
    subtitle: "Clinic · Studio · Retreat",
    description:
      "List your venue, manage staff and rooms, publish services and take real-time bookings and payments.",
    perks: [
      "Full venue & business listing",
      "Staff, rooms & service management",
      "Real-time bookings & payments",
    ],
    accent: "text-blue-dress",
    accentBg: "bg-blue-dress/10",
    ring: "ring-blue-dress",
  },
];

function AccountTypeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const [selectedRole, setSelectedRole] = useState<AccountRole>("CONSUMER");
  const [error, setError] = useState<string | null>(null);

  const selectedOption = ACCOUNT_OPTIONS.find((o) => o.role === selectedRole)!;

  function selectRoleFromKeyboard(event: React.KeyboardEvent<HTMLDivElement>, index: number) {
    const lastIndex = ACCOUNT_OPTIONS.length - 1;
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }
    if (nextIndex !== null) {
      event.preventDefault();
      const nextRole = ACCOUNT_OPTIONS[nextIndex].role;
      setSelectedRole(nextRole);
      window.requestAnimationFrame(() =>
        document.getElementById(`account-role-${nextRole}`)?.focus(),
      );
    }
  }

  function handleContinue() {
    setError(null);
    try {
      const url = nextParam
        ? `/register?role=${selectedRole}&next=${encodeURIComponent(nextParam)}`
        : `/register?role=${selectedRole}`;
      router.push(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-hairline bg-surface/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <div className="h-4 w-px bg-hairline" />
            <Logo />
          </div>
          <Link
            href={loginUrl(nextParam || undefined)}
            className="text-xs font-semibold text-sage hover:underline transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-forest md:text-4xl">
            How will you use AyurPass?
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Pick the account that fits you best. You can always change it later.
          </p>
        </div>

        {/* Cards */}
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          role="radiogroup"
          aria-label="Account type"
        >
          {ACCOUNT_OPTIONS.map((option, index) => {
            const isSelected = selectedRole === option.role;
            return (
              <Card
                key={option.role}
                id={`account-role-${option.role}`}
                onClick={() => setSelectedRole(option.role)}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedRole(option.role);
                    return;
                  }
                  selectRoleFromKeyboard(e, index);
                }}
                role="radio"
                aria-label={`${option.title} — ${option.subtitle}`}
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={`cursor-pointer select-none outline-none transition-all duration-200 ${
                  isSelected
                    ? `ring-2 ${option.ring} shadow-lg border-transparent`
                    : "border-hairline hover:border-sage/40 hover:shadow-sm"
                }`}
              >
                <CardContent className="p-6">
                  {/* Icon row */}
                  <div className="mb-5 flex items-start justify-between">
                    <div className={`rounded-xl p-2.5 ${isSelected ? option.accentBg : "bg-sand"} ${option.accent}`}>
                      {option.icon}
                    </div>
                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sage">
                        <Check className="h-3 w-3 stroke-[3] text-white" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-base">{option.emoji}</span>
                    <h2 className="text-lg font-bold text-forest">{option.title}</h2>
                  </div>
                  <p className={`mb-3 text-xs font-semibold ${option.accent}`}>
                    {option.subtitle}
                  </p>
                  <p className="mb-5 text-sm leading-relaxed text-ink-secondary">
                    {option.description}
                  </p>

                  {/* Perks */}
                  <ul className="space-y-2">
                    {option.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-ink-secondary">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage stroke-[2.5]" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6">
            <ErrorNote message={error} />
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            onClick={handleContinue}
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-sage py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-sage-dark hover:shadow-md active:scale-[0.98] md:w-auto md:px-10"
          >
            Continue as {selectedOption.title}
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Button>

          <p className="text-xs text-ink-muted">
            Free to join · No credit card required
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AccountTypePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-hairline border-t-sage" />
        </div>
      }
    >
      <AccountTypeContent />
    </Suspense>
  );
}