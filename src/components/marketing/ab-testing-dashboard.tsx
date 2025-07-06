"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Target,
  Activity,
  Zap,
  Clock,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Play,
  Pause,
  StopCircle,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/premium-loading";

interface ABTest {
  id: string;
  name: string;
  type: string;
  status: "draft" | "running" | "paused" | "completed" | "cancelled";
  significance: number;
  confidence: number;
  improvement: number;
  daysRunning: number;
  estimatedCompletion?: number;
  variants: ABTestVariant[];
  startDate?: string;
  endDate?: string;
}

interface ABTestVariant {
  id: string;
  name: string;
  isControl: boolean;
  trafficPercentage: number;
  metrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    improvement: number;
  };
}

interface ABTestAnalytics {
  summary: {
    totalTests: number;
    runningTests: number;
    completedTests: number;
    successRate: number;
    avgImprovement: number;
  };
  testTypes: Array<{
    type: string;
    count: number;
    successRate: number;
  }>;
}

export default function ABTestingDashboard() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [analytics, setAnalytics] = useState<ABTestAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadABTestingData();
  }, []);

  const loadABTestingData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/marketing/ab-testing?action=demo");
      const data = await response.json();

      if (data.success) {
        // Transform demo data to match our interface
        const mockTests: ABTest[] = [
          {
            id: "ab-test-001",
            name: "Email Subject Line Test",
            type: "subject_line",
            status: "running",
            significance: 87.3,
            confidence: 92.1,
            improvement: 18.5,
            daysRunning: 3,
            estimatedCompletion: 2,
            variants: [
              {
                id: "control",
                name: "Control - Standard",
                isControl: true,
                trafficPercentage: 50,
                metrics: {
                  impressions: 2500,
                  clicks: 125,
                  conversions: 18,
                  conversionRate: 14.4,
                  improvement: 0,
                },
              },
              {
                id: "variant-a",
                name: "Variant A - Personalized",
                isControl: false,
                trafficPercentage: 50,
                metrics: {
                  impressions: 2500,
                  clicks: 162,
                  conversions: 28,
                  conversionRate: 17.3,
                  improvement: 20.1,
                },
              },
            ],
          },
          {
            id: "ab-test-002",
            name: "Landing Page CTA Color",
            type: "creative",
            status: "completed",
            significance: 95.8,
            confidence: 97.2,
            improvement: 24.6,
            daysRunning: 7,
            variants: [
              {
                id: "control-2",
                name: "Control - Blue Button",
                isControl: true,
                trafficPercentage: 50,
                metrics: {
                  impressions: 4000,
                  clicks: 240,
                  conversions: 28,
                  conversionRate: 11.7,
                  improvement: 0,
                },
              },
              {
                id: "variant-b",
                name: "Variant B - Orange Button",
                isControl: false,
                trafficPercentage: 50,
                metrics: {
                  impressions: 4000,
                  clicks: 328,
                  conversions: 45,
                  conversionRate: 13.7,
                  improvement: 17.1,
                },
              },
            ],
          },
          {
            id: "ab-test-003",
            name: "Social Media Post Timing",
            type: "timing",
            status: "running",
            significance: 67.8,
            confidence: 72.4,
            improvement: 12.3,
            daysRunning: 1,
            estimatedCompletion: 4,
            variants: [
              {
                id: "control-3",
                name: "Control - 2PM Posts",
                isControl: true,
                trafficPercentage: 50,
              },
              {
                id: "variant-c",
                name: "Variant C - 9AM Posts",
                isControl: false,
                trafficPercentage: 50,
              },
            ],
          },
        ];

        const mockAnalytics: ABTestAnalytics = {
          summary: data.data.overview,
          testTypes: data.data.performanceByType,
        };

        setTests(mockTests);
        setAnalytics(mockAnalytics);
      }
    } catch (error) {
      console.error("Failed to load A/B testing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-4 w-4 text-green-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <StopCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSignificanceColor = (significance: number) => {
    if (significance >= 95) return "text-green-600";
    if (significance >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const chartColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00c49f"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">A/B Testing Framework</h1>
          <p className="text-gray-600 mt-1">
            Multi-account A/B testing with statistical significance tracking
          </p>
        </div>
        <NormalButton className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Test
        </NormalButton>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Tests
                  </p>
                  <p className="text-2xl font-bold">
                    {analytics.summary.totalTests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Running Tests
                  </p>
                  <p className="text-2xl font-bold">
                    {analytics.summary.runningTests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {analytics.summary.completedTests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {analytics.summary.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Improvement
                  </p>
                  <p className="text-2xl font-bold">
                    {analytics.summary.avgImprovement.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Tests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Active Tests Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Active A/B Tests</CardTitle>
              <CardDescription>
                Currently running tests with statistical significance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests
                  .filter(test => test.status === "running")
                  .map(test => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <h3 className="font-semibold">{test.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">
                              {test.type.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                          <NormalButton
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedTest(test)}
                          >
                            View Details
                          </NormalButton>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Statistical Significance
                          </p>
                          <p
                            className={`text-lg font-semibold ${getSignificanceColor(test.significance)}`}
                          >
                            {test.significance.toFixed(1)}%
                          </p>
                          <Progress
                            value={test.significance}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Improvement</p>
                          <p className="text-lg font-semibold text-green-600">
                            +{test.improvement.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Days Running</p>
                          <p className="text-lg font-semibold">
                            {test.daysRunning}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Est. Completion
                          </p>
                          <p className="text-lg font-semibold">
                            {test.estimatedCompletion
                              ? `${test.estimatedCompletion} days`
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {test.significance >= 95 && (
                        <Alert className="mt-3 border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            Test has reached statistical significance! Ready to
                            declare winner.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Completed Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Completed Tests</CardTitle>
              <CardDescription>Latest test results and winners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tests
                  .filter(test => test.status === "completed")
                  .map(test => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{test.name}</h4>
                          <p className="text-sm text-gray-600">
                            Winner:{" "}
                            {test.variants.find(v => !v.isControl)?.name ||
                              "Control"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          +{test.improvement.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">
                          {test.significance.toFixed(1)}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {/* Detailed Active Tests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tests
              .filter(test => test.status === "running")
              .map(test => (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {test.type.replace("_", " ")} • Day {test.daysRunning} of
                      testing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Variants Performance */}
                    {test.variants.map(variant => (
                      <div key={variant.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{variant.name}</h4>
                          {variant.isControl && (
                            <Badge variant="outline">Control</Badge>
                          )}
                        </div>

                        {variant.metrics && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Conversions</p>
                              <p className="font-semibold">
                                {variant.metrics.conversions}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Conv. Rate</p>
                              <p className="font-semibold">
                                {variant.metrics.conversionRate.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Impressions</p>
                              <p className="font-semibold">
                                {variant.metrics.impressions.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Improvement</p>
                              <p
                                className={`font-semibold ${variant.metrics.improvement > 0 ? "text-green-600" : "text-gray-600"}`}
                              >
                                {variant.metrics.improvement > 0 ? "+" : ""}
                                {variant.metrics.improvement.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Test Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Statistical Significance
                        </span>
                        <span
                          className={`text-sm font-semibold ${getSignificanceColor(test.significance)}`}
                        >
                          {test.significance.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={test.significance} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">
                        Target: 95% • Current: {test.significance.toFixed(1)}%
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <NormalButton variant="secondary" size="sm">
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </NormalButton>
                      <NormalButton variant="secondary" size="sm">
                        <StopCircle className="h-4 w-4 mr-1" />
                        Stop
                      </NormalButton>
                      <NormalButton variant="secondary" size="sm">
                        View Report
                      </NormalButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Types Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Test Type</CardTitle>
                <CardDescription>
                  Success rates across different test types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.testTypes || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="type"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="successRate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Test Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Test Type Distribution</CardTitle>
                <CardDescription>Number of tests by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.testTypes || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ type, count }) => `${type}: ${count}`}
                    >
                      {(analytics?.testTypes || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Performance Trends</CardTitle>
              <CardDescription>
                Historical success rates and improvements over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={[
                    { month: "Jan", successRate: 65, avgImprovement: 12.3 },
                    { month: "Feb", successRate: 72, avgImprovement: 15.8 },
                    { month: "Mar", successRate: 68, avgImprovement: 18.2 },
                    { month: "Apr", successRate: 75, avgImprovement: 21.1 },
                    { month: "May", successRate: 71, avgImprovement: 18.5 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="successRate"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="avgImprovement"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          {/* Testing Strategy Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Strategy Recommendations</CardTitle>
              <CardDescription>
                AI-powered suggestions for optimizing your A/B testing program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Zap className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Focus Area:</strong> Email personalization shows
                  highest success rate (83.3%) and impact (19.8% avg
                  improvement).
                </AlertDescription>
              </Alert>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Opportunity:</strong> Creative testing has good
                  potential (66.7% success) but lower volume. Consider
                  increasing creative test frequency.
                </AlertDescription>
              </Alert>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Recommendation:</strong> Implement audience
                  segmentation tests for potentially higher impact based on
                  industry benchmarks.
                </AlertDescription>
              </Alert>

              {/* Upcoming Test Calendar */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">
                  Suggested Testing Calendar
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="font-medium">
                      Week 1: Email Subject Line Optimization
                    </span>
                    <Badge variant="outline">High Priority</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">
                      Week 2: Landing Page CTA Testing
                    </span>
                    <Badge variant="outline">Medium Priority</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="font-medium">
                      Week 3: Audience Segmentation Test
                    </span>
                    <Badge variant="outline">High Impact</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="font-medium">
                      Week 4: Content Format Testing
                    </span>
                    <Badge variant="outline">Exploratory</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Planning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
                <CardDescription>
                  Optimal distribution for maximum impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Email Testing</span>
                    <span className="text-sm text-gray-600">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Creative Testing
                    </span>
                    <span className="text-sm text-gray-600">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Audience Testing
                    </span>
                    <span className="text-sm text-gray-600">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Timing Testing</span>
                    <span className="text-sm text-gray-600">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expected Outcomes</CardTitle>
                <CardDescription>
                  Projected improvements from testing strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">+22.5%</p>
                  <p className="text-sm text-gray-600">
                    Expected Overall Improvement
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xl font-semibold">€45K</p>
                    <p className="text-xs text-gray-600">
                      Projected Revenue Lift
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">85%</p>
                    <p className="text-xs text-gray-600">Confidence Level</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Based on 12 weeks of optimized testing
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <NormalButton
          variant="secondary"
          onClick={loadABTestingData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </NormalButton>
      </div>
    </div>
  );
}
