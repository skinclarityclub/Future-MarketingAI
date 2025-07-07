"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/client-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { ROITrend } from "@/lib/marketing/campaign-roi-service";

interface ROITrendsChartProps {
  dateRange: { startDate: string; endDate: string };
  attributionModel: string;
}

export function ROITrendsChart({
  dateRange,
  attributionModel,
}: ROITrendsChartProps) {
  const { t } = useTranslation();
  const [trends, setTrends] = useState<ROITrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );

  useEffect(() => {
    fetchTrends();
  }, [dateRange, attributionModel, interval]);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/marketing/roi?action=trends&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&attributionModel=${attributionModel}&interval=${interval}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trends data");
      }

      const data = await response.json();
      setTrends(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (interval) {
      case "daily":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "weekly":
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case "monthly":
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      default:
        return dateString;
    }
  };

  // Calculate summary metrics
  const totalSpend = trends.reduce((sum, trend) => sum + trend.spend, 0);
  const totalRevenue = trends.reduce((sum, trend) => sum + trend.revenue, 0);
  const avgROI =
    trends.length > 0
      ? trends.reduce((sum, trend) => sum + trend.roi, 0) / trends.length
      : 0;
  const avgROAS =
    trends.length > 0
      ? trends.reduce((sum, trend) => sum + trend.roas, 0) / trends.length
      : 0;

  // Prepare chart data
  const chartData = trends.map(trend => ({
    ...trend,
    formattedDate: formatDate(trend.date),
  }));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-600 font-medium">
            Error loading trends data
          </div>
          <div className="text-red-500 text-sm mt-1">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              {t("marketing.totalSpend")}
            </div>
            <div className="text-xl font-bold">
              {formatCurrency(totalSpend)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              {t("marketing.totalRevenue")}
            </div>
            <div className="text-xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              {t("marketing.averageROI")}
            </div>
            <div className="text-xl font-bold">{formatPercentage(avgROI)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              {t("marketing.averageROAS")}
            </div>
            <div className="text-xl font-bold">{avgROAS.toFixed(2)}x</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("marketing.roiPerformanceTrends")}</CardTitle>
            <Select
              value={interval}
              onValueChange={(value: "daily" | "weekly" | "monthly") =>
                setInterval(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t("common.daily")}</SelectItem>
                <SelectItem value="weekly">{t("common.weekly")}</SelectItem>
                <SelectItem value="monthly">{t("common.monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis yAxisId="roi" orientation="left" />
              <YAxis yAxisId="roas" orientation="right" />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "roi") return [formatPercentage(value), "ROI"];
                  if (name === "roas") return [`${value.toFixed(2)}x`, "ROAS"];
                  return [
                    formatCurrency(value),
                    name === "spend" ? "Spend" : "Revenue",
                  ];
                }}
                labelFormatter={label => `Date: ${label}`}
              />
              <Line
                yAxisId="roi"
                type="monotone"
                dataKey="roi"
                stroke="#3B82F6"
                strokeWidth={2}
                name="roi"
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
              />
              <Line
                yAxisId="roas"
                type="monotone"
                dataKey="roas"
                stroke="#10B981"
                strokeWidth={2}
                name="roas"
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Spend vs Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spend vs Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "spend" ? "Spend" : "Revenue",
                ]}
                labelFormatter={label => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
                name="spend"
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
