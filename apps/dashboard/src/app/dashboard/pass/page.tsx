"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { EVENT_CATEGORY_LABEL } from "@/lib/catalog";
import { useAuth } from "@/context/AuthContext";
import { Button, EmptyState, ErrorNote } from "@/components/ui";
import { loginUrl } from "@/lib/auth-redirect";
import {
  CalendarIcon,
  CheckIcon,
  CompassIcon,
  LeafIcon,
  LotusIcon,
  ShieldIcon,
  SparkleIcon,
} from "@/components/icons";

type PassBundle = Awaited<ReturnType<typeof api.myWellnessPass>>;

export default function WellnessPassPage() {
  const { user, loading: authLoading } = useAuth();
  const [pass, setPass] = useState<PassBundle | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"pass" | "bookings" | "tickets">("pass");

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      await api.issueWellnessPass().catch(() => null);
      const p = await api.myWellnessPass();
      setPass(p);
    } catch (err) {
      setPass(null);
      const msg = err instanceof Error ? err.message : "Could not load pass.";
      if (msg.includes("P2022") || msg.toLowerCase().includes("column")) {
        setError(
          "Pass database records are synchronizing. Please retry in a moment.",
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
      queueMicrotask(() => setPass(null));
      return;
    }
    queueMicrotask(() => {
      void load();
    });
  }, [user, authLoading, load]);

  if (authLoading || (user && pass === undefined)) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-clay/70" />
        <div className="h-64 animate-pulse rounded-3xl bg-clay/60" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 animate-pulse rounded-2xl bg-clay/50" />
          <div className="h-20 animate-pulse rounded-2xl bg-clay/50" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="Sign in for your AyurPass"
        body="Your permanent digital pass links treatments, verified Prakriti energy profile, and sanctuary check-ins."
        action={
          <Link
            href={loginUrl("/dashboard/pass")}
            className="inline-flex min-h-11 items-center rounded-full bg-forest px-6 text-sm font-semibold text-white shadow-md hover:bg-forest-deep"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  if (!pass) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <EmptyState
          title="Pass unavailable"
          body={error || "We couldn't initialize your permanent AyurPass."}
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

  const qr = pass.qrPayload || pass.wallet?.qrPayload || `AYPASS:${pass.serialNumber}:${pass.publicToken}`;
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(qr)}`;
  const barcodeImg = `https://barcodeapi.org/api/code128/${encodeURIComponent(pass.serialNumber)}`;

  const memberName = pass.holderName || user.fullName || "Wellness Member";
  const primaryDosha = (pass as { primaryDosha?: string }).primaryDosha || "Tridoshic Balanced";
  const tier = (pass as { tier?: string }).tier || "Founding Member";
  const memberSince = (pass as { memberSince?: string | Date }).memberSince
    ? new Date((pass as { memberSince?: string | Date }).memberSince!).toLocaleDateString("en-AU", {
        month: "short",
        year: "numeric",
      })
    : "2026";

  function copyCode() {
    navigator.clipboard.writeText(pass!.serialNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1 text-[11px] font-bold text-forest">
            <SparkleIcon className="h-3 w-3 text-gold-dark" />
            <span>Digital Identity Card</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-forest">AyurPass Wellness Card</h1>
          <p className="text-xs text-ink-muted">
            Your permanent credential for seamless sanctuary arrivals, Prakriti sync, and check-ins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => void load()}
            disabled={busy}
            className="text-xs"
          >
            Refresh
          </Button>
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-forest px-4 text-xs font-bold text-white shadow-sm hover:bg-forest-deep"
          >
            <CompassIcon className="h-4 w-4" />
            <span>Present QR</span>
          </button>
        </div>
      </div>

      <ErrorNote message={error} />

      {/* 3D Interactive Flip Pass Card */}
      <div className="perspective-1000 relative">
        <div
          className={`relative min-h-[340px] w-full cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* FRONT OF PASS */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#063b33] via-[#0b5345] to-[#128c7e] p-7 text-white shadow-[0_20px_50px_rgba(7,94,84,0.4)] [backface-visibility:hidden] border border-white/20">
            {/* Shimmer Pattern & Crest */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <LotusIcon className="h-6 w-6 text-[#d4f419]" />
                </div>
                <div>
                  <span className="font-display text-lg font-bold tracking-tight">AyurPass</span>
                  <span className="ml-2 rounded-md bg-[#d4f419]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#d4f419]">
                    {tier}
                  </span>
                </div>
              </div>

              {/* Contactless / NFC waves */}
              <div className="flex items-center gap-2 opacity-85">
                <svg className="h-6 w-6 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" strokeLinecap="round" />
                  <path d="M12 19a8.5 8.5 0 0 0 0-14" strokeLinecap="round" />
                  <path d="M15.5 21.5a12 12 0 0 0 0-19" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Smart EMV Gold Foil Chip */}
            <div className="mt-6 flex items-center justify-between">
              <div className="h-9 w-12 rounded-lg bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-200 p-1 shadow-inner border border-amber-400/40">
                <div className="h-full w-full rounded border border-amber-600/40 bg-amber-200/50" />
              </div>
              <div className="rounded-full bg-emerald-950/40 px-3 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{pass.status === "ACTIVE" ? "Active Sanctuary Pass" : pass.status}</span>
              </div>
            </div>

            {/* Member Details */}
            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Cardholder</p>
              <p className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                {memberName}
              </p>
            </div>

            {/* Bottom Bar: Serial, Dosha, Mini QR */}
            <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Pass Serial</p>
                <p className="font-mono text-base font-bold tracking-wider text-[#d4f419]">
                  {pass.serialNumber}
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/90">
                  <LeafIcon className="h-3 w-3 text-[#d4f419]" />
                  <span>{primaryDosha}</span>
                </div>
              </div>

              {/* Mini QR thumbnail (clickable) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setQrModalOpen(true);
                }}
                className="group relative rounded-xl bg-white p-1.5 shadow-md transition-transform hover:scale-105"
                title="Tap to enlarge QR"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrImg} alt="Pass QR" width={56} height={56} className="rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-[9px] font-bold text-white">Zoom</span>
                </div>
              </div>
            </div>

            {/* Flip hint */}
            <p className="mt-3 text-center text-[10px] font-medium text-white/60">
              Tap card to view security barcode &amp; clinical guidelines ↺
            </p>
          </div>

          {/* BACK OF PASS */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#021f1b] via-[#073029] to-[#0a4439] p-7 text-white shadow-[0_20px_50px_rgba(7,94,84,0.4)] [transform:rotateY(180deg)] [backface-visibility:hidden] border border-white/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="h-4 w-4 text-[#d4f419]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Verified Sanctuary Pass
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/60">Member since {memberSince}</span>
              </div>

              {/* Barcode Strip */}
              <div className="mt-4 rounded-xl bg-white p-3 text-center shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={barcodeImg}
                  alt="Pass Barcode"
                  className="mx-auto h-12 max-w-full object-contain"
                />
                <p className="mt-1 font-mono text-[11px] font-bold text-black tracking-widest">
                  {pass.serialNumber}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-xs text-white/80">
                <p className="leading-relaxed">
                  • <strong>Desk Protocol:</strong> Scan upon arrival at any partner clinic, retreat, or studio to check in without paperwork.
                </p>
                <p className="leading-relaxed">
                  • <strong>Privacy Vault:</strong> Your health records and consultation notes remain encrypted and are accessible exclusively to your authorized practitioner.
                </p>
              </div>
            </div>

            <div className="border-t border-white/15 pt-3 text-center">
              <p className="text-[10px] text-white/60">
                Authorized AyurPass Network Identity • Concierge: concierge@ayurpass.com
              </p>
              <p className="mt-1 text-[10px] font-semibold text-[#d4f419]">
                Tap anywhere to flip back ↺
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Present QR */}
        <button
          type="button"
          onClick={() => setQrModalOpen(true)}
          className="flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface p-3.5 text-center transition-all hover:border-forest hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 text-forest">
            <CompassIcon className="h-5 w-5" />
          </div>
          <span className="mt-2 text-xs font-bold text-forest">Check-in QR</span>
          <span className="text-[10px] text-ink-muted">Tap to scan</span>
        </button>

        {/* Copy Serial */}
        <button
          type="button"
          onClick={copyCode}
          className="flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface p-3.5 text-center transition-all hover:border-forest hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/20 text-gold-dark">
            {copied ? <CheckIcon className="h-5 w-5 text-emerald-600" /> : <SparkleIcon className="h-5 w-5" />}
          </div>
          <span className="mt-2 text-xs font-bold text-forest">
            {copied ? "Copied!" : "Quick Code"}
          </span>
          <span className="text-[10px] font-mono text-ink-muted">{pass.serialNumber}</span>
        </button>

        {/* Apple Wallet */}
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
          className="flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface p-3.5 text-center transition-all hover:border-black hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
            <svg className="h-5 w-5 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.77-8-12.24-14.75-6.3-9.53-11.21-20.44-14.73-32.74-3.52-12.3-5.28-24.16-5.28-35.58 0-14.54 3.73-26.69 11.19-36.45 7.46-9.76 16.9-14.74 28.32-14.95 4.57 0 9.77 1.25 15.6 3.76 5.82 2.5 9.73 3.86 11.72 4.07 2.44-.32 6.5-1.77 12.18-4.34 5.68-2.58 10.63-3.76 14.86-3.55 11.27.65 20.44 4.8 27.52 12.44-9.84 5.98-14.67 14.18-14.48 24.6.21 8.26 3.48 15.19 9.8 20.79 6.32 5.61 13.9 8.92 22.75 9.94-2.12 6.31-4.78 12.83-7.98 19.57zM119.22 33.64c0-7.39 2.66-14.12 7.98-20.19 5.32-6.07 11.96-9.82 19.92-11.25.32 1.4.48 2.69.48 3.87 0 7.39-2.77 14.28-8.31 20.67-5.54 6.39-12.23 10.09-20.07 11.09z" />
            </svg>
          </div>
          <span className="mt-2 text-xs font-bold text-forest">Apple Wallet</span>
          <span className="text-[10px] text-ink-muted">Add to Pass</span>
        </button>

        {/* Google Wallet */}
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
          className="flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface p-3.5 text-center transition-all hover:border-blue-600 hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <span className="mt-2 text-xs font-bold text-forest">Google Wallet</span>
          <span className="text-[10px] text-ink-muted">Save Pass</span>
        </button>
      </div>

      {/* Member Privileges Strip */}
      <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          AyurPass Member Privileges
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest">
              <CheckIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest">Desk Contactless Check-in</p>
              <p className="text-[11px] text-ink-muted">Present your QR to bypass paper intake forms.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest">
              <LeafIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest">Prakriti Sync</p>
              <p className="text-[11px] text-ink-muted">Constitutional sensitivities shared safely with clinicians.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest">
              <ShieldIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest">Encrypted Treatment Dossier</p>
              <p className="text-[11px] text-ink-muted">Clinical SOAP notes protected under strict Australian privacy.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest">
              <LotusIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-forest">Sanctuary Reserve Access</p>
              <p className="text-[11px] text-ink-muted">Priority slots at verified retreats, spas, and clinics.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Bookings & Event Tickets */}
      <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-xs">
        <div className="flex border-b border-hairline pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("pass")}
            className={`mr-4 pb-1 text-xs font-bold transition-colors ${
              activeTab === "pass" ? "border-b-2 border-forest text-forest" : "text-ink-muted hover:text-forest"
            }`}
          >
            Pass Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`mr-4 pb-1 text-xs font-bold transition-colors ${
              activeTab === "bookings" ? "border-b-2 border-forest text-forest" : "text-ink-muted hover:text-forest"
            }`}
          >
            Linked Sessions ({(pass.entitlements?.upcomingBookings?.length ?? 0)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`pb-1 text-xs font-bold transition-colors ${
              activeTab === "tickets" ? "border-b-2 border-forest text-forest" : "text-ink-muted hover:text-forest"
            }`}
          >
            Event Passes ({(pass.entitlements?.upcomingTickets?.length ?? 0)})
          </button>
        </div>

        {activeTab === "pass" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">Membership Status:</span>
              <span className="font-semibold text-forest">Active · Permanent</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">Registered Cardholder:</span>
              <span className="font-semibold text-forest">{memberName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">Primary Energy Constitution:</span>
              <span className="font-semibold text-forest">{primaryDosha}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">Security Verification Token:</span>
              <span className="font-mono text-[11px] text-ink-muted">{pass.publicToken.slice(0, 12)}…</span>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                href="/explore"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-forest/10 px-4 text-xs font-bold text-forest hover:bg-forest/20"
              >
                <CompassIcon className="h-3.5 w-3.5" />
                <span>Book Next Treatment</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="mt-4">
            {(pass.entitlements?.upcomingBookings?.length ?? 0) === 0 ? (
              <div className="py-6 text-center">
                <CalendarIcon className="mx-auto h-8 w-8 text-ink-muted/40" />
                <p className="mt-2 text-sm font-semibold text-forest">No upcoming appointments</p>
                <p className="text-xs text-ink-muted">Your scheduled sessions automatically sync here.</p>
                <Link
                  href="/explore"
                  className="mt-3 inline-flex min-h-9 items-center rounded-full bg-forest px-4 text-xs font-bold text-white hover:bg-forest-deep"
                >
                  Explore Sanctuaries
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pass.entitlements.upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-xl border border-hairline bg-surface/50 p-3.5"
                  >
                    <div>
                      <p className="text-xs font-bold text-forest">
                        {(b as { service?: { name?: string } }).service?.name ?? "Ayurvedic Treatment"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        {new Date(b.startTime).toLocaleString("en-AU", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}
                        · {(b as { provider?: { businessName?: string } }).provider?.businessName}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                      Linked
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="mt-4">
            {(pass.entitlements?.upcomingTickets?.length ?? 0) === 0 ? (
              <div className="py-6 text-center">
                <LotusIcon className="mx-auto h-8 w-8 text-ink-muted/40" />
                <p className="mt-2 text-sm font-semibold text-forest">No upcoming event tickets</p>
                <p className="text-xs text-ink-muted">Group workshops and wellness retreats will appear here.</p>
                <Link
                  href="/events"
                  className="mt-3 inline-flex min-h-9 items-center rounded-full bg-forest px-4 text-xs font-bold text-white hover:bg-forest-deep"
                >
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pass.entitlements.upcomingTickets.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-hairline bg-surface/50 p-3.5"
                  >
                    <div>
                      <p className="text-xs font-bold text-forest">{t.event?.title ?? "Wellness Event"}</p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        {t.event?.startTime ? new Date(t.event.startTime).toLocaleDateString() : ""} ·{" "}
                        {t.event?.category ? EVENT_CATEGORY_LABEL[t.event.category] ?? t.event.category : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULLSCREEN HIGH-CONTRAST QR MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-[2rem] bg-white p-7 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              ✕
            </button>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1 text-[11px] font-bold text-forest">
              <LotusIcon className="h-3.5 w-3.5 text-[#128c7e]" />
              <span>AyurPass Check-in</span>
            </div>

            <h3 className="mt-2 font-display text-xl font-bold text-gray-900">{memberName}</h3>
            <p className="text-xs text-gray-500">
              Present this high-contrast code to the receptionist or scanner at your appointment.
            </p>

            {/* High-res QR Display */}
            <div className="my-5 rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-sm inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImg} alt="Pass QR Code" width={220} height={220} className="mx-auto" />
            </div>

            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Verbal Pass Code</p>
              <p className="mt-0.5 font-mono text-lg font-bold tracking-widest text-[#075e54]">
                {pass.serialNumber}
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="soft"
                className="w-full"
                onClick={copyCode}
              >
                {copied ? "Copied!" : "Copy Code"}
              </Button>
              <Button
                type="button"
                className="w-full bg-[#128c7e] hover:bg-[#075e54] text-white"
                onClick={() => setQrModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
