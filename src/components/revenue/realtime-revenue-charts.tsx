"use client";

import React from "react";
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";
import {
  RevenueLineChart,
  RevenueAreaChart,
  RevenueBarChart,
  RevenuePieChart,
  KPICard,
  CHART_COLORS,
} from "@/components/charts/base-chart-components";
import {
  RealtimeChartWrapper,
  withRealtimeData,
  RealtimeStatusIndicator,
} from "@/components/charts/realtime-chart-wrapper";
import {
  useRealtimeChartData,
  REALTIME_CONFIGS,
} from "@/lib/data/real-time-data-service";
import { formatCurrency, formatPercentage } from "@/lib/data/mock-chart-data";
import {
  DashboardGrid,
  DashboardCard,
} from "@/components/layout/dashboard-layout";

/**
 * Real-time Revenue Overview Cards with KPI updates
 */
export function RealtimeRevenueOverviewCards() {
  const { data, loading, error, isRealtime, lastUpdated } =
    useRealtimeChartData("revenue-kpis", {
      table: "metrics",
      metric_types: [
        "total_revenue",
        "monthly_growth",
        "avg_order_value",
        "conversion_rate",
      ],
      refresh_interval: 60000,
      enable_polling: true,
    });

  // Transform real-time data to KPI format
  const kpis = React.useMemo(() => {
    if (!data || data.length === 0) {
      // Fallback to mock data
      return {
        totalRevenue: {
          value: 524750,
          change: 12.5,
          trend: "up" as const,
          period: "vs last month",
        },
        monthlyGrowth: {
          value: 15.3,
          change: 3.2,
          trend: "up" as const,
          period: "month over month",
        },
        avgOrderValue: {
          value: 284,
          change: -2.1,
          trend: "down" as const,
          period: "vs last month",
        },
        conversionRate: {
          value: 3.4,
          change: 0.8,
          trend: "up" as const,
          period: "this month",
        },
      };
    }

    // Transform real-time data
    const getMetricValue = (metricType: string) => {
      const metric = data.find(d => d.metric_type === metricType);
      return metric ? metric.value : 0;
    };

    const getMetricChange = (metricType: string) => {
      const metric = data.find(d => d.metric_type === metricType);
      return metric?.metadata?.change || 0;
    };

    const getMetricTrend = (metricType: string): "up" | "down" | "neutral" => {
      const change = getMetricChange(metricType);
      return change > 0 ? "up" : change < 0 ? "down" : "neutral";
    };

    return {
      totalRevenue: {
        value: getMetricValue("total_revenue"),
        change: getMetricChange("total_revenue"),
        trend: getMetricTrend("total_revenue"),
        period: "vs last month",
      },
      monthlyGrowth: {
        value: getMetricValue("monthly_growth"),
        change: getMetricChange("monthly_growth"),
        trend: getMetricTrend("monthly_growth"),
        period: "month over month",
      },
      avgOrderValue: {
        value: getMetricValue("avg_order_value"),
        change: getMetricChange("avg_order_value"),
        trend: getMetricTrend("avg_order_value"),
        period: "vs last month",
      },
      conversionRate: {
        value: getMetricValue("conversion_rate"),
        change: getMetricChange("conversion_rate"),
        trend: getMetricTrend("conversion_rate"),
        period: "this month",
      },
    };
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Real-time status indicator */}
      <div className="flex justify-end">
        <RealtimeStatusIndicator
          isRealtime={isRealtime}
          lastUpdated={lastUpdated}
          error={error}
        />
      </div>

      <DashboardGrid>
        <KPICard
          title="Total Revenue"
          value={formatCurrency(kpis.totalRevenue.value)}
          change={{
            value: kpis.totalRevenue.change,
            label: kpis.totalRevenue.period,
            trend: kpis.totalRevenue.trend,
          }}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          loading={loading}
        />
        <KPICard
          title="Monthly Growth"
          value={formatPercentage(kpis.monthlyGrowth.value)}
          change={{
            value: kpis.monthlyGrowth.change,
            label: kpis.monthlyGrowth.period,
            trend: kpis.monthlyGrowth.trend,
          }}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          loading={loading}
        />
        <KPICard
          title="Avg. Order Value"
          value={formatCurrency(kpis.avgOrderValue.value)}
          change={{
            value: kpis.avgOrderValue.change,
            label: kpis.avgOrderValue.period,
            trend: kpis.avgOrderValue.trend,
          }}
          icon={<Target className="h-5 w-5 text-primary" />}
          loading={loading}
        />
        <KPICard
          title="Conversion Rate"
          value={formatPercentage(kpis.conversionRate.value)}
          change={{
            value: kpis.conversionRate.change,
            label: kpis.conversionRate.period,
            trend: kpis.conversionRate.trend,
          }}
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
          loading={loading}
        />
      </DashboardGrid>
    </div>
  );
}

/**
 * Real-time Revenue Trend Chart
 */
export function RealtimeRevenueTrendChart() {
  return (
    <RealtimeChartWrapper
      chartType="revenue"
      title="Revenue Trends"
      description="Real-time monthly revenue performance vs targets"
    >
      {(data, loading, error) => (
        <RevenueLineChart
          data={data}
          loading={loading}
          error={error}
          height={350}
          xDataKey="date"
          lines={[
            {
              dataKey: "revenue",
              name: "Actual Revenue",
              color: CHART_COLORS.primary,
              strokeWidth: 3,
            },
            {
              dataKey: "forecast",
              name: "Forecast",
              color: CHART_COLORS.secondary,
              strokeWidth: 2,
            },
            {
              dataKey: "target",
              name: "Target",
              color: CHART_COLORS.warning,
              strokeWidth: 2,
            },
          ]}
        />
      )}
    </RealtimeChartWrapper>
  );
}

/**
 * Real-time Revenue Growth Chart
 */
export function RealtimeRevenueGrowthChart() {
  return (
    <RealtimeChartWrapper
      chartType="revenue"
      title="Revenue Growth Analysis"
      description="Real-time month-over-month growth and cumulative revenue"
      customConfig={{
        table: "metrics",
        metric_types: ["revenue", "cumulative_revenue", "growth_rate"],
        refresh_interval: 120000, // 2 minutes for growth calculations
        enable_polling: true,
      }}
    >
      {(data, loading, error) => {
        // Transform data for growth analysis
        const growthData = React.useMemo(() => {
          if (!data || data.length === 0) return [];

          return data.map((item, index) => {
            const currentRevenue = Number(item.revenue || 0);
            const previousRevenue =
              index > 0 ? Number(data[index - 1].revenue || 0) : 0;
            const growth =
              index > 0 && previousRevenue > 0
                ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
                : 0;

            return {
              ...item,
              growth: Math.round(growth * 100) / 100,
              cumulativeRevenue: data
                .slice(0, index + 1)
                .reduce((sum, d) => sum + Number(d.revenue || 0), 0),
            };
          });
        }, [data]);

        return (
          <RevenueAreaChart
            data={growthData}
            loading={loading}
            error={error}
            height={300}
            xDataKey="date"
            areas={[
              {
                dataKey: "cumulativeRevenue",
                name: "Cumulative Revenue",
                color: CHART_COLORS.primary,
                fillOpacity: 0.6,
              },
            ]}
          />
        );
      }}
    </RealtimeChartWrapper>
  );
}

/**
 * Real-time Revenue Sources Chart
 */
export function RealtimeRevenueSourcesChart() {
  const { data, loading, error } = useRealtimeChartData("revenue-sources", {
    table: "metrics",
    metric_types: ["online_sales", "subscriptions", "enterprise", "partners"],
    refresh_interval: 300000, // 5 minutes for source breakdown
    enable_polling: true,
  });

  const pieData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { name: "Online Sales", value: 45, amount: 235000 },
        { name: "Subscriptions", value: 25, amount: 130000 },
        { name: "Enterprise", value: 20, amount: 105000 },
        { name: "Partners", value: 10, amount: 54750 },
      ];
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      name: item.metric_type
        .replace("_", " ")
        .replace(/\b\w/g, l => l.toUpperCase()),
      value: total > 0 ? Math.round((item.value / total) * 100) : 0,
      amount: item.value,
    }));
  }, [data]);

  return (
    <DashboardCard
      title="Revenue Sources"
      description="Real-time revenue distribution by source"
      colSpan={2}
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <RealtimeStatusIndicator
            isRealtime={true}
            lastUpdated={new Date()}
            error={error}
          />
        </div>
        <RevenuePieChart
          data={pieData}
          loading={loading}
          error={error}
          height={300}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
        />
      </div>
    </DashboardCard>
  );
}

/**
 * Enhanced Revenue Charts Container with Real-time Capabilities
 */
export function RealtimeRevenueCharts() {
  return (
    <div className="space-y-6">
      <RealtimeRevenueOverviewCards />

      <DashboardGrid>
        <DashboardCard colSpan={4}>
          <RealtimeRevenueTrendChart />
        </DashboardCard>

        <DashboardCard colSpan={2}>
          <RealtimeRevenueGrowthChart />
        </DashboardCard>

        <RealtimeRevenueSourcesChart />
      </DashboardGrid>
    </div>
  );
}

// Export HOC versions for backward compatibility
export const RealtimeRevenueTrendChartHOC = withRealtimeData(
  RevenueLineChart,
  "revenue"
);
export const RealtimeRevenueAreaChartHOC = withRealtimeData(
  RevenueAreaChart,
  "revenue"
);
export const RealtimeRevenueBarChartHOC = withRealtimeData(
  RevenueBarChart,
  "revenue"
);
