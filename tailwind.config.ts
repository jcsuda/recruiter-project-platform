import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(1rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
      },
      colors: {
        brand: {
          50: "#fff8fb",
          100: "#fff0fb",
          200: "#ffe1f6",
          300: "#ffcae8",
          400: "#ff9ccf",
          500: "#ff4da3",
          600: "#e0368a",
          700: "#b21f6a",
          800: "#6f1a56",
          900: "#2b0b2a",
          950: "#130518",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "grid-white": "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "56px 56px",
      },
    },
  },
  plugins: [],
};

export default config;
