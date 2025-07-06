"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Download,
  RefreshCw,
  Activity,
  Target,
  Zap,
  Award,
  Building,
  FileText,
  Eye,
  MessageSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ExecutiveMetrics {
  financial: {
    totalRevenue: number;
    revenueGrowth: number;
    projectedRevenue: number;
    costSavings: number;
    roi: number;
    marketingSpend: number;
    customerAcquisitionCost: number;
  };
  operations: {
    activeUsers: number;
    userGrowth: number;
    systemUptime: number;
    apiUsage: number;
    dataProcessed: number;
    automationEfficiency: number;
  };
  security: {
    complianceScore: number;
    securityIncidents: number;
    auditStatus: string;
    riskLevel: string;
    lastSecurityReview: string;
    mfaAdoption: number;
  };
  performance: {
    dashboardViews: number;
    reportGeneration: number;
    averageResponseTime: number;
    successRate: number;
    customerSatisfaction: number;
    featureAdoption: number;
  };
}

interface TrendData {
  date: string;
  revenue: number;
  users: number;
  costs: number;
  satisfaction: number;
}

interface ComplianceItem {
  framework: string;
  status: "compliant" | "partial" | "non-compliant";
  lastAudit: string;
  nextReview: string;
  score: number;
  issues: number;
}

export function ExecutiveSummaryDashboard() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");

  // Load executive summary data
  useEffect(() => {
    loadExecutiveData();

    if (autoRefresh) {
      const interval = setInterval(loadExecutiveData, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedTimeRange]);

  const loadExecutiveData = async () => {
    try {
      setIsLoading(true);

      // Mock data - in production, these would be real API calls
      const mockMetrics: ExecutiveMetrics = {
        financial: {
          totalRevenue: 2847500,
          revenueGrowth: 23.8,
          projectedRevenue: 3200000,
          costSavings: 485000,
          roi: 341.2,
          marketingSpend: 425000,
          customerAcquisitionCost: 187,
        },
        operations: {
          activeUsers: 12847,
          userGrowth: 18.5,
          systemUptime: 99.97,
          apiUsage: 1250000,
          dataProcessed: 847.2,
          automationEfficiency: 94.3,
        },
        security: {
          complianceScore: 96.8,
          securityIncidents: 0,
          auditStatus: "Green",
          riskLevel: "Low",
          lastSecurityReview: "2024-01-15",
          mfaAdoption: 98.4,
        },
        performance: {
          dashboardViews: 45821,
          reportGeneration: 2847,
          averageResponseTime: 247,
          successRate: 99.94,
          customerSatisfaction: 4.8,
          featureAdoption: 87.2,
        },
      };

      const mockTrendData: TrendData[] = [
        {
          date: "Jan",
          revenue: 2100000,
          users: 9800,
          costs: 485000,
          satisfaction: 4.6,
        },
        {
          date: "Feb",
          revenue: 2250000,
          users: 10400,
          costs: 498000,
          satisfaction: 4.7,
        },
        {
          date: "Mar",
          revenue: 2420000,
          users: 11200,
          costs: 512000,
          satisfaction: 4.7,
        },
        {
          date: "Apr",
          revenue: 2680000,
          users: 12100,
          costs: 525000,
          satisfaction: 4.8,
        },
        {
          date: "May",
          revenue: 2847500,
          users: 12847,
          costs: 538000,
          satisfaction: 4.8,
        },
      ];

      const mockComplianceData: ComplianceItem[] = [
        {
          framework: "SOC 2 Type II",
          status: "compliant",
          lastAudit: "2024-01-10",
          nextReview: "2024-07-10",
          score: 98.5,
          issues: 0,
        },
        {
          framework: "GDPR",
          status: "compliant",
          lastAudit: "2024-01-08",
          nextReview: "2024-04-08",
          score: 96.2,
          issues: 1,
        },
        {
          framework: "ISO 27001",
          status: "partial",
          lastAudit: "2023-12-15",
          nextReview: "2024-03-15",
          score: 89.7,
          issues: 3,
        },
        {
          framework: "CCPA",
          status: "compliant",
          lastAudit: "2024-01-12",
          nextReview: "2024-06-12",
          score: 94.8,
          issues: 0,
        },
      ];

      setMetrics(mockMetrics);
      setTrendData(mockTrendData);
      setComplianceData(mockComplianceData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load executive data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    // Generate and download executive report
    console.log("Exporting executive report...");
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Loading executive summary...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "partial":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "non-compliant":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Executive Summary Dashboard
            </h1>
            <p className="text-gray-400">
              Comprehensive enterprise overview and key performance indicators
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>

            <Button
              onClick={loadExecutiveData}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-blue-500 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              onClick={exportReport}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(metrics?.financial.totalRevenue || 0)}
              </div>
              <div className="flex items-center text-xs">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">
                  +{formatPercent(metrics?.financial.revenueGrowth || 0)}
                </span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {metrics?.operations.activeUsers.toLocaleString() || 0}
              </div>
              <div className="flex items-center text-xs">
                <TrendingUp className="h-3 w-3 text-blue-400 mr-1" />
                <span className="text-blue-400">
                  +{formatPercent(metrics?.operations.userGrowth || 0)}
                </span>
                <span className="text-gray-500 ml-1">growth rate</span>
              </div>
            </CardContent>
          </Card>

          {/* System Uptime */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                System Uptime
              </CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {formatPercent(metrics?.operations.systemUptime || 0)}
              </div>
              <div className="flex items-center text-xs">
                <CheckCircle className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">Excellent</span>
                <span className="text-gray-500 ml-1">reliability</span>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Score */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Compliance Score
              </CardTitle>
              <Shield className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {formatPercent(metrics?.security.complianceScore || 0)}
              </div>
              <div className="flex items-center text-xs">
                <Award className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">
                  {metrics?.security.auditStatus || "N/A"}
                </span>
                <span className="text-gray-500 ml-1">status</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-fit grid-cols-2 lg:grid-cols-4 bg-gray-800/50 border border-gray-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Financial
            </TabsTrigger>
            <TabsTrigger
              value="operations"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Operations
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Trend</CardTitle>
                  <CardDescription className="text-gray-400">
                    Monthly revenue growth over the last 5 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3B82F6"
                        fill="url(#revenueGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient
                          id="revenueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Growth */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">User Growth</CardTitle>
                  <CardDescription className="text-gray-400">
                    Active user base expansion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Indicators */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Key Performance Indicators
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Critical metrics for enterprise performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">ROI</span>
                      <span className="text-sm font-medium text-white">
                        {formatPercent(metrics?.financial.roi || 0)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min((metrics?.financial.roi || 0) / 5, 100)}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Success Rate
                      </span>
                      <span className="text-sm font-medium text-white">
                        {formatPercent(metrics?.performance.successRate || 0)}
                      </span>
                    </div>
                    <Progress
                      value={metrics?.performance.successRate || 0}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Customer Satisfaction
                      </span>
                      <span className="text-sm font-medium text-white">
                        {(
                          ((metrics?.performance.customerSatisfaction || 0) /
                            5) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        ((metrics?.performance.customerSatisfaction || 0) / 5) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Current Revenue</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(metrics?.financial.totalRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Projected Revenue</span>
                    <span className="font-semibold text-green-400">
                      {formatCurrency(metrics?.financial.projectedRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Cost Savings</span>
                    <span className="font-semibold text-blue-400">
                      {formatCurrency(metrics?.financial.costSavings || 0)}
                    </span>
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Marketing Spend</span>
                    <span className="font-semibold text-orange-400">
                      {formatCurrency(metrics?.financial.marketingSpend || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">CAC</span>
                    <span className="font-semibold text-yellow-400">
                      {formatCurrency(
                        metrics?.financial.customerAcquisitionCost || 0
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Revenue vs Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                      <Bar dataKey="costs" fill="#EF4444" name="Costs" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">System Uptime</span>
                      <span className="font-semibold text-green-400">
                        {formatPercent(metrics?.operations.systemUptime || 0)}
                      </span>
                    </div>
                    <Progress
                      value={metrics?.operations.systemUptime || 0}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">
                        Automation Efficiency
                      </span>
                      <span className="font-semibold text-blue-400">
                        {formatPercent(
                          metrics?.operations.automationEfficiency || 0
                        )}
                      </span>
                    </div>
                    <Progress
                      value={metrics?.operations.automationEfficiency || 0}
                      className="h-2"
                    />
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">API Usage</span>
                    <span className="font-semibold text-white">
                      {(metrics?.operations.apiUsage || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Data Processed (GB)</span>
                    <span className="font-semibold text-white">
                      {(metrics?.operations.dataProcessed || 0).toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Feature Adoption</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Overall Adoption</span>
                      <span className="font-semibold text-white">
                        {formatPercent(
                          metrics?.performance.featureAdoption || 0
                        )}
                      </span>
                    </div>
                    <Progress
                      value={metrics?.performance.featureAdoption || 0}
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Dashboard Views</span>
                    <span className="font-semibold text-white">
                      {(
                        metrics?.performance.dashboardViews || 0
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Reports Generated</span>
                    <span className="font-semibold text-white">
                      {(
                        metrics?.performance.reportGeneration || 0
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Avg. Response Time</span>
                    <span className="font-semibold text-white">
                      {metrics?.performance.averageResponseTime || 0}ms
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Security Incidents</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {metrics?.security.securityIncidents || 0}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Risk Level</span>
                    <span
                      className={`font-semibold ${getRiskColor(metrics?.security.riskLevel || "")}`}
                    >
                      {metrics?.security.riskLevel || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">MFA Adoption</span>
                    <span className="font-semibold text-white">
                      {formatPercent(metrics?.security.mfaAdoption || 0)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Compliance Score</span>
                      <span className="font-semibold text-green-400">
                        {formatPercent(metrics?.security.complianceScore || 0)}
                      </span>
                    </div>
                    <Progress
                      value={metrics?.security.complianceScore || 0}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {complianceData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            {item.framework}
                          </span>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400">
                          Score: {formatPercent(item.score)} • Issues:{" "}
                          {item.issues} • Next:{" "}
                          {new Date(item.nextReview).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Compliance Issues Alert */}
            {complianceData.some(item => item.issues > 0) && (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertTitle className="text-yellow-400">
                  Compliance Issues Detected
                </AlertTitle>
                <AlertDescription className="text-gray-300">
                  {complianceData.filter(item => item.issues > 0).length}{" "}
                  compliance framework(s) have open issues that require
                  attention. Review the compliance dashboard for details.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
