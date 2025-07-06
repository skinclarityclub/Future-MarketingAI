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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
  Database,
  Cpu,
  MemoryStick,
  Zap,
  RefreshCw,
  Play,
  Settings,
  TrendingUp,
  Server,
  Network,
} from "lucide-react";

// Types
interface DistributionStatus {
  status: "idle" | "processing" | "distributing" | "monitoring" | "error";
  current_batch: {
    batch_id: string;
    records_count: number;
    started_at: string;
    estimated_completion: string;
  };
  engines_status: {
    [engineName: string]: {
      status: "ready" | "processing" | "completed" | "error";
      last_distribution: string;
      records_distributed: number;
      success_rate: number;
      avg_processing_time_ms: number;
      queue_size: number;
    };
  };
  performance_metrics: {
    total_records_processed: number;
    successful_distributions: number;
    failed_distributions: number;
    avg_distribution_time_ms: number;
    throughput_per_minute: number;
  };
  last_distribution: string;
  next_scheduled_distribution: string;
}

interface EngineInfo {
  name: string;
  displayName: string;
  capabilities: string[];
  status: {
    status: string;
    last_distribution: string;
    records_distributed: number;
    success_rate: number;
    avg_processing_time_ms: number;
    queue_size: number;
  };
  performance: {
    avg_processing_time: number;
    max_throughput: number;
    memory_usage: number;
    cpu_intensive: boolean;
  };
  requirements: {
    input_format: string;
    required_fields: string[];
    min_batch_size: number;
    max_batch_size: number;
  };
}

interface HealthData {
  healthy: boolean;
  status: string;
  uptime: number;
  total_distributions: number;
  success_rate: number;
  avg_throughput: number;
}

export default function DataDistributionMonitorPage() {
  const [distributionStatus, setDistributionStatus] =
    useState<DistributionStatus | null>(null);
  const [engines, setEngines] = useState<EngineInfo[]>([]);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setRefreshing(true);

      const [statusResponse, enginesResponse, healthResponse] =
        await Promise.all([
          fetch("/api/data-distribution/status?action=status"),
          fetch("/api/data-distribution/status?action=engines"),
          fetch("/api/data-distribution/status?action=health"),
        ]);

      if (!statusResponse.ok || !enginesResponse.ok || !healthResponse.ok) {
        throw new Error("Failed to fetch distribution data");
      }

      const statusData = await statusResponse.json();
      const enginesData = await enginesResponse.json();
      const healthDataResponse = await healthResponse.json();

      if (statusData.success) setDistributionStatus(statusData.data);
      if (enginesData.success) setEngines(enginesData.data);
      if (healthDataResponse.success) setHealthData(healthDataResponse.data);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Trigger distribution
  const triggerDistribution = async (type: "realtime" | "batch") => {
    try {
      const response = await fetch("/api/data-distribution/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_distribution", type }),
      });

      if (!response.ok) throw new Error("Failed to trigger distribution");

      const result = await response.json();
      if (result.success) {
        setTimeout(fetchData, 2000); // Refresh after 2 seconds
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to trigger distribution"
      );
    }
  };

  // Restart services
  const restartServices = async () => {
    try {
      const response = await fetch("/api/data-distribution/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart_services" }),
      });

      if (!response.ok) throw new Error("Failed to restart services");

      const result = await response.json();
      if (result.success) {
        setTimeout(fetchData, 3000); // Refresh after 3 seconds
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to restart services"
      );
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
      case "completed":
        return "bg-green-500";
      case "processing":
      case "distributing":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
      case "distributing":
        return <Activity className="w-4 h-4 animate-spin" />;
      case "error":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  // Chart data preparation
  const enginePerformanceData = engines.map(engine => ({
    name: engine.displayName.split(" ")[0],
    processing_time: engine.status.avg_processing_time_ms,
    success_rate: engine.status.success_rate * 100,
    records_distributed: engine.status.records_distributed,
    queue_size: engine.status.queue_size,
  }));

  const distributionPieData = [
    {
      name: "Successful",
      value:
        distributionStatus?.performance_metrics.successful_distributions || 0,
      color: "#10b981",
    },
    {
      name: "Failed",
      value: distributionStatus?.performance_metrics.failed_distributions || 0,
      color: "#ef4444",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading distribution monitor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Distribution Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring van automatische AI/ML engine distributie
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Vernieuwen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerDistribution("batch")}
          >
            <Play className="w-4 h-4 mr-2" />
            Trigger Batch
          </Button>
          <Button variant="outline" size="sm" onClick={restartServices}>
            <Settings className="w-4 h-4 mr-2" />
            Restart Services
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Health Overview */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${healthData.healthy ? "bg-green-500" : "bg-red-500"}`}
                />
                <div>
                  <p className="text-sm font-medium">System Status</p>
                  <p className="text-2xl font-bold">
                    {healthData.healthy ? "Healthy" : "Unhealthy"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Uptime</p>
                  <p className="text-2xl font-bold">
                    {formatUptime(healthData.uptime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {formatPercentage(healthData.success_rate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Throughput</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(healthData.avg_throughput)}/min
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engines">Engine Status</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Status */}
            {distributionStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Distribution Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>System Status:</span>
                    <Badge
                      className={getStatusColor(distributionStatus.status)}
                    >
                      {distributionStatus.status.toUpperCase()}
                    </Badge>
                  </div>

                  {distributionStatus.current_batch.batch_id && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Current Batch:</span>
                        <span className="font-mono text-sm">
                          {distributionStatus.current_batch.batch_id}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Records in Batch:</span>
                        <span className="font-bold">
                          {formatNumber(
                            distributionStatus.current_batch.records_count
                          )}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Total Records Processed:</span>
                    <span className="font-bold">
                      {formatNumber(
                        distributionStatus.performance_metrics
                          .total_records_processed
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Next Scheduled Run:</span>
                    <span className="text-sm">
                      {new Date(
                        distributionStatus.next_scheduled_distribution
                      ).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Distribution Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distributionPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engines Tab */}
        <TabsContent value="engines" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {engines.map(engine => (
              <Card key={engine.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {engine.displayName}
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(engine.status.status)}
                      <Badge className={getStatusColor(engine.status.status)}>
                        {engine.status.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        Records Distributed
                      </p>
                      <p className="font-bold">
                        {formatNumber(engine.status.records_distributed)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-bold">
                        {formatPercentage(engine.status.success_rate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg. Processing</p>
                      <p className="font-bold">
                        {engine.status.avg_processing_time_ms}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Queue Size</p>
                      <p className="font-bold">{engine.status.queue_size}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4" />
                      <span className="text-sm">
                        CPU Intensive:{" "}
                        {engine.performance.cpu_intensive ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MemoryStick className="w-4 h-4" />
                      <span className="text-sm">
                        Memory: {engine.performance.memory_usage}MB
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4" />
                      <span className="text-sm">
                        Format: {engine.requirements.input_format}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Capabilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {engine.capabilities.slice(0, 3).map(capability => (
                        <Badge
                          key={capability}
                          variant="secondary"
                          className="text-xs"
                        >
                          {capability.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processing Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Average Processing Time by Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enginePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="processing_time" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enginePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="success_rate" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Engine</th>
                      <th className="text-left p-2">Records Distributed</th>
                      <th className="text-left p-2">Avg Processing Time</th>
                      <th className="text-left p-2">Success Rate</th>
                      <th className="text-left p-2">Queue Size</th>
                      <th className="text-left p-2">Max Throughput</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engines.map(engine => (
                      <tr key={engine.name} className="border-b">
                        <td className="p-2 font-medium">
                          {engine.displayName}
                        </td>
                        <td className="p-2">
                          {formatNumber(engine.status.records_distributed)}
                        </td>
                        <td className="p-2">
                          {engine.status.avg_processing_time_ms}ms
                        </td>
                        <td className="p-2">
                          {formatPercentage(engine.status.success_rate)}
                        </td>
                        <td className="p-2">{engine.status.queue_size}</td>
                        <td className="p-2">
                          {formatNumber(engine.performance.max_throughput)}/min
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Records Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Records Distribution by Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enginePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="records_distributed" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Queue Status */}
            <Card>
              <CardHeader>
                <CardTitle>Queue Status by Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engines.map(engine => (
                    <div key={engine.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {engine.displayName}
                        </span>
                        <span className="text-sm">
                          {engine.status.queue_size} items
                        </span>
                      </div>
                      <Progress
                        value={
                          (engine.status.queue_size /
                            Math.max(engine.requirements.max_batch_size, 1)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution History */}
          {distributionStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Distribution Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(
                        distributionStatus.performance_metrics
                          .successful_distributions
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Successful Distributions
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {formatNumber(
                        distributionStatus.performance_metrics
                          .failed_distributions
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Failed Distributions
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(
                        distributionStatus.performance_metrics
                          .avg_distribution_time_ms
                      )}
                      ms
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg Distribution Time
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatNumber(
                        distributionStatus.performance_metrics
                          .throughput_per_minute
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Records/Minute
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
