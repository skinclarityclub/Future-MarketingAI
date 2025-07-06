"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  Play,
  Pause,
  Plus,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  MoreHorizontal,
  BarChart2,
  DollarSign,
} from "lucide-react";
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
} from "recharts";

// Content A/B Testing Types
interface ContentABTest {
  id: string;
  name: string;
  content_id?: string;
  status: "draft" | "running" | "completed" | "paused";
  test_type: "text" | "subject_line" | "image" | "cta" | "timing" | "audience";
  variants: ContentVariant[];
  start_date: Date;
  end_date?: Date;
  duration_hours: number;
  target_audience: string;
  sample_size: number;
  traffic_split_type: "equal" | "weighted" | "adaptive";
  significance_threshold: number;
  current_significance?: number;
  confidence_level?: number;
  winner?: string;
  auto_declare_winner: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ContentVariant {
  id: string;
  name: string;
  traffic_percentage: number;
  is_control: boolean;
  content: {
    text?: string;
    subject_line?: string;
    image_url?: string;
    cta_text?: string;
    post_time?: string;
  };
  metrics: {
    impressions: number;
    clicks: number;
    shares: number;
    comments: number;
    likes: number;
    conversions: number;
    engagement_rate: number;
    click_through_rate: number;
    conversion_rate: number;
    cost_per_engagement: number;
    reach: number;
  };
  performance_score: number;
}

interface ABTestSummary {
  total_tests: number;
  running_tests: number;
  completed_tests: number;
  avg_improvement: number;
  successful_tests: number;
  test_types: { name: string; count: number }[];
}

export default function ContentABTesting() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTest, setSelectedTest] = useState<ContentABTest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [testFilter, setTestFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [performanceAnalytics, setPerformanceAnalytics] = useState<any>(null);

  // Fetch performance analytics
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch(
          "/api/content-ab-testing/performance?action=summary"
        );
        const data = await response.json();
        if (data.success) {
          setPerformanceAnalytics(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch performance analytics:", error);
      }
    };

    fetchPerformanceData();
  }, []);

  // Mock data for content A/B tests
  const [contentABTests, setContentABTests] = useState<ContentABTest[]>([
    {
      id: "content-ab-001",
      name: "Subject Line Test - Newsletter",
      content_id: "content-123",
      status: "running",
      test_type: "subject_line",
      start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      duration_hours: 72,
      target_audience: "Newsletter subscribers",
      sample_size: 5000,
      traffic_split_type: "equal",
      significance_threshold: 95,
      current_significance: 87,
      confidence_level: 92,
      auto_declare_winner: true,
      created_at: new Date(),
      updated_at: new Date(),
      variants: [
        {
          id: "var-001",
          name: "Control",
          traffic_percentage: 50,
          is_control: true,
          content: {
            subject_line: "Weekly Insights: Industry Trends",
          },
          metrics: {
            impressions: 2500,
            clicks: 125,
            shares: 8,
            comments: 3,
            likes: 45,
            conversions: 12,
            engagement_rate: 2.24,
            click_through_rate: 5.0,
            conversion_rate: 9.6,
            cost_per_engagement: 2.1,
            reach: 2300,
          },
          performance_score: 75,
        },
        {
          id: "var-002",
          name: "Variant A",
          traffic_percentage: 50,
          is_control: false,
          content: {
            subject_line: "🚀 This Week's Game-Changing Trends",
          },
          metrics: {
            impressions: 2500,
            clicks: 156,
            shares: 12,
            comments: 7,
            likes: 62,
            conversions: 18,
            engagement_rate: 3.24,
            click_through_rate: 6.24,
            conversion_rate: 11.5,
            cost_per_engagement: 1.8,
            reach: 2400,
          },
          performance_score: 89,
        },
      ],
    },
    {
      id: "content-ab-002",
      name: "CTA Button Test - Landing Page",
      status: "completed",
      test_type: "cta",
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      duration_hours: 120,
      target_audience: "Website visitors",
      sample_size: 8000,
      traffic_split_type: "equal",
      significance_threshold: 95,
      current_significance: 98,
      confidence_level: 99,
      winner: "var-004",
      auto_declare_winner: true,
      created_at: new Date(),
      updated_at: new Date(),
      variants: [
        {
          id: "var-003",
          name: "Control",
          traffic_percentage: 50,
          is_control: true,
          content: {
            cta_text: "Learn More",
          },
          metrics: {
            impressions: 4000,
            clicks: 240,
            shares: 15,
            comments: 8,
            likes: 89,
            conversions: 28,
            engagement_rate: 2.8,
            click_through_rate: 6.0,
            conversion_rate: 11.67,
            cost_per_engagement: 3.2,
            reach: 3800,
          },
          performance_score: 68,
        },
        {
          id: "var-004",
          name: "Variant B",
          traffic_percentage: 50,
          is_control: false,
          content: {
            cta_text: "Get Started Now",
          },
          metrics: {
            impressions: 4000,
            clicks: 328,
            shares: 24,
            comments: 15,
            likes: 142,
            conversions: 45,
            engagement_rate: 4.62,
            click_through_rate: 8.2,
            conversion_rate: 13.72,
            cost_per_engagement: 2.1,
            reach: 3900,
          },
          performance_score: 91,
        },
      ],
    },
  ]);

  const [testSummary, setTestSummary] = useState<ABTestSummary>({
    total_tests: contentABTests.length,
    running_tests: contentABTests.filter(t => t.status === "running").length,
    completed_tests: contentABTests.filter(t => t.status === "completed")
      .length,
    avg_improvement: 24.5,
    successful_tests: contentABTests.filter(t => t.winner).length,
    test_types: [
      { name: "Subject Line", count: 5 },
      { name: "CTA", count: 3 },
      { name: "Text Content", count: 4 },
      { name: "Images", count: 2 },
      { name: "Timing", count: 2 },
    ],
  });

  const filteredTests = contentABTests.filter(test => {
    if (testFilter !== "all" && test.status !== testFilter) return false;
    if (typeFilter !== "all" && test.test_type !== typeFilter) return false;
    return true;
  });

  const handleCreateTest = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditTest = (test: ContentABTest) => {
    setSelectedTest(test);
    setIsEditDialogOpen(true);
  };

  const handlePauseTest = (testId: string) => {
    setContentABTests(prev =>
      prev.map(test =>
        test.id === testId
          ? { ...test, status: "paused" as const, updated_at: new Date() }
          : test
      )
    );
  };

  const handleResumeTest = (testId: string) => {
    setContentABTests(prev =>
      prev.map(test =>
        test.id === testId
          ? { ...test, status: "running" as const, updated_at: new Date() }
          : test
      )
    );
  };

  const handleCompleteTest = (testId: string) => {
    setContentABTests(prev =>
      prev.map(test => {
        if (test.id === testId) {
          const winner = test.variants.reduce((best, current) =>
            current.performance_score > best.performance_score ? current : best
          );
          return {
            ...test,
            status: "completed" as const,
            end_date: new Date(),
            winner: winner.id,
            updated_at: new Date(),
          };
        }
        return test;
      })
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "running":
        return "default";
      case "completed":
        return "secondary";
      case "paused":
        return "outline";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-green-600";
      case "completed":
        return "text-blue-600";
      case "paused":
        return "text-yellow-600";
      case "draft":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const formatPercentage = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content A/B Testing
          </h1>
          <p className="text-gray-600">
            Test and optimize your content for better performance
          </p>
        </div>
        <NormalButton
          onClick={handleCreateTest}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create A/B Test
        </NormalButton>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {testSummary.total_tests}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Running Tests</p>
                <p className="text-2xl font-bold text-green-600">
                  {testSummary.running_tests}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Tests</p>
                <p className="text-2xl font-bold text-blue-600">
                  {testSummary.completed_tests}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Improvement</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPercentage(testSummary.avg_improvement)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active-tests">Active Tests</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance ROI</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Test Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={testSummary.test_types}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {testSummary.test_types.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { month: "Jan", improvement: 12, tests: 3 },
                      { month: "Feb", improvement: 18, tests: 4 },
                      { month: "Mar", improvement: 25, tests: 5 },
                      { month: "Apr", improvement: 31, tests: 7 },
                      { month: "May", improvement: 28, tests: 6 },
                      { month: "Jun", improvement: 35, tests: 8 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="improvement"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Avg. Improvement (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="tests"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Tests Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Tests Tab */}
        <TabsContent value="active-tests" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={testFilter} onValueChange={setTestFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="text">Text Content</SelectItem>
                <SelectItem value="subject_line">Subject Line</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="cta">Call-to-Action</SelectItem>
                <SelectItem value="timing">Timing</SelectItem>
                <SelectItem value="audience">Audience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tests List */}
          <div className="grid gap-6">
            {filteredTests.map(test => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={getStatusBadgeVariant(test.status) as any}
                        >
                          {test.status}
                        </Badge>
                        <Badge variant="outline">{test.test_type}</Badge>
                        <span className="text-sm text-gray-500">
                          Target: {test.target_audience}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.current_significance && (
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Significance
                          </div>
                          <div className="text-lg font-semibold">
                            {formatPercentage(test.current_significance)}
                          </div>
                        </div>
                      )}
                      <NormalButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTest(test)}
                      >
                        <Edit className="h-4 w-4" />
                      </NormalButton>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Test Progress */}
                    {test.status === "running" && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Test Progress</span>
                          <span>
                            {Math.round(
                              (Date.now() - test.start_date.getTime()) /
                                (1000 * 60 * 60)
                            )}
                            h / {test.duration_hours}h
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            ((Date.now() - test.start_date.getTime()) /
                              (test.duration_hours * 60 * 60 * 1000)) *
                              100
                          )}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Variants Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {test.variants.map(variant => (
                        <div key={variant.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">
                              {variant.name}
                              {variant.is_control && (
                                <Badge variant="outline" className="ml-2">
                                  Control
                                </Badge>
                              )}
                            </h4>
                            <span className="text-sm text-gray-600">
                              {formatPercentage(variant.traffic_percentage)}{" "}
                              traffic
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <div className="text-gray-600">CTR</div>
                              <div className="font-medium">
                                {formatPercentage(
                                  variant.metrics.click_through_rate
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Engagement</div>
                              <div className="font-medium">
                                {formatPercentage(
                                  variant.metrics.engagement_rate
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Conversions</div>
                              <div className="font-medium">
                                {variant.metrics.conversions}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="text-xs text-gray-600 mb-1">
                              Performance Score
                            </div>
                            <Progress
                              value={variant.performance_score}
                              className="h-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {test.status === "running" && (
                        <>
                          <NormalButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePauseTest(test.id)}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </NormalButton>
                          <NormalButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCompleteTest(test.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </NormalButton>
                        </>
                      )}
                      {test.status === "paused" && (
                        <NormalButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResumeTest(test.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </NormalButton>
                      )}
                      <NormalButton variant="secondary" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </NormalButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Results & Analytics Tab */}
        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Results Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Test Results Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        type: "Subject Line",
                        successful: 4,
                        total: 5,
                        improvement: 28,
                      },
                      { type: "CTA", successful: 2, total: 3, improvement: 35 },
                      {
                        type: "Text Content",
                        successful: 3,
                        total: 4,
                        improvement: 22,
                      },
                      {
                        type: "Images",
                        successful: 1,
                        total: 2,
                        improvement: 18,
                      },
                      {
                        type: "Timing",
                        successful: 2,
                        total: 2,
                        improvement: 31,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="successful"
                      fill="#82ca9d"
                      name="Successful Tests"
                    />
                    <Bar dataKey="total" fill="#8884d8" name="Total Tests" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Average Improvement
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      +24.5%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-lg font-semibold">75%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Avg. Test Duration
                    </span>
                    <span className="text-lg font-semibold">5.2 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Sample Size
                    </span>
                    <span className="text-lg font-semibold">45,200</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance ROI Tab */}
        <TabsContent value="performance" className="space-y-6">
          {performanceAnalytics ? (
            <div className="space-y-6">
              {/* ROI Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-700/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-100">
                      Revenue Lift
                    </CardTitle>
                    <DollarSign className="h-5 w-5 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      $
                      {performanceAnalytics.roi_impact.estimated_revenue_lift.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-200">
                      From A/B test optimizations
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-700/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-100">
                      Testing ROI
                    </CardTitle>
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {formatPercentage(
                        performanceAnalytics.roi_impact.roi_from_testing
                      )}
                    </div>
                    <p className="text-xs text-blue-200">
                      Return on testing investment
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-700/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-100">
                      Cost per Test
                    </CardTitle>
                    <BarChart2 className="h-5 w-5 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      $
                      {performanceAnalytics.cost_analysis.average_cost_per_test.toLocaleString()}
                    </div>
                    <p className="text-xs text-purple-200">
                      Average investment per test
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Test Type Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries(
                          performanceAnalytics.performance_overview
                            .performance_by_type
                        ).map(([type, data]) => ({
                          type: type.replace("_", " ").toUpperCase(),
                          improvement: (data as any).avg_improvement,
                          successRate: (data as any).success_rate,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="improvement"
                          fill="#8884d8"
                          name="Avg Improvement %"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Rate Optimization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPercentage(
                            performanceAnalytics.roi_impact
                              .conversion_optimization.baseline_conversion_rate
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Baseline Rate
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPercentage(
                            performanceAnalytics.roi_impact
                              .conversion_optimization.optimized_conversion_rate
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Optimized Rate
                        </div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        +
                        {Math.round(
                          performanceAnalytics.roi_impact
                            .conversion_optimization.additional_conversions
                        )}{" "}
                        conversions
                      </div>
                      <div className="text-sm text-gray-600">
                        Additional monthly conversions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Budget Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Efficiency Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">
                        Low Cost, High Impact
                      </h4>
                      <p className="text-sm text-green-700">
                        {performanceAnalytics.cost_analysis.budget_efficiency.low_cost_high_impact.join(
                          ", "
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Medium Cost, Medium Impact
                      </h4>
                      <p className="text-sm text-yellow-700">
                        {performanceAnalytics.cost_analysis.budget_efficiency.medium_cost_medium_impact.join(
                          ", "
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">
                        High Cost, Variable Impact
                      </h4>
                      <p className="text-sm text-red-700">
                        {performanceAnalytics.cost_analysis.budget_efficiency.high_cost_variable_impact.join(
                          ", "
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Recommended Monthly Budget
                    </h4>
                    <div className="text-2xl font-bold text-blue-900">
                      $
                      {performanceAnalytics.cost_analysis.recommended_monthly_budget.toLocaleString()}
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Based on optimal testing cadence and current performance
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Wins */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Test Winners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceAnalytics.trending_insights.recent_wins.map(
                      (win: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {win.test_name}
                            </p>
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
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Loading performance analytics...
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">
                        Subject Lines with Emojis Perform Better
                      </h4>
                      <p className="text-sm text-green-700">
                        Tests show that subject lines with relevant emojis have
                        23% higher open rates on average.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Action-Oriented CTAs Drive More Conversions
                      </h4>
                      <p className="text-sm text-blue-700">
                        "Get Started Now" and "Try Free Today" outperform
                        generic CTAs by 35% in conversion rates.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">
                        Audience Segmentation Improves Results
                      </h4>
                      <p className="text-sm text-purple-700">
                        Tests with targeted audience segments show 18% better
                        performance than broad targeting.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">
                        Timing Matters for Engagement
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Posts scheduled for 10 AM and 2 PM show consistently
                        higher engagement rates across platforms.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Test Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New A/B Test</DialogTitle>
            <DialogDescription>
              Set up a new A/B test to optimize your content performance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-name">Test Name</Label>
              <Input
                id="test-name"
                placeholder="e.g., Subject Line Test - Newsletter"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-type">Test Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Content</SelectItem>
                    <SelectItem value="subject_line">Subject Line</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="cta">Call-to-Action</SelectItem>
                    <SelectItem value="timing">Timing</SelectItem>
                    <SelectItem value="audience">Audience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Input
                  id="target-audience"
                  placeholder="e.g., Newsletter subscribers"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sample-size">Sample Size</Label>
                <Input id="sample-size" type="number" placeholder="5000" />
              </div>
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input id="duration" type="number" placeholder="72" />
              </div>
              <div>
                <Label htmlFor="significance">Significance (%)</Label>
                <Input id="significance" type="number" placeholder="95" />
              </div>
            </div>

            <div>
              <Label>Traffic Split</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select traffic split method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Equal Split (50/50)</SelectItem>
                  <SelectItem value="weighted">Weighted Split</SelectItem>
                  <SelectItem value="adaptive">Adaptive Split</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Variant Configuration */}
            <div className="space-y-3">
              <Label>Test Variants</Label>
              <div className="border rounded-lg p-3 space-y-3">
                <h4 className="font-medium">Control Variant</h4>
                <Textarea placeholder="Enter the control version content..." />
              </div>
              <div className="border rounded-lg p-3 space-y-3">
                <h4 className="font-medium">Variant A</h4>
                <Textarea placeholder="Enter the test variant content..." />
              </div>
              <NormalButton variant="secondary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Variant
              </NormalButton>
            </div>
          </div>
          <DialogFooter>
            <NormalButton
              variant="secondary"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </NormalButton>
            <NormalButton onClick={() => setIsCreateDialogOpen(false)}>
              Create Test
            </NormalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
