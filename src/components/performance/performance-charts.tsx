"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Users, Target, Activity } from "lucide-react";
import {
  RevenueLineChart,
  RevenueAreaChart,
  RevenueBarChart,
  RevenuePieChart,
  KPICard,
  CHART_COLORS,
} from "@/components/charts/base-chart-components";
import {
  generatePerformanceData,
  formatNumber,
  formatPercentage,
} from "@/lib/data/mock-chart-data";
import {
  DashboardGrid,
  DashboardCard,
} from "@/components/layout/dashboard-layout";
import { useLocale } from "@/lib/i18n/context";

export function PerformanceOverviewCards() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const performanceData = generatePerformanceData(30);
      const totalPageViews = performanceData.reduce(
        (sum, d) => sum + Number(d.pageViews),
        0
      );
      const totalSessions = performanceData.reduce(
        (sum, d) => sum + Number(d.sessions),
        0
      );
      const totalConversions = performanceData.reduce(
        (sum, d) => sum + Number(d.conversions),
        0
      );
      const avgBounceRate =
        performanceData.reduce((sum, d) => sum + Number(d.bounceRate), 0) /
        performanceData.length;

      setMetrics({
        pageViews: { value: totalPageViews, change: 8.2, trend: "up" },
        sessions: { value: totalSessions, change: 5.7, trend: "up" },
        conversions: { value: totalConversions, change: 12.4, trend: "up" },
        bounceRate: { value: avgBounceRate, change: -3.1, trend: "up" }, // Lower bounce rate is better
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardGrid>
      <KPICard
        title={t("performance.pageViews")}
        value={formatNumber(metrics?.pageViews?.value || 0)}
        change={{
          value: metrics?.pageViews?.change || 0,
          label: t("charts.fromLastMonth"),
          trend: metrics?.pageViews?.trend || "neutral",
        }}
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        loading={loading}
      />
      <KPICard
        title={t("performance.sessions")}
        value={formatNumber(metrics?.sessions?.value || 0)}
        change={{
          value: metrics?.sessions?.change || 0,
          label: t("charts.fromLastMonth"),
          trend: metrics?.sessions?.trend || "neutral",
        }}
        icon={<Users className="h-5 w-5 text-primary" />}
        loading={loading}
      />
      <KPICard
        title={t("performance.conversions")}
        value={formatNumber(metrics?.conversions?.value || 0)}
        change={{
          value: metrics?.conversions?.change || 0,
          label: t("charts.fromLastMonth"),
          trend: metrics?.conversions?.trend || "neutral",
        }}
        icon={<Target className="h-5 w-5 text-primary" />}
        loading={loading}
      />
      <KPICard
        title={t("performance.bounceRate")}
        value={formatPercentage(metrics?.bounceRate?.value || 0)}
        change={{
          value: metrics?.bounceRate?.change || 0,
          label: t("charts.fromLastMonth"),
          trend: metrics?.bounceRate?.trend || "neutral",
        }}
        icon={<Activity className="h-5 w-5 text-primary" />}
        loading={loading}
      />
    </DashboardGrid>
  );
}

export function PerformanceTrendChart() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(generatePerformanceData(30));
      setLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardCard
      title={t("performance.performanceTrends")}
      description={t("performance.dailyTrafficAndEngagementMetrics")}
      colSpan={4}
    >
      <RevenueLineChart
        data={data}
        loading={loading}
        height={350}
        xDataKey="date"
        lines={[
          {
            dataKey: "pageViews",
            name: t("performance.pageViews"),
            color: CHART_COLORS.primary,
            strokeWidth: 3,
          },
          {
            dataKey: "sessions",
            name: t("performance.sessions"),
            color: CHART_COLORS.secondary,
            strokeWidth: 2,
          },
          {
            dataKey: "conversions",
            name: t("performance.conversions"),
            color: CHART_COLORS.success,
            strokeWidth: 2,
          },
        ]}
      />
    </DashboardCard>
  );
}

export function ConversionFunnelChart() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData([
        { stage: t("performance.visitors"), count: 12450, conversion: 100 },
        { stage: t("performance.productViews"), count: 8920, conversion: 71.6 },
        { stage: t("performance.addToCart"), count: 3240, conversion: 26.0 },
        { stage: t("performance.checkout"), count: 1850, conversion: 14.9 },
        { stage: t("performance.purchase"), count: 680, conversion: 5.5 },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [t]);

  return (
    <DashboardCard
      title={t("performance.conversionFunnel")}
      description={t("performance.userJourneyAndConversionRates")}
      colSpan={2}
    >
      <RevenueBarChart
        data={data}
        loading={loading}
        height={300}
        xDataKey="stage"
        bars={[
          {
            dataKey: "count",
            name: t("performance.users"),
            color: CHART_COLORS.primary,
          },
        ]}
      />
    </DashboardCard>
  );
}

export function TrafficSourcesChart() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData([
        { name: t("performance.organicSearch"), value: 42, sessions: 8924 },
        { name: t("performance.direct"), value: 28, sessions: 5947 },
        { name: t("performance.socialMedia"), value: 15, sessions: 3186 },
        { name: t("performance.paidSearch"), value: 10, sessions: 2124 },
        { name: t("performance.email"), value: 5, sessions: 1062 },
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [t]);

  return (
    <DashboardCard
      title={t("performance.trafficSources")}
      description={t("performance.visitorAcquisitionChannels")}
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

export function EngagementMetricsChart() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const performanceData = generatePerformanceData(7);
      const weeklyData = performanceData.map((item, index) => ({
        day: [
          t("common.days.mon"),
          t("common.days.tue"),
          t("common.days.wed"),
          t("common.days.thu"),
          t("common.days.fri"),
          t("common.days.sat"),
          t("common.days.sun"),
        ][index % 7],
        pageViews: Number(item.pageViews),
        sessions: Number(item.sessions),
        avgSessionDuration: Math.round(120 + Math.random() * 180), // 2-5 minutes
        pagesPerSession: Math.round((2 + Math.random() * 3) * 10) / 10, // 2-5 pages
      }));
      setData(weeklyData);
      setLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, [t]);

  return (
    <DashboardCard
      title={t("performance.weeklyEngagement")}
      description={t("performance.userEngagementPatternsByDay")}
      colSpan={4}
    >
      <RevenueAreaChart
        data={data}
        loading={loading}
        height={300}
        xDataKey="day"
        areas={[
          {
            dataKey: "pageViews",
            name: t("performance.pageViews"),
            color: CHART_COLORS.primary,
            fillOpacity: 0.7,
          },
          {
            dataKey: "sessions",
            name: t("performance.sessions"),
            color: CHART_COLORS.secondary,
            fillOpacity: 0.5,
          },
        ]}
      />
    </DashboardCard>
  );
}

// Main Performance Charts component
export function PerformanceCharts() {
  return (
    <div className="space-y-6">
      <PerformanceOverviewCards />
      <PerformanceTrendChart />
      <DashboardGrid>
        <ConversionFunnelChart />
        <TrafficSourcesChart />
      </DashboardGrid>
      <EngagementMetricsChart />
    </div>
  );
}
