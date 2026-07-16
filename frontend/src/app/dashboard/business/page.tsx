"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { BrandProfile, ProviderType } from "@/lib/types";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";

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
      await api.updateProvider(provider.id, {
        businessName,
        type,
        brandProfile,
        address: { street, city, state, postcode, country },
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
        <section className="space-y-4 rounded-2xl border border-hairline bg-surface p-6">
          <h2 className="font-display text-lg text-forest">Identity</h2>
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
        {saved && (
          <p className="rounded-xl border border-hairline bg-clay/60 px-3.5 py-2.5 text-sm text-forest">
            Business profile saved.
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save business profile"}
        </Button>
      </form>
    </div>
  );
}
