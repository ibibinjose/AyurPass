/**
 * CommonJS token export for tooling (Tailwind / NativeWind configs).
 * Keep values in sync with src/tokens.ts — this file is the require()-able mirror.
 */
const colors = {
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
};

const tailwindColors = {
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
};

module.exports = { colors, tailwindColors };
