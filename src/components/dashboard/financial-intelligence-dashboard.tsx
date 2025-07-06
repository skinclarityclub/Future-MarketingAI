"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  BarChart3,
  Target,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface FinancialMetric {
  id: string;
  metric_name?: string;
  value: number;
  date: string;
  category?: string;
  metadata?: Record<string, any>;
}

interface FinancialData {
  data: FinancialMetric[];
  metadata: {
    count: number;
    query_type: string;
    parameters: any;
    timestamp: string;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// Helper function for safe number formatting
const formatCurrency = (value: any): string => {
  // Check if value is a valid number
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "€0.00";
  }

  const numValue = Number(value);
  return `€${numValue.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function FinancialIntelligenceDashboard() {
  const { t } = useLocale();
  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [queryType, setQueryType] = useState<
    "metrics" | "general" | "analysis" | "trends"
  >("general");

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type: queryType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: "100",
      });

      const response = await fetch(`/api/financial?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FinancialData = await response.json();
      setFinancialData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch financial data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange, queryType]);

  const processDataForCharts = () => {
    if (!financialData?.data || financialData.data.length === 0)
      return { revenue: [], expenses: [], categories: [], trends: [] };

    // Filter out invalid data entries
    const validData = financialData.data.filter(
      item => item.metric_name && item.date && typeof item.value === "number"
    );

    const groupedByDate = validData.reduce(
      (acc, item) => {
        const date = item.date;
        if (!acc[date])
          acc[date] = { date, revenue: 0, expenses: 0, profit: 0 };

        if (
          item.metric_name?.toLowerCase().includes("revenue") ||
          item.metric_name?.toLowerCase().includes("income")
        ) {
          acc[date].revenue += item.value;
        } else if (
          item.metric_name?.toLowerCase().includes("expense") ||
          item.metric_name?.toLowerCase().includes("cost")
        ) {
          acc[date].expenses += item.value;
        }

        acc[date].profit = acc[date].revenue - acc[date].expenses;
        return acc;
      },
      {} as Record<string, any>
    );

    const trends = Object.values(groupedByDate).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );

    const categoryData = validData.reduce(
      (acc, item) => {
        const category = item.category || "other";
        acc[category] = (acc[category] || 0) + Math.abs(item.value);
        return acc;
      },
      {} as Record<string, number>
    );

    const categories = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      revenue: trends.filter((t: any) => t.revenue > 0),
      expenses: trends.filter((t: any) => t.expenses > 0),
      categories,
      trends,
    };
  };

  const calculateKPIs = () => {
    if (!financialData?.data || financialData.data.length === 0)
      return { totalRevenue: 0, totalExpenses: 0, profit: 0, profitMargin: 0 };

    // Filter out invalid data entries
    const validData = financialData.data.filter(
      item => item.metric_name && item.date && typeof item.value === "number"
    );

    const totals = validData.reduce(
      (acc, item) => {
        if (
          item.metric_name?.toLowerCase().includes("revenue") ||
          item.metric_name?.toLowerCase().includes("income")
        ) {
          acc.revenue += item.value;
        } else if (
          item.metric_name?.toLowerCase().includes("expense") ||
          item.metric_name?.toLowerCase().includes("cost")
        ) {
          acc.expenses += item.value;
        }
        return acc;
      },
      { revenue: 0, expenses: 0 }
    );

    const profit = totals.revenue - totals.expenses;
    const profitMargin =
      totals.revenue > 0 ? (profit / totals.revenue) * 100 : 0;

    return {
      totalRevenue: totals.revenue,
      totalExpenses: totals.expenses,
      profit,
      profitMargin,
    };
  };

  const chartData = processDataForCharts();
  const kpis = calculateKPIs();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">{t("common.loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t("errors.errorLoadingData")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <NormalButton
            onClick={fetchFinancialData}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.refresh")}
          </NormalButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary
      componentName="FinancialIntelligenceDashboard"
      enableReporting={true}
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {t("analytics.financialIntelligence")}
            </h2>
            <p className="text-gray-300">
              {t("analytics.financialIntelligenceDesc")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={queryType}
              onValueChange={(value: any) => setQueryType(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("forms.queryType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  {t("analytics.general")}
                </SelectItem>
                <SelectItem value="metrics">
                  {t("analytics.metrics")}
                </SelectItem>
                <SelectItem value="analysis">
                  {t("analytics.analysis")}
                </SelectItem>
                <SelectItem value="trends">{t("analytics.trends")}</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateRange.startDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, startDate: e.target.value }))
              }
              className="w-40"
            />

            <Input
              type="date"
              value={dateRange.endDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, endDate: e.target.value }))
              }
              className="w-40"
            />

            <NormalButton onClick={fetchFinancialData} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.refresh")}
            </NormalButton>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.totalRevenue")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${kpis.totalRevenue >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(kpis.totalRevenue)}
              </div>
              <Badge variant="default" className="mt-1">
                {t("analytics.income")}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("analytics.totalExpenses")}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${kpis.totalExpenses >= 0 ? "text-red-600" : "text-green-600"}`}
              >
                {formatCurrency(kpis.totalExpenses)}
              </div>
              <Badge variant="destructive" className="mt-1">
                {t("analytics.expenses")}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.netProfit")}
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${kpis.profit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(kpis.profit)}
              </div>
              <Badge
                variant={kpis.profit >= 0 ? "default" : "destructive"}
                className="mt-1"
              >
                {kpis.profit >= 0 ? t("analytics.profit") : t("analytics.loss")}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.profitMargin")}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${kpis.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {kpis.profitMargin.toFixed(1)}%
              </div>
              <Badge
                variant={kpis.profitMargin >= 10 ? "default" : "secondary"}
                className="mt-1"
              >
                {kpis.profitMargin >= 10
                  ? t("analytics.healthy")
                  : t("analytics.monitor")}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {t("navigation.overview")}
            </TabsTrigger>
            <TabsTrigger value="trends">{t("analytics.trends")}</TabsTrigger>
            <TabsTrigger value="categories">
              {t("analytics.categories")}
            </TabsTrigger>
            <TabsTrigger value="details">{t("analytics.details")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics.revenueVsExpenses")}</CardTitle>
                  <CardDescription>
                    {t("analytics.financialPerformanceOverTime")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [formatCurrency(value), ""]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="2"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics.categoryDistribution")}</CardTitle>
                  <CardDescription>
                    {t("analytics.breakdownByCategories")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.categories}
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
                        {chartData.categories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [
                          formatCurrency(value),
                          "Value",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.profitTrendAnalysis")}</CardTitle>
                <CardDescription>
                  {t("analytics.trackProfitabilityOverTime")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(value), ""]}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.categoryPerformance")}</CardTitle>
                <CardDescription>
                  {t("analytics.financialMetricsByCategory")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData.categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        formatCurrency(value),
                        "Value",
                      ]}
                    />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.rawFinancialData")}</CardTitle>
                <CardDescription>
                  {t("analytics.showingRecords")}{" "}
                  {financialData?.metadata.count || 0} {t("analytics.records")}{" "}
                  ({financialData?.metadata.query_type})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t("common.date")}</th>
                        <th className="text-left p-2">{t("common.metric")}</th>
                        <th className="text-left p-2">{t("forms.category")}</th>
                        <th className="text-right p-2">{t("common.value")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData?.data.map((item, index) => (
                        <tr
                          key={item.id || index}
                          className="border-b hover:bg-gray-800/30"
                        >
                          <td className="p-2">{item.date}</td>
                          <td className="p-2">{item.metric_name}</td>
                          <td className="p-2">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="p-2 text-right font-mono">
                            {formatCurrency(item.value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Status */}
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {t("analytics.lastUpdated")}:{" "}
                {financialData?.metadata.timestamp
                  ? new Date(financialData.metadata.timestamp).toLocaleString(
                      "nl-NL"
                    )
                  : t("analytics.never")}
              </span>
              <span>
                {t("analytics.queryType")}:{" "}
                {financialData?.metadata.query_type || "N/A"}
              </span>
              <span>
                {t("analytics.records")}: {financialData?.metadata.count || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
