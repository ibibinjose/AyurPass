"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { HealthAuthorityBadge } from "@/lib/types";
import { HEALTH_AUTHORITY_PRESETS, normalizeAuthorities } from "@/lib/credentials";
import { Button, ErrorNote, Field, Input, PageHeader, SuccessNote } from "@/components/ui";

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const professional = user?.professional ?? null;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [authorityCodes, setAuthorityCodes] = useState<string[]>([]);
  const [customAuthority, setCustomAuthority] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (!professional?.id) return;
    api
      .publicProfessionalsByProvider(professional.providerId)
      .then((list) => {
        const me = list.find((p) => p.id === professional.id) ?? professional;
        setTitle(me.title ?? "");
        setRegistrationNumber(me.registrationNumber ?? "");
        setLicenceNumber(me.licenceNumber ?? "");
        setAuthorityCodes(normalizeAuthorities(me.healthAuthorities).map((a) => a.code));
      })
      .catch(() => {
        setTitle(professional.title ?? "");
        setRegistrationNumber(professional.registrationNumber ?? "");
        setLicenceNumber(professional.licenceNumber ?? "");
        setAuthorityCodes(normalizeAuthorities(professional.healthAuthorities).map((a) => a.code));
      });
  }, [professional]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      await api.updateUser(user.id, { fullName, phone: phone || undefined });
      if (professional?.id) {
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
        await api.updateProfessional(professional.id, {
          title: title.trim() || undefined,
          registrationNumber: registrationNumber.trim() || null,
          licenceNumber: licenceNumber.trim() || null,
          healthAuthorities,
        });
      }
      await refreshProfile();
      setSaved(true);
    } catch {
      setError("Your details couldn't be saved right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="Settings" description="Your account details and professional credentials." />

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <section className="space-y-4 rounded-[1.125rem] border border-[var(--separator)] bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
          <h2 className="font-display text-lg font-semibold text-forest">Account</h2>
          <Field
            label="Email"
            hint="Email cannot be changed here. Contact support if you need a new address."
          >
            <Input value={user?.email ?? ""} disabled className="opacity-60" />
          </Field>
          <Field label="Full name">
            <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Phone" hint="Optional — used for booking reminders.">
            <Input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+61 400 000 000"
            />
          </Field>
        </section>

        {professional ? (
          <section className="space-y-4 rounded-[1.125rem] border border-[var(--separator)] bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-forest">
                Practitioner credentials
              </h2>
              <p className="mt-1 text-sm font-medium text-ink-muted">
                Registration, licence and local health-authority marks (e.g. AAA) show next to your
                name on public profiles.
              </p>
            </div>
            <Field label="Professional title">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ayurvedic practitioner"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Registration number">
                <Input
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="Association / board ID"
                />
              </Field>
              <Field label="Licence number">
                <Input
                  value={licenceNumber}
                  onChange={(e) => setLicenceNumber(e.target.value)}
                  placeholder="Clinical / practice licence"
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
              <Field label="Custom authority" hint="Optional">
                <Input
                  className="mt-3"
                  value={customAuthority}
                  onChange={(e) => setCustomAuthority(e.target.value)}
                  placeholder="Other board or association"
                />
              </Field>
            </div>
          </section>
        ) : null}

        <ErrorNote message={error} />
        <SuccessNote message={saved ? "Your details were saved." : null} />
        <Button type="submit" disabled={busy} className="min-h-11 w-full sm:w-auto">
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </form>

      {user?.role === "CONSUMER" ? (
        <p className="mt-6 text-sm font-medium text-ink-muted">
          Manage who can see your health data in{" "}
          <Link href="/dashboard/permissions" className="font-semibold text-forest hover:underline">
            Privacy & permissions
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
