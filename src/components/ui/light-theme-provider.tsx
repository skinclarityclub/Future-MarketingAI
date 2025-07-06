"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Palette, Sun, Moon, Monitor, ChevronDown } from "lucide-react";

type ThemeMode = "dark" | "light" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "futuremarketing-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as ThemeMode;
      if (storedTheme && ["dark", "light", "system"].includes(storedTheme)) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.error("Failed to load theme from localStorage:", error);
    }
    setMounted(true);
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.error("Failed to save theme to localStorage:", error);
    }
  }, [theme, storageKey, mounted]);

  const isDark = mounted
    ? theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    : true; // Default to dark during SSR

  const value = {
    theme,
    setTheme,
    isDark,
  };

  // During SSR and before mounting, render with default theme to prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

interface ThemeToggleProps {
  variant?: "button" | "dropdown" | "compact";
  className?: string;
}

export function ThemeToggle({
  variant = "button",
  className = "",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render theme toggle until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        bg-white/5 border border-white/10 
        transition-all duration-200 ease-premium
        ${className}
      `}
      >
        <Moon className="w-4 h-4" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    );
  }

  const themes = [
    { value: "dark" as const, label: "Dark (Default)", icon: Moon },
    { value: "light" as const, label: "Light Mode", icon: Sun },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  if (variant === "dropdown") {
    return (
      <div className={`relative ${className}`}>
        <NormalButton
          onClick={() => setIsOpen(!isOpen)}
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            bg-white/5 border border-white/10 
            hover:bg-white/10 hover:border-white/20
            transition-all duration-200 ease-premium
            focus:outline-none focus:ring-2 focus:ring-primary-500/50
          "
          aria-label="Toggle theme"
          aria-expanded={isOpen ? "true" : "false"}
        >
          <currentTheme.icon className="w-4 h-4" />
          <span className="text-sm font-medium">{currentTheme.label}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </NormalButton>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div
              className="
              absolute top-full mt-2 right-0 z-50
              min-w-[200px] py-2 rounded-lg
              glass-secondary border border-white/20
              shadow-enterprise backdrop-blur-xl
            "
            >
              {themes.map(themeOption => {
                const Icon = themeOption.icon;
                return (
                  <NormalButton
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2
                      text-left transition-all duration-200 ease-premium
                      hover:bg-white/10 focus:bg-white/10
                      focus:outline-none
                      ${theme === themeOption.value ? "bg-primary-500/20 text-primary-300" : "text-neutral-300"}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {themeOption.label}
                    </span>
                    {theme === themeOption.value && (
                      <div className="w-2 h-2 bg-primary-400 rounded-full ml-auto" />
                    )}
                  </NormalButton>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <NormalButton
        onClick={() => {
          const nextTheme =
            theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
          setTheme(nextTheme);
        }}
        className={`
          p-2 rounded-lg transition-all duration-200 ease-premium
          bg-white/5 border border-white/10
          hover:bg-white/10 hover:border-white/20 hover:shadow-glow-primary
          focus:outline-none focus:ring-2 focus:ring-primary-500/50
          ${className}
        `}
        aria-label={`Switch to ${theme === "dark" ? "light" : theme === "light" ? "system" : "dark"} theme`}
      >
        <currentTheme.icon className="w-4 h-4" />
      </NormalButton>
    );
  }

  // Default button variant
  return (
    <NormalButton
      onClick={() => {
        const nextTheme =
          theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
        setTheme(nextTheme);
      }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        bg-white/5 border border-white/10 
        hover:bg-white/10 hover:border-white/20 hover:shadow-glow-primary
        transition-all duration-200 ease-premium
        focus:outline-none focus:ring-2 focus:ring-primary-500/50
        ${className}
      `}
      aria-label={`Switch to ${theme === "dark" ? "light" : theme === "light" ? "system" : "dark"} theme`}
    >
      <currentTheme.icon className="w-4 h-4" />
      <span className="text-sm font-medium">{currentTheme.label}</span>
    </NormalButton>
  );
}

export function ThemeStatus() {
  const { theme, isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <Palette className="w-3 h-3" />
        <span>Theme: Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-neutral-400">
      <Palette className="w-3 h-3" />
      <span>
        Theme: {theme} {isDark ? "(Dark)" : "(Light)"}
      </span>
    </div>
  );
}

interface LightThemeCardProps {
  children: React.ReactNode;
  variant?: "premium" | "luxury";
  className?: string;
}

export function LightThemeCard({
  children,
  variant = "premium",
  className = "",
}: LightThemeCardProps) {
  if (variant === "luxury") {
    return (
      <div
        className={`
        light-card-luxury relative overflow-hidden
        rounded-xl p-6 transition-all duration-300 ease-premium
        ${className}
      `}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`
      light-card-premium relative overflow-hidden
      rounded-xl p-6 transition-all duration-300 ease-premium
      ${className}
    `}
    >
      {children}
    </div>
  );
}

interface LightKPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ElementType;
  className?: string;
}

export function LightKPICard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  className = "",
}: LightKPICardProps) {
  return (
    <div
      className={`
      light-kpi-card group relative overflow-hidden
      rounded-xl p-6 transition-all duration-300 ease-premium
      hover:shadow-enterprise hover:-translate-y-1
      ${className}
    `}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="light-kpi-label text-sm font-medium">{title}</h3>
          {Icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="light-kpi-value text-2xl font-bold">{value}</div>
          {change && (
            <div
              className={`
              light-kpi-change flex items-center gap-1 text-sm font-medium
              ${trend === "up" ? "positive" : trend === "down" ? "negative" : ""}
            `}
            >
              {change}
            </div>
          )}
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="light-shimmer-effect" />
    </div>
  );
}

interface LightNavItemProps {
  children: React.ReactNode;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function LightNavItem({
  children,
  active = false,
  href,
  onClick,
  className = "",
}: LightNavItemProps) {
  const Component = href ? "a" : "button";

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`
        light-nav-item relative flex items-center gap-3 px-4 py-3
        rounded-lg transition-all duration-200 ease-premium
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        ${active ? "active" : ""}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
