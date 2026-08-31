"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ClinicBillingSubscription, PaymentModeConfig, StripeConnectStatus } from "@/lib/types";
import { Button, EmptyState } from "@/components/ui";
import { CheckIcon, SparkleIcon, ShieldIcon } from "@/components/icons";

function SetupStep({
  done,
  title,
  body,
}: {
  done: boolean;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3 rounded-xl border border-hairline bg-clay/30 px-4 py-3">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done ? "bg-forest text-white" : "border border-hairline bg-surface text-ink-muted"
        }`}
      >
        {done ? <CheckIcon className="h-3.5 w-3.5" /> : "·"}
      </span>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-ink-secondary">{body}</p>
      </div>
    </li>
  );
}

function PaymentsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const [platform, setPlatform] = useState<PaymentModeConfig | null>(null);
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [billing, setBilling] = useState<ClinicBillingSubscription | null>(null);
  const [busy, setBusy] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    api.paymentMode().then(setPlatform).catch(() => setPlatform(null));
    if (!provider) return;
    api
      .stripeConnectStatus(provider.id)
      .then(setStatus)
      .catch(() => setStatus(null));
    api
      .clinicBillingStatus(provider.id)
      .then(setBilling)
      .catch(() => setBilling(null));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return <EmptyState title="No practice linked" body="Payments are managed by provider accounts." />;
  }

  async function startOnboarding() {
    if (!provider) return;
    setBusy(true);
    setError(null);
    try {
      const base = `${window.location.origin}/dashboard/payments`;
      const providerCountry = (provider.address as { country?: string } | null)?.country;
      const result = await api.stripeConnectOnboard(provider.id, {
        returnUrl: `${base}?connected=1`,
        refreshUrl: base,
        country: providerCountry,
      });
      if (result.url) window.location.href = result.url;
      else reload();
    } catch {
      setError("Couldn't start Stripe onboarding — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function startGrowthBilling() {
    if (!provider) return;
    setBillingBusy(true);
    setError(null);
    try {
      const base = `${window.location.origin}/dashboard/payments`;
      const result = await api.clinicBillingCheckout(provider.id, {
        successUrl: `${base}?billing=success`,
        cancelUrl: `${base}?billing=cancelled`,
      });
      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t start Growth checkout — please try again.");
    } finally {
      setBillingBusy(false);
    }
  }

  async function manageBilling() {
    if (!provider) return;
    setBillingBusy(true);
    setError(null);
    try {
      const result = await api.clinicBillingPortal(provider.id, {
        returnUrl: `${window.location.origin}/dashboard/payments`,
      });
      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t open billing management — please try again.");
    } finally {
      setBillingBusy(false);
    }
  }

  const ready = status?.connected && status.chargesEnabled;
  const justConnected = searchParams.get("connected") === "1";
  const billingResult = searchParams.get("billing");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-forest">
          <SparkleIcon className="h-3.5 w-3.5" />
          100% Direct Payouts via Stripe Connect
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-0.5 text-[11px] font-bold text-forest">
          Zero Platform Commission
        </span>
      </div>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
        Sales &amp; Financials
      </p>
      <h1 className="mt-1 font-display text-3xl text-forest">Direct Payments &amp; Payouts</h1>
      <p className="mt-1 max-w-2xl text-ink-muted leading-relaxed">
        Accept online card payments for sessions, packages, and retreats. 100% of client fees land directly in your connected Stripe bank account with automated payout schedules.
      </p>

      {justConnected && (
        <p className="mt-4 rounded-xl border border-forest/20 bg-forest/5 px-4 py-3 text-sm text-forest">
          Welcome back from Stripe — checking your account status…
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-hairline bg-surface p-6">
        <h2 className="font-display text-lg text-forest">Platform setup</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {platform?.mock
            ? "Running in demo mode until Stripe keys are added to backend/.env"
            : "Stripe keys detected — live card payments are enabled"}
        </p>
        <ol className="mt-4 space-y-3">
          <SetupStep
            done={Boolean(platform?.keysConfigured)}
            title="Add Stripe API keys"
            body="Paste sk_test_… and pk_test_… into backend/.env and frontend/.env.local, then restart both servers."
          />
          <SetupStep
            done={Boolean(platform?.webhookConfigured)}
            title="Configure webhooks"
            body="Run npm run stripe:listen, copy whsec_… into STRIPE_WEBHOOK_SECRET, restart backend."
          />
          <SetupStep
            done={Boolean(ready)}
            title="Connect your practice"
            body="Complete Stripe Express onboarding below so you can receive payouts."
          />
        </ol>
        <p className="mt-4 text-xs text-ink-muted">
          Check status anytime: <code className="rounded bg-clay px-1.5 py-0.5">npm run stripe:status</code>
        </p>
      </div>

      <section className="mt-6 rounded-2xl border border-hairline bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
              Clinic subscription
            </p>
            <h2 className="mt-1 font-display text-xl text-forest">Growth — $29/month</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">
              Online bookings, team calendar, rooms, staff roles, client records, and direct-payment tools for multi-practitioner practices.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              billing?.plan === "GROWTH" && ["ACTIVE", "TRIALING", "PAST_DUE"].includes(billing.status)
                ? "bg-forest text-white"
                : "border border-hairline text-ink-secondary"
            }`}
          >
            {billing?.plan === "GROWTH" ? billing.status.replaceAll("_", " ") : "Free"}
          </span>
        </div>

        {billingResult === "success" && (
          <p className="mt-4 rounded-xl border border-forest/20 bg-forest/5 px-4 py-3 text-sm text-forest">
            Checkout completed. We’re confirming your subscription securely with Stripe now.
          </p>
        )}
        {billingResult === "cancelled" && (
          <p className="mt-4 rounded-xl border border-gold/40 bg-gold-soft px-4 py-3 text-sm text-ink-secondary">
            Growth checkout was cancelled. Your practice remains on the current plan.
          </p>
        )}

        {billing?.configured && billing.priceConfigured ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {billing.portalAvailable ? (
              <Button disabled={billingBusy} onClick={manageBilling} variant="soft">
                {billingBusy ? "Opening Stripe…" : "Manage billing"}
              </Button>
            ) : (
              <Button disabled={billingBusy} onClick={startGrowthBilling}>
                {billingBusy ? "Opening Stripe…" : "Start Growth"}
              </Button>
            )}
            {billing.currentPeriodEnd && (
              <p className="text-sm text-ink-muted">
                {billing.cancelAtPeriodEnd ? "Ends" : "Renews"} {new Date(billing.currentPeriodEnd).toLocaleDateString()}.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-gold/40 bg-gold-soft px-4 py-3 text-sm text-ink-secondary">
            Growth billing will appear here after the platform owner configures the Stripe Price ID and live billing settings.
          </p>
        )}
      </section>

      <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-forest">
              <ShieldIcon className="h-5.5 w-5.5" />
            </span>
            <div>
              <p className="font-medium text-foreground">
                Your Stripe account {status?.country ? `(${status.country})` : ""}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                {ready
                  ? "Ready to accept payments."
                  : "Connect to start receiving card payments."}
              </p>
              {status?.accountId && (
                <p className="mt-1.5 font-mono text-xs text-ink-muted">{status.accountId}</p>
              )}
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              ready ? "bg-forest text-white" : "border border-hairline text-ink-secondary"
            }`}
          >
            {ready ? "Active" : "Not connected"}
          </span>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-xl bg-clay/50 px-4 py-3">
            <dt className="text-ink-muted">Country</dt>
            <dd className="font-medium text-forest">{status?.country ?? "AU"}</dd>
          </div>
          <div className="rounded-xl bg-clay/50 px-4 py-3">
            <dt className="text-ink-muted">Charges</dt>
            <dd className="font-medium text-forest">{status?.chargesEnabled ? "Enabled" : "Pending"}</dd>
          </div>
          <div className="rounded-xl bg-clay/50 px-4 py-3">
            <dt className="text-ink-muted">Payouts</dt>
            <dd className="font-medium text-forest">{status?.payoutsEnabled ? "Enabled" : "Pending"}</dd>
          </div>
          <div className="rounded-xl bg-clay/50 px-4 py-3">
            <dt className="text-ink-muted">Details</dt>
            <dd className="font-medium text-forest">{status?.detailsSubmitted ? "Submitted" : "Incomplete"}</dd>
          </div>
        </dl>

        {!ready && (
          <Button className="mt-6" disabled={busy} onClick={startOnboarding}>
            {busy ? "Opening Stripe…" : status?.accountId ? "Continue Stripe setup" : "Connect with Stripe"}
          </Button>
        )}

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={
      <div className="h-48 animate-pulse rounded-2xl bg-clay/60" aria-hidden />
    }>
      <PaymentsContent />
    </Suspense>
  );
}