"use client";

/**
 * AI Orchestration Control Panel
 * Task 80.6: Connect and Orchestrate AI Assistants
 *
 * Central control panel for managing and monitoring all AI assistants
 * and automated workflows in the SKC BI Dashboard.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  Cpu,
  Workflow,
  Play,
  Pause,
  Square,
  BarChart3,
  Users,
  MessageSquare,
  Navigation,
  Search,
  Mic,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Settings,
  Activity,
  Zap,
  ArrowRight,
  Eye,
  PlayCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardMode } from "@/lib/contexts/dashboard-mode-context";
import {
  getAIOrchestrator,
  type AIAssistantType,
  type OrchestratedResponse,
  type OrchestrationEvent,
} from "@/lib/ai-configuration/ai-orchestrator";
import {
  getAIWorkflowOrchestrator,
  AI_WORKFLOWS,
  type AIWorkflow,
  type WorkflowExecutionContext,
} from "@/lib/workflows/ai-workflow-orchestrator";

interface AIAssistantStatus {
  type: AIAssistantType;
  name: string;
  status: "online" | "busy" | "offline" | "error";
  activeRequests: number;
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  lastActivity?: Date;
  icon: React.ComponentType<any>;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  startTime: Date;
  duration?: number;
  currentStep?: string;
  totalSteps: number;
  completedSteps: number;
  errorMessage?: string;
}

interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  averageResponseTime: number;
  activeWorkflows: number;
  completedWorkflows: number;
  errorRate: number;
}

export function AIOrchestrationalControlPanel({
  className,
  enableRealTimeUpdates = true,
}: {
  className?: string;
  enableRealTimeUpdates?: boolean;
}) {
  const { currentMode } = useDashboardMode();

  // State management
  const [aiAssistants, setAIAssistants] = useState<AIAssistantStatus[]>([]);
  const [workflowExecutions, setWorkflowExecutions] = useState<
    WorkflowExecution[]
  >([]);
  const [availableWorkflows, setAvailableWorkflows] = useState<AIWorkflow[]>(
    []
  );
  const [metrics, setMetrics] = useState<AIMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    averageResponseTime: 0,
    activeWorkflows: 0,
    completedWorkflows: 0,
    errorRate: 0,
  });

  // UI state
  const [selectedAssistant, setSelectedAssistant] =
    useState<AIAssistantType | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [testQuery, setTestQuery] = useState("");
  const [isExecutingTest, setIsExecutingTest] = useState(false);
  const [testResult, setTestResult] = useState<OrchestratedResponse | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "assistants" | "workflows" | "monitoring"
  >("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize orchestrators
  const [aiOrchestrator] = useState(() => getAIOrchestrator());
  const [workflowOrchestrator] = useState(() => getAIWorkflowOrchestrator());

  // Mock data initialization
  const initializeMockData = useCallback(() => {
    const mockAssistants: AIAssistantStatus[] = [
      {
        type: "general",
        name: "General Assistant",
        status: "online",
        activeRequests: 2,
        totalRequests: 156,
        averageResponseTime: 1200,
        successRate: 98.5,
        lastActivity: new Date(Date.now() - 30000),
        icon: MessageSquare,
      },
      {
        type: "business-intelligence",
        name: "BI Assistant",
        status: "online",
        activeRequests: 1,
        totalRequests: 89,
        averageResponseTime: 2100,
        successRate: 97.8,
        lastActivity: new Date(Date.now() - 60000),
        icon: BarChart3,
      },
      {
        type: "navigation",
        name: "Navigation Assistant",
        status: "online",
        activeRequests: 0,
        totalRequests: 234,
        averageResponseTime: 450,
        successRate: 99.2,
        lastActivity: new Date(Date.now() - 120000),
        icon: Navigation,
      },
      {
        type: "marketing",
        name: "Marketing Assistant",
        status: "busy",
        activeRequests: 3,
        totalRequests: 67,
        averageResponseTime: 1800,
        successRate: 96.1,
        lastActivity: new Date(Date.now() - 10000),
        icon: TrendingUp,
      },
      {
        type: "financial",
        name: "Financial Assistant",
        status: "online",
        activeRequests: 1,
        totalRequests: 45,
        averageResponseTime: 2500,
        successRate: 99.1,
        lastActivity: new Date(Date.now() - 90000),
        icon: DollarSign,
      },
      {
        type: "complex-query",
        name: "Complex Query Handler",
        status: "online",
        activeRequests: 0,
        totalRequests: 23,
        averageResponseTime: 4200,
        successRate: 95.7,
        lastActivity: new Date(Date.now() - 300000),
        icon: Brain,
      },
      {
        type: "nlp",
        name: "NLP Processor",
        status: "online",
        activeRequests: 1,
        totalRequests: 312,
        averageResponseTime: 800,
        successRate: 98.9,
        lastActivity: new Date(Date.now() - 45000),
        icon: Cpu,
      },
      {
        type: "voice",
        name: "Voice Assistant",
        status: "offline",
        activeRequests: 0,
        totalRequests: 8,
        averageResponseTime: 1500,
        successRate: 92.5,
        lastActivity: new Date(Date.now() - 600000),
        icon: Mic,
      },
    ];

    const mockExecutions: WorkflowExecution[] = [
      {
        id: "exec_001",
        workflowId: "marketing_campaign_analysis",
        name: "Marketing Campaign Analysis",
        status: "running",
        progress: 65,
        startTime: new Date(Date.now() - 180000),
        currentStep: "performance_analysis",
        totalSteps: 4,
        completedSteps: 2,
      },
      {
        id: "exec_002",
        workflowId: "financial_intelligence_analysis",
        name: "Financial Intelligence Analysis",
        status: "completed",
        progress: 100,
        startTime: new Date(Date.now() - 900000),
        duration: 420000,
        totalSteps: 4,
        completedSteps: 4,
      },
      {
        id: "exec_003",
        workflowId: "content_intelligence_workflow",
        name: "Content Intelligence Workflow",
        status: "pending",
        progress: 0,
        startTime: new Date(),
        totalSteps: 4,
        completedSteps: 0,
      },
    ];

    setAIAssistants(mockAssistants);
    setWorkflowExecutions(mockExecutions);
    setAvailableWorkflows(Object.values(AI_WORKFLOWS));

    // Calculate metrics
    const totalRequests = mockAssistants.reduce(
      (sum, a) => sum + a.totalRequests,
      0
    );
    const successfulRequests = mockAssistants.reduce(
      (sum, a) => sum + Math.floor((a.totalRequests * a.successRate) / 100),
      0
    );
    const avgResponseTime =
      mockAssistants.reduce((sum, a) => sum + a.averageResponseTime, 0) /
      mockAssistants.length;
    const activeWorkflows = mockExecutions.filter(
      e => e.status === "running"
    ).length;
    const completedWorkflows = mockExecutions.filter(
      e => e.status === "completed"
    ).length;

    setMetrics({
      totalRequests,
      successfulRequests,
      averageResponseTime: Math.round(avgResponseTime),
      activeWorkflows,
      completedWorkflows,
      errorRate: ((totalRequests - successfulRequests) / totalRequests) * 100,
    });

    setIsLoading(false);
  }, []);

  // Load data on mount
  useEffect(() => {
    initializeMockData();
  }, [initializeMockData]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setAIAssistants(prev =>
        prev.map(assistant => ({
          ...assistant,
          activeRequests: Math.max(
            0,
            assistant.activeRequests + (Math.random() > 0.7 ? 1 : -1)
          ),
          totalRequests:
            assistant.totalRequests + (Math.random() > 0.8 ? 1 : 0),
        }))
      );

      setWorkflowExecutions(prev =>
        prev.map(execution => ({
          ...execution,
          progress:
            execution.status === "running"
              ? Math.min(100, execution.progress + Math.random() * 5)
              : execution.progress,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [enableRealTimeUpdates]);

  // Execute test query
  const executeTestQuery = async () => {
    if (!testQuery.trim() || !selectedAssistant) return;

    setIsExecutingTest(true);
    setTestResult(null);
    setError(null);

    try {
      // Simulate AI orchestration
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResponse: OrchestratedResponse = {
        id: `test_${Date.now()}`,
        primaryResponse: {
          answer: `This is a simulated response from the ${selectedAssistant} assistant for the query: "${testQuery}"`,
          sources: ["Mock Data Source 1", "Mock Data Source 2"],
          insights: ["Key insight from analysis", "Performance recommendation"],
          confidence: 0.87,
          executionTime: 1500,
        },
        orchestrationMetrics: {
          totalProcessingTime: 1500,
          assistantsInvolved: [selectedAssistant],
          collaborationLevel: "basic",
          qualityScore: 0.87,
        },
        recommendations: [
          {
            action: "Consider additional data sources",
            reasoning: "More data could improve accuracy",
            confidence: 0.75,
          },
        ],
      };

      setTestResult(mockResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsExecutingTest(false);
    }
  };

  // Execute workflow
  const executeWorkflow = async (workflowId: string) => {
    try {
      const newExecution: WorkflowExecution = {
        id: `exec_${Date.now()}`,
        workflowId,
        name:
          availableWorkflows.find(w => w.id === workflowId)?.name || "Unknown",
        status: "running",
        progress: 0,
        startTime: new Date(),
        totalSteps:
          availableWorkflows.find(w => w.id === workflowId)?.steps.length || 1,
        completedSteps: 0,
      };

      setWorkflowExecutions(prev => [newExecution, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start workflow");
    }
  };

  // Get status color for assistants
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
      case "error":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  // Get status color for workflows
  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "running":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "cancelled":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-slate-900 border-slate-700">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading AI Orchestration Control Panel...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full space-y-6 dark", className)}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            AI Orchestration Control Panel
            <Badge
              variant="secondary"
              className="bg-purple-500/20 text-purple-300 border-purple-500/30"
            >
              Task 80.6
            </Badge>
          </CardTitle>
          <p className="text-slate-300">
            Central command center for coordinating and monitoring all AI
            assistants and automated workflows
          </p>
        </CardHeader>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Requests</p>
                <p className="text-2xl font-bold text-white">
                  {metrics.totalRequests}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {(
                    (metrics.successfulRequests / metrics.totalRequests) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Response</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {metrics.averageResponseTime}ms
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Workflows</p>
                <p className="text-2xl font-bold text-purple-400">
                  {metrics.activeWorkflows}
                </p>
              </div>
              <Workflow className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {metrics.completedWorkflows}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Error Rate</p>
                <p className="text-2xl font-bold text-red-400">
                  {metrics.errorRate.toFixed(1)}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Control Panel */}
      <Tabs
        value={activeTab}
        onValueChange={(value: any) => setActiveTab(value)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-slate-700"
          >
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="assistants"
            className="data-[state=active]:bg-slate-700"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Assistants
          </TabsTrigger>
          <TabsTrigger
            value="workflows"
            className="data-[state=active]:bg-slate-700"
          >
            <Workflow className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger
            value="monitoring"
            className="data-[state=active]:bg-slate-700"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Assistant Status */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-400" />
                  AI Assistant Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAssistants.slice(0, 4).map(assistant => {
                    const Icon = assistant.icon;
                    return (
                      <div
                        key={assistant.type}
                        className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Icon className="h-5 w-5 text-slate-300" />
                            <div
                              className={cn(
                                "absolute -top-1 -right-1 w-3 h-3 rounded-full",
                                getStatusColor(assistant.status)
                              )}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {assistant.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {assistant.activeRequests} active requests
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {assistant.successRate}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active Workflows */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-purple-400" />
                  Active Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflowExecutions
                    .filter(
                      w => w.status === "running" || w.status === "pending"
                    )
                    .map(execution => (
                      <div
                        key={execution.id}
                        className="p-3 bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-white">
                            {execution.name}
                          </p>
                          <Badge
                            className={cn(
                              "text-xs",
                              getWorkflowStatusColor(execution.status)
                            )}
                          >
                            {execution.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <Progress
                            value={execution.progress}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>
                              {execution.completedSteps}/{execution.totalSteps}{" "}
                              steps
                            </span>
                            <span>{execution.progress.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Test Panel */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Quick AI Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  value={selectedAssistant || ""}
                  onValueChange={(value: AIAssistantType) =>
                    setSelectedAssistant(value)
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Select AI Assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiAssistants.map(assistant => (
                      <SelectItem key={assistant.type} value={assistant.type}>
                        {assistant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Enter test query..."
                  value={testQuery}
                  onChange={e => setTestQuery(e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />

                <NormalButton
                  onClick={executeTestQuery}
                  disabled={
                    !selectedAssistant || !testQuery.trim() || isExecutingTest
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isExecutingTest ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Test AI
                    </>
                  )}
                </NormalButton>
              </div>

              {testResult && (
                <div className="p-4 bg-slate-800 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Test Result:</h4>
                  <p className="text-slate-300 text-sm mb-3">
                    {testResult.primaryResponse.answer}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      Confidence:{" "}
                      {(testResult.primaryResponse.confidence * 100).toFixed(1)}
                      %
                    </Badge>
                    <Badge variant="outline">
                      Response Time:{" "}
                      {testResult.orchestrationMetrics.totalProcessingTime}ms
                    </Badge>
                    <Badge variant="outline">
                      Quality:{" "}
                      {(
                        testResult.orchestrationMetrics.qualityScore * 100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>
              )}

              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistants Tab */}
        <TabsContent value="assistants" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiAssistants.map(assistant => {
              const Icon = assistant.icon;
              return (
                <Card
                  key={assistant.type}
                  className="bg-slate-900 border-slate-700"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                      <div className="relative">
                        <Icon className="h-5 w-5 text-slate-300" />
                        <div
                          className={cn(
                            "absolute -top-1 -right-1 w-3 h-3 rounded-full",
                            getStatusColor(assistant.status)
                          )}
                        />
                      </div>
                      {assistant.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400">Status</p>
                        <Badge
                          className={cn(
                            "text-xs",
                            assistant.status === "online"
                              ? "bg-green-500/20 text-green-400"
                              : assistant.status === "busy"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : assistant.status === "offline"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-gray-500/20 text-gray-400"
                          )}
                        >
                          {assistant.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-400">Active</p>
                        <p className="text-white font-medium">
                          {assistant.activeRequests}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Total Requests</p>
                        <p className="text-white font-medium">
                          {assistant.totalRequests}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Success Rate</p>
                        <p className="text-green-400 font-medium">
                          {assistant.successRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Avg Response</p>
                        <p className="text-white font-medium">
                          {assistant.averageResponseTime}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Last Activity</p>
                        <p className="text-slate-300 text-xs">
                          {assistant.lastActivity
                            ? `${Math.floor((Date.now() - assistant.lastActivity.getTime()) / 60000)}m ago`
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Workflows */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-purple-400" />
                  Available Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {availableWorkflows.map(workflow => (
                      <div
                        key={workflow.id}
                        className="p-4 bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-white font-medium">
                              {workflow.name}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {workflow.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {workflow.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>{workflow.steps.length} steps</span>
                            <span>•</span>
                            <span>
                              {workflow.triggers.manual ? "Manual" : "Auto"}
                            </span>
                            {workflow.triggers.scheduled && (
                              <>
                                <span>•</span>
                                <span>Scheduled</span>
                              </>
                            )}
                          </div>
                          <NormalButton
                            size="sm"
                            onClick={() => executeWorkflow(workflow.id)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Execute
                          </NormalButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Workflow Executions */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Workflow Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {workflowExecutions.map(execution => (
                      <div
                        key={execution.id}
                        className="p-4 bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium">
                              {execution.name}
                            </h4>
                            <p className="text-slate-400 text-xs">
                              ID: {execution.id}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              "text-xs",
                              getWorkflowStatusColor(execution.status)
                            )}
                          >
                            {execution.status}
                          </Badge>
                        </div>

                        {execution.status === "running" && (
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>
                                Progress: {execution.completedSteps}/
                                {execution.totalSteps} steps
                              </span>
                              <span>{execution.progress.toFixed(0)}%</span>
                            </div>
                            <Progress
                              value={execution.progress}
                              className="h-2"
                            />
                            {execution.currentStep && (
                              <p className="text-xs text-slate-300">
                                Current: {execution.currentStep}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>
                            Started: {execution.startTime.toLocaleTimeString()}
                          </span>
                          {execution.duration && (
                            <span>
                              Duration: {Math.floor(execution.duration / 1000)}s
                            </span>
                          )}
                        </div>

                        {execution.errorMessage && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                            {execution.errorMessage}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">
                        Overall Success Rate
                      </span>
                      <span className="text-white">
                        {(
                          (metrics.successfulRequests / metrics.totalRequests) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (metrics.successfulRequests / metrics.totalRequests) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">
                        Average Response Time
                      </span>
                      <span className="text-white">
                        {metrics.averageResponseTime}ms
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        ((3000 - metrics.averageResponseTime) / 3000) * 100,
                        100
                      )}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">System Load</span>
                      <span className="text-white">
                        {aiAssistants.reduce(
                          (sum, a) => sum + a.activeRequests,
                          0
                        )}{" "}
                        active
                      </span>
                    </div>
                    <Progress
                      value={
                        (aiAssistants.reduce(
                          (sum, a) => sum + a.activeRequests,
                          0
                        ) /
                          20) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-400" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      name: "AI Orchestrator",
                      status: "healthy",
                      uptime: "99.9%",
                    },
                    {
                      name: "Workflow Engine",
                      status: "healthy",
                      uptime: "99.7%",
                    },
                    {
                      name: "NLP Processing",
                      status: "healthy",
                      uptime: "99.8%",
                    },
                    {
                      name: "Voice Recognition",
                      status: "degraded",
                      uptime: "87.2%",
                    },
                    {
                      name: "Data Integration",
                      status: "healthy",
                      uptime: "99.5%",
                    },
                  ].map(system => (
                    <div
                      key={system.name}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            system.status === "healthy"
                              ? "bg-green-500"
                              : system.status === "degraded"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          )}
                        />
                        <span className="text-white text-sm">
                          {system.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-300 text-sm">
                          {system.uptime}
                        </p>
                        <p className="text-slate-400 text-xs">uptime</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
