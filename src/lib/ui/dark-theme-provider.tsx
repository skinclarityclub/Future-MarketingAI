"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface DarkThemeContextType {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  toggleTheme: () => void;
}

const DarkThemeContext = createContext<DarkThemeContextType | undefined>(
  undefined
);

export function useDarkTheme() {
  const context = useContext(DarkThemeContext);
  if (context === undefined) {
    throw new Error("useDarkTheme must be used within a DarkThemeProvider");
  }
  return context;
}

interface DarkThemeProviderProps {
  children: React.ReactNode;
  defaultDark?: boolean;
}

export function DarkThemeProvider({
  children,
  defaultDark = true,
}: DarkThemeProviderProps) {
  const [isDark, setIsDark] = useState(defaultDark);

  useEffect(() => {
    // Apply dark class to document root
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark", "bg-slate-950", "text-slate-100");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark", "bg-slate-950", "text-slate-100");
      document.body.classList.add("bg-white", "text-slate-900");
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDark ? "#0f172a" : "#ffffff");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value = {
    isDark,
    setIsDark,
    toggleTheme,
  };

  return (
    <DarkThemeContext.Provider value={value}>
      {children}
    </DarkThemeContext.Provider>
  );
}

// Premium dark theme utility classes
export const premiumDarkTheme = {
  // Background gradients
  backgrounds: {
    primary: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
    secondary:
      "bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90",
    card: "bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02]",
    glass: "bg-white/[0.03] backdrop-blur-xl",
  },

  // Border colors
  borders: {
    primary: "border-slate-700/50",
    secondary: "border-slate-600/30",
    accent: "border-blue-500/30",
    hover: "hover:border-slate-600/70",
  },

  // Text colors
  text: {
    primary: "text-slate-100",
    secondary: "text-slate-300",
    muted: "text-slate-400",
    accent: "text-blue-400",
  },

  // Shadow configurations
  shadows: {
    sm: "shadow-black/5",
    md: "shadow-black/10",
    lg: "shadow-black/20",
    xl: "shadow-black/30",
    glow: "shadow-blue-500/20",
  },

  // Interactive states
  interactive: {
    hover: "hover:bg-white/[0.05] transition-colors duration-200",
    active: "active:bg-white/[0.1]",
    focus: "focus:ring-2 focus:ring-blue-500/50 focus:outline-none",
  },
} as const;

// Utility function to get consistent dark theme classes
export function getDarkThemeClasses(
  variant: keyof typeof premiumDarkTheme.backgrounds = "primary"
) {
  return {
    background: premiumDarkTheme.backgrounds[variant],
    border: premiumDarkTheme.borders.primary,
    text: premiumDarkTheme.text.primary,
    shadow: premiumDarkTheme.shadows.md,
    interactive: premiumDarkTheme.interactive.hover,
  };
}
