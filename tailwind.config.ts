import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#000000",
          900: "#0d0d0d",
          800: "#1a1a1a",
          700: "#262626",
        },
        brand: {
          gold: "#e50914",
          golddark: "#b3070f",
          red: "#e50914",
        },
      },
      fontFamily: {
        display: ["var(--font-barlow)", "sans-serif"],
        body: ["var(--font-poppins)", "sans-serif"],
      },
      boxShadow: {
        premium: "0 20px 60px -15px rgba(0,0,0,0.5)",
        glow: "0 0 0 1px rgba(225,29,46,0.25), 0 8px 30px rgba(225,29,46,0.15)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
