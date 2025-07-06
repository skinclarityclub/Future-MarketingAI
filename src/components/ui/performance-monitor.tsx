"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  threshold: {
    warning: number;
    critical: number;
  };
}

interface PerformanceData {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  networkLatency: number;
  errorCount: number;
  userInteractions: number;
  timestamp: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  interval?: number;
  onMetricChange?: (metric: string, value: number) => void;
  className?: string;
  showDetailedView?: boolean;
}

export function PerformanceMonitor({
  enabled = true,
  interval = 1000,
  onMetricChange,
  className,
  showDetailedView = false,
}: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(enabled);

  const frameCount = useRef(0);
  const lastTimestamp = useRef(0);
  const animationFrameId = useRef<number>();
  const intervalId = useRef<NodeJS.Timeout>();

  // FPS Monitoring
  const measureFPS = useCallback(() => {
    frameCount.current++;

    const now = performance.now();
    if (now - lastTimestamp.current >= 1000) {
      const fps = Math.round(
        (frameCount.current * 1000) / (now - lastTimestamp.current)
      );
      frameCount.current = 0;
      lastTimestamp.current = now;
      return fps;
    }

    if (animationFrameId.current) {
      animationFrameId.current = requestAnimationFrame(measureFPS);
    }

    return null;
  }, []);

  // Memory Usage Monitoring
  const getMemoryUsage = useCallback((): number => {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }, []);

  // Bundle Size Estimation
  const getBundleSize = useCallback((): number => {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const connection = (navigator as any).connection;
      return connection?.downlink ? Math.round(connection.downlink * 100) : 0;
    }
    return 0;
  }, []);

  // Network Latency Monitoring
  const measureNetworkLatency = useCallback(async (): Promise<number> => {
    try {
      const start = performance.now();
      await fetch("/api/health", { method: "HEAD" });
      const end = performance.now();
      return Math.round(end - start);
    } catch {
      return -1; // Network error
    }
  }, []);

  // Render Time Monitoring
  const measureRenderTime = useCallback((): number => {
    const entries = performance.getEntriesByType("measure");
    const renderMeasures = entries.filter(
      entry => entry.name.includes("render") || entry.name.includes("React")
    );

    if (renderMeasures.length > 0) {
      const avgDuration =
        renderMeasures.reduce((sum, entry) => sum + entry.duration, 0) /
        renderMeasures.length;
      return Math.round(avgDuration);
    }

    return 0;
  }, []);

  // Collect Performance Data
  const collectMetrics = useCallback(async () => {
    if (!isMonitoring) return;

    const fps = measureFPS();
    const memoryUsage = getMemoryUsage();
    const bundleSize = getBundleSize();
    const renderTime = measureRenderTime();
    const networkLatency = await measureNetworkLatency();

    const data: PerformanceData = {
      fps: fps || 60,
      renderTime,
      memoryUsage,
      bundleSize,
      networkLatency,
      errorCount: 0, // This would come from error boundary
      userInteractions: 0, // This would come from event tracking
      timestamp: Date.now(),
    };

    setPerformanceData(prev => [...prev.slice(-19), data]); // Keep last 20 entries

    // Update current metrics
    const metrics: PerformanceMetric[] = [
      {
        name: "FPS",
        value: data.fps,
        unit: "fps",
        status:
          data.fps >= 50 ? "good" : data.fps >= 30 ? "warning" : "critical",
        threshold: { warning: 30, critical: 15 },
      },
      {
        name: "Memory",
        value: data.memoryUsage,
        unit: "MB",
        status:
          data.memoryUsage <= 100
            ? "good"
            : data.memoryUsage <= 200
              ? "warning"
              : "critical",
        threshold: { warning: 100, critical: 200 },
      },
      {
        name: "Render Time",
        value: data.renderTime,
        unit: "ms",
        status:
          data.renderTime <= 16
            ? "good"
            : data.renderTime <= 33
              ? "warning"
              : "critical",
        threshold: { warning: 16, critical: 33 },
      },
      {
        name: "Network",
        value: data.networkLatency,
        unit: "ms",
        status:
          data.networkLatency <= 100
            ? "good"
            : data.networkLatency <= 300
              ? "warning"
              : "critical",
        threshold: { warning: 100, critical: 300 },
      },
    ];

    setCurrentMetrics(metrics);

    // Notify about metric changes
    metrics.forEach(metric => {
      onMetricChange?.(metric.name, metric.value);
    });
  }, [
    isMonitoring,
    measureFPS,
    getMemoryUsage,
    getBundleSize,
    measureRenderTime,
    measureNetworkLatency,
    onMetricChange,
  ]);

  // Start monitoring
  useEffect(() => {
    if (isMonitoring) {
      animationFrameId.current = requestAnimationFrame(measureFPS);
      intervalId.current = setInterval(collectMetrics, interval);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [isMonitoring, interval, collectMetrics, measureFPS]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-orange-600 bg-orange-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-3 w-3" />;
      case "warning":
        return <AlertTriangle className="h-3 w-3" />;
      case "critical":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  // Calculate overall health score
  const getHealthScore = () => {
    if (currentMetrics.length === 0) return 100;

    const goodCount = currentMetrics.filter(m => m.status === "good").length;
    const warningCount = currentMetrics.filter(
      m => m.status === "warning"
    ).length;
    const criticalCount = currentMetrics.filter(
      m => m.status === "critical"
    ).length;

    const score =
      (goodCount * 100 + warningCount * 60 + criticalCount * 20) /
      currentMetrics.length;
    return Math.round(score);
  };

  const healthScore = getHealthScore();

  if (!isMonitoring && !isVisible) {
    return (
      <NormalButton
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50"
      >
        <Activity className="h-4 w-4 mr-1" />
        Performance
      </NormalButton>
    );
  }

  return (
    <div className={cn("fixed bottom-4 left-4 z-50", className)}>
      {/* Compact View */}
      {!showDetailedView && (
        <Card className="p-3 bg-white/95 backdrop-blur-sm border shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity
                className={cn(
                  "h-4 w-4",
                  healthScore >= 80
                    ? "text-green-600"
                    : healthScore >= 60
                      ? "text-orange-600"
                      : "text-red-600"
                )}
              />
              <span className="text-sm font-medium">{healthScore}%</span>
            </div>

            <div className="flex gap-1">
              {currentMetrics.slice(0, 4).map((metric, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn(
                    "text-xs px-1 py-0",
                    getStatusColor(metric.status)
                  )}
                  title={`${metric.name}: ${metric.value}${metric.unit}`}
                >
                  {getStatusIcon(metric.status)}
                </Badge>
              ))}
            </div>

            <div className="flex gap-1">
              <NormalButton
                onClick={() => setIsVisible(!isVisible)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {isVisible ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </NormalButton>
              <NormalButton
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {isMonitoring ? (
                  <Activity className="h-3 w-3 text-green-600" />
                ) : (
                  <Activity className="h-3 w-3 text-gray-400" />
                )}
              </NormalButton>
            </div>
          </div>
        </Card>
      )}

      {/* Detailed View */}
      {isVisible && showDetailedView && (
        <Card className="p-4 bg-white/95 backdrop-blur-sm border shadow-lg max-w-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance Monitor
              </h3>
              <div className="flex gap-1">
                <NormalButton
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <EyeOff className="h-3 w-3" />
                </NormalButton>
                <NormalButton
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  {isMonitoring ? (
                    <Activity className="h-3 w-3 text-green-600" />
                  ) : (
                    <Activity className="h-3 w-3 text-gray-400" />
                  )}
                </NormalButton>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Overall Health</span>
                <span
                  className={cn(
                    "font-medium",
                    healthScore >= 80
                      ? "text-green-600"
                      : healthScore >= 60
                        ? "text-orange-600"
                        : "text-red-600"
                  )}
                >
                  {healthScore}%
                </span>
              </div>
              <Progress
                value={healthScore}
                className={cn(
                  "h-2",
                  healthScore >= 80
                    ? "[&>div]:bg-green-600"
                    : healthScore >= 60
                      ? "[&>div]:bg-orange-600"
                      : "[&>div]:bg-red-600"
                )}
              />
            </div>

            <div className="space-y-2">
              {currentMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-1 rounded",
                        getStatusColor(metric.status)
                      )}
                    >
                      {getStatusIcon(metric.status)}
                    </div>
                    <span>{metric.name}</span>
                  </div>
                  <span className="font-mono">
                    {metric.value}
                    {metric.unit}
                  </span>
                </div>
              ))}
            </div>

            {performanceData.length > 0 && (
              <div className="text-xs text-gray-500">
                Last updated:{" "}
                {new Date(
                  performanceData[performanceData.length - 1]?.timestamp ||
                    Date.now()
                ).toLocaleTimeString()}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
