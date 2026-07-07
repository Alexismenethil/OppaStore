import type { Config } from "tailwindcss";

/**
 * Design system "Green Panda" — portado desde
 * stitch_oppastore_ui_ux_design/green_panda_narrative/DESIGN.md
 * Estética Kawaii-Modern / Tactile Minimalism, paleta pastel premium.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2f6a3f",
        "on-primary": "#ffffff",
        "primary-container": "#b2f2bb",
        "on-primary-container": "#367044",
        "primary-fixed": "#b2f2bb",
        "primary-fixed-dim": "#96d5a0",
        "inverse-primary": "#96d5a0",
        secondary: "#56624b",
        "on-secondary": "#ffffff",
        "secondary-container": "#d7e4c7",
        "on-secondary-container": "#5a664f",
        "secondary-fixed": "#dae7ca",
        tertiary: "#6a5969",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#f3dcef",
        "on-tertiary-container": "#705f6f",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        background: "#f4fafd",
        "on-background": "#161d1f",
        surface: "#f4fafd",
        "surface-bright": "#f4fafd",
        "surface-dim": "#d4dbdd",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eef5f7",
        "surface-container": "#e8eff1",
        "surface-container-high": "#e2e9ec",
        "surface-container-highest": "#dde4e6",
        "surface-variant": "#dde4e6",
        "on-surface": "#161d1f",
        "on-surface-variant": "#414940",
        "inverse-surface": "#2b3234",
        "inverse-on-surface": "#ebf2f4",
        "surface-tint": "#2f6a3f",
        outline: "#717970",
        "outline-variant": "#c0c9be",
      },
      borderRadius: {
        DEFAULT: "1rem",
        sm: "0.5rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      spacing: {
        xs: "4px",
        sm: "12px",
        base: "8px",
        md: "24px",
        lg: "48px",
        xl: "80px",
        gutter: "24px",
        "container-max": "1280px",
        "margin-mobile": "16px",
      },
      maxWidth: {
        "container-max": "1280px",
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        heading: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["56px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["40px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-md": ["32px", { lineHeight: "1.3", fontWeight: "600" }],
        "headline-sm": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-lg": ["14px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "700" }],
        "label-md": ["12px", { lineHeight: "1", fontWeight: "500" }],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
