"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  MousePointer,
  Eye,
} from "lucide-react";
import {
  createRealTimeAnalyticsCore,
  AnalyticsSnapshot,
  Alert as AnalyticsAlert,
  MetricDataPoint,
} from "@/lib/analytics/real-time-core";

interface RealTimeDashboardProps {
  className?: string;
}

export function RealTimeDashboard({ className }: RealTimeDashboardProps) {
  const [analyticsCore] = useState(() => createRealTimeAnalyticsCore());
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chartData, setChartData] = useState<
    Array<{
      time: string;
      ctr: number;
      engagement: number;
      conversions: number;
      revenue: number;
      reach: number;
    }>
  >([]);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscriptionId = "dashboard-" + Date.now();

    analyticsCore.subscribe(subscriptionId, newSnapshot => {
      setSnapshot(newSnapshot);
      setIsConnected(true);

      // Update chart data
      const now = new Date();
      const timeString =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

      const metrics = newSnapshot.metrics;
      const newDataPoint = {
        time: timeString,
        ctr: metrics.get("ctr")?.current || 0,
        engagement: metrics.get("engagement_rate")?.current || 0,
        conversions: metrics.get("conversions")?.current || 0,
        revenue: metrics.get("revenue")?.current || 0,
        reach: metrics.get("reach")?.current || 0,
      };

      setChartData(prev => {
        const updated = [...prev, newDataPoint];
        // Keep only last 20 data points
        return updated.slice(-20);
      });
    });

    // Start analytics core
    analyticsCore.start();

    // Generate some sample data for demo
    generateSampleData();

    return () => {
      analyticsCore.unsubscribe(subscriptionId);
      analyticsCore.stop();
    };
  }, [analyticsCore]);

  // Generate sample data for demonstration
  const generateSampleData = () => {
    const generateDataPoint = (event: string, value = 1): MetricDataPoint => ({
      timestamp: new Date(),
      value,
      metadata: { event, platform: "demo", campaign: "test" },
    });

    // Simulate real-time data
    const interval = setInterval(() => {
      // CTR data
      if (Math.random() > 0.7) {
        analyticsCore.addDataPoint("ctr", generateDataPoint("impression"));
      }
      if (Math.random() > 0.95) {
        analyticsCore.addDataPoint("ctr", generateDataPoint("click"));
      }

      // Engagement data
      if (Math.random() > 0.8) {
        analyticsCore.addDataPoint(
          "engagement_rate",
          generateDataPoint("reach")
        );
        if (Math.random() > 0.85) {
          const engagementEvents = ["like", "comment", "share", "save"];
          const event =
            engagementEvents[
              Math.floor(Math.random() * engagementEvents.length)
            ];
          analyticsCore.addDataPoint(
            "engagement_rate",
            generateDataPoint(event)
          );
        }
      }

      // Conversions
      if (Math.random() > 0.98) {
        analyticsCore.addDataPoint(
          "conversions",
          generateDataPoint("conversion")
        );
      }

      // Revenue
      if (Math.random() > 0.99) {
        const amount = Math.floor(Math.random() * 1000) + 50;
        analyticsCore.addDataPoint(
          "revenue",
          generateDataPoint("purchase", amount)
        );
      }

      // Reach
      if (Math.random() > 0.8) {
        analyticsCore.addDataPoint("reach", generateDataPoint("user_visit", 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const getAlertIcon = (level: AnalyticsAlert["level"]) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case "ctr":
        return <MousePointer className="h-5 w-5 text-blue-500" />;
      case "engagement_rate":
        return <Activity className="h-5 w-5 text-green-500" />;
      case "conversions":
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case "revenue":
        return <DollarSign className="h-5 w-5 text-yellow-500" />;
      case "reach":
        return <Users className="h-5 w-5 text-cyan-500" />;
      default:
        return <Eye className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: "good" | "warning" | "critical") => {
    switch (status) {
      case "good":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Analytics laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Real-time Analytics
          </h2>
          <p className="text-muted-foreground">
            Live marketing prestatie monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? "Verbonden" : "Niet verbonden"}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {snapshot.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Actieve Waarschuwingen</h3>
          {snapshot.alerts.slice(0, 3).map(alert => (
            <Alert key={alert.id} className="border-l-4 border-red-500">
              <div className="flex items-center space-x-2">
                {getAlertIcon(alert.level)}
                <AlertTitle className="capitalize">{alert.level}</AlertTitle>
              </div>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from(snapshot.metrics.entries()).map(([metricId, metric]) => (
          <Card key={metricId} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {analyticsCore.getMetrics().find(m => m.id === metricId)
                  ?.name || metricId}
              </CardTitle>
              {getMetricIcon(metricId)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.current.toFixed(metricId === "revenue" ? 0 : 1)}
                {analyticsCore.getMetrics().find(m => m.id === metricId)?.unit}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {getTrendIcon(metric.trend)}
                <span
                  className={`${
                    metric.trend === "up"
                      ? "text-green-600"
                      : metric.trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {metric.changePercent >= 0 ? "+" : ""}
                  {metric.changePercent.toFixed(1)}%
                </span>
                <span>vs vorige periode</span>
              </div>
              {/* Status indicator */}
              <div className="absolute top-2 right-2">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(metric.status)}`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Detailed Data */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CTR & Engagement Chart */}
            <Card>
              <CardHeader>
                <CardTitle>CTR & Engagement Rate</CardTitle>
                <CardDescription>
                  Real-time click-through en engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ctr"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="CTR (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Engagement (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue & Conversions Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Conversions</CardTitle>
                <CardDescription>
                  Realtime omzet en conversie tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="Revenue (EUR)"
                    />
                    <Area
                      type="monotone"
                      dataKey="conversions"
                      stackId="2"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      name="Conversions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time processing metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Processing Latency</span>
                    <span>{snapshot.performance.processingLatency}ms</span>
                  </div>
                  <Progress
                    value={(snapshot.performance.processingLatency / 100) * 100}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Throughput</span>
                    <span>
                      {snapshot.performance.throughput.toFixed(1)} events/sec
                    </span>
                  </div>
                  <Progress
                    value={(snapshot.performance.throughput / 10) * 100}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total Events</span>
                    <span>
                      {snapshot.performance.totalEvents.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality</CardTitle>
                <CardDescription>Kwaliteit van inkomende data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Data Completeness</span>
                    <span>98.5%</span>
                  </div>
                  <Progress value={98.5} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Error Rate</span>
                    <span>0.2%</span>
                  </div>
                  <Progress value={0.2} className="[&>div]:bg-red-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Duplicate Rate</span>
                    <span>0.1%</span>
                  </div>
                  <Progress value={0.1} className="[&>div]:bg-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Summary</CardTitle>
                <CardDescription>Waarschuwingen overzicht</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical</span>
                  <Badge variant="destructive">
                    {snapshot.alerts.filter(a => a.level === "critical").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Warning</span>
                  <Badge variant="secondary">
                    {snapshot.alerts.filter(a => a.level === "warning").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Info</span>
                  <Badge variant="outline">
                    {snapshot.alerts.filter(a => a.level === "info").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alle Metrics Trend</CardTitle>
              <CardDescription>
                Complete overzicht van alle key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ctr"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="CTR (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Engagement (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Conversions"
                  />
                  <Line
                    type="monotone"
                    dataKey="reach"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="Reach"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
