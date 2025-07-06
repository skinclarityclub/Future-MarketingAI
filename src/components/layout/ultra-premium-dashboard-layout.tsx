"use client";

import React, { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EnhancedHeader } from "./enhanced-header";
import { EnhancedSidebar } from "./enhanced-sidebar";
import {
  DashboardBreadcrumbs,
  generateBreadcrumbs,
} from "./dashboard-breadcrumbs";
import { useDashboardMode } from "@/lib/contexts/dashboard-mode-context";
import { usePathname } from "next/navigation";
import {
  OptimizedImage,
  ResponsiveImage,
} from "@/components/ui/optimized-next-image";

export type DashboardMode =
  | "executive"
  | "finance"
  | "marketing"
  | "admin"
  | "research";

interface UltraPremiumDashboardLayoutProps {
  children: ReactNode;
  currentPage?: string;
  showSidebar?: boolean;
  fullWidth?: boolean;
  showBreadcrumbs?: boolean;
  breadcrumbItems?: Array<{ label: string; href?: string; current?: boolean }>;
}

export function UltraPremiumDashboardLayout({
  children,
  currentPage: _currentPage = "Executive Overview",
  showSidebar = true,
  fullWidth = false,
  showBreadcrumbs = true,
  breadcrumbItems,
}: UltraPremiumDashboardLayoutProps) {
  // Use the global dashboard mode context
  const { currentMode, setMode } = useDashboardMode();
  const pathname = usePathname();

  // State for sidebar expansion only
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Generate breadcrumbs if not provided
  const breadcrumbs = breadcrumbItems || generateBreadcrumbs(pathname);

  const handleModeChange = (mode: DashboardMode) => {
    setMode(mode);
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 antialiased">
      {/* Mobile-first responsive wrapper */}
      <div className="min-h-screen flex relative">
        {/* Mobile Overlay for Sidebar */}
        {showSidebar && isSidebarExpanded && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarExpanded(false)}
            aria-hidden="true"
          />
        )}

        {/* Enhanced Sidebar with Mobile Support */}
        {showSidebar && (
          <div
            className={cn(
              "fixed lg:relative z-50 lg:z-auto",
              "transition-transform duration-300 ease-in-out",
              "lg:translate-x-0",
              isSidebarExpanded
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            )}
          >
            <EnhancedSidebar
              currentMode={currentMode}
              isExpanded={isSidebarExpanded}
              onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
            />
          </div>
        )}

        {/* Main Content Area with Responsive Design */}
        <div
          className={cn(
            "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
            "min-w-0", // Prevent flex item from overflowing
            showSidebar && "lg:ml-64", // Only apply margin on large screens
            fullWidth && "w-full"
          )}
        >
          {/* Enhanced Header with Mobile Support */}
          <EnhancedHeader
            currentMode={currentMode}
            onModeChange={handleModeChange}
            onMenuToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          />

          {/* Content Area with Premium Responsive Styling */}
          <main className="flex-1 overflow-auto pt-16 lg:pt-20">
            {/* Premium gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-transparent pointer-events-none" />

            <div
              className={cn(
                "relative z-10",
                "p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8",
                !fullWidth && "container mx-auto max-w-7xl"
              )}
            >
              {/* Breadcrumbs with Mobile Optimization */}
              {showBreadcrumbs && breadcrumbs.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <DashboardBreadcrumbs items={breadcrumbs} />
                </div>
              )}

              {/* Content with Enhanced Animations */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Enhanced Premium Section with Glass Morphism
interface UltraPremiumSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  priority?: "primary" | "secondary" | "tertiary";
}

export function UltraPremiumSection({
  children,
  title,
  subtitle,
  description,
  action,
  className,
  priority = "secondary",
}: UltraPremiumSectionProps) {
  const getTitleHierarchy = () => {
    switch (priority) {
      case "primary":
        return "text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 bg-clip-text text-transparent";
      case "secondary":
        return "text-2xl lg:text-3xl font-semibold text-slate-200";
      case "tertiary":
        return "text-xl lg:text-2xl font-medium text-slate-300";
    }
  };

  return (
    <section className={cn("space-y-6 lg:space-y-8", className)}>
      {(title || subtitle || description) && (
        <div className="relative">
          {/* Glass morphism header background */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-transparent rounded-2xl backdrop-blur-sm" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 lg:p-8">
            <div className="space-y-2">
              {title && <h2 className={getTitleHierarchy()}>{title}</h2>}
              {subtitle && (
                <h3 className="text-lg font-medium text-slate-400">
                  {subtitle}
                </h3>
              )}
              {description && (
                <p className="text-slate-500 max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        </div>
      )}

      <div className="space-y-6 lg:space-y-8">{children}</div>
    </section>
  );
}

// Enhanced Premium Grid
interface UltraPremiumGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: "standard" | "compact" | "wide" | "masonry";
  priority?: "primary" | "secondary" | "tertiary";
}

export function UltraPremiumGrid({
  children,
  className,
  variant = "standard",
  priority = "secondary",
}: UltraPremiumGridProps) {
  const getGridClasses = () => {
    const baseClasses =
      "grid auto-rows-min transition-all duration-300 ease-out";

    const variantClasses = {
      standard:
        "gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      compact:
        "gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
      wide: "gap-6 sm:gap-8 lg:gap-12 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
      masonry:
        "gap-4 sm:gap-6 lg:gap-8 columns-1 sm:columns-2 lg:columns-3 xl:columns-4",
    };

    const priorityClasses = {
      primary: "animate-in fade-in slide-in-from-bottom-8 duration-700",
      secondary:
        "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150",
      tertiary:
        "animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300",
    };

    return cn(
      baseClasses,
      variantClasses[variant],
      priorityClasses[priority],
      className
    );
  };

  return <div className={getGridClasses()}>{children}</div>;
}

// Enhanced Premium Card with Advanced Glass Morphism
interface UltraPremiumCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  priority?: "primary" | "secondary" | "tertiary";
  variant?: "default" | "glass" | "luxury" | "minimal";
  status?: "default" | "success" | "warning" | "error" | "info";
}

export function UltraPremiumCard({
  children,
  className,
  title,
  description,
  action,
  icon,
  colSpan = 1,
  rowSpan = 1,
  priority = "secondary",
  variant = "glass",
  status = "default",
}: UltraPremiumCardProps) {
  const gridClasses = {
    col: {
      1: "col-span-1",
      2: "col-span-1 sm:col-span-2",
      3: "col-span-1 sm:col-span-2 lg:col-span-3",
      4: "col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4",
    },
    row: {
      1: "row-span-1",
      2: "row-span-1 lg:row-span-2",
      3: "row-span-1 lg:row-span-3",
    },
  };

  const getCardClasses = () => {
    const baseClasses =
      "group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02]";

    const variantClasses = {
      default:
        "bg-gradient-to-br from-slate-800/30 via-slate-900/20 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/70",
      glass:
        "bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-slate-700/30 hover:border-slate-600/50",
      luxury:
        "bg-gradient-to-br from-slate-800/40 via-slate-900/30 to-slate-800/40 backdrop-blur-xl border-2 border-blue-500/30 hover:border-blue-400/50 shadow-2xl shadow-blue-500/10",
      minimal: "bg-transparent border-none hover:bg-white/[0.02]",
    };

    const priorityClasses = {
      primary: "shadow-2xl shadow-black/20 hover:shadow-blue-500/20",
      secondary:
        "shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20",
      tertiary:
        "shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10",
    };

    const statusClasses = {
      default: "",
      success: "border-emerald-500/30 bg-emerald-500/5",
      warning: "border-amber-500/30 bg-amber-500/5",
      error: "border-red-500/30 bg-red-500/5",
      info: "border-blue-500/30 bg-blue-500/5",
    };

    return cn(
      baseClasses,
      variantClasses[variant],
      priorityClasses[priority],
      statusClasses[status],
      gridClasses.col[colSpan],
      gridClasses.row[rowSpan],
      "rounded-2xl p-6",
      className
    );
  };

  return (
    <div className={getCardClasses()}>
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      {(title || description || action || icon) && (
        <div className="relative z-10 flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            {icon && (
              <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-slate-200 mb-1">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/3 to-transparent rounded-2xl" />
    </div>
  );
}
