import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand semantic tokens (the four sacred colors)
        ivory: "#FAF6EC",
        maroon: {
          DEFAULT: "#6B1E2A",
          deep: "#4E0616",
          soft: "#7C2B36",
        },
        gold: {
          DEFAULT: "#B8893E",
          antique: "#B8893E",
          light: "#D4B07A",
          leaf: "#A9802F",
        },
        sandstone: "#E8D9B8",

        // Manuscript semantic tokens (the redesign vocabulary). Gold is reserved
        // for the sacred and the earned; vermilion for the live/now; indigo,
        // rarely, for the guru's own hand.
        paper: {
          DEFAULT: "#F1E9D6",
          deep: "#EAE0C8",
          warm: "#F4EEDD",
        },
        ink: {
          DEFAULT: "#2A1A17",
          soft: "#6E5A54",
        },
        vermilion: "#C1440E",
        indigo: {
          manuscript: "#2E3A63",
        },

        // Material tokens (kept for direct Stitch HTML compatibility)
        "surface-container-low": "#f7f3e9",
        "surface-container-highest": "#e6e2d8",
        "secondary-container": "#ffc877",
        "on-surface-variant": "#554243",
        "on-background": "#1c1c16",
        "error-container": "#ffdad6",
        "surface-dim": "#dddad0",
        "on-surface": "#1c1c16",
        "on-tertiary-container": "#b0a384",
        "on-tertiary": "#ffffff",
        "primary-container": "#6b1e2a",
        "on-tertiary-fixed": "#221b06",
        "on-primary-fixed-variant": "#7c2b36",
        "on-secondary-container": "#795207",
        "surface-container-high": "#ece8de",
        "tertiary-fixed": "#f0e1c0",
        "surface-container": "#f1eee4",
        "secondary-fixed": "#ffddb0",
        "surface-tint": "#9a424c",
        "inverse-surface": "#31312a",
        "surface-container-lowest": "#ffffff",
        "on-secondary-fixed-variant": "#614000",
        "on-secondary": "#ffffff",
        "tertiary-fixed-dim": "#d4c5a5",
        outline: "#877273",
        "outline-variant": "#dac0c1",
        tertiary: "#2b240e",
        "primary-fixed-dim": "#ffb2b8",
        "secondary-fixed-dim": "#f3bd6d",
        "on-secondary-fixed": "#281800",
        secondary: "#7e570d",
        "inverse-on-surface": "#f4f0e7",
        primary: "#4e0616",
        "surface-bright": "#fdf9ef",
        "on-primary-fixed": "#40000e",
        "tertiary-container": "#423922",
        "on-primary": "#ffffff",
        error: "#ba1a1a",
        surface: "#fdf9ef",
        background: "#fdf9ef",
        "on-error": "#ffffff",
        "inverse-primary": "#ffb2b8",
        "surface-variant": "#e6e2d8",
        "on-tertiary-fixed-variant": "#4f462d",
        "on-primary-container": "#ef858f",
        "on-error-container": "#93000a",
        "primary-fixed": "#ffdadb",
      },
      fontFamily: {
        serif: ["var(--font-eb-garamond)", "EB Garamond", "Garamond", "serif"],
        display: [
          "var(--font-cormorant)",
          "Cormorant Garamond",
          "EB Garamond",
          "serif",
        ],
        deva: [
          "var(--font-deva)",
          "Tiro Devanagari Hindi",
          "Nirmala UI",
          "serif",
        ],
      },
      fontSize: {
        "display-lg": [
          "48px",
          { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "display-lg-mobile": [
          "32px",
          { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "headline-lg": [
          "32px",
          { lineHeight: "40px", letterSpacing: "0.01em", fontWeight: "500" },
        ],
        "headline-md": [
          "24px",
          { lineHeight: "32px", fontWeight: "500" },
        ],
        "body-lg": ["20px", { lineHeight: "30px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-lg": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0.08em", fontWeight: "600" },
        ],
        "label-md": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" },
        ],
      },
      spacing: {
        "margin-page": "4rem",
        "margin-mobile": "1.5rem",
        gutter: "2rem",
        "section-gap": "6rem",
        "stack-sm": "0.75rem",
        "stack-md": "1.5rem",
      },
      borderRadius: {
        DEFAULT: "0px",
        lg: "0px",
        xl: "0px",
        full: "9999px",
      },
      backgroundImage: {
        "parchment-grain":
          "radial-gradient(circle at 20% 20%, rgba(184,137,62,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(107,30,42,0.03) 0%, transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
