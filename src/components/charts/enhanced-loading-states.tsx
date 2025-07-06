"use client";

import React from "react";
import {
  Loader2,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Enhanced loading state configurations
export interface LoadingStateConfig {
  type: "skeleton" | "spinner" | "progress" | "shimmer" | "pulse";
  variant: "chart" | "kpi" | "table" | "grid";
  showProgress?: boolean;
  progressValue?: number;
  message?: string;
  animated?: boolean;
  height?: number;
}

/**
 * Enhanced Chart Skeleton with animations and variants
 */
export function EnhancedChartSkeleton({
  height = 300,
  variant = "chart",
  animated = true,
  showProgress = false,
  progressValue = 0,
  message = "Loading chart data...",
  className,
}: LoadingStateConfig & { className?: string }) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className={cn("h-6 w-1/3", animated && "animate-pulse")} />
        <Skeleton className={cn("h-4 w-1/2", animated && "animate-pulse")} />
      </div>

      {/* Progress indicator */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{message}</span>
            <span className="text-muted-foreground">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      )}

      {/* Chart skeleton based on variant */}
      {variant === "chart" && (
        <div className="space-y-4">
          {/* Chart area */}
          <Skeleton
            className={cn(
              "w-full",
              animated && "animate-pulse",
              `h-[${height}px]`
            )}
          />

          {/* Legend skeleton */}
          <div className="flex gap-4 justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton
                  className={cn(
                    "h-3 w-3 rounded-full",
                    animated && "animate-pulse"
                  )}
                />
                <Skeleton
                  className={cn("h-4 w-16", animated && "animate-pulse")}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === "kpi" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <Skeleton
                  className={cn("h-4 w-20", animated && "animate-pulse")}
                />
                <Skeleton
                  className={cn("h-8 w-24", animated && "animate-pulse")}
                />
                <Skeleton
                  className={cn("h-3 w-16", animated && "animate-pulse")}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {variant === "table" && (
        <div className="space-y-3">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 border-b pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn("h-4 w-full", animated && "animate-pulse")}
              />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton
                  key={j}
                  className={cn("h-4 w-full", animated && "animate-pulse")}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Animated loading spinner with chart icons
 */
export function ChartLoadingSpinner({
  variant = "chart",
  message = "Loading data...",
  size = "lg",
  className,
}: {
  variant?: "chart" | "kpi" | "table";
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const iconSize = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }[size];

  const Icon = {
    chart: TrendingUp,
    kpi: BarChart3,
    table: Activity,
  }[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 space-y-4",
        className
      )}
    >
      <div className="relative">
        <Loader2 className={cn("animate-spin text-primary", iconSize)} />
        <Icon
          className={cn("absolute inset-0 text-muted-foreground", iconSize)}
        />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
        <div className="flex space-x-1 justify-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Shimmer loading effect for cards
 */
export function ShimmerCard({
  height = 200,
  title,
  showIcon = true,
  className,
}: {
  height?: number;
  title?: string;
  showIcon?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {title ? (
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            ) : (
              <Skeleton className="h-4 w-24" />
            )}
            <Skeleton className="h-3 w-32" />
          </div>
          {showIcon && <Skeleton className="h-6 w-6 rounded" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden">
          <Skeleton className={cn("w-full", `h-[${height}px]`)} />

          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Progressive loading with stages
 */
export function ProgressiveLoading({
  stages = [
    "Connecting...",
    "Loading data...",
    "Processing...",
    "Almost ready...",
  ],
  currentStage = 0,
  className,
}: {
  stages?: string[];
  currentStage?: number;
  className?: string;
}) {
  const progress = ((currentStage + 1) / stages.length) * 100;

  return (
    <div className={cn("space-y-6 p-8", className)}>
      <div className="text-center space-y-2">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h3 className="text-lg font-semibold">
          {stages[currentStage] || "Loading..."}
        </h3>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStage + 1} of {stages.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="flex justify-center space-x-2">
        {stages.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index <= currentStage ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Data loading state with metrics
 */
export function DataLoadingState({
  dataPoints = 0,
  expectedTotal = 100,
  dataSource = "Database",
  lastUpdated,
  className,
}: {
  dataPoints?: number;
  expectedTotal?: number;
  dataSource?: string;
  lastUpdated?: Date;
  className?: string;
}) {
  const progress = expectedTotal > 0 ? (dataPoints / expectedTotal) * 100 : 0;

  return (
    <div className={cn("bg-muted/30 rounded-lg p-6 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Activity className="h-5 w-5 animate-pulse text-primary" />
        </div>
        <div>
          <h4 className="font-medium">Loading Data</h4>
          <p className="text-sm text-muted-foreground">From {dataSource}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Data Points</span>
          <span>
            {dataPoints}/{expectedTotal}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs">
          {progress < 100 ? "Loading" : "Complete"}
        </Badge>
        {lastUpdated && <span>Last: {lastUpdated.toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}

/**
 * Error state with retry functionality
 */
export function ChartErrorState({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  className,
}: {
  error: string;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
}) {
  return (
    <div className={cn("text-center p-8 space-y-4", className)}>
      <div className="space-y-2">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-700">
          Failed to load chart
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {error}
        </p>
      </div>

      {onRetry && retryCount < maxRetries && (
        <div className="space-y-2">
          <NormalButton
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Loader2 className="h-4 w-4" />
            Retry ({retryCount}/{maxRetries})
          </NormalButton>
          <p className="text-xs text-muted-foreground">
            Attempt {retryCount + 1} of {maxRetries}
          </p>
        </div>
      )}

      {retryCount >= maxRetries && (
        <Badge variant="destructive">Max retries reached</Badge>
      )}
    </div>
  );
}

/**
 * Comprehensive loading wrapper that combines multiple loading states
 */
export function SmartLoadingWrapper({
  loading,
  error,
  data,
  loadingConfig,
  retryFn,
  children,
  className,
}: {
  loading: boolean;
  error?: string | null;
  data?: any;
  loadingConfig?: LoadingStateConfig;
  retryFn?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (error) {
    return (
      <ChartErrorState error={error} onRetry={retryFn} className={className} />
    );
  }

  if (loading) {
    const config = loadingConfig || { type: "skeleton", variant: "chart" };

    switch (config.type) {
      case "spinner":
        return (
          <ChartLoadingSpinner variant={config.variant} className={className} />
        );
      case "progress":
        return <ProgressiveLoading className={className} />;
      case "shimmer":
        return <ShimmerCard className={className} />;
      default:
        return <EnhancedChartSkeleton {...config} className={className} />;
    }
  }

  return <>{children}</>;
}
