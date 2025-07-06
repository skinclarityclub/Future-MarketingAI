"use client";

import React, { useState, useEffect } from "react";
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
  generateRevenueData,
  generateFinancialKPIs,
  formatCurrency,
  formatPercentage,
} from "@/lib/data/mock-chart-data";
import {
  DashboardGrid,
  DashboardCard,
} from "@/components/layout/dashboard-layout";
import { useLocale } from "@/lib/i18n/context";

export function RevenueOverviewCards() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKpis(generateFinancialKPIs());
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardGrid>
      <KPICard
        title={t("charts.totalRevenue")}
        value={formatCurrency(kpis?.totalRevenue?.value || 0)}
        change={{
          value: kpis?.totalRevenue?.change || 0,
          label: kpis?.totalRevenue?.period || "",
          trend: kpis?.totalRevenue?.trend || "neutral",
        }}
        icon={<DollarSign className="h-5 w-5 text-primary" />}
        loading={loading}
      />
      <KPICard
        title={t("charts.monthlyGrowth")}
        value={formatPercentage(kpis?.monthlyGrowth?.value || 0)}
        change={{
          value: kpis?.monthlyGrowth?.change || 0,
          label: kpis?.monthlyGrowth?.period || "",
          trend: kpis?.monthlyGrowth?.trend || "neutral",
        }}
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        loading={loading}
      />
      <KPICard
        title={t("charts.avgOrderValue")}
        value={formatCurrency(kpis?.avgOrderValue?.value || 0)}
        change={{
          value: kpis?.avgOrderValue?.change || 0,
          label: kpis?.avgOrderValue?.period || "",
          trend: kpis?.avgOrderValue?.trend || "neutral",
        }}
        icon={<Target className="h-5 w-5 text-primary" />}
        loading={loading}
      />
      <KPICard
        title={t("charts.conversionRate")}
        value={formatPercentage(kpis?.conversionRate?.value || 0)}
        change={{
          value: kpis?.conversionRate?.change || 0,
          label: kpis?.conversionRate?.period || "",
          trend: kpis?.conversionRate?.trend || "neutral",
        }}
        icon={<BarChart3 className="h-5 w-5 text-primary" />}
        loading={loading}
      />
    </DashboardGrid>
  );
}

export function RevenueTrendChart() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(generateRevenueData(12));
      setLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardCard
      title={t("charts.revenueTrends")}
      description={t("charts.monthlyRevenuePerformanceVsTargets")}
      colSpan={4}
    >
      <RevenueLineChart
        data={data}
        loading={loading}
        height={350}
        xDataKey="date"
        lines={[
          {
            dataKey: "revenue",
            name: t("charts.actualRevenue"),
            color: CHART_COLORS.primary,
            strokeWidth: 3,
          },
          {
            dataKey: "forecast",
            name: t("charts.forecast"),
            color: CHART_COLORS.secondary,
            strokeWidth: 2,
          },
          {
            dataKey: "target",
            name: t("charts.target"),
            color: CHART_COLORS.warning,
            strokeWidth: 2,
          },
        ]}
      />
    </DashboardCard>
  );
}

export function RevenueGrowthChart() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const revenueData = generateRevenueData(6);
      // Calculate growth data
      const growthData = revenueData.map((item, index) => {
        const currentRevenue = Number(item.revenue);
        const previousRevenue =
          index > 0 ? Number(revenueData[index - 1].revenue) : 0;
        const growth =
          index > 0 && previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0;
        return {
          ...item,
          growth: Math.round(growth * 100) / 100,
          cumulativeRevenue: revenueData
            .slice(0, index + 1)
            .reduce((sum, d) => sum + Number(d.revenue), 0),
        };
      });
      setData(growthData);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardCard
      title={t("charts.revenueGrowthAnalysis")}
      description={t("charts.monthOverMonthGrowthAndCumulativeRevenue")}
      colSpan={2}
    >
      <RevenueAreaChart
        data={data}
        loading={loading}
        height={300}
        xDataKey="date"
        areas={[
          {
            dataKey: "cumulativeRevenue",
            name: t("charts.cumulativeRevenue"),
            color: CHART_COLORS.primary,
            fillOpacity: 0.6,
          },
        ]}
      />
    </DashboardCard>
  );
}

export function RevenueSourcesChart() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData([
        { name: t("charts.onlineSales"), value: 45, amount: 235000 },
        { name: t("charts.subscriptions"), value: 25, amount: 130000 },
        { name: t("charts.enterprise"), value: 20, amount: 105000 },
        { name: t("charts.partners"), value: 10, amount: 54750 },
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [t]);

  return (
    <DashboardCard
      title={t("charts.revenueSources")}
      description={t("charts.revenueDistributionByChannel")}
      colSpan={2}
    >
      <RevenuePieChart
        data={data}
        loading={loading}
        height={300}
        dataKey="value"
        nameKey="name"
        showLabels={true}
        innerRadius={60}
        outerRadius={100}
      />
    </DashboardCard>
  );
}

export function RevenueByProductChart() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData([
        {
          product: t("charts.productA"),
          revenue: 125000,
          target: 120000,
          margin: 35,
        },
        {
          product: t("charts.productB"),
          revenue: 98000,
          target: 100000,
          margin: 42,
        },
        {
          product: t("charts.productC"),
          revenue: 87000,
          target: 85000,
          margin: 28,
        },
        {
          product: t("charts.productD"),
          revenue: 76000,
          target: 80000,
          margin: 31,
        },
        {
          product: t("charts.productE"),
          revenue: 65000,
          target: 70000,
          margin: 45,
        },
        {
          product: t("charts.productF"),
          revenue: 54000,
          target: 60000,
          margin: 38,
        },
      ]);
      setLoading(false);
    }, 950);
    return () => clearTimeout(timer);
  }, [t]);

  return (
    <DashboardCard
      title={t("charts.revenueByProduct")}
      description={t("charts.productPerformanceVsTargets")}
      colSpan={4}
    >
      <RevenueBarChart
        data={data}
        loading={loading}
        height={350}
        xDataKey="product"
        bars={[
          {
            dataKey: "revenue",
            name: t("charts.actualRevenue"),
            color: CHART_COLORS.primary,
          },
          {
            dataKey: "target",
            name: t("charts.target"),
            color: CHART_COLORS.secondary,
          },
        ]}
      />
    </DashboardCard>
  );
}

// Main Revenue Charts component that combines all charts
export function RevenueCharts() {
  return (
    <div className="space-y-6">
      <RevenueOverviewCards />
      <RevenueTrendChart />
      <DashboardGrid>
        <RevenueGrowthChart />
        <RevenueSourcesChart />
      </DashboardGrid>
      <RevenueByProductChart />
    </div>
  );
}
