"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Building2,
  TrendingUp,
  Briefcase,
  BarChart3,
  Zap,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useLocale } from "@/lib/i18n/context";
import { useIsAdmin } from "@/hooks/use-rbac";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedHeaderProps {
  onMenuToggle?: () => void;
  className?: string;
  currentMode?: "finance" | "marketing" | "executive" | "admin" | "research";
  onModeChange?: (
    mode: "finance" | "marketing" | "executive" | "admin" | "research"
  ) => void;
}

interface ModeConfig {
  id: "finance" | "marketing" | "executive" | "admin" | "research";
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const modes: ModeConfig[] = [
  {
    id: "finance",
    label: "Finance",
    icon: Building2,
    color: "bg-blue-600 text-white",
    description: "Financial analytics and reporting",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: TrendingUp,
    color: "bg-purple-600 text-white",
    description: "Marketing insights and campaigns",
  },
  {
    id: "executive",
    label: "Executive",
    icon: Briefcase,
    color: "bg-emerald-600 text-white",
    description: "Executive overview and KPIs",
  },
  {
    id: "admin",
    label: "Admin Dashboard",
    icon: Shield,
    color: "bg-red-600 text-white",
    description: "System administration and management",
  },
  {
    id: "research",
    label: "Research Dashboard",
    icon: Search,
    color: "bg-orange-600 text-white",
    description: "Market intelligence and competitive analysis",
  },
];

export function EnhancedHeader({
  onMenuToggle,
  className,
  currentMode = "executive",
  onModeChange,
}: EnhancedHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { t } = useLocale();
  const { isAdmin } = useIsAdmin();
  // In demo/development mode, allow access to admin features
  const isDemoMode =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const hasAdminAccess = isAdmin || isDemoMode;

  const currentModeConfig =
    modes.find(mode => mode.id === currentMode) || modes[2];
  const CurrentModeIcon = currentModeConfig.icon;

  const handleModeChange = (
    mode: "finance" | "marketing" | "executive" | "admin" | "research"
  ) => {
    onModeChange?.(mode);

    // Navigate to the appropriate locale dashboard
    const dashboardRoutes = {
      finance: "/nl/finance",
      marketing: "/nl/marketing",
      executive: "/nl/executive-dashboard",
      admin: "/nl/admin-dashboard",
      research: "/nl/research",
    };

    const route = dashboardRoutes[mode];
    if (route) {
      window.location.href = route;
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50",
        "h-16 flex items-center justify-between px-4 lg:px-6",
        "shadow-sm",
        className
      )}
    >
      {/* Left Section - Menu, Logo & Mode Switcher */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button - Always Visible */}
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-white"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-white">
              Intelligence Hub
            </h1>
            <p className="text-xs text-slate-400">
              {currentModeConfig.description}
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="hidden md:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center h-8 gap-2 text-white border border-slate-700 hover:bg-slate-800 transition-all duration-200 rounded-lg px-3 py-1.5">
                <CurrentModeIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {currentModeConfig.label}
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs hover:opacity-90",
                    currentMode === "finance" &&
                      "bg-blue-600 text-white hover:bg-blue-600",
                    currentMode === "marketing" &&
                      "bg-purple-600 text-white hover:bg-purple-600",
                    currentMode === "executive" &&
                      "bg-emerald-600 text-white hover:bg-emerald-600",
                    currentMode === "admin" &&
                      "bg-red-600 text-white hover:bg-red-600",
                    currentMode === "research" &&
                      "bg-orange-600 text-white hover:bg-orange-600"
                  )}
                >
                  Active
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 bg-slate-900/95 backdrop-blur-xl border-slate-700"
            >
              <DropdownMenuLabel className="text-white">
                Switch Dashboard Mode
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              {modes
                .filter(mode => mode.id !== "admin" || hasAdminAccess)
                .map(mode => {
                  const Icon = mode.icon;
                  const isActive = mode.id === currentMode;

                  return (
                    <DropdownMenuItem
                      key={mode.id}
                      onClick={() => handleModeChange(mode.id)}
                      className={cn(
                        "flex items-center gap-3 cursor-pointer text-white hover:bg-slate-800",
                        isActive && "bg-slate-800"
                      )}
                    >
                      <div className={cn("p-1.5 rounded", mode.color)}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{mode.label}</span>
                          {isActive && (
                            <Badge
                              variant="default"
                              className={cn(
                                "text-xs hover:opacity-90",
                                mode.id === "finance" &&
                                  "bg-blue-600 text-white hover:bg-blue-600",
                                mode.id === "marketing" &&
                                  "bg-purple-600 text-white hover:bg-purple-600",
                                mode.id === "executive" &&
                                  "bg-emerald-600 text-white hover:bg-emerald-600",
                                mode.id === "admin" &&
                                  "bg-red-600 text-white hover:bg-red-600",
                                mode.id === "research" &&
                                  "bg-orange-600 text-white hover:bg-orange-600"
                              )}
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {mode.description}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Center Section - Enhanced Search */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder={`Search ${currentModeConfig.label.toLowerCase()} data...`}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder:text-slate-400"
          />
          {searchValue && (
            <NormalButton
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </NormalButton>
          )}
        </div>
      </div>

      {/* Right Section - Actions & User Profile */}
      <div className="flex items-center gap-2">
        {/* Mobile Search */}
        <NormalButton
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label={t("common.search")}
        >
          <Search className="h-5 w-5" />
        </NormalButton>

        {/* Language Switcher */}
        <LocaleSwitcher />

        {/* Dynamic Navigation Button */}
        {currentMode === "admin" && hasAdminAccess ? (
          <Link href="/nl/admin-dashboard">
            <button className="flex items-center h-8 gap-2 text-white border border-red-600/50 bg-red-600/10 hover:bg-red-600/20 hover:border-red-500 transition-all duration-200 rounded-lg px-3 py-1.5">
              <Shield className="h-4 w-4 text-red-400" />
              <span className="hidden sm:inline text-sm font-medium">
                Admin Dashboard
              </span>
            </button>
          </Link>
        ) : (
          <Link href="/nl/command-center">
            <button className="flex items-center h-8 gap-2 text-white border border-cyan-600/50 bg-cyan-600/10 hover:bg-cyan-600/20 hover:border-cyan-500 transition-all duration-200 rounded-lg px-3 py-1.5">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline text-sm font-medium">
                Command Center
              </span>
              <Badge
                variant="secondary"
                className="bg-cyan-600 text-white hover:bg-cyan-600 text-xs"
              >
                Live
              </Badge>
            </button>
          </Link>
        )}

        {/* Notifications */}
        <DropdownMenu
          open={isNotificationsOpen}
          onOpenChange={setIsNotificationsOpen}
        >
          <DropdownMenuTrigger asChild>
            <NormalButton
              variant="ghost"
              size="sm"
              className="relative h-8 w-8 p-0"
            >
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                3
              </Badge>
            </NormalButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div className="p-2 hover:bg-muted rounded text-sm">
                <div className="font-medium">Revenue target achieved</div>
                <div className="text-xs text-muted-foreground">
                  2 minutes ago
                </div>
              </div>
              <div className="p-2 hover:bg-muted rounded text-sm">
                <div className="font-medium">New customer milestone</div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </div>
              <div className="p-2 hover:bg-muted rounded text-sm">
                <div className="font-medium">Analytics report ready</div>
                <div className="text-xs text-muted-foreground">3 hours ago</div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DropdownMenuTrigger asChild>
            <NormalButton variant="ghost" size="sm" className="h-8 w-8 p-0">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </NormalButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <div className="font-medium">Executive User</div>
                <div className="text-xs text-muted-foreground">
                  admin@futuremarketing.ai
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              {t("navigation.settings")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
