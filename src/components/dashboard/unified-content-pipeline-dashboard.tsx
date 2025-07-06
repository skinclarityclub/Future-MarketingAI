"use client";

/**
 * Unified Content Pipeline Dashboard
 * Task 80.7: Unify Content Pipeline (Research to Publishing)
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  Lightbulb,
  PenTool,
  Play,
  Rocket,
  Send,
  Settings,
  TrendingUp,
  Users,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";

// Types
interface ContentPipelineItem {
  id: string;
  title: string;
  description?: string;
  campaign_id?: string;
  content_type: string;
  target_platforms: string[];
  target_audience: string[];
  keywords: string[];
  brand_voice: string;
  urgency: string;
  current_stage: string;
  status: string;
  stages: PipelineStageProgress[];
  metrics: PipelineMetrics;
  created_at: string;
  updated_at: string;
  scheduled_publish_date?: string;
  approval_required: boolean;
  assigned_to?: string;
}

interface PipelineStageProgress {
  stage: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  output_data?: any;
  error_message?: string;
  assigned_to?: string;
  dependencies_met: boolean;
}

interface PipelineMetrics {
  total_duration_ms: number;
  stage_durations: Record<string, number>;
  quality_score: number;
  performance_prediction: number;
  cost_estimate: number;
  roi_projection: number;
  bottlenecks: string[];
  optimization_opportunities: string[];
}

interface PipelineOverviewMetrics {
  total_pipelines: number;
  active_pipelines: number;
  completed_pipelines: number;
  failed_pipelines: number;
  average_completion_time: number;
  stage_bottlenecks: { stage: string; count: number }[];
  success_rate: number;
}

const STAGE_ICONS = {
  research: <Lightbulb className="h-4 w-4" />,
  ideation: <Zap className="h-4 w-4" />,
  creation: <PenTool className="h-4 w-4" />,
  optimization: <TrendingUp className="h-4 w-4" />,
  approval: <CheckCircle className="h-4 w-4" />,
  scheduling: <Clock className="h-4 w-4" />,
  publishing: <Send className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  learning: <Users className="h-4 w-4" />,
};

const STATUS_COLORS = {
  pending: "bg-yellow-500",
  "in-progress": "bg-blue-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
  blocked: "bg-orange-500",
  cancelled: "bg-gray-500",
};

export default function UnifiedContentPipelineDashboard() {
  const [activePipelines, setActivePipelines] = useState<ContentPipelineItem[]>(
    []
  );
  const [overviewMetrics, setOverviewMetrics] =
    useState<PipelineOverviewMetrics | null>(null);
  const [selectedPipeline, setSelectedPipeline] =
    useState<ContentPipelineItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // New pipeline form state
  const [newPipelineForm, setNewPipelineForm] = useState({
    title: "",
    description: "",
    content_type: "social",
    target_platforms: [] as string[],
    keywords: "",
    brand_voice: "professional",
    urgency: "medium",
    approval_required: true,
  });

  // Load data
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load overview metrics
      const metricsResponse = await fetch(
        "/api/unified-content-pipeline?action=metrics"
      );
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setOverviewMetrics(metricsData.data);
      }

      // Load active pipelines
      const pipelinesResponse = await fetch(
        "/api/unified-content-pipeline?action=active"
      );
      if (pipelinesResponse.ok) {
        const pipelinesData = await pipelinesResponse.json();
        setActivePipelines(pipelinesData.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewPipeline = async () => {
    try {
      const response = await fetch("/api/unified-content-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          ...newPipelineForm,
          target_platforms: newPipelineForm.target_platforms,
          keywords: newPipelineForm.keywords
            .split(",")
            .map(k => k.trim())
            .filter(Boolean),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setActivePipelines(prev => [...prev, result.data]);

        // Reset form
        setNewPipelineForm({
          title: "",
          description: "",
          content_type: "social",
          target_platforms: [],
          keywords: "",
          brand_voice: "professional",
          urgency: "medium",
          approval_required: true,
        });

        setActiveTab("pipelines");
      }
    } catch (error) {
      console.error("Error starting pipeline:", error);
    }
  };

  const cancelPipeline = async (pipelineId: string) => {
    try {
      const response = await fetch("/api/unified-content-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          pipelineId,
        }),
      });

      if (response.ok) {
        setActivePipelines(prev => prev.filter(p => p.id !== pipelineId));
        if (selectedPipeline?.id === pipelineId) {
          setSelectedPipeline(null);
        }
      }
    } catch (error) {
      console.error("Error cancelling pipeline:", error);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStageProgress = (pipeline: ContentPipelineItem): number => {
    const completedStages = pipeline.stages.filter(
      s => s.status === "completed"
    ).length;
    return (completedStages / pipeline.stages.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading pipeline dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 dark:bg-gray-900 dark:text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Unified Content Pipeline
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Seamlessly orchestrate content from research to publishing with
          AI-powered automation and intelligent workflow management.
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800">
          <TabsTrigger
            value="overview"
            className="dark:data-[state=active]:bg-gray-700"
          >
            <Workflow className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="pipelines"
            className="dark:data-[state=active]:bg-gray-700"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Active Pipelines
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="dark:data-[state=active]:bg-gray-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Create Pipeline
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="dark:data-[state=active]:bg-gray-700"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {overviewMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">
                      Total Pipelines
                    </CardTitle>
                    <Workflow className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">
                      {overviewMetrics.total_pipelines}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {overviewMetrics.active_pipelines} active
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">
                      Success Rate
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">
                      {(overviewMetrics.success_rate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {overviewMetrics.completed_pipelines} completed
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">
                      Avg. Completion
                    </CardTitle>
                    <Clock className="h-4 w-4 text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">
                      {formatDuration(overviewMetrics.average_completion_time)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Per pipeline
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">
                      Failed Pipelines
                    </CardTitle>
                    <XCircle className="h-4 w-4 text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">
                      {overviewMetrics.failed_pipelines}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Need attention
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {overviewMetrics?.stage_bottlenecks &&
            overviewMetrics.stage_bottlenecks.length > 0 && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    Stage Bottlenecks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overviewMetrics.stage_bottlenecks.map(
                      (bottleneck, index) => (
                        <div
                          key={bottleneck.stage}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {
                              STAGE_ICONS[
                                bottleneck.stage as keyof typeof STAGE_ICONS
                              ]
                            }
                            <span className="capitalize dark:text-gray-200">
                              {bottleneck.stage}
                            </span>
                          </div>
                          <Badge variant="destructive">
                            {bottleneck.count} blocked
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-6">
          <div className="grid gap-6">
            {activePipelines.length === 0 ? (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="text-center py-12">
                  <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium dark:text-white mb-2">
                    No Active Pipelines
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start your first content pipeline to see it here.
                  </p>
                  <NormalButton
                    onClick={() => setActiveTab("create")}
                    className="dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Create Pipeline
                  </NormalButton>
                </CardContent>
              </Card>
            ) : (
              activePipelines.map(pipeline => (
                <motion.div
                  key={pipeline.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${STATUS_COLORS[pipeline.status as keyof typeof STATUS_COLORS]}`}
                          />
                          <div>
                            <CardTitle className="dark:text-white">
                              {pipeline.title}
                            </CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {pipeline.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="dark:border-gray-600 dark:text-gray-300"
                          >
                            {pipeline.content_type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="dark:border-gray-600 dark:text-gray-300"
                          >
                            {pipeline.urgency}
                          </Badge>
                          <NormalButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPipeline(pipeline)}
                            className="dark:hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4" />
                          </NormalButton>
                          <NormalButton
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelPipeline(pipeline.id)}
                            className="dark:hover:bg-gray-700 text-red-400 hover:text-red-300"
                          >
                            <XCircle className="h-4 w-4" />
                          </NormalButton>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="dark:text-gray-300">
                            Current Stage:{" "}
                            <span className="capitalize font-medium">
                              {pipeline.current_stage}
                            </span>
                          </span>
                          <span className="dark:text-gray-300">
                            Progress: {getStageProgress(pipeline).toFixed(0)}%
                          </span>
                        </div>

                        <Progress
                          value={getStageProgress(pipeline)}
                          className="h-2"
                        />

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            Quality Score:{" "}
                            {(pipeline.metrics.quality_score * 100).toFixed(0)}%
                          </span>
                          <span>
                            ROI Projection:{" "}
                            {(pipeline.metrics.roi_projection * 100).toFixed(0)}
                            %
                          </span>
                          <span>
                            Created:{" "}
                            {new Date(pipeline.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {pipeline.target_platforms.map(platform => (
                            <Badge
                              key={platform}
                              variant="secondary"
                              className="text-xs dark:bg-gray-700 dark:text-gray-300"
                            >
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Create New Content Pipeline
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400">
                Start a new automated content workflow from research to
                publishing.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="dark:text-gray-200">
                      Content Title *
                    </Label>
                    <Input
                      id="title"
                      value={newPipelineForm.title}
                      onChange={e =>
                        setNewPipelineForm(prev => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g., Ultimate Guide to AI Marketing"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="dark:text-gray-200">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newPipelineForm.description}
                      onChange={e =>
                        setNewPipelineForm(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe the content goals and target outcomes..."
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="content_type"
                      className="dark:text-gray-200"
                    >
                      Content Type *
                    </Label>
                    <Select
                      value={newPipelineForm.content_type}
                      onValueChange={value =>
                        setNewPipelineForm(prev => ({
                          ...prev,
                          content_type: value,
                        }))
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="email">Email Campaign</SelectItem>
                        <SelectItem value="video">Video Content</SelectItem>
                        <SelectItem value="infographic">Infographic</SelectItem>
                        <SelectItem value="whitepaper">Whitepaper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="keywords" className="dark:text-gray-200">
                      Keywords
                    </Label>
                    <Input
                      id="keywords"
                      value={newPipelineForm.keywords}
                      onChange={e =>
                        setNewPipelineForm(prev => ({
                          ...prev,
                          keywords: e.target.value,
                        }))
                      }
                      placeholder="AI marketing, automation, lead generation"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Separate keywords with commas
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="brand_voice" className="dark:text-gray-200">
                      Brand Voice
                    </Label>
                    <Select
                      value={newPipelineForm.brand_voice}
                      onValueChange={value =>
                        setNewPipelineForm(prev => ({
                          ...prev,
                          brand_voice: value,
                        }))
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="professional">
                          Professional
                        </SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="authoritative">
                          Authoritative
                        </SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="urgency" className="dark:text-gray-200">
                      Urgency Level
                    </Label>
                    <Select
                      value={newPipelineForm.urgency}
                      onValueChange={value =>
                        setNewPipelineForm(prev => ({
                          ...prev,
                          urgency: value,
                        }))
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="dark:text-gray-200">
                      Target Platforms
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        "linkedin",
                        "twitter",
                        "facebook",
                        "instagram",
                        "email",
                        "blog",
                      ].map(platform => (
                        <div
                          key={platform}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={platform}
                            title={`Select ${platform} platform`}
                            checked={newPipelineForm.target_platforms.includes(
                              platform
                            )}
                            onChange={e => {
                              if (e.target.checked) {
                                setNewPipelineForm(prev => ({
                                  ...prev,
                                  target_platforms: [
                                    ...prev.target_platforms,
                                    platform,
                                  ],
                                }));
                              } else {
                                setNewPipelineForm(prev => ({
                                  ...prev,
                                  target_platforms:
                                    prev.target_platforms.filter(
                                      p => p !== platform
                                    ),
                                }));
                              }
                            }}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                          <Label
                            htmlFor={platform}
                            className="text-sm capitalize dark:text-gray-300"
                          >
                            {platform}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="approval_required"
                      checked={newPipelineForm.approval_required}
                      onCheckedChange={checked =>
                        setNewPipelineForm(prev => ({
                          ...prev,
                          approval_required: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="approval_required"
                      className="dark:text-gray-200"
                    >
                      Require Approval
                    </Label>
                  </div>
                </div>
              </div>

              <Separator className="dark:border-gray-700" />

              <div className="flex justify-end">
                <NormalButton
                  onClick={startNewPipeline}
                  disabled={
                    !newPipelineForm.title || !newPipelineForm.content_type
                  }
                  className="dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Pipeline
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Pipeline Analytics
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400">
                Comprehensive insights into pipeline performance and
                optimization opportunities.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium dark:text-white mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Advanced analytics and reporting features are in development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pipeline Detail Modal */}
      <AnimatePresence>
        {selectedPipeline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPipeline(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold dark:text-white">
                    {selectedPipeline.title}
                  </h2>
                  <NormalButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPipeline(null)}
                    className="dark:hover:bg-gray-700"
                  >
                    <XCircle className="h-4 w-4" />
                  </NormalButton>
                </div>
              </div>

              <ScrollArea className="h-96 p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3 dark:text-white">
                      Pipeline Stages
                    </h3>
                    <div className="space-y-3">
                      {selectedPipeline.stages.map((stage, index) => (
                        <div
                          key={stage.stage}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${STATUS_COLORS[stage.status as keyof typeof STATUS_COLORS]}`}
                          >
                            {
                              STAGE_ICONS[
                                stage.stage as keyof typeof STAGE_ICONS
                              ]
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium capitalize dark:text-white">
                                {stage.stage}
                              </span>
                              <Badge
                                variant={
                                  stage.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {stage.status}
                              </Badge>
                            </div>
                            {stage.duration_ms && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Duration: {formatDuration(stage.duration_ms)}
                              </p>
                            )}
                            {stage.error_message && (
                              <p className="text-sm text-red-500">
                                Error: {stage.error_message}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="dark:border-gray-700" />

                  <div>
                    <h3 className="font-medium mb-3 dark:text-white">
                      Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Quality Score
                        </p>
                        <p className="font-medium dark:text-white">
                          {(
                            selectedPipeline.metrics.quality_score * 100
                          ).toFixed(0)}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Performance Prediction
                        </p>
                        <p className="font-medium dark:text-white">
                          {(
                            selectedPipeline.metrics.performance_prediction *
                            100
                          ).toFixed(0)}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ROI Projection
                        </p>
                        <p className="font-medium dark:text-white">
                          {(
                            selectedPipeline.metrics.roi_projection * 100
                          ).toFixed(0)}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cost Estimate
                        </p>
                        <p className="font-medium dark:text-white">
                          ${selectedPipeline.metrics.cost_estimate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
