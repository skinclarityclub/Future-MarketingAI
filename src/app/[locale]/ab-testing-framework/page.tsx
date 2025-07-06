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

interface ABTestingFrameworkPageProps {
  params: Promise<{ locale: string }>;
}

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

// Vertalingen
const translations = {
  en: {
    title: "🧪 Enterprise A/B Testing Framework",
    subtitle:
      "Advanced multi-platform testing with statistical significance tracking, automated winner selection, and comprehensive performance analytics.",
    totalTests: "Total Tests",
    activeTests: "Active Tests",
    avgImprovement: "Avg Improvement",
    successRate: "Success Rate",
    dashboard: "Dashboard",
    tests: "Active Tests",
    analytics: "Analytics",
    insights: "Insights",
    performance: "Performance",
    workflow: "Workflow",
    calendar: "Calendar",
    winner: "Winner",
    createTest: "Create Test",
    backToOverview: "Back to Overview",
  },
  nl: {
    title: "🧪 Enterprise A/B Testing Framework",
    subtitle:
      "Geavanceerde multi-platform testing met statistische significantie tracking, geautomatiseerde winnaar selectie en uitgebreide prestatie-analyse.",
    totalTests: "Totaal Tests",
    activeTests: "Actieve Tests",
    avgImprovement: "Gem. Verbetering",
    successRate: "Slaagkans",
    dashboard: "Dashboard",
    tests: "Actieve Tests",
    analytics: "Analyses",
    insights: "Inzichten",
    performance: "Prestatie",
    workflow: "Workflow",
    calendar: "Kalender",
    winner: "Winnaar",
    createTest: "Test Aanmaken",
    backToOverview: "Terug naar Overzicht",
  },
};

export default function ABTestingFrameworkPage({
  params,
}: ABTestingFrameworkPageProps) {
  const [locale, setLocale] = useState<"en" | "nl">("nl");
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
    const mockHistoricalData = generateMockHistoricalData();
    return new WorkflowIntegration({ historicalData: mockHistoricalData });
  });

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale as "en" | "nl");
    };
    loadParams();
    loadFrameworkData();
  }, [params]);

  const t = translations[locale];

  const loadFrameworkData = async () => {
    setLoading(true);
    setTimeout(() => {
      setActiveTests(mockABTests);
      setLoading(false);
    }, 1000);
  };

  const handleSaveTest = (config: ABTestConfiguration) => {
    console.log("Saving test configuration:", config);
    setShowSetupInterface(false);
    setEditingTest(null);
  };

  const handlePreviewTest = (config: ABTestConfiguration) => {
    console.log("Previewing test configuration:", config);
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
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
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
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];
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
      variants: [],
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

  // Show Test Calendar if requested
  if (showTestCalendar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToOverview}
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
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToOverview}
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

  // Show Insights Dashboard if requested
  if (showInsightsDashboard && selectedTestId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToOverview}
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

  // Show Performance Monitor if requested
  if (showPerformanceMonitor && selectedTestId) {
    const mockVariants = generateMockVariantData(selectedTestId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToOverview}
            </Button>
          </div>
          <PerformanceMonitorComponent
            testId={selectedTestId}
            variants={mockVariants}
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
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToOverview}
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
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToOverview}
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {t.subtitle}
            </p>
          </div>
          <div className="ml-8 space-x-2">
            <Button
              onClick={() => handleViewPerformance("demo-test-001")}
              variant="outline"
              size="lg"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              {t.performance}
            </Button>
            <Button
              onClick={() => handleViewInsights("demo-test-001")}
              variant="outline"
              size="lg"
            >
              <Lightbulb className="h-5 w-5 mr-2" />
              {t.insights}
            </Button>
            <Button
              onClick={() => handleViewWorkflow("demo-test-001")}
              variant="outline"
              size="lg"
            >
              <Workflow className="h-5 w-5 mr-2" />
              {t.workflow}
            </Button>
            <Button
              onClick={handleViewTestCalendar}
              variant="outline"
              size="lg"
            >
              <Calendar className="h-5 w-5 mr-2" />
              {t.calendar}
            </Button>
            <Button
              onClick={() => handleViewWinnerImplementation("demo-test-001")}
              variant="outline"
              size="lg"
            >
              <Target className="h-5 w-5 mr-2" />
              {t.winner}
            </Button>
            <Button onClick={handleCreateNewTest} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              {t.createTest}
            </Button>
          </div>
        </div>

        {/* Framework Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">{t.totalTests}</p>
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
                  <p className="text-green-100">{t.activeTests}</p>
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
                  <p className="text-purple-100">{t.avgImprovement}</p>
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
                  <p className="text-orange-100">{t.successRate}</p>
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
            <TabsTrigger value="dashboard">{t.dashboard}</TabsTrigger>
            <TabsTrigger value="tests">{t.tests}</TabsTrigger>
            <TabsTrigger value="analytics">{t.analytics}</TabsTrigger>
            <TabsTrigger value="insights">{t.insights}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
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
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Interactive charts coming soon...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active A/B Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeTests.map(test => (
                    <div
                      key={test.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{test.name}</h3>
                        <Badge
                          variant={
                            test.status === "running"
                              ? "default"
                              : test.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {test.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {test.hypothesis}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Platform: {test.platforms.join(", ")}</span>
                        <span>Audience: {test.audience}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced analytics features are being developed...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intelligent insights and recommendations coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
