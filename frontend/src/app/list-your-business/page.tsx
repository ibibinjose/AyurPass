"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { BrandProfile, ProviderType } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { Button, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";
import { ArrowRightIcon, CheckIcon, SparkleIcon } from "@/components/icons";

const PROVIDER_TYPES = Object.keys(PROVIDER_TYPE_LABEL) as ProviderType[];
const PRICE_BANDS = ["$", "$$", "$$$", "$$$$"] as const;

const BENEFITS = [
  "A free public page on the world's dedicated Ayurveda, yoga, spa, meditation & retreat finder",
  "Get discovered by wellness seekers searching your city and discipline",
  "Receive enquiries straight to your dashboard — no booking platform required",
  "Upgrade to accept online bookings & payments whenever you're ready",
];

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export default function ListYourBusinessPage() {
  const { register } = useAuth();

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
  const [priceBand, setPriceBand] = useState<string>("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const profile = await register({
        email,
        password,
        fullName,
        role: "PROVIDER_ADMIN",
        businessName,
        providerType,
        listingTier: "FREE_LISTING",
      });

      const providerId = profile.provider?.id;
      if (providerId) {
        const brandProfile: BrandProfile = {
          about: about || undefined,
          contactEmail: email,
          contactPhone: contactPhone || undefined,
          website: website || undefined,
          externalBookingUrl: externalBookingUrl || undefined,
          coverImageUrl: coverImageUrl || undefined,
          tags: parseList(tags),
          amenities: parseList(amenities),
          priceBand: (priceBand || undefined) as BrandProfile["priceBand"],
        };
        await api.updateProvider(providerId, {
          brandProfile,
          address: { street, city, state: stateRegion, country },
        });
      }
      setDoneId(providerId ?? "");
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("exists")
          ? "An account with this email already exists — sign in to manage your listing instead."
          : "We couldn't create your listing. Please try again.",
      );
      setBusy(false);
    }
  }

  if (doneId !== null) {
    return (
      <LayoutWrapper>
        <main className="mx-auto w-full max-w-2xl px-5 py-16">
          <div className="rounded-3xl border border-hairline bg-surface p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf/15 text-forest">
              <CheckIcon className="h-7 w-7" />
            </div>
            <h1 className="mt-5 font-display text-3xl text-forest">Your listing is live 🌿</h1>
            <p className="mx-auto mt-3 max-w-md text-ink-secondary">
              {businessName} now has a free public page on AyurPass. Wellness seekers can find you in
              discovery and send enquiries straight to your dashboard.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {doneId && (
                <Link
                  href={`/providers/${doneId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-deep"
                >
                  View your public page
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/dashboard/business"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-medium text-forest hover:border-leaf"
              >
                Complete your profile
              </Link>
            </div>
            <p className="mt-6 text-xs text-ink-muted">
              Want online bookings & payments too? Add services from your dashboard to upgrade any time.
            </p>
          </div>
        </main>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <main className="mx-auto w-full max-w-5xl px-5 py-12">
        {/* Hero */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="lg:sticky lg:top-24">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
              <SparkleIcon className="h-3.5 w-3.5" />
              Free forever
            </span>
            <h1 className="mt-4 font-display text-4xl leading-tight text-forest">
              List your wellness business — free
            </h1>
            <p className="mt-3 text-ink-secondary">
              Ayurveda clinics, yoga studios, luxury spas, meditation centers, health clubs and
              retreats — create a beautiful public page and get discovered. No booking platform
              required.
            </p>
            <ul className="mt-7 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-ink-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf/15 text-forest">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-sm text-ink-muted">
              Already listed?{" "}
              <Link href="/login" className="font-medium text-forest hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-3xl border border-hairline bg-surface p-7"
          >
            <div>
              <h2 className="font-display text-xl text-forest">Create your free listing</h2>
              <p className="mt-1 text-sm text-ink-muted">Takes about two minutes.</p>
            </div>

            <Field label="Business name">
              <Input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Veda Wellness Retreat"
              />
            </Field>
            <Field label="Category">
              <Select
                value={providerType}
                onChange={(e) => setProviderType(e.target.value as ProviderType)}
              >
                {PROVIDER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PROVIDER_TYPE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City">
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Goa" />
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

            <Field label="About your practice" hint="What makes your place special?">
              <Textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="A serene Ayurvedic retreat overlooking the Arabian Sea, offering authentic Panchakarma…"
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

            <Field label="Tags (optional)" hint="Comma separated — e.g. Panchakarma, Vegan, Ocean view">
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Panchakarma, Detox, Yoga"
              />
            </Field>
            <Field label="Amenities (optional)" hint="Comma separated — e.g. Sauna, Parking, Wi-Fi">
              <Input
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="Sauna, Parking, Wheelchair access"
              />
            </Field>
            <Field label="Cover image URL (optional)">
              <Input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </Field>

            <div className="border-t border-hairline pt-5">
              <p className="mb-3 text-sm font-medium text-foreground">Your account</p>
              <div className="space-y-4">
                <Field label="Your name">
                  <Input
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ananya Sharma"
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
              </div>
            </div>

            <ErrorNote message={error} />
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Creating your listing…" : "Publish my free listing"}
            </Button>
          </form>
        </div>
      </main>
    </LayoutWrapper>
  );
}
