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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Server,
  Database,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye,
  Zap,
} from "lucide-react";

interface InfrastructureMetric {
  timestamp: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_in: number;
  network_out: number;
  response_time: number;
  active_connections: number;
  error_rate: number;
}

interface ServiceHealth {
  name: string;
  status: "healthy" | "warning" | "critical" | "unknown";
  uptime: number;
  response_time: number;
  last_check: string;
  dependencies: string[];
}

interface AlertInfo {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: string;
  service: string;
  resolved: boolean;
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280"];

export function InfrastructureDashboard() {
  const [metrics, setMetrics] = useState<InfrastructureMetric[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - in production, replace with real API calls
  const generateMockMetrics = useCallback((): InfrastructureMetric[] => {
    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: now - (23 - i) * 300000, // 5-minute intervals for 2 hours
      cpu_usage: Math.random() * 80 + 10,
      memory_usage: Math.random() * 70 + 20,
      disk_usage: Math.random() * 30 + 50,
      network_in: Math.random() * 100 + 50,
      network_out: Math.random() * 80 + 30,
      response_time: Math.random() * 200 + 50,
      active_connections: Math.floor(Math.random() * 1000) + 100,
      error_rate: Math.random() * 5,
    }));
  }, []);

  const generateMockServices = useCallback(
    (): ServiceHealth[] => [
      {
        name: "Web Application",
        status: "healthy",
        uptime: 99.98,
        response_time: 89,
        last_check: new Date().toISOString(),
        dependencies: ["Database", "Cache"],
      },
      {
        name: "Database",
        status: "healthy",
        uptime: 99.95,
        response_time: 12,
        last_check: new Date().toISOString(),
        dependencies: [],
      },
      {
        name: "Cache (Redis)",
        status: "warning",
        uptime: 99.89,
        response_time: 5,
        last_check: new Date().toISOString(),
        dependencies: [],
      },
      {
        name: "API Gateway",
        status: "healthy",
        uptime: 99.97,
        response_time: 45,
        last_check: new Date().toISOString(),
        dependencies: ["Web Application"],
      },
      {
        name: "CDN",
        status: "healthy",
        uptime: 99.99,
        response_time: 23,
        last_check: new Date().toISOString(),
        dependencies: [],
      },
    ],
    []
  );

  const generateMockAlerts = useCallback(
    (): AlertInfo[] => [
      {
        id: "1",
        severity: "warning",
        message: "High memory usage detected on web server (85%)",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        service: "Web Application",
        resolved: false,
      },
      {
        id: "2",
        severity: "info",
        message: "Scheduled maintenance completed successfully",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        service: "Database",
        resolved: true,
      },
      {
        id: "3",
        severity: "critical",
        message: "Redis connection timeout - investigating",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        service: "Cache (Redis)",
        resolved: false,
      },
    ],
    []
  );

  const loadInfrastructureData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch real-time infrastructure data from API
      const response = await fetch("/api/metrics/infrastructure?range=2h");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update metrics with historical data for charts
      setMetrics(data.historical || []);

      // Update services from current data
      setServices(data.current?.services || generateMockServices());

      // Update alerts from current data
      setAlerts(data.current?.alerts || generateMockAlerts());

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to load infrastructure data:", err);

      // Fallback to mock data if API fails
      const newMetrics = generateMockMetrics();
      const newServices = generateMockServices();
      const newAlerts = generateMockAlerts();

      setMetrics(newMetrics);
      setServices(newServices);
      setAlerts(newAlerts);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load infrastructure data (using fallback data)"
      );
    } finally {
      setLoading(false);
    }
  }, [generateMockMetrics, generateMockServices, generateMockAlerts]);

  useEffect(() => {
    loadInfrastructureData();

    if (autoRefresh) {
      const interval = setInterval(loadInfrastructureData, 15000); // Refresh every 15 seconds
      return () => clearInterval(interval);
    }
  }, [loadInfrastructureData, autoRefresh]);

  const getStatusIcon = (status: ServiceHealth["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ServiceHealth["status"]) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSeverityColor = (severity: AlertInfo["severity"]) => {
    switch (severity) {
      case "info":
        return "text-blue-600 bg-blue-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCurrentMetrics = () => {
    if (!metrics.length) return null;
    return metrics[metrics.length - 1];
  };

  const currentMetrics = getCurrentMetrics();
  const healthyServices = services.filter(s => s.status === "healthy").length;
  const warningServices = services.filter(s => s.status === "warning").length;
  const criticalServices = services.filter(s => s.status === "critical").length;
  const activeAlerts = alerts.filter(a => !a.resolved).length;

  const pieData = [
    { name: "Healthy", value: healthyServices, color: "#10b981" },
    { name: "Warning", value: warningServices, color: "#f59e0b" },
    { name: "Critical", value: criticalServices, color: "#ef4444" },
  ].filter(item => item.value > 0);

  if (loading && !metrics.length) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Infrastructure Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <NormalButton
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 text-green-600" : ""}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${autoRefresh ? "animate-spin" : ""}`}
            />
            Auto Refresh
          </NormalButton>
          <NormalButton
            variant="outline"
            size="sm"
            onClick={loadInfrastructureData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </NormalButton>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics
                ? `${(currentMetrics.cpu_usage || 0).toFixed(1)}%`
                : "Loading..."}
            </div>
            <div className="text-sm text-muted-foreground">
              Current CPU usage
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics
                ? `${(currentMetrics.memory_usage || 0).toFixed(1)}%`
                : "Loading..."}
            </div>
            <div className="text-sm text-muted-foreground">
              Current memory usage
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics
                ? `${(currentMetrics.response_time || 0).toFixed(0)}ms`
                : "Loading..."}
            </div>
            <div className="text-sm text-muted-foreground">
              Current response time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {activeAlerts}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">
                {alerts.length} total alerts
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="services">Service Health</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Events</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* CPU & Memory Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage Over Time</CardTitle>
                <CardDescription>CPU and Memory usage trends</CardDescription>
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
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${(value || 0).toFixed(1)}%`,
                        name === "cpu_usage" ? "CPU" : "Memory",
                      ]}
                      labelFormatter={value => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cpu_usage"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="CPU Usage"
                    />
                    <Line
                      type="monotone"
                      dataKey="memory_usage"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Memory Usage"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time & Error Rate</CardTitle>
                <CardDescription>
                  Application performance metrics
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
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value: any) => `${(value || 0).toFixed(1)}%`}
                      labelFormatter={value => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="response_time"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Response Time (ms)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="error_rate"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Error Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Network Traffic */}
            <Card>
              <CardHeader>
                <CardTitle>Network Traffic</CardTitle>
                <CardDescription>
                  Inbound and outbound data flow
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
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${(value || 0).toFixed(1)} MB/s`,
                        name === "network_in" ? "Inbound" : "Outbound",
                      ]}
                      labelFormatter={value => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="network_in"
                      stackId="1"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.6}
                      name="Network In"
                    />
                    <Area
                      type="monotone"
                      dataKey="network_out"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      name="Network Out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Active Connections */}
            <Card>
              <CardHeader>
                <CardTitle>Active Connections</CardTitle>
                <CardDescription>
                  Real-time connection monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={value =>
                        new Date(value).toLocaleTimeString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `${(value || 0).toFixed(1)}`}
                      labelFormatter={value => new Date(value).toLocaleString()}
                    />
                    <Bar
                      dataKey="active_connections"
                      fill="#06b6d4"
                      name="Active Connections"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Service Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Service Status Overview</CardTitle>
                <CardDescription>Current health distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Services List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Service Health Details</CardTitle>
                <CardDescription>
                  Individual service status and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map(service => (
                    <div
                      key={service.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(service.status)}
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Dependencies:{" "}
                            {service.dependencies.join(", ") || "None"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(service.status)}>
                          {service.status.toUpperCase()}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          Uptime: {(service.uptime || 0).toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Response: {service.response_time || 0}ms
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts & Events</CardTitle>
                <CardDescription>
                  System alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${alert.resolved ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              Service: {alert.service} •{" "}
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.resolved && (
                            <Badge variant="outline" className="text-green-600">
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Throughput</CardTitle>
                <CardDescription>Data transfer rates over time</CardDescription>
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
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${(value || 0).toFixed(1)} MB/s`,
                        name === "network_in" ? "Inbound" : "Outbound",
                      ]}
                      labelFormatter={value => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="network_in"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      name="Inbound (MB/s)"
                    />
                    <Line
                      type="monotone"
                      dataKey="network_out"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Outbound (MB/s)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Statistics</CardTitle>
                <CardDescription>
                  Current network performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Peak Inbound</span>
                    <span className="text-sm">
                      {Math.max(
                        ...metrics
                          .filter(m => m.network_in != null)
                          .map(m => m.network_in || 0)
                      ).toFixed(1)}{" "}
                      MB/s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Peak Outbound</span>
                    <span className="text-sm">
                      {Math.max(
                        ...metrics
                          .filter(m => m.network_out != null)
                          .map(m => m.network_out || 0)
                      ).toFixed(1)}{" "}
                      MB/s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Latency</span>
                    <span className="text-sm">
                      {(
                        metrics
                          .filter(m => m.response_time != null)
                          .reduce((sum, m) => sum + (m.response_time || 0), 0) /
                        Math.max(
                          metrics.filter(m => m.response_time != null).length,
                          1
                        )
                      ).toFixed(0)}
                      ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Total Connections
                    </span>
                    <span className="text-sm">
                      {(
                        currentMetrics?.active_connections || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
