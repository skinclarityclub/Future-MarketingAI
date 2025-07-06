"use client";

import React from "react";
import { usePerformanceMonitor } from "@/lib/dashboard/hooks/use-performance-monitor";
import { dashboardCache } from "@/lib/dashboard/cache";

export function PerformanceMonitor() {
  const { metrics, isLoading } = usePerformanceMonitor();
  const [cacheStats, setCacheStats] = React.useState<any>(null);

  React.useEffect(() => {
    // Update cache stats every 10 seconds
    const interval = setInterval(() => {
      setCacheStats(dashboardCache.getStats());
    }, 10000);

    // Initial load
    setCacheStats(dashboardCache.getStats());

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development" || isLoading) {
    return null;
  }

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value < threshold * 0.5) return "text-green-600";
    if (value < threshold) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white text-xs rounded-lg p-3 max-w-xs z-50 font-mono">
      <div className="text-yellow-400 font-bold mb-2">
        🚀 Performance Monitor
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Load Time:</span>
          <span className={getPerformanceColor(metrics.loadTime, 3000)}>
            {metrics.loadTime.toFixed(0)}ms
          </span>
        </div>

        <div className="flex justify-between">
          <span>Render Time:</span>
          <span className={getPerformanceColor(metrics.renderTime, 100)}>
            {metrics.renderTime.toFixed(0)}ms
          </span>
        </div>

        {metrics.memoryUsage && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className={getPerformanceColor(metrics.memoryUsage, 100)}>
              {metrics.memoryUsage.toFixed(1)}MB
            </span>
          </div>
        )}

        {metrics.fps && (
          <div className="flex justify-between">
            <span>FPS:</span>
            <span
              className={metrics.fps >= 30 ? "text-green-600" : "text-red-600"}
            >
              {metrics.fps}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Slow Device:</span>
          <span
            className={metrics.isSlowDevice ? "text-red-600" : "text-green-600"}
          >
            {metrics.isSlowDevice ? "Yes" : "No"}
          </span>
        </div>
      </div>

      {cacheStats && (
        <>
          <div className="border-t border-gray-600 mt-2 pt-2 text-blue-400 font-bold">
            📦 Cache Stats
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Entries:</span>
              <span>{cacheStats.validEntries}</span>
            </div>
            <div className="flex justify-between">
              <span>Hit Rate:</span>
              <span
                className={
                  cacheStats.hitRate > 0.7
                    ? "text-green-600"
                    : "text-yellow-600"
                }
              >
                {(cacheStats.hitRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Hits/Misses:</span>
              <span>
                {cacheStats.hits}/{cacheStats.misses}
              </span>
            </div>
          </div>
        </>
      )}

      <div className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-600">
        Dev Mode Only
      </div>
    </div>
  );
}
