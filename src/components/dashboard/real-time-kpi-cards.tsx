"use client";

import React from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  CheckCircle,
} from "lucide-react";
import {
  useKPIMetrics,
  type KPIMetric,
} from "@/lib/dashboard/hooks/use-kpi-metrics";
import { ExportControls } from "./export-controls";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "@/lib/i18n/client-provider";
import NormalButton from "@/components/ui/normal-button";
import {
  formatCurrency as formatCurrencyI18n,
  formatPercentage as formatPercentageI18n,
} from "@/lib/i18n/utils";

const iconMap = {
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
} as const;

interface RealTimeKPICardsProps {
  className?: string;
  refetchInterval?: number; // in milliseconds
}

// Ultra-Premium KPI Card with Fortune 500 Visual Hierarchy
function PremiumKPICard({
  metric,
  isLoading,
  isPrimary = false,
}: {
  metric: KPIMetric;
  isLoading: boolean;
  isPrimary?: boolean;
}) {
  const { t, locale } = useTranslation();
  const IconComponent =
    iconMap[metric.icon as keyof typeof iconMap] || BarChart3;
  const isPercentage =
    metric.title.includes("Rate") || metric.title.includes("Score");
  const isUp = metric.trend === "up";

  // Dynamic styling based on importance and trend with 60fps animations
  const cardClasses = cn(
    "group transition-premium gpu-accelerated smooth-rendering",
    isPrimary
      ? "glass-luxury shadow-glow-primary hover-lift hover-glow animate-pulse-glow"
      : "glass-secondary shadow-elevated hover-micro",
    isLoading && "loading-skeleton",
    !isLoading && isPrimary && "animate-premium-fade-in",
    !isLoading && !isPrimary && "animate-premium-fade-in-up"
  );

  const getMetricHierarchy = () => {
    if (isPrimary) {
      return {
        titleClass:
          "text-small font-semibold text-neutral-300 uppercase tracking-wide",
        valueClass:
          "text-display font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent",
        iconContainerClass:
          "p-4 bg-gradient-primary rounded-luxury shadow-glow-primary",
        iconClass: "h-8 w-8 text-white",
        changeClass: "text-body-medium font-bold",
        borderColor: "border-primary/30 hover:border-primary/50",
      };
    } else {
      return {
        titleClass:
          "text-xs font-medium text-neutral-400 uppercase tracking-wide",
        valueClass: "text-h1 font-bold text-neutral-200",
        iconContainerClass:
          "p-3 glass-secondary rounded-premium border border-neutral-600/30",
        iconClass: "h-6 w-6 text-primary-400",
        changeClass: "text-small font-semibold",
        borderColor: "border-neutral-600/20 hover:border-neutral-500/30",
      };
    }
  };

  const hierarchy = getMetricHierarchy();

  return (
    <div
      className={cn(
        cardClasses,
        "border-2",
        hierarchy.borderColor,
        "relative overflow-hidden"
      )}
    >
      {/* Premium Background Pattern with Micro-interactions */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-slow ease-luxury" />

      {/* Ambient floating animation */}
      <div className="absolute top-4 right-4 w-1 h-1 bg-primary-400/60 rounded-full animate-ambient-float" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 glass-secondary rounded-card flex items-center justify-center z-10">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-primary-400 animate-spin" />
            <span className="text-small text-primary-400 font-medium">
              Updating...
            </span>
          </div>
        </div>
      )}

      <div className="relative p-6 space-y-6">
        {/* Header with Title and Icon */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <p className={hierarchy.titleClass}>
                {metric.title.includes(".") ? t(metric.title) : metric.title}
              </p>
              {isPrimary && (
                <Sparkles className="h-3 w-3 text-primary-400 animate-pulse" />
              )}
            </div>

            {/* Primary Value Display */}
            <div className={hierarchy.valueClass}>
              {isPercentage
                ? metric.title.includes("Rate")
                  ? formatPercentageI18n(metric.value, locale)
                  : `${metric.value.toFixed(1)}%`
                : formatCurrencyI18n(metric.value, locale)}
            </div>
          </div>

          {/* Premium Icon Container with Micro-interactions */}
          <div
            className={cn(
              hierarchy.iconContainerClass,
              "relative hover-micro interactive-scale group-hover:rotate-3 transition-transform duration-fast ease-premium"
            )}
          >
            <IconComponent
              className={cn(
                hierarchy.iconClass,
                "group-hover:scale-110 transition-transform duration-fast ease-premium"
              )}
            />
            {isPrimary && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-success-500 rounded-full animate-success-pulse" />
            )}
          </div>
        </div>

        {/* Trend Analysis Section */}
        <div className="space-y-3">
          {/* Change Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-premium transition-all duration-fast ease-premium hover-micro",
                  isUp
                    ? "bg-success-500/20 border border-success-500/30 hover:bg-success-500/30"
                    : "bg-error-500/20 border border-error-500/30 hover:bg-error-500/30"
                )}
              >
                <div
                  className={cn(
                    "p-1 rounded-full transition-transform duration-fast ease-premium group-hover:scale-110",
                    isUp
                      ? "bg-success-500 animate-success-pulse"
                      : "bg-error-500 animate-pulse-glow"
                  )}
                >
                  {isUp ? (
                    <ArrowUpRight className="h-3 w-3 text-white animate-micro-bounce" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-white animate-micro-bounce" />
                  )}
                </div>
                <span
                  className={cn(
                    hierarchy.changeClass,
                    isUp ? "text-success-400" : "text-error-400"
                  )}
                >
                  {formatPercentageI18n(Math.abs(metric.change), locale)}
                </span>
              </div>

              <span className="text-xs text-neutral-500 font-medium">
                {t("dashboard.lastMonth")}
              </span>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success-400" />
              <span className="text-xs text-success-400 font-medium">Live</span>
            </div>
          </div>

          {/* Last Updated Information */}
          {metric.lastUpdated && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 pt-2 border-t border-neutral-700/30">
              <Clock className="h-3 w-3" />
              <span>
                Last updated{" "}
                {formatDistanceToNow(new Date(metric.lastUpdated), {
                  addSuffix: true,
                })}
              </span>
              <Zap className="h-3 w-3 text-primary-400 ml-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Premium Loading Skeleton with Visual Hierarchy
function PremiumLoadingSkeleton({
  isPrimary = false,
}: {
  isPrimary?: boolean;
}) {
  return (
    <div
      className={cn(
        "loading-skeleton gpu-accelerated smooth-rendering",
        isPrimary
          ? "glass-luxury animate-premium-fade-in"
          : "glass-secondary animate-premium-fade-in-up",
        "border-2 border-neutral-600/20 hover-micro"
      )}
    >
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-3 bg-gradient-shimmer rounded-premium w-32 animate-shimmer-premium" />
            <div
              className={cn(
                "bg-gradient-shimmer rounded-premium animate-shimmer-premium",
                isPrimary ? "h-12 w-48" : "h-8 w-40"
              )}
            />
          </div>
          <div
            className={cn(
              "bg-gradient-shimmer rounded-premium animate-shimmer-premium",
              isPrimary ? "w-16 h-16" : "w-12 h-12"
            )}
          />
        </div>

        {/* Trend Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 bg-gradient-shimmer rounded-premium w-20 animate-shimmer-premium" />
            <div className="h-4 bg-gradient-shimmer rounded-premium w-16 animate-shimmer-premium" />
          </div>
          <div className="h-3 bg-gradient-shimmer rounded-premium w-full animate-shimmer-premium" />
        </div>
      </div>
    </div>
  );
}

// Premium Error State with Visual Hierarchy
function PremiumErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const { t } = useLocale();

  return (
    <div className="card-premium border-2 border-error-500/30 bg-error-500/5">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-error-500/20 rounded-premium border border-error-500/30">
            <AlertCircle className="h-6 w-6 text-error-400" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-body-medium font-semibold text-error-400">
                {t("errors.serverError")}
              </h3>
              <p className="text-small text-neutral-400 mt-1">{error}</p>
            </div>
            <NormalButton
              onClick={onRetry}
              className="btn-premium text-small flex items-center gap-2 bg-gradient-error hover:scale-105"
            >
              <RefreshCw className="h-4 w-4" />
              {t("errors.tryAgain")}
            </NormalButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RealTimeKPICards({
  className,
  refetchInterval,
}: RealTimeKPICardsProps) {
  const { t } = useLocale();
  const { metrics, isLoading, isError, error, refetch } = useKPIMetrics({
    refetchInterval,
  });

  // Define primary metrics for enhanced visual hierarchy
  const primaryMetrics = ["Total Revenue", "Monthly Recurring Revenue"];

  // Show premium loading skeletons on initial load
  if (isLoading && metrics.length === 0) {
    return (
      <div className={cn("grid gap-6", className)}>
        {/* Primary metrics grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <PremiumLoadingSkeleton key={`primary-${index}`} isPrimary={true} />
          ))}
        </div>

        {/* Secondary metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <PremiumLoadingSkeleton
              key={`secondary-${index}`}
              isPrimary={false}
            />
          ))}
        </div>
      </div>
    );
  }

  // Show error state if there's an error and no cached data
  if (isError && metrics.length === 0) {
    return (
      <div className={className}>
        <PremiumErrorState
          error={error || t("errors.unknownError")}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Separate primary and secondary metrics for visual hierarchy
  const primaryKPIs = metrics.filter(metric =>
    primaryMetrics.some(primary => metric.title.includes(primary))
  );
  const secondaryKPIs = metrics.filter(
    metric => !primaryMetrics.some(primary => metric.title.includes(primary))
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Primary KPIs - Hero Section */}
      {primaryKPIs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-premium shadow-glow-primary">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-h3 font-semibold text-primary-400">
              Primary Revenue Metrics
            </h3>
            <div className="h-2 w-2 bg-primary-400 rounded-full animate-pulse ml-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {primaryKPIs.map((metric, index) => (
              <PremiumKPICard
                key={`${metric.title}-${index}`}
                metric={metric}
                isLoading={isLoading}
                isPrimary={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Secondary KPIs - Supporting Metrics */}
      {secondaryKPIs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 glass-secondary rounded-premium border border-neutral-600/30">
              <BarChart3 className="h-5 w-5 text-success-400" />
            </div>
            <h3 className="text-h3 font-semibold text-success-400">
              Performance Indicators
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryKPIs.map((metric, index) => (
              <PremiumKPICard
                key={`${metric.title}-${index}`}
                metric={metric}
                isLoading={isLoading}
                isPrimary={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Export Controls */}
      <div className="glass-secondary rounded-premium p-4 border border-neutral-600/30">
        <ExportControls
          metrics={metrics}
          className="justify-center"
          variant="button"
        />
      </div>
    </div>
  );
}
