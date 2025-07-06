"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NormalButton from "@/components/ui/normal-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ScatterChart,
  Scatter,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Users,
  Eye,
  MousePointer,
  DollarSign,
  Percent,
  Calculator,
  Bell,
  RefreshCw,
} from "lucide-react";
import {
  StatisticalSignificanceEngine,
  PerformanceMonitor,
  TestAnalysis,
  VariantData,
  MonitoringAlert,
  createStatisticalEngine,
  createPerformanceMonitor,
} from "@/lib/ab-testing/statistical-engine";

interface PerformanceMonitorProps {
  testId: string;
  variants: VariantData[];
  refreshInterval?: number;
  onAlert?: (alert: MonitoringAlert) => void;
}

interface HistoricalDataPoint {
  timestamp: string;
  date: Date;
  [key: string]: any;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

export default function PerformanceMonitorComponent({
  testId,
  variants,
  refreshInterval = 30000, // 30 seconds
  onAlert,
}: PerformanceMonitorProps) {
  const [analysis, setAnalysis] = useState<TestAnalysis | null>(null);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>(
    []
  );
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Create statistical engine and monitor instances
  const [engine] = useState(() => createStatisticalEngine(0.95, 0.8));
  const [monitor] = useState(() => createPerformanceMonitor(engine));

  // Performance monitoring function
  const performAnalysis = useCallback(async () => {
    try {
      setLoading(true);

      // Analyze test
      const testAnalysis = await engine.analyzeTest(testId, variants);
      setAnalysis(testAnalysis);

      // Monitor for alerts
      const newAlerts = await monitor.monitorTest(testId, variants);
      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev, ...newAlerts]);
        newAlerts.forEach(alert => onAlert?.(alert));
      }

      // Add to historical data
      const dataPoint: HistoricalDataPoint = {
        timestamp: new Date().toISOString(),
        date: new Date(),
        overallSignificance: testAnalysis.overallSignificance,
        sampleSize: testAnalysis.sampleSizeAnalysis.current,
        progress: testAnalysis.sampleSizeAnalysis.progress,
        power: testAnalysis.powerAnalysis.currentPower,
        ...testAnalysis.results.reduce((acc, result, index) => {
          acc[`variant_${index}_conversion`] = result.conversionRate * 100;
          acc[`variant_${index}_improvement`] = result.improvement * 100;
          return acc;
        }, {} as any),
      };

      setHistoricalData(prev => {
        const updated = [...prev, dataPoint];
        // Keep only last 100 data points
        return updated.slice(-100);
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  }, [testId, variants, engine, monitor, onAlert]);

  // Initial analysis and auto-refresh setup
  useEffect(() => {
    performAnalysis();

    if (autoRefresh) {
      const interval = setInterval(performAnalysis, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [performAnalysis, refreshInterval, autoRefresh]);

  // Alert subscription
  useEffect(() => {
    const unsubscribe = monitor.onAlert(alert => {
      setAlerts(prev => [...prev, alert]);
      onAlert?.(alert);
    });

    return unsubscribe;
  }, [monitor, onAlert]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "significant":
        return "bg-green-100 text-green-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "insufficient_data":
        return "bg-yellow-100 text-yellow-800";
      case "inconclusive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case "stop":
        return "bg-green-100 text-green-800";
      case "continue":
        return "bg-blue-100 text-blue-800";
      case "extend":
        return "bg-yellow-100 text-yellow-800";
      case "investigate":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "significance_achieved":
        return <CheckCircle className="h-4 w-4" />;
      case "quality_issue":
        return <AlertTriangle className="h-4 w-4" />;
      case "performance_drop":
        return <TrendingDown className="h-4 w-4" />;
      case "sample_size_reached":
        return <Target className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (loading && !analysis) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Analyzing test performance...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to analyze test performance. Please check your test
          configuration.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Status and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Performance Monitor
          </h2>
          <p className="text-gray-600">Test ID: {testId}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <NormalButton
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            {autoRefresh ? (
              <Zap className="h-4 w-4 mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </NormalButton>
          <NormalButton onClick={performAnalysis} disabled={loading} size="sm">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </NormalButton>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
          {alerts.slice(-5).map(alert => (
            <Alert
              key={alert.id}
              className={`
              ${alert.severity === "critical" ? "border-red-500 bg-red-50" : ""}
              ${alert.severity === "warning" ? "border-yellow-500 bg-yellow-50" : ""}
              ${alert.severity === "info" ? "border-blue-500 bg-blue-50" : ""}
            `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getAlertIcon(alert.type)}
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-500">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <NormalButton
                  onClick={() => dismissAlert(alert.id)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </NormalButton>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Test Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(analysis.status)}>
              {analysis.status.replace("_", " ").toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Significance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">
                {analysis.overallSignificance.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Recommended Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={getRecommendationColor(analysis.recommendedAction)}
            >
              {analysis.recommendedAction.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Winning Variant
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.winningVariant ? (
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">{analysis.winningVariant}</span>
              </div>
            ) : (
              <span className="text-gray-500">No winner yet</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sample Size Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Sample Size Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>
                      Current:{" "}
                      {analysis.sampleSizeAnalysis.current.toLocaleString()}
                    </span>
                    <span>
                      Required:{" "}
                      {analysis.sampleSizeAnalysis.required.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={analysis.sampleSizeAnalysis.progress}
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600">
                    {analysis.sampleSizeAnalysis.progress.toFixed(1)}% complete
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Statistical Power */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Statistical Power</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Power:</span>
                    <span className="font-medium">
                      {(analysis.powerAnalysis.currentPower * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Target Power:</span>
                    <span className="font-medium">
                      {(analysis.powerAnalysis.targetPower * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={
                      (analysis.powerAnalysis.currentPower /
                        analysis.powerAnalysis.targetPower) *
                      100
                    }
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600">
                    Minimum Detectable Effect:{" "}
                    {(
                      analysis.powerAnalysis.minimumDetectableEffect * 100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time to Significance */}
          {analysis.timeToSignificance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Time to Significance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {Math.ceil(
                    analysis.timeToSignificance / (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </p>
                <p className="text-sm text-gray-600">
                  Estimated time remaining to reach statistical significance
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-6">
          <div className="grid gap-6">
            {analysis.results.map((result, index) => {
              const variant = variants.find(v => v.id === result.variant);
              return (
                <Card key={result.variant}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{variant?.name || result.variant}</span>
                      <div className="flex items-center space-x-2">
                        {variant?.isControl && (
                          <Badge variant="outline">Control</Badge>
                        )}
                        {result.isSignificant && (
                          <Badge className="bg-green-100 text-green-800">
                            Significant
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Eye className="h-4 w-4" />
                          <span>Impressions</span>
                        </div>
                        <p className="text-xl font-bold">
                          {variant?.metrics.impressions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MousePointer className="h-4 w-4" />
                          <span>Conversion Rate</span>
                        </div>
                        <p className="text-xl font-bold">
                          {(result.conversionRate * 100).toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>Improvement</span>
                        </div>
                        <p
                          className={`text-xl font-bold ${
                            result.improvement > 0
                              ? "text-green-600"
                              : result.improvement < 0
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {result.improvement > 0 ? "+" : ""}
                          {(result.improvement * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calculator className="h-4 w-4" />
                          <span>P-Value</span>
                        </div>
                        <p className="text-xl font-bold">
                          {result.pValue.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    {/* Confidence Interval */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        95% Confidence Interval:{" "}
                        {(result.confidenceInterval.lower * 100).toFixed(2)}% -{" "}
                        {(result.confidenceInterval.upper * 100).toFixed(2)}%
                      </p>
                      <div className="bg-gray-100 rounded-lg p-2 h-4 relative">
                        <div
                          className="bg-blue-500 h-full rounded"
                          style={{
                            marginLeft: `${result.confidenceInterval.lower * 100}%`,
                            width: `${(result.confidenceInterval.upper - result.confidenceInterval.lower) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Data Quality Checks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.qualityChecks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 border rounded-lg"
                  >
                    <div
                      className={`p-1 rounded-full ${
                        check.status === "pass"
                          ? "bg-green-100"
                          : check.status === "warning"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                      }`}
                    >
                      {check.status === "pass" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{check.message}</p>
                      {check.recommendation && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Recommendation:</strong>{" "}
                          {check.recommendation}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {check.type.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            check.impact === "high"
                              ? "border-red-500 text-red-600"
                              : check.impact === "medium"
                                ? "border-yellow-500 text-yellow-600"
                                : "border-green-500 text-green-600"
                          }`}
                        >
                          {check.impact} impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {historicalData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={value =>
                          new Date(value).toLocaleTimeString()
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={value =>
                          new Date(value).toLocaleString()
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="overallSignificance"
                        stroke="#8884d8"
                        name="Significance %"
                      />
                      <Line
                        type="monotone"
                        dataKey="progress"
                        stroke="#82ca9d"
                        name="Progress %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-refresh</p>
                    <p className="text-sm text-gray-600">
                      Automatically refresh data every {refreshInterval / 1000}{" "}
                      seconds
                    </p>
                  </div>
                  <NormalButton
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    variant={autoRefresh ? "default" : "outline"}
                  >
                    {autoRefresh ? "ON" : "OFF"}
                  </NormalButton>
                </div>

                <div className="pt-4 border-t">
                  <p className="font-medium mb-2">Test Configuration</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Confidence Level:</span>
                      <span className="ml-2 font-medium">
                        {(analysis.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Target Power:</span>
                      <span className="ml-2 font-medium">
                        {(analysis.powerAnalysis.targetPower * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
