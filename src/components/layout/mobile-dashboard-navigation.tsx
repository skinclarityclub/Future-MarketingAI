"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/context";
import {
  Home,
  BarChart3,
  DollarSign,
  TrendingUp,
  Shield,
  Search,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface MobileNavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

const mobileNavigationItems: MobileNavigationItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    id: "executive",
    label: "Executive",
    href: "/executive-dashboard",
    icon: BarChart3,
  },
  {
    id: "finance",
    label: "Finance",
    href: "/finance",
    icon: DollarSign,
  },
  {
    id: "marketing",
    label: "Marketing",
    href: "/marketing",
    icon: TrendingUp,
  },
  {
    id: "research",
    label: "Research",
    href: "/research",
    icon: Search,
    badge: "New",
  },
  {
    id: "admin",
    label: "Admin",
    href: "/admin-dashboard",
    icon: Shield,
  },
];

interface MobileDashboardNavigationProps {
  currentMode?: string;
  className?: string;
}

export function MobileDashboardNavigation({
  currentMode,
  className,
}: MobileDashboardNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { locale } = useLocale();

  // Helper function to add locale prefix to routes
  const withLocale = (href: string) => {
    if (href.startsWith("/")) {
      return `/${locale}${href}`;
    }
    return href;
  };

  const toggleNavigation = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleNavigation}
        className={cn(
          "lg:hidden fixed top-4 left-4 z-50",
          "p-3 rounded-xl",
          "bg-slate-900/80 backdrop-blur-md",
          "border border-slate-700/50",
          "text-slate-300 hover:text-white",
          "transition-all duration-200",
          "hover:bg-slate-800/80 hover:border-slate-600/50",
          "active:scale-95",
          className
        )}
        aria-label="Toggle Navigation"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Navigation Panel */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                duration: 0.3,
              }}
              className="lg:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw] z-50"
            >
              {/* Navigation Content */}
              <div className="h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-700/50">
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Intelligence Hub
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Business Intelligence
                      </p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-4">
                  <nav className="px-4 space-y-2">
                    {mobileNavigationItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = pathname === withLocale(item.href);

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.05,
                            duration: 0.2,
                          }}
                        >
                          <Link
                            href={withLocale(item.href)}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center justify-between",
                              "p-4 rounded-xl transition-all duration-200",
                              "group hover:scale-[1.02]",
                              isActive
                                ? "bg-blue-600/20 border border-blue-500/30 text-blue-400"
                                : "hover:bg-slate-800/50 border border-transparent text-slate-300 hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  isActive
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-slate-800/50 text-slate-400 group-hover:text-white"
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <span className="font-medium">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {item.badge && (
                                <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700/50">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      © 2024 FutureMarketingAI
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Enterprise Business Intelligence
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Mobile Dashboard Bottom Navigation (Alternative/Additional option)
export function MobileBottomNavigation({
  currentMode,
  className,
}: MobileDashboardNavigationProps) {
  const pathname = usePathname();
  const { locale } = useLocale();

  // Helper function to add locale prefix to routes
  const withLocale = (href: string) => {
    if (href.startsWith("/")) {
      return `/${locale}${href}`;
    }
    return href;
  };

  // Show only main dashboards in bottom nav
  const bottomNavItems = mobileNavigationItems.slice(1, 6); // Skip home, limit to 5 items

  return (
    <div
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-30",
        "bg-slate-950/95 backdrop-blur-lg",
        "border-t border-slate-700/50",
        "safe-area-pb", // Respect iOS safe area
        className
      )}
    >
      <nav className="flex items-center justify-around px-2 py-3">
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === withLocale(item.href);

          return (
            <Link
              key={item.id}
              href={withLocale(item.href)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg",
                "transition-all duration-200 active:scale-95",
                "min-w-0 flex-1",
                isActive
                  ? "text-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-500/20 text-blue-400"
                    : "hover:bg-slate-800/50"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium truncate">{item.label}</span>
              {item.badge && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
