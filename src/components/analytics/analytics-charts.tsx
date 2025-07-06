"use client";

import React, { useState, useEffect } from "react";
import {
  DashboardGrid,
  DashboardCard,
} from "@/components/layout/dashboard-layout";
import {
  RevenueLineChart,
  RevenueAreaChart,
  RevenueBarChart,
  RevenuePieChart,
  KPICard,
  ChartSkeleton,
} from "@/components/charts/base-chart-components";
import {
  generateRevenueData,
  generatePerformanceData,
  generateCustomerData,
  generateMarketingData,
  formatCurrency,
  formatPercentage,
} from "@/lib/data/mock-chart-data";
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";

interface AnalyticsMetrics {
  totalRevenue: number;
  conversionRate: number;
  customerGrowth: number;
  marketingROI: number;
}

export function AnalyticsCharts() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalRevenue: 0,
    conversionRate: 0,
    customerGrowth: 0,
    marketingROI: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const revenueData = generateRevenueData(12);
      const performanceData = generatePerformanceData(30);
      const customerData = generateCustomerData();
      const marketingData = generateMarketingData();

      const totalRevenue = revenueData.reduce(
        (sum, d) => sum + Number(d.revenue),
        0
      );
      const avgConversionRate =
        performanceData.reduce((sum, d) => sum + Number(d.conversions), 0) /
        performanceData.length;
      const totalCustomers = customerData.segments.reduce(
        (sum, seg) => sum + seg.value,
        0
      );
      const avgROI =
        marketingData.channels.reduce((sum, ch) => sum + ch.roi, 0) /
        marketingData.channels.length;

      setMetrics({
        totalRevenue,
        conversionRate: avgConversionRate,
        customerGrowth: (totalCustomers / 1000) * 100, // Growth percentage
        marketingROI: avgROI,
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardGrid>
          {[...Array(4)].map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </DashboardGrid>
        <DashboardGrid>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="col-span-2">
              <ChartSkeleton />
            </div>
          ))}
        </DashboardGrid>
      </div>
    );
  }

  // Analytics Overview KPI Cards
  const AnalyticsOverviewCards = () => (
    <DashboardGrid>
      <KPICard
        title="Total Analytics Revenue"
        value={formatCurrency(metrics.totalRevenue)}
        change={{
          value: 18.2,
          trend: "up",
          label: "vs last period",
        }}
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <KPICard
        title="Avg Conversion Rate"
        value={formatPercentage(metrics.conversionRate)}
        change={{
          value: 2.4,
          trend: "up",
          label: "this month",
        }}
        icon={<BarChart3 className="h-4 w-4" />}
      />
      <KPICard
        title="Customer Growth"
        value={formatPercentage(metrics.customerGrowth)}
        change={{
          value: 12.5,
          trend: "up",
          label: "month over month",
        }}
        icon={<PieChart className="h-4 w-4" />}
      />
      <KPICard
        title="Marketing ROI"
        value={formatPercentage(metrics.marketingROI)}
        change={{
          value: -3.2,
          trend: "down",
          label: "needs attention",
        }}
        icon={<Activity className="h-4 w-4" />}
      />
    </DashboardGrid>
  );

  // Advanced Analytics Trend Chart
  const AnalyticsTrendChart = () => {
    const data = generateRevenueData(12).map(item => ({
      ...item,
      performance: 85 + Math.random() * 15,
      efficiency: 70 + Math.random() * 20,
    }));

    return (
      <DashboardCard
        title="Analytics Performance Trends"
        description="Multi-dimensional performance analysis over time"
        colSpan={2}
      >
        <RevenueLineChart
          data={data}
          xDataKey="date"
          lines={[
            { dataKey: "revenue", name: "Revenue", color: "#3b82f6" },
            { dataKey: "performance", name: "Performance", color: "#10b981" },
            { dataKey: "efficiency", name: "Efficiency", color: "#f59e0b" },
          ]}
          height={320}
        />
      </DashboardCard>
    );
  };

  // Customer Segmentation Analytics
  const CustomerSegmentationChart = () => {
    const customerData = generateCustomerData();

    return (
      <DashboardCard
        title="Customer Segment Analysis"
        description="Deep dive into customer behavior patterns"
        colSpan={2}
      >
        <RevenuePieChart
          data={customerData.segments}
          dataKey="value"
          nameKey="name"
          height={320}
          showLabels={true}
          innerRadius={60}
        />
      </DashboardCard>
    );
  };

  // Revenue vs Target Analytics
  const RevenueTargetChart = () => {
    const data = generateRevenueData(12);

    return (
      <DashboardCard
        title="Revenue vs Target Analysis"
        description="Performance against business targets"
        colSpan={2}
      >
        <RevenueAreaChart
          data={data}
          xDataKey="date"
          areas={[
            { dataKey: "revenue", name: "Actual Revenue", color: "#3b82f6" },
            { dataKey: "target", name: "Target Revenue", color: "#10b981" },
          ]}
          height={300}
        />
      </DashboardCard>
    );
  };

  // Marketing Channel Analytics
  const MarketingChannelChart = () => {
    const marketingData = generateMarketingData();

    return (
      <DashboardCard
        title="Marketing Channel Performance"
        description="ROI analysis across marketing channels"
        colSpan={2}
      >
        <RevenueBarChart
          data={marketingData.channels}
          bars={[
            { dataKey: "revenue", name: "Revenue", color: "#3b82f6" },
            { dataKey: "spend", name: "Ad Spend", color: "#ef4444" },
          ]}
          height={300}
          xDataKey="name"
        />
      </DashboardCard>
    );
  };

  return (
    <div className="space-y-6">
      <AnalyticsOverviewCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsTrendChart />
        <CustomerSegmentationChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTargetChart />
        <MarketingChannelChart />
      </div>
    </div>
  );
}
