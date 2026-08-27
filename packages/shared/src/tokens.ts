/**
 * AyurPass design tokens — single source of truth for web (Tailwind) and mobile (NativeWind).
 * Premium wellness palette: sage greens, saffron warmth, modern cream backgrounds.
 * Psychology-driven: deep sage (trust/nature/healing), warm saffron (vitality/Ayurveda),
 * soft cream (calm/openness), muted earth neutrals (grounding/stability).
 */

export const colors = {
  /* ——— Surfaces & Ink ——— */
  background: "#f8f7f2", // clean warm base
  surface: "#ffffff", // crisp card contrast
  foreground: "#15251e", // deep botanical ink
  inkSecondary: "#405048", // refined secondary ink
  inkMuted: "#6d7872", // calm neutral label
  hairline: "#dfe4dc", // soft structural line

  /* ——— Primary Brand: Sage Green ——— */
  sage: "#174b3a", // deep botanical green - trust/nature/growth
  sageDark: "#0b2e23", // sharply defined dark anchor
  sageLight: "#31715a", // balanced green for accents

  /* ——— Accent: Saffron / Amber ——— */
  saffron: "#d38a20", // focused amber-saffron action signal
  saffronSoft: "#fff4de", // lightest saffron wash
  saffronDeep: "#a85f00", // rich amber

  /* ——— Accent: Terracotta ——— */
  terracotta: "#C2704C", // warm earthy reddish-brown - heritage/grounding
  terracottaLight: "#D4896A", // lighter terracotta for hover/active states
  terracottaSoft: "#FDF0EB", // soft terracotta wash for backgrounds
  terracottaDeep: "#A0583A", // deep terracotta for emphasis

  /* ——— Accent: Terracotta ——— */
  terracotta: "#C2704C", // warm earthy reddish-brown - heritage/grounding
  terracottaLight: "#D4896A", // lighter terracotta for hover/active states
  terracottaSoft: "#FDF0EB", // soft terracotta wash for backgrounds
  terracottaDeep: "#A0583A", // deep terracotta for emphasis

  /* ——— Neutrals: Sand ——— */
  sand: "#eef0e8", // mineral-sand section surface
  sandDark: "#d8dfd5", // deeper structural neutral

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
  forest: "#174b3a", // -> sage
  forestDeep: "#0b2e23", // -> sageDark
  leaf: "#31715a", // -> sageLight
  gold: "#d38a20", // -> saffron
  goldSoft: "#fff4de", // -> saffronSoft
  clay: "#eef0e8", // -> sand
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
  AYURVEDA: "#174b3a", // botanical green
  YOGA: "#6366f1", // indigo
  SPA: "#d38a20", // focused saffron
  MEDITATION: "#2563eb", // calm blue-600
  FITNESS: "#10b981", // emerald-500
  NUTRITION: "#a85f00", // saffron deep
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
