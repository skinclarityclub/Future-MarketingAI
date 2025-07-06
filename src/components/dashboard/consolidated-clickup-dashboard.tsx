"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  Zap,
  BarChart3,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Webhook,
  Settings,
  Eye,
  Trash2,
  Plus,
  Download,
  Database,
  RotateCcw,
  ArrowRightLeft,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

// ====================================================================
// TYPES - Consolidated from all dashboard variants
// ====================================================================

interface ClickUpWorkspace {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  members: any[];
}

interface TaskMetrics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  avg_completion_time: number;
}

interface WebhookRegistration {
  id: string;
  team_id: string;
  endpoint: string;
  events: string[];
  status: "active" | "inactive" | "failed";
  fail_count: number;
  last_ping_at?: string;
  created_at: string;
}

interface TimeTrackingStats {
  total_tracked_time: number;
  billable_time: number;
  non_billable_time: number;
  active_timers: number;
  team_productivity_average: number;
  most_productive_hour: number;
  least_productive_hour: number;
  top_performer: string;
  projects_in_progress: number;
  overdue_projects: number;
}

interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "date" | "checkbox";
  required: boolean;
  values?: string[];
  usage_count: number;
  last_used: string;
}

interface PerformanceMetrics {
  workflow_efficiency: number;
  team_utilization: number;
  throughput_per_day: number;
  quality_index: number;
  capacity_utilization: number;
}

interface SyncResult {
  success: boolean;
  action: "created" | "updated" | "skipped";
  platform_task_id?: string;
  clickup_task_id?: string;
  message: string;
  error?: string;
}

// ====================================================================
// MAIN COMPONENT
// ====================================================================

export default function ConsolidatedClickUpDashboard() {
  // ====================================================================
  // STATE MANAGEMENT - Consolidated from all variants
  // ====================================================================

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  // Workspace & Project Management
  const [workspaces, setWorkspaces] = useState<ClickUpWorkspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");

  // Analytics Data
  const [taskMetrics, setTaskMetrics] = useState<TaskMetrics>({
    total_tasks: 0,
    completed_tasks: 0,
    in_progress_tasks: 0,
    overdue_tasks: 0,
    completion_rate: 0,
    avg_completion_time: 0,
  });

  // Time Tracking Data
  const [timeStats, setTimeStats] = useState<TimeTrackingStats>({
    total_tracked_time: 0,
    billable_time: 0,
    non_billable_time: 0,
    active_timers: 0,
    team_productivity_average: 0,
    most_productive_hour: 9,
    least_productive_hour: 15,
    top_performer: "",
    projects_in_progress: 0,
    overdue_projects: 0,
  });

  // Webhook Management
  const [webhooks, setWebhooks] = useState<WebhookRegistration[]>([]);
  const [showNewWebhookForm, setShowNewWebhookForm] = useState(false);

  // Custom Fields
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // Performance Data
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      workflow_efficiency: 0,
      team_utilization: 0,
      throughput_per_day: 0,
      quality_index: 0,
      capacity_utilization: 0,
    });

  // Sync Data
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // ====================================================================
  // LIFECYCLE & DATA LOADING
  // ====================================================================

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    await Promise.all([
      testConnection(),
      loadAnalyticsData(),
      loadTimeTrackingData(),
      loadWebhooks(),
      loadCustomFields(),
      loadPerformanceData(),
    ]);
  };

  // ====================================================================
  // API FUNCTIONS - Consolidated from all variants
  // ====================================================================

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clickup?action=workspaces");
      const data = await response.json();

      if (data.status === "success") {
        setConnected(true);
        setWorkspaces(data.workspaces || []);
        toast.success("ClickUp connection successful!");
      } else {
        setConnected(false);
        toast.error(data.message || "Failed to connect to ClickUp");
      }
    } catch (error) {
      console.error("ClickUp connection error:", error);
      setConnected(false);
      toast.error("Failed to connect to ClickUp API");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      // Mock data for demonstration
      setTaskMetrics({
        total_tasks: 245,
        completed_tasks: 178,
        in_progress_tasks: 45,
        overdue_tasks: 22,
        completion_rate: 72.6,
        avg_completion_time: 3.2,
      });
    } catch (error) {
      console.error("Error loading analytics data:", error);
    }
  };

  const loadTimeTrackingData = async () => {
    try {
      // Mock data for demonstration
      setTimeStats({
        total_tracked_time: 28800000, // 8 hours
        billable_time: 25200000, // 7 hours
        non_billable_time: 3600000, // 1 hour
        active_timers: 3,
        team_productivity_average: 78.5,
        most_productive_hour: 10,
        least_productive_hour: 15,
        top_performer: "Mike Johnson",
        projects_in_progress: 5,
        overdue_projects: 2,
      });
    } catch (error) {
      console.error("Error loading time tracking data:", error);
    }
  };

  const loadWebhooks = async () => {
    try {
      setWebhooks([
        {
          id: "webhook_1",
          team_id: "team_123",
          endpoint: "https://app.skcbi.com/webhook/clickup",
          events: ["taskCreated", "taskUpdated", "taskStatusUpdated"],
          status: "active",
          fail_count: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ]);
    } catch (error) {
      console.error("Error loading webhooks:", error);
    }
  };

  const loadCustomFields = async () => {
    try {
      setCustomFields([
        {
          id: "field_1",
          name: "Content Type",
          type: "select",
          required: true,
          values: ["Blog Post", "Social Media", "Email", "Video"],
          usage_count: 45,
          last_used: "2025-01-20T10:30:00Z",
        },
        {
          id: "field_2",
          name: "Publication Date",
          type: "date",
          required: false,
          usage_count: 38,
          last_used: "2025-01-19T15:45:00Z",
        },
      ]);
    } catch (error) {
      console.error("Error loading custom fields:", error);
    }
  };

  const loadPerformanceData = async () => {
    try {
      setPerformanceMetrics({
        workflow_efficiency: 83.5,
        team_utilization: 76.2,
        throughput_per_day: 12.3,
        quality_index: 91.7,
        capacity_utilization: 68.9,
      });
    } catch (error) {
      console.error("Error loading performance data:", error);
    }
  };

  const performBidirectionalSync = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch("/api/clickup/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "bidirectional-sync",
          projectId: "default",
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setSyncResults(data.results || []);
        setLastSyncTime(new Date().toISOString());
        toast.success(
          `Sync completed: ${data.successful_syncs}/${data.total_processed} successful`
        );
      } else {
        toast.error(data.message || "Sync failed");
      }
    } catch (error) {
      console.error("Error during sync:", error);
      toast.error("Failed to perform sync");
    } finally {
      setSyncLoading(false);
    }
  };

  // ====================================================================
  // UTILITY FUNCTIONS
  // ====================================================================

  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}u ${minutes}m`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // ====================================================================
  // RENDER COMPONENTS
  // ====================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading ClickUp Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-400" />
            Consolidated ClickUp Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Unified dashboard for all ClickUp integrations and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={connected ? "default" : "destructive"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>
          <NormalButton
            onClick={initializeDashboard}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </NormalButton>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-white">
                  {taskMetrics.total_tasks}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUp className="h-4 w-4 text-green-400" />
              <span className="text-sm ml-1 text-green-400">
                +12% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Time Tracked</p>
                <p className="text-2xl font-bold text-white">
                  {formatDuration(timeStats.total_tracked_time)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center mt-2">
              <Progress value={75} className="flex-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Efficiency</p>
                <p className="text-2xl font-bold text-white">
                  {formatPercentage(performanceMetrics.workflow_efficiency)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUp className="h-4 w-4 text-green-400" />
              <span className="text-sm ml-1 text-green-400">
                +5.2% this week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Webhooks</p>
                <p className="text-2xl font-bold text-white">
                  {webhooks.length}
                </p>
              </div>
              <Webhook className="h-8 w-8 text-orange-400" />
            </div>
            <div className="flex items-center mt-2">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor("active")} mr-2`}
              ></div>
              <span className="text-sm text-gray-400">
                All systems operational
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6 bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Activity className="h-5 w-5 mr-2 text-blue-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <NormalButton
                  onClick={performBidirectionalSync}
                  disabled={syncLoading}
                  className="w-full"
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  {syncLoading ? "Syncing..." : "Sync with ClickUp"}
                </NormalButton>

                <div className="grid grid-cols-2 gap-2">
                  <NormalButton variant="secondary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </NormalButton>
                  <NormalButton variant="secondary" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </NormalButton>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">
                      Task "API Integration" completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">
                      2 tasks are overdue
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      Webhook event processed
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {lastSyncTime && (
            <Alert className="bg-gray-800 border-gray-700">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertTitle className="text-white">
                Last Sync Successful
              </AlertTitle>
              <AlertDescription className="text-gray-300">
                Synchronized at {new Date(lastSyncTime).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Task Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Completed</span>
                    <span className="text-white font-bold">
                      {taskMetrics.completed_tasks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">In Progress</span>
                    <span className="text-white font-bold">
                      {taskMetrics.in_progress_tasks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Overdue</span>
                    <span className="text-red-400 font-bold">
                      {taskMetrics.overdue_tasks}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">
                  {formatPercentage(taskMetrics.completion_rate)}
                </div>
                <Progress
                  value={taskMetrics.completion_rate}
                  className="mb-2"
                />
                <p className="text-sm text-gray-400">
                  Avg completion time: {taskMetrics.avg_completion_time} days
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">
                  {formatPercentage(timeStats.team_productivity_average)}
                </div>
                <p className="text-sm text-gray-400">
                  Top performer: {timeStats.top_performer}
                </p>
                <p className="text-sm text-gray-400">
                  Active timers: {timeStats.active_timers}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="time-tracking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Time Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Billable Time</span>
                    <span className="text-white font-bold">
                      {formatDuration(timeStats.billable_time)}
                    </span>
                  </div>
                  <Progress
                    value={
                      (timeStats.billable_time / timeStats.total_tracked_time) *
                      100
                    }
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Non-billable Time</span>
                    <span className="text-white font-bold">
                      {formatDuration(timeStats.non_billable_time)}
                    </span>
                  </div>
                  <Progress
                    value={
                      (timeStats.non_billable_time /
                        timeStats.total_tracked_time) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Productivity Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Most Productive Hour</span>
                  <span className="text-white font-bold">
                    {timeStats.most_productive_hour}:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Projects in Progress</span>
                  <span className="text-white font-bold">
                    {timeStats.projects_in_progress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Overdue Projects</span>
                  <span className="text-red-400 font-bold">
                    {timeStats.overdue_projects}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Webhook Management
            </h2>
            <NormalButton onClick={() => setShowNewWebhookForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </NormalButton>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {webhooks.map(webhook => (
              <Card key={webhook.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            webhook.status === "active"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {webhook.status}
                        </Badge>
                        <span className="text-white font-medium">
                          {webhook.endpoint}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Events: {webhook.events.join(", ")}
                      </p>
                      <p className="text-sm text-gray-400">
                        Failures: {webhook.fail_count}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <NormalButton variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </NormalButton>
                      <NormalButton variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </NormalButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Fields Tab */}
        <TabsContent value="custom-fields" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Custom Fields Management
            </h2>
            <NormalButton>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </NormalButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customFields.map(field => (
              <Card key={field.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">{field.name}</h3>
                    <Badge variant="secondary">{field.type}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Required</span>
                      <span className="text-white">
                        {field.required ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Usage Count</span>
                      <span className="text-white">{field.usage_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Used</span>
                      <span className="text-white">
                        {new Date(field.last_used).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {field.values && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-400 mb-1">Options:</p>
                      <div className="flex flex-wrap gap-1">
                        {field.values.map((value, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Workflow Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Workflow Efficiency</span>
                    <span className="text-white font-bold">
                      {formatPercentage(performanceMetrics.workflow_efficiency)}
                    </span>
                  </div>
                  <Progress
                    value={performanceMetrics.workflow_efficiency}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Team Utilization</span>
                    <span className="text-white font-bold">
                      {formatPercentage(performanceMetrics.team_utilization)}
                    </span>
                  </div>
                  <Progress
                    value={performanceMetrics.team_utilization}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Quality Index</span>
                    <span className="text-white font-bold">
                      {formatPercentage(performanceMetrics.quality_index)}
                    </span>
                  </div>
                  <Progress
                    value={performanceMetrics.quality_index}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Throughput Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Daily Throughput</span>
                  <span className="text-white font-bold">
                    {performanceMetrics.throughput_per_day} tasks/day
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Capacity Utilization</span>
                  <span className="text-white font-bold">
                    {formatPercentage(performanceMetrics.capacity_utilization)}
                  </span>
                </div>
                <div className="mt-4">
                  <NormalButton variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Performance Report
                  </NormalButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
