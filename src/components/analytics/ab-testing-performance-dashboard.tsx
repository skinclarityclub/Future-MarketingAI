"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface ABTestingAnalytics {
  performance_overview: {
    total_tests: number;
    running_tests: number;
    completed_tests: number;
    tests_with_winners: number;
    average_improvement: number;
    total_sample_size: number;
    success_rate: number;
    performance_by_type: Record<string, any>;
  };
  roi_impact: {
    estimated_revenue_lift: number;
    cost_per_test: number;
    total_testing_investment: number;
    roi_from_testing: number;
    conversion_optimization: {
      baseline_conversion_rate: number;
      optimized_conversion_rate: number;
      additional_conversions: number;
    };
  };
  trending_insights: {
    best_performing_test_type: string;
    recent_wins: Array<{
      test_name: string;
      test_type: string;
      improvement: number;
      completed_date: Date;
    }>;
    optimization_opportunities: string[];
  };
  cost_analysis: {
    average_cost_per_test: number;
    cost_per_conversion_improvement: number;
    budget_efficiency: {
      low_cost_high_impact: string[];
      medium_cost_medium_impact: string[];
      high_cost_variable_impact: string[];
    };
    recommended_monthly_budget: number;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function ABTestingPerformanceDashboard() {
  const [analyticsData, setAnalyticsData] = useState<ABTestingAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("last_30_days");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/content-ab-testing/performance?action=summary"
      );
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch A/B testing analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return "text-green-600";
    if (improvement < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0)
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (improvement < 0)
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  // Transform data for charts
  const testTypeData = Object.entries(
    analyticsData.performance_overview.performance_by_type
  ).map(([type, data]: [string, any]) => ({
    type: type.replace("_", " ").toUpperCase(),
    tests: data.tests_count,
    avgImprovement: data.avg_improvement,
    successRate: data.success_rate,
    sampleSize: data.total_sample_size,
  }));

  const recentWinsData = analyticsData.trending_insights.recent_wins.map(
    win => ({
      name:
        win.test_name.length > 20
          ? win.test_name.substring(0, 20) + "..."
          : win.test_name,
      improvement: win.improvement,
      type: win.test_type,
    })
  );

  const budgetEfficiencyData = [
    {
      category: "Low Cost, High Impact",
      count:
        analyticsData.cost_analysis.budget_efficiency.low_cost_high_impact
          .length,
      types:
        analyticsData.cost_analysis.budget_efficiency.low_cost_high_impact.join(
          ", "
        ),
      color: "#00C49F",
    },
    {
      category: "Medium Cost, Medium Impact",
      count:
        analyticsData.cost_analysis.budget_efficiency.medium_cost_medium_impact
          .length,
      types:
        analyticsData.cost_analysis.budget_efficiency.medium_cost_medium_impact.join(
          ", "
        ),
      color: "#FFBB28",
    },
    {
      category: "High Cost, Variable Impact",
      count:
        analyticsData.cost_analysis.budget_efficiency.high_cost_variable_impact
          .length,
      types:
        analyticsData.cost_analysis.budget_efficiency.high_cost_variable_impact.join(
          ", "
        ),
      color: "#FF8042",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            A/B Testing Performance Analytics
          </h2>
          <p className="text-gray-400 mt-1">
            Comprehensive insights into content optimization effectiveness
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedTimeRange}
            onValueChange={setSelectedTimeRange}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>
          <NormalButton onClick={fetchAnalyticsData} variant="outline">
            Refresh Data
          </NormalButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-700/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total Tests
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData.performance_overview.total_tests}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {analyticsData.performance_overview.running_tests} Running
              </Badge>
              <Badge variant="outline" className="text-xs">
                {analyticsData.performance_overview.completed_tests} Completed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-700/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Average Improvement
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatPercentage(
                analyticsData.performance_overview.average_improvement
              )}
            </div>
            <div className="flex items-center space-x-1 mt-2">
              {getImprovementIcon(
                analyticsData.performance_overview.average_improvement
              )}
              <span
                className={`text-sm ${getImprovementColor(analyticsData.performance_overview.average_improvement)}`}
              >
                From baseline performance
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-700/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              ROI from Testing
            </CardTitle>
            <DollarSign className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatPercentage(analyticsData.roi_impact.roi_from_testing)}
            </div>
            <div className="text-sm text-purple-200 mt-2">
              Revenue Lift:{" "}
              {formatCurrency(analyticsData.roi_impact.estimated_revenue_lift)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 border-orange-700/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">
              Success Rate
            </CardTitle>
            <Target className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatPercentage(
                analyticsData.performance_overview.success_rate
              )}
            </div>
            <div className="text-sm text-orange-200 mt-2">
              {analyticsData.performance_overview.tests_with_winners} tests with
              clear winners
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="roi_analysis">ROI Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Type Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Test Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={testTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name === "avgImprovement")
                          return [`${value.toFixed(1)}%`, "Avg Improvement"];
                        if (name === "successRate")
                          return [`${value.toFixed(1)}%`, "Success Rate"];
                        return [value, name];
                      }}
                    />
                    <Bar
                      dataKey="avgImprovement"
                      fill="#8884d8"
                      name="Avg Improvement %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Wins */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Winners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.trending_insights.recent_wins.map(
                    (win, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{win.test_name}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {win.test_type.replace("_", " ")}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className="text-green-700 bg-green-100"
                          >
                            +{win.improvement}%
                          </Badge>
                          <Award className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sample Size Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Test Volume and Sample Size</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={testTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sampleSize"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="Sample Size"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success Rate by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Test Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={testTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="successRate"
                      label={({ type, successRate }) =>
                        `${type}: ${successRate.toFixed(1)}%`
                      }
                    >
                      {testTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [
                        `${value.toFixed(1)}%`,
                        "Success Rate",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Optimization Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPercentage(
                        analyticsData.roi_impact.conversion_optimization
                          .baseline_conversion_rate
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Baseline Rate</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(
                        analyticsData.roi_impact.conversion_optimization
                          .optimized_conversion_rate
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Optimized Rate</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    +
                    {Math.round(
                      analyticsData.roi_impact.conversion_optimization
                        .additional_conversions
                    )}{" "}
                    conversions
                  </div>
                  <div className="text-sm text-gray-600">
                    Additional monthly conversions from optimization
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roi_analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Testing Investment Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">
                      Total Investment
                    </span>
                    <span className="font-bold">
                      {formatCurrency(
                        analyticsData.roi_impact.total_testing_investment
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Cost per Test</span>
                    <span className="font-bold">
                      {formatCurrency(
                        analyticsData.cost_analysis.average_cost_per_test
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium">Revenue Lift</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(
                        analyticsData.roi_impact.estimated_revenue_lift
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium">Testing ROI</span>
                    <span className="font-bold text-blue-600">
                      {formatPercentage(
                        analyticsData.roi_impact.roi_from_testing
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Efficiency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetEfficiencyData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {item.category}
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.types}
                        </div>
                      </div>
                      <Badge variant="outline">{item.count} types</Badge>
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">
                        Recommended Monthly Budget
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-900">
                      {formatCurrency(
                        analyticsData.cost_analysis.recommended_monthly_budget
                      )}
                    </div>
                    <div className="text-sm text-yellow-700 mt-1">
                      Based on optimal testing cadence and current performance
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Performing Test Type */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Test Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="p-6 bg-gradient-to-br from-green-100 to-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-800 capitalize mb-2">
                      {analyticsData.trending_insights.best_performing_test_type.replace(
                        "_",
                        " "
                      )}
                    </div>
                    <Badge className="bg-green-600 text-white">
                      Best Performer
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    This test type consistently delivers the highest
                    improvements across campaigns. Consider allocating more
                    testing budget to this category.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Optimization Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.trending_insights.optimization_opportunities.map(
                    (opportunity, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            {opportunity}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      High Priority
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Scale successful{" "}
                    {analyticsData.trending_insights.best_performing_test_type.replace(
                      "_",
                      " "
                    )}{" "}
                    patterns to all relevant content
                  </p>
                </div>

                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      Medium Priority
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Increase testing budget by 25% to capture more optimization
                    opportunities
                  </p>
                </div>

                <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Monitor</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Track long-term impact of implemented optimizations on
                    overall content performance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
