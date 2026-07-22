"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { stripePublishableKey } from "@/lib/stripe";
import { Button, ErrorNote } from "./ui";

function StripeCardForm({
  amountLabel,
  onSuccess,
  onError,
  disabled,
}: {
  amountLabel: string;
  onSuccess: () => Promise<void>;
  onError: (message: string | null) => void;
  disabled?: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!stripe || !elements) return;
    setBusy(true);
    onError(null);
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    if (result.error) {
      onError(result.error.message ?? "Payment failed");
      setBusy(false);
      return;
    }
    try {
      await onSuccess();
    } catch {
      onError("Payment succeeded but confirmation failed — contact support if charged.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      <Button className="w-full" disabled={disabled || busy || !stripe} onClick={pay}>
        {busy ? "Processing…" : `Pay ${amountLabel}`}
      </Button>
    </div>
  );
}

export function PayWithStripe({
  mock,
  clientSecret,
  publishableKey,
  amountLabel,
  busy,
  error,
  onMockPay,
  onStripeSuccess,
  onError,
}: {
  mock: boolean;
  clientSecret?: string;
  publishableKey?: string | null;
  amountLabel: string;
  busy: boolean;
  error: string | null;
  onMockPay: () => Promise<void>;
  onStripeSuccess: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const resolvedKey = publishableKey ?? stripePublishableKey();
  const stripePromise = useMemo(
    () => (resolvedKey ? loadStripe(resolvedKey) : null),
    [resolvedKey],
  );

  if (mock) {
    return (
      <div className="rounded-2xl border border-hairline bg-clay/40 p-4">
        <Button className="w-full" disabled={busy} onClick={onMockPay}>
          {busy ? "Processing…" : `Pay ${amountLabel} (test mode)`}
        </Button>
        <p className="mt-2 text-xs text-ink-muted">Test mode — no real card is charged.</p>
        <ErrorNote message={error} />
      </div>
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <ErrorNote message="Card payments are unavailable — the provider may still be setting up Stripe." />
    );
  }

  return (
    <div className="rounded-2xl border border-hairline bg-clay/40 p-4">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripeCardForm
          amountLabel={amountLabel}
          onSuccess={onStripeSuccess}
          onError={onError}
          disabled={busy}
        />
      </Elements>
      <ErrorNote message={error} />
    </div>
  );
}