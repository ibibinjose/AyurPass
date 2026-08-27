/**
 * CommonJS token export for tooling (Tailwind / NativeWind configs).
 * Keep values in sync with src/tokens.ts — this file is the require()-able mirror.
 *
 * Premium wellness palette: sage greens, saffron warmth, modern cream backgrounds.
 */
const colors = {
  /* Surfaces & Ink */
  background: "#f8f7f2",
  surface: "#ffffff",
  foreground: "#15251e",
  inkSecondary: "#405048",
  inkMuted: "#6d7872",
  hairline: "#dfe4dc",

  /* Primary Brand: Sage Green */
  sage: "#174b3a",
  sageDark: "#0b2e23",
  sageLight: "#31715a",

  /* Accent: Saffron / Amber */
  saffron: "#d38a20",
  saffronSoft: "#fff4de",
  saffronDeep: "#a85f00",

  /* Accent: Terracotta */
  terracotta: "#C2704C",
  terracottaLight: "#D4896A",
  terracottaSoft: "#FDF0EB",
  terracottaDeep: "#A0583A",


  /* Neutrals: Sand */
  sand: "#eef0e8",
  sandDark: "#d8dfd5",

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
  forest: "#174b3a",
  forestDeep: "#0b2e23",
  leaf: "#31715a",
  gold: "#d38a20",
  goldSoft: "#fff4de",
  clay: "#eef0e8",
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
  terracotta: colors.terracotta,
  "terracotta-light": colors.terracottaLight,
  "terracotta-soft": colors.terracottaSoft,
  "terracotta-deep": colors.terracottaDeep,
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
