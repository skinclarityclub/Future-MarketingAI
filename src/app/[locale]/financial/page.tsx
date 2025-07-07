"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
  UltraPremiumGrid,
  UltraPremiumCard,
} from "@/components/layout/ultra-premium-dashboard-layout";
import FinancialIntelligenceDashboard from "@/components/dashboard/financial-intelligence-dashboard";
import BudgetPerformanceTracker from "@/components/dashboard/budget-performance-tracker";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calculator,
} from "lucide-react";

export default function FinancialOverviewPage() {
  // Mock financial data
  const financialKPIs = [
    {
      title: "Total Revenue",
      value: "€2.4M",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Net Profit",
      value: "€487K",
      change: "+8.3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Operating Expenses",
      value: "€1.2M",
      change: "+2.1%",
      trend: "up",
      icon: Calculator,
      color: "text-orange-600",
    },
    {
      title: "Cash Flow",
      value: "€745K",
      change: "-1.2%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600",
    },
  ];

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title="Financial Overview"
        description="Comprehensive financial performance and key metrics"
        priority="primary"
      >
        {/* Financial KPI Cards */}
        <UltraPremiumGrid>
          {financialKPIs.map((kpi, index) => {
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

        {/* Financial Intelligence Dashboard */}
        <UltraPremiumCard
          title="Financial Intelligence"
          description="Advanced financial analytics and insights"
          variant="glass"
          colSpan={4}
        >
          <FinancialIntelligenceDashboard />
        </UltraPremiumCard>

        {/* Budget Performance Tracker */}
        <UltraPremiumCard
          title="Budget Performance"
          description="Track budget allocation and performance"
          variant="glass"
          colSpan={4}
        >
          <BudgetPerformanceTracker />
        </UltraPremiumCard>

        {/* Quick Actions */}
        <UltraPremiumGrid>
          <UltraPremiumCard
            title="Quick Actions"
            description="Financial management shortcuts"
            variant="minimal"
            colSpan={4}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/revenue-analytics"
                className="flex flex-col items-center p-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 group"
              >
                <BarChart3 className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Revenue Analytics</span>
              </Link>
              <Link
                href="/budget"
                className="flex flex-col items-center p-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 group"
              >
                <PieChart className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Budget Management</span>
              </Link>
              <Link
                href="/cash-flow"
                className="flex flex-col items-center p-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 group"
              >
                <TrendingDown className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Cash Flow</span>
              </Link>
              <Link
                href="/reports"
                className="flex flex-col items-center p-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-all duration-300 group"
              >
                <BarChart3 className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Financial Reports</span>
              </Link>
            </div>
          </UltraPremiumCard>
        </UltraPremiumGrid>
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
