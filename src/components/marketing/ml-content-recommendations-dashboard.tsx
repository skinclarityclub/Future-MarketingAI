"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  Brain,
  BarChart3,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
} from "lucide-react";

import {
  ContentRecommendation,
  MLContentInsights,
} from "@/lib/ml/content-recommendations-engine";

export default function MLContentRecommendationsDashboard() {
  const [insights, setInsights] = useState<MLContentInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchMLInsights();
  }, []);

  const fetchMLInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/content-ml-recommendations?action=insights"
      );
      const data = await response.json();

      if (data.success) {
        setInsights(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch ML insights:", error);
    } finally {
      setLoading(false);
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

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return <Target className="h-5 w-5" />;
      case "new_content":
        return <Lightbulb className="h-5 w-5" />;
      case "a_b_test":
        return <BarChart3 className="h-5 w-5" />;
      case "timing":
        return <Clock className="h-5 w-5" />;
      case "platform_expansion":
        return <Users className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">AI is analyzing your content...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Failed to load ML insights</p>
          <NormalButton onClick={fetchMLInsights} className="mt-4">
            Retry
          </NormalButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            AI Content Recommendations
          </h1>
          <p className="text-gray-600 mt-2">
            Machine learning-powered insights for content optimization
          </p>
        </div>
        <NormalButton
          onClick={fetchMLInsights}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <Brain className="h-4 w-4 mr-2" />
          Refresh AI Analysis
        </NormalButton>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Content Analyzed
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {insights.performance_trends.trending_up.length +
                insights.performance_trends.trending_down.length +
                insights.performance_trends.stable_performers.length}
            </div>
            <p className="text-xs text-blue-600">Pieces of content</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Opportunities Found
            </CardTitle>
            <Target className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {insights.optimization_opportunities.length}
            </div>
            <p className="text-xs text-green-600">
              Optimization recommendations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Avg. Impact
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              +
              {Math.round(
                insights.optimization_opportunities.reduce(
                  (sum, rec) => sum + rec.estimated_impact.roi_improvement,
                  0
                ) / insights.optimization_opportunities.length || 0
              )}
              %
            </div>
            <p className="text-xs text-purple-600">Expected ROI improvement</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              AI Confidence
            </CardTitle>
            <Brain className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {Math.round(
                (insights.optimization_opportunities.reduce(
                  (sum, rec) => sum + rec.confidence_score,
                  0
                ) / insights.optimization_opportunities.length || 0) * 100
              )}
              %
            </div>
            <p className="text-xs text-orange-600">Average confidence level</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Content Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Trending Up
                    </span>
                    <span className="font-bold">
                      {insights.performance_trends.trending_up.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      Stable
                    </span>
                    <span className="font-bold">
                      {insights.performance_trends.stable_performers.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Needs Attention
                    </span>
                    <span className="font-bold">
                      {insights.performance_trends.trending_down.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Top AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.optimization_opportunities
                    .slice(0, 3)
                    .map((rec, index) => (
                      <div
                        key={rec.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="p-1 bg-blue-100 rounded">
                          {getRecommendationIcon(rec.recommendation_type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {rec.description.slice(0, 80)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              className={`text-xs ${getPriorityColor(rec.priority)}`}
                            >
                              {rec.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              +{rec.estimated_impact.roi_improvement}% ROI
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            {insights.optimization_opportunities.map(
              (recommendation, index) => (
                <Card
                  key={recommendation.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getRecommendationIcon(
                            recommendation.recommendation_type
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {recommendation.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {recommendation.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getPriorityColor(recommendation.priority)}
                        >
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(recommendation.confidence_score * 100)}%
                          confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Impact Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            +{recommendation.estimated_impact.engagement_lift}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Engagement
                          </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            +{recommendation.estimated_impact.conversion_lift}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Conversion
                          </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">
                            +{recommendation.estimated_impact.roi_improvement}%
                          </div>
                          <div className="text-sm text-gray-600">ROI</div>
                        </div>
                      </div>

                      {/* Action Items */}
                      <div>
                        <h4 className="font-medium mb-2">Next Steps</h4>
                        <ul className="space-y-1">
                          {recommendation.action_items
                            .slice(0, 3)
                            .map((action, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-sm text-gray-600"
                              >
                                <ArrowRight className="h-4 w-4 text-blue-500" />
                                {action}
                              </li>
                            ))}
                        </ul>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Effort: {recommendation.implementation_effort}
                          </span>
                          <span>Timeline: {recommendation.timeframe}</span>
                        </div>
                        <NormalButton
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Implement
                        </NormalButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Next Month Forecast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(
                        insights.predictive_analytics.next_month_forecast
                          .engagement_prediction * 100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-gray-600">
                      Predicted Engagement Rate
                    </div>
                    <Progress
                      value={
                        insights.predictive_analytics.next_month_forecast
                          .engagement_prediction * 100
                      }
                      className="mt-2"
                    />
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(
                        insights.predictive_analytics.next_month_forecast
                          .conversion_prediction * 100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-gray-600">
                      Predicted Conversion Rate
                    </div>
                    <Progress
                      value={
                        insights.predictive_analytics.next_month_forecast
                          .conversion_prediction * 100
                      }
                      className="mt-2"
                    />
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {insights.predictive_analytics.next_month_forecast.revenue_prediction.toFixed(
                        0
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600">Predicted ROI</div>
                    <Progress
                      value={Math.min(
                        100,
                        insights.predictive_analytics.next_month_forecast
                          .revenue_prediction
                      )}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emerging Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Emerging Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.predictive_analytics.emerging_trends.map(
                    (trend, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{trend.trend}</h4>
                          <Badge variant="outline">
                            {Math.round(trend.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {trend.recommendation}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seasonal Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.predictive_analytics.seasonal_patterns.map(
                  (pattern, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{pattern.pattern}</h4>
                      <div
                        className={`text-2xl font-bold mb-2 ${pattern.impact > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {pattern.impact > 0 ? "+" : ""}
                        {pattern.impact}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {pattern.months.join(", ")}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
