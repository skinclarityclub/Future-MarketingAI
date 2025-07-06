/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        navy: {
          500: "hsl(var(--navy-500))",
          600: "hsl(var(--navy-600))",
          700: "hsl(var(--navy-700))",
          800: "hsl(var(--navy-800))",
          900: "hsl(var(--navy-900))",
        },
        primary: {
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        success: {
          400: "hsl(var(--success-400))",
          500: "hsl(var(--success-500))",
          600: "hsl(var(--success-600))",
        },
        warning: {
          400: "hsl(var(--warning-400))",
          500: "hsl(var(--warning-500))",
          600: "hsl(var(--warning-600))",
        },
        error: {
          400: "hsl(var(--error-400))",
          500: "hsl(var(--error-500))",
          600: "hsl(var(--error-600))",
        },
        neutral: {
          300: "hsl(var(--neutral-300))",
          400: "hsl(var(--neutral-400))",
          500: "hsl(var(--neutral-500))",
          600: "hsl(var(--neutral-600))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      backgroundImage: {
        "gradient-navy":
          "linear-gradient(135deg, hsl(var(--navy-900)), hsl(var(--navy-800)), hsl(var(--navy-700)))",
        "gradient-primary":
          "linear-gradient(135deg, hsl(var(--primary-600)), hsl(var(--primary-700)))",
        "gradient-success":
          "linear-gradient(135deg, hsl(var(--success-500)), hsl(var(--success-600)))",
        "gradient-warning":
          "linear-gradient(135deg, hsl(var(--warning-500)), hsl(var(--warning-600)))",
        "gradient-error":
          "linear-gradient(135deg, hsl(var(--error-500)), hsl(var(--error-600)))",
        "gradient-glass":
          "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        "gradient-shimmer":
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
      },
      spacing: {
        unit: "var(--space-unit)",
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)",
        "2xl": "var(--space-2xl)",
        sidebar: "var(--sidebar-width)",
        header: "var(--header-height)",
      },
      borderRadius: {
        premium: "var(--border-radius-premium)",
        luxury: "var(--border-radius-luxury)",
        card: "var(--card-radius)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "monospace"],
        inter: ["Inter", "sans-serif"],
        "sf-pro": ["SF Pro Display", "sans-serif"],
      },
      fontSize: {
        display: [
          "3rem",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.025em",
            fontWeight: "800",
          },
        ],
        h1: [
          "2.25rem",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.025em",
            fontWeight: "700",
          },
        ],
        h2: [
          "1.875rem",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.025em",
            fontWeight: "600",
          },
        ],
        h3: [
          "1.5rem",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.025em",
            fontWeight: "600",
          },
        ],
        body: [
          "1rem",
          {
            lineHeight: "1.6",
            letterSpacing: "normal",
            fontWeight: "400",
          },
        ],
        "body-medium": [
          "1rem",
          {
            lineHeight: "1.6",
            fontWeight: "500",
          },
        ],
        small: [
          "0.875rem",
          {
            lineHeight: "1.4",
            fontWeight: "500",
          },
        ],
        xs: [
          "0.75rem",
          {
            lineHeight: "1.4",
            fontWeight: "500",
          },
        ],
      },
      boxShadow: {
        "layer-1": "var(--shadow-layer-1)",
        "layer-2": "var(--shadow-layer-2)",
        "layer-3": "var(--shadow-layer-3)",
        "layer-4": "var(--shadow-layer-4)",
        "layer-5": "var(--shadow-layer-5)",
        premium: "var(--shadow-premium)",
        luxury: "var(--shadow-luxury)",
        enterprise: "var(--shadow-enterprise)",
        inner: "var(--shadow-inner)",
        "inner-deep": "var(--shadow-inner-deep)",
        "glow-primary": "var(--glow-primary)",
        "glow-success": "var(--glow-success)",
        "glow-warning": "var(--glow-warning)",
        "glow-error": "var(--glow-error)",
      },
      backdropBlur: {
        glass: "20px",
        "glass-light": "16px",
        "glass-heavy": "24px",
      },
      transitionTimingFunction: {
        premium: "var(--transition-premium)",
        smooth: "var(--transition-smooth)",
        bounce: "var(--transition-bounce)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in-premium": {
          from: {
            opacity: "0",
            transform: "translateY(8px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in-stagger": {
          from: {
            opacity: "0",
            transform: "translateX(-16px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "var(--shadow-premium)",
          },
          "50%": {
            boxShadow: "var(--shadow-premium), var(--glow-primary)",
          },
        },
        "shimmer-premium": {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-4px)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
        "scan-line": {
          "0%": {
            transform: "translateY(-100%)",
          },
          "100%": {
            transform: "translateY(100vh)",
          },
        },
        "matrix-rain": {
          "0%": {
            transform: "translateY(-10px)",
            opacity: "0",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateY(100px)",
            opacity: "0",
          },
        },
        "neural-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "0.8",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "1",
          },
        },
        "holographic-shift": {
          "0%, 100%": {
            filter: "hue-rotate(0deg)",
          },
          "50%": {
            filter: "hue-rotate(180deg)",
          },
        },
        "cyberpunk-glow": {
          "0%, 100%": {
            boxShadow: "0 0 5px currentColor",
          },
          "50%": {
            boxShadow: "0 0 20px currentColor, 0 0 30px currentColor",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-premium":
          "fade-in-premium var(--duration-normal) var(--transition-premium)",
        "slide-in-stagger":
          "slide-in-stagger var(--duration-normal) var(--transition-premium)",
        "glow-pulse": "glow-pulse 2s var(--transition-smooth) infinite",
        "shimmer-premium": "shimmer-premium 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scan-line": "scan-line 4s linear infinite",
        "matrix-rain": "matrix-rain 2s linear infinite",
        "neural-pulse": "neural-pulse 2s ease-in-out infinite",
        "holographic-shift": "holographic-shift 3s ease-in-out infinite",
        "cyberpunk-glow": "cyberpunk-glow 1.5s ease-in-out infinite",
      },
      maxWidth: {
        content: "var(--content-max-width)",
        enterprise: "1800px",
      },
      backdropFilter: {
        none: "none",
        blur: "blur(20px)",
      },
      aspectRatio: {
        golden: "1.618",
        "golden-inverse": "0.618",
      },
    },
  },
  plugins: [
    // Plugin for glass morphism utilities
    function ({ addUtilities }) {
      const glassUtilities = {
        ".glass-primary": {
          background: "var(--glass-primary)",
          "backdrop-filter": "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
          border: "1px solid var(--glass-border)",
          "box-shadow": "var(--shadow-premium)",
        },
        ".glass-secondary": {
          background: "var(--glass-secondary)",
          "backdrop-filter": "blur(16px)",
          "-webkit-backdrop-filter": "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          "box-shadow": "var(--shadow-layer-1), var(--shadow-layer-2)",
        },
        ".glass-luxury": {
          background: "var(--glass-tertiary)",
          "backdrop-filter": "blur(24px)",
          "-webkit-backdrop-filter": "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          "box-shadow": "var(--shadow-luxury)",
        },
        ".card-premium": {
          background: "var(--glass-primary)",
          "backdrop-filter": "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
          border: "1px solid var(--glass-border)",
          "border-radius": "var(--card-radius)",
          "box-shadow": "var(--shadow-premium)",
          transition: "all var(--duration-normal) var(--transition-premium)",
        },
        ".card-premium:hover": {
          transform: "translateY(-2px) scale(1.02)",
          "box-shadow": "var(--shadow-luxury), var(--glow-primary)",
          "border-color": "rgba(59, 130, 246, 0.3)",
        },
        ".btn-premium": {
          background:
            "linear-gradient(135deg, hsl(var(--primary-600)), hsl(var(--primary-700)))",
          color: "hsl(var(--primary-foreground))",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          "border-radius": "var(--border-radius-premium)",
          padding: "12px 24px",
          "font-weight": "600",
          "font-size": "0.875rem",
          "letter-spacing": "-0.01em",
          "box-shadow": "var(--shadow-premium)",
          transition: "all var(--duration-normal) var(--transition-premium)",
          position: "relative",
          overflow: "hidden",
        },
        ".btn-premium:hover": {
          transform: "translateY(-1px)",
          "box-shadow": "var(--shadow-luxury), var(--glow-primary)",
        },
      };

      addUtilities(glassUtilities);
    },
    require("tailwindcss-animate"),
  ],
};
