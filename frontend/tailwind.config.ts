import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        // Light & warm theme
        cream: "#FDF8F3",           // page background (warm cream)
        charcoal: "#1C1410",        // primary text (warm near-black)
        terracotta: {
          DEFAULT: "#E85D04",       // warm orange (primary accent)
          light: "#FFF7ED",         // very light orange tint
        },
        sage: {
          DEFAULT: "#0EA5E9",       // sky blue (secondary accent - camera)
          light: "#F0F9FF",         // light sky tint
        },
        "warm-amber": {
          DEFAULT: "#7C3AED",       // violet (blood sugar / profile)
          light: "#F5F3FF",         // light violet tint
        },
        coral: {
          DEFAULT: "#DC2626",       // red (danger / stroke alert)
          light: "#FEF2F2",         // light red tint
        },
        "gray-warm": "#57534E",     // muted text (warm medium gray, darkened for WCAG AA contrast)
        "warm-border": "#E8DDD5",   // subtle borders
        surface: "#FFFFFF",         // card / surface bg
        // Warm palette (replaces navy)
        warm: {
          950: "#FDF5EE",           // lightest cream - inputs
          900: "#FDF8F3",           // main background
          800: "#FFFFFF",           // cards / sidebar
          700: "#F9F5F0",           // hover states
          600: "#EDE0D4",           // subtle dividers
          500: "#D1C4B8",           // dividers
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Courier New", "monospace"],
      },
      borderRadius: {
        card: "16px",
        "card-lg": "24px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(232,93,4,0.06)",
        elevated: "0 4px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(232,93,4,0.08)",
        glow: "0 0 20px rgba(232,93,4,0.25)",
        "glow-lg": "0 0 50px rgba(232,93,4,0.30), 0 0 100px rgba(232,93,4,0.12)",
        "glow-sky": "0 0 20px rgba(14,165,233,0.25)",
        "glow-violet": "0 0 20px rgba(124,58,237,0.25)",
        "glow-red": "0 0 20px rgba(220,38,38,0.25)",
        "glow-emerald": "0 0 20px rgba(5,150,105,0.25)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1.0)" },
          "50%": { transform: "scale(1.05)" },
        },
        "ring-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "fade-up": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "blob-drift": {
          "0%, 100%": { transform: "translate(0px,0px) scale(1)" },
          "25%": { transform: "translate(40px,-30px) scale(1.06)" },
          "50%": { transform: "translate(-20px,20px) scale(0.95)" },
          "75%": { transform: "translate(-30px,-10px) scale(1.04)" },
        },
        "ecg-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "dot-pulse": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.4)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "live-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        "scan-down": {
          "0%": { top: "-10%" },
          "100%": { top: "110%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400% center" },
          "100%": { backgroundPosition: "400% center" },
        },
        "stagger-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        breathe: "breathe 2.5s ease-in-out infinite",
        "ring-pulse": "ring-pulse 1.8s ease-out infinite",
        "fade-up": "fade-up 0.4s ease-out",
        float: "float 5s ease-in-out infinite",
        "blob-drift": "blob-drift 12s ease-in-out infinite",
        "ecg-scroll": "ecg-scroll 4s linear infinite",
        "dot-pulse": "dot-pulse 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "live-blink": "live-blink 1.2s ease-in-out infinite",
        "scan-down": "scan-down 3s linear infinite",
        shimmer: "shimmer 4s linear infinite",
        "stagger-in": "stagger-in 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
