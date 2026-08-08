/**
 * AyurPass mobile design tokens — re-exports shared package + mobile font scale.
 */
import { colors, doshaColor, radius, spacing, tapMin } from "@ayurpass/shared";

export { colors, doshaColor, radius, spacing, tapMin };

/** Font families registered in app/_layout.tsx via @expo-google-fonts. */
export const fonts = {
  display: "Fraunces_600SemiBold",
  displayRegular: "Fraunces_500Medium",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
} as const;

/** Type scale — slightly larger on mobile for outdoor readability */
export const type = {
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.sage },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.sage },
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
