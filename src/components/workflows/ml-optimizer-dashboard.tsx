"use client";

/**
 * ML Content Optimizer Dashboard
 * Task 71.4: Creëer self-learning algoritmes voor content optimalisatie
 *
 * Dashboard voor machine learning content optimization management
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Lightbulb,
  Cpu,
  Database,
} from "lucide-react";

// Types
interface LearningModel {
  id: string;
  name: string;
  type: string;
  version: string;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  status: "training" | "ready" | "updating" | "error";
  trainingData: {
    size: number;
    lastUpdated: string;
  };
}

interface OptimizationSuggestion {
  type: string;
  priority: "high" | "medium" | "low";
  confidence: number;
  suggestion: string;
  reasoning: string;
  expectedImprovement: number;
  implementation: {
    difficulty: string;
    timeRequired: string;
    resources: string[];
  };
}

interface OptimizerAnalytics {
  totalOptimizations: number;
  successRate: number;
  averageImprovement: number;
  topSuggestionTypes: Array<{
    type: string;
    count: number;
    successRate: number;
  }>;
  modelPerformance: Array<{
    modelId: string;
    accuracy: number;
    usage: number;
  }>;
}

export default function MLOptimizerDashboard() {
  const [models, setModels] = useState<LearningModel[]>([]);
  const [analytics, setAnalytics] = useState<OptimizerAnalytics | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizeContent, setOptimizeContent] = useState({
    id: "",
    title: "",
    content: "",
    platform: "instagram",
    tags: "",
    mediaType: "text",
  });

  // Mock data for visualization
  const modelAccuracyData = [
    { model: "Content Performance", accuracy: 94.2, target: 95 },
    { model: "Audience Segmentation", accuracy: 87.8, target: 90 },
    { model: "Timing Optimization", accuracy: 91.5, target: 92 },
    { model: "Visual Optimization", accuracy: 89.3, target: 88 },
  ];

  const optimizationTrends = [
    { date: "2024-01", optimizations: 45, success: 38, improvement: 12.5 },
    { date: "2024-02", optimizations: 62, success: 54, improvement: 15.2 },
    { date: "2024-03", optimizations: 78, success: 71, improvement: 18.7 },
    { date: "2024-04", optimizations: 94, success: 89, improvement: 22.1 },
    { date: "2024-05", optimizations: 112, success: 106, improvement: 25.3 },
    { date: "2024-06", optimizations: 128, success: 122, improvement: 28.9 },
  ];

  const suggestionTypeData = [
    { type: "Content", count: 145, color: "#3B82F6" },
    { type: "Timing", count: 98, color: "#10B981" },
    { type: "Hashtags", count: 87, color: "#F59E0B" },
    { type: "Audience", count: 76, color: "#EF4444" },
    { type: "Visual", count: 54, color: "#8B5CF6" },
  ];

  // Fetch optimizer status
  const fetchOptimizerStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "/api/workflows/ml/content-optimizer?action=status"
      );
      const result = await response.json();

      if (result.success) {
        setModels(result.data.models || []);
      } else {
        setError(result.error || "Failed to fetch optimizer status");
      }
    } catch (err) {
      setError("Network error while fetching optimizer status");
      console.error("Optimizer status fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        "/api/workflows/ml/content-optimizer?action=analytics"
      );
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data.analytics);
      } else {
        setError(result.error || "Failed to fetch analytics");
      }
    } catch (err) {
      setError("Network error while fetching analytics");
      console.error("Analytics fetch error:", err);
    }
  };

  // Optimize content
  const handleOptimizeContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const content = {
        id: optimizeContent.id || `content-${Date.now()}`,
        title: optimizeContent.title,
        content: optimizeContent.content,
        platform: optimizeContent.platform,
        tags: optimizeContent.tags
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean),
        mediaType: optimizeContent.mediaType,
      };

      const response = await fetch(
        "/api/workflows/ml/content-optimizer?action=optimize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuggestions(result.data.suggestions || []);
      } else {
        setError(result.error || "Failed to optimize content");
      }
    } catch (err) {
      setError("Network error while optimizing content");
      console.error("Content optimization error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchOptimizerStatus();
    fetchAnalytics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "training":
        return "bg-blue-100 text-blue-800";
      case "updating":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              ML Content Optimizer
            </h1>
            <p className="text-gray-600 mt-2">
              Self-learning algoritmes voor geautomatiseerde content
              optimalisatie
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NormalButton
              variant="outline"
              size="sm"
              onClick={fetchOptimizerStatus}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Ververs Status
            </NormalButton>

            <NormalButton variant="primary" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configuratie
            </NormalButton>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="models">Modellen</TabsTrigger>
            <TabsTrigger value="optimize">Optimaliseren</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
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
                        Actieve Modellen
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {models.filter(m => m.status === "ready").length}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      Alle systemen operationeel
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Gem. Nauwkeurigheid
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {models.length > 0
                          ? Math.round(
                              models.reduce(
                                (acc, m) => acc + m.performance.accuracy,
                                0
                              ) / models.length
                            )
                          : 92}
                        %
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +3.2% vs vorige maand
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Optimalisaties
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics?.totalOptimizations || 1247}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +28% deze maand
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Successrate
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(analytics?.successRate || 94.8)}%
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +1.2% verbetering
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Model Nauwkeurigheid</CardTitle>
                  <CardDescription>Performance van ML modellen</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={modelAccuracyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" />
                      <YAxis domain={[80, 100]} />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="#8B5CF6" />
                      <Bar dataKey="target" fill="#E5E7EB" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Optimalisatie Trends</CardTitle>
                  <CardDescription>
                    Maandelijkse optimalisatie performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={optimizationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="optimizations"
                        stroke="#3B82F6"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="success"
                        stroke="#10B981"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Suggestion Types */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Suggestie Types</CardTitle>
                <CardDescription>
                  Verdeling van optimalisatie suggesties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={suggestionTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {suggestionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-4">
                  {suggestionTypeData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">
                        {item.type} ({item.count})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {models.map(model => (
                <Card
                  key={model.id}
                  className="bg-white/70 backdrop-blur-sm border-white/20"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {model.type} • Version {model.version}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Nauwkeurigheid</span>
                          <span>
                            {Math.round(model.performance.accuracy * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={model.performance.accuracy * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Precisie</span>
                          <p className="font-semibold">
                            {Math.round(model.performance.precision * 100)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Recall</span>
                          <p className="font-semibold">
                            {Math.round(model.performance.recall * 100)}%
                          </p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-600">Training Data</span>
                        <p className="font-semibold">
                          {model.trainingData.size.toLocaleString()} samples
                        </p>
                        <p className="text-xs text-gray-500">
                          Laatste update:{" "}
                          {new Date(
                            model.trainingData.lastUpdated
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <NormalButton size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-1" />
                          Train
                        </NormalButton>
                        <NormalButton size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Config
                        </NormalButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Optimize Tab */}
          <TabsContent value="optimize" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Input */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Content Optimaliseren</CardTitle>
                  <CardDescription>
                    Voer je content in voor AI-powered optimalisatie suggesties
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content-id">Content ID</Label>
                    <Input
                      id="content-id"
                      placeholder="Optioneel - wordt automatisch gegenereerd"
                      value={optimizeContent.id}
                      onChange={e =>
                        setOptimizeContent(prev => ({
                          ...prev,
                          id: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content-title">Titel</Label>
                    <Input
                      id="content-title"
                      placeholder="Content titel"
                      value={optimizeContent.title}
                      onChange={e =>
                        setOptimizeContent(prev => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content-text">Content</Label>
                    <Textarea
                      id="content-text"
                      placeholder="Voer je content tekst in..."
                      rows={6}
                      value={optimizeContent.content}
                      onChange={e =>
                        setOptimizeContent(prev => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <Select
                        value={optimizeContent.platform}
                        onValueChange={value =>
                          setOptimizeContent(prev => ({
                            ...prev,
                            platform: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="media-type">Media Type</Label>
                      <Select
                        value={optimizeContent.mediaType}
                        onValueChange={value =>
                          setOptimizeContent(prev => ({
                            ...prev,
                            mediaType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Tekst</SelectItem>
                          <SelectItem value="image">Afbeelding</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="carousel">Carousel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags/Hashtags</Label>
                    <Input
                      id="tags"
                      placeholder="Gescheiden door komma's"
                      value={optimizeContent.tags}
                      onChange={e =>
                        setOptimizeContent(prev => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <NormalButton
                    onClick={handleOptimizeContent}
                    disabled={loading || !optimizeContent.content}
                    variant="primary"
                    className="w-full"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {loading ? "Optimaliseren..." : "Optimaliseer Content"}
                  </NormalButton>
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Optimalisatie Suggesties</CardTitle>
                  <CardDescription>
                    AI-generated suggesties voor betere performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestions.length > 0 ? (
                    <div className="space-y-4">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getPriorityColor(
                                  suggestion.priority
                                )}
                              >
                                {suggestion.priority}
                              </Badge>
                              <Badge variant="outline">{suggestion.type}</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {Math.round(suggestion.confidence * 100)}% zeker
                            </div>
                          </div>

                          <h4 className="font-semibold text-gray-900 mb-2">
                            {suggestion.suggestion}
                          </h4>

                          <p className="text-sm text-gray-600 mb-3">
                            {suggestion.reasoning}
                          </p>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-green-600 font-medium">
                                +{suggestion.expectedImprovement}% verbetering
                              </span>
                              <span className="text-gray-500">
                                {suggestion.implementation.timeRequired}
                              </span>
                            </div>
                            <Badge variant="outline">
                              {suggestion.implementation.difficulty}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        Voer content in om optimalisatie suggesties te krijgen
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Gedetailleerde performance metrics van het ML systeem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Cpu className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">
                      {analytics?.totalOptimizations || 1247}
                    </p>
                    <p className="text-sm text-blue-700">
                      Totale Optimalisaties
                    </p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">
                      {Math.round(analytics?.successRate || 94.8)}%
                    </p>
                    <p className="text-sm text-green-700">Successrate</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">
                      +{Math.round(analytics?.averageImprovement || 23.4)}%
                    </p>
                    <p className="text-sm text-purple-700">Gem. Verbetering</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Model Training</CardTitle>
                <CardDescription>
                  Beheer en monitor ML model training processen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Continuous Learning</h4>
                      <p className="text-sm text-gray-600">
                        Automatische model updates gebaseerd op nieuwe data
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Actief
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Model Retraining</h4>
                      <p className="text-sm text-gray-600">
                        Periodieke hertraining van alle modellen
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Volgende: 2u 15m
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Data Pipeline</h4>
                      <p className="text-sm text-gray-600">
                        Real-time data processing en feature extraction
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <NormalButton variant="primary" className="w-full">
                      <Database className="h-4 w-4 mr-2" />
                      Start Manual Training Cycle
                    </NormalButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
