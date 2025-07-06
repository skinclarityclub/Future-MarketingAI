"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  lazy,
  Suspense,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Monitor,
  Grid3X3,
  Maximize2,
  Minimize2,
  Settings,
  Bot,
  CheckCircle,
  MousePointer,
  Layers,
} from "lucide-react";

// ⚡ PERFORMANCE: Lazy load heavy components
const LightweightBackground = lazy(() => import("./lightweight-background"));
const FuturisticSidebar = lazy(() => import("./futuristic-sidebar"));
const AIAvatarAssistant = lazy(() => import("./ai-avatar-assistant"));

// ⚡ PERFORMANCE: Use optimized real-time service
import {
  getOptimizedRealTimeService,
  type RealTimeDataState,
} from "@/lib/fortune-500/optimized-real-time-service";

// ⚡ PERFORMANCE: Memoized loading component
const LoadingSpinner = memo(({ className }: { className?: string }) => (
  <div
    className={cn(
      "animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400",
      className
    )}
  />
));

LoadingSpinner.displayName = "LoadingSpinner";

// ⚡ PERFORMANCE: Memoized status indicator
const StatusIndicator = memo(
  ({
    status,
    size = "sm",
  }: {
    status: "connected" | "connecting" | "disconnected" | "error";
    size?: "sm" | "md";
  }) => {
    const statusColors = {
      connected: "bg-green-400",
      connecting: "bg-yellow-400 animate-pulse",
      disconnected: "bg-red-400",
      error: "bg-red-500 animate-pulse",
    };

    const sizeClasses = {
      sm: "w-2 h-2",
      md: "w-3 h-3",
    };

    return (
      <div
        className={cn("rounded-full", statusColors[status], sizeClasses[size])}
      />
    );
  }
);

StatusIndicator.displayName = "StatusIndicator";

// ⚡ PERFORMANCE: Memoized metric display
const MetricDisplay = memo(
  ({
    label,
    value,
    unit = "",
    trend,
    className,
  }: {
    label: string;
    value: number | string;
    unit?: string;
    trend?: "up" | "down" | "stable";
    className?: string;
  }) => {
    const trendColors = {
      up: "text-green-400",
      down: "text-red-400",
      stable: "text-blue-400",
    };

    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-lg bg-slate-800/50",
          className
        )}
      >
        <span className="text-slate-300 text-sm">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-mono">
            {value}
            {unit}
          </span>
          {trend && (
            <div className={cn("w-2 h-2 rounded-full", trendColors[trend])} />
          )}
        </div>
      </div>
    );
  }
);

MetricDisplay.displayName = "MetricDisplay";

interface OptimizedCommandCenterProps {
  locale?: string;
  className?: string;
}

const OptimizedCommandCenter = memo(
  ({ locale = "en", className }: OptimizedCommandCenterProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeView, setActiveView] = useState<
      "grid" | "dashboard" | "analytics"
    >("grid");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [realTimeData, setRealTimeData] = useState<RealTimeDataState | null>(
      null
    );

    // ⚡ PERFORMANCE: Memoized real-time service
    const realTimeService = useMemo(() => getOptimizedRealTimeService(), []);

    // ⚡ PERFORMANCE: Optimized real-time subscription
    useEffect(() => {
      const unsubscribe = realTimeService.subscribe("command-center", data => {
        setRealTimeData(data);
      });

      return unsubscribe;
    }, [realTimeService]);

    // ⚡ PERFORMANCE: Memoized handlers
    const toggleFullscreen = useCallback(() => {
      setIsFullscreen(prev => !prev);
    }, []);

    const toggleSidebar = useCallback(() => {
      setSidebarCollapsed(prev => !prev);
    }, []);

    const handleViewChange = useCallback(
      (view: "grid" | "dashboard" | "analytics") => {
        setActiveView(view);
      },
      []
    );

    // ⚡ PERFORMANCE: Memoized system health calculation
    const systemHealth = useMemo(() => {
      if (!realTimeData) return "operational";
      return realTimeService.getSystemHealth();
    }, [realTimeData, realTimeService]);

    // ⚡ PERFORMANCE: Memoized metrics
    const systemMetrics = useMemo(() => {
      if (!realTimeData) return null;

      return [
        {
          label: "CPU",
          value: realTimeData.systemMetrics.cpu.toFixed(1),
          unit: "%",
          trend:
            realTimeData.systemMetrics.cpu > 75 ? "up" : ("stable" as const),
        },
        {
          label: "Memory",
          value: realTimeData.systemMetrics.memory.toFixed(1),
          unit: "%",
          trend:
            realTimeData.systemMetrics.memory > 75 ? "up" : ("stable" as const),
        },
        {
          label: "Network",
          value: realTimeData.systemMetrics.network.toFixed(1),
          unit: "%",
          trend: "stable" as const,
        },
        {
          label: "Uptime",
          value: realTimeData.systemMetrics.uptime.toFixed(2),
          unit: "%",
          trend: "up" as const,
        },
      ];
    }, [realTimeData]);

    // ⚡ PERFORMANCE: Memoized ROI metrics
    const roiMetrics = useMemo(() => {
      if (!realTimeData) return null;

      return [
        {
          label: "Revenue",
          value: `$${(realTimeData.roiMetrics.totalRevenue / 1000000).toFixed(2)}M`,
          trend: "up" as const,
        },
        {
          label: "ROI",
          value: realTimeData.roiMetrics.roi.toFixed(1),
          unit: "%",
          trend: "up" as const,
        },
        {
          label: "Conversion",
          value: realTimeData.roiMetrics.conversionRate.toFixed(2),
          unit: "%",
          trend: "stable" as const,
        },
        {
          label: "Connections",
          value: realTimeData.systemMetrics.activeConnections.toString(),
          trend: "stable" as const,
        },
      ];
    }, [realTimeData]);

    // ⚡ PERFORMANCE: Memoized quick actions
    const quickActions = useMemo(
      () => [
        {
          icon: Monitor,
          label: "System Monitor",
          action: () => handleViewChange("analytics"),
        },
        {
          icon: Grid3X3,
          label: "Grid View",
          action: () => handleViewChange("grid"),
        },
        {
          icon: Bot,
          label: "AI Assistant",
          action: () => console.log("AI Assistant"),
        },
        {
          icon: Settings,
          label: "Settings",
          action: () => console.log("Settings"),
        },
      ],
      [handleViewChange]
    );

    return (
      <div
        className={cn(
          "relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900",
          "transition-all duration-500 ease-out",
          isFullscreen && "fixed inset-0 z-50",
          className
        )}
      >
        {/* ⚡ PERFORMANCE: Lightweight Background with Suspense */}
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
          }
        >
          <LightweightBackground
            intensity="medium"
            color="multi"
            className="opacity-40"
          />
        </Suspense>

        {/* Header Controls */}
        <div className="relative z-20 flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Fortune 500 Command Center
            </h1>
            <StatusIndicator
              status={realTimeData?.isConnected ? "connected" : "connecting"}
              size="md"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            {quickActions.map((action, index) => (
              <NormalButton
                key={index}
                variant="ghost"
                size="sm"
                onClick={action.action}
                className="text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                <action.icon className="w-4 h-4" />
              </NormalButton>
            ))}

            <NormalButton
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </NormalButton>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex h-[calc(100vh-80px)]">
          {/* ⚡ PERFORMANCE: Lazy loaded sidebar */}
          {!sidebarCollapsed && (
            <Suspense
              fallback={<div className="w-80 bg-slate-900/50 animate-pulse" />}
            >
              <FuturisticSidebar
                className="w-80 border-r border-slate-700/50"
                onCollapse={toggleSidebar}
              />
            </Suspense>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* System Health Overview */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    System Health: {systemHealth.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {systemMetrics?.map((metric, index) => (
                      <MetricDisplay
                        key={index}
                        label={metric.label}
                        value={metric.value}
                        unit={metric.unit}
                        trend={metric.trend}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ROI Metrics */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    ROI Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {roiMetrics?.map((metric, index) => (
                      <MetricDisplay
                        key={index}
                        label={metric.label}
                        value={metric.value}
                        unit={metric.unit}
                        trend={metric.trend}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* View Tabs */}
              <Tabs
                value={activeView}
                onValueChange={value => handleViewChange(value as any)}
              >
                <TabsList className="bg-slate-800/50">
                  <TabsTrigger value="grid" className="text-slate-300">
                    Grid View
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="text-slate-300">
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-slate-300">
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Placeholder for dynamic content based on activeView */}
              <Card className="bg-slate-900/50 border-slate-700/50 min-h-[400px]">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Layers className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl text-slate-300 mb-2">
                        {activeView.charAt(0).toUpperCase() +
                          activeView.slice(1)}{" "}
                        View
                      </h3>
                      <p className="text-slate-500">
                        Content for {activeView} view will load here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* ⚡ PERFORMANCE: Lazy loaded AI Assistant */}
        <Suspense fallback={null}>
          <AIAvatarAssistant />
        </Suspense>
      </div>
    );
  }
);

OptimizedCommandCenter.displayName = "OptimizedCommandCenter";

export default OptimizedCommandCenter;
