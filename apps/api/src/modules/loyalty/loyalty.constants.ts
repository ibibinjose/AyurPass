/** AyurPass Rewards economics — the single source of truth for both API and UI. */

/** Points earned per $1 of card-paid spend (points-funded spend does not earn). */
export const POINTS_PER_DOLLAR = 1;

/** Redemption value of a single point, in dollars (20 points = $1). */
export const POINT_REDEMPTION_VALUE = 0.05;

export interface Tier {
  key: string;
  name: string;
  threshold: number; // lifetime points to reach this tier
  perksMultiplier: number; // future earn multiplier (kept at 1 for now)
}

/** Wellness-themed tiers, ascending by lifetime points. */
export const TIERS: Tier[] = [
  { key: 'SEEDLING', name: 'Seedling', threshold: 0, perksMultiplier: 1 },
  { key: 'BLOOM', name: 'Bloom', threshold: 500, perksMultiplier: 1 },
  { key: 'RADIANCE', name: 'Radiance', threshold: 2000, perksMultiplier: 1 },
];

export function tierFor(lifetimePoints: number): { current: Tier; next: Tier | null; pointsToNext: number } {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (lifetimePoints >= tier.threshold) current = tier;
  }
  const next = TIERS.find((t) => t.threshold > current.threshold) ?? null;
  return {
    current,
    next,
    pointsToNext: next ? Math.max(0, next.threshold - lifetimePoints) : 0,
  };
}

export function pointsForSpend(dollars: number): number {
  return Math.floor(dollars * POINTS_PER_DOLLAR);
}

export function pointsToDollars(points: number): number {
  return Math.round(points * POINT_REDEMPTION_VALUE * 100) / 100;
}
