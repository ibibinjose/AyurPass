export declare const POINTS_PER_DOLLAR = 1;
export declare const POINT_REDEMPTION_VALUE = 0.05;
export interface Tier {
    key: string;
    name: string;
    threshold: number;
    perksMultiplier: number;
}
export declare const TIERS: Tier[];
export declare function tierFor(lifetimePoints: number): {
    current: Tier;
    next: Tier | null;
    pointsToNext: number;
};
export declare function pointsForSpend(dollars: number): number;
export declare function pointsToDollars(points: number): number;
