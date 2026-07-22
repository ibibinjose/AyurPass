const { tailwindColors } = require("../../packages/shared/tokens.cjs");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./App.tsx"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ...tailwindColors,
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
