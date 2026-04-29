import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        portal: "12px",
        "portal-lg": "16px"
      },
      boxShadow: {
        portal: "var(--shadow-sm)",
        "portal-md": "var(--shadow-md)",
        "portal-lg": "var(--shadow-lg)",
        gold: "var(--shadow-gold)"
      },
      colors: {
        background: "var(--bg-base)",
        surface: "var(--bg-surface)",
        sunken: "var(--bg-sunken)",
        ink: {
          primary: "var(--ink-primary)",
          secondary: "var(--ink-secondary)",
          tertiary: "var(--ink-tertiary)",
          disabled: "var(--ink-disabled)"
        },
        blossom: {
          100: "var(--blossom-100)",
          300: "var(--blossom-300)",
          500: "var(--blossom-500)",
          700: "var(--blossom-700)",
          900: "var(--blossom-900)"
        },
        gold: {
          100: "var(--gold-100)",
          300: "var(--gold-300)",
          500: "var(--gold-500)",
          700: "var(--gold-700)",
          900: "var(--gold-900)"
        }
      },
      fontFamily: {
        display: ["var(--font-display-family)", "serif"],
        sans: ["var(--font-body-family)", "sans-serif"]
      }
    }
  }
};

export default config;
