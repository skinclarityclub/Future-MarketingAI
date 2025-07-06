"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  HelpCircle,
  Settings,
  X,
  ListTodo,
  Search,
  Workflow,
  Share2,
  Target,
  Brain,
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  description?: string;
  titleNl: string;
  descriptionNl?: string;
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
    navigation: "Navigation",
    closeSidebar: "Close sidebar",
    needHelp: "Need Help?",
    helpDescription: "Check our documentation or contact support",
    learnMore: "Learn more →",
    new: "New",
  },
  nl: {
    navigation: "Navigatie",
    closeSidebar: "Sidebar sluiten",
    needHelp: "Hulp nodig?",
    helpDescription: "Bekijk onze documentatie of neem contact op met support",
    learnMore: "Meer informatie →",
    new: "Nieuw",
  },
};

const navItems: NavItem[] = [
  {
    title: "Command Overview",
    titleNl: "Command Overzicht",
    href: "/",
    icon: Target,
    description: "Marketing command center",
    descriptionNl: "Marketing command center",
  },
  {
    title: "Social Accounts",
    titleNl: "Social Accounts",
    href: "/social-accounts",
    icon: Share2,
    description: "Social media management",
    descriptionNl: "Social media beheer",
  },
  {
    title: "Research",
    titleNl: "Research",
    href: "/research",
    icon: Search,
    description: "Market research & insights",
    descriptionNl: "Marktonderzoek & inzichten",
  },
  {
    title: "WorkFlow Control",
    titleNl: "WorkFlow Control",
    href: "/workflow-control",
    icon: Workflow,
    description: "Process automation & control",
    descriptionNl: "Proces automatisering & controle",
  },
  {
    title: "Tasklist",
    titleNl: "Takenlijst",
    href: "/clickup-tasks",
    icon: ListTodo,
    badge: "New",
    description: "ClickUp content workflow",
    descriptionNl: "ClickUp content workflow",
  },
  {
    title: "Agenda/Planning",
    titleNl: "Agenda/Planning",
    href: "/calendar",
    icon: Calendar,
    description: "Schedule & content planning",
    descriptionNl: "Planning & content planning",
  },
  {
    title: "Analytics",
    titleNl: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Performance analytics",
    descriptionNl: "Prestatie analytics",
  },
  {
    title: "Marketing/Business Intel",
    titleNl: "Marketing/Business Intel",
    href: "/marketing-intelligence",
    icon: Brain,
    description: "AI-powered marketing intelligence",
    descriptionNl: "AI-gestuurde marketing intelligentie",
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: "Settings",
    titleNl: "Instellingen",
    href: "/settings",
    icon: Settings,
    description: "Dashboard configuration",
    descriptionNl: "Dashboard configuratie",
  },
  {
    title: "Help & Support",
    titleNl: "Hulp & Ondersteuning",
    href: "/help",
    icon: HelpCircle,
    description: "Documentation and support",
    descriptionNl: "Documentatie en ondersteuning",
  },
];

export function Sidebar({ isOpen, onClose, className }: SidebarProps) {
  const pathname = usePathname();
  const locale = useCurrentLocale();
  const t = translations[locale];

  const isActive = (href: string) => {
    const localizedHref = `/${locale}${href}`;
    if (href === "/")
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname.startsWith(localizedHref);
  };

  const getLocalizedHref = (href: string) => {
    return `/${locale}${href}`;
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const localizedHref = getLocalizedHref(item.href);

    return (
      <Link
        href={localizedHref as any}
        onClick={() => {
          // Close sidebar on mobile after navigation
          if (window.innerWidth < 1024) {
            onClose();
          }
        }}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          "hover:bg-muted/50 hover:text-foreground",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            active && "text-primary-foreground"
          )}
        />
        <div className="flex-1 truncate">
          <div className="flex items-center justify-between">
            <span>{locale === "nl" ? item.titleNl : item.title}</span>
            {item.badge && (
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-medium",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                )}
              >
                {t.new}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-0.5 group-hover:text-muted-foreground/80">
              {locale === "nl" ? item.descriptionNl : item.description}
            </p>
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform transition-transform duration-300 ease-in-out",
          "bg-background/95 backdrop-blur-sm border-r border-border",
          "flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:h-auto lg:z-30",
          className
        )}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <h2 className="font-semibold text-foreground">{t.navigation}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label={t.closeSidebar}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {navItems.map(item => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-border" />

          {/* Bottom Navigation */}
          <nav className="space-y-1">
            {bottomNavItems.map(item => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-foreground mb-1">
              {t.needHelp}
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              {t.helpDescription}
            </p>
            <Link
              href={`/${locale}/help` as any}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              {t.learnMore}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
