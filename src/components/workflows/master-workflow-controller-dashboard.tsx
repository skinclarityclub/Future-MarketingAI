"use client";

/**
 * Master Workflow Controller Dashboard Component
 * Task 73: Universal n8n AI/ML Workflow Orchestration Platform
 *
 * Provides comprehensive monitoring and control interface for the Master Workflow Controller
 * with real-time insights, cross-platform learning, and automated optimization management
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  Activity,
  BarChart3,
  Network,
  Target,
} from "lucide-react";

interface SystemStatus {
  controller: { status: string; workflows: number; active: number };
  learning: { patterns: number; confidence: number };
  optimization: { feedbacks: number; implemented: number };
  anomalies: { total: number; unresolved: number };
  models: { total: number; needRetraining: number };
}

interface WorkflowData {
  id: string;
  name: string;
  type: string;
  status: "active" | "paused" | "error";
  successRate: number;
  avgDuration: number;
  executionCount: number;
  lastExecuted: string;
  aiEnabled: boolean;
}

interface ExecutionData {
  id: string;
  workflowId: string;
  workflowName: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  duration?: number;
  optimizationsApplied: string[];
}

interface LearningInsight {
  pattern: string;
  confidence: number;
  sourceWorkflow: string;
  targetWorkflows: string[];
  performanceGain: number;
}

export default function MasterWorkflowControllerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [executions, setExecutions] = useState<ExecutionData[]>([]);
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const loadMockData = () => {
      setSystemStatus({
        controller: { status: "active", workflows: 12, active: 8 },
        learning: { patterns: 127, confidence: 0.84 },
        optimization: { feedbacks: 45, implemented: 32 },
        anomalies: { total: 15, unresolved: 3 },
        models: { total: 8, needRetraining: 2 },
      });

      setWorkflows([
        {
          id: "PostBuilder",
          name: "Post Builder Workflow",
          type: "content_creation",
          status: "active",
          successRate: 94.2,
          avgDuration: 45,
          executionCount: 1247,
          lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          aiEnabled: true,
        },
        {
          id: "MarketingManager",
          name: "Marketing Manager AI Agent",
          type: "ai_agent",
          status: "active",
          successRate: 98.7,
          avgDuration: 28,
          executionCount: 2156,
          lastExecuted: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          aiEnabled: true,
        },
        {
          id: "ML_Auto_Retraining",
          name: "ML Auto Retraining",
          type: "ml_pipeline",
          status: "active",
          successRate: 89.1,
          avgDuration: 380,
          executionCount: 156,
          lastExecuted: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          aiEnabled: true,
        },
      ]);

      setExecutions([
        {
          id: "exec_001",
          workflowId: "PostBuilder",
          workflowName: "Post Builder Workflow",
          status: "completed",
          startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          duration: 42,
          optimizationsApplied: [
            "Cross-platform learning",
            "Intelligent scheduling",
          ],
        },
        {
          id: "exec_002",
          workflowId: "MarketingManager",
          workflowName: "Marketing Manager AI Agent",
          status: "running",
          startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          optimizationsApplied: [
            "Resource optimization",
            "Priority scheduling",
          ],
        },
        {
          id: "exec_003",
          workflowId: "ML_Auto_Retraining",
          workflowName: "ML Auto Retraining",
          status: "completed",
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          duration: 365,
          optimizationsApplied: [
            "Automated optimization",
            "Performance tuning",
          ],
        },
      ]);

      setLearningInsights([
        {
          pattern: "Optimal content timing increases engagement by 24%",
          confidence: 0.92,
          sourceWorkflow: "MarketingManager",
          targetWorkflows: ["PostBuilder", "CarouselBuilder"],
          performanceGain: 24.1,
        },
        {
          pattern: "Batch processing improves efficiency by 18%",
          confidence: 0.87,
          sourceWorkflow: "PostBuilder",
          targetWorkflows: ["ReelBuilder", "StoryBuilder"],
          performanceGain: 18.3,
        },
        {
          pattern: "AI model ensemble reduces error rate by 15%",
          confidence: 0.91,
          sourceWorkflow: "ML_Auto_Retraining",
          targetWorkflows: ["All AI workflows"],
          performanceGain: 15.7,
        },
      ]);

      setIsLoading(false);
    };

    loadMockData();
  }, []);

  // Performance data for charts
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    executions: Math.floor(Math.random() * 50) + 10,
    successRate: Math.random() * 20 + 80,
    optimizations: Math.floor(Math.random() * 10) + 2,
  }));

  const workflowTypeData = [
    { name: "Content Creation", value: 45, color: "#3B82F6" },
    { name: "AI Agents", value: 35, color: "#8B5CF6" },
    { name: "ML Pipelines", value: 12, color: "#10B981" },
    { name: "Analytics", value: 8, color: "#F59E0B" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "running":
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case "error":
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      running:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      paused:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">
            Loading Master Controller Dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Executions
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Learning
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="control" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Control
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Controller Status
                </CardTitle>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {systemStatus?.controller.status}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {systemStatus?.controller.workflows} workflows registered
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Learning System
                </CardTitle>
                <Brain className="w-4 h-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {systemStatus?.learning.patterns}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {Math.round((systemStatus?.learning.confidence || 0) * 100)}%
                  avg confidence
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Optimizations
                </CardTitle>
                <Zap className="w-4 h-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {systemStatus?.optimization.implemented}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  of {systemStatus?.optimization.feedbacks} suggested
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {systemStatus?.anomalies.unresolved}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  of {systemStatus?.anomalies.total} total detected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Execution Performance (24h)</CardTitle>
                <CardDescription>
                  Workflow executions and success rates over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="executions"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      name="Executions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Workflow Distribution</CardTitle>
                <CardDescription>Breakdown by workflow type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={workflowTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {workflowTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid gap-4">
            {workflows.map(workflow => (
              <Card
                key={workflow.id}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(workflow.status)}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {workflow.type.replace("_", " ")} • ID: {workflow.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflow.aiEnabled && (
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          AI Enhanced
                        </Badge>
                      )}
                      {getStatusBadge(workflow.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Success Rate
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {workflow.successRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Avg Duration
                      </div>
                      <div className="text-lg font-semibold">
                        {workflow.avgDuration}s
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Executions
                      </div>
                      <div className="text-lg font-semibold">
                        {workflow.executionCount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Last Executed
                      </div>
                      <div className="text-lg font-semibold">
                        {new Date(workflow.lastExecuted).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Progress value={workflow.successRate} className="w-1/3" />
                    <div className="flex gap-2">
                      <NormalButton
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Execute
                      </NormalButton>
                      <NormalButton
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Settings className="w-3 h-3" />
                        Configure
                      </NormalButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>
                Latest workflow executions with optimization details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.map(execution => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <h4 className="font-medium">
                          {execution.workflowName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Started{" "}
                          {new Date(execution.startedAt).toLocaleTimeString()}
                          {execution.duration &&
                            ` • Duration: ${execution.duration}s`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {execution.optimizationsApplied.length} optimizations
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {execution.optimizationsApplied.join(", ")}
                        </div>
                      </div>
                      {getStatusBadge(execution.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Learning Tab */}
        <TabsContent value="learning" className="space-y-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Cross-Platform Learning Insights</CardTitle>
              <CardDescription>
                AI-discovered patterns and optimizations across workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-purple-800 dark:text-purple-200">
                        {insight.pattern}
                      </h4>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Source:{" "}
                      <span className="font-medium">
                        {insight.sourceWorkflow}
                      </span>{" "}
                      → Target:{" "}
                      <span className="font-medium">
                        {insight.targetWorkflows.join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        +{insight.performanceGain}% performance improvement
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Optimization Engine</CardTitle>
              <CardDescription>
                Automated optimization feedback loops and performance
                improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Active Optimizations</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-medium">
                          Intelligent Scheduling
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Optimizing workflow execution timing based on resource
                        availability
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Resource Allocation</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dynamic resource scaling based on workflow demands
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Efficiency</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Resource Utilization</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Optimization Success Rate</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Control Tab */}
        <TabsContent value="control" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>System Control</CardTitle>
                <CardDescription>
                  Master controller operations and management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NormalButton className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4" />
                  Refresh All Workflows
                </NormalButton>
                <NormalButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configure Learning Parameters
                </NormalButton>
                <NormalButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Run Optimization Analysis
                </NormalButton>
                <NormalButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Zap className="w-4 h-4" />
                  Trigger Model Retraining
                </NormalButton>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common workflow operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NormalButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Execute PostBuilder Workflow
                </NormalButton>
                <NormalButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Run Marketing Manager AI
                </NormalButton>
                <NormalButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Start Competitor Analysis
                </NormalButton>
                <NormalButton
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Emergency Stop All
                </NormalButton>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
