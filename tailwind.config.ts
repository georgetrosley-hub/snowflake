import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#141210",
          elevated: "#1d1a17",
          muted: "#282522",
          border: "#3a332d",
          divider: "#2f2a24",
        },
        text: {
          primary: "#f4f1eb",
          secondary: "#bfb8ae",
          muted: "#7c756b",
          faint: "#524d47",
        },
        accent: {
          DEFAULT: "#cec0a6",
          muted: "#ac9e86",
          subtle: "#645c4f",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      letterSpacing: {
        tight: "-0.02em",
        relaxed: "0.01em",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
