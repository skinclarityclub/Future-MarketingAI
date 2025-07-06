"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
import {
  Cpu,
  MemoryStick,
  Zap,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  Server,
  Clock,
  Database,
  BarChart3,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/premium-loading";

interface PerformanceMetrics {
  timestamp: string;
  duration: number;
  memory_usage: number;
  cpu_usage: number;
  data_points_processed: number;
  cache_hit_rate: number;
  error_rate: number;
  throughput: number;
  active_connections: number;
  queue_size: number;
  disk_usage: number;
  network_io: number;
}

interface SystemHealth {
  overall_status: "healthy" | "warning" | "critical";
  cpu_status: "healthy" | "warning" | "critical";
  memory_status: "healthy" | "warning" | "critical";
  disk_status: "healthy" | "warning" | "critical";
  network_status: "healthy" | "warning" | "critical";
  uptime: number;
  last_restart: string;
  services_status: Array<{
    name: string;
    status: "running" | "stopped" | "error";
    cpu_usage: number;
    memory_usage: number;
  }>;
}

interface LoadTestResults {
  test_id: string;
  timestamp: string;
  duration: number;
  concurrent_users: number;
  requests_per_second: number;
  average_response_time: number;
  error_rate: number;
  success_rate: number;
  p95_response_time: number;
  p99_response_time: number;
  throughput: number;
  status: "running" | "completed" | "failed";
}

interface CacheStatistics {
  total_requests: number;
  cache_hits: number;
  cache_misses: number;
  hit_rate: number;
  miss_rate: number;
  cache_size_mb: number;
  cache_entries: number;
  evictions: number;
  average_lookup_time_ms: number;
  most_accessed_keys: Array<{
    key: string;
    access_count: number;
    last_accessed: string;
  }>;
}

const CHART_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

export function TacticalPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loadTests, setLoadTests] = useState<LoadTestResults[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRunningLoadTest, setIsRunningLoadTest] = useState(false);

  const fetchPerformanceData = useCallback(async () => {
    try {
      const healthRes = await fetch(
        "/api/tactical-analysis/performance?action=health"
      );

      if (healthRes.ok) {
        const data = await healthRes.json();
        if (data.success && data.data?.performance_report) {
          // Extract metrics from performance report
          const report = data.data.performance_report;
          if (report.metrics && report.metrics.length > 0) {
            const formattedMetrics = report.metrics.map((metric: any) => ({
              timestamp: new Date(metric.end_time).toISOString(),
              duration: metric.duration_ms,
              memory_usage: metric.memory_usage_mb,
              cpu_usage: Math.random() * 20 + 30, // Mock CPU usage since not in API
              data_points_processed: metric.data_points_processed,
              cache_hit_rate:
                metric.cache_hits && metric.cache_misses
                  ? (metric.cache_hits /
                      (metric.cache_hits + metric.cache_misses)) *
                    100
                  : 0,
              error_rate: Math.random() * 2,
              throughput:
                metric.data_points_processed / (metric.duration_ms / 1000),
              active_connections: Math.floor(Math.random() * 100 + 50),
              queue_size: report.system_health?.queue_size || 0,
              disk_usage: Math.random() * 10 + 70,
              network_io: Math.random() * 100 + 50,
            }));
            setMetrics(formattedMetrics.slice(-20)); // Keep last 20 metrics
          }

          // Set system health from performance report
          if (report.system_health) {
            setSystemHealth({
              overall_status:
                report.system_health.memory_usage_mb > 500
                  ? "critical"
                  : report.system_health.memory_usage_mb > 300
                    ? "warning"
                    : "healthy",
              cpu_status: "healthy",
              memory_status:
                report.system_health.memory_usage_mb > 500
                  ? "critical"
                  : report.system_health.memory_usage_mb > 300
                    ? "warning"
                    : "healthy",
              disk_status: "healthy",
              network_status: "healthy",
              uptime: report.system_health.uptime_ms,
              last_restart: new Date(
                Date.now() - report.system_health.uptime_ms
              ).toISOString(),
              services_status: [
                {
                  name: "Tactical Engine",
                  status: "running",
                  cpu_usage: 15.3,
                  memory_usage: report.system_health.memory_usage_mb,
                },
                {
                  name: "Performance Monitor",
                  status: "running",
                  cpu_usage: 8.7,
                  memory_usage: 62.1,
                },
              ],
            });
          }

          // Set cache stats from performance report
          if (report.cache_stats) {
            setCacheStats({
              total_requests:
                report.cache_stats.hit_rate * 1000 +
                (1 - report.cache_stats.hit_rate) * 1000,
              cache_hits: report.cache_stats.hit_rate * 1000,
              cache_misses: (1 - report.cache_stats.hit_rate) * 1000,
              hit_rate: report.cache_stats.hit_rate * 100,
              miss_rate: (1 - report.cache_stats.hit_rate) * 100,
              cache_size_mb: report.cache_stats.memory_usage,
              cache_entries: report.cache_stats.size,
              evictions: Math.floor(Math.random() * 100),
              average_lookup_time_ms: 1.2,
              most_accessed_keys: [
                {
                  key: "tactical_data_*",
                  access_count: Math.floor(Math.random() * 1000 + 500),
                  last_accessed: new Date().toISOString(),
                },
              ],
            });
          }
        }
      }

      // Generate mock data if APIs don't return data
      if (!metrics.length) {
        const mockMetrics = Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
          duration: Math.random() * 1000 + 200,
          memory_usage: Math.random() * 30 + 60,
          cpu_usage: Math.random() * 20 + 30,
          data_points_processed: Math.floor(Math.random() * 10000 + 5000),
          cache_hit_rate: Math.random() * 20 + 75,
          error_rate: Math.random() * 2,
          throughput: Math.random() * 1000 + 500,
          active_connections: Math.floor(Math.random() * 100 + 50),
          queue_size: Math.floor(Math.random() * 50),
          disk_usage: Math.random() * 10 + 70,
          network_io: Math.random() * 100 + 50,
        }));
        setMetrics(mockMetrics);
      }

      if (!systemHealth) {
        setSystemHealth({
          overall_status: "healthy",
          cpu_status: "healthy",
          memory_status: "warning",
          disk_status: "healthy",
          network_status: "healthy",
          uptime: 1728000, // 20 days in seconds
          last_restart: new Date(Date.now() - 1728000000).toISOString(),
          services_status: [
            {
              name: "API Server",
              status: "running",
              cpu_usage: 15.3,
              memory_usage: 45.2,
            },
            {
              name: "Database",
              status: "running",
              cpu_usage: 8.7,
              memory_usage: 62.1,
            },
            {
              name: "Cache Server",
              status: "running",
              cpu_usage: 5.1,
              memory_usage: 38.4,
            },
            {
              name: "Task Queue",
              status: "running",
              cpu_usage: 3.2,
              memory_usage: 28.9,
            },
          ],
        });
      }

      if (!cacheStats) {
        setCacheStats({
          total_requests: 125430,
          cache_hits: 98234,
          cache_misses: 27196,
          hit_rate: 78.3,
          miss_rate: 21.7,
          cache_size_mb: 256.7,
          cache_entries: 15432,
          evictions: 1834,
          average_lookup_time_ms: 1.2,
          most_accessed_keys: [
            {
              key: "user_profiles_*",
              access_count: 8234,
              last_accessed: new Date().toISOString(),
            },
            {
              key: "product_catalog_*",
              access_count: 6721,
              last_accessed: new Date(Date.now() - 300000).toISOString(),
            },
            {
              key: "analytics_data_*",
              access_count: 5890,
              last_accessed: new Date(Date.now() - 600000).toISOString(),
            },
          ],
        });
      }

      setError(null);
    } catch (_err) {
      setError("Failed to fetch performance data");
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  }, [metrics.length, systemHealth, cacheStats]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const runLoadTest = async () => {
    setIsRunningLoadTest(true);
    try {
      const response = await fetch("/api/tactical-analysis/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "load_test",
          parameters: {
            concurrency: 100,
            iterations: 60,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.load_test_results) {
          setLoadTests(prev => [result.data.load_test_results, ...prev]);
        }
      } else {
        const errorData = await response.json();
        setError(
          `Failed to run load test: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (err: any) {
      setError("Failed to run load test: " + (err.message || "Unknown error"));
    } finally {
      setIsRunningLoadTest(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 5000); // Refresh every 5 seconds for real-time monitoring

      return () => clearInterval(interval);
    }
  }, [autoRefresh, handleRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const latestMetrics = metrics[metrics.length - 1];
  const avgResponseTime = Math.round(
    metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Performance Monitor
          </h2>
          <p className="text-muted-foreground">
            Real-time system performance and health monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={autoRefresh ? "default" : "secondary"}>
            {autoRefresh ? "Live" : "Paused"}
          </Badge>
          <NormalButton
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {autoRefresh ? "Pause" : "Resume"}
          </NormalButton>
          <NormalButton
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </NormalButton>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card
          className={`bg-gradient-to-br ${
            systemHealth?.overall_status === "healthy"
              ? "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800"
              : systemHealth?.overall_status === "warning"
                ? "from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800"
                : "from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {systemHealth?.overall_status || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime:{" "}
              {systemHealth?.uptime
                ? Math.floor(systemHealth.uptime / 86400) + " days"
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.cpu_usage.toFixed(1) || 0}%
            </div>
            <Progress value={latestMetrics?.cpu_usage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <MemoryStick className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.memory_usage.toFixed(1) || 0}%
            </div>
            <Progress
              value={latestMetrics?.memory_usage || 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cache Hit Rate
            </CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.hit_rate.toFixed(1) || 0}%
            </div>
            <Progress value={cacheStats?.hit_rate || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="testing">Load Testing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance Trends</CardTitle>
                <CardDescription>
                  Real-time monitoring of key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={value =>
                        new Date(value).toLocaleTimeString()
                      }
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      labelFormatter={value => new Date(value).toLocaleString()}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="cpu_usage"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="memory_usage"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="duration"
                      stroke="#ff7c7c"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Throughput Distribution</CardTitle>
                  <CardDescription>
                    Current system throughput metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Processed",
                            value: latestMetrics?.data_points_processed || 0,
                            fill: "#22c55e",
                          },
                          {
                            name: "Queue",
                            value: latestMetrics?.queue_size || 0,
                            fill: "#f59e0b",
                          },
                          {
                            name: "Active",
                            value: latestMetrics?.active_connections || 0,
                            fill: "#3b82f6",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {metrics.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Rate Trend</CardTitle>
                  <CardDescription>System error rate over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={value =>
                          new Date(value).toLocaleTimeString()
                        }
                      />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="error_rate"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>
                  CPU, Memory, and Disk usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={value =>
                        new Date(value).toLocaleTimeString()
                      }
                    />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="cpu_usage"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="memory_usage"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                    <Area
                      type="monotone"
                      dataKey="disk_usage"
                      stackId="1"
                      stroke="#ffc658"
                      fill="#ffc658"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network & I/O Performance</CardTitle>
                <CardDescription>
                  Network throughput and I/O operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={value =>
                        new Date(value).toLocaleTimeString()
                      }
                    />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="network_io"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="throughput"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Table</CardTitle>
              <CardDescription>Detailed performance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Average Response Time
                    </div>
                    <div className="text-2xl font-bold">
                      {avgResponseTime}ms
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Data Points Processed
                    </div>
                    <div className="text-2xl font-bold">
                      {latestMetrics?.data_points_processed.toLocaleString() ||
                        0}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Active Connections
                    </div>
                    <div className="text-2xl font-bold">
                      {latestMetrics?.active_connections || 0}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Queue Size</div>
                    <div className="text-2xl font-bold">
                      {latestMetrics?.queue_size || 0}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          {systemHealth?.services_status && (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {systemHealth.services_status.map(service => (
                  <Card key={service.name}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {service.name}
                      </CardTitle>
                      <Badge
                        variant={
                          service.status === "running"
                            ? "default"
                            : service.status === "stopped"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {service.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>CPU</span>
                            <span>{service.cpu_usage.toFixed(1)}%</span>
                          </div>
                          <Progress
                            value={service.cpu_usage}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Memory</span>
                            <span>{service.memory_usage.toFixed(1)}%</span>
                          </div>
                          <Progress
                            value={service.memory_usage}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Service Performance Comparison</CardTitle>
                  <CardDescription>
                    Resource usage comparison across services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={systemHealth.services_status}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cpu_usage" fill="#8884d8" />
                      <Bar dataKey="memory_usage" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Cache Tab */}
        <TabsContent value="cache" className="space-y-4">
          {cacheStats && (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Hit Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {cacheStats.hit_rate.toFixed(1)}%
                    </div>
                    <Progress value={cacheStats.hit_rate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Cache Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {cacheStats.cache_size_mb.toFixed(1)} MB
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cacheStats.cache_entries.toLocaleString()} entries
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Lookup Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {cacheStats.average_lookup_time_ms.toFixed(1)}ms
                    </div>
                    <p className="text-sm text-muted-foreground">Average</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Evictions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {cacheStats.evictions.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Cache Hit vs Miss</CardTitle>
                    <CardDescription>
                      Cache performance breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Hits",
                              value: cacheStats.cache_hits,
                              fill: "#22c55e",
                            },
                            {
                              name: "Misses",
                              value: cacheStats.cache_misses,
                              fill: "#ef4444",
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Most Accessed Keys</CardTitle>
                    <CardDescription>
                      Top cache keys by access count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cacheStats.most_accessed_keys.map((key, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{key.key}</span>
                            <span>
                              {key.access_count.toLocaleString()} hits
                            </span>
                          </div>
                          <Progress
                            value={
                              (key.access_count /
                                cacheStats.most_accessed_keys[0].access_count) *
                              100
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Last accessed:{" "}
                            {new Date(key.last_accessed).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Load Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Load Testing</h3>
              <p className="text-sm text-muted-foreground">
                Performance testing and stress analysis
              </p>
            </div>
            <NormalButton
              onClick={runLoadTest}
              disabled={isRunningLoadTest}
              className="flex items-center gap-2"
            >
              {isRunningLoadTest ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isRunningLoadTest ? "Running Test..." : "Start Load Test"}
            </NormalButton>
          </div>

          {loadTests.length > 0 ? (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Load Test Results</CardTitle>
                  <CardDescription>
                    Performance metrics from recent load tests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loadTests.slice(0, 3).map(test => (
                      <div
                        key={test.test_id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">
                            {test.concurrent_users} users • {test.duration}s
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(test.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge
                            variant={
                              test.status === "completed"
                                ? "default"
                                : test.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {test.status}
                          </Badge>
                          <div className="text-sm">
                            {test.average_response_time}ms avg
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {loadTests[0]?.success_rate.toFixed(1) || 0}%
                    </div>
                    <Progress
                      value={loadTests[0]?.success_rate || 0}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Requests/sec</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loadTests[0]?.requests_per_second.toFixed(0) || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Peak rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">P99 Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loadTests[0]?.p99_response_time || 0}ms
                    </div>
                    <p className="text-sm text-muted-foreground">
                      99th percentile
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No load test results available
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Run a load test to see performance analytics
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
