"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  DollarSign,
  Lightbulb,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  WorkflowIntegration,
  TestInsight,
  HistoricalTestRecord,
  generateMockHistoricalData,
} from "@/lib/ab-testing/workflow-integration";

interface InsightsDashboardProps {
  testId?: string;
  workflowIntegration?: WorkflowIntegration;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function InsightsDashboard({
  testId,
  workflowIntegration,
}: InsightsDashboardProps) {
  const [insights, setInsights] = useState<TestInsight[]>([]);
  const [historicalTests, setHistoricalTests] = useState<
    HistoricalTestRecord[]
  >([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    testType: "",
    dateRange: "",
    minROI: "",
    tags: "",
    impactLevel: "",
  });
  const [selectedInsight, setSelectedInsight] = useState<TestInsight | null>(
    null
  );

  useEffect(() => {
    loadInsightsData();
  }, [testId, workflowIntegration]);

  const loadInsightsData = async () => {
    setLoading(true);
    try {
      if (workflowIntegration) {
        const data = await workflowIntegration.getHistoricalAnalysis();
        setInsights(data.insights);
        setHistoricalTests(data.tests);
        setMetrics(data.metrics);
      } else {
        // Load mock data for demo
        const mockHistorical = generateMockHistoricalData();
        setHistoricalTests(mockHistorical);

        // Generate mock insights
        const mockInsights: TestInsight[] = Array.from(
          { length: 20 },
          (_, i) => ({
            id: `insight_${i + 1}`,
            testId: testId || `test_${Math.floor(Math.random() * 10) + 1}`,
            type: [
              "performance",
              "audience",
              "timing",
              "content",
              "roi",
              "prediction",
            ][Math.floor(Math.random() * 6)] as any,
            title: [
              "Significant Performance Variation Detected",
              "Optimal Audience Segment Identified",
              "Peak Engagement Time Analysis",
              "Content Type Performance Insights",
              "ROI Optimization Opportunity",
              "Predictive Winner Analysis",
            ][Math.floor(Math.random() * 6)],
            description: `Detailed analysis showing ${Math.floor(Math.random() * 50) + 10}% improvement opportunity`,
            confidence: Math.random() * 0.4 + 0.6,
            impact: ["low", "medium", "high", "critical"][
              Math.floor(Math.random() * 4)
            ] as any,
            recommendation:
              "Implement suggested optimizations for maximum impact",
            data: {
              improvement: Math.random() * 50 + 10,
              confidence: Math.random() * 0.4 + 0.6,
            },
            tags: ["performance", "optimization"].slice(
              0,
              Math.floor(Math.random() * 2) + 1
            ),
            createdAt: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ),
          })
        );
        setInsights(mockInsights);

        // Generate mock metrics
        setMetrics({
          totalTests: mockHistorical.length,
          averageROI: 15.3,
          successRate: 0.72,
          popularTags: [
            { tag: "social", count: 25 },
            { tag: "email", count: 18 },
            { tag: "website", count: 15 },
            { tag: "mobile", count: 12 },
          ],
          monthlyTrends: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i, 1).toISOString().slice(0, 7),
            tests: Math.floor(Math.random() * 20) + 5,
            avgROI: Math.random() * 30 + 5,
          })),
        });
      }
    } catch (error) {
      console.error("Error loading insights data:", error);
      toast.error("Failed to load insights data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Filter logic would be implemented here
    toast.success("Filters applied successfully");
  };

  const clearFilters = () => {
    setFilters({
      testType: "",
      dateRange: "",
      minROI: "",
      tags: "",
      impactLevel: "",
    });
    toast.success("Filters cleared");
  };

  const exportInsights = () => {
    const data = {
      insights,
      historicalTests,
      metrics,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ab-testing-insights-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Insights exported successfully");
  };

  const getInsightIcon = (type: TestInsight["type"]) => {
    switch (type) {
      case "performance":
        return <BarChart3 className="h-4 w-4" />;
      case "audience":
        return <Users className="h-4 w-4" />;
      case "timing":
        return <Clock className="h-4 w-4" />;
      case "content":
        return <Eye className="h-4 w-4" />;
      case "roi":
        return <DollarSign className="h-4 w-4" />;
      case "prediction":
        return <Target className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: TestInsight["impact"]) => {
    switch (impact) {
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

  const getImpactIcon = (impact: TestInsight["impact"]) => {
    switch (impact) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <TrendingUp className="h-4 w-4" />;
      case "medium":
        return <Activity className="h-4 w-4" />;
      case "low":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading insights...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Insights Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis and historical performance data
          </p>
        </div>
        <div className="flex gap-2">
          <NormalButton variant="outline" onClick={loadInsightsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </NormalButton>
          <NormalButton variant="outline" onClick={exportInsights}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </NormalButton>
        </div>
      </div>

      {/* Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Total Tests</span>
            </div>
            <div className="text-2xl font-bold mt-1">{metrics.totalTests}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Average ROI</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {metrics.averageROI.toFixed(1)}%
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium">Success Rate</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {(metrics.successRate * 100).toFixed(1)}%
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium">Active Insights</span>
            </div>
            <div className="text-2xl font-bold mt-1">{insights.length}</div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Current Insights</TabsTrigger>
          <TabsTrigger value="historical">Historical Analysis</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label>Filters:</Label>
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.testType}
                onValueChange={value =>
                  setFilters(prev => ({ ...prev, testType: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Test Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="timing">Timing</SelectItem>
                  <SelectItem value="targeting">Targeting</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.impactLevel}
                onValueChange={value =>
                  setFilters(prev => ({ ...prev, impactLevel: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Impact Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Impacts</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Min ROI %"
                value={filters.minROI}
                onChange={e =>
                  setFilters(prev => ({ ...prev, minROI: e.target.value }))
                }
                className="w-32"
              />

              <Input
                placeholder="Tags"
                value={filters.tags}
                onChange={e =>
                  setFilters(prev => ({ ...prev, tags: e.target.value }))
                }
                className="w-32"
              />
            </div>

            <div className="flex gap-2">
              <NormalButton variant="outline" size="sm" onClick={applyFilters}>
                Apply
              </NormalButton>
              <NormalButton variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </NormalButton>
            </div>
          </div>
        </Card>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Active Insights</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {insights.map(insight => (
                  <Card
                    key={insight.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {insight.title}
                          </h4>
                          <Badge
                            variant={getImpactColor(insight.impact)}
                            className="flex items-center gap-1"
                          >
                            {getImpactIcon(insight.impact)}
                            {insight.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {insight.tags.map(tag => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Insight Detail */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Insight Details</h3>
              {selectedInsight ? (
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {getInsightIcon(selectedInsight.type)}
                      <h4 className="text-lg font-semibold">
                        {selectedInsight.title}
                      </h4>
                      <Badge variant={getImpactColor(selectedInsight.impact)}>
                        {selectedInsight.impact}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedInsight.description}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Recommendation
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedInsight.recommendation}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Confidence
                        </Label>
                        <div className="text-2xl font-bold text-green-600">
                          {(selectedInsight.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <div className="text-sm capitalize">
                          {selectedInsight.type}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex gap-1 mt-1">
                        {selectedInsight.tags.map(tag => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedInsight.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-2" />
                    <p>Select an insight to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Test History</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historicalTests.slice(0, 10).map(test => (
                  <div key={test.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{test.testName}</h4>
                      <Badge variant={test.roi > 0 ? "default" : "destructive"}>
                        {test.roi.toFixed(1)}% ROI
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Type: {test.testType}</p>
                      <p>Duration: {Math.round(test.testDuration)} hours</p>
                      <p>Samples: {test.sampleSize.toLocaleString()}</p>
                      <p>Completed: {test.completedAt.toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {test.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ROI Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">ROI Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={historicalTests.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="testName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="roi" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Test Type Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Performance by Test Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Content",
                        value: historicalTests.filter(
                          t => t.testType === "content"
                        ).length,
                      },
                      {
                        name: "Timing",
                        value: historicalTests.filter(
                          t => t.testType === "timing"
                        ).length,
                      },
                      {
                        name: "Targeting",
                        value: historicalTests.filter(
                          t => t.testType === "targeting"
                        ).length,
                      },
                      {
                        name: "Mixed",
                        value: historicalTests.filter(
                          t => t.testType === "mixed"
                        ).length,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {["content", "timing", "targeting", "mixed"].map(type => {
                  const tests = historicalTests.filter(
                    t => t.testType === type
                  );
                  const avgROI =
                    tests.length > 0
                      ? tests.reduce((sum, t) => sum + t.roi, 0) / tests.length
                      : 0;
                  const successRate =
                    tests.length > 0
                      ? tests.filter(t => t.roi > 0).length / tests.length
                      : 0;

                  return (
                    <div key={type} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{type}</span>
                        <Badge variant={avgROI > 0 ? "default" : "destructive"}>
                          {avgROI.toFixed(1)}% avg ROI
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Tests: {tests.length}</p>
                        <p>Success Rate: {(successRate * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Performance Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Monthly Performance Trends
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={metrics?.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="tests"
                  fill="#8884d8"
                  name="Number of Tests"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgROI"
                  stroke="#82ca9d"
                  name="Average ROI %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Popular Tags and Success Correlation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
              <div className="space-y-2">
                {metrics?.popularTags?.map((tag, index) => (
                  <div
                    key={tag.tag}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{tag.tag}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{
                            width: `${(tag.count / (metrics.popularTags[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {tag.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Success Factors</h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Sample Size Impact</span>
                    <span className="text-green-600">+23% success rate</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tests with &gt;1000 samples show significantly higher
                    success rates
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Test Duration</span>
                    <span className="text-blue-600">7-14 days optimal</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tests running 7-14 days achieve best ROI outcomes
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Variant Count</span>
                    <span className="text-amber-600">2-3 variants ideal</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    2-3 variants provide best balance of insights and
                    statistical power
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {/* Prediction Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Performance Predictions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">78%</div>
                <div className="text-sm text-muted-foreground">
                  Success Probability
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">12.5%</div>
                <div className="text-sm text-muted-foreground">
                  Predicted ROI
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  5.2 days
                </div>
                <div className="text-sm text-muted-foreground">
                  Est. Completion
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">High Success Indicators</span>
                </div>
                <ul className="text-sm text-muted-foreground mt-1 ml-6">
                  <li>• Similar historical tests show 85% success rate</li>
                  <li>• Optimal sample size and duration planned</li>
                  <li>• Target audience has high engagement history</li>
                </ul>
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Risk Factors</span>
                </div>
                <ul className="text-sm text-muted-foreground mt-1 ml-6">
                  <li>• Seasonal effects may impact results</li>
                  <li>• New content type with limited historical data</li>
                </ul>
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Recommendations</span>
                </div>
                <ul className="text-sm text-muted-foreground mt-1 ml-6">
                  <li>• Monitor early performance indicators closely</li>
                  <li>
                    • Consider extending duration if needed for significance
                  </li>
                  <li>
                    • Prepare backup variants based on similar successful tests
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Prediction Model Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Model Accuracy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={[
                      { month: "Jan", accuracy: 0.72 },
                      { month: "Feb", accuracy: 0.75 },
                      { month: "Mar", accuracy: 0.78 },
                      { month: "Apr", accuracy: 0.82 },
                      { month: "May", accuracy: 0.85 },
                      { month: "Jun", accuracy: 0.83 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0.6, 1]} />
                    <Tooltip
                      formatter={value => [
                        `${(value * 100).toFixed(1)}%`,
                        "Accuracy",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">
                    Current Model Accuracy
                  </Label>
                  <div className="text-2xl font-bold text-green-600">83%</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Training Data</Label>
                  <div className="text-lg">{historicalTests.length} tests</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <div className="text-sm text-muted-foreground">
                    2 hours ago
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Confidence Range
                  </Label>
                  <div className="text-sm text-muted-foreground">±5.2%</div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
