"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PerformanceLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "skeleton" | "dots" | "pulse";
  text?: string;
  showTimeout?: boolean;
  timeoutMs?: number;
  onTimeout?: () => void;
}

export function PerformanceLoading({
  className,
  size = "md",
  variant = "spinner",
  text,
  showTimeout = true,
  timeoutMs = 10000, // 10 seconds default
  onTimeout,
}: PerformanceLoadingProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [loadTime, setLoadTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setLoadTime(Date.now() - startTime);
    }, 100);

    let timeoutId: NodeJS.Timeout;

    if (showTimeout && timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        setHasTimedOut(true);
        onTimeout?.();

        // Track slow loading in analytics
        if (typeof window !== "undefined") {
          fetch("/api/tracking/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: {
                event_type: "slow_loading_detected",
                load_time_ms: timeoutMs,
                page_url: window.location.href,
                timestamp: new Date().toISOString(),
              },
            }),
          }).catch(() => {});
        }
      }, timeoutMs);
    }

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showTimeout, timeoutMs, onTimeout]);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const renderSpinner = () => (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400",
        sizeClasses[size]
      )}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-2">
      <div
        className={cn(
          "bg-gray-200 dark:bg-gray-700 rounded animate-pulse",
          size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-5"
        )}
      />
      <div
        className={cn(
          "bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4",
          size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-5"
        )}
      />
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        "bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse",
        sizeClasses[size]
      )}
    />
  );

  const renderVariant = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "skeleton":
        return renderSkeleton();
      case "pulse":
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  if (hasTimedOut) {
    return (
      <div className={cn("text-center p-4", className)}>
        <div className="text-yellow-600 dark:text-yellow-400 text-4xl mb-2">
          ⏰
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This is taking longer than expected...
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Load time: {Math.round(loadTime / 1000)}s
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center p-4", className)}
    >
      {renderVariant()}
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{text}</p>
      )}
      {showTimeout && loadTime > 3000 && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {Math.round(loadTime / 1000)}s elapsed...
        </p>
      )}
    </div>
  );
}

// Optimized Suspense wrapper with performance tracking
export function PerformanceSuspense({
  children,
  fallback,
  name,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}) {
  const defaultFallback = (
    <PerformanceLoading
      variant="skeleton"
      text={name ? `Loading ${name}...` : "Loading..."}
    />
  );

  return (
    <React.Suspense fallback={fallback || defaultFallback}>
      {children}
    </React.Suspense>
  );
}

// Performance-aware lazy loading
export function createLazyComponent<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  name?: string
) {
  const LazyComponent = React.lazy(async () => {
    const startTime = performance.now();

    try {
      const module = await factory();
      const loadTime = performance.now() - startTime;

      // Track component loading performance
      if (typeof window !== "undefined" && loadTime > 1000) {
        fetch("/api/tracking/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: {
              event_type: "slow_component_load",
              component_name: name || "unknown",
              load_time_ms: loadTime,
              page_url: window.location.href,
              timestamp: new Date().toISOString(),
            },
          }),
        }).catch(() => {});
      }

      return module;
    } catch (error) {
      // Track loading errors
      if (typeof window !== "undefined") {
        fetch("/api/tracking/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: {
              event_type: "component_load_error",
              component_name: name || "unknown",
              error_message:
                error instanceof Error ? error.message : "Unknown error",
              page_url: window.location.href,
              timestamp: new Date().toISOString(),
            },
          }),
        }).catch(() => {});
      }
      throw error;
    }
  });

  LazyComponent.displayName = `Lazy(${name || "Component"})`;

  return LazyComponent;
}
