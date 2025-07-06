"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/lib/i18n/context";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  ScatterChart,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  Brain,
  Target,
  Activity,
  Zap,
  Database,
  Cpu,
  Clock,
  RefreshCw,
  BarChart3,
  Settings,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/premium-loading";

interface TacticalInsight {
  id: string;
  type: "trend_analysis" | "anomaly_detection" | "forecast" | "optimization";
  insight: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  category: string;
  timestamp: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
  };
  metadata: Record<string, unknown>;
}

interface MLPrediction {
  id: string;
  model_type: string;
  predicted_value: number;
  confidence_interval: [number, number];
  timestamp: string;
  features_used: string[];
  model_accuracy: number;
  trend: "increasing" | "decreasing" | "stable";
  seasonality_detected: boolean;
  anomaly_score: number;
}

interface DataIntegrationStatus {
  source: string;
  status: "healthy" | "warning" | "error";
  last_sync: string;
  records_count: number;
  data_quality_score: number;
  latency_ms: number;
  error_rate: number;
  throughput: number;
}

interface PerformanceMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  response_time: number;
  throughput: number;
  error_rate: number;
  cache_hit_rate: number;
  queue_size: number;
  active_connections: number;
}

interface ComplexAnalytics {
  correlation_matrix: Array<{
    variable1: string;
    variable2: string;
    correlation: number;
  }>;
  feature_importance: Array<{
    feature: string;
    importance: number;
    impact: "positive" | "negative";
  }>;
  model_performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    auc_roc: number;
  };
  data_drift: {
    detected: boolean;
    drift_score: number;
    affected_features: string[];
  };
}

const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
  "#ffb347",
  "#87ceeb",
];

export function TacticalAnalysisDashboard() {
  const { t } = useLocale();
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [insights, setInsights] = useState<TacticalInsight[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("insights");
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataStatus, setDataStatus] = useState<DataIntegrationStatus[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics[]>([]);
  const [analytics, setAnalytics] = useState<ComplexAnalytics | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [insightsRes, predictionsRes, statusRes, performanceRes] =
        await Promise.all([
          fetch("/api/tactical-analysis/ml-predictions"),
          fetch("/api/tactical-analysis/ml-predictions"),
          fetch("/api/tactical-analysis/data-integration"),
          fetch("/api/tactical-analysis/performance"),
        ]);

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.insights || []);
      }

      if (predictionsRes.ok) {
        const data = await predictionsRes.json();
        setPredictions(data.predictions || []);
      }

      if (statusRes.ok) {
        const data = await statusRes.json();
        setDataStatus(data.sources || []);
      }

      if (performanceRes.ok) {
        const data = await performanceRes.json();
        setPerformance(data.metrics || []);
      }

      // Simulate complex analytics data
      setAnalytics({
        correlation_matrix: [
          { variable1: "revenue", variable2: "engagement", correlation: 0.85 },
          { variable1: "churn", variable2: "satisfaction", correlation: -0.73 },
          { variable1: "usage", variable2: "retention", correlation: 0.91 },
        ],
        feature_importance: [
          { feature: "user_engagement", importance: 0.85, impact: "positive" },
          { feature: "support_tickets", importance: 0.72, impact: "negative" },
          { feature: "feature_usage", importance: 0.68, impact: "positive" },
          { feature: "payment_delays", importance: 0.63, impact: "negative" },
        ],
        model_performance: {
          accuracy: 0.94,
          precision: 0.91,
          recall: 0.89,
          f1_score: 0.9,
          auc_roc: 0.96,
        },
        data_drift: {
          detected: false,
          drift_score: 0.12,
          affected_features: [],
        },
      });

      setError(null);
    } catch (_err) {
      // Error fetching tactical analysis data
      setError("Failed to load tactical analysis data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, handleRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const overallHealthScore = Math.round(
    dataStatus.reduce((acc, source) => acc + source.data_quality_score, 0) /
      Math.max(dataStatus.length, 1)
  );

  const avgModelAccuracy = Math.round(
    (predictions.reduce((acc, pred) => acc + pred.model_accuracy, 0) /
      Math.max(predictions.length, 1)) *
      100
  );

  const criticalInsights = insights.filter(
    insight => insight.impact === "high" && insight.confidence > 0.8
  ).length;

  const anomaliesDetected = predictions.filter(
    pred => pred.anomaly_score > 0.7
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tactical Analysis Engine
          </h2>
          <p className="text-muted-foreground">
            Advanced ML-powered business intelligence and predictions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={autoRefresh ? "default" : "secondary"}>
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Badge>
          <NormalButton
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </NormalButton>
          <NormalButton
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </NormalButton>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Health</CardTitle>
            <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {overallHealthScore}%
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {dataStatus.length} sources integrated
            </p>
            <Progress value={overallHealthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Model Accuracy
            </CardTitle>
            <Brain className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {avgModelAccuracy}%
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {predictions.length} active models
            </p>
            <Progress value={avgModelAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Insights
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {criticalInsights}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              High-impact recommendations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
            <Zap className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {anomaliesDetected}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Detected this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">ML Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="integration">Data Integration</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {t("dashboard.tacticalAnalysis.criticalBusinessInsights")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.tacticalAnalysis.aiGeneratedInsights")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.length > 0 ? (
                    insights
                      .filter(insight => insight.confidence > 0.7)
                      .slice(0, 5)
                      .map(insight => (
                        <div
                          key={insight.id}
                          className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                        >
                          <div className="flex-shrink-0">
                            {insight.impact === "high" ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : insight.impact === "medium" ? (
                              <Target className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant={
                                  insight.impact === "high"
                                    ? "destructive"
                                    : insight.impact === "medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {insight.impact.toUpperCase()} IMPACT
                              </Badge>
                              <Badge variant="outline">
                                {Math.round(insight.confidence * 100)}%
                                confident
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {insight.category}
                            </p>
                            <p className="font-medium">{insight.insight}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                Type: {insight.type.replace("_", " ")}
                              </span>
                              <span>
                                Generated:{" "}
                                {new Date(insight.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t("dashboard.tacticalAnalysis.noInsightsAvailable")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Insights Analytics */}
            {insights.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Insight Categories</CardTitle>
                    <CardDescription>
                      Distribution of insights by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            insights.reduce(
                              (acc, insight) => {
                                acc[insight.category] =
                                  (acc[insight.category] || 0) + 1;
                                return acc;
                              },
                              {} as Record<string, number>
                            )
                          ).map(([category, count]) => ({
                            name: category,
                            value: count,
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label
                        >
                          {insights.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Confidence vs Impact</CardTitle>
                    <CardDescription>
                      Scatter plot of insight confidence and impact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <ScatterChart
                        data={insights.map(insight => ({
                          confidence: insight.confidence * 100,
                          impact:
                            insight.impact === "high"
                              ? 3
                              : insight.impact === "medium"
                                ? 2
                                : 1,
                          category: insight.category,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="confidence"
                          name="Confidence"
                          unit="%"
                          domain={[0, 100]}
                        />
                        <YAxis
                          dataKey="impact"
                          name="Impact"
                          domain={[0, 4]}
                          tickFormatter={value =>
                            value === 3
                              ? "High"
                              : value === 2
                                ? "Medium"
                                : "Low"
                          }
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            name === "confidence" ? `${value}%` : value,
                            name === "confidence" ? "Confidence" : "Impact",
                          ]}
                        />
                        <Scatter dataKey="impact" fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ML Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictions.length > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Prediction Trends</CardTitle>
                    <CardDescription>
                      ML model predictions over time with confidence intervals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={predictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={value =>
                            new Date(value).toLocaleDateString()
                          }
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={value =>
                            new Date(value).toLocaleString()
                          }
                        />
                        <Area
                          dataKey="confidence_interval"
                          fill="#8884d8"
                          fillOpacity={0.3}
                          stroke="none"
                        />
                        <Line
                          type="monotone"
                          dataKey="predicted_value"
                          stroke="#8884d8"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                        <Bar
                          dataKey="model_accuracy"
                          fill="#82ca9d"
                          fillOpacity={0.6}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Model Performance</CardTitle>
                      <CardDescription>
                        Average accuracy by model type
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={Object.entries(
                            predictions.reduce(
                              (acc, pred) => {
                                if (!acc[pred.model_type]) {
                                  acc[pred.model_type] = [];
                                }
                                acc[pred.model_type].push(pred.model_accuracy);
                                return acc;
                              },
                              {} as Record<string, number[]>
                            )
                          ).map(([model, accuracies]) => ({
                            model,
                            accuracy:
                              accuracies.reduce((a, b) => a + b, 0) /
                              accuracies.length,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="model" />
                          <YAxis domain={[0, 1]} />
                          <Tooltip
                            formatter={(value: number) => [
                              `${(value * 100).toFixed(1)}%`,
                              "Accuracy",
                            ]}
                          />
                          <Bar dataKey="accuracy" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Trend Distribution</CardTitle>
                      <CardDescription>
                        Distribution of trend directions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Increasing",
                                value: predictions.filter(
                                  p => p.trend === "increasing"
                                ).length,
                                fill: "#22c55e",
                              },
                              {
                                name: "Decreasing",
                                value: predictions.filter(
                                  p => p.trend === "decreasing"
                                ).length,
                                fill: "#ef4444",
                              },
                              {
                                name: "Stable",
                                value: predictions.filter(
                                  p => p.trend === "stable"
                                ).length,
                                fill: "#3b82f6",
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                            label
                          >
                            {predictions.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Anomaly Detection</CardTitle>
                      <CardDescription>
                        Anomaly scores over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={predictions}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={value =>
                              new Date(value).toLocaleDateString()
                            }
                          />
                          <YAxis domain={[0, 1]} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="anomaly_score"
                            stroke="#ff7c7c"
                            strokeWidth={2}
                          />
                          <ReferenceLine
                            y={0.7}
                            stroke="red"
                            strokeDasharray="5 5"
                            label="Alert Threshold"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No prediction data available
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Advanced Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics ? (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Model Performance Metrics</CardTitle>
                    <CardDescription>
                      Comprehensive evaluation of ML model performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart
                        data={[
                          {
                            metric: "Accuracy",
                            value: analytics.model_performance.accuracy,
                          },
                          {
                            metric: "Precision",
                            value: analytics.model_performance.precision,
                          },
                          {
                            metric: "Recall",
                            value: analytics.model_performance.recall,
                          },
                          {
                            metric: "F1 Score",
                            value: analytics.model_performance.f1_score,
                          },
                          {
                            metric: "AUC-ROC",
                            value: analytics.model_performance.auc_roc,
                          },
                        ]}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis domain={[0, 1]} />
                        <Radar
                          name="Performance"
                          dataKey="value"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            `${(value * 100).toFixed(1)}%`,
                            "Score",
                          ]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Importance</CardTitle>
                    <CardDescription>
                      Most influential features in model predictions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={analytics.feature_importance}
                        layout="horizontal"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 1]} />
                        <YAxis dataKey="feature" type="category" width={100} />
                        <Tooltip
                          formatter={(value: number) => [
                            `${(value * 100).toFixed(1)}%`,
                            "Importance",
                          ]}
                        />
                        <Bar
                          dataKey="importance"
                          fill={entry =>
                            entry.impact === "positive" ? "#22c55e" : "#ef4444"
                          }
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Correlation Matrix</CardTitle>
                  <CardDescription>
                    Relationships between key business variables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {analytics.correlation_matrix.map((correlation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="font-medium">
                            {correlation.variable1} ↔ {correlation.variable2}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              Math.abs(correlation.correlation) > 0.7
                                ? "default"
                                : Math.abs(correlation.correlation) > 0.4
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {correlation.correlation > 0 ? "+" : ""}
                            {correlation.correlation.toFixed(2)}
                          </Badge>
                          <Progress
                            value={Math.abs(correlation.correlation) * 100}
                            className="w-24"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Drift Analysis</CardTitle>
                  <CardDescription>
                    Monitoring for changes in data distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Drift Detection Status</h4>
                        <p className="text-sm text-muted-foreground">
                          Current drift score:{" "}
                          {analytics.data_drift.drift_score.toFixed(3)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          analytics.data_drift.detected
                            ? "destructive"
                            : "default"
                        }
                      >
                        {analytics.data_drift.detected
                          ? "DRIFT DETECTED"
                          : "STABLE"}
                      </Badge>
                    </div>
                    <Progress
                      value={analytics.data_drift.drift_score * 100}
                      className="w-full"
                    />
                    {analytics.data_drift.affected_features.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Affected Features:</h5>
                        <div className="flex flex-wrap gap-2">
                          {analytics.data_drift.affected_features.map(
                            feature => (
                              <Badge key={feature} variant="outline">
                                {feature}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            {performance.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        CPU Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {performance[performance.length - 1]?.cpu_usage.toFixed(
                          1
                        )}
                        %
                      </div>
                      <Progress
                        value={
                          performance[performance.length - 1]?.cpu_usage || 0
                        }
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Memory Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {performance[
                          performance.length - 1
                        ]?.memory_usage.toFixed(1)}
                        %
                      </div>
                      <Progress
                        value={
                          performance[performance.length - 1]?.memory_usage || 0
                        }
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Response Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {performance[performance.length - 1]?.response_time ||
                          0}
                        ms
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Average response time
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>System Performance Over Time</CardTitle>
                    <CardDescription>
                      Real-time system metrics and performance indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={performance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={value =>
                            new Date(value).toLocaleTimeString()
                          }
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip
                          labelFormatter={value =>
                            new Date(value).toLocaleString()
                          }
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="cpu_usage"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="memory_usage"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.6}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="response_time"
                          stroke="#ff7c7c"
                          strokeWidth={2}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No performance data available
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Data Integration Tab */}
        <TabsContent value="integration" className="space-y-4">
          <div className="grid gap-4">
            {dataStatus.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {dataStatus.map(source => (
                    <Card key={source.source}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {source.source}
                        </CardTitle>
                        <Badge
                          variant={
                            source.status === "healthy"
                              ? "default"
                              : source.status === "warning"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {source.status}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Quality Score</span>
                            <span>{source.data_quality_score}%</span>
                          </div>
                          <Progress value={source.data_quality_score} />
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>
                              Records: {source.records_count.toLocaleString()}
                            </div>
                            <div>Latency: {source.latency_ms}ms</div>
                            <div>
                              Error Rate: {source.error_rate.toFixed(2)}%
                            </div>
                            <div>
                              Last Sync:{" "}
                              {new Date(source.last_sync).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Integration Health</CardTitle>
                    <CardDescription>
                      Overall system health and data quality metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dataStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="source" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="data_quality_score" fill="#8884d8" />
                        <Bar dataKey="throughput" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No data sources configured
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
