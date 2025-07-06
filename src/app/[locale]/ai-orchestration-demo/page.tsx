"use client";

/**
 * AI Orchestration Demo Page
 * Task 80.6: Connect and Orchestrate AI Assistants
 *
 * Interactive demo showcasing the unified AI orchestration system
 * and workflow automation capabilities.
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Workflow,
  Play,
  Zap,
  MessageSquare,
  BarChart3,
  Navigation,
  DollarSign,
  TrendingUp,
  Mic,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Settings,
  Users,
  Activity,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoResult {
  success: boolean;
  response?: any;
  error?: string;
  metadata?: {
    processingTime: number;
    assistantsUsed: string[];
    qualityScore: number;
  };
}

const AI_ASSISTANT_TYPES = [
  {
    id: "general",
    name: "General Assistant",
    icon: MessageSquare,
    description: "General-purpose AI assistant for common queries",
    examples: [
      "What are our sales trends?",
      "Explain customer behavior",
      "Help me understand KPIs",
    ],
  },
  {
    id: "business-intelligence",
    name: "BI Assistant",
    icon: BarChart3,
    description: "Specialized in data analysis and business insights",
    examples: [
      "Analyze Q4 revenue performance",
      "Compare marketing channels",
      "Forecast next quarter",
    ],
  },
  {
    id: "navigation",
    name: "Navigation Assistant",
    icon: Navigation,
    description: "Helps users navigate the dashboard efficiently",
    examples: [
      "Go to customer analytics",
      "Show me the revenue dashboard",
      "Find budget reports",
    ],
  },
  {
    id: "marketing",
    name: "Marketing Assistant",
    icon: TrendingUp,
    description: "Marketing campaign analysis and optimization",
    examples: [
      "Optimize campaign performance",
      "Analyze audience engagement",
      "Content strategy recommendations",
    ],
  },
  {
    id: "financial",
    name: "Financial Assistant",
    icon: DollarSign,
    description: "Financial analysis and forecasting",
    examples: [
      "Cash flow analysis",
      "Budget variance report",
      "ROI calculations",
    ],
  },
  {
    id: "complex-query",
    name: "Complex Query Handler",
    icon: Brain,
    description: "Handles complex analytical queries requiring deep processing",
    examples: [
      "Multi-dimensional analysis",
      "Predictive modeling",
      "Correlation analysis",
    ],
  },
  {
    id: "nlp",
    name: "NLP Processor",
    icon: Cpu,
    description: "Natural language processing and understanding",
    examples: [
      "Parse customer feedback",
      "Sentiment analysis",
      "Text classification",
    ],
  },
  {
    id: "voice",
    name: "Voice Assistant",
    icon: Mic,
    description: "Voice command processing and recognition",
    examples: [
      "Voice navigation commands",
      "Spoken queries",
      "Audio transcription",
    ],
  },
];

const DEMO_WORKFLOWS = [
  {
    id: "marketing_campaign_analysis",
    name: "Marketing Campaign Analysis",
    description:
      "Comprehensive AI-driven marketing campaign performance analysis",
    category: "Marketing",
    estimatedTime: "2-3 minutes",
    steps: 4,
    icon: TrendingUp,
  },
  {
    id: "financial_intelligence_analysis",
    name: "Financial Intelligence Analysis",
    description: "Automated financial analysis and forecasting workflow",
    category: "Financial",
    estimatedTime: "3-4 minutes",
    steps: 4,
    icon: DollarSign,
  },
  {
    id: "content_intelligence_workflow",
    name: "Content Intelligence Workflow",
    description: "AI-powered content analysis and optimization workflow",
    category: "Content",
    estimatedTime: "2-3 minutes",
    steps: 4,
    icon: Brain,
  },
];

export default function AIOrchestrationalDemoPage() {
  // State management
  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
  const [activeTab, setActiveTab] = useState<
    "assistant" | "workflow" | "monitor"
  >("assistant");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [workflowStatus, setWorkflowStatus] = useState<
    "idle" | "running" | "completed" | "error"
  >("idle");

  // Mock system status
  const [systemStatus] = useState({
    totalRequests: 1247,
    successRate: 98.2,
    avgResponseTime: 1350,
    activeWorkflows: 2,
    assistantsOnline: 7,
    assistantsOffline: 1,
  });

  // Handle assistant test
  const handleAssistantTest = async () => {
    if (!selectedAssistant || !query.trim()) return;

    setIsLoading(true);
    setDemoResult(null);

    try {
      // Simulate API call
      await new Promise(resolve =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      // Mock successful response
      const mockResult: DemoResult = {
        success: true,
        response: {
          answer: `This is a simulated response from the ${AI_ASSISTANT_TYPES.find(t => t.id === selectedAssistant)?.name} for your query: "${query}". The AI has processed your request and provided intelligent insights based on the available data and context.`,
          confidence: 0.85 + Math.random() * 0.1,
          sources: [
            "Dashboard Analytics",
            "Historical Data",
            "Real-time Metrics",
          ],
          insights: [
            "Key pattern identified in the data",
            "Recommendation for optimization",
            "Correlation with external factors",
          ],
        },
        metadata: {
          processingTime: 1000 + Math.random() * 2000,
          assistantsUsed: [selectedAssistant],
          qualityScore: 0.8 + Math.random() * 0.15,
        },
      };

      setDemoResult(mockResult);
    } catch (error) {
      setDemoResult({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle workflow execution
  const handleWorkflowExecution = async () => {
    if (!selectedWorkflow) return;

    setWorkflowStatus("running");

    try {
      // Simulate workflow execution
      await new Promise(resolve =>
        setTimeout(resolve, 3000 + Math.random() * 2000)
      );
      setWorkflowStatus("completed");

      // Reset after a delay
      setTimeout(() => setWorkflowStatus("idle"), 3000);
    } catch (error) {
      setWorkflowStatus("error");
      setTimeout(() => setWorkflowStatus("idle"), 3000);
    }
  };

  // Quick demo queries
  const handleQuickDemo = (assistantId: string, exampleQuery: string) => {
    setSelectedAssistant(assistantId);
    setQuery(exampleQuery);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 dark">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Orchestration Demo
            </h1>
          </div>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Experience the power of coordinated AI assistants working together
            to provide intelligent insights and automate complex workflows in
            the SKC BI Dashboard.
          </p>
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-300 border-purple-500/30"
          >
            Task 80.6: Connect and Orchestrate AI Assistants
          </Badge>
        </div>

        {/* System Status Overview */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-green-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {systemStatus.totalRequests}
                </p>
                <p className="text-sm text-slate-400">Total Requests</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {systemStatus.successRate}%
                </p>
                <p className="text-sm text-slate-400">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {systemStatus.avgResponseTime}ms
                </p>
                <p className="text-sm text-slate-400">Avg Response</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {systemStatus.activeWorkflows}
                </p>
                <p className="text-sm text-slate-400">Active Workflows</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {systemStatus.assistantsOnline}
                </p>
                <p className="text-sm text-slate-400">Assistants Online</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">
                  {systemStatus.assistantsOffline}
                </p>
                <p className="text-sm text-slate-400">Assistants Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Demo Interface */}
        <Tabs
          value={activeTab}
          onValueChange={(value: any) => setActiveTab(value)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger
              value="assistant"
              className="data-[state=active]:bg-slate-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Assistant Test
            </TabsTrigger>
            <TabsTrigger
              value="workflow"
              className="data-[state=active]:bg-slate-700"
            >
              <Workflow className="h-4 w-4 mr-2" />
              Workflow Demo
            </TabsTrigger>
            <TabsTrigger
              value="monitor"
              className="data-[state=active]:bg-slate-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Live Monitoring
            </TabsTrigger>
          </TabsList>

          {/* AI Assistant Test Tab */}
          <TabsContent value="assistant" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assistant Selection & Query */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-400" />
                    Test AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Select AI Assistant
                    </label>
                    <Select
                      value={selectedAssistant}
                      onValueChange={setSelectedAssistant}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Choose an AI assistant to test" />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_ASSISTANT_TYPES.map(assistant => {
                          const Icon = assistant.icon;
                          return (
                            <SelectItem key={assistant.id} value={assistant.id}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {assistant.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Query
                    </label>
                    <Input
                      placeholder="Enter your question or request..."
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      className="bg-slate-800 border-slate-600"
                      onKeyDown={e => {
                        if (e.key === "Enter" && !isLoading) {
                          handleAssistantTest();
                        }
                      }}
                    />
                  </div>

                  <Button
                    onClick={handleAssistantTest}
                    disabled={!selectedAssistant || !query.trim() || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Test AI Assistant
                      </>
                    )}
                  </Button>

                  {/* Quick Examples */}
                  {selectedAssistant && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-400 mb-2">
                        Quick Examples:
                      </p>
                      <div className="space-y-2">
                        {AI_ASSISTANT_TYPES.find(
                          t => t.id === selectedAssistant
                        )?.examples.map((example, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuickDemo(selectedAssistant, example)
                            }
                            className="text-xs text-left w-full bg-slate-800/50 border-slate-600 hover:bg-slate-700"
                          >
                            {example}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Response */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-400" />
                    AI Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {demoResult ? (
                    demoResult.success ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-300">
                            {demoResult.response.answer}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Badge variant="outline" className="justify-center">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-green-400" />
                            {(demoResult.response.confidence * 100).toFixed(1)}%
                            confidence
                          </Badge>
                          <Badge variant="outline" className="justify-center">
                            <Clock className="h-3 w-3 mr-1 text-blue-400" />
                            {demoResult.metadata?.processingTime.toFixed(0)}ms
                          </Badge>
                          <Badge variant="outline" className="justify-center">
                            <Target className="h-3 w-3 mr-1 text-purple-400" />
                            {(
                              (demoResult.metadata?.qualityScore ?? 0) * 100
                            ).toFixed(1)}
                            % quality
                          </Badge>
                        </div>

                        {demoResult.response.insights && (
                          <div>
                            <p className="text-sm text-slate-400 mb-2">
                              Key Insights:
                            </p>
                            <ul className="space-y-1">
                              {demoResult.response.insights.map(
                                (insight: string, index: number) => (
                                  <li
                                    key={index}
                                    className="text-sm text-slate-300 flex items-start gap-2"
                                  >
                                    <ArrowRight className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                    {insight}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {demoResult.response.sources && (
                          <div>
                            <p className="text-sm text-slate-400 mb-2">
                              Data Sources:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {demoResult.response.sources.map(
                                (source: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {source}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert className="border-red-500/50 bg-red-500/10">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-200">
                          {demoResult.error}
                        </AlertDescription>
                      </Alert>
                    )
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        Select an AI assistant and enter a query to see the
                        orchestrated response
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Available AI Assistants */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Available AI Assistants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {AI_ASSISTANT_TYPES.map(assistant => {
                    const Icon = assistant.icon;
                    const isSelected = selectedAssistant === assistant.id;
                    const isOnline = assistant.id !== "voice"; // Mock voice as offline

                    return (
                      <div
                        key={assistant.id}
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all",
                          isSelected
                            ? "bg-blue-500/20 border-blue-500/50"
                            : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50",
                          !isOnline && "opacity-60"
                        )}
                        onClick={() => setSelectedAssistant(assistant.id)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                            <Icon className="h-5 w-5 text-slate-300" />
                            <div
                              className={cn(
                                "absolute -top-1 -right-1 w-3 h-3 rounded-full",
                                isOnline ? "bg-green-500" : "bg-red-500"
                              )}
                            />
                          </div>
                          <h3 className="font-medium text-white text-sm">
                            {assistant.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400">
                          {assistant.description}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflow Demo Tab */}
          <TabsContent value="workflow" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workflow Selection */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-purple-400" />
                    Execute AI Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Select Workflow
                    </label>
                    <Select
                      value={selectedWorkflow}
                      onValueChange={setSelectedWorkflow}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Choose a workflow to execute" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEMO_WORKFLOWS.map(workflow => {
                          const Icon = workflow.icon;
                          return (
                            <SelectItem key={workflow.id} value={workflow.id}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {workflow.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedWorkflow && (
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      {(() => {
                        const workflow = DEMO_WORKFLOWS.find(
                          w => w.id === selectedWorkflow
                        );
                        const Icon = workflow?.icon || Workflow;
                        return (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="h-5 w-5 text-purple-400" />
                              <h3 className="font-medium text-white">
                                {workflow?.name}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">
                              {workflow?.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>{workflow?.steps} steps</span>
                              <span>•</span>
                              <span>{workflow?.estimatedTime}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {workflow?.category}
                              </Badge>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <Button
                    onClick={handleWorkflowExecution}
                    disabled={!selectedWorkflow || workflowStatus === "running"}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {workflowStatus === "running" ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Executing Workflow...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Workflow
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Workflow Status */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    Workflow Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status:</span>
                      <Badge
                        className={cn(
                          workflowStatus === "idle" &&
                            "bg-gray-500/20 text-gray-400",
                          workflowStatus === "running" &&
                            "bg-blue-500/20 text-blue-400",
                          workflowStatus === "completed" &&
                            "bg-green-500/20 text-green-400",
                          workflowStatus === "error" &&
                            "bg-red-500/20 text-red-400"
                        )}
                      >
                        {workflowStatus === "idle" && "Ready"}
                        {workflowStatus === "running" && "Executing"}
                        {workflowStatus === "completed" && "Completed"}
                        {workflowStatus === "error" && "Error"}
                      </Badge>
                    </div>

                    {workflowStatus === "running" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white">Step 2 of 4</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full w-1/2 transition-all duration-1000"></div>
                        </div>
                        <p className="text-sm text-slate-400">
                          Processing: Data analysis and pattern recognition...
                        </p>
                      </div>
                    )}

                    {workflowStatus === "completed" && (
                      <Alert className="border-green-500/50 bg-green-500/10">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription className="text-green-200">
                          Workflow completed successfully! All AI assistants
                          have contributed to the analysis.
                        </AlertDescription>
                      </Alert>
                    )}

                    {workflowStatus === "error" && (
                      <Alert className="border-red-500/50 bg-red-500/10">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-200">
                          Workflow execution failed. Please try again or contact
                          support.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Available Workflows */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-yellow-400" />
                  Available AI Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DEMO_WORKFLOWS.map(workflow => {
                    const Icon = workflow.icon;
                    const isSelected = selectedWorkflow === workflow.id;

                    return (
                      <div
                        key={workflow.id}
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all",
                          isSelected
                            ? "bg-purple-500/20 border-purple-500/50"
                            : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
                        )}
                        onClick={() => setSelectedWorkflow(workflow.id)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className="h-6 w-6 text-purple-400" />
                          <h3 className="font-medium text-white">
                            {workflow.name}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">
                          {workflow.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {workflow.category}
                          </Badge>
                          <div className="text-xs text-slate-500">
                            {workflow.steps} steps • {workflow.estimatedTime}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Monitoring Tab */}
          <TabsContent value="monitor" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Live Monitoring Dashboard
              </h3>
              <p className="text-slate-400 mb-4">
                Real-time monitoring of AI orchestration system performance and
                metrics
              </p>
              <Badge
                variant="outline"
                className="bg-blue-500/10 text-blue-300 border-blue-500/30"
              >
                Coming Soon in Future Update
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
