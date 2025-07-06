"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Brain,
  Target,
  Clock,
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";

interface AIOptimizationRecommendation {
  id: string;
  type: "content" | "timing" | "targeting" | "platform" | "budget" | "process";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  ai_confidence: number;
  predicted_impact: {
    revenue_increase: number;
    engagement_boost: number;
    efficiency_gain: number;
    roi_improvement: number;
    time_to_result: number;
  };
  action_steps: Array<{
    step: number;
    action: string;
    estimated_time: string;
    required_resources: string[];
    success_criteria: string[];
  }>;
  data_sources: string[];
  ml_models_used: string[];
  automation_potential: number;
}

interface AIOptimizationDashboard {
  overall_health_score: number;
  optimization_opportunities: AIOptimizationRecommendation[];
  real_time_insights: {
    trending_content: any[];
    performance_alerts: any[];
    immediate_actions: string[];
  };
  predictive_analytics: {
    next_week_forecast: any;
    optimization_pipeline: any[];
    resource_planning: any;
  };
  cross_platform_insights: {
    platform_performance: Record<string, any>;
    content_migration_opportunities: any[];
    audience_expansion_potential: any[];
  };
  automation_status: {
    active_optimizations: any[];
    scheduled_actions: any[];
    ml_model_performance: any[];
  };
}

const AIOptimizationDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] =
    useState<AIOptimizationDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<AIOptimizationRecommendation | null>(null);

  useEffect(() => {
    // Simulate API call for AI optimization data
    const fetchOptimizationData = async () => {
      setLoading(true);

      // Simulated data - replace with actual API call
      const mockData: AIOptimizationDashboard = {
        overall_health_score: 87,
        optimization_opportunities: [
          {
            id: "ai_content_opt_001",
            type: "content",
            priority: "high",
            title: "AI-Enhanced Content Performance Boost",
            description:
              "Leverage machine learning to identify and optimize underperforming content pieces with personalized AI recommendations.",
            ai_confidence: 94,
            predicted_impact: {
              revenue_increase: 38,
              engagement_boost: 52,
              efficiency_gain: 35,
              roi_improvement: 43,
              time_to_result: 12,
            },
            action_steps: [
              {
                step: 1,
                action: "Run comprehensive AI content analysis",
                estimated_time: "6-8 hours",
                required_resources: [
                  "AI Content Analyst",
                  "Platform API access",
                ],
                success_criteria: [
                  "Content patterns identified",
                  "Optimization opportunities mapped",
                ],
              },
              {
                step: 2,
                action: "Implement AI-powered improvements",
                estimated_time: "15-20 hours",
                required_resources: ["Content team", "AI optimization tools"],
                success_criteria: [
                  "Content updates deployed",
                  "A/B tests launched",
                ],
              },
            ],
            data_sources: [
              "Multi-platform Analytics",
              "User Engagement Metrics",
              "Content Performance History",
            ],
            ml_models_used: [
              "Content Performance Predictor",
              "Engagement Optimizer",
            ],
            automation_potential: 85,
          },
          {
            id: "ai_timing_opt_001",
            type: "timing",
            priority: "high",
            title: "AI-Powered Optimal Timing Intelligence",
            description:
              "Deploy advanced machine learning to predict and schedule content at peak engagement windows.",
            ai_confidence: 91,
            predicted_impact: {
              revenue_increase: 25,
              engagement_boost: 42,
              efficiency_gain: 65,
              roi_improvement: 30,
              time_to_result: 5,
            },
            action_steps: [
              {
                step: 1,
                action: "Deploy AI timing analysis",
                estimated_time: "8-12 hours",
                required_resources: ["ML Engineer", "Audience data"],
                success_criteria: ["Optimal timing windows identified"],
              },
            ],
            data_sources: [
              "Platform Activity Analytics",
              "Audience Engagement Patterns",
            ],
            ml_models_used: ["Timing Predictor", "Audience Behavior Analyzer"],
            automation_potential: 98,
          },
          {
            id: "ai_targeting_opt_001",
            type: "targeting",
            priority: "critical",
            title: "Advanced AI Audience Targeting",
            description:
              "Implement cutting-edge ML for hyper-precise audience segmentation and personalized targeting.",
            ai_confidence: 96,
            predicted_impact: {
              revenue_increase: 55,
              engagement_boost: 68,
              efficiency_gain: 45,
              roi_improvement: 62,
              time_to_result: 18,
            },
            action_steps: [
              {
                step: 1,
                action: "Execute AI audience segmentation",
                estimated_time: "12-16 hours",
                required_resources: ["Data Scientist", "Customer data"],
                success_criteria: ["High-value segments identified"],
              },
            ],
            data_sources: ["Customer Behavioral Data", "Conversion Analytics"],
            ml_models_used: ["Audience Segmenter", "Conversion Predictor"],
            automation_potential: 82,
          },
        ],
        real_time_insights: {
          trending_content: [
            {
              content_id: "trending_1",
              title: "High-performing Instagram Reel",
              engagement: 0.15,
              platform: "instagram",
            },
            {
              content_id: "trending_2",
              title: "Viral LinkedIn Article",
              engagement: 0.12,
              platform: "linkedin",
            },
          ],
          performance_alerts: [
            {
              alert: "Content engagement dropping 15% on Instagram",
              severity: "medium",
              action_required: true,
            },
            {
              alert: "LinkedIn posting frequency below optimal",
              severity: "low",
              action_required: false,
            },
          ],
          immediate_actions: [
            "Boost underperforming Instagram content with AI-optimized hashtags",
            "Schedule LinkedIn posts during peak engagement windows",
            "Review content performance metrics for emerging trends",
          ],
        },
        predictive_analytics: {
          next_week_forecast: {
            engagement: 92,
            revenue: 18500,
            growth_rate: 15,
            top_platform: "instagram",
          },
          optimization_pipeline: [
            {
              optimization: "AI content timing adjustment",
              expected_completion: "2 days",
              impact: "high",
            },
            {
              optimization: "Audience targeting refinement",
              expected_completion: "5 days",
              impact: "medium",
            },
          ],
          resource_planning: {
            content_creation_hours: 45,
            optimization_tasks: 12,
            ai_automation_savings: "25 hours per week",
          },
        },
        cross_platform_insights: {
          platform_performance: {
            instagram: {
              score: 88,
              trend: "increasing",
              ai_recommendations: 3,
            },
            linkedin: { score: 82, trend: "stable", ai_recommendations: 2 },
            twitter: { score: 75, trend: "decreasing", ai_recommendations: 4 },
            tiktok: {
              score: 95,
              trend: "rapidly_increasing",
              ai_recommendations: 1,
            },
          },
          content_migration_opportunities: [
            {
              content: "High-performing LinkedIn post",
              target_platform: "Instagram",
              success_probability: 0.78,
            },
          ],
          audience_expansion_potential: [
            {
              platform: "TikTok",
              audience_overlap: 0.42,
              expansion_potential: "very_high",
            },
          ],
        },
        automation_status: {
          active_optimizations: [
            {
              id: "auto_timing_001",
              name: "Smart Scheduling",
              status: "active",
              performance: "excellent",
            },
            {
              id: "auto_hashtag_002",
              name: "AI Hashtag Optimization",
              status: "active",
              performance: "good",
            },
          ],
          scheduled_actions: [
            { action: "Weekly AI audience analysis", next_run: "2024-01-15" },
          ],
          ml_model_performance: [
            {
              model: "Content Performance Predictor",
              accuracy: 0.91,
              last_updated: "2024-01-10",
            },
          ],
        },
      };

      setTimeout(() => {
        setDashboardData(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchOptimizationData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "content":
        return <Brain className="w-4 h-4" />;
      case "timing":
        return <Clock className="w-4 h-4" />;
      case "targeting":
        return <Target className="w-4 h-4" />;
      case "platform":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
          <h1 className="text-3xl font-bold text-white">
            AI Optimization Engine
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="dark:bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-600 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">
            AI Optimization Engine
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-400 border-green-400">
            AI Confidence:{" "}
            {Math.round(
              dashboardData.optimization_opportunities.reduce(
                (sum, r) => sum + r.ai_confidence,
                0
              ) / dashboardData.optimization_opportunities.length
            )}
            %
          </Badge>
        </div>
      </div>

      {/* Health Score & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dark:bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Overall Health Score
                </p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.overall_health_score}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <Progress
              value={dashboardData.overall_health_score}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  AI Opportunities
                </p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.optimization_opportunities.length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2 space-x-1">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">
                3 high-priority items
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Revenue Forecast
                </p>
                <p className="text-2xl font-bold text-white">
                  €
                  {dashboardData.predictive_analytics.next_week_forecast.revenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2 space-x-1">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">
                +
                {
                  dashboardData.predictive_analytics.next_week_forecast
                    .growth_rate
                }
                % growth
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Automation Active
                </p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.automation_status.active_optimizations.length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-400 mt-2">Saving 25h/week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800">
          <TabsTrigger value="recommendations" className="text-white">
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-white">
            Real-time Insights
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white">
            Predictive Analytics
          </TabsTrigger>
          <TabsTrigger value="automation" className="text-white">
            Automation Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                AI-Powered Optimization Opportunities
              </h3>
              {dashboardData.optimization_opportunities.map(recommendation => (
                <Card
                  key={recommendation.id}
                  className={`dark:bg-gray-800 border-gray-700 cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 ${
                    selectedRecommendation?.id === recommendation.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelectedRecommendation(recommendation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(recommendation.type)}
                        <div>
                          <h4 className="font-semibold text-white">
                            {recommendation.title}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {recommendation.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={getPriorityColor(recommendation.priority)}
                        >
                          {recommendation.priority}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-blue-400 border-blue-400"
                        >
                          {recommendation.ai_confidence}% AI
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Revenue</p>
                        <p className="text-green-400 font-semibold">
                          +{recommendation.predicted_impact.revenue_increase}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Engagement</p>
                        <p className="text-blue-400 font-semibold">
                          +{recommendation.predicted_impact.engagement_boost}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Efficiency</p>
                        <p className="text-yellow-400 font-semibold">
                          +{recommendation.predicted_impact.efficiency_gain}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Time to Result</p>
                        <p className="text-white font-semibold">
                          {recommendation.predicted_impact.time_to_result} days
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">
                          Automation Potential
                        </span>
                        <span className="text-sm text-white">
                          {recommendation.automation_potential}%
                        </span>
                      </div>
                      <Progress
                        value={recommendation.automation_potential}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendation Details */}
            <div>
              {selectedRecommendation ? (
                <Card className="dark:bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Recommendation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-white mb-2">
                        Implementation Steps
                      </h4>
                      <div className="space-y-3">
                        {selectedRecommendation.action_steps.map(step => (
                          <div
                            key={step.step}
                            className="border-l-2 border-blue-500 pl-4"
                          >
                            <p className="font-medium text-white">
                              Step {step.step}: {step.action}
                            </p>
                            <p className="text-sm text-gray-400">
                              Time: {step.estimated_time}
                            </p>
                            <p className="text-sm text-gray-400">
                              Resources: {step.required_resources.join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">
                        AI Models Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecommendation.ml_models_used.map(model => (
                          <Badge
                            key={model}
                            variant="outline"
                            className="text-purple-400 border-purple-400"
                          >
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">
                        Data Sources
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecommendation.data_sources.map(source => (
                          <Badge
                            key={source}
                            variant="outline"
                            className="text-cyan-400 border-cyan-400"
                          >
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <NormalButton variant="primary" className="w-full">
                      Implement AI Recommendation
                    </NormalButton>
                  </CardContent>
                </Card>
              ) : (
                <Card className="dark:bg-gray-800 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <Brain className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Select a recommendation to view detailed implementation
                      steps
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.real_time_insights.performance_alerts.map(
                    (alert, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-gray-700"
                      >
                        <AlertTriangle
                          className={`w-5 h-5 ${alert.severity === "medium" ? "text-yellow-500" : "text-blue-500"}`}
                        />
                        <div>
                          <p className="text-white">{alert.alert}</p>
                          <Badge
                            variant="outline"
                            className={
                              alert.severity === "medium"
                                ? "text-yellow-400 border-yellow-400"
                                : "text-blue-400 border-blue-400"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Trending Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.real_time_insights.trending_content.map(
                    (content, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-700"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {content.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            {content.platform}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">
                            {(content.engagement * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-400">engagement</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Next Week Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Expected Engagement</span>
                    <span className="text-white font-semibold">
                      {
                        dashboardData.predictive_analytics.next_week_forecast
                          .engagement
                      }
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Revenue Forecast</span>
                    <span className="text-green-400 font-semibold">
                      €
                      {dashboardData.predictive_analytics.next_week_forecast.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Growth Rate</span>
                    <span className="text-blue-400 font-semibold">
                      +
                      {
                        dashboardData.predictive_analytics.next_week_forecast
                          .growth_rate
                      }
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Optimization Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.predictive_analytics.optimization_pipeline.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-700"
                      >
                        <div>
                          <p className="text-white">{item.optimization}</p>
                          <p className="text-sm text-gray-400">
                            {item.expected_completion}
                          </p>
                        </div>
                        <Badge
                          className={
                            item.impact === "high"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }
                        >
                          {item.impact}
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Active AI Optimizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.automation_status.active_optimizations.map(
                    optimization => (
                      <div
                        key={optimization.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-700"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {optimization.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            Status: {optimization.status}
                          </p>
                        </div>
                        <Badge
                          className={
                            optimization.performance === "excellent"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }
                        >
                          {optimization.performance}
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  ML Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.automation_status.ml_model_performance.map(
                    (model, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white">{model.model}</span>
                          <span className="text-green-400 font-semibold">
                            {(model.accuracy * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={model.accuracy * 100}
                          className="h-2"
                        />
                        <p className="text-sm text-gray-400">
                          Last updated: {model.last_updated}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIOptimizationDashboard;
