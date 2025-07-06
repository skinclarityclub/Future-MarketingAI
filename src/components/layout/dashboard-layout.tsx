"use client";

import React, { useState, useEffect } from "react";
import { EnhancedHeader } from "./enhanced-header";
import { EnhancedSidebar } from "./enhanced-sidebar";
import { cn } from "@/lib/utils";
import { PerformanceMonitor } from "../debug/performance-monitor";
import { useDashboardMode } from "@/lib/contexts/dashboard-mode-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { currentMode, setMode } = useDashboardMode();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with Mode Switcher */}
      <EnhancedHeader
        onMenuToggle={toggleSidebar}
        currentMode={currentMode}
        onModeChange={setMode}
      />

      <div className="flex pt-16">
        {/* Enhanced Mode-Aware Sidebar */}
        <EnhancedSidebar
          currentMode={currentMode}
          isExpanded={sidebarExpanded}
          onToggle={toggleSidebar}
        />

        {/* Main Content with Fortune 500 Premium Layout */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            sidebarExpanded ? "ml-64" : "ml-16", // Dynamic sidebar width
            "min-h-[calc(100vh-4rem)]", // Full height minus header
            "bg-gradient-to-br from-background via-background/95 to-background/90",
            className
          )}
        >
          {/* Premium Content Container with Visual Hierarchy */}
          <div className="container mx-auto p-6 lg:p-8 max-w-[1920px] space-y-8">
            {/* Enterprise Content Wrapper */}
            <div className="premium-content-fade space-y-8">{children}</div>
          </div>
        </main>
      </div>

      {/* Performance Monitor - Development Only */}
      <PerformanceMonitor />
    </div>
  );
}

// Premium Grid layout with Fortune 500 Visual Hierarchy
interface PremiumDashboardGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: "standard" | "compact" | "wide" | "masonry";
  priority?: "primary" | "secondary" | "tertiary";
}

export function DashboardGrid({
  children,
  className,
  variant = "standard",
  priority = "secondary",
}: PremiumDashboardGridProps) {
  const getGridClasses = () => {
    const baseClasses = "grid auto-rows-min transition-all duration-normal";

    const variantClasses = {
      standard:
        "gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      compact:
        "gap-4 lg:gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
      wide: "gap-8 lg:gap-12 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
      masonry:
        "gap-6 lg:gap-8 columns-1 md:columns-2 lg:columns-3 xl:columns-4",
    };

    const priorityClasses = {
      primary: "stagger-fade-primary",
      secondary: "stagger-fade-secondary",
      tertiary: "stagger-fade-tertiary",
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

// Ultra-Premium Card component with Advanced Visual Hierarchy
interface PremiumDashboardCardProps {
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

export function DashboardCard({
  children,
  className,
  title,
  description,
  action,
  icon,
  colSpan = 1,
  rowSpan = 1,
  priority = "secondary",
  variant = "default",
  status = "default",
}: PremiumDashboardCardProps) {
  const gridClasses = {
    col: {
      1: "col-span-1",
      2: "md:col-span-2",
      3: "lg:col-span-3",
      4: "xl:col-span-4",
    },
    row: {
      1: "row-span-1",
      2: "row-span-2",
      3: "row-span-3",
    },
  };

  const getCardClasses = () => {
    const baseClasses =
      "group transition-all duration-normal ease-premium relative overflow-hidden";

    const variantClasses = {
      default:
        "card-premium border border-neutral-600/20 hover:border-neutral-500/30",
      glass:
        "glass-premium border-2 border-neutral-600/30 hover:border-neutral-500/40",
      luxury:
        "card-luxury border-2 border-primary/30 hover:border-primary/50 shadow-enterprise",
      minimal: "bg-transparent border-none hover:bg-neutral-800/30",
    };

    const priorityClasses = {
      primary: "shadow-glow-primary hover:shadow-enterprise",
      secondary: "hover:shadow-elevated",
      tertiary: "hover:shadow-soft",
    };

    const statusClasses = {
      default: "",
      success: "border-success-500/30 bg-success-500/5",
      warning: "border-warning-500/30 bg-warning-500/5",
      error: "border-error-500/30 bg-error-500/5",
      info: "border-info-500/30 bg-info-500/5",
    };

    return cn(
      baseClasses,
      variantClasses[variant],
      priorityClasses[priority],
      statusClasses[status],
      gridClasses.col[colSpan],
      gridClasses.row[rowSpan],
      className
    );
  };

  const getTitleHierarchy = () => {
    switch (priority) {
      case "primary":
        return "text-h2 font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent";
      case "secondary":
        return "text-h3 font-semibold text-neutral-200";
      case "tertiary":
        return "text-body-large font-medium text-neutral-300";
      default:
        return "text-h3 font-semibold text-neutral-200";
    }
  };

  return (
    <div className={getCardClasses()}>
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-normal" />

      <div className="relative p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section */}
        {(title || description || action || icon) && (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {/* Title with Icon */}
              {(title || icon) && (
                <div className="flex items-center gap-3">
                  {icon && (
                    <div
                      className={cn(
                        "p-2 rounded-premium",
                        priority === "primary"
                          ? "bg-gradient-primary shadow-glow-primary"
                          : "glass-secondary border border-neutral-600/30"
                      )}
                    >
                      <div
                        className={cn(
                          priority === "primary"
                            ? "text-white"
                            : "text-primary-400"
                        )}
                      >
                        {icon}
                      </div>
                    </div>
                  )}
                  {title && <h3 className={getTitleHierarchy()}>{title}</h3>}
                </div>
              )}

              {/* Description */}
              {description && (
                <p className="text-small text-neutral-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Action Area */}
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}

        {/* Content Area with Proper Spacing */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

// Enhanced Section component with Premium Visual Hierarchy
interface PremiumDashboardSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  priority?: "primary" | "secondary" | "tertiary";
  variant?: "default" | "contained" | "elevated";
}

export function DashboardSection({
  children,
  title,
  subtitle,
  description,
  action,
  className,
  priority = "secondary",
  variant = "default",
}: PremiumDashboardSectionProps) {
  const getSectionClasses = () => {
    const baseClasses = "space-y-6 lg:space-y-8";

    const variantClasses = {
      default: "",
      contained:
        "glass-secondary rounded-luxury p-6 lg:p-8 border border-neutral-600/30",
      elevated:
        "card-luxury rounded-luxury p-8 lg:p-12 border-2 border-primary/20 shadow-enterprise",
    };

    return cn(baseClasses, variantClasses[variant], className);
  };

  const getTitleHierarchy = () => {
    switch (priority) {
      case "primary":
        return "text-display font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent";
      case "secondary":
        return "text-h1 font-bold text-neutral-100";
      case "tertiary":
        return "text-h2 font-semibold text-neutral-200";
      default:
        return "text-h1 font-bold text-neutral-100";
    }
  };

  return (
    <section className={getSectionClasses()}>
      {/* Enhanced Header */}
      {(title || subtitle || description || action) && (
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            {/* Primary Title */}
            {title && (
              <div className="flex items-center gap-3">
                <h2 className={getTitleHierarchy()}>{title}</h2>
                {priority === "primary" && (
                  <div className="h-2 w-2 bg-primary-400 rounded-full animate-pulse" />
                )}
              </div>
            )}

            {/* Subtitle */}
            {subtitle && (
              <h3 className="text-h3 font-medium text-primary-400">
                {subtitle}
              </h3>
            )}

            {/* Description */}
            {description && (
              <p className="text-body-medium text-neutral-400 leading-relaxed max-w-3xl">
                {description}
              </p>
            )}
          </div>

          {/* Action Area */}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className="relative">{children}</div>
    </section>
  );
}
