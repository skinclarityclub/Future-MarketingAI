"use client";

/**
 * Self-Learning Analytics Dashboard
 * Task 36.4: React interface for ML-powered content performance analysis and optimization
 *
 * Features:
 * - Performance analysis with ML insights
 * - Content performance prediction
 * - Audience segmentation analytics
 * - Real-time optimization suggestions
 * - A/B testing management
 * - ML model status and training
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Brain,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  Eye,
  BookOpen,
  Play,
  Pause,
  Settings,
  Sparkles,
  Activity,
  Award,
  Bot,
  Cpu,
  Gauge,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Types
interface AnalyticsData {
  dashboard?: {
    performance_analysis: any;
    audience_segmentation: any;
    real_time_optimizations: any;
  };
  summary?: {
    total_insights: number;
    total_recommendations: number;
    audience_segments: number;
    immediate_actions: number;
    performance_alerts: number;
  };
}

interface MLModel {
  model_id: string;
  model_type: string;
  version: string;
  accuracy: number;
  status: string;
  last_trained: string;
  training_data_size: number;
}

interface Prediction {
  predicted_metrics: {
    engagement_rate: number;
    reach_estimate: number;
    conversion_probability: number;
    viral_potential: number;
  };
  confidence_score: number;
  optimization_suggestions: any[];
  risk_factors: string[];
}

interface LearningInsight {
  insight_id: string;
  insight_type: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  impact_score: number;
  actionable_recommendations: string[];
  validated: boolean;
}

// New Interactive Demo Data
const demoLearningMetrics = {
  accuracy: 94.7,
  learningSpeed: 87.3,
  adaptationRate: 91.2,
  confidenceScore: 96.1,
  dataQuality: 88.9,
  processingSpeed: 0.023, // seconds
  totalPatterns: 1847,
  activeModels: 6,
};

const demoLearningProgress = [
  { time: "00:00", accuracy: 45, confidence: 30 },
  { time: "00:15", accuracy: 62, confidence: 55 },
  { time: "00:30", accuracy: 78, confidence: 72 },
  { time: "00:45", accuracy: 85, confidence: 81 },
  { time: "01:00", accuracy: 91, confidence: 88 },
  { time: "01:15", accuracy: 94, confidence: 94 },
];

const demoInsights = [
  {
    id: 1,
    type: "pattern",
    title: "Peak Engagement Discovery",
    description: "Discovered 73% higher engagement during 9-11 AM weekdays",
    confidence: 96,
    impact: "high",
    learnedAt: "2 minutes ago",
  },
  {
    id: 2,
    type: "trend",
    title: "Content Length Optimization",
    description: "280-320 character posts show 45% better conversion rates",
    confidence: 89,
    impact: "medium",
    learnedAt: "5 minutes ago",
  },
  {
    id: 3,
    type: "anomaly",
    title: "Platform Shift Detected",
    description: "Unusual traffic spike on LinkedIn, investigating cause",
    confidence: 92,
    impact: "high",
    learnedAt: "8 minutes ago",
  },
];

const SelfLearningAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("demo");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [models, setModels] = useState<MLModel[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>("");

  // Interactive Demo States
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [learningSpeed, setLearningSpeed] = useState(1);
  const [showRealTimeUpdates] = useState(true);
  const [simulatedMetrics, setSimulatedMetrics] = useState(demoLearningMetrics);
  const [realtimeInsights, setRealtimeInsights] = useState<any[]>([]);
  const [animationPhase, setAnimationPhase] = useState("idle");
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [analysisSettings, setAnalysisSettings] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    platforms: ["linkedin", "facebook", "instagram", "twitter"],
    content_types: ["post", "story", "video"],
  });

  const [predictionData, setPredictionData] = useState({
    title: "AI-Powered Marketing Insights",
    content_type: "post",
    platform: "linkedin",
    content_features: {
      word_count: 250,
      hashtag_count: 3,
      sentiment_score: 0.8,
    },
    target_audience: "tech-professionals",
    posting_time: "09:00",
  });

  const [segmentationSettings, setSegmentationSettings] = useState({
    platforms: ["linkedin", "facebook"],
    min_segment_size: 100,
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    loadModels();
  }, []);

  // Interactive Demo Functions
  const startLearningDemo = useCallback(() => {
    setIsDemoRunning(true);
    setDemoProgress(0);
    setAnimationPhase("learning");

    demoIntervalRef.current = setInterval(() => {
      setDemoProgress(prev => {
        const newProgress = Math.min(prev + learningSpeed * 2, 100);
        if (newProgress >= 100) {
          setAnimationPhase("complete");
          setTimeout(() => {
            setIsDemoRunning(false);
            setAnimationPhase("idle");
          }, 2000);
        }
        return newProgress;
      });
    }, 100);

    // Simulate real-time metrics updates
    metricsIntervalRef.current = setInterval(() => {
      setSimulatedMetrics(prev => ({
        ...prev,
        accuracy: Math.min(prev.accuracy + Math.random() * 0.5, 99.9),
        learningSpeed: 50 + Math.random() * 50,
        adaptationRate: 60 + Math.random() * 40,
        confidenceScore: Math.min(
          prev.confidenceScore + Math.random() * 0.3,
          99.8
        ),
        dataQuality: 80 + Math.random() * 20,
        processingSpeed: 0.01 + Math.random() * 0.05,
        totalPatterns: prev.totalPatterns + Math.floor(Math.random() * 5),
      }));

      // Add random insights
      if (Math.random() > 0.7) {
        const newInsight = {
          id: Date.now(),
          text: [
            "Detected new engagement pattern in video content",
            "Optimizing hashtag strategy based on recent performance",
            "Cross-platform audience behavior pattern identified",
            "Real-time content sentiment adjustment applied",
          ][Math.floor(Math.random() * 4)],
          timestamp: new Date().toLocaleTimeString(),
          confidence: 85 + Math.random() * 15,
        };

        setRealtimeInsights(prev => [newInsight, ...prev.slice(0, 4)]);
      }
    }, 2000);
  }, [learningSpeed]);

  const stopLearningDemo = useCallback(() => {
    setIsDemoRunning(false);
    setAnimationPhase("idle");
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
    }
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    };
  }, []);

  // API Functions
  const loadDashboardData = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    try {
      const params = new URLSearchParams({
        start_date: analysisSettings.start_date,
        end_date: analysisSettings.end_date,
        platforms: analysisSettings.platforms.join(","),
        content_types: analysisSettings.content_types.join(","),
      });

      const response = await fetch(
        `/api/marketing/self-learning-analytics?${params}`
      );
      const result = await response.json();

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setError(result.error || "Failed to load dashboard data");
      }
    } catch (err) {
      setError(`Error loading dashboard: ${err}`);
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  const loadModels = async () => {
    setLoading(prev => ({ ...prev, models: true }));
    try {
      const response = await fetch(
        "/api/marketing/self-learning-analytics?type=models"
      );
      const result = await response.json();

      if (result.success && result.data && result.data.models) {
        setModels(result.data.models);
      } else {
        setModels([]); // Fallback to empty array
      }
    } catch (err) {
      console.error("Error loading models:", err);
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  };

  const analyzePerformance = async () => {
    setLoading(prev => ({ ...prev, analysis: true }));
    try {
      const response = await fetch("/api/marketing/self-learning-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_performance",
          start_date: analysisSettings.start_date,
          end_date: analysisSettings.end_date,
          platforms: analysisSettings.platforms,
          content_types: analysisSettings.content_types,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setInsights(result.data.analysis.insights);
        setAnalyticsData(prev => ({
          ...prev,
          dashboard: {
            ...prev.dashboard,
            performance_analysis: result.data.analysis,
          },
        }));
      } else {
        setError(result.error || "Failed to analyze performance");
      }
    } catch (err) {
      setError(`Error analyzing performance: ${err}`);
    } finally {
      setLoading(prev => ({ ...prev, analysis: false }));
    }
  };

  const predictPerformance = async () => {
    setLoading(prev => ({ ...prev, prediction: true }));
    try {
      const response = await fetch("/api/marketing/self-learning-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "predict_performance",
          content_data: predictionData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPrediction(result.data.prediction);
      } else {
        setError(result.error || "Failed to predict performance");
      }
    } catch (err) {
      setError(`Error predicting performance: ${err}`);
    } finally {
      setLoading(prev => ({ ...prev, prediction: false }));
    }
  };

  const segmentAudience = async () => {
    setLoading(prev => ({ ...prev, segmentation: true }));
    try {
      const response = await fetch("/api/marketing/self-learning-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "segment_audience",
          platforms: segmentationSettings.platforms,
          min_segment_size: segmentationSettings.min_segment_size,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAnalyticsData(prev => ({
          ...prev,
          dashboard: {
            ...prev.dashboard,
            audience_segmentation: result.data.segmentation,
          },
        }));
      } else {
        setError(result.error || "Failed to segment audience");
      }
    } catch (err) {
      setError(`Error segmenting audience: ${err}`);
    } finally {
      setLoading(prev => ({ ...prev, segmentation: false }));
    }
  };

  const updateMLModels = async (
    modelTypes: string[] = [],
    forceRetrain: boolean = false
  ) => {
    setLoading(prev => ({ ...prev, models: true }));
    try {
      const response = await fetch("/api/marketing/self-learning-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_models",
          model_types: modelTypes,
          force_retrain: forceRetrain,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Reload models after update
        await loadModels();
      } else {
        setError(result.error || "Failed to update models");
      }
    } catch (err) {
      setError(`Error updating models: ${err}`);
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-500";
      case "training":
        return "bg-blue-500";
      case "updating":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return <BarChart3 className="h-4 w-4" />;
      case "trend":
        return <TrendingUp className="h-4 w-4" />;
      case "anomaly":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toFixed(0);
  };

  // Render functions
  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Summary Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ML Insights</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData.summary?.total_insights || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Learning patterns discovered
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Optimizations</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData.summary?.total_recommendations || 0}
          </div>
          <p className="text-xs text-muted-foreground">Recommendations ready</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Audience Segments
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData.summary?.audience_segments || 0}
          </div>
          <p className="text-xs text-muted-foreground">Identified segments</p>
        </CardContent>
      </Card>

      {/* Recent Insights */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Learning Insights</CardTitle>
          <CardDescription>
            Latest patterns and trends discovered by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.slice(0, 3).map(insight => (
                <div
                  key={insight.insight_id}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getInsightIcon(insight.insight_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{insight.title}</h4>
                      <div className="flex space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.impact_score}/10 impact
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    {insight.actionable_recommendations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Action Items:</p>
                        <ul className="text-xs text-muted-foreground ml-2">
                          {insight.actionable_recommendations
                            .slice(0, 2)
                            .map((rec, idx) => (
                              <li key={idx}>• {rec}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No insights available. Run performance analysis to generate ML
              insights.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Real-time Optimizations */}
      {analyticsData.dashboard?.real_time_optimizations && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Real-time Optimizations</CardTitle>
            <CardDescription>
              Immediate actions and performance alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Immediate Actions</h4>
                {analyticsData.dashboard.real_time_optimizations
                  .immediate_actions?.length > 0 ? (
                  <div className="space-y-2">
                    {analyticsData.dashboard.real_time_optimizations.immediate_actions
                      .slice(0, 3)
                      .map((action: any, idx: number) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-sm">
                            {action.recommendation.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Expected improvement: {action.expected_improvement}%
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No immediate actions needed
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Performance Alerts</h4>
                {analyticsData.dashboard.real_time_optimizations
                  .performance_alerts?.length > 0 ? (
                  <div className="space-y-2">
                    {analyticsData.dashboard.real_time_optimizations.performance_alerts
                      .slice(0, 3)
                      .map((alert: any, idx: number) => (
                        <Alert key={idx}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {alert.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No alerts</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis Settings</CardTitle>
          <CardDescription>Configure ML analysis parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={analysisSettings.start_date}
                onChange={e =>
                  setAnalysisSettings(prev => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={analysisSettings.end_date}
                onChange={e =>
                  setAnalysisSettings(prev => ({
                    ...prev,
                    end_date: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Platforms</label>
              <Select
                value={analysisSettings.platforms.join(",")}
                onValueChange={value =>
                  setAnalysisSettings(prev => ({
                    ...prev,
                    platforms: value.split(","),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin,facebook,instagram,twitter">
                    All Platforms
                  </SelectItem>
                  <SelectItem value="linkedin">LinkedIn Only</SelectItem>
                  <SelectItem value="facebook,instagram">
                    Meta Platforms
                  </SelectItem>
                  <SelectItem value="twitter">Twitter Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Content Types</label>
              <Select
                value={analysisSettings.content_types.join(",")}
                onValueChange={value =>
                  setAnalysisSettings(prev => ({
                    ...prev,
                    content_types: value.split(","),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post,story,video">All Types</SelectItem>
                  <SelectItem value="post">Posts Only</SelectItem>
                  <SelectItem value="video">Videos Only</SelectItem>
                  <SelectItem value="story">Stories Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <NormalButton
              onClick={analyzePerformance}
              disabled={loading.analysis}
              className="flex items-center space-x-2"
            >
              {loading.analysis ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              <span>Analyze Performance</span>
            </NormalButton>
            <NormalButton
              variant="secondary"
              onClick={loadDashboardData}
              disabled={loading.dashboard}
            >
              Refresh Data
            </NormalButton>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      {analyticsData.dashboard?.performance_analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>
              ML-powered content performance insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatNumber(
                    analyticsData.dashboard.performance_analysis
                      .performance_summary?.total_views || 0
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {analyticsData.dashboard.performance_analysis.performance_summary?.average_engagement_rate?.toFixed(
                    1
                  ) || 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground">Avg. Engagement</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {analyticsData.dashboard.performance_analysis
                    .performance_summary?.total_content_pieces || 0}
                </div>
                <p className="text-sm text-muted-foreground">Content Pieces</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {analyticsData.dashboard.performance_analysis.performance_summary?.total_conversions?.toFixed(
                    1
                  ) || 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground">Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Insights</CardTitle>
          <CardDescription>
            Patterns and trends discovered by machine learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map(insight => (
                <div key={insight.insight_id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(insight.insight_type)}
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant="outline">{insight.category}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Badge
                        className={
                          insight.validated ? "bg-green-500" : "bg-yellow-500"
                        }
                      >
                        {insight.validated ? "Validated" : "Unvalidated"}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {insight.description}
                  </p>
                  <div className="mt-3">
                    <p className="text-sm font-medium">
                      Actionable Recommendations:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      {insight.actionable_recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="h-3 w-3 mt-1 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No insights available. Run analysis to generate ML insights.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPredictionTab = () => (
    <div className="space-y-6">
      {/* Prediction Input */}
      <Card>
        <CardHeader>
          <CardTitle>Content Performance Prediction</CardTitle>
          <CardDescription>
            Use ML to predict how your content will perform before publishing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Content Title</label>
              <Input
                value={predictionData.title}
                onChange={e =>
                  setPredictionData(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Enter content title..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content Type</label>
              <Select
                value={predictionData.content_type}
                onValueChange={value =>
                  setPredictionData(prev => ({ ...prev, content_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="ad">Advertisement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Platform</label>
              <Select
                value={predictionData.platform}
                onValueChange={value =>
                  setPredictionData(prev => ({ ...prev, platform: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Posting Time</label>
              <Input
                type="time"
                value={predictionData.posting_time}
                onChange={e =>
                  setPredictionData(prev => ({
                    ...prev,
                    posting_time: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <NormalButton
            onClick={predictPerformance}
            disabled={loading.prediction}
            className="mt-4 flex items-center space-x-2"
          >
            {loading.prediction ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span>Predict Performance</span>
          </NormalButton>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Predicted Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Predicted Performance</CardTitle>
              <CardDescription>
                ML model predictions with{" "}
                {Math.round(prediction.confidence_score * 100)}% confidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Engagement Rate</span>
                  <span className="font-medium">
                    {prediction.predicted_metrics.engagement_rate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Estimated Reach</span>
                  <span className="font-medium">
                    {formatNumber(prediction.predicted_metrics.reach_estimate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Conversion Probability</span>
                  <span className="font-medium">
                    {Math.round(
                      prediction.predicted_metrics.conversion_probability * 100
                    )}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Viral Potential</span>
                  <span className="font-medium">
                    {Math.round(
                      prediction.predicted_metrics.viral_potential * 100
                    )}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors & Optimizations */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Factors & Optimizations</CardTitle>
              <CardDescription>
                Areas of concern and improvement suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prediction.risk_factors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">
                      Risk Factors
                    </h4>
                    <ul className="space-y-1">
                      {prediction.risk_factors.map((risk, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-red-600 flex items-start space-x-2"
                        >
                          <AlertTriangle className="h-3 w-3 mt-1 flex-shrink-0" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prediction.optimization_suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">
                      Optimization Suggestions
                    </h4>
                    <ul className="space-y-1">
                      {prediction.optimization_suggestions.map(
                        (suggestion: any, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-green-600 flex items-start space-x-2"
                          >
                            <Lightbulb className="h-3 w-3 mt-1 flex-shrink-0" />
                            <span>{suggestion.recommendation.description}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderSegmentationTab = () => (
    <div className="space-y-6">
      {/* Segmentation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Audience Segmentation</CardTitle>
          <CardDescription>
            ML-powered audience clustering and behavior analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Platforms to Analyze
              </label>
              <Select
                value={segmentationSettings.platforms.join(",")}
                onValueChange={value =>
                  setSegmentationSettings(prev => ({
                    ...prev,
                    platforms: value.split(","),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin,facebook,instagram,twitter">
                    All Platforms
                  </SelectItem>
                  <SelectItem value="linkedin,facebook">
                    Professional Networks
                  </SelectItem>
                  <SelectItem value="instagram,tiktok">
                    Visual Platforms
                  </SelectItem>
                  <SelectItem value="linkedin">LinkedIn Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">
                Minimum Segment Size
              </label>
              <Input
                type="number"
                value={segmentationSettings.min_segment_size}
                onChange={e =>
                  setSegmentationSettings(prev => ({
                    ...prev,
                    min_segment_size: parseInt(e.target.value) || 100,
                  }))
                }
                min="50"
                max="1000"
              />
            </div>
          </div>
          <NormalButton
            onClick={segmentAudience}
            disabled={loading.segmentation}
            className="mt-4 flex items-center space-x-2"
          >
            {loading.segmentation ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            <span>Run Segmentation</span>
          </NormalButton>
        </CardContent>
      </Card>

      {/* Segmentation Results */}
      {analyticsData.dashboard?.audience_segmentation && (
        <div className="space-y-6">
          {/* Segments Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Identified Segments</CardTitle>
              <CardDescription>
                {analyticsData.dashboard.audience_segmentation.segments
                  ?.length || 0}{" "}
                audience segments discovered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.dashboard.audience_segmentation.segments?.map(
                  (segment: any) => (
                    <div
                      key={segment.segment_id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{segment.name}</h4>
                        <Badge variant="outline">
                          {formatNumber(segment.size)} users
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {segment.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Engagement Rate</span>
                          <span className="font-medium">
                            {segment.performance_metrics.avg_engagement_rate}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Conversion Rate</span>
                          <span className="font-medium">
                            {segment.performance_metrics.conversion_rate}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Lifetime Value</span>
                          <span className="font-medium">
                            ${segment.performance_metrics.lifetime_value}
                          </span>
                        </div>
                      </div>
                      {segment.recommended_strategies && (
                        <div className="mt-3">
                          <p className="text-xs font-medium">Strategies:</p>
                          <ul className="text-xs text-muted-foreground mt-1">
                            {segment.recommended_strategies
                              .slice(0, 2)
                              .map((strategy: string, idx: number) => (
                                <li key={idx}>• {strategy}</li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cross-platform Insights */}
          {analyticsData.dashboard.audience_segmentation
            .cross_platform_insights && (
            <Card>
              <CardHeader>
                <CardTitle>Cross-Platform Insights</CardTitle>
                <CardDescription>
                  Patterns across different platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Platform Overlap</h4>
                    <p className="text-sm text-muted-foreground">
                      {
                        analyticsData.dashboard.audience_segmentation
                          .cross_platform_insights.platform_overlap
                      }
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Content Preferences</h4>
                    <p className="text-sm text-muted-foreground">
                      {
                        analyticsData.dashboard.audience_segmentation
                          .cross_platform_insights.content_preferences
                      }
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Timing Insights</h4>
                    <p className="text-sm text-muted-foreground">
                      {
                        analyticsData.dashboard.audience_segmentation
                          .cross_platform_insights.timing_insights
                      }
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Engagement Patterns</h4>
                    <p className="text-sm text-muted-foreground">
                      {
                        analyticsData.dashboard.audience_segmentation
                          .cross_platform_insights.engagement_patterns
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderModelsTab = () => (
    <div className="space-y-6">
      {/* Models Overview */}
      <Card>
        <CardHeader>
          <CardTitle>ML Models Status</CardTitle>
          <CardDescription>
            Machine learning models powering the analytics engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <NormalButton
              onClick={() => updateMLModels([], false)}
              disabled={loading.models}
              variant="outline"
              size="sm"
            >
              Check for Updates
            </NormalButton>
            <NormalButton
              onClick={() => updateMLModels([], true)}
              disabled={loading.models}
              variant="outline"
              size="sm"
            >
              Force Retrain All
            </NormalButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(models || []).map(model => (
              <div key={model.model_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">
                    {model.model_type.replace("_", " ")}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(model.status)}`}
                    ></div>
                    <Badge variant="outline">{model.status}</Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="font-medium">{model.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy</span>
                    <span className="font-medium">
                      {Math.round(model.accuracy * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Training Data</span>
                    <span className="font-medium">
                      {formatNumber(model.training_data_size)} samples
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Trained</span>
                    <span className="font-medium">
                      {new Date(model.last_trained).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <NormalButton
                    onClick={() => updateMLModels([model.model_type], true)}
                    disabled={loading.models}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Retrain Model
                  </NormalButton>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Metrics</CardTitle>
          <CardDescription>
            Detailed accuracy and performance statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(models || []).map(model => (
              <div key={model.model_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium capitalize">
                    {model.model_type.replace("_", " ")}
                  </h4>
                  <Badge
                    className={getStatusColor(model.status)
                      .replace("bg-", "bg-")
                      .replace("500", "100")}
                  >
                    {Math.round(model.accuracy * 100)}% Accuracy
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">
                      {Math.round(model.accuracy * 100)}%
                    </div>
                    <div className="text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">85%</div>
                    <div className="text-muted-foreground">Precision</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">82%</div>
                    <div className="text-muted-foreground">Recall</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">83%</div>
                    <div className="text-muted-foreground">F1-Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Enhanced Interactive Demo Tab
  const renderInteractiveDemoTab = () => (
    <div className="space-y-8">
      {/* Demo Control Panel */}
      <Card className="glass-luxury border-primary-400/20 animate-premium-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary-400 animate-pulse" />
            Interactive Self-Learning Demo
            <Badge variant="outline" className="ml-auto animate-pulse-glow">
              AI Powered
            </Badge>
          </CardTitle>
          <CardDescription>
            Experience real-time machine learning optimization in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Learning Controls */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Learning Controls
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Learning Speed: {learningSpeed}x
                  </label>
                  <Slider
                    value={[learningSpeed]}
                    onValueChange={value => setLearningSpeed(value[0])}
                    max={5}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                    disabled={isDemoRunning}
                  />
                </div>

                <div className="flex gap-2">
                  <NormalButton
                    onClick={startLearningDemo}
                    disabled={isDemoRunning}
                    className="flex-1 btn-premium hover-lift"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Learning
                  </NormalButton>
                  <NormalButton
                    onClick={stopLearningDemo}
                    disabled={!isDemoRunning}
                    variant="outline"
                    className="flex-1"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Stop
                  </NormalButton>
                </div>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Learning Progress
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Model Training</span>
                    <span>{demoProgress.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={demoProgress}
                    className={`h-3 ${isDemoRunning ? "animate-pulse" : ""}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 glass-secondary rounded-lg text-center">
                    <div className="font-semibold text-primary-400">
                      {simulatedMetrics.totalPatterns}
                    </div>
                    <div className="text-muted-foreground">Patterns</div>
                  </div>
                  <div className="p-2 glass-secondary rounded-lg text-center">
                    <div className="font-semibold text-success-400">
                      {simulatedMetrics.activeModels}
                    </div>
                    <div className="text-muted-foreground">Models</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animation Phase */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Status
              </h4>

              <div className="space-y-3">
                <div
                  className={`p-4 rounded-lg border-2 transition-all duration-1000 ${
                    animationPhase === "learning"
                      ? "border-primary-400 bg-primary-400/10 animate-pulse"
                      : animationPhase === "complete"
                        ? "border-success-400 bg-success-400/10 animate-success-pulse"
                        : "border-gray-600 bg-gray-800/50"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        animationPhase === "learning"
                          ? "bg-primary-500/20 text-primary-400"
                          : animationPhase === "complete"
                            ? "bg-success-500/20 text-success-400"
                            : "bg-gray-700/50 text-gray-400"
                      }`}
                    >
                      {animationPhase === "learning" ? (
                        <>
                          <Cpu className="h-4 w-4 animate-spin" />
                          Learning...
                        </>
                      ) : animationPhase === "complete" ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Complete
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4" />
                          Ready
                        </>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Processing Speed:{" "}
                      {simulatedMetrics.processingSpeed.toFixed(3)}s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Accuracy Gauge */}
        <Card className="glass-secondary hover-lift animate-premium-fade-in-up animate-delay-100">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Gauge className="h-8 w-8 mx-auto text-primary-400" />
              <div>
                <div className="text-2xl font-bold gradient-text-primary">
                  {simulatedMetrics.accuracy.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${simulatedMetrics.accuracy}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Speed */}
        <Card className="glass-secondary hover-lift animate-premium-fade-in-up animate-delay-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Zap className="h-8 w-8 mx-auto text-yellow-400 animate-pulse" />
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {simulatedMetrics.learningSpeed.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Learning Speed</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${simulatedMetrics.learningSpeed}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adaptation Rate */}
        <Card className="glass-secondary hover-lift animate-premium-fade-in-up animate-delay-300">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Target className="h-8 w-8 mx-auto text-green-400" />
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {simulatedMetrics.adaptationRate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Adaptation Rate</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${simulatedMetrics.adaptationRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Score */}
        <Card className="glass-secondary hover-lift animate-premium-fade-in-up animate-delay-500">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Award className="h-8 w-8 mx-auto text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {simulatedMetrics.confidenceScore.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Confidence</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${simulatedMetrics.confidenceScore}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress Chart */}
      <Card className="glass-secondary animate-premium-fade-in-scale animate-delay-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-400" />
            Real-time Learning Progress
          </CardTitle>
          <CardDescription>
            Watch the AI model improve its accuracy and confidence over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demoLearningProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  name="Accuracy %"
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  name="Confidence %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Insights Feed */}
      {showRealTimeUpdates && realtimeInsights.length > 0 && (
        <Card className="glass-luxury border-primary-400/30 animate-premium-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400 animate-pulse" />
              Real-time Learning Insights
              <Badge variant="outline" className="ml-auto">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto premium-scrollbar">
              {realtimeInsights.map((insight, index) => (
                <div
                  key={insight.id}
                  className={`p-3 glass-secondary rounded-lg border-l-4 border-primary-400 animate-slide-in-stagger`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{insight.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {insight.timestamp}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence.toFixed(0)}% confidence
                        </Badge>
                      </div>
                    </div>
                    <Sparkles className="h-4 w-4 text-primary-400 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demoInsights.map((insight, index) => (
          <Card
            key={insight.id}
            className="glass-secondary hover-lift animate-premium-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {insight.type === "pattern" && (
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                    )}
                    {insight.type === "trend" && (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    )}
                    {insight.type === "anomaly" && (
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    )}
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        insight.impact === "high"
                          ? "border-red-400 text-red-400"
                          : insight.impact === "medium"
                            ? "border-yellow-400 text-yellow-400"
                            : "border-green-400 text-green-400"
                      }`}
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {insight.confidence}% confident
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    {insight.learnedAt}
                  </span>
                  <div className="w-16 bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-primary-400 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Main render with enhanced demo tab
  return (
    <div className="space-y-6 dark">
      {/* Header */}
      <div className="flex items-center justify-between animate-premium-fade-in">
        <div>
          <h1 className="text-3xl font-bold gradient-text-primary">
            Self-Learning Analytics
          </h1>
          <p className="text-muted-foreground">
            Interactive ML-powered content performance analysis and optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-primary-400 animate-float" />
          <Badge variant="outline" className="animate-pulse-glow">
            AI-Powered Demo
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="animate-premium-fade-in">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: "demo", label: "Interactive Demo", icon: Sparkles },
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "analysis", label: "Analysis", icon: Brain },
            { key: "prediction", label: "Prediction", icon: Eye },
            { key: "segmentation", label: "Segmentation", icon: Users },
            { key: "models", label: "ML Models", icon: BookOpen },
          ].map(tab => (
            <NormalButton
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeTab === tab.key
                  ? "border-primary-400 text-primary-400 animate-glow-pulse"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-600"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </NormalButton>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "demo" && renderInteractiveDemoTab()}
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "analysis" && renderAnalysisTab()}
        {activeTab === "prediction" && renderPredictionTab()}
        {activeTab === "segmentation" && renderSegmentationTab()}
        {activeTab === "models" && renderModelsTab()}
      </div>
    </div>
  );
};

export default SelfLearningAnalyticsDashboard;
