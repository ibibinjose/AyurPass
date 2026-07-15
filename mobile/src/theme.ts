/**
 * AyurPass mobile design tokens — mirrors the web's warm-ivory palette
 * (frontend/src/app/globals.css) so web and app read as one brand.
 */
export const colors = {
  background: "#f6f3ec",
  surface: "#fffdf9",
  foreground: "#211e19",
  inkSecondary: "#57534a",
  inkMuted: "#8a857a",
  hairline: "#e7e1d4",

  forest: "#24382e",
  forestDeep: "#182720",
  leaf: "#3d6650",
  gold: "#b9892f",
  goldSoft: "#e9d9b8",
  clay: "#f0e9db",

  vata: "#4a3aa7",
  pitta: "#eb6834",
  kapha: "#1baf7a",

  white: "#ffffff",
  danger: "#b42318",
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

export const spacing = (n: number) => n * 4;
