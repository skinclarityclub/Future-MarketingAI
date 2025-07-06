"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "recharts";
import {
  TrendingUp,
  Target,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  BarChart3,
  Zap,
  Award,
  Globe,
  Plus,
  ArrowLeft,
  Workflow,
  Lightbulb,
  Calendar,
} from "lucide-react";
import TestSetupInterface, {
  ABTestConfiguration,
} from "@/components/ab-testing/test-setup-interface";
import PerformanceMonitorComponent from "@/components/ab-testing/performance-monitor";
import { WinnerImplementation } from "@/components/ab-testing/winner-implementation";
import InsightsDashboard from "@/components/ab-testing/insights-dashboard";
import WorkflowDashboard from "@/components/ab-testing/workflow-dashboard";
import TestCalendar from "@/components/ab-testing/test-calendar";
import { VariantData } from "@/lib/ab-testing/statistical-engine";
import {
  WorkflowIntegration,
  generateMockHistoricalData,
} from "@/lib/ab-testing/workflow-integration";

interface ABTestFramework {
  id: string;
  name: string;
  type: "email" | "web" | "social" | "mobile" | "cross-platform";
  status: "draft" | "running" | "completed" | "paused";
  platforms: string[];
  audience: string;
  hypothesis: string;
  variants: ABVariant[];
  metrics: ABTestMetrics;
  statistical: StatisticalData;
  insights: string[];
  startDate: Date;
  endDate?: Date;
  duration: number;
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number;
  isControl: boolean;
  metrics: VariantMetrics;
  performance: number;
}

interface VariantMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  costPerConversion: number;
}

interface ABTestMetrics {
  totalImpressions: number;
  totalConversions: number;
  averageCTR: number;
  totalRevenue: number;
  improvement: number;
}

interface StatisticalData {
  significance: number;
  confidence: number;
  pValue: number;
  sampleSize: number;
  requiredSample: number;
}

export default function ABTestingFrameworkPage() {
  const [activeTests, setActiveTests] = useState<ABTestFramework[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showSetupInterface, setShowSetupInterface] = useState(false);
  const [editingTest, setEditingTest] = useState<ABTestConfiguration | null>(
    null
  );
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [showWinnerImplementation, setShowWinnerImplementation] =
    useState(false);
  const [showInsightsDashboard, setShowInsightsDashboard] = useState(false);
  const [showWorkflowDashboard, setShowWorkflowDashboard] = useState(false);
  const [showTestCalendar, setShowTestCalendar] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [workflowIntegration] = useState(() => {
    // Initialize workflow integration with mock data for demo
    const mockHistoricalData = generateMockHistoricalData();
    return new WorkflowIntegration({ historicalData: mockHistoricalData });
  });

  useEffect(() => {
    loadFrameworkData();
  }, []);

  const loadFrameworkData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setActiveTests(mockABTests);
      setLoading(false);
    }, 1000);
  };

  const handleSaveTest = (config: ABTestConfiguration) => {
    console.log("Saving test configuration:", config);
    // TODO: Implement API call to save test
    setShowSetupInterface(false);
    setEditingTest(null);
  };

  const handlePreviewTest = (config: ABTestConfiguration) => {
    console.log("Previewing test configuration:", config);
    // TODO: Implement preview functionality
  };

  const handleCreateNewTest = () => {
    setEditingTest(null);
    setShowSetupInterface(true);
  };

  const handleViewPerformance = (testId: string) => {
    setSelectedTestId(testId);
    setShowPerformanceMonitor(true);
  };

  const handleViewWinnerImplementation = (testId: string) => {
    setSelectedTestId(testId);
    setShowWinnerImplementation(true);
  };

  const generateMockVariantData = (_testId: string): VariantData[] => {
    return [
      {
        id: "control",
        name: "Control",
        metrics: {
          impressions: 12500,
          clicks: 1875,
          conversions: 375,
          revenue: 7500,
          bounceRate: 0.32,
          timeOnPage: 145,
          engagementRate: 0.68,
        },
        trafficAllocation: 50,
        isControl: true,
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        id: "variant_a",
        name: "Variant A",
        metrics: {
          impressions: 12300,
          clicks: 1968,
          conversions: 410,
          revenue: 8200,
          bounceRate: 0.28,
          timeOnPage: 162,
          engagementRate: 0.72,
        },
        trafficAllocation: 50,
        isControl: false,
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ];
  };

  const handleViewInsights = (testId: string) => {
    setSelectedTestId(testId);
    setShowInsightsDashboard(true);
  };

  const handleViewWorkflow = (testId: string) => {
    setSelectedTestId(testId);
    setShowWorkflowDashboard(true);
  };

  const handleViewTestCalendar = () => {
    setShowTestCalendar(true);
  };

  const handleBackToOverview = () => {
    setShowSetupInterface(false);
    setEditingTest(null);
    setShowPerformanceMonitor(false);
    setShowWinnerImplementation(false);
    setShowInsightsDashboard(false);
    setShowWorkflowDashboard(false);
    setShowTestCalendar(false);
    setSelectedTestId(null);
  };

  const mockABTests: ABTestFramework[] = [
    {
      id: "test-001",
      name: "Cross-Platform Email Campaign Optimization",
      type: "cross-platform",
      status: "running",
      platforms: ["email", "social", "web"],
      audience: "Enterprise prospects",
      hypothesis:
        "Personalized subject lines increase engagement across all platforms",
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      duration: 14,
      variants: [
        {
          id: "var-001",
          name: "Control",
          description: "Standard subject line approach",
          trafficAllocation: 33,
          isControl: true,
          performance: 72,
          metrics: {
            impressions: 15000,
            clicks: 750,
            conversions: 112,
            revenue: 22400,
            ctr: 5.0,
            conversionRate: 14.9,
            costPerConversion: 45,
          },
        },
        {
          id: "var-002",
          name: "Personalized",
          description: "AI-powered personalization",
          trafficAllocation: 33,
          isControl: false,
          performance: 89,
          metrics: {
            impressions: 15000,
            clicks: 945,
            conversions: 168,
            revenue: 33600,
            ctr: 6.3,
            conversionRate: 17.8,
            costPerConversion: 38,
          },
        },
        {
          id: "var-003",
          name: "Urgency-based",
          description: "Time-sensitive messaging",
          trafficAllocation: 34,
          isControl: false,
          performance: 81,
          metrics: {
            impressions: 15100,
            clicks: 862,
            conversions: 138,
            revenue: 27600,
            ctr: 5.7,
            conversionRate: 16.0,
            costPerConversion: 42,
          },
        },
      ],
      metrics: {
        totalImpressions: 45100,
        totalConversions: 418,
        averageCTR: 5.67,
        totalRevenue: 83600,
        improvement: 19.5,
      },
      statistical: {
        significance: 94.2,
        confidence: 96.8,
        pValue: 0.032,
        sampleSize: 45100,
        requiredSample: 50000,
      },
      insights: [
        "Personalized variant shows 19.5% improvement in conversion rate",
        "Cross-platform consistency increased brand recognition by 23%",
        "AI personalization performs best during business hours",
      ],
    },
    {
      id: "test-002",
      name: "Mobile App Onboarding Flow",
      type: "mobile",
      status: "running",
      platforms: ["mobile"],
      audience: "New app users",
      hypothesis: "Simplified onboarding increases completion rates",
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      duration: 10,
      variants: [
        {
          id: "var-004",
          name: "Current Flow",
          description: "5-step onboarding process",
          trafficAllocation: 50,
          isControl: true,
          performance: 65,
          metrics: {
            impressions: 8500,
            clicks: 6800,
            conversions: 3570,
            revenue: 17850,
            ctr: 80.0,
            conversionRate: 52.5,
            costPerConversion: 12,
          },
        },
        {
          id: "var-005",
          name: "Simplified Flow",
          description: "3-step streamlined process",
          trafficAllocation: 50,
          isControl: false,
          performance: 84,
          metrics: {
            impressions: 8500,
            clicks: 7225,
            conversions: 4913,
            revenue: 24565,
            ctr: 85.0,
            conversionRate: 68.0,
            costPerConversion: 8,
          },
        },
      ],
      metrics: {
        totalImpressions: 17000,
        totalConversions: 8483,
        averageCTR: 82.5,
        totalRevenue: 42415,
        improvement: 29.5,
      },
      statistical: {
        significance: 99.1,
        confidence: 99.5,
        pValue: 0.009,
        sampleSize: 17000,
        requiredSample: 15000,
      },
      insights: [
        "Simplified flow shows 29.5% improvement in completion",
        "Users prefer visual progress indicators",
        "Step 3 had highest drop-off in original flow",
      ],
    },
  ];

  const frameworkOverview = {
    totalTests: 24,
    activeTests: 8,
    completedTests: 16,
    averageImprovement: 22.3,
    statisticallySignificant: 19,
    platforms: ["Email", "Web", "Social", "Mobile", "Cross-platform"],
  };

  const performanceData = [
    { platform: "Email", tests: 8, avgImprovement: 18.5, significance: 94.2 },
    { platform: "Web", tests: 6, avgImprovement: 25.1, significance: 96.1 },
    { platform: "Social", tests: 4, avgImprovement: 31.2, significance: 88.7 },
    { platform: "Mobile", tests: 3, avgImprovement: 28.8, significance: 97.3 },
    {
      platform: "Cross-platform",
      tests: 3,
      avgImprovement: 19.5,
      significance: 91.5,
    },
  ];

  const testTypeDistribution = [
    { name: "Email", value: 35, color: "#8884d8" },
    { name: "Web", value: 25, color: "#82ca9d" },
    { name: "Social", value: 20, color: "#ffc658" },
    { name: "Mobile", value: 12, color: "#ff7300" },
    { name: "Cross-platform", value: 8, color: "#00ff88" },
  ];

  const filteredTests = activeTests.filter(test => {
    const platformMatch =
      selectedPlatform === "all" || test.platforms.includes(selectedPlatform);
    const statusMatch =
      selectedStatus === "all" || test.status === selectedStatus;
    return platformMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading A/B Testing Framework...</p>
        </div>
      </div>
    );
  }

  // Show Performance Monitor if requested
  if (showPerformanceMonitor && selectedTestId) {
    const mockVariants = generateMockVariantData(selectedTestId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          </div>

          <PerformanceMonitorComponent
            testId={selectedTestId}
            variants={mockVariants}
            onAlert={alert => console.log("Alert:", alert)}
          />
        </div>
      </div>
    );
  }

  // Show Insights Dashboard if requested
  if (showInsightsDashboard && selectedTestId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          </div>

          <InsightsDashboard
            testId={selectedTestId}
            workflowIntegration={workflowIntegration}
          />
        </div>
      </div>
    );
  }

  // Show Test Calendar if requested
  if (showTestCalendar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          </div>

          <TestCalendar />
        </div>
      </div>
    );
  }

  // Show Workflow Dashboard if requested
  if (showWorkflowDashboard && selectedTestId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          </div>

          <WorkflowDashboard
            testId={selectedTestId}
            workflowIntegration={workflowIntegration}
          />
        </div>
      </div>
    );
  }

  // Show Winner Implementation if requested
  if (showWinnerImplementation && selectedTestId) {
    const mockVariants = generateMockVariantData(selectedTestId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          </div>

          <WinnerImplementation
            testId={selectedTestId}
            variants={mockVariants}
            onImplementation={conclusion =>
              console.log("Implementation:", conclusion)
            }
            onRollback={testId => console.log("Rollback test:", testId)}
          />
        </div>
      </div>
    );
  }

  // Show Setup Interface if requested
  if (showSetupInterface) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          </div>

          <TestSetupInterface
            onSave={handleSaveTest}
            onPreview={handlePreviewTest}
            initialConfig={editingTest || undefined}
            isEditing={!!editingTest}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🧪 Enterprise A/B Testing Framework
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Advanced multi-platform testing with statistical significance
              tracking, automated winner selection, and comprehensive
              performance analytics.
            </p>
          </div>
          <div className="ml-8 space-x-2">
            <Button
              onClick={() => handleViewPerformance("demo-test-001")}
              variant="outline"
              size="lg"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Performance
            </Button>
            <Button
              onClick={() => handleViewInsights("demo-test-001")}
              variant="outline"
              size="lg"
            >
              <Lightbulb className="h-5 w-5 mr-2" />
              Insights
            </Button>
            <Button
              onClick={() => handleViewWorkflow("demo-test-001")}
              variant="outline"
              size="lg"
            >
              <Workflow className="h-5 w-5 mr-2" />
              Workflow
            </Button>
            <Button
              onClick={handleViewTestCalendar}
              variant="outline"
              size="lg"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Calendar
            </Button>
            <Button
              onClick={() => handleViewWinnerImplementation("demo-test-001")}
              variant="outline"
              size="lg"
            >
              <Target className="h-5 w-5 mr-2" />
              Winner
            </Button>
            <Button onClick={handleCreateNewTest} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Test
            </Button>
          </div>
        </div>

        {/* Framework Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Tests</p>
                  <p className="text-3xl font-bold">
                    {frameworkOverview.totalTests}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active Tests</p>
                  <p className="text-3xl font-bold">
                    {frameworkOverview.activeTests}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Avg Improvement</p>
                  <p className="text-3xl font-bold">
                    {frameworkOverview.averageImprovement}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Success Rate</p>
                  <p className="text-3xl font-bold">
                    {Math.round(
                      (frameworkOverview.statisticallySignificant /
                        frameworkOverview.totalTests) *
                        100
                    )}
                    %
                  </p>
                </div>
                <Award className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tests">Active Tests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Platform Performance */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Platform Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="avgImprovement"
                        fill="#8884d8"
                        name="Avg Improvement %"
                      />
                      <Bar
                        dataKey="significance"
                        fill="#82ca9d"
                        name="Significance %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Test Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={testTypeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {testTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Framework Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Multi-Platform Testing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Test across email, web, social, and mobile platforms
                    simultaneously with unified analytics and cross-platform
                    insights.
                  </p>
                  <div className="space-y-2">
                    {frameworkOverview.platforms.map(platform => (
                      <Badge key={platform} variant="outline" className="mr-2">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    Statistical Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Advanced statistical methods including confidence intervals,
                    p-value calculation, and automated significance detection.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Confidence Level</span>
                      <span className="text-sm font-semibold">95%+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">P-Value Threshold</span>
                      <span className="text-sm font-semibold">&lt; 0.05</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-500" />
                    Enterprise Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Advanced features for enterprise environments including
                    multi-account support, custom metrics, and API integration.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Multi-account management</li>
                    <li>• Custom conversion tracking</li>
                    <li>• API-driven automation</li>
                    <li>• Advanced segmentation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Active Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <Select
                value={selectedPlatform}
                onValueChange={setSelectedPlatform}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
            </div>

            {/* Test Cards */}
            <div className="space-y-6">
              {filteredTests.map(test => (
                <Card key={test.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{test.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              test.status === "running"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {test.status}
                          </Badge>
                          <Badge variant="outline">{test.type}</Badge>
                          {test.platforms.map(platform => (
                            <Badge
                              key={platform}
                              variant="outline"
                              className="text-xs"
                            >
                              {platform}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-gray-600 mt-2">{test.hypothesis}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Statistical Significance
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {test.statistical.significance.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Test Progress */}
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Test Progress</span>
                          <span>
                            {Math.min(
                              100,
                              Math.round(
                                ((Date.now() - test.startDate.getTime()) /
                                  (test.duration * 24 * 60 * 60 * 1000)) *
                                  100
                              )
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            ((Date.now() - test.startDate.getTime()) /
                              (test.duration * 24 * 60 * 60 * 1000)) *
                              100
                          )}
                          className="h-2"
                        />
                      </div>

                      {/* Variants */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {test.variants.map(variant => (
                          <div
                            key={variant.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{variant.name}</h4>
                              {variant.isControl && (
                                <Badge variant="outline">Control</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {variant.description}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">CTR:</span>
                                <span className="ml-1 font-medium">
                                  {variant.metrics.ctr}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Conv:</span>
                                <span className="ml-1 font-medium">
                                  {variant.metrics.conversionRate}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Revenue:</span>
                                <span className="ml-1 font-medium">
                                  ${variant.metrics.revenue.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">CPC:</span>
                                <span className="ml-1 font-medium">
                                  ${variant.metrics.costPerConversion}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="text-xs text-gray-600 mb-1">
                                Performance Score
                              </div>
                              <Progress
                                value={variant.performance}
                                className="h-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Key Insights */}
                      {test.insights.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Key Insights:</strong>
                            <ul className="mt-2 space-y-1">
                              {test.insights.map((insight, index) => (
                                <li key={index} className="text-sm">
                                  • {insight}
                                </li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {test.status === "running" && (
                          <>
                            <Button variant="outline" size="sm">
                              <Pause className="h-4 w-4 mr-2" />
                              Pause Test
                            </Button>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Declare Winner
                            </Button>
                          </>
                        )}
                        {test.status === "paused" && (
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Resume Test
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        { month: "Jan", improvement: 15.2, tests: 3 },
                        { month: "Feb", improvement: 18.7, tests: 4 },
                        { month: "Mar", improvement: 22.1, tests: 5 },
                        { month: "Apr", improvement: 19.8, tests: 4 },
                        { month: "May", improvement: 25.3, tests: 6 },
                        { month: "Jun", improvement: 22.3, tests: 2 },
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
                        strokeWidth={3}
                        name="Avg Improvement %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Success Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Success Metrics Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate Improvement</span>
                      <span className="text-lg font-semibold text-green-600">
                        +24.5%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Revenue Impact</span>
                      <span className="text-lg font-semibold text-green-600">
                        +$126K
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cost Efficiency</span>
                      <span className="text-lg font-semibold text-green-600">
                        +18.2%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Statistical Confidence</span>
                      <span className="text-lg font-semibold text-blue-600">
                        96.8%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="platform" type="category" width={100} />
                    <Tooltip />
                    <Bar
                      dataKey="avgImprovement"
                      fill="#8884d8"
                      name="Avg Improvement %"
                    />
                    <Bar
                      dataKey="significance"
                      fill="#82ca9d"
                      name="Statistical Significance %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI-Powered Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    AI-Powered Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>High Impact Opportunity:</strong> Email
                        personalization shows consistent 20%+ improvements.
                        Consider expanding to all campaigns.
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Platform Insight:</strong> Mobile tests achieve
                        statistical significance 40% faster than web tests.
                        Prioritize mobile optimization.
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Audience Behavior:</strong> Enterprise prospects
                        respond better to urgency-based messaging during
                        business hours.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card>
                <CardHeader>
                  <CardTitle>Testing Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Test Design</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Focus on one variable per test</li>
                        <li>
                          • Ensure adequate sample size (min 1,000 per variant)
                        </li>
                        <li>• Run tests for full business cycles</li>
                        <li>
                          • Account for external factors (holidays, events)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Statistical Rigor</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Maintain 95%+ confidence level</li>
                        <li>• Wait for statistical significance</li>
                        <li>
                          • Consider practical significance vs statistical
                        </li>
                        <li>• Account for multiple testing corrections</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Implementation</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Document hypothesis and expected outcomes</li>
                        <li>• Monitor for novelty effects</li>
                        <li>• Plan for winner implementation</li>
                        <li>• Share learnings across teams</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Framework ROI */}
            <Card>
              <CardHeader>
                <CardTitle>Framework ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      $420K
                    </div>
                    <div className="text-sm text-gray-600">Revenue Impact</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">340%</div>
                    <div className="text-sm text-gray-600">ROI</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      28%
                    </div>
                    <div className="text-sm text-gray-600">Cost Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      85%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Implementation Notes */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🏗️ Framework Implementation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Core Components
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Multi-platform test orchestration
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Real-time statistical analysis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Automated winner detection
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Cross-platform analytics
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Advanced Features
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  AI-powered recommendations
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Bayesian statistical methods
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Multi-armed bandit optimization
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Predictive performance modeling
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Enterprise Integration
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  REST API for automation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Webhook notifications
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Custom metrics tracking
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Role-based access control
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
