/**
 * AyurPass design tokens — single source of truth for web (Tailwind) and mobile (NativeWind).
 * Warm-ivory light theme; outdoor-readable contrast; CVD-validated dosha colors.
 */

export const colors = {
  background: "#f4f0e8",
  surface: "#fffdf9",
  foreground: "#1a1714",
  inkSecondary: "#3f3b34",
  inkMuted: "#5c574e",
  hairline: "#ddd6c8",

  forest: "#1e3228",
  forestDeep: "#142019",
  leaf: "#2f5a44",
  gold: "#a67a24",
  goldSoft: "#e9d9b8",
  clay: "#efe8d9",

  vata: "#4a3aa7",
  pitta: "#eb6834",
  kapha: "#1baf7a",

  white: "#ffffff",
  danger: "#ff3b30",
  systemBlue: "#007aff",
  systemGreen: "#34c759",
  systemRed: "#ff3b30",
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
 */
export const serviceCategoryColor: Record<string, string> = {
  AYURVEDA: "#2f5a44", // leaf green
  YOGA: "#4a3aa7", // purple
  SPA: "#c45c26", // warm copper
  MEDITATION: "#2a6f97", // calm blue
  FITNESS: "#1b7f5a", // sport green
  NUTRITION: "#b8860b", // dark gold
  COACHING: "#5c6bc0", // indigo
  CONSULTATION: "#007aff", // system blue
  PACKAGE: "#a67a24", // gold
  COOKING: "#c4782a", // kitchen amber
};

export const serviceCategoryColorSoft: Record<string, string> = {
  AYURVEDA: "#e4efe8",
  YOGA: "#ebe7f7",
  SPA: "#fce9df",
  MEDITATION: "#e4f0f7",
  FITNESS: "#e0f2ea",
  NUTRITION: "#f7efd6",
  COACHING: "#e8eaf6",
  CONSULTATION: "#e5f1ff",
  PACKAGE: "#f5edd9",
  COOKING: "#f8ead8",
};

export function colorForServiceCategory(category?: string | null): string {
  if (!category) return colors.forest;
  return serviceCategoryColor[category.toUpperCase()] ?? colors.forest;
}

export function softColorForServiceCategory(category?: string | null): string {
  if (!category) return colors.clay;
  return serviceCategoryColorSoft[category.toUpperCase()] ?? colors.clay;
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
// Note: serviceCategoryColor is also exported for calendar UIs (see above).

export const tailwindColors = {
  background: colors.background,
  surface: colors.surface,
  foreground: colors.foreground,
  "ink-secondary": colors.inkSecondary,
  "ink-muted": colors.inkMuted,
  hairline: colors.hairline,
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
