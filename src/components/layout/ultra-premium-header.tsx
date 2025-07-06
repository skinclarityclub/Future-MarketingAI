"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  Globe,
  Menu,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

interface UltraPremiumHeaderProps {
  onMenuToggle?: () => void;
  className?: string;
}

export function UltraPremiumHeader({
  onMenuToggle,
  className,
}: UltraPremiumHeaderProps) {
  const { t, locale, setLocale } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale);
    setIsLangMenuOpen(false);
  };

  const notifications = [
    { id: 1, type: "success", message: "Revenue target exceeded", time: "2m" },
    { id: 2, type: "info", message: "Monthly report ready", time: "15m" },
    { id: 3, type: "warning", message: "API rate limit warning", time: "1h" },
  ];

  return (
    <header
      className={cn(
        // Base layout and positioning
        "fixed top-0 left-0 right-0 z-50",
        "h-[72px] flex items-center justify-between px-6 lg:px-8",

        // Ultra-premium background with complex gradient
        "bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95",
        "backdrop-blur-xl border-b border-slate-700/50",

        // Subtle pattern overlay
        "before:absolute before:inset-0",
        "before:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)]",
        "before:bg-[length:24px_24px] before:opacity-30",

        // Edge lighting effect
        "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px",
        "after:bg-gradient-to-r after:from-transparent after:via-blue-400/50 after:to-transparent",

        // Shadow and glow
        "shadow-2xl shadow-black/20",

        className
      )}
    >
      {/* Mobile menu button */}
      <NormalButton
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl hover:bg-slate-800/50 transition-all duration-200"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-slate-300" />
      </NormalButton>

      {/* Logo and Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg blur opacity-75" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
              SkinClarity
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-blue-400 to-transparent" />
          </div>
        </div>
      </div>

      {/* Advanced Search with Intelligence */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                t("dashboard.searchPlaceholder") ||
                "Search insights, metrics, reports..."
              }
              className={cn(
                "w-full pl-12 pr-4 py-3 rounded-xl",
                "bg-slate-800/50 border border-slate-600/30",
                "text-slate-200 placeholder-slate-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50",
                "hover:bg-slate-800/70 transition-all duration-200",
                "backdrop-blur-sm"
              )}
            />
            {searchQuery && (
              <div className="absolute right-4 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                AI Enhanced
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="relative">
          <NormalButton
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl",
              "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30",
              "text-slate-300 hover:text-slate-200 transition-all duration-200",
              "backdrop-blur-sm"
            )}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">
              {locale === "en" ? "🇺🇸 EN" : "🇳🇱 NL"}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isLangMenuOpen && "rotate-180"
              )}
            />
          </NormalButton>

          {/* Language dropdown */}
          {isLangMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
              <NormalButton
                onClick={() => handleLanguageChange("en")}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors"
              >
                <span>🇺🇸</span>
                <span className="text-sm text-slate-300">English</span>
              </NormalButton>
              <NormalButton
                onClick={() => handleLanguageChange("nl")}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors"
              >
                <span>🇳🇱</span>
                <span className="text-sm text-slate-300">Nederlands</span>
              </NormalButton>
            </div>
          )}
        </div>

        {/* Notification Center */}
        <div className="relative group">
          <NormalButton className="relative p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 transition-all duration-200 backdrop-blur-sm">
            <Bell className="w-5 h-5 text-slate-300 group-hover:text-slate-200" />
            {notifications.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {notifications.length}
                </span>
              </div>
            )}
          </NormalButton>

          {/* Notification dropdown would go here */}
        </div>

        {/* User Profile */}
        <div className="relative">
          <NormalButton
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl",
              "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30",
              "transition-all duration-200 backdrop-blur-sm"
            )}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-sm font-medium text-slate-200">
                Executive User
              </div>
              <div className="text-xs text-slate-400">Administrator</div>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                isUserMenuOpen && "rotate-180"
              )}
            />
          </NormalButton>

          {/* User dropdown */}
          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-700/50">
                <div className="text-sm font-medium text-slate-200">
                  Executive Dashboard
                </div>
                <div className="text-xs text-slate-400">
                  Premium Business Intelligence
                </div>
              </div>
              <div className="p-2">
                <NormalButton className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Settings</span>
                </NormalButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handlers */}
      {(isUserMenuOpen || isLangMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsLangMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}
