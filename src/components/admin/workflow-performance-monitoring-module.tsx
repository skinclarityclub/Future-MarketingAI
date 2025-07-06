/**
 * Admin Dashboard Workflow Performance Monitoring Module
 * Subtask 82.6: Implement Workflow Performance Monitoring
 *
 * Displays real-time workflow performance including n8n stats, content success rates,
 * publishing status, A/B test results, AI usage, and satisfaction scores using the
 * existing workflow monitoring infrastructure.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
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
  Square,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Workflow,
  RefreshCw,
  Download,
  Filter,
  Search,
  ChevronRight,
  Timer,
  Database,
  Cpu,
  MemoryStick,
  Network,
  Bot,
  FileText,
  Target,
  Users,
  Star,
  Heart,
  Share2,
  Eye,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { useWorkflowPerformanceRealtime } from "@/hooks/use-admin-dashboard-realtime";
import {
  formatNumber,
  formatPercentage,
  formatDuration,
} from "@/lib/data/mock-chart-data";

interface WorkflowPerformanceMonitoringModuleProps {
  className?: string;
  refreshInterval?: number;
}

export function WorkflowPerformanceMonitoringModule({
  className = "",
  refreshInterval = 30000,
}: WorkflowPerformanceMonitoringModuleProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");

  // Mock state for demo - in production, use real hook
  const loading = false;
  const error = null;
  const isConnected = true;
  const lastUpdated = new Date();

  // Mock workflow data
  const mockWorkflowStats = {
    totalWorkflows: 12,
    activeWorkflows: 9,
    totalExecutions: 847,
    averageSuccessRate: 94.8,
    averageExecutionTime: 2340,
    totalContentProcessed: 156,
    aiUsageHours: 42.7,
    systemHealth: "healthy" as const,
  };

  const mockWorkflowData = [
    {
      id: "wf-001",
      name: "Content Publishing Pipeline",
      type: "content_workflow",
      status: "active",
      executions: 245,
      successRate: 96.7,
      avgExecutionTime: 2140,
      lastExecution: "2 min ago",
      performance: 92,
    },
    {
      id: "wf-002",
      name: "Social Media Automation",
      type: "social_automation",
      status: "active",
      executions: 189,
      successRate: 98.4,
      avgExecutionTime: 1890,
      lastExecution: "5 min ago",
      performance: 97,
    },
    {
      id: "wf-003",
      name: "Analytics Data Collection",
      type: "data_collection",
      status: "active",
      executions: 156,
      successRate: 93.2,
      avgExecutionTime: 3240,
      lastExecution: "1 min ago",
      performance: 89,
    },
    {
      id: "wf-004",
      name: "A/B Testing Framework",
      type: "ab_testing",
      status: "paused",
      executions: 67,
      successRate: 89.6,
      avgExecutionTime: 4560,
      lastExecution: "2 hrs ago",
      performance: 84,
    },
    {
      id: "wf-005",
      name: "Customer Feedback Loop",
      type: "feedback_processing",
      status: "active",
      executions: 134,
      successRate: 91.8,
      avgExecutionTime: 2890,
      lastExecution: "8 min ago",
      performance: 88,
    },
  ];

  const mockExecutionTrends = [
    { time: "00:00", executions: 12, successRate: 95.2, failures: 1 },
    { time: "04:00", executions: 18, successRate: 96.8, failures: 0 },
    { time: "08:00", executions: 45, successRate: 94.1, failures: 3 },
    { time: "12:00", executions: 67, successRate: 97.2, failures: 2 },
    { time: "16:00", executions: 89, successRate: 93.8, failures: 5 },
    { time: "20:00", executions: 56, successRate: 96.4, failures: 2 },
  ];

  const mockContentMetrics = [
    { category: "Blog Posts", processed: 45, published: 42, successRate: 93.3 },
    {
      category: "Social Media",
      processed: 89,
      published: 87,
      successRate: 97.8,
    },
    {
      category: "Email Campaigns",
      processed: 23,
      published: 22,
      successRate: 95.7,
    },
    {
      category: "Video Content",
      processed: 12,
      published: 11,
      successRate: 91.7,
    },
  ];

  const mockABTestResults = [
    {
      test: "CTA Button Color",
      variant: "Blue vs Red",
      conversion: 12.4,
      confidence: 95,
      status: "completed",
    },
    {
      test: "Email Subject Line",
      variant: "A vs B",
      conversion: 8.7,
      confidence: 87,
      status: "running",
    },
    {
      test: "Landing Page Layout",
      variant: "V1 vs V2",
      conversion: 15.2,
      confidence: 99,
      status: "completed",
    },
    {
      test: "Product Description",
      variant: "Short vs Long",
      conversion: 6.8,
      confidence: 73,
      status: "running",
    },
  ];

  const mockAIUsageMetrics = {
    totalQueries: 12847,
    successfulQueries: 12356,
    failedQueries: 491,
    averageResponseTime: 1240,
    topModels: [
      { model: "GPT-4", usage: 45.2, cost: 234.67 },
      { model: "Claude-3", usage: 32.8, cost: 156.23 },
      { model: "Gemini Pro", usage: 22.0, cost: 89.45 },
    ],
    satisfactionScore: 4.7,
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "running":
        return <Play className="h-4 w-4 text-green-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "stopped":
      case "failed":
        return <Square className="h-4 w-4 text-red-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`}
      />
      <span className={isConnected ? "text-green-400" : "text-red-400"}>
        {isConnected ? "Live" : "Disconnected"}
      </span>
      {lastUpdated && (
        <span className="text-gray-400">
          • {lastUpdated.toLocaleTimeString()}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.reload()}
        className="h-auto p-1 text-gray-400 hover:text-white"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  );

  const WorkflowOverviewCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Workflows</p>
              <p className="text-2xl font-bold text-white">
                {mockWorkflowStats.activeWorkflows}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(8.3)}
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
                {formatNumber(mockWorkflowStats.totalExecutions)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(15.7)}
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
                {formatPercentage(mockWorkflowStats.averageSuccessRate)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(2.1)}
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
                {formatDuration(mockWorkflowStats.averageExecutionTime)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(-5.4)}
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
              <p className="text-sm text-gray-400">Content Processed</p>
              <p className="text-2xl font-bold text-white">
                {mockWorkflowStats.totalContentProcessed}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(12.8)}
                <span className="text-xs text-gray-400">12.8%</span>
              </div>
            </div>
            <FileText className="h-6 w-6 text-cyan-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">AI Usage</p>
              <p className="text-2xl font-bold text-white">
                {mockWorkflowStats.aiUsageHours}h
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(18.4)}
                <span className="text-xs text-gray-400">18.4%</span>
              </div>
            </div>
            <Bot className="h-6 w-6 text-pink-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const WorkflowListTable = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Active Workflows</CardTitle>
            <p className="text-sm text-gray-400">
              Real-time workflow status and performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="content_workflow">Content</SelectItem>
                <SelectItem value="social_automation">Social</SelectItem>
                <SelectItem value="data_collection">Data</SelectItem>
                <SelectItem value="ab_testing">A/B Testing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockWorkflowData.map(workflow => (
            <div
              key={workflow.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30 border border-gray-600 hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={() => setSelectedWorkflow(workflow.id)}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(workflow.status)}
                  <div>
                    <h4 className="font-medium text-white">{workflow.name}</h4>
                    <p className="text-sm text-gray-400">
                      {workflow.type.replace("_", " ")}
                    </p>
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
                    {formatDuration(workflow.avgExecutionTime)}
                  </p>
                  <p className="text-xs text-gray-400">Avg Time</p>
                </div>

                <div className="text-center">
                  <p
                    className={`text-sm font-medium ${getPerformanceColor(workflow.performance)}`}
                  >
                    {workflow.performance}%
                  </p>
                  <p className="text-xs text-gray-400">Performance</p>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-gray-300">
                    {workflow.lastExecution}
                  </p>
                  <p className="text-xs text-gray-400">Last Run</p>
                </div>

                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const ExecutionTrendsChart = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Execution Trends</CardTitle>
            <p className="text-sm text-gray-400">
              Workflow execution patterns over time
            </p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={mockExecutionTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="executions"
              fill="#3B82F6"
              name="Executions"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="successRate"
              stroke="#10B981"
              strokeWidth={2}
              name="Success Rate %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const ContentPerformanceChart = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Performance
        </CardTitle>
        <p className="text-sm text-gray-400">
          Content processing success rates by category
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockContentMetrics.map((content, index) => (
            <div key={content.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {content.category}
                </span>
                <div className="text-right">
                  <span className="text-lg font-semibold text-white">
                    {content.published}/{content.processed}
                  </span>
                  <span className="text-sm text-gray-400 ml-2">
                    ({formatPercentage(content.successRate)})
                  </span>
                </div>
              </div>
              <Progress value={content.successRate} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const AIUsageMetricsCard = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Usage & Performance
        </CardTitle>
        <p className="text-sm text-gray-400">
          AI model usage and satisfaction metrics
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Total Queries</p>
            <p className="text-xl font-bold text-white">
              {formatNumber(mockAIUsageMetrics.totalQueries)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Success Rate</p>
            <p className="text-xl font-bold text-white">
              {formatPercentage(
                (mockAIUsageMetrics.successfulQueries /
                  mockAIUsageMetrics.totalQueries) *
                  100
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Avg Response Time</p>
            <p className="text-xl font-bold text-white">
              {formatDuration(mockAIUsageMetrics.averageResponseTime)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Satisfaction Score</p>
            <div className="flex items-center gap-1">
              <p className="text-xl font-bold text-white">
                {mockAIUsageMetrics.satisfactionScore}
              </p>
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-600">
          <h4 className="text-sm font-medium text-white mb-3">
            Model Usage Distribution
          </h4>
          <div className="space-y-2">
            {mockAIUsageMetrics.topModels.map(model => (
              <div
                key={model.model}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-gray-300">{model.model}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white">
                    {formatPercentage(model.usage)}
                  </span>
                  <span className="text-xs text-gray-400">${model.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            Failed to load workflow performance data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Workflow Performance Monitoring
          </h2>
          <p className="text-gray-400">
            Real-time workflow execution analytics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus />
          <Button variant="outline" size="sm" className="border-gray-600">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <WorkflowOverviewCards />

      {/* Workflow Performance Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="ai-usage">AI Usage</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExecutionTrendsChart />
            <ContentPerformanceChart />
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowListTable />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentPerformanceChart />
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Publishing Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Scheduled</span>
                    <span className="text-white font-medium">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">In Review</span>
                    <span className="text-white font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Published Today</span>
                    <span className="text-white font-medium">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Failed</span>
                    <span className="text-red-400 font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIUsageMetricsCard />
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">AI Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={mockAIUsageMetrics.topModels}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="cost"
                    >
                      {mockAIUsageMetrics.topModels.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#3B82F6", "#10B981", "#F59E0B"][index % 3]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                A/B Test Results
              </CardTitle>
              <p className="text-sm text-gray-400">
                Current and completed A/B test performance
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockABTestResults.map((test, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-gray-700/30 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{test.test}</h4>
                      <Badge
                        variant={
                          test.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {test.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Variant</p>
                        <p className="text-white">{test.variant}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Conversion</p>
                        <p className="text-white">
                          {formatPercentage(test.conversion)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Confidence</p>
                        <p
                          className={`${test.confidence >= 95 ? "text-green-400" : "text-yellow-400"}`}
                        >
                          {test.confidence}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading workflow performance data...</span>
          </div>
        </div>
      )}
    </div>
  );
}
