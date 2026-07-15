"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import type { LoyaltySummary } from "@/lib/types";
import { SparkleIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui";

const TIER_META: Record<string, { blurb: string; ring: string }> = {
  SEEDLING: { blurb: "Your journey begins.", ring: "from-leaf/30 to-clay" },
  BLOOM: { blurb: "You're flourishing.", ring: "from-gold/30 to-clay" },
  RADIANCE: { blurb: "Our most radiant members.", ring: "from-gold/50 to-gold-soft" },
};

export default function RewardsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<LoyaltySummary | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    api
      .loyalty()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [user]);

  if (user && user.role !== "CONSUMER") {
    return <EmptyState title="Rewards are for wellness seekers" body="Provider accounts don't collect points." />;
  }

  if (summary === undefined) {
    return <div className="h-64 animate-pulse rounded-2xl bg-clay/70" />;
  }
  if (summary === null) {
    return <EmptyState title="Rewards unavailable" body="We couldn't load your rewards right now." />;
  }

  const tierMeta = TIER_META[summary.tierKey] ?? TIER_META.SEEDLING;
  const progress =
    summary.nextTier && summary.pointsToNextTier > 0
      ? Math.min(
          100,
          Math.round(
            ((summary.lifetimePoints) /
              (summary.lifetimePoints + summary.pointsToNextTier)) *
              100,
          ),
        )
      : 100;

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">AyurPass Rewards</h1>
      <p className="mt-1 text-ink-muted">
        Earn a point for every dollar you spend, and redeem them for {formatMoney(summary.pointRedemptionValue)} each.
      </p>

      {/* Hero card */}
      <div className={`mt-6 overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br ${tierMeta.ring} p-8`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest/70">
              {tierMeta.blurb}
            </p>
            <p className="mt-2 font-display text-2xl text-forest">{summary.tier} member</p>
            <p className="mt-4 text-5xl font-semibold text-forest">
              {summary.pointsBalance.toLocaleString()}
              <span className="ml-2 text-lg font-normal text-forest/70">points</span>
            </p>
            <p className="mt-1 text-sm text-forest/70">
              worth {formatMoney(summary.pointsValue)} off your next booking or order
            </p>
          </div>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface/70 text-forest">
            <SparkleIcon className="h-8 w-8" />
          </span>
        </div>

        {summary.nextTier && (
          <div className="mt-6">
            <div className="flex justify-between text-xs text-forest/70">
              <span>{summary.lifetimePoints.toLocaleString()} lifetime points</span>
              <span>
                {summary.pointsToNextTier.toLocaleString()} to {summary.nextTier}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface/60">
              <div className="h-full rounded-full bg-forest" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Earn", "1 point per $1 spent on bookings and shop orders, on the amount you pay by card."],
          ["Redeem", `Apply points at checkout — every point is worth ${formatMoney(summary.pointRedemptionValue)}.`],
          ["Rise", "Reach Bloom at 500 lifetime points, and Radiance at 2,000."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-hairline bg-surface p-5">
            <p className="font-display text-lg text-forest">{title}</p>
            <p className="mt-1.5 text-sm text-ink-secondary">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/explore"
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-deep"
        >
          Book a session
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-medium text-forest hover:border-leaf"
        >
          Visit the shop
        </Link>
      </div>

      {/* History */}
      <h2 className="mt-10 font-display text-xl text-forest">Points history</h2>
      <div className="mt-4">
        {summary.transactions.length === 0 ? (
          <EmptyState
            title="No activity yet"
            body="Points you earn and redeem will show up here. Make a booking or a purchase to get started."
          />
        ) : (
          <ul className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface">
            {summary.transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.reason}</p>
                  <p className="text-xs text-ink-muted">
                    {new Date(t.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums ${t.points >= 0 ? "text-forest" : "text-ink-secondary"}`}
                >
                  {t.points >= 0 ? "+" : ""}
                  {t.points} pts
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
