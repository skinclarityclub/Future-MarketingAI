"use client";

import { useState, useEffect } from "react";
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
import {
  AlertTriangle,
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  Users,
  Settings,
  ChevronRight,
  Lightbulb,
  Zap,
} from "lucide-react";
import type {
  OptimizationInsights,
  OptimizationRecommendation,
} from "@/lib/analytics/optimization-engine";

interface OptimizationRecommendationsProps {
  className?: string;
}

export function OptimizationRecommendations({
  className,
}: OptimizationRecommendationsProps) {
  const [insights, setInsights] = useState<OptimizationInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOptimizationInsights();
  }, []);

  const fetchOptimizationInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/optimization");
      const data = await response.json();

      if (data.success) {
        setInsights(data.data);
      } else {
        setError(data.error || "Failed to fetch optimization insights");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Error fetching optimization insights:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error loading optimization recommendations: {error}</p>
            <NormalButton
              onClick={fetchOptimizationInsights}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </NormalButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>No optimization insights available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portfolio Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Health Score
          </CardTitle>
          <CardDescription>
            Overall performance assessment of your content portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-blue-600">
              {insights.portfolio_health_score}
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    insights.portfolio_health_score >= 80
                      ? "bg-green-500"
                      : insights.portfolio_health_score >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${insights.portfolio_health_score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {insights.portfolio_health_score >= 80
                  ? "Excellent"
                  : insights.portfolio_health_score >= 60
                    ? "Good"
                    : insights.portfolio_health_score >= 40
                      ? "Fair"
                      : "Needs Improvement"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Growth Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                $
                {insights.predictions.next_month_revenue_range.min.toLocaleString()}{" "}
                - $
                {insights.predictions.next_month_revenue_range.max.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Next Month Revenue Range</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {insights.predictions.content_saturation_risk}%
              </div>
              <p className="text-sm text-gray-600">Content Saturation Risk</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {insights.predictions.growth_trajectory}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">Growth Trajectory</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Tabs */}
      <Tabs defaultValue="top-opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="top-opportunities"
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Top Opportunities ({insights.top_opportunities.length})
          </TabsTrigger>
          <TabsTrigger value="quick-wins" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Wins ({insights.quick_wins.length})
          </TabsTrigger>
          <TabsTrigger value="strategic" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Strategic ({insights.strategic_initiatives.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top-opportunities" className="space-y-4">
          <RecommendationsList recommendations={insights.top_opportunities} />
        </TabsContent>

        <TabsContent value="quick-wins" className="space-y-4">
          <RecommendationsList recommendations={insights.quick_wins} />
        </TabsContent>

        <TabsContent value="strategic" className="space-y-4">
          <RecommendationsList
            recommendations={insights.strategic_initiatives}
          />
        </TabsContent>
      </Tabs>

      {/* Performance Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Patterns</CardTitle>
          <CardDescription>
            Key insights from your content performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">
                High Performer Traits
              </h4>
              <ul className="space-y-1">
                {insights.patterns.high_performers_traits.map(
                  (trait, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {trait}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 mb-2">Common Issues</h4>
              <ul className="space-y-1">
                {insights.patterns.underperformer_issues.map((issue, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RecommendationsList({
  recommendations,
}: {
  recommendations: OptimizationRecommendation[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "content":
        return <Users className="h-4 w-4" />;
      case "pricing":
        return <DollarSign className="h-4 w-4" />;
      case "marketing":
        return <TrendingUp className="h-4 w-4" />;
      case "distribution":
        return <Target className="h-4 w-4" />;
      case "production":
        return <Settings className="h-4 w-4" />;
      case "engagement":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "low":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "high":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case "immediate":
        return "text-red-600 bg-red-50";
      case "short_term":
        return "text-orange-600 bg-orange-50";
      case "medium_term":
        return "text-blue-600 bg-blue-50";
      case "long_term":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatTimeframe = (timeframe: string) => {
    switch (timeframe) {
      case "immediate":
        return "<1 week";
      case "short_term":
        return "1-4 weeks";
      case "medium_term":
        return "1-3 months";
      case "long_term":
        return ">3 months";
      default:
        return timeframe;
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No recommendations available in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map(rec => (
        <Card key={rec.id} className="hover:shadow-md transition-shadow">
          <CardHeader
            className="cursor-pointer"
            onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(rec.category)}
                  <div
                    className={`w-3 h-3 rounded-full ${getPriorityColor(rec.priority)}`}
                  ></div>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {rec.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={getEffortColor(rec.effort_required)}
                    >
                      {rec.effort_required} effort
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getTimeframeColor(rec.timeframe)}
                    >
                      {formatTimeframe(rec.timeframe)}
                    </Badge>
                    <Badge variant="outline">{rec.impact_score}% impact</Badge>
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`h-5 w-5 transition-transform ${
                  expandedId === rec.id ? "rotate-90" : ""
                }`}
              />
            </div>
          </CardHeader>

          {expandedId === rec.id && (
            <CardContent>
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Current vs Target</h4>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-gray-600">Current:</span>{" "}
                        {rec.current_value}
                      </div>
                      <div>
                        <span className="text-gray-600">Target:</span>{" "}
                        {rec.target_value}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Confidence & Impact</h4>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-gray-600">Confidence:</span>{" "}
                        {rec.confidence}%
                      </div>
                      <div>
                        <span className="text-gray-600">Impact Score:</span>{" "}
                        {rec.impact_score}%
                      </div>
                    </div>
                  </div>
                </div>

                {rec.action_items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Action Items</h4>
                    <ul className="text-sm space-y-1">
                      {rec.action_items.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {rec.success_metrics.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Success Metrics</h4>
                    <ul className="text-sm space-y-1">
                      {rec.success_metrics.map((metric, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="h-3 w-3 mt-1 text-green-600" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Reasoning</h4>
                  <p className="text-sm text-gray-700">{rec.reasoning}</p>
                </div>

                {rec.implementation_steps.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Implementation Steps</h4>
                    <div className="space-y-2">
                      {rec.implementation_steps.map((step, index) => (
                        <div
                          key={index}
                          className="flex gap-3 text-sm border-l-2 border-blue-200 pl-3"
                        >
                          <div className="font-medium text-blue-600">
                            {step.step}.
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{step.action}</div>
                            <div className="text-gray-600 flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {step.estimated_time}
                              </span>
                              <span>
                                Skills: {step.required_skills.join(", ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
