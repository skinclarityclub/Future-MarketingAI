"use client";

import React, { useState, useMemo } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
  BarChart,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Target,
  Brain,
  BarChart3,
  Lightbulb,
  Clock,
  RefreshCw,
  Settings,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  BusinessForecast,
  PredictiveInsight,
} from "@/lib/analytics/predictive-analytics-service";

interface PredictiveDashboardProps {
  forecasts: BusinessForecast[];
  insights: PredictiveInsight[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onConfigChange?: (config: any) => void;
  className?: string;
}

export function PredictiveDashboard({
  forecasts,
  insights,
  isLoading = false,
  onRefresh,
  onConfigChange,
  className = "",
}: PredictiveDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "short" | "medium" | "long"
  >("medium");
  const [selectedMetric, setSelectedMetric] = useState<string>("revenue");
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);
  // const [predictions, setPredictions] = useState<any[]>([]);

  // Filter forecasts by selected timeframe
  const filteredForecasts = useMemo(
    () => forecasts.filter(f => f.timeframe === selectedTimeframe),
    [forecasts, selectedTimeframe]
  );

  // Get selected metric forecast
  const selectedForecast = useMemo(
    () => filteredForecasts.find(f => f.metric === selectedMetric),
    [filteredForecasts, selectedMetric]
  );

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!selectedForecast) return [];

    return selectedForecast.predictions.map(p => ({
      date: new Date(p.date).toLocaleDateString(),
      value: p.value,
      lower: p.confidenceInterval.lower,
      upper: p.confidenceInterval.upper,
      confidence: p.confidence * 100,
      trend: p.trend,
    }));
  }, [selectedForecast]);

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    if (!selectedForecast) return null;

    const predictions = selectedForecast.predictions;
    const firstValue = predictions[0]?.value || 0;
    const lastValue = predictions[predictions.length - 1]?.value || 0;
    const growthRate = ((lastValue - firstValue) / firstValue) * 100;
    const avgConfidence =
      predictions.reduce((sum, p) => sum + p.confidence, 0) /
      predictions.length;

    return {
      currentValue: selectedForecast.currentValue,
      predictedValue: lastValue,
      growthRate,
      avgConfidence: avgConfidence * 100,
      trend: predictions[predictions.length - 1]?.trend || "stable",
    };
  }, [selectedForecast]);

  // Filter insights by priority
  const prioritizedInsights = useMemo(
    () =>
      insights.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
    [insights]
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getAlertVariant = (level: string) => {
    switch (level) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "default";
    }
  };

  // Utility functions for chart formatting
  const formatXAxis = (tickItem: unknown, _index: number) => {
    if (typeof tickItem === "string") {
      return tickItem.slice(0, 10);
    }
    return String(tickItem);
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (
      typeof cx !== "number" ||
      typeof cy !== "number" ||
      typeof midAngle !== "number" ||
      typeof innerRadius !== "number" ||
      typeof outerRadius !== "number" ||
      typeof percent !== "number"
    ) {
      return null;
    }

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Predictive Analytics
          </h2>
          <p className="text-muted-foreground">
            AI-powered business forecasting and strategic insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NormalButton
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Updating..." : "Refresh"}
          </NormalButton>

          <NormalButton variant="outline" size="sm" onClick={onConfigChange}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </NormalButton>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {keyMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Value
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {keyMetrics.currentValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedMetric.charAt(0).toUpperCase() +
                  selectedMetric.slice(1)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Predicted Value
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {keyMetrics.predictedValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                End of {selectedTimeframe} period
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              {getTrendIcon(keyMetrics.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {keyMetrics.growthRate > 0 ? "+" : ""}
                {keyMetrics.growthRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Expected change</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confidence</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {keyMetrics.avgConfidence.toFixed(0)}%
              </div>
              <Progress value={keyMetrics.avgConfidence} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Content */}
      <Tabs
        value={selectedTimeframe}
        onValueChange={value => setSelectedTimeframe(value as any)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="short">Short Term (7 days)</TabsTrigger>
          <TabsTrigger value="medium">Medium Term (30 days)</TabsTrigger>
          <TabsTrigger value="long">Long Term (90 days)</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTimeframe} className="space-y-6">
          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Forecast Visualization
                  </CardTitle>
                  <CardDescription>
                    AI-generated predictions with confidence intervals
                  </CardDescription>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="metric-select"
                      className="text-sm font-medium"
                    >
                      Metric:
                    </label>
                    <select
                      id="metric-select"
                      value={selectedMetric}
                      onChange={e => setSelectedMetric(e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      {forecasts.map(f => (
                        <option key={f.metric} value={f.metric}>
                          {f.metric.charAt(0).toUpperCase() + f.metric.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <NormalButton
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowConfidenceIntervals(!showConfidenceIntervals)
                    }
                  >
                    {showConfidenceIntervals ? "Hide" : "Show"} Confidence
                  </NormalButton>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={value => `${value.toLocaleString()}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value, name) => [
                        typeof value === "number"
                          ? value.toLocaleString()
                          : value,
                        name === "value"
                          ? "Predicted Value"
                          : name === "confidence"
                            ? "Confidence"
                            : name,
                      ]}
                    />

                    {/* Current value reference line */}
                    {selectedForecast && (
                      <ReferenceLine
                        y={selectedForecast.currentValue}
                        stroke="#666"
                        strokeDasharray="5 5"
                        label="Current"
                      />
                    )}

                    {/* Confidence interval area */}
                    {showConfidenceIntervals && (
                      <Area
                        type="monotone"
                        dataKey="upper"
                        stackId="confidence"
                        stroke="none"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.1}
                      />
                    )}

                    {showConfidenceIntervals && (
                      <Area
                        type="monotone"
                        dataKey="lower"
                        stackId="confidence"
                        stroke="none"
                        fill="hsl(var(--background))"
                        fillOpacity={1}
                      />
                    )}

                    {/* Main forecast line */}
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{
                        fill: "hsl(var(--primary))",
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        stroke: "hsl(var(--primary))",
                        strokeWidth: 2,
                      }}
                    />

                    {/* Confidence bars */}
                    <Bar
                      dataKey="confidence"
                      fill="hsl(var(--muted))"
                      fillOpacity={0.3}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Insights and Alerts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Predictive Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Predictive Insights
                </CardTitle>
                <CardDescription>
                  AI-generated business intelligence and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {prioritizedInsights.slice(0, 5).map((insight, index) => (
                  <div
                    key={insight.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <Badge
                      variant={getPriorityColor(insight.priority) as any}
                      className="mt-1"
                    >
                      {insight.priority}
                    </Badge>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{insight.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>

                      {insight.actionableRecommendations.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Recommended Actions:
                          </p>
                          {insight.actionableRecommendations
                            .slice(0, 2)
                            .map((rec, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-xs"
                              >
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                <span>{rec}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {prioritizedInsights.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No insights available. Try refreshing or adjusting the time
                    period.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Alerts and Model Performance */}
            <div className="space-y-6">
              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alerts & Warnings
                  </CardTitle>
                  <CardDescription>
                    Critical notifications and threshold breaches
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedForecast?.alerts.map((alert, index) => (
                    <Alert
                      key={index}
                      variant={getAlertVariant(alert.level) as any}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="capitalize">
                        {alert.level}
                      </AlertTitle>
                      <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                  ))}

                  {(!selectedForecast?.alerts ||
                    selectedForecast.alerts.length === 0) && (
                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertTitle>All Clear</AlertTitle>
                      <AlertDescription>
                        No alerts or warnings detected for current forecasts.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Model Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Model Performance
                  </CardTitle>
                  <CardDescription>
                    AI model accuracy and reliability metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedForecast && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Accuracy</span>
                        <span className="text-sm">
                          {Math.round(
                            selectedForecast.modelPerformance.accuracy * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={selectedForecast.modelPerformance.accuracy * 100}
                      />

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Reliability</span>
                        <span className="text-sm">
                          {Math.round(
                            selectedForecast.modelPerformance.reliability * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          selectedForecast.modelPerformance.reliability * 100
                        }
                      />

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Data Quality
                        </span>
                        <span className="text-sm">
                          {Math.round(
                            selectedForecast.modelPerformance.dataQuality * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          selectedForecast.modelPerformance.dataQuality * 100
                        }
                      />

                      <div className="pt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last updated:{" "}
                          {new Date(
                            selectedForecast.modelPerformance.lastUpdated
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Business Insights Summary */}
          {selectedForecast?.insights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Business Intelligence Summary
                </CardTitle>
                <CardDescription>
                  Strategic insights and recommendations for {selectedMetric}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Overview</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedForecast.insights.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Key Drivers</h4>
                      <ul className="space-y-1">
                        {selectedForecast.insights.keyDrivers.map(
                          (driver, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-center gap-2"
                            >
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              {driver}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Risk Factors</h4>
                      <ul className="space-y-1">
                        {selectedForecast.insights.riskFactors.map(
                          (risk, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-center gap-2"
                            >
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                              {risk}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {selectedForecast.insights.recommendations.map(
                          (rec, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-center gap-2"
                            >
                              <ChevronRight className="h-3 w-3" />
                              {rec}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
