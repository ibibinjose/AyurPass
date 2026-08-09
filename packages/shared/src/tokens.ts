/**
 * AyurPass design tokens — single source of truth for web (Tailwind) and mobile (NativeWind).
 * Premium wellness palette: sage greens, saffron warmth, modern cream backgrounds.
 * Psychology-driven: deep sage (trust/nature/healing), warm saffron (vitality/Ayurveda),
 * soft cream (calm/openness), muted earth neutrals (grounding/stability).
 */

export const colors = {
  /* ——— Surfaces & Ink ——— */
  background: "#faf8f4", // warm white - cleaner, more modern
  surface: "#ffffff", // pure white cards for contrast
  foreground: "#1c1917", // warm charcoal - stone-900
  inkSecondary: "#44403c", // stone-700
  inkMuted: "#78716c", // stone-500
  hairline: "#e7e5e4", // stone-200

  /* ——— Primary Brand: Sage Green ——— */
  sage: "#2d5a47", // refined deep sage green - trust/nature/growth
  sageDark: "#1a3a2e", // deepest sage for headers
  sageLight: "#3d7a5f", // mid sage for accents

  /* ——— Accent: Saffron / Amber ——— */
  saffron: "#c2722a", // warm amber-saffron - Ayurvedic warmth/vitality
  saffronSoft: "#fef3e2", // lightest saffron wash
  saffronDeep: "#9a5a1f", // rich amber

  /* ——— Accent: Terracotta ——— */
  terracotta: "#C2704C", // warm earthy reddish-brown - heritage/grounding
  terracottaLight: "#D4896A", // lighter terracotta for hover/active states
  terracottaSoft: "#FDF0EB", // soft terracotta wash for backgrounds
  terracottaDeep: "#A0583A", // deep terracotta for emphasis

  /* ——— Neutrals: Sand ——— */
  sand: "#f5f0e8", // warm sand for alternating sections
  sandDark: "#e8e0d4", // deeper sand for borders

  /* ——— Dosha Colors (refined) ——— */
  vata: "#6366f1", // indigo-500 - cleaner purple-blue
  pitta: "#f97316", // orange-500 - vibrant
  kapha: "#10b981", // emerald-500 - fresh green

  /* ——— System Colors ——— */
  white: "#ffffff",
  danger: "#ff3b30",
  systemBlue: "#007aff",
  systemGreen: "#34c759",
  systemRed: "#ff3b30",

  /* ——— Backward-compatible aliases ——— */
  forest: "#2d5a47", // -> sage
  forestDeep: "#1a3a2e", // -> sageDark
  leaf: "#3d7a5f", // -> sageLight
  gold: "#c2722a", // -> saffron
  goldSoft: "#fef3e2", // -> saffronSoft
  clay: "#f5f0e8", // -> sand
} as const;

export type ColorToken = keyof typeof colors;

export const doshaColor = {
  vata: colors.vata,
  pitta: colors.pitta,
  kapha: colors.kapha,
} as const;

/**
 * Calendar / booking colour codes by service category.
 * Used on mobile + web calendars so Ayurveda, Yoga, Spa etc. are scannable.
 * Harmonised with new brand palette.
 */
export const serviceCategoryColor: Record<string, string> = {
  AYURVEDA: "#2d5a47", // sage green
  YOGA: "#6366f1", // indigo
  SPA: "#c2722a", // warm saffron
  MEDITATION: "#2563eb", // calm blue-600
  FITNESS: "#10b981", // emerald-500
  NUTRITION: "#9a5a1f", // saffron deep
  COACHING: "#7c3aed", // violet-600
  CONSULTATION: "#007aff", // system blue
  PACKAGE: "#c2722a", // saffron
  COOKING: "#d97706", // amber-600
  EVENT: "#007aff", // system blue for wellness events
};

export const serviceCategoryColorSoft: Record<string, string> = {
  AYURVEDA: "#e8f5ee",
  YOGA: "#eef2ff",
  SPA: "#fef3e2",
  MEDITATION: "#eff6ff",
  FITNESS: "#ecfdf5",
  NUTRITION: "#fef9f0",
  COACHING: "#f5f3ff",
  CONSULTATION: "#e5f1ff",
  PACKAGE: "#fef3e2",
  COOKING: "#fffbeb",
  EVENT: "#e5f1ff",
};

export function colorForServiceCategory(category?: string | null): string {
  if (!category) return colors.sage;
  return serviceCategoryColor[category.toUpperCase()] ?? colors.sage;
}

export function softColorForServiceCategory(category?: string | null): string {
  if (!category) return colors.sand;
  return serviceCategoryColorSoft[category.toUpperCase()] ?? colors.sand;
}

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  full: 999,
} as const;

/** 4px base grid multiplier */
export const spacing = (n: number) => n * 4;

export const tapMin = 44;

/** CSS custom-property map for web globals / Tailwind @theme */
export const cssVariables = {
  "--background": colors.background,
  "--surface": colors.surface,
  "--foreground": colors.foreground,
  "--ink-secondary": colors.inkSecondary,
  "--ink-muted": colors.inkMuted,
  "--hairline": colors.hairline,

  /* New primary names */
  "--sage": colors.sage,
  "--sage-dark": colors.sageDark,
  "--sage-light": colors.sageLight,
  "--saffron": colors.saffron,
  "--saffron-soft": colors.saffronSoft,
  "--saffron-deep": colors.saffronDeep,
  "--terracotta": colors.terracotta,
  "--terracotta-light": colors.terracottaLight,
  "--terracotta-soft": colors.terracottaSoft,
  "--terracotta-deep": colors.terracottaDeep,
  "--sand": colors.sand,
  "--sand-dark": colors.sandDark,

  /* Backward-compatible aliases */
  "--forest": colors.forest,
  "--forest-deep": colors.forestDeep,
  "--leaf": colors.leaf,
  "--gold": colors.gold,
  "--gold-soft": colors.goldSoft,
  "--clay": colors.clay,

  "--vata": colors.vata,
  "--pitta": colors.pitta,
  "--kapha": colors.kapha,
  "--system-blue": colors.systemBlue,
  "--system-green": colors.systemGreen,
  "--system-red": colors.systemRed,
} as const;

/** Tailwind / NativeWind theme.extend.colors fragment */
export const tailwindColors = {
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
} as const;
