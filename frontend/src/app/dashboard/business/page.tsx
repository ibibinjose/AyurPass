"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { BrandProfile, HealthAuthorityBadge, ProviderType } from "@/lib/types";
import { HEALTH_AUTHORITY_PRESETS, normalizeAuthorities } from "@/lib/credentials";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea, SuccessNote } from "@/components/ui";

const PROVIDER_TYPES = Object.keys(PROVIDER_TYPE_LABEL) as ProviderType[];
const PRICE_BANDS = ["$", "$$", "$$$", "$$$$"] as const;

/** Split a comma-separated field into a trimmed, de-duplicated list. */
function splitList(value: string): string[] {
  return Array.from(
    new Set(value.split(",").map((v) => v.trim()).filter(Boolean)),
  ).slice(0, 20);
}
/** Split a newline/comma-separated field of URLs into a clean list. */
function splitLines(value: string): string[] {
  return value.split(/[\n,]/).map((v) => v.trim()).filter(Boolean).slice(0, 20);
}

export default function BusinessProfilePage() {
  const { user, refreshProfile } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [businessName, setBusinessName] = useState("");
  const [type, setType] = useState<ProviderType>("AYURVEDA_CLINIC");
  const [about, setAbout] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");

  // Listing / discovery presentation
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [gallery, setGallery] = useState("");
  const [tags, setTags] = useState("");
  const [amenities, setAmenities] = useState("");
  const [externalBookingUrl, setExternalBookingUrl] = useState("");
  const [priceBand, setPriceBand] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [authorityCodes, setAuthorityCodes] = useState<string[]>([]);
  const [customAuthority, setCustomAuthority] = useState("");

  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) return;
    api
      .provider(provider.id)
      .then((p) => {
        setBusinessName(p.businessName);
        setType(p.type);
        setAbout(p.brandProfile?.about ?? "");
        setContactEmail(p.brandProfile?.contactEmail ?? "");
        setContactPhone(p.brandProfile?.contactPhone ?? "");
        setWebsite(p.brandProfile?.website ?? "");
        setOpeningHours(p.brandProfile?.openingHours ?? "");
        setStreet(p.address?.street ?? "");
        setCity(p.address?.city ?? "");
        setState(p.address?.state ?? "");
        setPostcode(p.address?.postcode ?? "");
        setCountry(p.address?.country ?? "");
        setCoverImageUrl(p.brandProfile?.coverImageUrl ?? "");
        setGallery((p.brandProfile?.gallery ?? []).join("\n"));
        setTags((p.brandProfile?.tags ?? []).join(", "));
        setAmenities((p.brandProfile?.amenities ?? []).join(", "));
        setExternalBookingUrl(p.brandProfile?.externalBookingUrl ?? "");
        setPriceBand(p.brandProfile?.priceBand ?? "");
        setInstagram(p.brandProfile?.socialLinks?.instagram ?? "");
        setFacebook(p.brandProfile?.socialLinks?.facebook ?? "");
        setYoutube(p.brandProfile?.socialLinks?.youtube ?? "");
        setRegistrationNumber(p.registrationNumber ?? "");
        setLicenceNumber(p.licenceNumber ?? "");
        setAuthorityCodes(normalizeAuthorities(p.healthAuthorities).map((a) => a.code));
      })
      .catch(() => {});
  }, [provider]);

  if (!provider) {
    return <EmptyState title="No practice linked" body="Business settings are for provider accounts." />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      const brandProfile: BrandProfile = {
        about,
        contactEmail,
        contactPhone,
        website,
        openingHours,
        coverImageUrl: coverImageUrl || undefined,
        gallery: splitLines(gallery),
        tags: splitList(tags),
        amenities: splitList(amenities),
        externalBookingUrl: externalBookingUrl || undefined,
        priceBand: (priceBand || undefined) as BrandProfile["priceBand"],
        socialLinks: {
          instagram: instagram || undefined,
          facebook: facebook || undefined,
          youtube: youtube || undefined,
        },
      };
      const presetByCode = new Map(HEALTH_AUTHORITY_PRESETS.map((p) => [p.code, p]));
      const healthAuthorities: HealthAuthorityBadge[] = authorityCodes.map((code) => {
        const preset = presetByCode.get(code);
        return {
          code,
          name: preset?.name ?? code,
          region: preset?.region,
          verified: true,
        };
      });
      if (customAuthority.trim()) {
        healthAuthorities.push({
          code: customAuthority.trim().slice(0, 24),
          name: customAuthority.trim(),
          verified: false,
        });
      }
      await api.updateProvider(provider.id, {
        businessName,
        type,
        brandProfile,
        address: { street, city, state, postcode, country },
        registrationNumber: registrationNumber.trim() || null,
        licenceNumber: licenceNumber.trim() || null,
        healthAuthorities,
      });
      await refreshProfile();
      setSaved(true);
    } catch {
      setError("Your business details couldn't be saved right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-forest">About my business</h1>
      <p className="mt-1 text-ink-muted">
        This information shapes your public profile and appears to clients across AyurPass.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            provider.listingTier === "FREE_LISTING"
              ? "bg-clay text-ink-secondary"
              : "bg-forest text-white"
          }`}
        >
          {provider.listingTier === "FREE_LISTING" ? "Free listing" : "Booking enabled"}
        </span>
        <Link
          href={`/providers/${provider.id}`}
          className="text-sm font-medium text-forest hover:underline"
        >
          View public page →
        </Link>
        {provider.listingTier === "FREE_LISTING" && (
          <Link
            href="/dashboard/services"
            className="text-sm font-medium text-forest hover:underline"
          >
            Upgrade to accept bookings →
          </Link>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <section className="ios-group space-y-0 p-0">
          <div className="space-y-4 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-forest">Identity</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name">
                <Input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </Field>
              <Field label="Business type">
                <Select value={type} onChange={(e) => setType(e.target.value as ProviderType)}>
                  {PROVIDER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {PROVIDER_TYPE_LABEL[t]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="About" hint="Tell clients about your philosophy and offering.">
              <Textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="space-y-4 rounded-[1.125rem] border border-[var(--separator)] bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-forest">
              Credentials &amp; health authorities
            </h2>
            <p className="mt-1 text-sm font-medium text-ink-muted">
              Registration and licence numbers, plus local authority approvals (e.g. AAA in Australia).
              These appear on your public profile.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business registration number" hint="Company / clinic registration ID">
              <Input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. ACN or local business ID"
              />
            </Field>
            <Field label="Licence number" hint="Operating or clinical licence where required">
              <Input
                value={licenceNumber}
                onChange={(e) => setLicenceNumber(e.target.value)}
                placeholder="e.g. council / state licence"
              />
            </Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Health authority approvals</p>
            <div className="flex flex-wrap gap-2">
              {HEALTH_AUTHORITY_PRESETS.map((preset) => {
                const active = authorityCodes.includes(preset.code);
                return (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() =>
                      setAuthorityCodes((prev) =>
                        active ? prev.filter((c) => c !== preset.code) : [...prev, preset.code],
                      )
                    }
                    aria-pressed={active}
                    className={`inline-flex min-h-10 items-center rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-[var(--system-blue)] text-white"
                        : "border border-[var(--separator)] bg-[var(--fill-secondary)] text-ink-secondary"
                    }`}
                  >
                    {preset.code}
                    <span className="ml-1.5 text-xs font-medium opacity-80">{preset.region}</span>
                  </button>
                );
              })}
            </div>
            <Field label="Custom authority" hint="Optional — add a body not listed above.">
              <Input
                className="mt-3"
                value={customAuthority}
                onChange={(e) => setCustomAuthority(e.target.value)}
                placeholder="e.g. State Ayurveda Council"
              />
            </Field>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-hairline bg-surface p-6">
          <h2 className="font-display text-lg text-forest">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Public email">
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@practice.com" />
            </Field>
            <Field label="Phone">
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+61 2 0000 0000" />
            </Field>
            <Field label="Website">
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Opening hours">
              <Input value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="Mon–Sat, 8am–7pm" />
            </Field>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-hairline bg-surface p-6">
          <h2 className="font-display text-lg text-forest">Location</h2>
          <Field label="Street">
            <Input value={street} onChange={(e) => setStreet(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label="State / region">
              <Input value={state} onChange={(e) => setState(e.target.value)} />
            </Field>
            <Field label="Postcode">
              <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} />
            </Field>
            <Field label="Country">
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-hairline bg-surface p-6">
          <div>
            <h2 className="font-display text-lg text-forest">Listing &amp; discovery</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Photos, tags and links that make your public listing shine in discovery.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cover image URL">
              <Input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <Field label="Price band">
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
          <Field label="Gallery image URLs" hint="One URL per line.">
            <Textarea
              rows={3}
              value={gallery}
              onChange={(e) => setGallery(e.target.value)}
              placeholder={"https://…\nhttps://…"}
            />
          </Field>
          <Field label="Tags" hint="Comma separated — e.g. Panchakarma, Vegan, Ocean view">
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
          <Field label="Amenities" hint="Comma separated — e.g. Sauna, Parking, Wi-Fi">
            <Input value={amenities} onChange={(e) => setAmenities(e.target.value)} />
          </Field>
          <Field label="External booking link" hint="Where visitors go to book with you directly.">
            <Input
              type="url"
              value={externalBookingUrl}
              onChange={(e) => setExternalBookingUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Instagram">
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Facebook">
              <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="YouTube">
              <Input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://…" />
            </Field>
          </div>
        </section>

        <ErrorNote message={error} />
        <SuccessNote message={saved ? "Business profile saved." : null} />
        <Button type="submit" disabled={busy} className="min-h-11 w-full sm:w-auto">
          {busy ? "Saving…" : "Save business profile"}
        </Button>
      </form>
    </div>
  );
}
