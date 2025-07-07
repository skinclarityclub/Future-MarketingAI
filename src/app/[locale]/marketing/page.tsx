"use client";

import React from "react";
import Link from "next/link";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
  UltraPremiumGrid,
  UltraPremiumCard,
} from "@/components/layout/ultra-premium-dashboard-layout";
import MarketingOptimization from "@/components/dashboard/marketing-optimization";
import ContentPerformanceOverview from "@/components/dashboard/content-performance-overview";
import {
  Target,
  Zap,
  Users,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
} from "lucide-react";

export default function MarketingOverviewPage() {
  const breadcrumbItems = [
    { label: "Marketing", href: "/marketing", current: true },
  ];

  // Mock marketing data
  const marketingKPIs = [
    {
      title: "Campaign ROI",
      value: "342%",
      change: "+18.5%",
      trend: "up",
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "Lead Generation",
      value: "1,247",
      change: "+24.3%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Conversion Rate",
      value: "3.8%",
      change: "+0.5%",
      trend: "up",
      icon: MousePointer,
      color: "text-purple-600",
    },
    {
      title: "Marketing Spend",
      value: "€45K",
      change: "+12.1%",
      trend: "up",
      icon: DollarSign,
      color: "text-orange-600",
    },
  ];

  return (
    <UltraPremiumDashboardLayout
      currentPage="Marketing Dashboard"
      showSidebar={true}
      fullWidth={false}
      showBreadcrumbs={true}
      breadcrumbItems={breadcrumbItems}
    >
      <UltraPremiumSection
        title="Marketing Overview"
        description="Comprehensive marketing performance and campaign insights"
        priority="primary"
      >
        {/* Marketing KPI Cards */}
        <UltraPremiumGrid>
          {marketingKPIs.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <UltraPremiumCard
                key={index}
                title={kpi.title}
                variant="glass"
                colSpan={1}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {kpi.value}
                    </div>
                    <div
                      className={`text-sm flex items-center gap-1 ${
                        kpi.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <TrendingUp
                        className={`h-3 w-3 ${
                          kpi.trend === "down" ? "rotate-180" : ""
                        }`}
                      />
                      {kpi.change}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted/30 ${kpi.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </UltraPremiumCard>
            );
          })}
        </UltraPremiumGrid>

        {/* Marketing Optimization Dashboard */}
        <UltraPremiumCard
          title="Marketing Optimization"
          description="AI-powered marketing insights and recommendations"
          variant="glass"
          colSpan={4}
        >
          <MarketingOptimization />
        </UltraPremiumCard>

        {/* Content Performance Overview */}
        <UltraPremiumCard
          title="Content Performance"
          description="Track content effectiveness and engagement"
          variant="glass"
          colSpan={4}
        >
          <ContentPerformanceOverview />
        </UltraPremiumCard>

        {/* Quick Actions */}
        <UltraPremiumGrid>
          <UltraPremiumCard
            title="Quick Actions"
            description="Marketing management shortcuts"
            variant="minimal"
            colSpan={4}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/campaigns"
                className="flex flex-col items-center p-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 group"
              >
                <Zap className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Campaign Analytics</span>
              </Link>
              <Link
                href="/customer-insights"
                className="flex flex-col items-center p-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 group"
              >
                <Users className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Customer Insights</span>
              </Link>
              <Link
                href="/content"
                className="flex flex-col items-center p-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 group"
              >
                <Eye className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Content Performance</span>
              </Link>
              <Link
                href="/market-analysis"
                className="flex flex-col items-center p-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-all duration-300 group"
              >
                <BarChart3 className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Market Analysis</span>
              </Link>
            </div>
          </UltraPremiumCard>
        </UltraPremiumGrid>
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
