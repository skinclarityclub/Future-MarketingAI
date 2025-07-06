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
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Square,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  TrendingUp,
  RefreshCw,
  Search,
  Activity,
  Brain,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types for enhanced n8n integration
interface N8nWorkflow {
  id: string;
  name: string;
  status: "active" | "inactive" | "running" | "paused" | "error";
  type: "email" | "social" | "content" | "lead_nurture" | "ad_campaign";
  execution_count: number;
  success_rate: number;
  last_execution: string;
  next_execution?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

interface PredictiveInsight {
  workflow_id: string;
  prediction_type:
    | "performance"
    | "failure_risk"
    | "optimization"
    | "scheduling";
  confidence: number;
  insight: string;
  recommendation: string;
  predicted_value?: number;
  timeframe: "1h" | "24h" | "7d" | "30d";
  data_points: number;
}

interface WorkflowMetrics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_execution_time: number;
  success_rate: number;
  error_rate: number;
  performance_score: number;
}

interface N8nDashboardData {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  averageSuccessRate: number;
  topPerformingWorkflows: Array<{ id: string; name: string; score: number }>;
  recentExecutions: any[];
  systemHealth: "healthy" | "warning" | "critical";
}

export default function EnhancedMarketingAutomationCenter() {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [dashboardData, setDashboardData] = useState<N8nDashboardData | null>(
    null
  );
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [workflowMetrics, setWorkflowMetrics] =
    useState<WorkflowMetrics | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<
    PredictiveInsight[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch n8n workflows data
  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "/api/marketing/n8n-workflows?action=list_workflows"
      );
      const result = await response.json();

      if (result.success) {
        setWorkflows(result.data.workflows);
      } else {
        throw new Error(result.error || "Failed to fetch workflows");
      }
    } catch (error) {
      console.error("Error fetching workflows:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch workflows"
      );
      // Fall back to mock data
      setWorkflows(getMockWorkflows());
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(
        "/api/marketing/n8n-workflows?action=get_dashboard_data"
      );
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Fetch workflow metrics
  const fetchWorkflowMetrics = async (workflowId: string) => {
    try {
      const response = await fetch(
        `/api/marketing/n8n-workflows?action=get_metrics&workflowId=${workflowId}`
      );
      const result = await response.json();

      if (result.success) {
        setWorkflowMetrics(result.data.metrics);
      }
    } catch (error) {
      console.error("Error fetching workflow metrics:", error);
    }
  };

  // Fetch predictive insights
  const fetchPredictiveInsights = async (workflowId: string) => {
    try {
      const response = await fetch(
        `/api/marketing/n8n-workflows?action=get_predictive_insights&workflowId=${workflowId}`
      );
      const result = await response.json();

      if (result.success) {
        setPredictiveInsights(result.data.insights);
      }
    } catch (error) {
      console.error("Error fetching predictive insights:", error);
    }
  };

  // Execute workflow
  const executeWorkflow = async (
    workflowId: string,
    inputData?: Record<string, any>
  ) => {
    try {
      setLoading(true);
      const response = await fetch("/api/marketing/n8n-workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute_workflow",
          workflowId,
          inputData: inputData || {},
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh workflows after execution
        await fetchWorkflows();
        // Refresh metrics if this workflow is selected
        if (selectedWorkflow === workflowId) {
          await fetchWorkflowMetrics(workflowId);
        }
      } else {
        throw new Error(result.error || "Failed to execute workflow");
      }
    } catch (error) {
      console.error("Error executing workflow:", error);
      setError(
        error instanceof Error ? error.message : "Failed to execute workflow"
      );
    } finally {
      setLoading(false);
    }
  };

  // Set workflow status
  const setWorkflowStatus = async (workflowId: string, active: boolean) => {
    try {
      setLoading(true);
      const response = await fetch("/api/marketing/n8n-workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_workflow_status",
          workflowId,
          active,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update workflow status in local state
        setWorkflows(prev =>
          prev.map(wf =>
            wf.id === workflowId
              ? { ...wf, status: active ? "active" : "inactive" }
              : wf
          )
        );
      } else {
        throw new Error(result.error || "Failed to update workflow status");
      }
    } catch (error) {
      console.error("Error updating workflow status:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update workflow status"
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchWorkflows();
      fetchDashboardData();
      if (selectedWorkflow) {
        fetchWorkflowMetrics(selectedWorkflow);
        fetchPredictiveInsights(selectedWorkflow);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedWorkflow]);

  // Initial data fetch
  useEffect(() => {
    fetchWorkflows();
    fetchDashboardData();
  }, []);

  // Fetch metrics and insights when workflow is selected
  useEffect(() => {
    if (selectedWorkflow) {
      fetchWorkflowMetrics(selectedWorkflow);
      fetchPredictiveInsights(selectedWorkflow);
    }
  }, [selectedWorkflow]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
      case "active":
        return <Play className="h-4 w-4 text-green-600" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case "inactive":
        return <Square className="h-4 w-4 text-gray-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (
    status: string
  ): "default" | "secondary" | "outline" | "destructive" => {
    const variants: Record<
      string,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      running: "default",
      active: "default",
      paused: "secondary",
      inactive: "outline",
      error: "destructive",
    };
    return variants[status] || "outline";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case "failure_risk":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "optimization":
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case "scheduling":
        return <Clock className="h-4 w-4 text-green-600" />;
      default:
        return <Brain className="h-4 w-4 text-purple-600" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredWorkflows = workflows.filter(wf => {
    const matchesSearch = wf.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || wf.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getMockWorkflows = (): N8nWorkflow[] => [
    {
      id: "wf-001",
      name: "Welcome Email Sequence",
      status: "active",
      type: "email",
      execution_count: 1247,
      success_rate: 98.5,
      last_execution: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      tags: ["email", "automation", "welcome"],
    },
    {
      id: "wf-002",
      name: "Social Media Publishing",
      status: "active",
      type: "social",
      execution_count: 342,
      success_rate: 95.2,
      last_execution: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      tags: ["social", "publishing", "automation"],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-400" />
            Enhanced Marketing Automation
          </h1>
          <p className="text-gray-300 mt-1">
            n8n workflows with AI-powered predictive analytics and insights
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm text-gray-300">
              Auto-refresh
            </Label>
          </div>
          <NormalButton variant="secondary" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </NormalButton>
          <NormalButton size="sm" onClick={() => fetchWorkflows()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </NormalButton>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Health & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getHealthColor(dashboardData?.systemHealth || "healthy")}`}
            >
              {dashboardData?.systemHealth || "Healthy"}
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workflows
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.activeWorkflows ||
                workflows.filter(w => w.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {dashboardData?.totalWorkflows || workflows.length} total
              workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(dashboardData?.averageSuccessRate || 96.8)}%
            </div>
            <p className="text-xs text-muted-foreground">
              average across all workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Executions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData?.totalExecutions?.toLocaleString() || "1,589"}
            </div>
            <p className="text-xs text-muted-foreground">in the last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Workflow Monitor</TabsTrigger>
          <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Workflow Monitor Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="max-w-sm pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {loading && workflows.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading workflows...
                </CardContent>
              </Card>
            ) : (
              filteredWorkflows.map(workflow => (
                <Card
                  key={workflow.id}
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${selectedWorkflow === workflow.id ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => setSelectedWorkflow(workflow.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(workflow.status)}
                        <div>
                          <CardTitle className="text-lg">
                            {workflow.name}
                          </CardTitle>
                          <CardDescription>
                            {workflow.tags?.join(", ") ||
                              "Marketing automation workflow"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(workflow.status)}>
                          {workflow.status}
                        </Badge>
                        <div className="flex gap-1">
                          <div
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                            }}
                          >
                            <NormalButton
                              size="sm"
                              variant="secondary"
                              onClick={() => executeWorkflow(workflow.id)}
                              disabled={loading}
                            >
                              <Play className="h-3 w-3" />
                            </NormalButton>
                          </div>
                          <div
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                            }}
                          >
                            <NormalButton
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                setWorkflowStatus(
                                  workflow.id,
                                  workflow.status !== "active"
                                )
                              }
                              disabled={loading}
                            >
                              {workflow.status === "active" ? (
                                <Pause className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </NormalButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Success Rate
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={workflow.success_rate}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">
                            {workflow.success_rate}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Executions
                        </p>
                        <p className="text-lg font-medium">
                          {workflow.execution_count.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Last Run
                        </p>
                        <p className="text-sm">
                          {formatTimeAgo(workflow.last_execution)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="text-sm capitalize">{workflow.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Predictive Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {selectedWorkflow ? (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Workflow Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Detailed performance analysis for selected workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {workflowMetrics ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Success Rate
                          </span>
                          <span className="text-sm">
                            {Math.round(workflowMetrics.success_rate)}%
                          </span>
                        </div>
                        <Progress value={workflowMetrics.success_rate} />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Performance Score
                          </span>
                          <span className="text-sm">
                            {Math.round(workflowMetrics.performance_score)}/100
                          </span>
                        </div>
                        <Progress value={workflowMetrics.performance_score} />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Avg Execution Time
                          </span>
                          <span className="text-sm">
                            {Math.round(workflowMetrics.average_execution_time)}
                            ms
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            (30000 - workflowMetrics.average_execution_time) /
                              300
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading metrics...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Select a Workflow</h3>
                <p className="text-muted-foreground">
                  Choose a workflow from the monitor tab to view detailed
                  analytics and predictions
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {selectedWorkflow && predictiveInsights.length > 0 ? (
            <div className="grid gap-4">
              {predictiveInsights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getPredictionIcon(insight.prediction_type)}
                      {insight.prediction_type.replace("_", " ").toUpperCase()}
                    </CardTitle>
                    <CardDescription>
                      Confidence: {Math.round(insight.confidence * 100)}% •{" "}
                      {insight.data_points} data points • {insight.timeframe}{" "}
                      timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">Insight</h4>
                        <p className="text-sm text-muted-foreground">
                          {insight.insight}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Recommendation</h4>
                        <p className="text-sm">{insight.recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : selectedWorkflow ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
                <h3 className="text-lg font-medium mb-2">
                  Generating AI Insights
                </h3>
                <p className="text-muted-foreground">
                  Analyzing workflow data to provide predictive insights...
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  AI-Powered Insights
                </h3>
                <p className="text-muted-foreground">
                  Select a workflow to view machine learning predictions and
                  optimization recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
