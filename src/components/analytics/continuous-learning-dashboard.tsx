"use client";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Lightbulb,
  Target,
  Clock,
  Database,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

interface LearningMetrics {
  model_accuracy: number;
  improvement_rate: number;
  prediction_confidence: number;
  engagement_improvement: number;
  roi_improvement: number;
  learning_velocity: number;
  data_quality_score: number;
  adaptation_speed: number;
}

interface LearningInsight {
  insight_id: string;
  insight_type:
    | "pattern_discovery"
    | "performance_drift"
    | "optimization_opportunity"
    | "anomaly_detection";
  confidence_score: number;
  impact_level: "low" | "medium" | "high" | "critical";
  description: string;
  recommended_actions: string[];
  affected_models: string[];
  discovery_timestamp: string;
}

interface ModelUpdate {
  update_id: string;
  model_version: string;
  performance_improvement: number;
  accuracy_delta: number;
  training_data_size: number;
  update_timestamp: string;
  validation_metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    mae: number;
    rmse: number;
  };
  deployment_status: "pending" | "deployed" | "failed" | "rollback";
}

interface LearningStatus {
  is_active: boolean;
  last_update: string;
  next_scheduled_update: string;
  pending_feedback_count: number;
}

export function ContinuousLearningDashboard() {
  const [loading, setLoading] = useState(true);
  const [learningMetrics, setLearningMetrics] =
    useState<LearningMetrics | null>(null);
  const [learningStatus, setLearningStatus] = useState<LearningStatus | null>(
    null
  );
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [modelUpdates, setModelUpdates] = useState<ModelUpdate[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isStartingLearning, setIsStartingLearning] = useState(false);
  const [isStoppingLearning, setIsStoppingLearning] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLearningData();
    const interval = setInterval(loadLearningData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadLearningData = async () => {
    try {
      setError(null);
      const response = await fetch("/api/continuous-learning?action=metrics");
      const data = await response.json();

      if (data.success) {
        setLearningMetrics(data.data.current_metrics);
        setLearningStatus(data.data.learning_status);
        setInsights(data.data.recent_insights || []);
        setModelUpdates(data.data.model_versions || []);
        setHistoricalData(data.data.historical_performance || []);
      } else {
        setError(data.message || "Failed to load learning data");
      }
    } catch (err) {
      setError("Network error loading learning data");
      console.error("Error loading learning data:", err);
    } finally {
      setLoading(false);
    }
  };

  const startLearningLoop = async () => {
    setIsStartingLearning(true);
    try {
      const response = await fetch("/api/continuous-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start-learning" }),
      });

      const data = await response.json();
      if (data.success) {
        await loadLearningData();
      } else {
        setError(data.message || "Failed to start learning loop");
      }
    } catch (err) {
      setError("Error starting learning loop");
      console.error("Error starting learning:", err);
    } finally {
      setIsStartingLearning(false);
    }
  };

  const stopLearningLoop = async () => {
    setIsStoppingLearning(true);
    try {
      const response = await fetch("/api/continuous-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop-learning" }),
      });

      const data = await response.json();
      if (data.success) {
        await loadLearningData();
      } else {
        setError(data.message || "Failed to stop learning loop");
      }
    } catch (err) {
      setError("Error stopping learning loop");
      console.error("Error stopping learning:", err);
    } finally {
      setIsStoppingLearning(false);
    }
  };

  const triggerRetraining = async () => {
    setIsRetraining(true);
    try {
      const response = await fetch("/api/continuous-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger-retraining", force: true }),
      });

      const data = await response.json();
      if (data.success) {
        await loadLearningData();
      } else {
        setError(data.message || "Failed to trigger retraining");
      }
    } catch (err) {
      setError("Error triggering retraining");
      console.error("Error triggering retraining:", err);
    } finally {
      setIsRetraining(false);
    }
  };

  const simulateLearningCycle = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/continuous-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate-learning-cycle" }),
      });

      const data = await response.json();
      if (data.success) {
        await loadLearningData();
      } else {
        setError(data.message || "Failed to simulate learning cycle");
      }
    } catch (err) {
      setError("Error simulating learning cycle");
      console.error("Error simulating learning cycle:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern_discovery":
        return <Lightbulb className="h-4 w-4" />;
      case "performance_drift":
        return <AlertTriangle className="h-4 w-4" />;
      case "optimization_opportunity":
        return <Target className="h-4 w-4" />;
      case "anomaly_detection":
        return <Eye className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading && !learningMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading continuous learning data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Learning Status & Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Learning System Status
              </CardTitle>
              <CardDescription>
                Monitor and control the continuous learning loop
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={learningStatus?.is_active ? "default" : "secondary"}
              >
                {learningStatus?.is_active ? "Active" : "Inactive"}
              </Badge>
              {learningStatus?.is_active ? (
                <NormalButton
                  onClick={stopLearningLoop}
                  disabled={isStoppingLearning}
                  variant="outline"
                  size="sm"
                >
                  {isStoppingLearning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                  Stop Learning
                </NormalButton>
              ) : (
                <NormalButton
                  onClick={startLearningLoop}
                  disabled={isStartingLearning}
                  size="sm"
                >
                  {isStartingLearning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Start Learning
                </NormalButton>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Last Update</span>
              </div>
              <p className="text-sm text-gray-600">
                {learningStatus?.last_update
                  ? new Date(learningStatus.last_update).toLocaleString()
                  : "Never"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Next Update</span>
              </div>
              <p className="text-sm text-gray-600">
                {learningStatus?.next_scheduled_update
                  ? new Date(
                      learningStatus.next_scheduled_update
                    ).toLocaleString()
                  : "Not scheduled"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Pending Feedback</span>
              </div>
              <p className="text-sm text-gray-600">
                {learningStatus?.pending_feedback_count || 0} items
              </p>
            </div>
            <div className="space-y-2">
              <NormalButton
                onClick={triggerRetraining}
                disabled={isRetraining}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isRetraining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Force Retrain
              </NormalButton>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="insights">Learning Insights</TabsTrigger>
          <TabsTrigger value="models">Model Updates</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          <TabsTrigger value="testing">Testing & Demo</TabsTrigger>
        </TabsList>

        {/* Performance Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Model Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {((learningMetrics?.model_accuracy || 0) * 100).toFixed(1)}%
                  </div>
                  <Progress
                    value={(learningMetrics?.model_accuracy || 0) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Improvement Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {((learningMetrics?.improvement_rate || 0) * 100).toFixed(
                      2
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">
                    {learningMetrics?.improvement_rate &&
                    learningMetrics.improvement_rate > 0
                      ? "Improving"
                      : "Stable"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  Prediction Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {(
                      (learningMetrics?.prediction_confidence || 0) * 100
                    ).toFixed(1)}
                    %
                  </div>
                  <Progress
                    value={(learningMetrics?.prediction_confidence || 0) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  ROI Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {((learningMetrics?.roi_improvement || 0) * 100).toFixed(1)}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Business Impact</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Velocity & Adaptation</CardTitle>
                <CardDescription>
                  How quickly the system learns and adapts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Learning Velocity</span>
                    <span className="text-sm font-medium">
                      {(
                        (learningMetrics?.learning_velocity || 0) * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(learningMetrics?.learning_velocity || 0) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Adaptation Speed</span>
                    <span className="text-sm font-medium">
                      {((learningMetrics?.adaptation_speed || 0) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(learningMetrics?.adaptation_speed || 0) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality & Engagement</CardTitle>
                <CardDescription>
                  Quality of training data and engagement improvements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Data Quality Score</span>
                    <span className="text-sm font-medium">
                      {(
                        (learningMetrics?.data_quality_score || 0) * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(learningMetrics?.data_quality_score || 0) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Engagement Improvement</span>
                    <span className="text-sm font-medium">
                      {(
                        (learningMetrics?.engagement_improvement || 0) * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(learningMetrics?.engagement_improvement || 0) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Learning Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recent Learning Insights
              </CardTitle>
              <CardDescription>
                AI-discovered patterns, opportunities, and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No insights discovered yet. Start the learning loop to begin
                  discovering insights.
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map(insight => (
                    <div
                      key={insight.insight_id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getInsightIcon(insight.insight_type)}
                          <Badge variant={getImpactColor(insight.impact_level)}>
                            {insight.impact_level}
                          </Badge>
                          <span className="text-sm text-gray-600 capitalize">
                            {insight.insight_type.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Confidence:{" "}
                          {(insight.confidence_score * 100).toFixed(0)}%
                        </div>
                      </div>

                      <p className="text-sm">{insight.description}</p>

                      {insight.recommended_actions.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            Recommended Actions:
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {insight.recommended_actions.map(
                              (action, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-blue-500 mt-1">•</span>
                                  {action}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Discovered:{" "}
                        {new Date(insight.discovery_timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Updates Tab */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Model Update History
              </CardTitle>
              <CardDescription>
                Track model versions, performance improvements, and deployment
                status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelUpdates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No model updates yet. Trigger retraining to see updates here.
                </div>
              ) : (
                <div className="space-y-4">
                  {modelUpdates.map(update => (
                    <div
                      key={update.update_id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {update.model_version}
                          </Badge>
                          <Badge
                            variant={
                              update.deployment_status === "deployed"
                                ? "default"
                                : update.deployment_status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {update.deployment_status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(update.update_timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Improvement</div>
                          <div className="text-green-600">
                            +{(update.performance_improvement * 100).toFixed(2)}
                            %
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Training Data</div>
                          <div>
                            {update.training_data_size.toLocaleString()} samples
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">F1 Score</div>
                          <div>
                            {update.validation_metrics.f1_score.toFixed(3)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Precision</div>
                          <div>
                            {update.validation_metrics.precision.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historical Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Historical performance metrics and learning progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historicalData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No historical data available yet. Learning metrics will appear
                  here over time.
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="recorded_at"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString()
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={value =>
                          new Date(value).toLocaleString()
                        }
                        formatter={(value: any) => [
                          `${(value * 100).toFixed(1)}%`,
                          "Accuracy",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="metrics.model_accuracy"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Model Accuracy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing & Demo Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Testing & Demonstration
              </CardTitle>
              <CardDescription>
                Test the continuous learning system with simulated data and
                scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NormalButton
                  onClick={simulateLearningCycle}
                  disabled={loading}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Activity className="h-5 w-5" />
                  )}
                  <span>Simulate Learning Cycle</span>
                  <span className="text-xs text-gray-500">
                    Process 50 feedback items
                  </span>
                </NormalButton>

                <NormalButton
                  onClick={() =>
                    window.open(
                      "/api/continuous-learning?action=demo",
                      "_blank"
                    )
                  }
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <Eye className="h-5 w-5" />
                  <span>View Demo Data</span>
                  <span className="text-xs text-gray-500">
                    See API response format
                  </span>
                </NormalButton>
              </div>

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  Use the simulation tools to test how the learning system
                  responds to different scenarios. This helps validate the
                  continuous improvement capabilities without waiting for real
                  data.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
