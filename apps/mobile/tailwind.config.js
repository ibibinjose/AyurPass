/** @type {import('tailwindcss').Config} */
// Mirrors @ayurpass/shared tokens (packages/shared/src/tokens.ts)
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./App.tsx"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#f4f0e8",
        surface: "#fffdf9",
        foreground: "#1a1714",
        "ink-secondary": "#3f3b34",
        "ink-muted": "#5c574e",
        hairline: "#ddd6c8",
        forest: "#1e3228",
        "forest-deep": "#142019",
        leaf: "#2f5a44",
        gold: "#a67a24",
        "gold-soft": "#e9d9b8",
        clay: "#efe8d9",
        vata: "#4a3aa7",
        pitta: "#eb6834",
        kapha: "#1baf7a",
        danger: "#ff3b30",
        "system-blue": "#007aff",
        "system-green": "#34c759",
        "system-red": "#ff3b30",
      },
      fontFamily: {
        display: ["Fraunces_600SemiBold"],
        "display-medium": ["Fraunces_500Medium"],
        body: ["Inter_400Regular"],
        "body-medium": ["Inter_500Medium"],
        "body-semi": ["Inter_600SemiBold"],
      },
      borderRadius: {
        sm: 10,
        md: 16,
        lg: 22,
      },
      minHeight: {
        tap: 44,
      },
      minWidth: {
        tap: 44,
      },
    },
  },
  plugins: [],
};
