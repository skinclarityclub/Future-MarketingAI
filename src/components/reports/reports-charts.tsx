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
  generateReportsData,
  generateOperationalData,
  formatCurrency,
  formatPercentage,
  formatNumber,
} from "@/lib/data/mock-chart-data";
import { FileText, Download, Clock, TrendingUp } from "lucide-react";

interface ReportsMetrics {
  totalReports: number;
  totalDownloads: number;
  avgGenerationTime: number;
  successRate: number;
}

export function ReportsCharts() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<ReportsMetrics>({
    totalReports: 0,
    totalDownloads: 0,
    avgGenerationTime: 0,
    successRate: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const reportsData = generateReportsData();
      const operationalData = generateOperationalData();

      const totalReports = reportsData.topReports.length;
      const totalDownloads = reportsData.topReports.reduce(
        (sum, report) => sum + report.downloads,
        0
      );
      const avgUptime =
        operationalData.systemHealth.find(item => item.name === "System Uptime")
          ?.value || 99;

      setMetrics({
        totalReports,
        totalDownloads,
        avgGenerationTime: 2.8, // Average time in seconds
        successRate: avgUptime,
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

  // Reports Overview KPI Cards
  const ReportsOverviewCards = () => (
    <DashboardGrid>
      <KPICard
        title="Total Reports"
        value={formatNumber(metrics.totalReports)}
        change={{
          value: 8.3,
          trend: "up",
          label: "new this month",
        }}
        icon={<FileText className="h-4 w-4" />}
      />
      <KPICard
        title="Total Downloads"
        value={formatNumber(metrics.totalDownloads)}
        change={{
          value: 15.7,
          trend: "up",
          label: "vs last month",
        }}
        icon={<Download className="h-4 w-4" />}
      />
      <KPICard
        title="Avg Generation Time"
        value={`${metrics.avgGenerationTime}s`}
        change={{
          value: -12.4,
          trend: "up",
          label: "performance improved",
        }}
        icon={<Clock className="h-4 w-4" />}
      />
      <KPICard
        title="Success Rate"
        value={formatPercentage(metrics.successRate)}
        change={{
          value: 2.1,
          trend: "up",
          label: "uptime improved",
        }}
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </DashboardGrid>
  );

  // Report Usage Trends
  const ReportUsageTrends = () => {
    const data = generateRevenueData(30).map((item, index) => ({
      date: item.date,
      reports: Math.floor(15 + Math.random() * 25),
      downloads: Math.floor(50 + Math.random() * 100),
      views: Math.floor(100 + Math.random() * 200),
    }));

    return (
      <DashboardCard
        title="Report Usage Trends"
        description="Daily report generation and download statistics"
        colSpan={2}
      >
        <RevenueLineChart
          data={data}
          lines={[
            { dataKey: "reports", name: "Reports Generated", color: "#3b82f6" },
            { dataKey: "downloads", name: "Downloads", color: "#10b981" },
            { dataKey: "views", name: "Views", color: "#f59e0b" },
          ]}
          height={320}
        />
      </DashboardCard>
    );
  };

  // Popular Reports Chart
  const PopularReportsChart = () => {
    const reportsData = generateReportsData();

    return (
      <DashboardCard
        title="Most Popular Reports"
        description="Top downloaded reports by category"
        colSpan={2}
      >
        <RevenueBarChart
          data={reportsData.topReports}
          bars={[{ dataKey: "downloads", name: "Downloads", color: "#3b82f6" }]}
          height={320}
          xDataKey="name"
        />
      </DashboardCard>
    );
  };

  // Report Types Distribution
  const ReportTypesChart = () => {
    const reportTypes = [
      { name: "Financial", value: 35 },
      { name: "Sales", value: 28 },
      { name: "Marketing", value: 22 },
      { name: "Operations", value: 15 },
    ];

    return (
      <DashboardCard
        title="Report Types Distribution"
        description="Breakdown of reports by category"
        colSpan={2}
      >
        <RevenuePieChart
          data={reportTypes}
          height={320}
          showLabels={true}
          innerRadius={60}
        />
      </DashboardCard>
    );
  };

  // System Performance for Reports
  const SystemPerformanceChart = () => {
    const performanceData = generateOperationalData();

    return (
      <DashboardCard
        title="System Performance"
        description="Report generation system health metrics"
        colSpan={2}
      >
        <RevenueAreaChart
          data={performanceData.performance}
          areas={[
            {
              dataKey: "responseTime",
              name: "Response Time",
              color: "#3b82f6",
            },
            { dataKey: "throughput", name: "Throughput", color: "#10b981" },
          ]}
          height={300}
        />
      </DashboardCard>
    );
  };

  return (
    <div className="space-y-6">
      <ReportsOverviewCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportUsageTrends />
        <PopularReportsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportTypesChart />
        <SystemPerformanceChart />
      </div>
    </div>
  );
}
