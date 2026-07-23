const { tailwindColors } = require("../../packages/shared/tokens.cjs");
const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, "./app/**/*.{js,jsx,ts,tsx}"),
    path.join(__dirname, "./src/**/*.{js,jsx,ts,tsx}"),
    path.join(__dirname, "./App.tsx"),
  ],
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
