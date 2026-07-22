"use client";

import { useEffect, useState } from "react";
import { api, formatMoney } from "@/lib/api";
import type { LoyaltySummary } from "@/lib/types";

export interface Redemption {
  giftCardCode?: string;
  redeemPoints?: number;
  /** Dollar value the applied rewards will cover — for display only. */
  discount: number;
}

/**
 * Lets a buyer apply a gift card and/or loyalty points to a purchase.
 * Reports the chosen redemption and running discount up to the parent so the
 * pay button can charge the remainder.
 */
export function RedeemPanel({
  amountDue,
  onChange,
}: {
  amountDue: number;
  onChange: (r: Redemption) => void;
}) {
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [code, setCode] = useState("");
  const [cardBalance, setCardBalance] = useState<number | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    api.loyalty().then(setLoyalty).catch(() => setLoyalty(null));
  }, []);

  // Gift card applies first, then points cover what remains.
  const giftApplied = cardBalance != null ? Math.min(cardBalance, amountDue) : 0;
  const remainingAfterCard = Math.round((amountDue - giftApplied) * 100) / 100;

  const pointsValue = loyalty?.pointRedemptionValue ?? 0.05;
  const maxPointsByDollars = Math.floor(remainingAfterCard / pointsValue);
  const pointsUsable =
    usePoints && loyalty ? Math.min(loyalty.pointsBalance, maxPointsByDollars) : 0;
  const pointsDiscount = Math.round(pointsUsable * pointsValue * 100) / 100;

  const discount = Math.round((giftApplied + pointsDiscount) * 100) / 100;

  useEffect(() => {
    onChange({
      giftCardCode: cardBalance != null && giftApplied > 0 ? code.trim().toUpperCase() : undefined,
      redeemPoints: pointsUsable > 0 ? pointsUsable : undefined,
      discount,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, cardBalance, giftApplied, pointsUsable, discount]);

  async function checkCard() {
    if (!code.trim()) return;
    setChecking(true);
    setCardError(null);
    setCardBalance(null);
    try {
      const card = await api.lookupGiftCard(code.trim());
      if (card.status === "void") {
        setCardError("This gift card is no longer valid.");
      } else if (Number(card.balance) <= 0) {
        setCardError("This gift card has no remaining balance.");
      } else {
        setCardBalance(Number(card.balance));
      }
    } catch {
      setCardError("No gift card found with that code.");
    } finally {
      setChecking(false);
    }
  }

  const hasRewards = (loyalty?.pointsBalance ?? 0) > 0 || cardBalance != null;

  return (
    <div className="rounded-xl border border-hairline bg-clay/30 p-4">
      <p className="text-sm font-semibold text-forest">Apply rewards</p>

      {/* Gift card */}
      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Gift card</label>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setCardBalance(null);
              setCardError(null);
            }}
            placeholder="AYUR-XXXX-XXXX-XXXX"
            className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm uppercase tracking-wide text-foreground placeholder:text-ink-muted focus:border-leaf focus:outline-none"
          />
          <button
            type="button"
            onClick={checkCard}
            disabled={checking || !code.trim()}
            className="shrink-0 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm font-medium text-forest hover:border-leaf disabled:opacity-50"
          >
            {checking ? "…" : "Apply"}
          </button>
        </div>
        {cardError && <p className="mt-1.5 text-xs text-red-700">{cardError}</p>}
        {cardBalance != null && (
          <p className="mt-1.5 text-xs text-forest">
            Applied {formatMoney(giftApplied)} from a {formatMoney(cardBalance)} card.
          </p>
        )}
      </div>

      {/* Points */}
      {loyalty && loyalty.pointsBalance > 0 && (
        <label className="mt-3 flex items-start gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={usePoints}
            onChange={(e) => setUsePoints(e.target.checked)}
            disabled={remainingAfterCard <= 0}
            className="mt-0.5 h-4 w-4 accent-(--forest)"
          />
          <span>
            Redeem {loyalty.pointsBalance} points
            {usePoints && pointsUsable > 0 && (
              <span className="text-ink-muted">
                {" "}
                — using {pointsUsable} for −{formatMoney(pointsDiscount)}
              </span>
            )}
            {usePoints && pointsUsable === 0 && (
              <span className="text-ink-muted"> — nothing left to cover</span>
            )}
          </span>
        </label>
      )}

      {!hasRewards && !cardError && (
        <p className="mt-3 text-xs text-ink-muted">
          Enter a gift card code, or earn points on this purchase to redeem next time.
        </p>
      )}

      {discount > 0 && (
        <div className="mt-3 flex justify-between border-t border-hairline pt-3 text-sm">
          <span className="text-ink-muted">Rewards applied</span>
          <span className="font-medium text-forest">−{formatMoney(discount)}</span>
        </div>
      )}
    </div>
  );
}
