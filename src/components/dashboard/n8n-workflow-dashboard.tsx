"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Square,
  Settings,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal,
  Zap,
  Network,
  Calendar,
  Users,
  TrendingUp,
  Database,
  GitBranch,
  Workflow,
  Timer,
  Target,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react";

// Interfaces
interface N8nWorkflow {
  id: string;
  n8n_workflow_id: string;
  workflow_name: string;
  workflow_description: string;
  workflow_type:
    | "task_automation"
    | "content_workflow"
    | "time_tracking"
    | "reporting";
  workflow_status: "active" | "paused" | "disabled" | "error";
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_execution_time_ms: number;
  last_execution_at: string;
  created_at: string;
}

interface WorkflowExecution {
  id: string;
  execution_id: string;
  execution_status: "running" | "success" | "error" | "waiting" | "canceled";
  execution_mode: "trigger" | "manual" | "retry" | "webhook";
  trigger_source: string;
  start_time: string;
  end_time?: string;
  execution_time_ms?: number;
  data_processed_count: number;
  error_details?: any;
}

interface WorkflowAnalytics {
  total_workflows: number;
  active_workflows: number;
  total_executions_today: number;
  success_rate_percentage: number;
  average_execution_time_ms: number;
  most_used_workflow_type: string;
  performance_score: number;
  daily_execution_trends: Array<{
    date: string;
    executions: number;
    success_rate: number;
  }>;
  workflow_type_distribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export function N8nWorkflowDashboard() {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [analytics, setAnalytics] = useState<WorkflowAnalytics | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Mock data generator
  const generateMockData = () => {
    const mockWorkflows: N8nWorkflow[] = [
      {
        id: "wf-001",
        n8n_workflow_id: "wf_001_task_automation",
        workflow_name: "Geautomatiseerde Taak Toewijzing",
        workflow_description:
          "Wijst automatisch nieuwe taken toe aan teamleden op basis van werkbelasting",
        workflow_type: "task_automation",
        workflow_status: "active",
        total_executions: 245,
        successful_executions: 238,
        failed_executions: 7,
        average_execution_time_ms: 1250,
        last_execution_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        created_at: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "wf-002",
        n8n_workflow_id: "wf_002_content_workflow",
        workflow_name: "Content Publishing Pipeline",
        workflow_description:
          "Beheert content workflow van creatie tot publicatie",
        workflow_type: "content_workflow",
        workflow_status: "active",
        total_executions: 189,
        successful_executions: 182,
        failed_executions: 7,
        average_execution_time_ms: 2840,
        last_execution_at: new Date(
          Date.now() - 2 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date(
          Date.now() - 45 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "wf-003",
        n8n_workflow_id: "wf_003_time_tracking",
        workflow_name: "Tijd Tracking Rapporten",
        workflow_description:
          "Genereert geautomatiseerde tijd tracking rapporten en inzichten",
        workflow_type: "time_tracking",
        workflow_status: "paused",
        total_executions: 67,
        successful_executions: 65,
        failed_executions: 2,
        average_execution_time_ms: 4250,
        last_execution_at: new Date(
          Date.now() - 12 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date(
          Date.now() - 20 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    const mockExecutions: WorkflowExecution[] = [
      {
        id: "exec-001",
        execution_id: "exec_2025062015001",
        execution_status: "success",
        execution_mode: "trigger",
        trigger_source: "clickup_webhook",
        start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 29 * 60 * 1000).toISOString(),
        execution_time_ms: 1250,
        data_processed_count: 12,
      },
      {
        id: "exec-002",
        execution_id: "exec_2025062014002",
        execution_status: "running",
        execution_mode: "manual",
        trigger_source: "api_call",
        start_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        execution_time_ms: 0,
        data_processed_count: 8,
      },
      {
        id: "exec-003",
        execution_id: "exec_2025062013003",
        execution_status: "error",
        execution_mode: "trigger",
        trigger_source: "scheduled",
        start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(
          Date.now() - 2 * 60 * 60 * 1000 + 30000
        ).toISOString(),
        execution_time_ms: 30000,
        data_processed_count: 0,
        error_details: { message: "ClickUp API rate limit exceeded" },
      },
    ];

    const mockAnalytics: WorkflowAnalytics = {
      total_workflows: 3,
      active_workflows: 2,
      total_executions_today: 45,
      success_rate_percentage: 96.8,
      average_execution_time_ms: 2447,
      most_used_workflow_type: "task_automation",
      performance_score: 87.5,
      daily_execution_trends: [
        { date: "2025-06-14", executions: 38, success_rate: 94.7 },
        { date: "2025-06-15", executions: 42, success_rate: 97.6 },
        { date: "2025-06-16", executions: 39, success_rate: 94.9 },
        { date: "2025-06-17", executions: 51, success_rate: 98.0 },
        { date: "2025-06-18", executions: 47, success_rate: 95.7 },
        { date: "2025-06-19", executions: 44, success_rate: 97.7 },
        { date: "2025-06-20", executions: 45, success_rate: 96.8 },
      ],
      workflow_type_distribution: [
        { type: "task_automation", count: 245, percentage: 48.7 },
        { type: "content_workflow", count: 189, percentage: 37.6 },
        { type: "time_tracking", count: 67, percentage: 13.3 },
        { type: "reporting", count: 2, percentage: 0.4 },
      ],
    };

    setWorkflows(mockWorkflows);
    setExecutions(mockExecutions);
    setAnalytics(mockAnalytics);
    setLoading(false);
  };

  useEffect(() => {
    generateMockData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "success":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      case "paused":
      case "waiting":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "disabled":
      case "canceled":
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
      case "error":
        return "bg-red-500/20 text-red-700 border-red-500/30";
      case "running":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
    }
  };

  const getWorkflowTypeIcon = (type: string) => {
    switch (type) {
      case "task_automation":
        return <Zap className="h-4 w-4" />;
      case "content_workflow":
        return <Workflow className="h-4 w-4" />;
      case "time_tracking":
        return <Timer className="h-4 w-4" />;
      case "reporting":
        return <Database className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return "Nu net";
    if (diffInMinutes < 60) return `${diffInMinutes} min geleden`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} uur geleden`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dagen geleden`;
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch =
      workflow.workflow_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.workflow_description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || workflow.workflow_status === statusFilter;
    const matchesType =
      typeFilter === "all" || workflow.workflow_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              n8n Workflow Integratie
            </h1>
            <p className="text-gray-600 mt-2">
              Beheer en monitor uw n8n workflows geïntegreerd met ClickUp
            </p>
          </div>
          <div className="flex gap-3">
            <NormalButton className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Workflow
            </NormalButton>
          </div>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Totaal Workflows
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.total_workflows}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {analytics.active_workflows} actief
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Network className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Executions Vandaag
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.total_executions_today}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {analytics.success_rate_percentage}% succesvol
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Gem. Executie Tijd
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatDuration(analytics.average_execution_time_ms)}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">Optimaal</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Performance Score
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.performance_score}%
                    </p>
                    <Progress
                      value={analytics.performance_score}
                      className="mt-2"
                    />
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <CardTitle className="text-xl font-semibold">
                    Workflow Overzicht
                  </CardTitle>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Zoek workflows..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-48"
                      />
                    </div>

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Status</SelectItem>
                        <SelectItem value="active">Actief</SelectItem>
                        <SelectItem value="paused">Gepauzeerd</SelectItem>
                        <SelectItem value="disabled">Uitgeschakeld</SelectItem>
                        <SelectItem value="error">Fout</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Types</SelectItem>
                        <SelectItem value="task_automation">
                          Taak Automatisering
                        </SelectItem>
                        <SelectItem value="content_workflow">
                          Content Workflow
                        </SelectItem>
                        <SelectItem value="time_tracking">
                          Tijd Tracking
                        </SelectItem>
                        <SelectItem value="reporting">Rapportage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredWorkflows.map(workflow => (
                    <Card
                      key={workflow.id}
                      className="bg-white/50 border border-gray-200/50 hover:shadow-md transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                              {getWorkflowTypeIcon(workflow.workflow_type)}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {workflow.workflow_name}
                                </h3>
                                <Badge
                                  className={getStatusColor(
                                    workflow.workflow_status
                                  )}
                                >
                                  {workflow.workflow_status}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-3">
                                {workflow.workflow_description}
                              </p>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    Totaal Executions:
                                  </span>
                                  <br />
                                  <span className="font-semibold">
                                    {workflow.total_executions}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Succesvol:
                                  </span>
                                  <br />
                                  <span className="font-semibold text-green-600">
                                    {workflow.successful_executions}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Gefaald:
                                  </span>
                                  <br />
                                  <span className="font-semibold text-red-600">
                                    {workflow.failed_executions}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Laatst Uitgevoerd:
                                  </span>
                                  <br />
                                  <span className="font-semibold">
                                    {formatRelativeTime(
                                      workflow.last_execution_at
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <NormalButton
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedWorkflow(workflow.id)}
                            >
                              <Activity className="h-4 w-4 mr-2" />
                              Executions
                            </NormalButton>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <NormalButton variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </NormalButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Bewerken
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Play className="h-4 w-4 mr-2" />
                                  Uitvoeren
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pauzeren
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Verwijderen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Workflow Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Execution ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Trigger Source</TableHead>
                      <TableHead>Start Tijd</TableHead>
                      <TableHead>Duur</TableHead>
                      <TableHead>Data Verwerkt</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map(execution => (
                      <TableRow key={execution.id}>
                        <TableCell className="font-medium">
                          {execution.execution_id}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(
                              execution.execution_status
                            )}
                          >
                            {execution.execution_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {execution.execution_mode}
                          </Badge>
                        </TableCell>
                        <TableCell>{execution.trigger_source}</TableCell>
                        <TableCell>
                          {formatRelativeTime(execution.start_time)}
                        </TableCell>
                        <TableCell>
                          {execution.execution_time_ms
                            ? formatDuration(execution.execution_time_ms)
                            : "-"}
                        </TableCell>
                        <TableCell>{execution.data_processed_count}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <NormalButton variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </NormalButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Activity className="h-4 w-4 mr-2" />
                                Details Bekijken
                              </DropdownMenuItem>
                              {execution.execution_status === "error" && (
                                <DropdownMenuItem>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Opnieuw Proberen
                                </DropdownMenuItem>
                              )}
                              {execution.execution_status === "running" && (
                                <DropdownMenuItem className="text-red-600">
                                  <Square className="h-4 w-4 mr-2" />
                                  Stoppen
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Execution Trends */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Execution Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.daily_execution_trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="executions"
                        stroke="#3b82f6"
                        fill="url(#executionGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient
                          id="executionGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Workflow Type Distribution */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Workflow Type Verdeling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.workflow_type_distribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        label={({ type, percentage }) =>
                          `${type}: ${percentage}%`
                        }
                      >
                        {analytics?.workflow_type_distribution.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][
                                  index % 4
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Workflow Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Binnenkort Beschikbaar
                  </h3>
                  <p className="text-gray-600">
                    Workflow templates functionaliteit wordt binnenkort
                    toegevoegd.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
