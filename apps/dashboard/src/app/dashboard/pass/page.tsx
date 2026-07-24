"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { EVENT_CATEGORY_LABEL } from "@/lib/catalog";
import { Button, EmptyState, ErrorNote } from "@/components/ui";

type PassBundle = Awaited<ReturnType<typeof api.myWellnessPass>>;

export default function WellnessPassPage() {
  const [pass, setPass] = useState<PassBundle | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api
      .myWellnessPass()
      .then(setPass)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load pass.");
        setPass(null);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (pass === undefined) {
    return <p className="text-sm text-ink-muted">Loading your Wellness Pass…</p>;
  }

  if (!pass) {
    return (
      <EmptyState
        title="Pass unavailable"
        body={error || "Sign in as a wellness seeker to issue your permanent pass."}
        action={
          <Button type="button" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  const qr = pass.qrPayload || pass.wallet?.qrPayload;
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qr)}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest">Wellness Pass</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Your permanent AyurPass identity. Appointments and event tickets stay linked here —
          present the QR at the door or desk.
        </p>
      </div>

      <ErrorNote message={error} />

      {/* Digital pass card */}
      <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-forest via-forest-deep to-leaf p-6 text-white shadow-[0_16px_40px_rgba(30,50,40,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-soft">
              AyurPass · Permanent
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {pass.holderName || "Wellness Member"}
            </p>
            <p className="mt-1 font-mono text-sm tracking-wider text-white/80">
              {pass.serialNumber}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-2 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrImg} alt="Pass QR code" width={120} height={120} className="rounded-lg" />
          </div>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-white/75">
          Scan this code at wellness events and appointment centres. Providers only see what’s needed
          for check-in — your full health profile stays private.
        </p>
      </div>

      {/* Wallet CTAs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-hairline bg-surface p-4">
          <p className="text-sm font-bold text-forest">Apple Wallet</p>
          <p className="mt-1 text-xs text-ink-muted">
            {pass.wallet?.apple?.note ||
              "Pass payload ready. Device install requires Apple Pass Type ID certificates."}
          </p>
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([JSON.stringify(pass.wallet?.apple?.passJson, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `ayurpass-${pass.serialNumber}.pass.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="mt-3 inline-flex min-h-9 items-center rounded-full bg-black px-4 text-xs font-bold text-white"
          >
            Download pass data
          </button>
        </div>
        <div className="rounded-2xl border border-hairline bg-surface p-4">
          <p className="text-sm font-bold text-forest">Google Wallet</p>
          <p className="mt-1 text-xs text-ink-muted">
            {pass.wallet?.google?.note ||
              "Object ready. Configure Google Wallet issuer for one-tap Save."}
          </p>
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([JSON.stringify(pass.wallet?.google?.object, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `ayurpass-google-${pass.serialNumber}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="mt-3 inline-flex min-h-9 items-center rounded-full border border-hairline bg-surface px-4 text-xs font-bold text-forest"
          >
            Download object data
          </button>
        </div>
      </div>

      {/* Linked entitlements */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
          Linked appointments
        </h2>
        {(pass.entitlements?.upcomingBookings?.length ?? 0) === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">
            No upcoming sessions.{" "}
            <Link href="/explore" className="font-semibold text-[var(--system-blue)]">
              Book a session
            </Link>
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {pass.entitlements.upcomingBookings.map((b) => (
              <li
                key={b.id}
                className="rounded-xl border border-hairline bg-surface px-3 py-2.5 text-sm"
              >
                <p className="font-semibold text-forest">
                  {(b as { service?: { name?: string } }).service?.name ?? "Session"}
                </p>
                <p className="text-xs text-ink-muted">
                  {new Date(b.startTime).toLocaleString()} ·{" "}
                  {(b as { provider?: { businessName?: string } }).provider?.businessName}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Event tickets</h2>
        {(pass.entitlements?.upcomingTickets?.length ?? 0) === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">
            No upcoming events.{" "}
            <Link href="/events" className="font-semibold text-[var(--system-blue)]">
              Browse events
            </Link>
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {pass.entitlements.upcomingTickets.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-hairline bg-surface px-3 py-2.5 text-sm"
              >
                <p className="font-semibold text-forest">{t.event?.title ?? "Event"}</p>
                <p className="text-xs text-ink-muted">
                  {t.event?.startTime
                    ? new Date(t.event.startTime).toLocaleString()
                    : ""}
                  {t.event?.category
                    ? ` · ${EVENT_CATEGORY_LABEL[t.event.category] ?? t.event.category}`
                    : ""}
                  {" · "}
                  {t.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-[11px] text-ink-muted">
        Status: {pass.status} · Token ends …{pass.publicToken?.slice(-6)}
      </p>
    </div>
  );
}
