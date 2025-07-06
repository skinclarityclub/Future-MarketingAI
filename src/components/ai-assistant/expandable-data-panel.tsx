"use client";

import React, { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  RotateCcw,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Users,
  Target,
  Brain,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Pie,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Color palette for charts
const CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

interface ExpandableDataPanelProps {
  isOpen: boolean;
  panelType: string | null;
  onClose: () => void;
  className?: string;
}

// Enhanced mock data for different panel types with more realistic demo data
const mockData = {
  finance: {
    kpis: [
      {
        id: "revenue",
        title: "Total Revenue",
        value: "€145,750",
        change: 15.8,
        trend: "up" as const,
        color: "text-green-600",
      },
      {
        id: "profit",
        title: "Net Profit",
        value: "€52,890",
        change: 12.7,
        trend: "up" as const,
        color: "text-green-600",
      },
      {
        id: "expenses",
        title: "Total Expenses",
        value: "€92,860",
        change: -2.1,
        trend: "down" as const,
        color: "text-green-600",
      },
      {
        id: "margin",
        title: "Profit Margin",
        value: "36.3%",
        change: 4.8,
        trend: "up" as const,
        color: "text-green-600",
      },
    ],
    chartData: [
      { name: "Jan", value: 68000, previousValue: 58000 },
      { name: "Feb", value: 75000, previousValue: 65000 },
      { name: "Mar", value: 82000, previousValue: 70000 },
      { name: "Apr", value: 89000, previousValue: 75000 },
      { name: "May", value: 98000, previousValue: 82000 },
      { name: "Jun", value: 145750, previousValue: 88000 },
    ],
  },
  marketing: {
    kpis: [
      {
        id: "impressions",
        title: "Impressions",
        value: "2.8M",
        change: 18.7,
        trend: "up" as const,
        color: "text-blue-600",
      },
      {
        id: "clicks",
        title: "Clicks",
        value: "58.4K",
        change: 28.3,
        trend: "up" as const,
        color: "text-blue-600",
      },
      {
        id: "ctr",
        title: "Click Rate",
        value: "2.09%",
        change: 0.7,
        trend: "up" as const,
        color: "text-green-600",
      },
      {
        id: "roas",
        title: "ROAS",
        value: "4.8x",
        change: 16.2,
        trend: "up" as const,
        color: "text-green-600",
      },
    ],
    chartData: [
      { name: "Google Ads", value: 42, color: "#4285F4" },
      { name: "Facebook", value: 28, color: "#1877F2" },
      { name: "LinkedIn", value: 18, color: "#0A66C2" },
      { name: "Instagram", value: 12, color: "#E4405F" },
    ],
  },
  customers: {
    kpis: [
      {
        id: "total",
        title: "Total Customers",
        value: "8,432",
        change: 5.8,
        trend: "up" as const,
        color: "text-blue-600",
      },
      {
        id: "new",
        title: "New This Month",
        value: "245",
        change: 18.2,
        trend: "up" as const,
        color: "text-green-600",
      },
      {
        id: "retention",
        title: "Retention Rate",
        value: "87.3%",
        change: 2.1,
        trend: "up" as const,
        color: "text-green-600",
      },
      {
        id: "ltv",
        title: "Avg. LTV",
        value: "€1,254",
        change: 6.7,
        trend: "up" as const,
        color: "text-green-600",
      },
    ],
    chartData: [
      { name: "New", value: 245 },
      { name: "Returning", value: 1850 },
      { name: "Churned", value: 120 },
      { name: "Reactivated", value: 85 },
    ],
  },
  reports: {
    kpis: [
      {
        id: "generated",
        title: "Reports Generated",
        value: "1,234",
        change: 8.5,
        trend: "up" as const,
        color: "text-blue-600",
      },
      {
        id: "automated",
        title: "Automated Reports",
        value: "892",
        change: 15.2,
        trend: "up" as const,
        color: "text-green-600",
      },
      {
        id: "accuracy",
        title: "Data Accuracy",
        value: "99.7%",
        change: 0.2,
        trend: "up" as const,
        color: "text-green-600",
      },
      {
        id: "time_saved",
        title: "Time Saved",
        value: "45h",
        change: 22.1,
        trend: "up" as const,
        color: "text-green-600",
      },
    ],
    chartData: [
      { name: "Financial", value: 450 },
      { name: "Marketing", value: 320 },
      { name: "Operations", value: 280 },
      { name: "Sales", value: 184 },
    ],
  },
  "ai-insights": {
    kpis: [
      {
        id: "predictions",
        title: "AI Predictions",
        value: "156",
        change: 12.3,
        trend: "up" as const,
        color: "text-purple-600",
      },
      {
        id: "accuracy",
        title: "Prediction Accuracy",
        value: "94.2%",
        change: 3.1,
        trend: "up" as const,
        color: "text-green-600",
      },
      {
        id: "insights",
        title: "Insights Generated",
        value: "2,341",
        change: 18.7,
        trend: "up" as const,
        color: "text-blue-600",
      },
      {
        id: "automation",
        title: "Process Automation",
        value: "78%",
        change: 5.4,
        trend: "up" as const,
        color: "text-green-600",
      },
    ],
    chartData: [
      { name: "Trend Analysis", value: 85 },
      { name: "Anomaly Detection", value: 92 },
      { name: "Forecasting", value: 78 },
      { name: "Classification", value: 88 },
    ],
  },
  dashboard: {
    kpis: [
      {
        id: "widgets",
        title: "Active Widgets",
        value: "24",
        change: 4.2,
        trend: "up" as const,
        color: "text-blue-600",
      },
      {
        id: "users",
        title: "Active Users",
        value: "1,847",
        change: 12.8,
        trend: "up" as const,
        color: "text-green-600",
      },
      {
        id: "uptime",
        title: "System Uptime",
        value: "99.9%",
        change: 0.1,
        trend: "up" as const,
        color: "text-green-600",
      },
      {
        id: "performance",
        title: "Performance Score",
        value: "A+",
        change: 2.3,
        trend: "up" as const,
        color: "text-green-600",
      },
    ],
    chartData: [
      { name: "Performance", value: 95 },
      { name: "Reliability", value: 98 },
      { name: "Security", value: 97 },
      { name: "Usability", value: 92 },
    ],
  },
};

export function ExpandableDataPanel({
  isOpen,
  panelType,
  onClose,
  className,
}: ExpandableDataPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const currentData = panelType
    ? mockData[panelType as keyof typeof mockData]
    : null;

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getPanelTitle = (type: string) => {
    const titles = {
      finance: "Financial Analytics",
      marketing: "Marketing Performance",
      customers: "Customer Intelligence",
      reports: "Report Analytics",
      "ai-insights": "AI Insights",
      dashboard: "Dashboard Metrics",
    };
    return titles[type as keyof typeof titles] || "Data Panel";
  };

  const getPanelIcon = (type: string) => {
    const icons = {
      finance: <DollarSign className="h-5 w-5" />,
      marketing: <Target className="h-5 w-5" />,
      customers: <Users className="h-5 w-5" />,
      reports: <BarChart3 className="h-5 w-5" />,
      "ai-insights": <Brain className="h-5 w-5" />,
      dashboard: <BarChart3 className="h-5 w-5" />,
    };
    return (
      icons[type as keyof typeof icons] || <BarChart3 className="h-5 w-5" />
    );
  };

  const renderChart = () => {
    if (!currentData) return null;

    switch (panelType) {
      case "finance":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currentData.chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "marketing":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                dataKey="value"
                data={currentData.chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
              >
                {currentData.chartData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.color || CHART_COLORS[index % CHART_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case "customers":
      case "reports":
      case "ai-insights":
      case "dashboard":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={currentData.chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!isOpen || !panelType || !currentData) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full z-50 bg-white/95 backdrop-blur-xl shadow-2xl border-r transition-all duration-500 ease-out",
        isExpanded ? "w-[700px]" : "w-[480px]",
        className
      )}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
        boxShadow:
          "25px 0 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.2)",
      }}
    >
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getPanelIcon(panelType)}
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">
                {getPanelTitle(panelType)}
              </h2>
              <p className="text-xs text-gray-500">Real-time data analytics</p>
            </div>
          </div>
          <div className="flex gap-2">
            <NormalButton
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-9 w-9 p-0 hover:bg-white/50 rounded-lg"
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </NormalButton>
            <NormalButton
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-9 w-9 p-0 hover:bg-white/50 rounded-lg"
            >
              <RotateCcw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </NormalButton>
            <NormalButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-white/50 rounded-lg"
            >
              <X className="h-4 w-4" />
            </NormalButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="overview" className="text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="charts" className="text-xs">
              Charts
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs">
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-3">
                  {currentData.kpis.map(kpi => (
                    <Card
                      key={kpi.id}
                      className="p-4 bg-white/60 backdrop-blur-sm border-gray-200/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            {kpi.title}
                          </p>
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            {kpi.value}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(kpi.trend)}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              kpi.change > 0
                                ? "border-green-200 text-green-700 bg-green-50"
                                : kpi.change < 0
                                  ? "border-red-200 text-red-700 bg-red-50"
                                  : "border-gray-200 text-gray-700 bg-gray-50"
                            )}
                          >
                            {kpi.change > 0 ? "+" : ""}
                            {kpi.change}%
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Quick Actions */}
                <Card className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <NormalButton
                      variant="outline"
                      size="sm"
                      className="h-auto p-2 text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </NormalButton>
                    <NormalButton
                      variant="outline"
                      size="sm"
                      className="h-auto p-2 text-xs"
                    >
                      <Filter className="h-3 w-3 mr-1" />
                      Filter
                    </NormalButton>
                    <NormalButton
                      variant="outline"
                      size="sm"
                      className="h-auto p-2 text-xs"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Range
                    </NormalButton>
                    <NormalButton
                      variant="outline"
                      size="sm"
                      className="h-auto p-2 text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Alerts
                    </NormalButton>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="charts" className="flex-1 m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <Card className="p-4 bg-white/60 backdrop-blur-sm border-gray-200/50">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-sm font-semibold">
                      Data Visualization
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Interactive charts and analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">{renderChart()}</CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="details" className="flex-1 m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <Card className="p-4 bg-white/60 backdrop-blur-sm border-gray-200/50">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">
                    Data Sources
                  </h3>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Last Updated:</span>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Just now
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Data Freshness:</span>
                      <Badge variant="outline" className="text-xs">
                        Real-time
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Connected
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-white/60 backdrop-blur-sm border-gray-200/50">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">
                    AI Insights
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-blue-800">
                            Trend Analysis
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Performance is trending upward with 15% growth this
                            month.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/50">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-green-800">
                            Recommendation
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Continue current strategy for optimal results.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50/50 rounded-lg border border-yellow-200/50">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-yellow-800">
                            Watch
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Monitor next week for potential market fluctuations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
