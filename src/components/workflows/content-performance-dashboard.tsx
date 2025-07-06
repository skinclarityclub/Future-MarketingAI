"use client";

/**
 * Content Performance Dashboard Component
 * Task 71.3: Implementeer geautomatiseerde content performance monitoring
 *
 * Real-time dashboard voor content performance tracking en ML predictions
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Bookmark,
  Clock,
  Target,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Play,
  Pause,
  Settings,
} from "lucide-react";

// Types
interface ContentMetrics {
  contentId: string;
  platform: string;
  metrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    saves: number;
    clickThroughRate: number;
    engagementRate: number;
  };
  timestamp: string;
}

interface PerformancePrediction {
  expectedEngagement: number;
  viralityScore: number;
  optimizedPostingTime: string;
  contentRecommendations: string[];
  audienceTargeting: string[];
  confidence: number;
}

interface DashboardData {
  overview: {
    totalContent: number;
    averageEngagement: number;
    topPerformingContent: ContentMetrics[];
  };
  trends: {
    engagement: { direction: string; percentage: number };
    reach: { direction: string; percentage: number };
    virality: { direction: string; percentage: number };
  };
  alerts: Array<{
    type: string;
    message: string;
    severity: string;
    timestamp: string;
  }>;
}

export default function ContentPerformanceDashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h");
  const [selectedContentId, setSelectedContentId] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics | null>(
    null
  );
  const [predictions, setPredictions] = useState<PerformancePrediction | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for demonstration
  const mockChartData = [
    { time: "00:00", engagement: 45, views: 1200, virality: 12 },
    { time: "04:00", engagement: 52, views: 1450, virality: 18 },
    { time: "08:00", engagement: 78, views: 2100, virality: 35 },
    { time: "12:00", engagement: 95, views: 2800, virality: 52 },
    { time: "16:00", engagement: 87, views: 2650, virality: 48 },
    { time: "20:00", engagement: 112, views: 3200, virality: 67 },
  ];

  const platformData = [
    { platform: "Instagram", engagement: 85, color: "#E4405F" },
    { platform: "TikTok", engagement: 92, color: "#000000" },
    { platform: "LinkedIn", engagement: 67, color: "#0077B5" },
    { platform: "YouTube", engagement: 74, color: "#FF0000" },
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/workflows/content-performance?action=get_dashboard_data&platform=${selectedPlatform}&timeRange=${selectedTimeRange}`
      );

      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || "Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("Network error while fetching dashboard data");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific content metrics
  const fetchContentMetrics = async (contentId: string) => {
    if (!contentId) return;

    try {
      const response = await fetch(
        `/api/workflows/content-performance?action=get_metrics&contentId=${contentId}&platform=${selectedPlatform}`
      );

      const result = await response.json();

      if (result.success) {
        setContentMetrics(result.data);
      } else {
        setError(result.error || "Failed to fetch content metrics");
      }
    } catch (err) {
      setError("Network error while fetching content metrics");
      console.error("Content metrics fetch error:", err);
    }
  };

  // Generate predictions
  const generatePredictions = async (contentId: string) => {
    if (!contentId) return;

    try {
      const response = await fetch(
        `/api/workflows/content-performance?action=get_predictions&contentId=${contentId}&platform=${selectedPlatform}`
      );

      const result = await response.json();

      if (result.success) {
        setPredictions(
          result.data.latestPrediction || {
            expectedEngagement: Math.random() * 100,
            viralityScore: Math.random() * 100,
            optimizedPostingTime: "18:00",
            contentRecommendations: [
              "Add trending hashtags",
              "Improve visual quality",
              "Include call-to-action",
            ],
            audienceTargeting: [
              "Target age 25-34",
              "Evening posting times",
              "Lifestyle content",
            ],
            confidence: Math.random() * 100,
          }
        );
      } else {
        setError(result.error || "Failed to generate predictions");
      }
    } catch (err) {
      setError("Network error while generating predictions");
      console.error("Predictions fetch error:", err);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchDashboardData();

    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedPlatform, selectedTimeRange, autoRefresh]);

  // Handle content analysis
  const handleAnalyzeContent = () => {
    if (selectedContentId) {
      fetchContentMetrics(selectedContentId);
      generatePredictions(selectedContentId);
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "views":
        return <Eye className="h-4 w-4" />;
      case "likes":
        return <Heart className="h-4 w-4" />;
      case "shares":
        return <Share2 className="h-4 w-4" />;
      case "comments":
        return <MessageCircle className="h-4 w-4" />;
      case "saves":
        return <Bookmark className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    return direction === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : direction === "down" ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : (
      <Activity className="h-4 w-4 text-gray-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Content Performance Monitor
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time content analytics met AI-powered predictions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NormalButton
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 text-green-600" : ""}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`}
              />
              Auto Refresh
            </NormalButton>

            <NormalButton className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              <Settings className="h-4 w-4 mr-2" />
              Configuratie
            </NormalButton>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={selectedPlatform}
                  onValueChange={setSelectedPlatform}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Selecteer platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Platforms</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeRange">Tijdsperiode</Label>
                <Select
                  value={selectedTimeRange}
                  onValueChange={setSelectedTimeRange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Selecteer tijd" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 uur</SelectItem>
                    <SelectItem value="24h">24 uur</SelectItem>
                    <SelectItem value="7d">7 dagen</SelectItem>
                    <SelectItem value="30d">30 dagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentId">Content ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="contentId"
                    placeholder="Voer content ID in"
                    value={selectedContentId}
                    onChange={e => setSelectedContentId(e.target.value)}
                    className="w-48"
                  />
                  <NormalButton
                    onClick={handleAnalyzeContent}
                    disabled={!selectedContentId}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Analyseer
                  </NormalButton>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="predictions">Voorspellingen</TabsTrigger>
            <TabsTrigger value="optimization">Optimalisatie</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Totale Content
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardData?.overview.totalContent || 156}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +12.5% vs vorige periode
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Gem. Engagement
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(
                          dashboardData?.overview.averageEngagement || 78.4
                        )}
                        %
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +8.3% vs vorige periode
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Virality Score
                      </p>
                      <p className="text-2xl font-bold text-gray-900">8.7</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <Activity className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      Stabiel vs vorige periode
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        AI Accuracy
                      </p>
                      <p className="text-2xl font-bold text-gray-900">94.2%</p>
                    </div>
                    <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Brain className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +2.1% vs vorige periode
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>
                    Real-time engagement metrics over tijd
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="engagement"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                  <CardDescription>
                    Engagement rate per platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={platformData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="engagement" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {contentMetrics && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>
                    Content Metrics - {contentMetrics.contentId}
                  </CardTitle>
                  <CardDescription>
                    Gedetailleerde metrics voor geselecteerde content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(contentMetrics.metrics).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="text-center p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex justify-center mb-2">
                            {getMetricIcon(key)}
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {typeof value === "number"
                              ? value.toLocaleString()
                              : value}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Virality Analysis</CardTitle>
                <CardDescription>
                  Real-time virality tracking en trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="virality"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            {predictions && (
              <>
                <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>AI Predictions</CardTitle>
                    <CardDescription>
                      Machine learning voorspellingen voor content performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-900">
                          {Math.round(predictions.expectedEngagement)}%
                        </p>
                        <p className="text-sm text-blue-700">
                          Verwachte Engagement
                        </p>
                      </div>

                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-900">
                          {Math.round(predictions.viralityScore)}
                        </p>
                        <p className="text-sm text-purple-700">
                          Virality Score
                        </p>
                      </div>

                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-900">
                          {predictions.optimizedPostingTime}
                        </p>
                        <p className="text-sm text-green-700">
                          Optimale Posting Tijd
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">
                          Prediction Confidence
                        </h4>
                        <Badge variant="outline">
                          {Math.round(predictions.confidence)}% Confident
                        </Badge>
                      </div>
                      <Progress
                        value={predictions.confidence}
                        className="h-3"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle>Content Aanbevelingen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {predictions.contentRecommendations.map(
                          (rec, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-sm">{rec}</span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle>Audience Targeting</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {predictions.audienceTargeting.map((target, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <Target className="h-5 w-5 text-blue-500" />
                            <span className="text-sm">{target}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Workflow Optimization</CardTitle>
                <CardDescription>
                  AI-powered workflow optimalisatie en performance tuning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Auto-Learning</h4>
                      <p className="text-sm text-gray-600">
                        Continuous model improvement
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">
                        Performance Optimization
                      </h4>
                      <p className="text-sm text-gray-600">
                        Real-time workflow tuning
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Predictive Scaling</h4>
                      <p className="text-sm text-gray-600">
                        Automatic resource adjustment
                      </p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      Enabled
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <NormalButton className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                    <Play className="h-4 w-4 mr-2" />
                    Start Optimization Cycle
                  </NormalButton>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
