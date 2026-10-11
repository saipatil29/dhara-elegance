import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "2rem", lg: "3rem", xl: "4rem" },
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1440px" },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },

      colors: {
        /** Brand palette — the single source of truth for colour. */
        navy: {
          DEFAULT: "#0F2345",
          50: "#F2F5FA",
          100: "#E2E8F2",
          200: "#C2CFE3",
          300: "#94A9CA",
          400: "#5E7AA8",
          500: "#3A5686",
          600: "#26406B",
          700: "#1A3157",
          800: "#122847",
          900: "#0F2345",
          950: "#081428",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8C766",
          50: "#FBF7EA",
          100: "#F6EDCF",
          200: "#EEDDA1",
          300: "#E8C766",
          400: "#D4AF37",
          500: "#B8952A",
          600: "#957620",
          700: "#6F581A",
          800: "#4A3B12",
          900: "#2B2109",
        },
        cream: {
          DEFAULT: "#FAF8F4",
          100: "#FFFFFF",
          200: "#FAF8F4",
          300: "#F2EEE6",
          400: "#E7E1D5",
        },

        /** Semantic tokens (resolved via CSS variables in globals.css). */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },

      backgroundImage: {
        "gold-sheen":
          "linear-gradient(110deg, #B8952A 0%, #D4AF37 35%, #E8C766 50%, #D4AF37 65%, #B8952A 100%)",
        "navy-depth": "linear-gradient(160deg, #0F2345 0%, #081428 100%)",
        "cream-veil": "linear-gradient(180deg, #FFFFFF 0%, #FAF8F4 100%)",
        "editorial-fade":
          "linear-gradient(to top, rgba(15,35,69,0.85) 0%, rgba(15,35,69,0.15) 55%, transparent 100%)",
      },

      boxShadow: {
        subtle: "0 1px 2px rgba(15,35,69,0.04), 0 2px 8px rgba(15,35,69,0.04)",
        card: "0 2px 4px rgba(15,35,69,0.03), 0 8px 24px rgba(15,35,69,0.06)",
        lifted: "0 12px 32px rgba(15,35,69,0.10), 0 4px 8px rgba(15,35,69,0.04)",
        gold: "0 4px 20px rgba(212,175,55,0.25)",
        "inner-line": "inset 0 -1px 0 rgba(15,35,69,0.08)",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      letterSpacing: {
        editorial: "0.28em",
      },

      transitionTimingFunction: {
        /** Shared easing curves — keep motion consistent sitewide. */
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
        "luxe-in": "cubic-bezier(0.55, 0, 1, 0.45)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gold-sweep": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.22s cubic-bezier(0.22,1,0.36,1)",
        "accordion-up": "accordion-up 0.22s cubic-bezier(0.22,1,0.36,1)",
        shimmer: "shimmer 2.4s linear infinite",
        "gold-sweep": "gold-sweep 6s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
