"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Play,
  Pause,
  CheckCircle,
  Activity,
  Workflow,
  RefreshCw,
  Download,
  Timer,
  ArrowUpRight,
} from "lucide-react";

export function WorkflowPerformanceModule({
  className = "",
}: {
  className?: string;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState("24h");

  const mockStats = {
    totalWorkflows: 12,
    activeWorkflows: 9,
    totalExecutions: 847,
    successRate: 94.8,
    avgExecutionTime: 2340,
  };

  const mockWorkflows = [
    {
      id: "wf-001",
      name: "Content Publishing Pipeline",
      status: "active",
      executions: 245,
      successRate: 96.7,
      avgTime: 2140,
    },
    {
      id: "wf-002",
      name: "Social Media Automation",
      status: "active",
      executions: 189,
      successRate: 98.4,
      avgTime: 1890,
    },
    {
      id: "wf-003",
      name: "Analytics Collection",
      status: "paused",
      executions: 156,
      successRate: 93.2,
      avgTime: 3240,
    },
  ];

  const mockTrends = [
    { time: "00:00", executions: 12, successRate: 95.2 },
    { time: "04:00", executions: 18, successRate: 96.8 },
    { time: "08:00", executions: 45, successRate: 94.1 },
    { time: "12:00", executions: 67, successRate: 97.2 },
    { time: "16:00", executions: 89, successRate: 93.8 },
    { time: "20:00", executions: 56, successRate: 96.4 },
  ];

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4 text-green-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Workflow Performance
          </h2>
          <p className="text-gray-400">
            Monitor n8n workflow execution and performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-sm">Live</span>
          </div>
          <Button variant="outline" size="sm" className="border-gray-600">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Workflows</p>
                <p className="text-2xl font-bold text-white">
                  {mockStats.activeWorkflows}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-400">8.3%</span>
                </div>
              </div>
              <Workflow className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Executions</p>
                <p className="text-2xl font-bold text-white">
                  {mockStats.totalExecutions}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-400">15.7%</span>
                </div>
              </div>
              <Activity className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">
                  {formatPercentage(mockStats.successRate)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-400">2.1%</span>
                </div>
              </div>
              <CheckCircle className="h-6 w-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Exec Time</p>
                <p className="text-2xl font-bold text-white">
                  {formatDuration(mockStats.avgExecutionTime)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-red-500 rotate-180" />
                  <span className="text-xs text-gray-400">-5.4%</span>
                </div>
              </div>
              <Timer className="h-6 w-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Workflows</p>
                <p className="text-2xl font-bold text-white">
                  {mockStats.totalWorkflows}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-400">12.8%</span>
                </div>
              </div>
              <Workflow className="h-6 w-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Execution Trends</CardTitle>
              <p className="text-sm text-gray-400">
                Workflow execution patterns over time
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="executions"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Executions"
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Success Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Active Workflows</CardTitle>
              <p className="text-sm text-gray-400">
                Real-time workflow status and metrics
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkflows.map(workflow => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30 border border-gray-600"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(workflow.status)}
                        <div>
                          <h4 className="font-medium text-white">
                            {workflow.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {workflow.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-white">
                          {workflow.executions}
                        </p>
                        <p className="text-xs text-gray-400">Executions</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm font-medium text-white">
                          {formatPercentage(workflow.successRate)}
                        </p>
                        <p className="text-xs text-gray-400">Success Rate</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm font-medium text-white">
                          {formatDuration(workflow.avgTime)}
                        </p>
                        <p className="text-xs text-gray-400">Avg Time</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Average Response Time</span>
                    <span className="text-white">{formatDuration(2340)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Peak Execution Time</span>
                    <span className="text-white">{formatDuration(8450)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Error Rate</span>
                    <span className="text-red-400">
                      {formatPercentage(5.2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Throughput</span>
                    <span className="text-white">156 executions/hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Execution Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mockWorkflows.slice(0, 3)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Bar dataKey="executions" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
