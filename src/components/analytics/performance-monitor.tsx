"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Server,
  Wifi,
  Zap,
} from "lucide-react";

interface PerformanceMetrics {
  operation: string;
  start_time: number;
  end_time: number;
  duration_ms: number;
  data_points_processed: number;
  memory_usage_mb: number;
  cache_hits?: number;
  cache_misses?: number;
}

interface CacheStats {
  size: number;
  hit_rate: number;
  memory_usage: number;
}

interface SystemHealth {
  memory_usage_mb: number;
  active_operations: number;
  queue_size: number;
  uptime_ms: number;
}

interface PerformanceReport {
  metrics: PerformanceMetrics[];
  cache_stats: CacheStats;
  system_health: SystemHealth;
}

interface LoadTestResult {
  operation_id: number;
  processing_time_ms: number;
  data_points: number;
  success: boolean;
  errors: number;
}

export default function PerformanceMonitor() {
  const [performanceData, setPerformanceData] =
    useState<PerformanceReport | null>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [loadTestResults, setLoadTestResults] = useState<LoadTestResult[]>([]);
  const [isLoadTesting, setIsLoadTesting] = useState(false);
  const [refreshInterval, _setRefreshInterval] = useState(5000);
  const [chartData, setChartData] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<
    "excellent" | "good" | "warning" | "critical"
  >("good");
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, _setAlerts] = useState<Alert[]>([]);

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);

      if (process.env.NODE_ENV === "development") {
        console.log("Fetching performance metrics...");
      }

      const response = await fetch(
        "/api/tactical-analysis/performance?action=health"
      );
      const data = await response.json();

      if (data.success) {
        setPerformanceData(data.data.performance_report);
        updateChartData(data.data.performance_report);
        assessSystemStatus(data.data.performance_report);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch performance metrics:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Update chart data for visualization
  const updateChartData = (report: PerformanceReport) => {
    const recent = report.metrics.slice(-20).map((metric, _index) => ({
      time: new Date(metric.end_time).toLocaleTimeString(),
      duration: metric.duration_ms,
      memory: metric.memory_usage_mb,
      dataPoints: metric.data_points_processed,
      cacheHitRate:
        metric.cache_hits && metric.cache_misses
          ? (metric.cache_hits / (metric.cache_hits + metric.cache_misses)) *
            100
          : 0,
    }));
    setChartData(recent);
  };

  // Assess overall system status
  const assessSystemStatus = (report: PerformanceReport) => {
    const avgDuration =
      report.metrics.length > 0
        ? report.metrics.reduce((sum, m) => sum + m.duration_ms, 0) /
          report.metrics.length
        : 0;
    const memoryUsage = report.system_health.memory_usage_mb;
    const cacheHitRate = report.cache_stats.hit_rate;

    if (avgDuration > 5000 || memoryUsage > 500 || cacheHitRate < 0.7) {
      setSystemStatus("critical");
    } else if (avgDuration > 3000 || memoryUsage > 300 || cacheHitRate < 0.8) {
      setSystemStatus("warning");
    } else if (avgDuration < 1000 && memoryUsage < 200 && cacheHitRate > 0.9) {
      setSystemStatus("excellent");
    } else {
      setSystemStatus("good");
    }
  };

  // Start real-time monitoring
  const startRealTimeMonitoring = async () => {
    try {
      const response = await fetch("/api/tactical-analysis/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "realtime_start" }),
      });

      if (response.ok) {
        setIsRealTimeActive(true);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to start real-time monitoring:", error);
      }
    }
  };

  // Stop real-time monitoring
  const stopRealTimeMonitoring = async () => {
    try {
      const response = await fetch("/api/tactical-analysis/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "realtime_stop" }),
      });

      if (response.ok) {
        setIsRealTimeActive(false);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to stop real-time monitoring:", error);
      }
    }
  };

  // Run load test
  const runLoadTest = async () => {
    setIsLoadTesting(true);
    try {
      const response = await fetch("/api/tactical-analysis/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "load_test",
          parameters: {
            concurrency: 3,
            iterations: 15,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setLoadTestResults(data.data.load_test_results);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to run load test:", error);
      }
    } finally {
      setIsLoadTesting(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPerformanceData, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-blue-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-5 w-5" />;
      case "good":
        return <Activity className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const formatValue = (value: number, _index: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const optimizePerformance = () => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Optimizing performance metrics...");
      }
      // Implementation for performance optimization
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Performance optimization failed:", error);
      }
    }
  };

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading performance data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with System Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Performance Monitor
          </h2>
          <p className="text-muted-foreground">
            Real-time tactical analysis engine performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge
            variant="outline"
            className={`${getStatusColor(systemStatus)} text-white`}
          >
            {getStatusIcon(systemStatus)}
            <span className="ml-1 capitalize">{systemStatus}</span>
          </Badge>
          <div className="flex space-x-2">
            <NormalButton
              onClick={
                isRealTimeActive
                  ? stopRealTimeMonitoring
                  : startRealTimeMonitoring
              }
              variant={isRealTimeActive ? "destructive" : "default"}
              size="sm"
            >
              {isRealTimeActive ? "Stop" : "Start"} Real-time
            </NormalButton>
            <NormalButton
              onClick={runLoadTest}
              disabled={isLoadTesting}
              variant="outline"
              size="sm"
            >
              {isLoadTesting ? "Testing..." : "Load Test"}
            </NormalButton>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Memory Usage</p>
                <p className="text-2xl font-bold">
                  {performanceData.system_health.memory_usage_mb}MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Operations</p>
                <p className="text-2xl font-bold">
                  {performanceData.system_health.active_operations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Cache Hit Rate</p>
                <p className="text-2xl font-bold">
                  {(performanceData.cache_stats.hit_rate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    performanceData.system_health.uptime_ms / 1000 / 60
                  )}
                  m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Charts</TabsTrigger>
          <TabsTrigger value="load-test">Load Testing</TabsTrigger>
          <TabsTrigger value="cache">Cache Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Operations</CardTitle>
                <CardDescription>
                  Last 10 tactical analysis operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.metrics.slice(-10).map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {metric.operation}
                        </p>
                        <p className="text-xs text-gray-500">
                          {metric.data_points_processed} data points
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {metric.duration_ms}ms
                        </p>
                        <p className="text-xs text-gray-500">
                          {metric.memory_usage_mb}MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Current system status and resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm">
                      {performanceData.system_health.memory_usage_mb}MB / 512MB
                    </span>
                  </div>
                  <Progress
                    value={
                      (performanceData.system_health.memory_usage_mb / 512) *
                      100
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Cache Efficiency
                    </span>
                    <span className="text-sm">
                      {(performanceData.cache_stats.hit_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={performanceData.cache_stats.hit_rate * 100}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Active Operations
                    </span>
                    <span className="text-sm">
                      {performanceData.system_health.active_operations} / 10
                    </span>
                  </div>
                  <Progress
                    value={
                      (performanceData.system_health.active_operations / 10) *
                      100
                    }
                  />
                </div>

                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    {isRealTimeActive
                      ? "Real-time monitoring is active. Performance data updates automatically."
                      : "Real-time monitoring is disabled. Click 'Start Real-time' to enable live updates."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>Operation duration over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Memory Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>System memory consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="load-test" className="space-y-4">
          {loadTestResults.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Load Test Results</CardTitle>
                  <CardDescription>
                    Performance under concurrent load
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={loadTestResults.slice(-20)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="operation_id" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="processing_time_ms" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Load Test Statistics</CardTitle>
                  <CardDescription>
                    Aggregate performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Success Rate</p>
                        <p className="text-2xl font-bold">
                          {(
                            (loadTestResults.filter(r => r.success).length /
                              loadTestResults.length) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Avg Response</p>
                        <p className="text-2xl font-bold">
                          {Math.round(
                            loadTestResults.reduce(
                              (sum, r) => sum + r.processing_time_ms,
                              0
                            ) / loadTestResults.length
                          )}
                          ms
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Total Operations
                        </p>
                        <p className="text-2xl font-bold">
                          {loadTestResults.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Total Data Points
                        </p>
                        <p className="text-2xl font-bold">
                          {loadTestResults
                            .reduce((sum, r) => sum + r.data_points, 0)
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 mb-4">
                  No load test results available
                </p>
                <NormalButton onClick={runLoadTest} disabled={isLoadTesting}>
                  {isLoadTesting ? "Running Load Test..." : "Run Load Test"}
                </NormalButton>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Size</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {performanceData.cache_stats.size}
                </p>
                <p className="text-sm text-gray-500">Cached entries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(performanceData.cache_stats.hit_rate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">Cache efficiency</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {performanceData.cache_stats.memory_usage.toFixed(1)}MB
                </p>
                <p className="text-sm text-gray-500">Cache memory</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
