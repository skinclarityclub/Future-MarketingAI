"use client";

/**
 * Content Learning Engine Dashboard
 * Task 67.1: Interactive demo of content performance data collection and analysis
 *
 * Features demonstrated:
 * - Real-time content performance collection
 * - Pattern recognition and analysis
 * - Content optimization suggestions
 * - Multi-platform analytics integration
 * - Historical performance tracking
 */

import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Target,
  Clock,
  Users,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  Eye,
  BookOpen,
  Activity,
  Database,
  Settings,
} from "lucide-react";

// Types
interface ContentPerformanceData {
  content_id: string;
  title: string;
  platform: string;
  metrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagement_rate: number;
  };
  performance_score: number;
  trends: string[];
}

interface LearningInsight {
  id: string;
  type: "pattern" | "trend" | "opportunity" | "alert";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  recommendations: string[];
}

const ContentLearningEngineDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [contentData, setContentData] = useState<ContentPerformanceData[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>("");

  // Form states
  const [contentId, setContentId] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "linkedin",
  ]);
  const [analysisTimeframe, setAnalysisTimeframe] = useState<string>("30");

  // Load demo data on component mount
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    // Demo content performance data
    const demoContent: ContentPerformanceData[] = [
      {
        content_id: "content-001",
        title: "AI-Powered Marketing Insights voor Enterprise",
        platform: "linkedin",
        metrics: {
          views: 15420,
          likes: 892,
          shares: 156,
          comments: 78,
          engagement_rate: 8.2,
        },
        performance_score: 94,
        trends: ["increasing", "viral_potential"],
      },
      {
        content_id: "content-002",
        title: "Sustainable Business Growth Strategies",
        platform: "facebook",
        metrics: {
          views: 8730,
          likes: 456,
          shares: 89,
          comments: 34,
          engagement_rate: 6.7,
        },
        performance_score: 78,
        trends: ["stable", "audience_growth"],
      },
      {
        content_id: "content-003",
        title: "Remote Work Technology Trends 2024",
        platform: "instagram",
        metrics: {
          views: 12340,
          likes: 1205,
          shares: 234,
          comments: 98,
          engagement_rate: 12.4,
        },
        performance_score: 88,
        trends: ["increasing", "high_engagement"],
      },
    ];

    const demoInsights: LearningInsight[] = [
      {
        id: "insight-001",
        type: "pattern",
        title: "Optimale Posting Tijden Geïdentificeerd",
        description:
          "Content gepost tussen 09:00-11:00 heeft 34% meer engagement op LinkedIn",
        confidence: 92,
        impact: "high",
        recommendations: [
          "Plan belangrijke content tussen 09:00-11:00",
          "Gebruik scheduling tools voor optimale timing",
          "Test verschillende tijden voor verschillende content types",
        ],
      },
      {
        id: "insight-002",
        type: "trend",
        title: "AI-gerelateerde Content Trending",
        description:
          "Content over AI en automatisering toont 58% meer engagement dan gemiddeld",
        confidence: 87,
        impact: "high",
        recommendations: [
          "Verhoog focus op AI-gerelateerde onderwerpen",
          "Creëer educational content over AI implementatie",
          "Ontwikkel case studies over AI successen",
        ],
      },
      {
        id: "insight-003",
        type: "opportunity",
        title: "Video Content Onderbenut",
        description:
          "Video content toont 2.3x meer engagement maar vormt slechts 15% van posts",
        confidence: 85,
        impact: "medium",
        recommendations: [
          "Verhoog video content naar 35% van posts",
          "Experimenteer met korte explainer videos",
          "Gebruik video voor product demonstraties",
        ],
      },
    ];

    setContentData(demoContent);
    setInsights(demoInsights);
  };

  const collectContentData = async () => {
    if (!contentId.trim()) {
      setError("Content ID is verplicht");
      return;
    }

    setLoading(prev => ({ ...prev, collect: true }));
    setError("");

    try {
      const response = await fetch("/api/marketing/self-learning-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "collect_performance",
          contentIds: [contentId],
          platforms: selectedPlatforms,
          includeHistorical: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Add collected data to existing data
        if (result.data.performance_data) {
          const newContent: ContentPerformanceData = {
            content_id: result.data.performance_data.content_id,
            title: result.data.performance_data.title,
            platform: result.data.performance_data.platform,
            metrics: {
              views: result.data.performance_data.metrics.views,
              likes: result.data.performance_data.metrics.likes,
              shares: result.data.performance_data.metrics.shares,
              comments: result.data.performance_data.metrics.comments,
              engagement_rate:
                result.data.performance_data.metrics.engagement_rate,
            },
            performance_score: Math.round(
              result.data.performance_data.metrics.engagement_rate * 10
            ),
            trends: ["new_data"],
          };

          setContentData(prev => [newContent, ...prev]);
        }
      } else {
        setError(result.error || "Failed to collect content data");
      }
    } catch (err) {
      setError(`Error collecting data: ${err}`);
    } finally {
      setLoading(prev => ({ ...prev, collect: false }));
    }
  };

  const runAnalysis = async () => {
    setLoading(prev => ({ ...prev, analysis: true }));
    setError("");

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(analysisTimeframe));

      const response = await fetch("/api/marketing/self-learning-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_performance",
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          platforms: selectedPlatforms,
          contentTypes: ["post", "video", "story"],
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update insights with analysis results
        const analysisInsights: LearningInsight[] = result.data.insights.map(
          (insight: any, index: number) => ({
            id: `analysis-${index}`,
            type: insight.insight_type || "pattern",
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence,
            impact:
              insight.impact_score > 70
                ? "high"
                : insight.impact_score > 40
                  ? "medium"
                  : "low",
            recommendations: insight.actionable_recommendations || [],
          })
        );

        setInsights(prev => [...analysisInsights, ...prev]);
      } else {
        setError(result.error || "Failed to run analysis");
      }
    } catch (err) {
      setError(`Error running analysis: ${err}`);
    } finally {
      setLoading(prev => ({ ...prev, analysis: false }));
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return <Brain className="h-5 w-5" />;
      case "trend":
        return <TrendingUp className="h-5 w-5" />;
      case "opportunity":
        return <Target className="h-5 w-5" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Content Items
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {contentData.length}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Learning Insights
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {insights.length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Performance
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {contentData.length > 0
                    ? Math.round(
                        contentData.reduce(
                          (sum, item) => sum + item.performance_score,
                          0
                        ) / contentData.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  High Impact Insights
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {insights.filter(i => i.impact === "high").length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Content Performance Overview
          </CardTitle>
          <CardDescription>
            Real-time performance data van verzamelde content items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Content</th>
                  <th className="text-left p-2">Platform</th>
                  <th className="text-left p-2">Views</th>
                  <th className="text-left p-2">Engagement</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Trends</th>
                </tr>
              </thead>
              <tbody>
                {contentData.map(item => (
                  <tr key={item.content_id} className="border-b">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          {item.content_id}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{item.platform}</Badge>
                    </td>
                    <td className="p-2">
                      {item.metrics.views.toLocaleString()}
                    </td>
                    <td className="p-2">{item.metrics.engagement_rate}%</td>
                    <td className="p-2">
                      <Badge
                        className={
                          item.performance_score >= 80
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {item.performance_score}%
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {item.trends.map(trend => (
                          <Badge
                            key={trend}
                            variant="secondary"
                            className="text-xs"
                          >
                            {trend}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCollectionTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Content Data Collectie
          </CardTitle>
          <CardDescription>
            Verzamel real-time performance data van je content items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Content ID
              </label>
              <Input
                placeholder="Voer content ID in..."
                value={contentId}
                onChange={e => setContentId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Platforms
              </label>
              <Select
                value={selectedPlatforms[0]}
                onValueChange={value => setSelectedPlatforms([value])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <NormalButton
            onClick={collectContentData}
            disabled={loading.collect}
            className="w-full"
          >
            {loading.collect ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verzamelen...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Verzamel Content Data
              </>
            )}
          </NormalButton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Performance Analyse
          </CardTitle>
          <CardDescription>
            Run AI-powered analysis op verzamelde data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Analyse Timeframe
            </label>
            <Select
              value={analysisTimeframe}
              onValueChange={setAnalysisTimeframe}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Laatste 7 dagen</SelectItem>
                <SelectItem value="30">Laatste 30 dagen</SelectItem>
                <SelectItem value="90">Laatste 90 dagen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NormalButton
            onClick={runAnalysis}
            disabled={loading.analysis}
            className="w-full"
          >
            {loading.analysis ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyseren...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Start AI Analyse
              </>
            )}
          </NormalButton>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Learning Insights
          </CardTitle>
          <CardDescription>
            AI-generated insights en optimalisatie aanbevelingen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map(insight => (
              <Card key={insight.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <h4 className="font-semibold">{insight.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact}
                      </Badge>
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {insight.description}
                  </p>

                  {insight.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Aanbevelingen:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 dark:text-gray-400"
                          >
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Collection
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Learning Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          {renderCollectionTab()}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {renderInsightsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentLearningEngineDashboard;
