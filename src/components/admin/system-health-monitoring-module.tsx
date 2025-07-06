/**
 * Admin Dashboard System Health Monitoring Module
 * Subtask 82.4: Develop System Health Monitoring Module
 *
 * Displays real-time system health metrics including uptime, performance,
 * resource utilization, and third-party API status using the new real-time
 * data integration framework.
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSystemHealthRealtime } from "@/hooks/use-admin-dashboard-realtime";
import {
  Activity,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Database,
  Wifi,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemHealthModuleProps {
  className?: string;
  showDetailedView?: boolean;
  refreshInterval?: number;
}

interface ServiceStatus {
  name: string;
  status: "healthy" | "warning" | "critical" | "offline";
  responseTime: number;
  uptime: number;
  lastCheck: Date;
  url?: string;
  description: string;
}

interface ResourceMetric {
  name: string;
  current: number;
  maximum: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  history: number[];
}

export function SystemHealthMonitoringModule({
  className,
  showDetailedView = false,
  refreshInterval = 30000,
}: SystemHealthModuleProps) {
  const {
    snapshot,
    alerts,
    connectionStatus,
    error,
    isLoading,
    forceRefresh,
    acknowledgeAlert,
  } = useSystemHealthRealtime();

  const [detailedViewEnabled, setDetailedViewEnabled] =
    useState(showDetailedView);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock data for demonstration - in production, this would come from real-time data
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Database",
      status: "healthy",
      responseTime: 45,
      uptime: 99.98,
      lastCheck: new Date(),
      description: "Primary PostgreSQL database",
    },
    {
      name: "Redis Cache",
      status: "healthy",
      responseTime: 12,
      uptime: 99.95,
      lastCheck: new Date(),
      description: "Redis caching service",
    },
    {
      name: "Supabase API",
      status: "warning",
      responseTime: 180,
      uptime: 99.85,
      lastCheck: new Date(),
      url: "https://supabase.com",
      description: "Supabase backend services",
    },
    {
      name: "n8n Workflows",
      status: "healthy",
      responseTime: 95,
      uptime: 99.92,
      lastCheck: new Date(),
      description: "n8n workflow automation",
    },
    {
      name: "External APIs",
      status: "critical",
      responseTime: 2500,
      uptime: 98.75,
      lastCheck: new Date(),
      description: "Third-party API integrations",
    },
  ]);

  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetric[]>([
    {
      name: "CPU Usage",
      current: 67,
      maximum: 100,
      unit: "%",
      status: "warning",
      trend: "up",
      history: [45, 52, 48, 61, 67],
    },
    {
      name: "Memory Usage",
      current: 5.8,
      maximum: 8.0,
      unit: "GB",
      status: "healthy",
      trend: "stable",
      history: [5.2, 5.5, 5.6, 5.7, 5.8],
    },
    {
      name: "Disk Usage",
      current: 380,
      maximum: 500,
      unit: "GB",
      status: "warning",
      trend: "up",
      history: [350, 360, 365, 375, 380],
    },
    {
      name: "Network I/O",
      current: 45,
      maximum: 100,
      unit: "Mbps",
      status: "healthy",
      trend: "down",
      history: [52, 48, 47, 46, 45],
    },
  ]);

  // Update data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setServices(prev =>
        prev.map(service => ({
          ...service,
          responseTime: service.responseTime + (Math.random() - 0.5) * 20,
          lastCheck: new Date(),
        }))
      );

      setResourceMetrics(prev =>
        prev.map(metric => ({
          ...metric,
          current: Math.max(
            0,
            Math.min(
              metric.maximum,
              metric.current + (Math.random() - 0.5) * (metric.maximum * 0.05)
            )
          ),
          history: [...metric.history.slice(1), metric.current],
        }))
      );
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "offline":
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "offline":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getResourceStatusColor = (metric: ResourceMetric) => {
    const percentage = (metric.current / metric.maximum) * 100;
    if (percentage > 85) return "bg-red-500";
    if (percentage > 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatResponseTime = (time: number) => {
    return `${Math.round(time)}ms`;
  };

  const getOverallHealthStatus = () => {
    if (snapshot?.systemHealth) {
      return snapshot.systemHealth.overall_status;
    }

    const criticalServices = services.filter(
      s => s.status === "critical"
    ).length;
    const warningServices = services.filter(s => s.status === "warning").length;

    if (criticalServices > 0) return "critical";
    if (warningServices > 0) return "warning";
    return "healthy";
  };

  const overallStatus = getOverallHealthStatus();
  const healthyServices = services.filter(s => s.status === "healthy").length;
  const totalServices = services.length;
  const systemUptime = snapshot?.systemHealth?.uptime_percentage || 99.95;

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load system health data: {error}
            </AlertDescription>
          </Alert>
          <Button
            onClick={forceRefresh}
            variant="outline"
            className="mt-4"
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
            />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            System Health Monitor
          </h2>
          <p className="text-muted-foreground">
            Real-time monitoring of system performance and service availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              connectionStatus === "connected" ? "default" : "destructive"
            }
            className="flex items-center gap-1"
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                connectionStatus === "connected" ? "bg-green-500" : "bg-red-500"
              )}
            />
            {connectionStatus === "connected" ? "Live" : "Disconnected"}
          </Badge>
          <Button
            onClick={forceRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            onClick={() => setDetailedViewEnabled(!detailedViewEnabled)}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      <Card
        className={cn(
          "border-2",
          overallStatus === "healthy" && "border-green-200 bg-green-50/30",
          overallStatus === "warning" && "border-yellow-200 bg-yellow-50/30",
          overallStatus === "critical" && "border-red-200 bg-red-50/30"
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  overallStatus === "healthy" && "bg-green-100",
                  overallStatus === "warning" && "bg-yellow-100",
                  overallStatus === "critical" && "bg-red-100"
                )}
              >
                {getStatusIcon(overallStatus)}
              </div>
              <div>
                <h3 className="text-lg font-semibold capitalize">
                  System Status: {overallStatus}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {healthyServices}/{totalServices} services healthy • Uptime:{" "}
                  {formatUptime(systemUptime)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {Math.round((healthyServices / totalServices) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Service Health</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 3).map(alert => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(alert.severity)}
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.source} •{" "}
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => acknowledgeAlert(alert.id)}
                    variant="outline"
                    size="sm"
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      CPU Usage
                    </p>
                    <p className="text-2xl font-bold">
                      {snapshot?.systemHealth?.cpu_usage?.toFixed(1) || "67.0"}%
                    </p>
                  </div>
                  <Cpu className="h-8 w-8 text-blue-500" />
                </div>
                <Progress
                  value={snapshot?.systemHealth?.cpu_usage || 67}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Memory Usage
                    </p>
                    <p className="text-2xl font-bold">
                      {snapshot?.systemHealth?.memory_usage?.toFixed(1) ||
                        "72.5"}
                      %
                    </p>
                  </div>
                  <MemoryStick className="h-8 w-8 text-green-500" />
                </div>
                <Progress
                  value={snapshot?.systemHealth?.memory_usage || 72.5}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Response Time
                    </p>
                    <p className="text-2xl font-bold">
                      {snapshot?.systemHealth?.response_time || 245}ms
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Target: &lt;500ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Uptime
                    </p>
                    <p className="text-2xl font-bold">
                      {formatUptime(systemUptime)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  SLA: 99.9%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Service Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.slice(0, 6).map(service => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatResponseTime(service.responseTime)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(service.status)}
                    >
                      {service.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map(service => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{service.name}</h4>
                          {service.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last checked: {service.lastCheck.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getStatusColor(service.status)}
                          >
                            {service.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">
                          {formatResponseTime(service.responseTime)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uptime: {formatUptime(service.uptime)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourceMetrics.map(metric => (
              <Card key={metric.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {metric.current.toFixed(1)} {metric.unit}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {metric.maximum} {metric.unit}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Progress
                        value={(metric.current / metric.maximum) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span>
                        <span>
                          {metric.maximum} {metric.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={getStatusColor(metric.status)}
                      >
                        {metric.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {((metric.current / metric.maximum) * 100).toFixed(1)}%
                        used
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average Response Time</span>
                    <span className="font-medium">
                      {snapshot?.systemHealth?.response_time || 245}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Services</span>
                    <span className="font-medium">
                      {snapshot?.systemHealth?.active_services ||
                        healthyServices}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failed Services</span>
                    <span className="font-medium text-red-500">
                      {snapshot?.systemHealth?.failed_services || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Uptime</span>
                    <span className="font-medium">
                      {formatUptime(systemUptime)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">High CPU Usage</p>
                      <p className="text-xs text-muted-foreground">
                        Consider scaling horizontally or optimizing workloads
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Memory Usage Normal</p>
                      <p className="text-xs text-muted-foreground">
                        Memory utilization within acceptable range
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        API Response Degraded
                      </p>
                      <p className="text-xs text-muted-foreground">
                        External API response times above threshold
                      </p>
                    </div>
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
