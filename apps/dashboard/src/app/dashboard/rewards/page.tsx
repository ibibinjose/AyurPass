"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import type { LoyaltySummary } from "@/lib/types";
import { DashHeader } from "@/components/dashboard/DashboardKit";
import { SparkleIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote } from "@/components/ui";

const TIER_META: Record<string, { blurb: string; ring: string }> = {
  SEEDLING: { blurb: "Your journey begins.", ring: "from-leaf/25 via-clay to-surface" },
  BLOOM: { blurb: "You're flourishing.", ring: "from-gold/30 via-gold-soft/40 to-surface" },
  RADIANCE: { blurb: "Our most radiant members.", ring: "from-gold/40 via-leaf/20 to-surface" },
};

export default function RewardsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<LoyaltySummary | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setError(null);
    api
      .loyalty()
      .then(setSummary)
      .catch((err) => {
        setSummary(null);
        setError(err instanceof Error ? err.message : "Could not load rewards.");
      });
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function redeem(rewardId: string) {
    setRedeeming(rewardId);
    setError(null);
    setFlash(null);
    try {
      const next = await api.redeemLoyaltyReward(rewardId);
      setSummary(next);
      setFlash("Reward redeemed — credit is saved on your account for checkout.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Redeem failed.");
    } finally {
      setRedeeming(null);
    }
  }

  if (user && user.role !== "CONSUMER" && user.role !== "PLATFORM_ADMIN") {
    // Providers can still hold a seeker loyalty account if they book as guests
  }

  if (summary === undefined) {
    return <div className="h-64 animate-pulse rounded-2xl bg-clay/70" />;
  }
  if (summary === null) {
    return (
      <EmptyState
        title="Rewards unavailable"
        body={error || "We couldn't load your rewards right now."}
        action={
          <Button type="button" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  const tierMeta = TIER_META[summary.tierKey] ?? TIER_META.SEEDLING;
  const progress =
    summary.nextTier && summary.pointsToNextTier > 0
      ? Math.min(
          100,
          Math.round(
            (summary.lifetimePoints / (summary.lifetimePoints + summary.pointsToNextTier)) * 100,
          ),
        )
      : 100;

  const catalog = summary.catalog ?? [];
  const earnRules = summary.earnRules ?? [];

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="My wellness"
        title="AyurPass Rewards"
        description={`Earn a point for every dollar you spend. Redeem at ${formatMoney(summary.pointRedemptionValue)} each on bookings and shop orders.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/explore"
              className="inline-flex min-h-10 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
            >
              Book a session
            </Link>
            <Link
              href="/shop"
              className="inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest hover:border-leaf"
            >
              Visit the shop
            </Link>
          </div>
        }
      />

      <ErrorNote message={error} />
      {flash ? (
        <p className="rounded-xl border border-leaf/30 bg-leaf/10 px-3.5 py-2.5 text-sm font-medium text-forest">
          {flash}
        </p>
      ) : null}

      {/* Balance hero */}
      <div
        className={`overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br ${tierMeta.ring} p-6 sm:p-8`}
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest/70">
              {tierMeta.blurb}
            </p>
            <p className="mt-2 font-display text-2xl text-forest">{summary.tier} member</p>
            <p className="mt-4 text-5xl font-semibold tabular-nums text-forest">
              {summary.pointsBalance.toLocaleString()}
              <span className="ml-2 text-lg font-normal text-forest/70">points</span>
            </p>
            <p className="mt-1 text-sm text-forest/70">
              worth {formatMoney(summary.pointsValue)} off your next booking or order
            </p>
          </div>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface/80 text-forest shadow-sm">
            <SparkleIcon className="h-8 w-8" />
          </span>
        </div>

        {summary.nextTier ? (
          <div className="mt-6">
            <div className="flex justify-between text-xs font-medium text-forest/70">
              <span>{summary.lifetimePoints.toLocaleString()} lifetime points</span>
              <span>
                {summary.pointsToNextTier.toLocaleString()} to {summary.nextTier}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface/70">
              <div
                className="h-full rounded-full bg-forest transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-forest">Top tier — thank you for staying with AyurPass.</p>
        )}
      </div>

      {/* How to earn */}
      <section>
        <h2 className="font-display text-lg font-semibold text-forest">How you earn</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(earnRules.length
            ? earnRules
            : [
                { label: "Earn", detail: "1 point per $1 on card-paid bookings and shop orders." },
                { label: "Redeem", detail: `Every point is worth ${formatMoney(summary.pointRedemptionValue)}.` },
                { label: "Bloom", detail: "500 lifetime points." },
                { label: "Radiance", detail: "2,000 lifetime points." },
              ]
          ).map((r) => (
            <div key={r.label} className="rounded-2xl border border-hairline bg-surface p-4">
              <p className="text-sm font-bold text-forest">{r.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{r.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Redeem catalog */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-forest">Redeem rewards</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Convert points into credits used at booking or shop checkout.
            </p>
          </div>
        </div>
        {catalog.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Catalog loading…</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {catalog.map((item) => {
              const can = summary.pointsBalance >= item.pointsCost;
              return (
                <li
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-hairline bg-surface p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-base font-semibold text-forest">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                        {item.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-leaf/15 px-2.5 py-1 text-xs font-bold tabular-nums text-forest">
                      {item.pointsCost} pts
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!can || redeeming === item.id}
                    onClick={() => void redeem(item.id)}
                    className="mt-4 inline-flex min-h-9 items-center justify-center rounded-full bg-forest px-4 text-xs font-bold text-white hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {redeeming === item.id
                      ? "Redeeming…"
                      : can
                        ? `Redeem · ${formatMoney(item.dollarValue)}`
                        : `Need ${item.pointsCost - summary.pointsBalance} more pts`}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="font-display text-lg font-semibold text-forest">Points history</h2>
        <div className="mt-3">
          {!summary.transactions?.length ? (
            <EmptyState
              title="No activity yet"
              body="Points you earn and redeem show up here. Book a session or shop to start earning."
              action={
                <Link
                  href="/explore"
                  className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white"
                >
                  Book a session
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface">
              {summary.transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{t.reason}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(t.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {t.type ? ` · ${t.type}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-bold tabular-nums ${
                      t.points >= 0 ? "text-leaf" : "text-ink-secondary"
                    }`}
                  >
                    {t.points >= 0 ? "+" : ""}
                    {t.points} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
