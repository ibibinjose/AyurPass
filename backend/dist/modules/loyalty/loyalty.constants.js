"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIERS = exports.POINT_REDEMPTION_VALUE = exports.POINTS_PER_DOLLAR = void 0;
exports.tierFor = tierFor;
exports.pointsForSpend = pointsForSpend;
exports.pointsToDollars = pointsToDollars;
exports.POINTS_PER_DOLLAR = 1;
exports.POINT_REDEMPTION_VALUE = 0.05;
exports.TIERS = [
    { key: 'SEEDLING', name: 'Seedling', threshold: 0, perksMultiplier: 1 },
    { key: 'BLOOM', name: 'Bloom', threshold: 500, perksMultiplier: 1 },
    { key: 'RADIANCE', name: 'Radiance', threshold: 2000, perksMultiplier: 1 },
];
function tierFor(lifetimePoints) {
    let current = exports.TIERS[0];
    for (const tier of exports.TIERS) {
        if (lifetimePoints >= tier.threshold)
            current = tier;
    }
    const next = exports.TIERS.find((t) => t.threshold > current.threshold) ?? null;
    return {
        current,
        next,
        pointsToNext: next ? Math.max(0, next.threshold - lifetimePoints) : 0,
    };
}
function pointsForSpend(dollars) {
    return Math.floor(dollars * exports.POINTS_PER_DOLLAR);
}
function pointsToDollars(points) {
    return Math.round(points * exports.POINT_REDEMPTION_VALUE * 100) / 100;
}
//# sourceMappingURL=loyalty.constants.js.map