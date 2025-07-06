"use client";

import { useState, useEffect, useCallback } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Eye,
  Download,
} from "lucide-react";

interface WorkflowData {
  id: string;
  name: string;
  active: boolean;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecution?: string;
  executionsByDay: Array<{
    date: string;
    count: number;
    success: number;
    failure: number;
  }>;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  startedAt: string;
  stoppedAt?: string;
  status: "new" | "running" | "success" | "error" | "canceled" | "waiting";
  data?: Record<string, any>;
  executionTime?: number;
}

const STATUS_COLORS = {
  new: "#94a3b8",
  running: "#3b82f6",
  success: "#10b981",
  error: "#ef4444",
  canceled: "#6b7280",
  waiting: "#f59e0b",
};

export function WorkflowDashboard() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [n8nHealth, setN8nHealth] = useState<{
    status: string;
    message: string;
  } | null>(null);

  const loadWorkflowData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch workflow stats and health
      const [statsResponse, healthResponse] = await Promise.all([
        fetch("/api/workflows?action=stats"),
        fetch("/api/workflows?action=health"),
      ]);

      if (!statsResponse.ok || !healthResponse.ok) {
        throw new Error("Failed to fetch workflow data");
      }

      const statsData = await statsResponse.json();
      const healthData = await healthResponse.json();

      if (statsData.success) {
        const workflowsList = Object.entries(statsData.data).map(
          ([id, data]: [string, any]) => ({
            id,
            name: data.name || id,
            active: Boolean(data.active),
            totalExecutions: Number(data.totalExecutions) || 0,
            successfulExecutions: Number(data.successfulExecutions) || 0,
            failedExecutions: Number(data.failedExecutions) || 0,
            averageExecutionTime: Number(data.averageExecutionTime) || 0,
            lastExecution: data.lastExecution || undefined,
            executionsByDay: Array.isArray(data.executionsByDay)
              ? data.executionsByDay.map((day: any) => ({
                  date: day.date || new Date().toISOString().split("T")[0],
                  count: Number(day.count) || 0,
                  success: Number(day.success) || 0,
                  failure: Number(day.failure) || 0,
                }))
              : [],
          })
        );
        setWorkflows(workflowsList);

        // Auto-select first workflow if none selected
        if (!selectedWorkflow && workflowsList.length > 0) {
          setSelectedWorkflow(workflowsList[0].id);
        }
      }

      if (healthData.success) {
        setN8nHealth(healthData.data);
      }

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to load workflow data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load workflow data"
      );

      // Mock data for demonstration when API is not available
      const mockWorkflows: WorkflowData[] = [
        {
          id: "marketing-manager",
          name: "MarketingManager",
          active: true,
          totalExecutions: 156,
          successfulExecutions: 143,
          failedExecutions: 13,
          averageExecutionTime: 2340,
          lastExecution: new Date(Date.now() - 300000).toISOString(),
          executionsByDay: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - i * 86400000)
              .toISOString()
              .split("T")[0],
            count: Math.floor(Math.random() * 20) + 5,
            success: Math.floor(Math.random() * 18) + 4,
            failure: Math.floor(Math.random() * 3),
          })).reverse(),
        },
        {
          id: "post-builder",
          name: "PostBuilder",
          active: true,
          totalExecutions: 89,
          successfulExecutions: 85,
          failedExecutions: 4,
          averageExecutionTime: 1840,
          lastExecution: new Date(Date.now() - 600000).toISOString(),
          executionsByDay: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - i * 86400000)
              .toISOString()
              .split("T")[0],
            count: Math.floor(Math.random() * 15) + 3,
            success: Math.floor(Math.random() * 14) + 3,
            failure: Math.floor(Math.random() * 2),
          })).reverse(),
        },
        {
          id: "carousel-builder",
          name: "CarouselBuilder",
          active: false,
          totalExecutions: 32,
          successfulExecutions: 28,
          failedExecutions: 4,
          averageExecutionTime: 3200,
          lastExecution: new Date(Date.now() - 3600000).toISOString(),
          executionsByDay: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - i * 86400000)
              .toISOString()
              .split("T")[0],
            count: Math.floor(Math.random() * 8) + 1,
            success: Math.floor(Math.random() * 7) + 1,
            failure: Math.floor(Math.random() * 2),
          })).reverse(),
        },
      ];

      setWorkflows(mockWorkflows);
      if (!selectedWorkflow) {
        setSelectedWorkflow(mockWorkflows[0].id);
      }
      setN8nHealth({
        status: "unhealthy",
        message: "Mock data - N8N not connected",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedWorkflow]);

  const loadExecutions = useCallback(async (workflowId: string) => {
    try {
      const response = await fetch(
        `/api/workflows?action=executions&workflowId=${workflowId}&limit=20`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch executions");
      }

      const data = await response.json();

      if (data.success) {
        setExecutions(data.data);
      } else {
        // Mock executions for demonstration
        const mockExecutions: WorkflowExecution[] = Array.from(
          { length: 10 },
          (_, i) => ({
            id: `exec-${i}`,
            workflowId,
            startedAt: new Date(Date.now() - i * 600000).toISOString(),
            stoppedAt: new Date(Date.now() - i * 600000 + 120000).toISOString(),
            status: Math.random() > 0.1 ? "success" : "error",
            executionTime: Math.floor(Math.random() * 5000) + 1000,
          })
        );
        setExecutions(mockExecutions);
      }
    } catch (err) {
      console.error("Failed to load executions:", err);
      // Set mock data
      const mockExecutions: WorkflowExecution[] = Array.from(
        { length: 10 },
        (_, i) => ({
          id: `exec-${i}`,
          workflowId,
          startedAt: new Date(Date.now() - i * 600000).toISOString(),
          stoppedAt: new Date(Date.now() - i * 600000 + 120000).toISOString(),
          status: Math.random() > 0.1 ? "success" : "error",
          executionTime: Math.floor(Math.random() * 5000) + 1000,
        })
      );
      setExecutions(mockExecutions);
    }
  }, []);

  const toggleWorkflow = async (workflowId: string, activate: boolean) => {
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: activate ? "activate" : "deactivate",
          workflowId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${activate ? "activate" : "deactivate"} workflow`
        );
      }

      // Refresh data
      await loadWorkflowData();
    } catch (err) {
      console.error(`Failed to toggle workflow:`, err);
      // For demo, just update local state
      setWorkflows(prev =>
        prev.map(w => (w.id === workflowId ? { ...w, active: activate } : w))
      );
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute",
          workflowId,
          data: { manual_trigger: true },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute workflow");
      }

      // Refresh executions
      if (selectedWorkflow === workflowId) {
        await loadExecutions(workflowId);
      }
    } catch (err) {
      console.error("Failed to execute workflow:", err);
    }
  };

  useEffect(() => {
    loadWorkflowData();

    if (autoRefresh) {
      const interval = setInterval(loadWorkflowData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [loadWorkflowData, autoRefresh]);

  useEffect(() => {
    if (selectedWorkflow) {
      loadExecutions(selectedWorkflow);
    }
  }, [selectedWorkflow, loadExecutions]);

  const getStatusIcon = (status: WorkflowExecution["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "waiting":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSuccessRate = (workflow: WorkflowData) => {
    const total = Number(workflow.totalExecutions) || 0;
    const successful = Number(workflow.successfulExecutions) || 0;

    if (total === 0) return 0;

    const rate = (successful / total) * 100;
    return isNaN(rate) ? 0 : rate;
  };

  const totalExecutions = workflows.reduce(
    (sum, w) => sum + w.totalExecutions,
    0
  );
  const totalSuccessful = workflows.reduce(
    (sum, w) => sum + w.successfulExecutions,
    0
  );
  const totalFailed = workflows.reduce((sum, w) => sum + w.failedExecutions, 0);
  const activeWorkflows = workflows.filter(w => w.active).length;

  const pieData = [
    { name: "Successful", value: totalSuccessful, color: "#10b981" },
    { name: "Failed", value: totalFailed, color: "#ef4444" },
  ].filter(item => item.value > 0);

  if (loading && workflows.length === 0) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage N8N workflow executions
          </p>
        </div>
        <div className="flex items-center gap-4">
          {n8nHealth && (
            <Badge
              variant={
                n8nHealth.status === "healthy" ? "default" : "destructive"
              }
            >
              {n8nHealth.status === "healthy" ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              N8N {n8nHealth.status}
            </Badge>
          )}
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
            onClick={loadWorkflowData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </NormalButton>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {error.includes("Mock data") && (
              <span className="ml-2 text-sm">
                (Demo mode with simulated data)
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Workflows
                </p>
                <p className="text-2xl font-bold">{workflows.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">{activeWorkflows} active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Executions
                </p>
                <p className="text-2xl font-bold">
                  {totalExecutions.toLocaleString()}
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <BarChart3 className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">All time</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {totalExecutions > 0
                    ? ((totalSuccessful / totalExecutions) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress
              value={
                totalExecutions > 0
                  ? (totalSuccessful / totalExecutions) * 100
                  : 0
              }
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Failed Executions
                </p>
                <p className="text-2xl font-bold text-red-600">{totalFailed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500">
                {totalExecutions > 0
                  ? ((totalFailed / totalExecutions) * 100).toFixed(1)
                  : 0}
                % failure rate
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Success Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Success Rate</CardTitle>
                <CardDescription>
                  Distribution of successful vs failed executions
                </CardDescription>
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
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Workflow Activity</CardTitle>
                <CardDescription>Latest workflow executions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.slice(0, 5).map(workflow => (
                    <div
                      key={workflow.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${workflow.active ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {workflow.totalExecutions} executions
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={workflow.active ? "default" : "secondary"}
                      >
                        {workflow.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Management</CardTitle>
              <CardDescription>
                Monitor and control your N8N workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Executions</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Avg Time</TableHead>
                    <TableHead>Last Execution</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map(workflow => (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-medium">
                        {workflow.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={workflow.active ? "default" : "secondary"}
                        >
                          {workflow.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{workflow.totalExecutions}</TableCell>
                      <TableCell>
                        <span
                          className={
                            getSuccessRate(workflow) >= 90
                              ? "text-green-600"
                              : "text-yellow-600"
                          }
                        >
                          {getSuccessRate(workflow).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {workflow.averageExecutionTime
                          ? `${(workflow.averageExecutionTime / 1000).toFixed(1)}s`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {workflow.lastExecution
                          ? new Date(workflow.lastExecution).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <NormalButton
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleWorkflow(workflow.id, !workflow.active)
                            }
                          >
                            {workflow.active ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </NormalButton>
                          <NormalButton
                            variant="outline"
                            size="sm"
                            onClick={() => executeWorkflow(workflow.id)}
                            disabled={!workflow.active}
                          >
                            <Zap className="h-4 w-4" />
                          </NormalButton>
                          <NormalButton
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedWorkflow(workflow.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </NormalButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {selectedWorkflow && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Execution History -{" "}
                  {workflows.find(w => w.id === selectedWorkflow)?.name}
                </CardTitle>
                <CardDescription>
                  Recent execution details and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map(execution => (
                      <TableRow key={execution.id}>
                        <TableCell className="font-mono text-sm">
                          {execution.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(execution.status)}
                            <Badge
                              variant={
                                execution.status === "success"
                                  ? "default"
                                  : "destructive"
                              }
                              style={{
                                backgroundColor:
                                  STATUS_COLORS[execution.status],
                              }}
                            >
                              {execution.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(execution.startedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {execution.executionTime
                            ? `${(execution.executionTime / 1000).toFixed(1)}s`
                            : execution.status === "running"
                              ? "Running..."
                              : "N/A"}
                        </TableCell>
                        <TableCell>
                          <NormalButton variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </NormalButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {selectedWorkflow && (
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Execution Trends -{" "}
                    {workflows.find(w => w.id === selectedWorkflow)?.name}
                  </CardTitle>
                  <CardDescription>
                    Daily execution counts over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={
                        workflows.find(w => w.id === selectedWorkflow)
                          ?.executionsByDay || []
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="success"
                        stackId="a"
                        fill="#10b981"
                        name="Successful"
                      />
                      <Bar
                        dataKey="failure"
                        stackId="a"
                        fill="#ef4444"
                        name="Failed"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
