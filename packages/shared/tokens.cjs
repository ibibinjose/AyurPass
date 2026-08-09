/**
 * CommonJS token export for tooling (Tailwind / NativeWind configs).
 * Keep values in sync with src/tokens.ts — this file is the require()-able mirror.
 *
 * Premium wellness palette: sage greens, saffron warmth, modern cream backgrounds.
 */
const colors = {
  /* Surfaces & Ink */
  background: "#faf8f4",
  surface: "#ffffff",
  foreground: "#1c1917",
  inkSecondary: "#44403c",
  inkMuted: "#78716c",
  hairline: "#e7e5e4",

  /* Primary Brand: Sage Green */
  sage: "#2d5a47",
  sageDark: "#1a3a2e",
  sageLight: "#3d7a5f",

  /* Accent: Saffron / Amber */
  saffron: "#c2722a",
  saffronSoft: "#fef3e2",
  saffronDeep: "#9a5a1f",

  /* Neutrals: Sand */
  sand: "#f5f0e8",
  sandDark: "#e8e0d4",

  /* Dosha Colors (refined) */
  vata: "#6366f1",
  pitta: "#f97316",
  kapha: "#10b981",

  /* System Colors */
  white: "#ffffff",
  danger: "#ff3b30",
  systemBlue: "#007aff",
  systemGreen: "#34c759",
  systemRed: "#ff3b30",

  /* Backward-compatible aliases */
  forest: "#2d5a47",
  forestDeep: "#1a3a2e",
  leaf: "#3d7a5f",
  gold: "#c2722a",
  goldSoft: "#fef3e2",
  clay: "#f5f0e8",
};

const tailwindColors = {
  background: colors.background,
  surface: colors.surface,
  foreground: colors.foreground,
  "ink-secondary": colors.inkSecondary,
  "ink-muted": colors.inkMuted,
  hairline: colors.hairline,

  /* New primary names */
  sage: colors.sage,
  "sage-dark": colors.sageDark,
  "sage-light": colors.sageLight,
  saffron: colors.saffron,
  "saffron-soft": colors.saffronSoft,
  "saffron-deep": colors.saffronDeep,
  sand: colors.sand,
  "sand-dark": colors.sandDark,

  /* Backward-compatible aliases */
  forest: colors.forest,
  "forest-deep": colors.forestDeep,
  leaf: colors.leaf,
  gold: colors.gold,
  "gold-soft": colors.goldSoft,
  clay: colors.clay,

  vata: colors.vata,
  pitta: colors.pitta,
  kapha: colors.kapha,
  danger: colors.danger,
  "system-blue": colors.systemBlue,
  "system-green": colors.systemGreen,
  "system-red": colors.systemRed,
};

module.exports = { colors, tailwindColors };
