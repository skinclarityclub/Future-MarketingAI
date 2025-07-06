"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Brain,
  Target,
  DollarSign,
  Users,
  BarChart3,
  Sparkles,
  Crown,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface Fortune500TrendingIntelligence {
  session_id: string;
  topic_id: string;
  analysis_id: string;
  topic_name: string;
  topic_description: string;
  hashtags: string[];
  platforms: string[];
  trend_score: number;
  momentum: number;
  velocity: number;
  lifecycle_stage: "emerging" | "growth" | "peak" | "mature" | "declining";
  quality_score: number;
  consensus_score: number;
  ai_confidence: number;
  strategic_value: "critical" | "high" | "medium" | "low";
  fortune_500_relevance: number;
  enterprise_readiness: boolean;
  market_opportunity: any;
  competitive_landscape: any;
  content_ideas: string[];
  recommended_actions: any;
  implementation_timeline: any;
  agent_analysis: any;
  forecasting_data: any;
  risk_assessment: any;
  deployment_status:
    | "pending"
    | "ready"
    | "approved"
    | "deployed"
    | "completed";
  workflow_triggers_activated: string[];
}

interface AnalysisConfig {
  analysis_depth: "basic" | "comprehensive" | "fortune_500_premium";
  quality_threshold: number;
  platforms: string[];
  max_trends: number;
  auto_benchmark: boolean;
}

export default function Fortune500TrendingDemo() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [intelligence, setIntelligence] = useState<
    Fortune500TrendingIntelligence[]
  >([]);
  const [config, setConfig] = useState<AnalysisConfig>({
    analysis_depth: "fortune_500_premium",
    quality_threshold: 80,
    platforms: ["Instagram", "TikTok", "LinkedIn"],
    max_trends: 15,
    auto_benchmark: true,
  });
  const [selectedTrend, setSelectedTrend] =
    useState<Fortune500TrendingIntelligence | null>(null);
  const [sessionStats, setSessionStats] = useState({
    session_duration: 0,
    total_cost: 0,
    agents_used: 0,
    benchmarks_analyzed: 0,
  });

  // Simulate Fortune 500 AI Agent analysis
  const runFortune500Analysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setIntelligence([]);

    const steps = [
      "Initializing Fortune 500 AI Agents...",
      "Analyzing trending topics with strategic intelligence...",
      "Running forecasting agent predictions...",
      "Applying quality control validation...",
      "Benchmarking against Fortune 500 companies...",
      "Generating executive recommendations...",
      "Storing intelligence results...",
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      setAnalysisProgress((i / (steps.length - 1)) * 100);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Generate mock Fortune 500 trending intelligence
    const mockIntelligence = generateMockIntelligence();
    setIntelligence(mockIntelligence);
    setSelectedTrend(mockIntelligence[0]);

    // Update session stats
    setSessionStats({
      session_duration: 45,
      total_cost: 8.75,
      agents_used: 4,
      benchmarks_analyzed: 127,
    });

    setIsAnalyzing(false);
    setCurrentStep("Analysis completed successfully!");
  };

  const generateMockIntelligence = (): Fortune500TrendingIntelligence[] => {
    const trends = [
      {
        topic_name: "#SkincareAI",
        hashtags: [
          "#SkincareAI",
          "#PersonalizedBeauty",
          "#TechSkincare",
          "#AIBeauty",
        ],
        trend_score: 94,
        momentum: 89,
        velocity: 76,
        lifecycle_stage: "growth" as const,
        strategic_value: "critical" as const,
        fortune_500_relevance: 92,
        enterprise_readiness: true,
        deployment_status: "ready" as const,
        market_opportunity: {
          size: "$2.3B+",
          growth_rate: "28% CAGR",
          target_segments: ["Premium skincare", "Tech-savvy millennials"],
          investment_recommendation: "Strong Buy",
        },
      },
      {
        topic_name: "#SustainablePackaging",
        hashtags: [
          "#SustainablePackaging",
          "#EcoBeauty",
          "#ZeroWaste",
          "#GreenBeauty",
        ],
        trend_score: 87,
        momentum: 82,
        velocity: 71,
        lifecycle_stage: "growth" as const,
        strategic_value: "high" as const,
        fortune_500_relevance: 85,
        enterprise_readiness: true,
        deployment_status: "ready" as const,
        market_opportunity: {
          size: "$890M+",
          growth_rate: "22% CAGR",
          target_segments: ["Environmentally conscious consumers", "Gen Z"],
          investment_recommendation: "Buy",
        },
      },
      {
        topic_name: "#WellnessTech",
        hashtags: [
          "#WellnessTech",
          "#DigitalWellness",
          "#HealthTech",
          "#MindfulTech",
        ],
        trend_score: 78,
        momentum: 75,
        velocity: 68,
        lifecycle_stage: "emerging" as const,
        strategic_value: "high" as const,
        fortune_500_relevance: 79,
        enterprise_readiness: false,
        deployment_status: "pending" as const,
        market_opportunity: {
          size: "$456M+",
          growth_rate: "31% CAGR",
          target_segments: ["Wellness enthusiasts", "Corporate wellness"],
          investment_recommendation: "Buy",
        },
      },
    ];

    return trends.map((trend, index) => ({
      session_id: `f500_session_${Date.now()}`,
      topic_id: `topic_${index + 1}`,
      analysis_id: `analysis_${Date.now()}_${index}`,
      topic_name: trend.topic_name,
      topic_description: `Fortune 500 trending intelligence analysis for ${trend.topic_name}`,
      hashtags: trend.hashtags,
      platforms: ["Instagram", "TikTok", "LinkedIn"],
      trend_score: trend.trend_score,
      momentum: trend.momentum,
      velocity: trend.velocity,
      lifecycle_stage: trend.lifecycle_stage,
      quality_score: trend.trend_score - 5,
      consensus_score:
        (trend.trend_score + trend.momentum + trend.velocity) / 3,
      ai_confidence: trend.trend_score - 10,
      strategic_value: trend.strategic_value,
      fortune_500_relevance: trend.fortune_500_relevance,
      enterprise_readiness: trend.enterprise_readiness,
      market_opportunity: trend.market_opportunity,
      deployment_status: trend.deployment_status,
      competitive_landscape: {
        key_players: ["L'Oreal", "Unilever", "P&G", "Johnson & Johnson"],
        market_gaps: ["AI personalization", "Sustainable innovation"],
        competitive_advantages: [
          "Direct-to-consumer",
          "Data analytics",
          "Innovation speed",
        ],
      },
      content_ideas: [
        `Educational content about ${trend.topic_name}`,
        `Influencer partnerships in ${trend.topic_name} space`,
        `User-generated content campaigns`,
        `Expert-led webinars and tutorials`,
      ],
      recommended_actions: {
        immediate: [`Deploy ${trend.topic_name} content strategy`],
        short_term: ["Build influencer partnerships", "Develop product line"],
        long_term: ["Market leadership positioning", "Strategic acquisitions"],
      },
      implementation_timeline: {
        week_1: "Strategy development and content creation",
        week_2: "Campaign launch and initial optimization",
        month_1: "Performance analysis and scaling",
        quarter_1: "Market expansion and product development",
      },
      agent_analysis: {
        strategic_insights: {
          opportunities: [
            "First-mover advantage in AI-powered skincare",
            "Strong consumer demand for personalization",
            "Technology integration opportunities",
          ],
          market_size: trend.market_opportunity.size,
          growth_rate: trend.market_opportunity.growth_rate,
          competitive_advantages: [
            "Technology leadership",
            "Data analytics",
            "Customer experience",
          ],
          risk_factors: trend.enterprise_readiness
            ? []
            : ["Market saturation", "Technology complexity"],
        },
        trend_forecasts: {
          trends: [
            {
              name: trend.topic_name,
              momentum: trend.momentum,
              lifecycle: trend.lifecycle_stage,
              peak_timing: "3-4 weeks",
              longevity_estimate: "6-12 months",
              confidence: 88,
            },
          ],
          timing_recommendations: {
            optimal_launch: "Within 1 week",
            peak_opportunity: "2-4 weeks",
            strategic_window: "3 months",
          },
        },
        executive_summary: {
          key_findings: [
            `${trend.topic_name} represents a major market opportunity`,
            "Strong alignment with Fortune 500 strategic objectives",
            "Technology and consumer trends converging favorably",
          ],
          recommendations: [
            "Immediate strategic investment",
            "Cross-platform content deployment",
            "Partnership development",
          ],
          priorities: [
            {
              action: `Launch ${trend.topic_name} initiative`,
              timeline: "2-4 weeks",
              resources_needed:
                "Creative team, $100K budget, Technology partners",
              expected_roi: 350,
            },
          ],
          fortune_500_context: {
            market_positioning: `Position ${trend.topic_name} as premium enterprise solution`,
            investment_recommendation:
              trend.market_opportunity.investment_recommendation,
            expected_enterprise_roi:
              Math.round(trend.fortune_500_relevance * 3) + 200,
            strategic_alignment:
              "Strong alignment with digital transformation objectives",
          },
        },
      },
      forecasting_data: {
        predicted_performance: trend.trend_score + 15,
        confidence_interval: {
          lower: trend.trend_score - 5,
          upper: trend.trend_score + 25,
        },
        timeline_to_peak: "3-4 weeks",
        sustainability_score: trend.enterprise_readiness ? 85 : 65,
      },
      risk_assessment: trend.enterprise_readiness
        ? []
        : ["Market timing risk", "Execution complexity"],
      workflow_triggers_activated: trend.enterprise_readiness
        ? ["fortune500-ai-agent", "executive-review"]
        : ["quality-review"],
    }));
  };

  const getLifecycleIcon = (stage: string) => {
    switch (stage) {
      case "emerging":
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      case "growth":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "peak":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "mature":
        return <Building2 className="h-4 w-4 text-purple-500" />;
      case "declining":
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStrategicValueColor = (value: string) => {
    switch (value) {
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

  const getTrendDirection = (score: number) => {
    if (score >= 80)
      return { icon: ArrowUp, color: "text-green-500", label: "Strong Growth" };
    if (score >= 60)
      return {
        icon: ArrowUp,
        color: "text-blue-500",
        label: "Moderate Growth",
      };
    if (score >= 40)
      return { icon: Minus, color: "text-yellow-500", label: "Stable" };
    return { icon: ArrowDown, color: "text-red-500", label: "Declining" };
  };

  return (
    <div className="dark min-h-screen bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fortune 500 AI Agent Trending Intelligence
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Enterprise-grade trending analysis powered by multiple AI agents,
            benchmarked against Fortune 500 performance standards
          </p>
        </div>

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Fortune 500 Analysis Configuration
            </CardTitle>
            <CardDescription>
              Configure the AI agent analysis parameters for optimal Fortune 500
              intelligence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Analysis Depth
                </label>
                <select
                  className="w-full p-2 border rounded-md bg-gray-800 text-white border-gray-600"
                  value={config.analysis_depth}
                  onChange={e =>
                    setConfig({
                      ...config,
                      analysis_depth: e.target.value as any,
                    })
                  }
                  aria-label="Analysis Depth"
                >
                  <option value="basic">Basic Analysis</option>
                  <option value="comprehensive">Comprehensive</option>
                  <option value="fortune_500_premium">
                    Fortune 500 Premium
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Quality Threshold
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md bg-gray-800 text-white border-gray-600"
                  value={config.quality_threshold}
                  onChange={e =>
                    setConfig({
                      ...config,
                      quality_threshold: parseInt(e.target.value),
                    })
                  }
                  min="50"
                  max="100"
                  aria-label="Quality Threshold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Max Trends
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md bg-gray-800 text-white border-gray-600"
                  value={config.max_trends}
                  onChange={e =>
                    setConfig({
                      ...config,
                      max_trends: parseInt(e.target.value),
                    })
                  }
                  min="5"
                  max="50"
                  aria-label="Max Trends"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Auto Benchmark
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.auto_benchmark}
                    onChange={e =>
                      setConfig({ ...config, auto_benchmark: e.target.checked })
                    }
                    aria-label="Auto Benchmark Against Fortune 500"
                  />
                  <span className="text-sm">Against Fortune 500</span>
                </div>
              </div>
            </div>

            <Button
              onClick={runFortune500Analysis}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running Fortune 500 AI Analysis...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Start Fortune 500 AI Agent Analysis
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Analysis Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(analysisProgress)}%
                  </span>
                </div>
                <Progress value={analysisProgress} className="w-full" />
                <div className="flex items-center gap-2">
                  <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">{currentStep}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Statistics */}
        {intelligence.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {sessionStats.session_duration}m
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Session Duration
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      ${sessionStats.total_cost}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Cost
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {sessionStats.agents_used}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      AI Agents Used
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {sessionStats.benchmarks_analyzed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      F500 Benchmarks
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Display */}
        {intelligence.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trends List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fortune 500 Trending Intelligence
                </CardTitle>
                <CardDescription>
                  {intelligence.length} trends analyzed and benchmarked
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {intelligence.map((trend, index) => {
                  const trendDir = getTrendDirection(trend.trend_score);
                  return (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedTrend?.topic_name === trend.topic_name
                          ? "border-blue-500 bg-blue-900/50"
                          : "border-gray-600"
                      }`}
                      onClick={() => setSelectedTrend(trend)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm text-white">
                            {trend.topic_name}
                          </h3>
                          {getLifecycleIcon(trend.lifecycle_stage)}
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge
                            variant={getStrategicValueColor(
                              trend.strategic_value
                            )}
                            className="text-xs"
                          >
                            {trend.strategic_value.toUpperCase()}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <trendDir.icon
                              className={`h-3 w-3 ${trendDir.color}`}
                            />
                            <span className="text-xs text-gray-400">
                              {trend.trend_score}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>F500 Relevance</span>
                            <span className="font-medium text-white">
                              {trend.fortune_500_relevance}%
                            </span>
                          </div>
                          <Progress
                            value={trend.fortune_500_relevance}
                            className="h-1"
                          />
                        </div>

                        {trend.enterprise_readiness && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-400">
                              Enterprise Ready
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedTrend
                    ? `${selectedTrend.topic_name} - Fortune 500 Intelligence`
                    : "Select a trend to view details"}
                </CardTitle>
                {selectedTrend && (
                  <CardDescription>
                    Comprehensive analysis with Fortune 500 benchmarking and
                    strategic recommendations
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedTrend ? (
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                      <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
                      <TabsTrigger value="recommendations">
                        Recommendations
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedTrend.trend_score}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Trend Score
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedTrend.momentum}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Momentum
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {selectedTrend.quality_score}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Quality Score
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedTrend.fortune_500_relevance}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            F500 Relevance
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Market Opportunity
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Market Size
                              </span>
                              <div className="font-semibold">
                                {selectedTrend.market_opportunity.size}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Growth Rate
                              </span>
                              <div className="font-semibold">
                                {selectedTrend.market_opportunity.growth_rate}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">
                            Hashtags & Platforms
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {selectedTrend.hashtags.map((hashtag, i) => (
                              <Badge key={i} variant="outline">
                                {hashtag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedTrend.platforms.map((platform, i) => (
                              <Badge key={i} variant="secondary">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Strategic Insights
                          </h4>
                          <ul className="space-y-1">
                            {selectedTrend.agent_analysis.strategic_insights.opportunities.map(
                              (opp: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-sm flex items-start gap-2"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {opp}
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">
                            Competitive Landscape
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Key Players:
                              </span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedTrend.competitive_landscape.key_players.map(
                                  (player: string, i: number) => (
                                    <Badge key={i} variant="outline">
                                      {player}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Market Gaps:
                              </span>
                              <ul className="list-disc list-inside text-sm mt-1">
                                {selectedTrend.competitive_landscape.market_gaps.map(
                                  (gap: string, i: number) => (
                                    <li key={i}>{gap}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="benchmarks" className="space-y-4">
                      <Alert>
                        <Building2 className="h-4 w-4" />
                        <AlertDescription>
                          Benchmarked against {sessionStats.benchmarks_analyzed}{" "}
                          Fortune 500 companies across digital marketing, brand
                          performance, and content marketing categories.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Fortune 500 Context
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Investment Recommendation
                              </span>
                              <div className="font-semibold text-lg">
                                {
                                  selectedTrend.market_opportunity
                                    .investment_recommendation
                                }
                              </div>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Expected Enterprise ROI
                              </span>
                              <div className="font-semibold text-lg">
                                {
                                  selectedTrend.agent_analysis.executive_summary
                                    .fortune_500_context.expected_enterprise_roi
                                }
                                %
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">
                            Target Segments
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTrend.market_opportunity.target_segments.map(
                              (segment: string, i: number) => (
                                <Badge key={i} variant="secondary">
                                  {segment}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="recommendations" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Executive Summary
                          </h4>
                          <ul className="space-y-2">
                            {selectedTrend.agent_analysis.executive_summary.key_findings.map(
                              (finding: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-sm flex items-start gap-2"
                                >
                                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                  {finding}
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Content Ideas</h4>
                          <ul className="space-y-1">
                            {selectedTrend.content_ideas.map(
                              (idea: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-sm flex items-start gap-2"
                                >
                                  <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  {idea}
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">
                            Implementation Timeline
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(
                              selectedTrend.implementation_timeline
                            ).map(
                              ([period, action]: [string, any], i: number) => (
                                <div key={i} className="flex items-start gap-3">
                                  <Badge variant="outline">
                                    {period.replace("_", " ").toUpperCase()}
                                  </Badge>
                                  <span className="text-sm">{action}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {selectedTrend.enterprise_readiness && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Enterprise Ready:</strong> This trend
                              meets Fortune 500 quality standards and is ready
                              for immediate deployment.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Select a trending topic from the list to view detailed
                    Fortune 500 intelligence analysis
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
