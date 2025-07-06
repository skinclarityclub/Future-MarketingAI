"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, UserCheck, TrendingUp } from "lucide-react";
import {
  RevenueLineChart,
  RevenueBarChart,
  RevenuePieChart,
  KPICard,
  CHART_COLORS,
} from "@/components/charts/base-chart-components";
import {
  generateCustomerData,
  formatNumber,
  formatPercentage,
} from "@/lib/data/mock-chart-data";
import {
  DashboardGrid,
  DashboardCard,
} from "@/components/layout/dashboard-layout";

export function CustomerOverviewCards() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const customerData = generateCustomerData();
      const totalCustomers = customerData.segments.reduce(
        (sum, seg) => sum + seg.value,
        0
      );
      const newCustomers = Math.round(totalCustomers * 0.15); // 15% new this month
      const activeCustomers = Math.round(totalCustomers * 0.68); // 68% active
      const customerGrowth = 8.2; // 8.2% growth

      setMetrics({
        total: { value: totalCustomers, change: customerGrowth, trend: "up" },
        new: { value: newCustomers, change: 12.4, trend: "up" },
        active: { value: activeCustomers, change: 5.7, trend: "up" },
        growth: { value: customerGrowth, change: 2.1, trend: "up" },
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardGrid>
      <KPICard
        title="Total Customers"
        value={formatNumber(metrics?.total?.value || 0)}
        change={{
          value: metrics?.total?.change || 0,
          label: "from last month",
          trend: metrics?.total?.trend || "neutral",
        }}
        icon={<Users className="h-5 w-5 text-primary" />}
        loading={loading}
      />
      <KPICard
        title="New Customers"
        value={formatNumber(metrics?.new?.value || 0)}
        change={{
          value: metrics?.new?.change || 0,
          label: "this month",
          trend: metrics?.new?.trend || "neutral",
        }}
        icon={<UserPlus className="h-5 w-5 text-primary" />}
        loading={loading}
      />
      <KPICard
        title="Active Customers"
        value={formatNumber(metrics?.active?.value || 0)}
        change={{
          value: metrics?.active?.change || 0,
          label: "from last month",
          trend: metrics?.active?.trend || "neutral",
        }}
        icon={<UserCheck className="h-5 w-5 text-primary" />}
        loading={loading}
      />
      <KPICard
        title="Growth Rate"
        value={formatPercentage(metrics?.growth?.value || 0)}
        change={{
          value: metrics?.growth?.change || 0,
          label: "month over month",
          trend: metrics?.growth?.trend || "neutral",
        }}
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        loading={loading}
      />
    </DashboardGrid>
  );
}

export function CustomerSegmentationChart() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const customerData = generateCustomerData();
      setData(customerData.segments);
      setLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardCard
      title="Customer Segmentation"
      description="Customer distribution by type"
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

export function CustomerAcquisitionChart() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const customerData = generateCustomerData();
      setData(customerData.acquisition);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardCard
      title="Customer Acquisition"
      description="New vs churned customers monthly"
      colSpan={2}
    >
      <RevenueBarChart
        data={data}
        loading={loading}
        height={300}
        xDataKey="date"
        bars={[
          {
            dataKey: "newCustomers",
            name: "New Customers",
            color: CHART_COLORS.success,
          },
          {
            dataKey: "churnedCustomers",
            name: "Churned Customers",
            color: CHART_COLORS.danger,
          },
        ]}
      />
    </DashboardCard>
  );
}

export function CustomerRetentionChart() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const customerData = generateCustomerData();
      setData(customerData.retention);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardCard
      title="Customer Retention Trends"
      description="Retention rate and satisfaction over time"
      colSpan={4}
    >
      <RevenueLineChart
        data={data}
        loading={loading}
        height={350}
        xDataKey="date"
        lines={[
          {
            dataKey: "retentionRate",
            name: "Retention Rate (%)",
            color: CHART_COLORS.primary,
            strokeWidth: 3,
          },
          {
            dataKey: "satisfactionScore",
            name: "Satisfaction Score",
            color: CHART_COLORS.secondary,
            strokeWidth: 2,
          },
        ]}
      />
    </DashboardCard>
  );
}

// Main Customer Charts component
export function CustomerCharts() {
  return (
    <div className="space-y-6">
      <CustomerOverviewCards />
      <DashboardGrid>
        <CustomerSegmentationChart />
        <CustomerAcquisitionChart />
      </DashboardGrid>
      <CustomerRetentionChart />
    </div>
  );
}
