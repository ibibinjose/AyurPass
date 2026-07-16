/**
 * AyurPass mobile design tokens — mirrors the web mobile-first palette
 * (frontend/src/app/globals.css) so web and app read as one brand.
 * Contrast tuned for outdoor readability on iOS + Android.
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
  /** iOS system blue — platform verified tick */
  systemBlue: "#007aff",
} as const;

export const doshaColor = {
  vata: colors.vata,
  pitta: colors.pitta,
  kapha: colors.kapha,
} as const;

/** Font families registered in app/_layout.tsx via @expo-google-fonts. */
export const fonts = {
  display: "Fraunces_600SemiBold",
  displayRegular: "Fraunces_500Medium",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  full: 999,
} as const;

/** 4px base grid */
export const spacing = (n: number) => n * 4;

/** Type scale — slightly larger on mobile for outdoor readability */
export const type = {
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.forest },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.forest },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.foreground },
  bodyMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkSecondary,
  },
  meta: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
    color: colors.inkMuted,
  },
} as const;

/** Minimum touch target (iOS HIG / Material) */
export const tapMin = 44;
