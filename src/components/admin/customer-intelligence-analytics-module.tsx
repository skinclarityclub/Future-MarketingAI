"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Heart,
  Ticket,
  Eye,
  Target,
  Shield,
  Brain,
  Activity,
  UserCheck,
  UserX,
  Clock,
  Star,
  Zap,
  Download,
  RefreshCcw,
  Filter,
  BarChart3,
  PieChart,
  Settings,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data interfaces for development
interface CustomerMetrics {
  activeUsers: {
    current: number;
    growthRate: number;
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
  };
  adoption: {
    rate: number;
    trend: number;
    newUserActivation: number;
    featureAdoption: number;
    timeToValue: number; // days
  };
  support: {
    openTickets: number;
    ticketTrend: number;
    avgResolutionTime: number; // hours
    satisfactionScore: number;
    escalatedTickets: number;
  };
  health: {
    overallScore: number;
    scoreTrend: number;
    healthyCustomers: number;
    atRiskCustomers: number;
    criticalCustomers: number;
  };
  churn: {
    rate: number;
    riskScore: number;
    predicted: number;
    prevented: number;
    revenueAtRisk: number;
  };
  anomalies: {
    detected: number;
    resolved: number;
    pending: number;
    severity: "low" | "medium" | "high" | "critical";
  };
}

interface CustomerTrendData {
  date: string;
  activeUsers: number;
  newUsers: number;
  churnedUsers: number;
  supportTickets: number;
  healthScore: number;
  satisfactionScore: number;
}

interface CustomerSegmentData {
  segment: string;
  count: number;
  percentage: number;
  avgLifetimeValue: number;
  churnRate: number;
  healthScore: number;
  color: string;
}

interface SupportTicketData {
  id: string;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  status: "open" | "in-progress" | "resolved" | "escalated";
  customerTier: "free" | "basic" | "pro" | "enterprise";
  createdAt: string;
  resolutionTime?: number; // hours
}

// Generate mock data
const generateMockMetrics = (): CustomerMetrics => ({
  activeUsers: {
    current: 9654,
    growthRate: 12.3,
    dailyActive: 3247,
    weeklyActive: 7892,
    monthlyActive: 9654,
  },
  adoption: {
    rate: 78.5,
    trend: 5.2,
    newUserActivation: 82.1,
    featureAdoption: 65.3,
    timeToValue: 3.2,
  },
  support: {
    openTickets: 47,
    ticketTrend: -12.5,
    avgResolutionTime: 4.8,
    satisfactionScore: 4.6,
    escalatedTickets: 3,
  },
  health: {
    overallScore: 8.4,
    scoreTrend: 2.1,
    healthyCustomers: 8234,
    atRiskCustomers: 1136,
    criticalCustomers: 284,
  },
  churn: {
    rate: 2.3,
    riskScore: 15.7,
    predicted: 152,
    prevented: 89,
    revenueAtRisk: 47500,
  },
  anomalies: {
    detected: 12,
    resolved: 8,
    pending: 4,
    severity: "medium",
  },
});

const generateMockTrendData = (): CustomerTrendData[] => {
  const data: CustomerTrendData[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split("T")[0],
      activeUsers: 9000 + Math.random() * 1000 + i * 20,
      newUsers: 80 + Math.random() * 40,
      churnedUsers: 15 + Math.random() * 10,
      supportTickets: 40 + Math.random() * 20,
      healthScore: 8.0 + Math.random() * 1.0,
      satisfactionScore: 4.2 + Math.random() * 0.8,
    });
  }

  return data;
};

const generateMockSegmentData = (): CustomerSegmentData[] => [
  {
    segment: "Enterprise",
    count: 284,
    percentage: 2.9,
    avgLifetimeValue: 15750,
    churnRate: 0.8,
    healthScore: 9.2,
    color: "#8B5CF6",
  },
  {
    segment: "Professional",
    count: 1456,
    percentage: 15.1,
    avgLifetimeValue: 4250,
    churnRate: 1.5,
    healthScore: 8.7,
    color: "#3B82F6",
  },
  {
    segment: "Standard",
    count: 4892,
    percentage: 50.7,
    avgLifetimeValue: 1680,
    churnRate: 2.8,
    healthScore: 8.1,
    color: "#10B981",
  },
  {
    segment: "Freemium",
    count: 3022,
    percentage: 31.3,
    avgLifetimeValue: 340,
    churnRate: 4.2,
    healthScore: 7.4,
    color: "#F59E0B",
  },
];

const generateMockSupportTickets = (): SupportTicketData[] => [
  {
    id: "T-2024-001",
    priority: "high",
    category: "billing",
    status: "open",
    customerTier: "enterprise",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "T-2024-002",
    priority: "medium",
    category: "technical",
    status: "in-progress",
    customerTier: "pro",
    createdAt: "2024-01-15T09:15:00Z",
    resolutionTime: 2.5,
  },
  {
    id: "T-2024-003",
    priority: "critical",
    category: "access",
    status: "escalated",
    customerTier: "enterprise",
    createdAt: "2024-01-15T08:45:00Z",
  },
];

export function CustomerIntelligenceAnalyticsModule() {
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock data - in production this would come from useCustomerIntelligenceRealtime()
  const [metrics, setMetrics] = useState<CustomerMetrics>(
    generateMockMetrics()
  );
  const [trendData, setTrendData] = useState<CustomerTrendData[]>(
    generateMockTrendData()
  );
  const [segmentData, setSegmentData] = useState<CustomerSegmentData[]>(
    generateMockSegmentData()
  );
  const [supportTickets, setSupportTickets] = useState<SupportTicketData[]>(
    generateMockSupportTickets()
  );

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateMockMetrics());
      setLastRefresh(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Connection status simulation
  useEffect(() => {
    const statusCheck = setInterval(() => {
      setIsConnected(Math.random() > 0.05); // 95% uptime simulation
    }, 10000);

    return () => clearInterval(statusCheck);
  }, []);

  const formatTrend = (value: number) => {
    const isPositive = value >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? "text-green-600" : "text-red-600";

    return (
      <div className="flex items-center gap-1">
        <TrendIcon className={`h-3 w-3 ${color}`} />
        <span className={`text-sm ${color}`}>
          {isPositive ? "+" : ""}
          {value.toFixed(1)}%
        </span>
      </div>
    );
  };

  const getHealthColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="dark space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Customer Intelligence Analytics
          </h2>
          <p className="text-gray-400 mt-1">
            Real-time insights on customer behavior, health, and engagement
            patterns
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-400">
              {isConnected ? "Live" : "Disconnected"}
            </span>
          </div>

          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-24 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="90d">90d</SelectItem>
              <SelectItem value="1y">1y</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMetrics(generateMockMetrics());
              setLastRefresh(new Date());
            }}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Last Update Info */}
      <div className="text-xs text-gray-500">
        Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refresh:{" "}
        {refreshInterval}s • Data source: Customer Intelligence Engine
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Analytics
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Health Monitoring
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Support Analytics
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Churn Prevention
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active Users */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    Active Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {metrics.activeUsers.current.toLocaleString()}
                </div>
                <div className="mt-2">
                  {formatTrend(metrics.activeUsers.growthRate)}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  MAU: {metrics.activeUsers.monthlyActive.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Customer Health Score */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    Health Score
                  </CardTitle>
                  <Heart className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getHealthColor(metrics.health.overallScore)}`}
                >
                  {metrics.health.overallScore.toFixed(1)}/10
                </div>
                <div className="mt-2">
                  {formatTrend(metrics.health.scoreTrend)}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {metrics.health.atRiskCustomers} at risk
                </div>
              </CardContent>
            </Card>

            {/* Support Satisfaction */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    Support Satisfaction
                  </CardTitle>
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {metrics.support.satisfactionScore.toFixed(1)}/5
                </div>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    Excellent
                  </Badge>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {metrics.support.openTickets} open tickets
                </div>
              </CardContent>
            </Card>

            {/* Churn Risk */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    Churn Risk
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">
                  {metrics.churn.rate.toFixed(1)}%
                </div>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-600"
                  >
                    {metrics.churn.predicted} predicted
                  </Badge>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  ${metrics.churn.revenueAtRisk.toLocaleString()} at risk
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trends Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Customer Analytics Trends
              </CardTitle>
              <CardDescription className="text-gray-400">
                Active users, health scores, and support metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={value =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis yAxisId="users" stroke="#9CA3AF" fontSize={12} />
                    <YAxis
                      yAxisId="score"
                      orientation="right"
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                      formatter={(value: any, name: string) => [
                        typeof value === "number"
                          ? value.toLocaleString()
                          : value,
                        name,
                      ]}
                      labelFormatter={label =>
                        new Date(label).toLocaleDateString()
                      }
                    />
                    <Area
                      yAxisId="users"
                      type="monotone"
                      dataKey="activeUsers"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Active Users"
                    />
                    <Line
                      yAxisId="score"
                      type="monotone"
                      dataKey="healthScore"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      name="Health Score"
                    />
                    <Line
                      yAxisId="score"
                      type="monotone"
                      dataKey="satisfactionScore"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={false}
                      name="Satisfaction Score"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Customer Segments</CardTitle>
                <CardDescription className="text-gray-400">
                  Distribution by customer tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={segmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {segmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                        formatter={(value: any) => [
                          value.toLocaleString(),
                          "Customers",
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {segmentData.map(segment => (
                    <div
                      key={segment.segment}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-sm text-gray-300">
                          {segment.segment}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {segment.count.toLocaleString()} ({segment.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Health Distribution
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Customer health by segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentData.map(segment => (
                    <div key={segment.segment} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          {segment.segment}
                        </span>
                        <span
                          className={`text-sm font-medium ${getHealthColor(segment.healthScore)}`}
                        >
                          {segment.healthScore.toFixed(1)}/10
                        </span>
                      </div>
                      <Progress
                        value={segment.healthScore * 10}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Daily Active</span>
                    <span className="text-white font-medium">
                      {metrics.activeUsers.dailyActive.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Weekly Active</span>
                    <span className="text-white font-medium">
                      {metrics.activeUsers.weeklyActive.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Monthly Active</span>
                    <span className="text-white font-medium">
                      {metrics.activeUsers.monthlyActive.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Adoption Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Adoption Rate</span>
                      <span className="text-white font-medium">
                        {metrics.adoption.rate}%
                      </span>
                    </div>
                    <Progress value={metrics.adoption.rate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Feature Adoption</span>
                      <span className="text-white font-medium">
                        {metrics.adoption.featureAdoption}%
                      </span>
                    </div>
                    <Progress
                      value={metrics.adoption.featureAdoption}
                      className="h-2"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Time to Value</span>
                    <span className="text-white font-medium">
                      {metrics.adoption.timeToValue} days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Detected</span>
                    <Badge
                      variant="outline"
                      className="text-yellow-600 border-yellow-600"
                    >
                      {metrics.anomalies.detected}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Resolved</span>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      {metrics.anomalies.resolved}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Pending</span>
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-600"
                    >
                      {metrics.anomalies.pending}
                    </Badge>
                  </div>
                  <Alert className="bg-gray-700 border-gray-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-gray-300">
                      {metrics.anomalies.severity} severity anomalies detected
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Monitoring Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Healthy Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {metrics.health.healthyCustomers.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Score: 8.0+ / 10
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  At Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">
                  {metrics.health.atRiskCustomers.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Score: 5.0-7.9 / 10
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Critical
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {metrics.health.criticalCustomers.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Score: &lt; 5.0 / 10
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getHealthColor(metrics.health.overallScore)}`}
                >
                  {metrics.health.overallScore.toFixed(1)}/10
                </div>
                <div className="mt-2">
                  {formatTrend(metrics.health.scoreTrend)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Support Analytics Tab */}
        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Open Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {metrics.support.openTickets}
                </div>
                <div className="mt-2">
                  {formatTrend(metrics.support.ticketTrend)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Avg Resolution Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {metrics.support.avgResolutionTime.toFixed(1)}h
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Target: &lt; 6h
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Satisfaction Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {metrics.support.satisfactionScore.toFixed(1)}/5
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Excellent rating
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Escalated Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">
                  {metrics.support.escalatedTickets}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Requires attention
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Support Tickets */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Recent Support Tickets
              </CardTitle>
              <CardDescription className="text-gray-400">
                Latest support requests requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supportTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <div>
                        <span className="text-white font-medium">
                          {ticket.id}
                        </span>
                        <div className="text-sm text-gray-400">
                          {ticket.category} • {ticket.customerTier}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {ticket.status}
                      </Badge>
                      <div className="text-xs text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Churn Prevention Tab */}
        <TabsContent value="churn" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Churn Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">
                  {metrics.churn.rate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Industry avg: 5.2%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Predicted Churn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {metrics.churn.predicted}
                </div>
                <div className="text-xs text-gray-400 mt-2">Next 30 days</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Prevented Churn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {metrics.churn.prevented}
                </div>
                <div className="text-xs text-gray-400 mt-2">This month</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-200">
                  Revenue at Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  ${metrics.churn.revenueAtRisk.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-2">Potential loss</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
