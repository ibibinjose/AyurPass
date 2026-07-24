"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { loginUrl } from "@/lib/auth-redirect";
import { api, tokenStore } from "@/lib/api";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { BrandProfile, ProviderType } from "@/lib/types";
import { STICKY_BELOW_NAV } from "@/components/DirectoryLayout";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { MediaField } from "@/components/MediaField";
import { Button, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";
import {
  ArrowRightIcon,
  CheckIcon,
  CompassIcon,
  LeafIcon,
  LotusIcon,
  MoonIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";

const PROVIDER_TYPES = Object.keys(PROVIDER_TYPE_LABEL) as ProviderType[];
const PRICE_BANDS = ["$", "$$", "$$$", "$$$$"] as const;

const TYPE_ICON: Partial<Record<ProviderType, typeof LeafIcon>> = {
  AYURVEDA_CLINIC: LeafIcon,
  AYURVEDA_RESORT: LeafIcon,
  PANCHAKARMA_CENTER: LeafIcon,
  WELLNESS_RETREAT: CompassIcon,
  YOGA_STUDIO: LotusIcon,
  LUXURY_SPA: MoonIcon,
  MEDITATION_CENTER: MoonIcon,
  HEALTH_CLUB: UsersIcon,
  NUTRITIONIST: LeafIcon,
  COACHING: UsersIcon,
  HYBRID: SparkleIcon,
};

const PRO_PILLARS = [
  {
    title: "Smart Scheduling",
    icon: CompassIcon,
    badge: "iCal & Google Sync",
    description:
      "Multi-staff calendars, room management, timezone conversion, and automated SMS & email appointment reminders.",
  },
  {
    title: "Direct Payments",
    icon: SparkleIcon,
    badge: "100% Direct Payouts",
    description:
      "100% of client fees land directly in your bank account via Stripe Connect. Zero commission fee lock-in.",
  },
  {
    title: "Client CRM & Records",
    icon: UsersIcon,
    badge: "Secure Profiles & Files",
    description:
      "Client health profiles, consultation logs, progress tracking, and secure document storage for intake forms and assessments.",
  },
  {
    title: "Secure Messaging",
    icon: MoonIcon,
    badge: "HIPAA & Health Compliant",
    description:
      "Direct end-to-end encrypted practitioner-to-client chat between sessions with automated follow-ups.",
  },
  {
    title: "Public Directory",
    icon: LotusIcon,
    badge: "Verified Practice Page",
    description:
      "Polished practice profiles with verified AHPRA/health authority badges, specialties, hourly rates, and real client reviews.",
  },
];

const THERAPIST_STEPS = [
  {
    num: "1",
    title: "Build Your Profile",
    description:
      "Showcase your expertise, define your specialties, and set your own rates. Your profile is your digital practice, fully under your control.",
  },
  {
    num: "2",
    title: "Verification",
    description:
      "We verify your credentials to build a community of trusted, high-quality professionals. Process typically takes 2–5 business days.",
  },
  {
    num: "3",
    title: "Connect with Clients",
    description:
      "Clients request to connect with you based on your profile. You have the final say on who you work with, ensuring good therapeutic fit.",
  },
  {
    num: "4",
    title: "Manage Your Practice",
    description:
      "Use our suite of free tools for scheduling, video sessions, secure messaging, and direct payments. Focus on your clients, not overhead.",
  },
];

const BENEFITS = [
  {
    title: "Smart Scheduling & Sync",
    body: "Multi-staff calendars, room allocations, iCal sync, and automated SMS/email reminders.",
  },
  {
    title: "100% Direct Payments",
    body: "Stripe Connect integration ensures 100% of fees land straight into your bank account.",
  },
  {
    title: "Client CRM & Progress",
    body: "Keep session logs, clinical progress, health notes, and uploaded intake files in one secure vault.",
  },
  {
    title: "Secure Client Messaging",
    body: "HIPAA-compliant, encrypted messaging for continuous client care between visits.",
  },
  {
    title: "Verified Directory Listing",
    body: "Get discovered by wellness seekers filtering by city, discipline, credentials, and verified reviews.",
  },
];

const GUEST_STEPS = [
  { id: 0, label: "Practice", short: "1" },
  { id: 1, label: "Location", short: "2" },
  { id: 2, label: "Profile", short: "3" },
  { id: 3, label: "Account", short: "4" },
] as const;

const AUTHED_STEPS = [
  { id: 0, label: "Practice", short: "1" },
  { id: 1, label: "Location", short: "2" },
  { id: 2, label: "Profile", short: "3" },
] as const;

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export default function ListYourBusinessClient() {
  const { user, loading: authLoading, register, refreshProfile } = useAuth();
  const isAuthed = Boolean(user);
  const existingProviderId = user?.provider?.id ?? null;
  const steps = isAuthed ? AUTHED_STEPS : GUEST_STEPS;
  const lastStep = steps.length - 1;

  const [step, setStep] = useState(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [providerType, setProviderType] = useState<ProviderType>("AYURVEDA_CLINIC");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [country, setCountry] = useState("");
  const [street, setStreet] = useState("");
  const [about, setAbout] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [externalBookingUrl, setExternalBookingUrl] = useState("");
  const [tags, setTags] = useState("");
  const [amenities, setAmenities] = useState("");
  const [priceBand, setPriceBand] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  /** Local files chosen before account exists — uploaded right after register. */
  const [logoPendingFile, setLogoPendingFile] = useState<File | null>(null);
  const [coverPendingFile, setCoverPendingFile] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);

  // Prefill account fields from the signed-in session.
  useEffect(() => {
    if (!user) return;
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      if (user.fullName) setFullName((v) => v || user.fullName || "");
      if (user.email) setEmail((v) => v || user.email);
    };
    run();
    return () => {
      active = false;
    };
  }, [user]);

  // Clamp step if auth resolves mid-flow and we drop the Account step.
  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        setStep((s) => Math.min(s, lastStep));
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [lastStep]);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step, steps.length]);

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!businessName.trim()) return "Add your business name to continue.";
      return null;
    }
    if (s === 1) {
      if (!city.trim() && !country.trim()) {
        return "Add at least a city or country so seekers can find you.";
      }
      return null;
    }
    // Guest account step only
    if (!isAuthed && s === 3) {
      if (!fullName.trim()) return "Your name is required.";
      if (!email.trim()) return "Email is required.";
      if (password.length < 8) return "Password must be at least 8 characters.";
      return null;
    }
    return null;
  }

  function goNext() {
    setError(null);
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setStep((s) => Math.min(s + 1, lastStep));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function resolveMediaUrls(): Promise<{ markUrl?: string; coverUrl?: string }> {
    let markUrl =
      logoUrl.trim() && !logoUrl.startsWith("blob:") ? logoUrl.trim() : undefined;
    let coverUrl =
      coverImageUrl.trim() && !coverImageUrl.startsWith("blob:")
        ? coverImageUrl.trim()
        : undefined;
    if (logoPendingFile) {
      try {
        const uploaded = await api.uploadImage(logoPendingFile);
        markUrl = uploaded.url;
      } catch {
        markUrl = markUrl || undefined;
      }
    }
    if (coverPendingFile) {
      try {
        const uploaded = await api.uploadImage(coverPendingFile);
        coverUrl = uploaded.url;
      } catch {
        coverUrl = coverUrl || undefined;
      }
    }
    return { markUrl, coverUrl };
  }

  function buildBrandProfile(contactEmail: string, markUrl?: string, coverUrl?: string): BrandProfile {
    return {
      about: about.trim() || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone.trim() || undefined,
      website: website.trim() || undefined,
      externalBookingUrl: externalBookingUrl.trim() || undefined,
      logoUrl: markUrl,
      coverImageUrl: coverUrl,
      tags: parseList(tags),
      amenities: parseList(amenities),
      priceBand: (priceBand || undefined) as BrandProfile["priceBand"],
    };
  }

  const addressPayload = () => ({
    street: street.trim(),
    city: city.trim(),
    state: stateRegion.trim(),
    country: country.trim(),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Guests must complete account step; signed-in users publish from Profile step.
    const msg = validateStep(isAuthed ? 0 : 3);
    if (!isAuthed) {
      const accountMsg = validateStep(3);
      if (accountMsg) {
        setError(accountMsg);
        return;
      }
    } else {
      const practiceMsg = validateStep(0) || validateStep(1);
      if (practiceMsg) {
        setError(practiceMsg);
        return;
      }
    }
    if (msg && !isAuthed) {
      setError(msg);
      return;
    }

    setBusy(true);
    try {
      // Path A — already signed in: create listing on this account (no re-register).
      if (isAuthed && user) {
        if (user.provider?.id) {
          setDoneId(user.provider.id);
          setBusy(false);
          return;
        }

        const { markUrl, coverUrl } = await resolveMediaUrls();
        const res = await api.listBusiness({
          businessName: businessName.trim(),
          type: providerType,
          listingTier: "FREE_LISTING",
          brandProfile: buildBrandProfile(user.email, markUrl, coverUrl),
          address: addressPayload(),
        });
        if (res.accessToken && res.refreshToken) {
          tokenStore.set({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          });
        }
        await refreshProfile();
        setDoneId(res.provider?.id ?? "");
        return;
      }

      // Path B — guest: register provider account then patch brand/address.
      const profile = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role: "PROVIDER_ADMIN",
        businessName: businessName.trim(),
        providerType,
        listingTier: "FREE_LISTING",
      });

      const providerId = profile.provider?.id;
      if (providerId) {
        const { markUrl, coverUrl } = await resolveMediaUrls();
        await api.updateProvider(providerId, {
          brandProfile: buildBrandProfile(email.trim(), markUrl, coverUrl),
          address: addressPayload(),
        });
      }
      setDoneId(providerId ?? "");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const lower = raw.toLowerCase();
      setError(
        lower.includes("already have a practice")
          ? "You already have a practice listing — open the dashboard to manage it."
          : lower.includes("exist")
            ? "An account with this email already exists — sign in, then list your practice (no second account needed)."
            : raw || "We couldn't create your page. Please try again.",
      );
      setBusy(false);
    }
  }

  if (!authLoading && existingProviderId && doneId === null) {
    return (
      <LayoutWrapper>
        <div className="flex-1 pb-12">
          <div className="page-shell !pt-12 !pb-8">
            <div className="mx-auto max-w-lg overflow-hidden rounded-[1.25rem] border border-[var(--separator)] bg-surface text-center shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
              <div
                aria-hidden
                className="h-28 bg-[linear-gradient(135deg,var(--color-forest),var(--color-leaf))]"
              />
              <div className="relative px-6 pb-10 pt-0 sm:px-10">
                <div className="-mt-8 mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-surface bg-leaf/20 text-forest shadow-sm">
                  <CheckIcon className="h-8 w-8" strokeWidth={2.2} />
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--system-blue)]">
                  Already listed
                </p>
                <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
                  {user?.provider?.businessName || "Your practice"} is on AyurPass
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-ink-secondary">
                  You&apos;re signed in and already have a practice page. Manage it from your
                  dashboard — no second account needed.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/dashboard/business"
                    className="profile-spring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(36,56,46,0.2)] hover:bg-forest-deep"
                  >
                    Open business dashboard
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/providers/${existingProviderId}`}
                    className="profile-spring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--separator)] bg-surface px-6 text-sm font-semibold text-ink-secondary hover:border-[var(--system-blue)]/40 hover:text-foreground"
                  >
                    View public page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (doneId !== null) {
    return (
      <LayoutWrapper>
        <div className="flex-1 pb-12">
          <div className="page-shell !pt-12 !pb-8">
            <div className="mx-auto max-w-lg overflow-hidden rounded-[1.25rem] border border-[var(--separator)] bg-surface text-center shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
              <div
                aria-hidden
                className="h-28 bg-[linear-gradient(135deg,var(--color-forest),var(--color-leaf))]"
              />
              <div className="relative px-6 pb-10 pt-0 sm:px-10">
                <div className="-mt-8 mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-surface bg-leaf/20 text-forest shadow-sm">
                  <CheckIcon className="h-8 w-8" strokeWidth={2.2} />
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--system-blue)]">
                  You&apos;re live
                </p>
                <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
                  {businessName || "Your practice"} is on AyurPass
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-ink-secondary">
                  Seekers can discover you and send enquiries to your dashboard. Finish your profile
                  and add bookable sessions when you&apos;re ready.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  {doneId ? (
                    <Link
                      href={`/providers/${doneId}`}
                      className="profile-spring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(36,56,46,0.2)] hover:bg-forest-deep"
                    >
                      View public page
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  ) : null}
                  <Link
                    href="/dashboard/business"
                    className="profile-spring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--separator)] bg-surface px-6 text-sm font-semibold text-ink-secondary hover:border-[var(--system-blue)]/40 hover:text-foreground"
                  >
                    Complete profile
                  </Link>
                </div>
                <p className="mt-6 text-xs font-medium text-ink-muted">
                  Online bookings &amp; payments unlock when you add services in the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="flex-1 pb-12">
        {/* Hero band */}
        <section className="relative min-h-[380px] overflow-hidden border-b border-[var(--separator)] flex flex-col justify-center">
          <img
            src="/images/heroes/spa.png"
            alt="Wellness Practice"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/60 to-transparent" />
          
          <div className="page-shell relative !pb-12 !pt-12 sm:!pt-16">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-forest">
              <SparkleIcon className="h-3.5 w-3.5" />
              Free forever · no card required
            </p>
            <h1 className="type-display mt-3 max-w-2xl text-forest" style={{ textShadow: "0 0 20px rgba(255,255,255,1), 0 0 10px rgba(255,255,255,0.8)" }}>
              List your wellness practice
            </h1>
            <p className="type-body mt-4 max-w-xl font-semibold text-ink-secondary" style={{ textShadow: "0 0 15px rgba(255,255,255,1), 0 0 5px rgba(255,255,255,0.8)" }}>
              Ayurveda clinics, yoga studios, spas, meditation centers, health clubs and retreats —
              get a public page and start receiving enquiries in minutes.
            </p>
            {authLoading ? null : isAuthed ? (
              <p className="mt-3 text-sm font-semibold text-ink-muted">
                Signed in as{" "}
                <span className="font-bold text-forest">
                  {user?.fullName || user?.email}
                </span>
                {" · "}
                we&apos;ll publish on this account (no password again).
              </p>
            ) : (
              <p className="mt-3 text-sm font-semibold text-ink-muted">
                Already on AyurPass?{" "}
                <Link
                  href={loginUrl("/list-your-business")}
                  className="font-bold text-[var(--system-blue)] hover:underline"
                >
                  Sign in →
                </Link>
              </p>
            )}
          </div>
        </section>

        <div className="page-shell !pt-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-start lg:gap-12">
            {/* Left column — benefits + progress (sticky) */}
            <aside className={`lg:sticky lg:self-start ${STICKY_BELOW_NAV}`}>
              <div className="rounded-[1.25rem] border border-[var(--separator)] bg-surface/90 p-5 shadow-[0_8px_28px_rgba(0,0,0,0.04)] sm:p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
                  Why list on AyurPass
                </p>
                <ul className="mt-4 space-y-4">
                  {BENEFITS.map((b) => (
                    <li key={b.title} className="flex gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf/15 text-forest">
                        <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-forest">{b.title}</p>
                        <p className="mt-0.5 text-sm font-medium leading-relaxed text-ink-secondary">
                          {b.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { n: "2 min", l: "to publish" },
                  { n: "Free", l: "profile forever" },
                  { n: "0%", l: "until you book" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-2xl border border-[var(--separator)] bg-surface/80 px-2 py-3"
                  >
                    <p className="text-sm font-bold text-forest">{s.n}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-ink-muted">{s.l}</p>
                  </div>
                ))}
              </div>
            </aside>

            {/* Form card */}
            <div className="overflow-hidden rounded-[1.25rem] border border-[var(--separator)] bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
              {/* Progress */}
              <div className="border-b border-[var(--separator)] px-5 py-4 sm:px-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Step {step + 1} of {steps.length}
                    </p>
                    <p className="mt-0.5 font-display text-lg font-semibold text-forest">
                      {steps[step]?.label}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-ink-muted">
                    {Math.round(progress)}%
                  </p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-clay">
                  <div
                    className="h-full rounded-full bg-[var(--system-blue)] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <ol className="mt-4 flex gap-1.5">
                  {steps.map((s) => (
                    <li key={s.id} className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (s.id < step) {
                            setError(null);
                            setStep(s.id);
                          }
                        }}
                        disabled={s.id > step}
                        className={`w-full truncate rounded-full px-2 py-1.5 text-center text-[11px] font-bold transition-colors ${
                          s.id === step
                            ? "bg-[var(--system-blue)] text-white"
                            : s.id < step
                              ? "bg-leaf/15 text-forest hover:bg-leaf/25"
                              : "bg-clay text-ink-muted"
                        }`}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              <form
                onSubmit={
                  step === lastStep
                    ? onSubmit
                    : (e) => {
                        e.preventDefault();
                        goNext();
                      }
                }
                className="space-y-5 px-5 py-6 sm:px-7 sm:py-7 min-h-[400px] flex flex-col"
              >
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      {step === 0 ? (
                  <>
                    <Field label="Business name">
                      <Input
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Veda Wellness Retreat"
                        autoFocus
                      />
                    </Field>

                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">Category</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {PROVIDER_TYPES.map((t) => {
                          const Icon = TYPE_ICON[t] ?? LeafIcon;
                          const active = providerType === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setProviderType(t)}
                              className={`profile-spring flex flex-col items-start gap-2 rounded-2xl border px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                                active
                                  ? "border-[var(--system-blue)] bg-[var(--system-blue)] text-white shadow-[0_4px_14px_rgba(0,122,255,0.25)]"
                                  : "border-[var(--separator)] bg-surface text-foreground hover:border-[var(--system-blue)]/35"
                              }`}
                            >
                              <Icon
                                className={`h-5 w-5 ${active ? "text-white" : "text-[var(--system-blue)]"}`}
                              />
                              <span className="text-xs font-bold leading-snug">
                                {PROVIDER_TYPE_LABEL[t]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : null}

                {step === 1 ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="City">
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Goa"
                          autoFocus
                        />
                      </Field>
                      <Field label="Country">
                        <Input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="India"
                        />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="State / region">
                        <Input
                          value={stateRegion}
                          onChange={(e) => setStateRegion(e.target.value)}
                          placeholder="Goa"
                        />
                      </Field>
                      <Field label="Street (optional)">
                        <Input
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="123 Palm Grove Rd"
                        />
                      </Field>
                    </div>
                    <p className="text-xs font-medium text-ink-muted">
                      Location helps seekers filter Discover and your public page.
                    </p>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <Field label="About your practice" hint="What makes your place special?">
                      <Textarea
                        rows={4}
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder="A serene Ayurvedic retreat overlooking the Arabian Sea, offering authentic Panchakarma…"
                        autoFocus
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Website (optional)">
                        <Input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://…"
                        />
                      </Field>
                      <Field label="Booking link (optional)" hint="Your own booking page, if any.">
                        <Input
                          type="url"
                          value={externalBookingUrl}
                          onChange={(e) => setExternalBookingUrl(e.target.value)}
                          placeholder="https://…"
                        />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Phone (optional)">
                        <Input
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+91 …"
                        />
                      </Field>
                      <Field label="Price band (optional)">
                        <Select value={priceBand} onChange={(e) => setPriceBand(e.target.value)}>
                          <option value="">Not specified</option>
                          {PRICE_BANDS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                    <Field
                      label="Tags (optional)"
                      hint="Comma separated — e.g. Panchakarma, Vegan, Ocean view"
                    >
                      <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Panchakarma, Detox, Yoga"
                      />
                    </Field>
                    <Field
                      label="Amenities (optional)"
                      hint="Comma separated — e.g. Sauna, Parking, Wi-Fi"
                    >
                      <Input
                        value={amenities}
                        onChange={(e) => setAmenities(e.target.value)}
                        placeholder="Sauna, Parking, Wheelchair access"
                      />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <MediaField
                        label="Brand mark (optional)"
                        shape="brand"
                        value={logoUrl}
                        onChange={setLogoUrl}
                        deferUpload={!isAuthed}
                        onDeferredFile={isAuthed ? undefined : setLogoPendingFile}
                        recommended="square · 512×512+"
                        hint={
                          isAuthed
                            ? "Logo for cards and your profile header."
                            : "Logo for cards and your profile header. Uploads when you publish."
                        }
                      />
                      <MediaField
                        label="Cover image (optional)"
                        shape="cover"
                        value={coverImageUrl}
                        onChange={setCoverImageUrl}
                        deferUpload={!isAuthed}
                        onDeferredFile={isAuthed ? undefined : setCoverPendingFile}
                        recommended="wide · 1600×900"
                        hint={
                          isAuthed
                            ? "Hero banner on your public page."
                            : "Hero banner on your public page. Uploads when you publish."
                        }
                      />
                    </div>
                    {isAuthed ? (
                      <div className="rounded-2xl border border-[var(--separator)] bg-clay/30 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                          Publishing as
                        </p>
                        <p className="mt-1 font-display text-lg font-semibold text-forest">
                          {businessName || "Your practice"}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-ink-secondary">
                          {PROVIDER_TYPE_LABEL[providerType]}
                          {city || country
                            ? ` · ${[city, country].filter(Boolean).join(", ")}`
                            : ""}
                        </p>
                        <p className="mt-2 text-xs font-medium text-ink-muted">
                          Account: {user?.fullName || user?.email} — no password needed.
                        </p>
                      </div>
                    ) : null}
                    <p className="text-xs font-medium text-ink-muted">
                      You can skip media and finish brand visuals later under Dashboard → Business.
                    </p>
                    {isAuthed ? (
                      <p className="text-xs font-medium leading-relaxed text-ink-muted">
                        By publishing you agree to our{" "}
                        <Link href="/terms" className="font-semibold text-forest hover:underline">
                          Terms
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="font-semibold text-forest hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    ) : null}
                  </>
                ) : null}

                {!isAuthed && step === 3 ? (
                  <>
                    <div className="rounded-2xl border border-[var(--separator)] bg-clay/30 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                        Publishing as
                      </p>
                      <p className="mt-1 font-display text-lg font-semibold text-forest">
                        {businessName || "Your practice"}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-ink-secondary">
                        {PROVIDER_TYPE_LABEL[providerType]}
                        {city || country
                          ? ` · ${[city, country].filter(Boolean).join(", ")}`
                          : ""}
                      </p>
                    </div>
                    <Field label="Your name">
                      <Input
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ananya Sharma"
                        autoFocus
                      />
                    </Field>
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
                    <p className="text-xs font-medium leading-relaxed text-ink-muted">
                      Already have an account?{" "}
                      <Link
                        href={loginUrl("/list-your-business")}
                        className="font-semibold text-[var(--system-blue)] hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      instead of creating a new one. By publishing you agree to our{" "}
                      <Link href="/terms" className="font-semibold text-forest hover:underline">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="font-semibold text-forest hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </>
                ) : null}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <ErrorNote message={error} />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {step > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={goBack}
                      disabled={busy}
                      className="sm:min-w-[7rem]"
                    >
                      Back
                    </Button>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                  <Button
                    type="submit"
                    disabled={busy || authLoading}
                    className="w-full sm:ml-auto sm:w-auto sm:min-w-[12rem]"
                  >
                    {step < lastStep
                      ? "Continue"
                      : busy
                        ? "Publishing…"
                        : "Publish free page"}
                    {step < lastStep || !busy ? (
                      <ArrowRightIcon className="h-4 w-4" />
                    ) : null}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* How It Works for Therapists & Practitioners */}
          <section className="mt-16 rounded-3xl border border-hairline bg-surface/80 p-8 shadow-sm">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest">
                Therapist &amp; Practitioner Journey
              </span>
              <h2 className="font-display text-3xl font-bold text-forest">
                How AyurPass Works for Your Practice
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed">
                4 simple steps from verified listing to running a thriving digital practice.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {THERAPIST_STEPS.map((step) => (
                <div
                  key={step.num}
                  className="flex flex-col justify-between rounded-2xl border border-hairline bg-clay/20 p-6 transition-transform hover:-translate-y-1"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white font-bold font-display text-lg shadow-sm">
                      {step.num}
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-forest">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AyurPass Pro Feature Suite */}
          <section className="mt-12 rounded-3xl border border-hairline bg-surface p-8 shadow-sm">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest">
                <SparkleIcon className="h-3.5 w-3.5" /> Built for Modern Practitioners &amp; Clinics
              </span>
              <h2 className="font-display text-3xl font-bold text-forest">
                Complete Pro Platform Operating System
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed">
                Everything you need to run appointments, payments, client CRM records, and practice growth in one place.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {PRO_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex flex-col justify-between rounded-2xl border border-hairline bg-clay/10 p-6 transition-transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf/20 text-forest">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="rounded-full bg-surface border border-hairline px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-forest">
                          {pillar.badge}
                        </span>
                      </div>
                      <h3 className="mt-4 font-display text-lg font-semibold text-forest">
                        {pillar.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Social proof / next steps footer */}
          <section className="mt-12 grid gap-3 border-t border-[var(--separator)] pt-8 sm:grid-cols-3">
            {[
              {
                href: "/discover",
                title: "See the directory",
                body: "How seekers find practices like yours",
              },
              {
                href: "/partners",
                title: "Partner program",
                body: "Growth tools for established hosts",
              },
              {
                href: "/help",
                title: "Need help?",
                body: "Guides for listing and verification",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="profile-spring rounded-2xl border border-[var(--separator)] bg-surface px-4 py-4 transition-colors hover:border-[var(--system-blue)]/35"
              >
                <p className="text-sm font-bold text-forest">{item.title}</p>
                <p className="mt-0.5 text-xs font-medium text-ink-muted">{item.body}</p>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </LayoutWrapper>
  );
}
