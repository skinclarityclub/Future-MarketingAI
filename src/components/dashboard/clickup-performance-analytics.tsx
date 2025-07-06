"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Clock,
  Users,
  Target,
  Activity,
  Download,
  RefreshCw,
  Zap,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface WorkflowEfficiencyMetrics {
  workflow_id: string;
  workflow_name: string;
  total_tasks: number;
  completed_tasks: number;
  avg_completion_time_hours: number;
  efficiency_score: number;
  bottleneck_phase: string;
  team_utilization: number;
  throughput_per_day: number;
}

interface PerformanceReportData {
  overall_kpis: {
    total_throughput: number;
    avg_cycle_time: number;
    team_efficiency: number;
    quality_index: number;
    capacity_utilization: number;
  };
  workflow_metrics: WorkflowEfficiencyMetrics[];
  trends: {
    productivity_trend: Array<{ date: string; value: number }>;
    efficiency_trend: Array<{ date: string; value: number }>;
    quality_trend: Array<{ date: string; value: number }>;
  };
}

interface ClickUpPerformanceAnalyticsProps {
  workspaceId?: string;
}

export default function ClickUpPerformanceAnalytics({
  workspaceId,
}: ClickUpPerformanceAnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<PerformanceReportData | null>(
    null
  );

  useEffect(() => {
    if (workspaceId) {
      loadPerformanceData();
    }
  }, [workspaceId]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Mock data for demo
      const mockData: PerformanceReportData = {
        overall_kpis: {
          total_throughput: 127,
          avg_cycle_time: 18.5,
          team_efficiency: 78.3,
          quality_index: 91.2,
          capacity_utilization: 82.7,
        },
        workflow_metrics: [
          {
            workflow_id: "1",
            workflow_name: "Content Creation",
            total_tasks: 45,
            completed_tasks: 38,
            avg_completion_time_hours: 16.2,
            efficiency_score: 84.4,
            bottleneck_phase: "Review",
            team_utilization: 76.8,
            throughput_per_day: 5.4,
          },
          {
            workflow_id: "2",
            workflow_name: "Content Approval",
            total_tasks: 32,
            completed_tasks: 29,
            avg_completion_time_hours: 12.8,
            efficiency_score: 90.6,
            bottleneck_phase: "",
            team_utilization: 88.2,
            throughput_per_day: 4.1,
          },
        ],
        trends: {
          productivity_trend: [
            { date: "2025-01-14", value: 72 },
            { date: "2025-01-15", value: 76 },
            { date: "2025-01-16", value: 78 },
            { date: "2025-01-17", value: 81 },
            { date: "2025-01-18", value: 83 },
            { date: "2025-01-19", value: 79 },
            { date: "2025-01-20", value: 85 },
          ],
          efficiency_trend: [
            { date: "2025-01-14", value: 68 },
            { date: "2025-01-15", value: 74 },
            { date: "2025-01-16", value: 77 },
            { date: "2025-01-17", value: 79 },
            { date: "2025-01-18", value: 82 },
            { date: "2025-01-19", value: 78 },
            { date: "2025-01-20", value: 84 },
          ],
          quality_trend: [
            { date: "2025-01-14", value: 88 },
            { date: "2025-01-15", value: 89 },
            { date: "2025-01-16", value: 91 },
            { date: "2025-01-17", value: 90 },
            { date: "2025-01-18", value: 92 },
            { date: "2025-01-19", value: 91 },
            { date: "2025-01-20", value: 93 },
          ],
        },
      };

      setReportData(mockData);
      toast.success("Performance data loaded successfully");
    } catch (error) {
      console.error("Error loading performance data:", error);
      toast.error("Failed to load performance analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatHours = (hours: number) => `${hours.toFixed(1)}h`;
  const formatNumber = (num: number) => num.toLocaleString();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p>Loading performance analytics...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No performance data available.
          </p>
          <NormalButton onClick={loadPerformanceData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Data
          </NormalButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Performance Analytics & Reporting
          </h2>
          <p className="text-muted-foreground">
            Track content workflow efficiency and team productivity
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <NormalButton
            onClick={loadPerformanceData}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </NormalButton>
          <NormalButton variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </NormalButton>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Throughput
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(reportData.overall_kpis.total_throughput)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUp className="h-4 w-4 text-green-600" />
              <span className="text-sm ml-1 text-green-600">
                +12% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Cycle Time</p>
                <p className="text-2xl font-bold">
                  {formatHours(reportData.overall_kpis.avg_cycle_time)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowDown className="h-4 w-4 text-green-600" />
              <span className="text-sm ml-1 text-green-600">
                -8% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Efficiency</p>
                <p className="text-2xl font-bold">
                  {formatPercentage(reportData.overall_kpis.team_efficiency)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <Progress
                value={reportData.overall_kpis.team_efficiency}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quality Index</p>
                <p className="text-2xl font-bold">
                  {formatPercentage(reportData.overall_kpis.quality_index)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUp className="h-4 w-4 text-green-600" />
              <span className="text-sm ml-1 text-green-600">
                +5% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Capacity Utilization
                </p>
                <p className="text-2xl font-bold">
                  {formatPercentage(
                    reportData.overall_kpis.capacity_utilization
                  )}
                </p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="flex items-center mt-2">
              <Progress
                value={reportData.overall_kpis.capacity_utilization}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflow Analysis</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Productivity Trends (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData.trends.productivity_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Efficiency vs Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      data={reportData.trends.efficiency_trend}
                      name="Efficiency"
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      data={reportData.trends.quality_trend}
                      name="Quality"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportData.workflow_metrics.map(workflow => (
              <Card key={workflow.workflow_id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {workflow.workflow_name}
                    <Badge
                      variant={
                        workflow.efficiency_score >= 80
                          ? "default"
                          : "secondary"
                      }
                    >
                      {formatPercentage(workflow.efficiency_score)} efficient
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tasks Completed
                      </p>
                      <p className="text-xl font-bold">
                        {workflow.completed_tasks}/{workflow.total_tasks}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg Completion Time
                      </p>
                      <p className="text-xl font-bold">
                        {formatHours(workflow.avg_completion_time_hours)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Throughput/Day
                      </p>
                      <p className="text-xl font-bold">
                        {workflow.throughput_per_day.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Team Utilization
                      </p>
                      <p className="text-xl font-bold">
                        {formatPercentage(workflow.team_utilization)}
                      </p>
                    </div>
                  </div>

                  {workflow.bottleneck_phase && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Bottleneck identified: {workflow.bottleneck_phase}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Completion Progress
                    </p>
                    <Progress
                      value={
                        (workflow.completed_tasks / workflow.total_tasks) * 100
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPercentage(
                        (workflow.completed_tasks / workflow.total_tasks) * 100
                      )}{" "}
                      complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    data={reportData.trends.productivity_trend}
                    name="Productivity"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    data={reportData.trends.efficiency_trend}
                    name="Efficiency"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    data={reportData.trends.quality_trend}
                    name="Quality"
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
