"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/hooks/use-rbac";
import { useTranslation } from "@/lib/i18n/client-provider";
import {
  BarChart3,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  HelpCircle,
  Target,
  MessageSquare,
  FileText,
  PieChart,
  Activity,
  Zap,
  TrendingDown,
  Monitor,
  Shield,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  Brain,
} from "lucide-react";

export type DashboardMode =
  | "executive"
  | "finance"
  | "marketing"
  | "admin"
  | "research";

interface EnhancedSidebarProps {
  currentMode: DashboardMode;
  isExpanded: boolean;
  onToggle: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  modes: DashboardMode[];
}

// Navigation items organized by mode
const navigationItems: NavigationItem[] = [
  // Executive Mode
  {
    name: "Executive Overview",
    href: "/",
    icon: BarChart3,
    description: "High-level business overview",
    modes: ["executive"],
  },
  {
    name: "Command Center",
    href: "/command-center",
    icon: Monitor,
    description: "Next-generation enterprise marketing command center",
    modes: ["executive", "marketing"],
  },
  {
    name: "Performance Dashboard",
    href: "/performance",
    icon: Activity,
    description: "KPIs and performance metrics",
    modes: ["executive"],
  },
  {
    name: "Customer Intelligence",
    href: "/customer-intelligence",
    icon: Users,
    description: "Customer insights and analytics",
    modes: ["executive"],
  },

  // Finance Mode
  {
    name: "Financial Overview",
    href: "/financial",
    icon: DollarSign,
    description: "Financial dashboard and metrics",
    modes: ["finance"],
  },
  {
    name: "Revenue Analytics",
    href: "/revenue-analytics",
    icon: TrendingUp,
    description: "Revenue tracking and analysis",
    modes: ["finance"],
  },
  {
    name: "Financial Reports",
    href: "/reports",
    icon: FileText,
    description: "Generated financial reports",
    modes: ["finance"],
  },
  {
    name: "Budget Management",
    href: "/budget",
    icon: PieChart,
    description: "Budget planning and tracking",
    modes: ["finance"],
  },
  {
    name: "Cash Flow Analysis",
    href: "/cash-flow",
    icon: TrendingDown,
    description: "Cash flow insights",
    modes: ["finance"],
  },

  // Marketing Mode
  {
    name: "Marketing Command Center",
    href: "/marketing-oversight",
    icon: Monitor,
    description: "Complete marketing operations oversight and control",
    modes: ["marketing"],
    badge: "Command",
  },
  {
    name: "Command Center",
    href: "/command-center",
    icon: Zap,
    description: "Next-generation enterprise marketing command center",
    modes: ["marketing"],
    badge: "Command",
  },
  {
    name: "Marketing Overview",
    href: "/marketing",
    icon: Target,
    description: "Marketing dashboard and KPIs",
    modes: ["marketing"],
  },
  {
    name: "Social Accounts",
    href: "/social-accounts",
    icon: Share2,
    description: "Social media management and oversight",
    modes: ["marketing"],
  },
  {
    name: "Campaign Analytics",
    href: "/campaigns",
    icon: Zap,
    description: "Campaign performance tracking",
    modes: ["marketing"],
  },
  {
    name: "Customer Insights",
    href: "/customer-insights",
    icon: Users,
    description: "Customer behavior and segments",
    modes: ["marketing"],
  },
  {
    name: "Content Performance",
    href: "/content",
    icon: FileText,
    description: "Content analytics and ROI",
    modes: ["marketing"],
  },
  {
    name: "Market Analysis",
    href: "/market-analysis",
    icon: BarChart3,
    description: "Market trends and analysis",
    modes: ["marketing"],
  },
  {
    name: "Marketing Intelligence",
    href: "/marketing-intelligence",
    icon: Brain,
    description: "AI-powered marketing intelligence",
    modes: ["marketing"],
  },
  {
    name: "Live Test Dashboard",
    href: "/live-test-dashboard",
    icon: Zap,
    description: "Real-time 5-channel content testing",
    modes: ["marketing"],
    badge: "Live",
  },

  // Admin Mode
  {
    name: "Admin Dashboard",
    href: "/admin-dashboard",
    icon: Shield,
    description: "Master command center administration",
    modes: ["admin"],
    badge: "Command",
  },
  {
    name: "User Management",
    href: "/admin-dashboard?tab=users",
    icon: Users,
    description: "RBAC en gebruikersrechten beheer",
    modes: ["admin"],
  },
  {
    name: "System Health",
    href: "/admin-dashboard?tab=health",
    icon: Activity,
    description: "Real-time monitoring van system performance",
    modes: ["admin"],
  },
  {
    name: "Security Dashboard",
    href: "/admin-dashboard?tab=security",
    icon: Shield,
    description: "Beveiligingsmonitoring en compliance",
    modes: ["admin"],
  },
  {
    name: "Performance Monitor",
    href: "/admin-dashboard?tab=performance",
    icon: Monitor,
    description: "Load testing en performance optimalisatie",
    modes: ["admin"],
  },
  {
    name: "Business Analytics",
    href: "/admin-dashboard?tab=analytics",
    icon: BarChart3,
    description: "Revenue tracking en business intelligence",
    modes: ["admin"],
  },
  {
    name: "Export & Reports",
    href: "/admin-dashboard?tab=export",
    icon: FileDown,
    description: "Data export, rapportage en notificaties",
    modes: ["admin"],
  },
  {
    name: "Audit Logs",
    href: "/admin-dashboard?tab=audit",
    icon: FileText,
    description: "System audit en logs beheer",
    modes: ["admin"],
  },

  // Research Mode
  {
    name: "Research Overview",
    href: "/research",
    icon: Activity,
    description: "Market intelligence and competitive analysis",
    modes: ["research"],
    badge: "Intelligence",
  },
  {
    name: "Trend Analysis",
    href: "/research/trends",
    icon: TrendingUp,
    description: "Market trends and pattern analysis",
    modes: ["research"],
  },
  {
    name: "Competitor Analysis",
    href: "/research/competitors",
    icon: Users,
    description: "Competitive intelligence monitoring",
    modes: ["research"],
  },
  {
    name: "Market Insights",
    href: "/research/insights",
    icon: Brain,
    description: "AI-powered market insights and opportunities",
    modes: ["research"],
  },
  {
    name: "Data Mining",
    href: "/research/data-mining",
    icon: FileText,
    description: "Research data mining and extraction",
    modes: ["research"],
  },

  // Shared Navigation
  {
    name: "Advanced Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Deep dive analytics",
    modes: ["executive", "finance", "marketing", "research"],
  },
  {
    name: "Reports Center",
    href: "/reports-center",
    icon: FileText,
    description: "All reports and exports",
    modes: ["executive", "finance", "marketing"],
  },
  {
    name: "Calendar & Events",
    href: "/calendar",
    icon: Calendar,
    description: "Scheduling and events",
    modes: ["executive", "finance", "marketing"],
  },
];

// System navigation (always visible)
const systemNavigation: NavigationItem[] = [
  {
    name: "Admin Dashboard",
    href: "/admin-dashboard",
    icon: Shield,
    description: "Master command center administration",
    badge: "Admin",
    modes: ["executive", "finance", "marketing"],
  },
  {
    name: "Admin Responsive Demo",
    href: "/admin-dashboard-responsive-demo",
    icon: Monitor,
    description: "Responsive admin UI showcase",
    badge: "Demo",
    modes: ["executive", "finance", "marketing"],
  },
  {
    name: "Enterprise Contracts",
    href: "/admin/enterprise-contracts",
    icon: FileText,
    description: "Scale-up contract management",
    badge: "Enterprise",
    modes: ["executive", "finance", "marketing"],
  },
  {
    name: "AI Assistant",
    href: "/assistant",
    icon: MessageSquare,
    description: "AI-powered business assistant",
    badge: "Beta",
    modes: ["executive", "finance", "marketing"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration",
    modes: ["executive", "finance", "marketing"],
  },
  {
    name: "Help & Support",
    href: "/help",
    icon: HelpCircle,
    description: "Documentation and support",
    modes: ["executive", "finance", "marketing"],
  },
];

export function EnhancedSidebar({
  currentMode,
  isExpanded,
  onToggle: _onToggle,
}: EnhancedSidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useIsAdmin();
  const { locale } = useTranslation();
  // In demo/development mode, allow access to admin features
  const isDemoMode =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const hasAdminAccess = isAdmin || isDemoMode;

  // Helper function to add locale prefix to routes
  const withLocale = (href: string) => {
    if (href.startsWith("/")) {
      return `/${locale}${href}`;
    }
    return href;
  };

  // Filter navigation items based on current mode and admin permissions
  const filteredNavigation = navigationItems.filter(item => {
    const hasMode = item.modes.includes(currentMode);
    const isAdminItem = item.modes.includes("admin");

    // If it's an admin item but user is not admin, hide it
    if (isAdminItem && !hasAdminAccess) {
      return false;
    }

    return hasMode;
  });

  const getModeColor = () => {
    switch (currentMode) {
      case "finance":
        return "text-blue-400 border-blue-400";
      case "marketing":
        return "text-purple-400 border-purple-400";
      case "executive":
        return "text-emerald-400 border-emerald-400";
      case "admin":
        return "text-red-400 border-red-400";
      case "research":
        return "text-orange-400 border-orange-400";
      default:
        return "text-slate-400 border-slate-400";
    }
  };

  const getModeGradient = () => {
    switch (currentMode) {
      case "finance":
        return "from-blue-500/10 to-blue-600/5";
      case "marketing":
        return "from-purple-500/10 to-purple-600/5";
      case "executive":
        return "from-emerald-500/10 to-emerald-600/5";
      case "admin":
        return "from-red-500/10 to-red-600/5";
      case "research":
        return "from-orange-500/10 to-orange-600/5";
      default:
        return "from-slate-500/10 to-slate-600/5";
    }
  };

  const getModeIcon = () => {
    switch (currentMode) {
      case "finance":
        return DollarSign;
      case "marketing":
        return Target;
      case "executive":
        return BarChart3;
      case "admin":
        return Shield;
      case "research":
        return Activity;
      default:
        return DollarSign;
    }
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div
          className={cn(
            "flex items-center gap-3",
            !isExpanded && "justify-center"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br",
              getModeGradient(),
              "border",
              getModeColor()
            )}
          >
            {React.createElement(getModeIcon(), {
              className: "w-4 h-4 text-white",
            })}
          </div>
          {isExpanded && (
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-white">
                Intelligence Hub
              </h2>
              <p className="text-xs text-slate-400 capitalize">
                {currentMode} Mode
              </p>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={_onToggle}
            className={cn(
              "p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white",
              !isExpanded && "mt-0"
            )}
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col h-full">
        <nav className="flex-1 p-4 space-y-6">
          {/* Mode-specific Navigation */}
          <div className="space-y-2">
            {isExpanded && (
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {currentMode} Dashboard
              </h3>
            )}
            {filteredNavigation.map(item => {
              const Icon = item.icon;
              const isActive = pathname === withLocale(item.href);

              return (
                <Link
                  key={item.href}
                  href={withLocale(item.href)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r " +
                          getModeGradient() +
                          " " +
                          getModeColor() +
                          " bg-opacity-20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800",
                    !isExpanded && "justify-center"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && (
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  )}
                  {isExpanded && item.badge && (
                    <span className="px-2 py-1 text-xs font-medium text-slate-400 bg-slate-800 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* System Navigation */}
          <div className="border-t border-slate-800 pt-4 space-y-2">
            {isExpanded && (
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                System
              </h3>
            )}
            {systemNavigation
              .filter(item => {
                // Filter admin-related items based on user permissions
                const isAdminItem = item.name.toLowerCase().includes("admin");
                return !isAdminItem || hasAdminAccess;
              })
              .map(item => {
                const Icon = item.icon;
                const isActive = pathname === withLocale(item.href);

                return (
                  <Link
                    key={item.href}
                    href={withLocale(item.href)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800",
                      !isExpanded && "justify-center"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && (
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-slate-500 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                    )}
                    {isExpanded && item.badge && (
                      <span className="px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          {isExpanded && (
            <div className="text-xs text-slate-500">
              <p>© 2024 FutureMarketingAI</p>
              <p>Enterprise Edition</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
