"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { ProviderType } from "@/lib/types";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";

const PROVIDER_TYPES = Object.keys(PROVIDER_TYPE_LABEL) as ProviderType[];

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
      await api.updateProvider(provider.id, {
        businessName,
        type,
        brandProfile: { about, contactEmail, contactPhone, website, openingHours },
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
