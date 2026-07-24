"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { EVENT_CATEGORY_LABEL } from "@/lib/catalog";
import { useAuth } from "@/context/AuthContext";
import { Button, EmptyState, ErrorNote } from "@/components/ui";
import { loginUrl } from "@/lib/auth-redirect";

type PassBundle = Awaited<ReturnType<typeof api.myWellnessPass>>;

export default function WellnessPassPage() {
  const { user, loading: authLoading } = useAuth();
  const [pass, setPass] = useState<PassBundle | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      // Issue is idempotent — ensures Consumer + Pass rows exist
      await api.issueWellnessPass().catch(() => null);
      const p = await api.myWellnessPass();
      setPass(p);
    } catch (err) {
      setPass(null);
      const msg = err instanceof Error ? err.message : "Could not load pass.";
      // Friendlier P2022 / migration messaging
      if (msg.includes("P2022") || msg.toLowerCase().includes("column")) {
        setError(
          "Pass tables are still updating on the server. Wait a minute and retry — or contact support if this persists.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPass(null);
      return;
    }
    void load();
  }, [user, authLoading, load]);

  if (authLoading || (user && pass === undefined)) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-clay/70" />
        <div className="h-56 animate-pulse rounded-3xl bg-clay/60" />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="Sign in for your Wellness Pass"
        body="Your permanent pass links appointments and event tickets for easy venue check-in."
        action={
          <Link
            href={loginUrl("/dashboard/pass")}
            className="inline-flex min-h-10 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  if (!pass) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Pass unavailable"
          body={error || "We couldn't load your permanent Wellness Pass."}
          action={
            <Button type="button" onClick={() => void load()} disabled={busy}>
              {busy ? "Retrying…" : "Retry"}
            </Button>
          }
        />
        <ErrorNote message={error} />
      </div>
    );
  }

  const qr = pass.qrPayload || pass.wallet?.qrPayload || "";
  const qrImg = qr
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(qr)}`
    : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest">Wellness Pass</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Permanent identity for appointments and events. Present the QR at the door or desk.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={() => void load()} disabled={busy}>
          Refresh
        </Button>
      </div>

      <ErrorNote message={error} />

      <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-forest via-forest-deep to-leaf p-6 text-white shadow-[0_16px_40px_rgba(30,50,40,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-soft">
              AyurPass · Permanent
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {pass.holderName || user.fullName || "Wellness Member"}
            </p>
            <p className="mt-1 font-mono text-sm tracking-wider text-white/80">
              {pass.serialNumber}
            </p>
          </div>
          {qrImg ? (
            <div className="rounded-2xl bg-white p-2 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImg} alt="Pass QR code" width={120} height={120} className="rounded-lg" />
            </div>
          ) : null}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-white/75">
          Scan at wellness events and appointment centres. Your health profile stays private —
          staff only see check-in details for this venue.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-hairline bg-surface p-4">
          <p className="text-sm font-bold text-forest">Apple Wallet</p>
          <p className="mt-1 text-xs text-ink-muted">
            {pass.wallet?.apple?.note || "Pass payload ready for signing."}
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
            {pass.wallet?.google?.note || "Object ready for issuer configuration."}
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
        Status: {pass.status} · {pass.serialNumber}
      </p>
    </div>
  );
}
