"use client";

import React, { useState, useEffect } from "react";
import { Menu, Bell, Search, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/locale-switcher";

interface HeaderProps {
  onMenuToggle?: () => void;
  className?: string;
}

// Get locale from URL or use default
const useCurrentLocale = () => {
  const [locale, setLocale] = useState<"en" | "nl">("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const localeFromPath = pathname.startsWith("/nl") ? "nl" : "en";
      setLocale(localeFromPath);
    }
  }, []);

  return locale;
};

// Hardcoded translations
const translations = {
  en: {
    subtitle: "Business Intelligence Platform",
    searchPlaceholder: "Search...",
    search: "Search",
    notifications: "Notifications",
    revenueAlert: "Revenue Alert",
    monthlyIncreaseMessage: "Monthly revenue increased by 15%",
    hoursAgo: "hours ago",
    johnDoe: "John Doe",
    administrator: "Administrator",
    sampleEmail: "john@company.com",
    settings: "Settings",
    logout: "Logout",
  },
  nl: {
    subtitle: "Business Intelligence Platform",
    searchPlaceholder: "Zoeken...",
    search: "Zoeken",
    notifications: "Meldingen",
    revenueAlert: "Omzet Melding",
    monthlyIncreaseMessage: "Maandelijkse omzet steeg met 15%",
    hoursAgo: "uur geleden",
    johnDoe: "John Doe",
    administrator: "Beheerder",
    sampleEmail: "john@bedrijf.nl",
    settings: "Instellingen",
    logout: "Uitloggen",
  },
};

export function Header({ onMenuToggle, className }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const locale = useCurrentLocale();
  const t = translations[locale];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border",
        "h-16 flex items-center justify-between px-4 lg:px-6",
        "dark:bg-slate-900/80",
        className
      )}
    >
      {/* Left Section - Menu & Logo */}
      <div className="flex items-center gap-4">
        <NormalButton
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </NormalButton>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BI</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">
              Intelligence Hub
            </h1>
            <p className="text-xs text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Center Section - Search (hidden on mobile) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                     placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right Section - Actions & User */}
      <div className="flex items-center gap-2">
        {/* Search button for mobile */}
        <NormalButton
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label={t.search}
        >
          <Search className="h-5 w-5" />
        </NormalButton>

        {/* Language Switcher */}
        <LocaleSwitcher />

        {/* Notifications */}
        <div className="relative">
          <NormalButton
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full text-[10px] text-error-foreground flex items-center justify-center">
              3
            </span>
          </NormalButton>

          {/* Notifications dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-border">
                <h3 className="font-medium text-sm">{t.notifications}</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="px-4 py-3 hover:bg-muted/50 cursor-pointer"
                  >
                    <p className="text-sm font-medium">{t.revenueAlert}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.monthlyIncreaseMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      2 {t.hoursAgo}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <NormalButton
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium">{t.johnDoe}</p>
              <p className="text-xs text-muted-foreground">{t.administrator}</p>
            </div>
          </NormalButton>

          {/* Profile dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="font-medium text-sm">{t.johnDoe}</p>
                <p className="text-xs text-muted-foreground">{t.sampleEmail}</p>
              </div>
              <NormalButton className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t.settings}
              </NormalButton>
              <NormalButton className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 text-error">
                <LogOut className="h-4 w-4" />
                {t.logout}
              </NormalButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
