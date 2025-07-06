"use client";

import { ReactNode, useState } from "react";
import { Loader2, Activity, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Loading Spinner Variants
interface LoadingSpinnerProps {
  variant?: "premium" | "luxury" | "enterprise";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  variant = "premium",
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const variantClasses = {
    premium: "spinner-premium",
    luxury: "spinner-luxury",
    enterprise: "spinner-enterprise",
  };

  return (
    <div
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

// Dots Loading Animation
interface DotsLoadingProps {
  color?: "primary" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DotsLoading({
  color = "primary",
  size = "md",
  className = "",
}: DotsLoadingProps) {
  const colorClasses = {
    primary: "bg-primary-400",
    success: "bg-success-400",
    warning: "bg-warning-400",
  };

  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <div
      className={`dots-loading ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className={`dot ${colorClasses[color]} ${sizeClasses[size]}`} />
      <div className={`dot ${colorClasses[color]} ${sizeClasses[size]}`} />
      <div className={`dot ${colorClasses[color]} ${sizeClasses[size]}`} />
    </div>
  );
}

// Progress Bar
interface ProgressBarProps {
  variant?: "premium" | "luxury";
  className?: string;
  progress?: number;
  indeterminate?: boolean;
}

export function ProgressBar({
  variant = "premium",
  className = "",
  progress,
  indeterminate = true,
}: ProgressBarProps) {
  const variantClasses = {
    premium: "progress-premium",
    luxury: "progress-luxury",
  };

  if (!indeterminate && typeof progress === "number") {
    return (
      <div className={`${variantClasses[variant]} ${className}`}>
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-success-500 transition-all duration-300 ease-premium"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      role="progressbar"
      aria-label="Loading progress"
    />
  );
}

// Skeleton Loading Components
interface SkeletonProps {
  variant?: "premium" | "luxury" | "enterprise";
  className?: string;
  children?: ReactNode;
  animated?: boolean;
}

export function Skeleton({
  variant = "premium",
  className = "",
  children,
  animated = true,
}: SkeletonProps) {
  const variantClasses = {
    premium: "skeleton-premium",
    luxury: "skeleton-luxury",
    enterprise: "skeleton-enterprise",
  };

  return (
    <div
      className={`${variantClasses[variant]} ${!animated ? "animation-paused" : ""} ${className}`}
      role="status"
      aria-label="Loading content"
    >
      {children}
    </div>
  );
}

// Text Loading Skeletons
export function TextSkeleton({
  variant = "premium",
  lines = 3,
  className = "",
}: {
  variant?: "premium" | "luxury" | "enterprise";
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      <Skeleton variant={variant} className="text-loading-title" />
      <Skeleton variant={variant} className="text-loading-subtitle" />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          className={`text-loading-body ${i === lines - 3 ? "w-3/4" : ""}`}
        />
      ))}
    </div>
  );
}

// Card Loading Component
interface CardSkeletonProps {
  variant?: "premium" | "luxury" | "enterprise";
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function CardSkeleton({
  variant = "premium",
  showHeader = true,
  showFooter = false,
  className = "",
}: CardSkeletonProps) {
  return (
    <div className={`card-loading-premium ${className}`}>
      {showHeader && (
        <div className="mb-6">
          <Skeleton variant={variant} className="h-6 w-1/2 mb-2" />
          <Skeleton variant={variant} className="h-4 w-3/4" />
        </div>
      )}

      <div className="space-y-4">
        <Skeleton variant={variant} className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton variant={variant} className="h-8" />
          <Skeleton variant={variant} className="h-8" />
          <Skeleton variant={variant} className="h-8" />
        </div>
      </div>

      {showFooter && (
        <div className="mt-6 flex justify-between items-center">
          <Skeleton variant={variant} className="h-4 w-1/4" />
          <Skeleton variant={variant} className="h-8 w-20" />
        </div>
      )}
    </div>
  );
}

// Chart Loading Component
interface ChartSkeletonProps {
  variant?: "premium" | "luxury" | "enterprise";
  type?: "bar" | "line" | "pie";
  className?: string;
}

export function ChartSkeleton({
  variant = "premium",
  type = "bar",
  className = "",
}: ChartSkeletonProps) {
  if (type === "bar") {
    return (
      <div className={`chart-loading ${className}`}>
        <div className="absolute top-4 left-4 right-4">
          <Skeleton variant={variant} className="h-6 w-1/3 mb-2" />
          <Skeleton variant={variant} className="h-4 w-1/2" />
        </div>

        <div className="chart-loading-bars">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="chart-loading-bar" />
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant={variant} className="h-3 w-8" />
          ))}
        </div>
      </div>
    );
  }

  if (type === "line") {
    return (
      <div className={`chart-loading ${className}`}>
        <div className="absolute top-4 left-4 right-4">
          <Skeleton variant={variant} className="h-6 w-1/3 mb-2" />
          <Skeleton variant={variant} className="h-4 w-1/2" />
        </div>

        <div className="absolute inset-4 top-16">
          <svg className="w-full h-full opacity-30">
            <path
              d="M 0 80 Q 25 60 50 70 T 100 50 T 150 60 T 200 40 T 250 55 T 300 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary-400 animate-pulse"
            />
          </svg>
        </div>
      </div>
    );
  }

  // Pie chart
  return (
    <div className={`chart-loading ${className}`}>
      <div className="absolute top-4 left-4 right-4">
        <Skeleton variant={variant} className="h-6 w-1/3 mb-2" />
        <Skeleton variant={variant} className="h-4 w-1/2" />
      </div>

      <div className="absolute inset-4 top-16 flex items-center justify-center">
        <div className="w-32 h-32 rounded-full border-8 border-primary-400/30 border-t-primary-400 animate-spin" />
      </div>
    </div>
  );
}

// Table Loading Component
export function TableSkeleton({
  rows = 5,
  cols = 4,
  variant = "premium",
  className = "",
}: {
  rows?: number;
  cols?: number;
  variant?: "premium" | "luxury" | "enterprise";
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div
        className="grid gap-4 p-4 border-b border-white/10"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant={variant} className="h-4 w-3/4" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 p-4 border-b border-white/5"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant={variant}
              className={`h-4 ${colIndex === 0 ? "w-full" : "w-2/3"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean;
  children: ReactNode;
  message?: string;
  variant?: "premium" | "luxury" | "enterprise";
  spinner?: boolean;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  children,
  message = "Loading...",
  variant = "luxury",
  spinner = true,
  className = "",
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-overlay-content">
            {spinner && <LoadingSpinner variant={variant} size="lg" />}
            {message && (
              <p className="text-sm font-medium text-neutral-300 text-center">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Smart Loading State Hook
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    setIsLoading,
  };
}

// Button Loading State
interface LoadingButtonProps {
  isLoading?: boolean;
  children: ReactNode;
  onClick?: () => void;
  variant?: "premium" | "luxury" | "enterprise";
  className?: string;
  disabled?: boolean;
}

export function LoadingButton({
  isLoading = false,
  children,
  onClick,
  variant = "premium",
  className = "",
  disabled = false,
}: LoadingButtonProps) {
  return (
    <NormalButton
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative overflow-hidden
        ${isLoading ? "btn-loading" : ""}
        ${className}
      `}
    >
      <span className={`btn-text ${isLoading ? "opacity-70" : ""}`}>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner variant={variant} size="sm" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </span>
    </NormalButton>
  );
}

// Staggered Loading Container
interface StaggeredLoadingProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  isLoading?: boolean;
}

export function StaggeredLoading({
  children,
  delay = 100,
  className = "",
  isLoading = false,
}: StaggeredLoadingProps) {
  if (isLoading) {
    return <div className={`stagger-loading ${className}`}>{children}</div>;
  }

  return <div className={className}>{children}</div>;
}
