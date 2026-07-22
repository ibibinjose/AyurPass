"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import type { GiftCard } from "@/lib/types";
import { DashHeader } from "@/components/dashboard/DashboardKit";
import { LotusIcon, PlusIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Textarea } from "@/components/ui";

const AMOUNTS = [25, 50, 100, 200];

const STATUS_STYLE: Record<string, string> = {
  active: "bg-white/20 text-white",
  depleted: "bg-clay text-ink-secondary",
  void: "bg-red-50 text-red-700",
};

export default function GiftCardsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<GiftCard[] | null>(null);
  const [buying, setBuying] = useState(false);
  const [amount, setAmount] = useState(50);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!user) return;
    api
      .myGiftCards()
      .then(setCards)
      .catch(() => setCards([]));
  }, [user]);

  useEffect(reload, [reload]);

  if (user && user.role !== "CONSUMER") {
    return (
      <EmptyState
        title="Gift cards are for wellness seekers"
        body="Buy a gift card from a wellness-seeker account."
      />
    );
  }

  async function purchase(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.purchaseGiftCard({
        amount,
        recipientEmail: recipientEmail || undefined,
        message: message || undefined,
      });
      setBuying(false);
      setRecipientEmail("");
      setMessage("");
      reload();
    } catch {
      setError("The gift card couldn't be purchased right now.");
    } finally {
      setBusy(false);
    }
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const activeBalance =
    cards
      ?.filter((c) => c.status === "active")
      .reduce((acc, c) => acc + Number(c.balance || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="My wellness"
        title="Gift cards"
        description="Give the gift of wellness — codes redeem at checkout on bookings and shop orders."
        action={
          !buying ? (
            <Button onClick={() => setBuying(true)}>
              <PlusIcon className="h-4 w-4" />
              Buy a gift card
            </Button>
          ) : undefined
        }
      />

      {activeBalance > 0 ? (
        <div className="rounded-2xl border border-hairline bg-surface px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            Active balance
          </p>
          <p className="mt-1 font-display text-2xl text-forest">{formatMoney(activeBalance)}</p>
        </div>
      ) : null}

      {buying ? (
        <form
          onSubmit={purchase}
          className="space-y-4 rounded-2xl border border-hairline bg-surface p-6"
        >
          <h2 className="font-display text-xl text-forest">Buy a gift card</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Amount</label>
            <div className="flex flex-wrap gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    amount === a
                      ? "bg-forest text-white"
                      : "border border-hairline bg-surface text-ink-secondary hover:border-leaf"
                  }`}
                >
                  {formatMoney(a)}
                </button>
              ))}
              <input
                type="number"
                min={10}
                max={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-24 rounded-full border border-hairline bg-surface px-3 py-2 text-sm text-foreground focus:border-leaf focus:outline-none"
                aria-label="Custom amount"
              />
            </div>
          </div>
          <Field label="Recipient email" hint="Optional — who is it for?">
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="friend@example.com"
            />
          </Field>
          <Field label="Message" hint="Optional">
            <Textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Wishing you rest and balance."
            />
          </Field>
          <ErrorNote message={error} />
          <div className="flex gap-3">
            <Button type="submit" disabled={busy || amount < 10}>
              {busy ? "Purchasing…" : `Buy ${formatMoney(amount)} gift card`}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setBuying(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <div>
        {cards === null ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : cards.length === 0 && !buying ? (
          <EmptyState
            title="No gift cards yet"
            body="Buy a gift card for yourself or someone else — the code can be redeemed at checkout on any booking or order."
            action={
              <Button onClick={() => setBuying(true)}>
                <PlusIcon className="h-4 w-4" />
                Buy a gift card
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="overflow-hidden rounded-2xl border border-hairline bg-gradient-to-br from-forest to-forest-deep p-6 text-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                      <LotusIcon className="h-4.5 w-4.5" />
                    </span>
                    <span className="font-display text-lg">AyurPass</span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      STATUS_STYLE[card.status] ?? STATUS_STYLE.active
                    }`}
                  >
                    {card.status}
                  </span>
                </div>

                <p className="mt-6 text-3xl font-semibold">{formatMoney(card.balance)}</p>
                <p className="text-xs text-white/60">
                  of {formatMoney(card.initialBalance)} · purchased{" "}
                  {new Date(card.createdAt).toLocaleDateString()}
                </p>

                <button
                  type="button"
                  onClick={() => void copy(card.code)}
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-left font-mono text-sm tracking-wide hover:bg-white/15"
                  title="Copy code"
                >
                  <span>{card.code}</span>
                  <span className="text-xs font-sans text-white/70">
                    {copied === card.code ? "Copied!" : "Copy"}
                  </span>
                </button>
                {card.recipientEmail ? (
                  <p className="mt-2 text-xs text-white/60">For {card.recipientEmail}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
