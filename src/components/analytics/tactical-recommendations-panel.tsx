"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Lightbulb,
  TrendingUp,
  Target,
  AlertTriangle,
  Clock,
  DollarSign,
  Brain,
  Filter,
  RefreshCw,
  ArrowDown,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/premium-loading";

interface TacticalRecommendation {
  id: string;
  title: string;
  description: string;
  category: "revenue" | "efficiency" | "customer" | "risk" | "growth";
  priority: "high" | "medium" | "low";
  confidence: number;
  estimated_impact: {
    revenue_increase?: number;
    cost_reduction?: number;
    efficiency_gain?: number;
    risk_reduction?: number;
    timeline_weeks: number;
  };
  action_steps: Array<{
    step: number;
    description: string;
    estimated_effort: "low" | "medium" | "high";
    dependencies: string[];
    resources_needed: string[];
  }>;
  metrics_to_track: string[];
  success_criteria: string[];
  risks: Array<{
    risk: string;
    severity: "low" | "medium" | "high";
    mitigation: string;
  }>;
  status: "new" | "in_progress" | "completed" | "rejected";
  created_at: string;
  updated_at: string;
  tags: string[];
  supporting_data: Record<string, unknown>;
  ai_reasoning: string;
}

interface RecommendationMetrics {
  total_recommendations: number;
  high_priority: number;
  implemented: number;
  potential_revenue_impact: number;
  potential_cost_savings: number;
  average_confidence: number;
  category_distribution: Record<string, number>;
  priority_distribution: Record<string, number>;
  implementation_rate: number;
  success_rate: number;
}

interface TrendAnalysis {
  recommendation_trends: Array<{
    month: string;
    generated: number;
    implemented: number;
    success_rate: number;
  }>;
  category_performance: Array<{
    category: string;
    success_rate: number;
    average_impact: number;
    count: number;
  }>;
  impact_timeline: Array<{
    timeline_weeks: number;
    count: number;
    average_confidence: number;
  }>;
}

const CATEGORY_COLORS = {
  revenue: "#22c55e",
  efficiency: "#3b82f6",
  customer: "#f59e0b",
  risk: "#ef4444",
  growth: "#8b5cf6",
};

const PRIORITY_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

export function TacticalRecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<
    TacticalRecommendation[]
  >([]);
  const [metrics, setMetrics] = useState<RecommendationMetrics | null>(null);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("recommendations");

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  const fetchRecommendations = useCallback(async () => {
    try {
      const [recommendationsRes, metricsRes, trendsRes] = await Promise.all([
        fetch("/api/tactical-analysis/recommendations"),
        fetch("/api/tactical-analysis/recommendations?action=metrics"),
        fetch("/api/tactical-analysis/recommendations?action=trends"),
      ]);

      if (recommendationsRes.ok) {
        const data = await recommendationsRes.json();
        setRecommendations(data.recommendations || []);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.metrics || null);
      }

      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data.trends || null);
      }

      // Generate mock data if APIs don't return data
      if (!recommendations.length) {
        const mockRecommendations: TacticalRecommendation[] = [
          {
            id: "rec-001",
            title: "Optimize Customer Acquisition Funnel",
            description:
              "Implement AI-driven lead scoring and personalized email campaigns to improve conversion rates by 35%",
            category: "revenue",
            priority: "high",
            confidence: 0.89,
            estimated_impact: {
              revenue_increase: 125000,
              timeline_weeks: 8,
            },
            action_steps: [
              {
                step: 1,
                description: "Implement lead scoring algorithm",
                estimated_effort: "high",
                dependencies: [],
                resources_needed: ["Data Scientist", "ML Engineer"],
              },
              {
                step: 2,
                description: "Create personalized email templates",
                estimated_effort: "medium",
                dependencies: ["step-1"],
                resources_needed: ["Marketing Specialist", "Designer"],
              },
              {
                step: 3,
                description: "A/B test new funnel",
                estimated_effort: "low",
                dependencies: ["step-2"],
                resources_needed: ["Marketing Analyst"],
              },
            ],
            metrics_to_track: [
              "Conversion Rate",
              "Lead Quality Score",
              "Email Open Rate",
              "CTR",
            ],
            success_criteria: [
              "35% increase in conversion rate",
              "Lead quality score > 0.7",
              "Email open rate > 25%",
            ],
            risks: [
              {
                risk: "Algorithm bias in lead scoring",
                severity: "medium",
                mitigation: "Regular bias audits and diverse training data",
              },
            ],
            status: "new",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: ["marketing", "ai", "conversion"],
            supporting_data: {
              current_conversion_rate: 0.024,
              current_lead_volume: 5200,
            },
            ai_reasoning:
              "Analysis of customer journey data shows significant drop-off at email engagement stage. ML models predict high success probability for personalized approach.",
          },
          {
            id: "rec-002",
            title: "Automate Customer Support Triage",
            description:
              "Deploy NLP-powered ticket classification to reduce response time by 60% and improve customer satisfaction",
            category: "efficiency",
            priority: "high",
            confidence: 0.92,
            estimated_impact: {
              cost_reduction: 85000,
              efficiency_gain: 0.6,
              timeline_weeks: 6,
            },
            action_steps: [
              {
                step: 1,
                description: "Train NLP model on historical tickets",
                estimated_effort: "high",
                dependencies: [],
                resources_needed: ["NLP Engineer", "Customer Support Manager"],
              },
              {
                step: 2,
                description: "Integrate with support system",
                estimated_effort: "medium",
                dependencies: ["step-1"],
                resources_needed: ["Backend Developer"],
              },
              {
                step: 3,
                description: "Train support team on new system",
                estimated_effort: "low",
                dependencies: ["step-2"],
                resources_needed: ["Training Coordinator"],
              },
            ],
            metrics_to_track: [
              "Average Response Time",
              "Ticket Classification Accuracy",
              "Customer Satisfaction",
              "Agent Productivity",
            ],
            success_criteria: [
              "60% reduction in response time",
              "Classification accuracy > 85%",
              "CSAT > 4.2/5",
            ],
            risks: [
              {
                risk: "Misclassification of urgent tickets",
                severity: "high",
                mitigation: "Human review queue for critical classifications",
              },
            ],
            status: "in_progress",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString(),
            tags: ["automation", "nlp", "support"],
            supporting_data: {
              current_response_time: 4.2,
              ticket_volume: 1200,
            },
            ai_reasoning:
              "Support ticket analysis reveals 70% of tickets follow predictable patterns. NLP classification can significantly improve routing efficiency.",
          },
          {
            id: "rec-003",
            title: "Implement Dynamic Pricing Strategy",
            description:
              "Use ML-powered price optimization to increase profit margins by 18% while maintaining competitive positioning",
            category: "revenue",
            priority: "medium",
            confidence: 0.76,
            estimated_impact: {
              revenue_increase: 95000,
              timeline_weeks: 12,
            },
            action_steps: [
              {
                step: 1,
                description: "Develop pricing optimization model",
                estimated_effort: "high",
                dependencies: [],
                resources_needed: ["Data Scientist", "Business Analyst"],
              },
              {
                step: 2,
                description: "Conduct market analysis",
                estimated_effort: "medium",
                dependencies: [],
                resources_needed: ["Market Research Analyst"],
              },
              {
                step: 3,
                description: "Implement gradual price testing",
                estimated_effort: "medium",
                dependencies: ["step-1", "step-2"],
                resources_needed: ["Product Manager", "Developer"],
              },
            ],
            metrics_to_track: [
              "Profit Margin",
              "Market Share",
              "Customer Churn",
              "Price Elasticity",
            ],
            success_criteria: [
              "18% increase in profit margin",
              "Market share maintained",
              "Churn rate < 5%",
            ],
            risks: [
              {
                risk: "Customer backlash from price changes",
                severity: "medium",
                mitigation: "Gradual implementation with grandfathering",
              },
              {
                risk: "Competitor price matching",
                severity: "low",
                mitigation: "Continuous market monitoring and adjustments",
              },
            ],
            status: "new",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date().toISOString(),
            tags: ["pricing", "ml", "revenue"],
            supporting_data: {
              current_margin: 0.34,
              competitor_prices: [49, 52, 47],
            },
            ai_reasoning:
              "Price elasticity analysis suggests room for optimization. Similar companies have achieved 15-20% margin improvements with dynamic pricing.",
          },
        ];
        setRecommendations(mockRecommendations);
      }

      if (!metrics) {
        setMetrics({
          total_recommendations: 15,
          high_priority: 8,
          implemented: 5,
          potential_revenue_impact: 425000,
          potential_cost_savings: 180000,
          average_confidence: 0.84,
          category_distribution: {
            revenue: 6,
            efficiency: 4,
            customer: 3,
            risk: 1,
            growth: 1,
          },
          priority_distribution: {
            high: 8,
            medium: 5,
            low: 2,
          },
          implementation_rate: 0.33,
          success_rate: 0.8,
        });
      }

      if (!trends) {
        setTrends({
          recommendation_trends: Array.from({ length: 6 }, (_, i) => ({
            month: new Date(
              Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", { month: "short" }),
            generated: Math.floor(Math.random() * 8 + 2),
            implemented: Math.floor(Math.random() * 4 + 1),
            success_rate: Math.random() * 0.3 + 0.7,
          })),
          category_performance: [
            {
              category: "revenue",
              success_rate: 0.85,
              average_impact: 95000,
              count: 6,
            },
            {
              category: "efficiency",
              success_rate: 0.92,
              average_impact: 65000,
              count: 4,
            },
            {
              category: "customer",
              success_rate: 0.78,
              average_impact: 45000,
              count: 3,
            },
            {
              category: "risk",
              success_rate: 0.95,
              average_impact: 120000,
              count: 1,
            },
            {
              category: "growth",
              success_rate: 0.75,
              average_impact: 80000,
              count: 1,
            },
          ],
          impact_timeline: [
            { timeline_weeks: 4, count: 3, average_confidence: 0.91 },
            { timeline_weeks: 8, count: 6, average_confidence: 0.85 },
            { timeline_weeks: 12, count: 4, average_confidence: 0.78 },
            { timeline_weeks: 16, count: 2, average_confidence: 0.72 },
          ],
        });
      }

      setError(null);
    } catch (_err) {
      // Error fetching recommendations
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [recommendations.length, metrics, trends]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecommendations();
  }, [fetchRecommendations]);

  const filteredRecommendations = recommendations.filter(rec => {
    if (categoryFilter !== "all" && rec.category !== categoryFilter)
      return false;
    if (priorityFilter !== "all" && rec.priority !== priorityFilter)
      return false;
    if (statusFilter !== "all" && rec.status !== statusFilter) return false;
    return true;
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case "confidence":
        return b.confidence - a.confidence;
      case "impact":
        const aImpact =
          a.estimated_impact.revenue_increase ||
          a.estimated_impact.cost_reduction ||
          0;
        const bImpact =
          b.estimated_impact.revenue_increase ||
          b.estimated_impact.cost_reduction ||
          0;
        return bImpact - aImpact;
      case "created":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return 0;
    }
  });

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Recommendations
          </h2>
          <p className="text-muted-foreground">
            Strategic insights and actionable business recommendations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <NormalButton
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </NormalButton>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Recommendations
              </CardTitle>
              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {metrics.total_recommendations}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {metrics.high_priority} high priority
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Impact
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                ${(metrics.potential_revenue_impact / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Potential increase
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Implementation Rate
              </CardTitle>
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {Math.round(metrics.implementation_rate * 100)}%
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {metrics.implemented} implemented
              </p>
              <Progress
                value={metrics.implementation_rate * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Confidence
              </CardTitle>
              <Brain className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {Math.round(metrics.average_confidence * 100)}%
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                AI confidence score
              </p>
              <Progress
                value={metrics.average_confidence * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="efficiency">Efficiency</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="risk">Risk</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="confidence">Confidence</SelectItem>
                <SelectItem value="impact">Impact</SelectItem>
                <SelectItem value="created">Created</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {sortedRecommendations.length > 0 ? (
              sortedRecommendations.map(recommendation => (
                <Card key={recommendation.id} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {recommendation.title}
                          </h3>
                          <Badge
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS[recommendation.category],
                            }}
                            className="text-white"
                          >
                            {recommendation.category}
                          </Badge>
                          <Badge
                            variant={
                              recommendation.priority === "high"
                                ? "destructive"
                                : recommendation.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {recommendation.priority} priority
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {recommendation.description}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">
                          {Math.round(recommendation.confidence * 100)}%
                          confident
                        </div>
                        <Progress
                          value={recommendation.confidence * 100}
                          className="w-24"
                        />
                      </div>
                    </div>

                    {/* Impact Metrics */}
                    <div className="grid gap-4 md:grid-cols-3">
                      {recommendation.estimated_impact.revenue_increase && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm">
                            +$
                            {recommendation.estimated_impact.revenue_increase.toLocaleString()}{" "}
                            revenue
                          </span>
                        </div>
                      )}
                      {recommendation.estimated_impact.cost_reduction && (
                        <div className="flex items-center gap-2">
                          <ArrowDown className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            -$
                            {recommendation.estimated_impact.cost_reduction.toLocaleString()}{" "}
                            costs
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">
                          {recommendation.estimated_impact.timeline_weeks} weeks
                        </span>
                      </div>
                    </div>

                    {/* Action Steps Preview */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Action Steps:</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {recommendation.action_steps.slice(0, 2).map(step => (
                          <div
                            key={step.step}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium">
                              {step.step}
                            </div>
                            <span className="truncate">{step.description}</span>
                          </div>
                        ))}
                        {recommendation.action_steps.length > 2 && (
                          <div className="text-sm text-muted-foreground">
                            +{recommendation.action_steps.length - 2} more steps
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-purple-500 mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            AI Reasoning:
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.ai_reasoning}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {recommendation.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No recommendations match your current filters
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {metrics && (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>
                      Recommendations breakdown by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            metrics.category_distribution
                          ).map(([category, count]) => ({
                            name: category,
                            value: count,
                            fill: CATEGORY_COLORS[
                              category as keyof typeof CATEGORY_COLORS
                            ],
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Priority Distribution</CardTitle>
                    <CardDescription>
                      Recommendations breakdown by priority level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={Object.entries(metrics.priority_distribution).map(
                          ([priority, count]) => ({
                            priority,
                            count,
                            fill: PRIORITY_COLORS[
                              priority as keyof typeof PRIORITY_COLORS
                            ],
                          })
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="priority" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Impact vs Confidence Analysis</CardTitle>
                  <CardDescription>
                    Relationship between recommendation confidence and potential
                    impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={recommendations.map(rec => ({
                        title: rec.title.substring(0, 20) + "...",
                        confidence: rec.confidence * 100,
                        impact:
                          (rec.estimated_impact.revenue_increase ||
                            rec.estimated_impact.cost_reduction ||
                            0) / 1000,
                        category: rec.category,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "confidence" ? `${value}%` : `$${value}K`,
                          name === "confidence" ? "Confidence" : "Impact",
                        ]}
                      />
                      <Bar dataKey="confidence" fill="#8884d8" />
                      <Bar dataKey="impact" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {trends && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation Trends</CardTitle>
                  <CardDescription>
                    Monthly trends in recommendation generation and
                    implementation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends.recommendation_trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="generated"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Generated"
                      />
                      <Line
                        type="monotone"
                        dataKey="implemented"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Implemented"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                    <CardDescription>
                      Success rate and impact by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={trends.category_performance}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis domain={[0, 1]} />
                        <Radar
                          name="Success Rate"
                          dataKey="success_rate"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            `${(value * 100).toFixed(1)}%`,
                            "Success Rate",
                          ]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Implementation Timeline</CardTitle>
                    <CardDescription>
                      Distribution by implementation timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={trends.impact_timeline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timeline_weeks"
                          tickFormatter={(value: number) => `${value}w`}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            name === "count"
                              ? value
                              : `${(value * 100).toFixed(1)}%`,
                            name === "count" ? "Count" : "Avg Confidence",
                          ]}
                        />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics ? Math.round(metrics.success_rate * 100) : 0}%
                  </div>
                  <Progress
                    value={metrics ? metrics.success_rate * 100 : 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Of implemented recommendations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Value Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    $
                    {metrics
                      ? Math.round(
                          (metrics.potential_revenue_impact +
                            metrics.potential_cost_savings) /
                            1000
                        )
                      : 0}
                    K
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Combined revenue and savings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">ROI Estimate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics
                      ? Math.round(
                          ((metrics.potential_revenue_impact +
                            metrics.potential_cost_savings) /
                            100000) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Expected return on investment
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recommendation Performance Summary</CardTitle>
                <CardDescription>
                  Key performance indicators for the recommendation system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Implementation Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Generated:</span>
                          <span className="font-medium">
                            {metrics?.total_recommendations || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Currently Implemented:</span>
                          <span className="font-medium">
                            {metrics?.implemented || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Implementation Rate:</span>
                          <span className="font-medium">
                            {metrics
                              ? Math.round(metrics.implementation_rate * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-medium">
                            {metrics
                              ? Math.round(metrics.success_rate * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Impact Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Revenue Impact:</span>
                          <span className="font-medium text-green-600">
                            +$
                            {metrics
                              ? (
                                  metrics.potential_revenue_impact / 1000
                                ).toFixed(0)
                              : 0}
                            K
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost Savings:</span>
                          <span className="font-medium text-blue-600">
                            -$
                            {metrics
                              ? (metrics.potential_cost_savings / 1000).toFixed(
                                  0
                                )
                              : 0}
                            K
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Confidence:</span>
                          <span className="font-medium">
                            {metrics
                              ? Math.round(metrics.average_confidence * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>High Priority:</span>
                          <span className="font-medium text-red-600">
                            {metrics?.high_priority || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
