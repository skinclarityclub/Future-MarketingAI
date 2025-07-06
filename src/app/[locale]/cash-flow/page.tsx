"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
  UltraPremiumGrid,
  UltraPremiumCard,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { useLocale } from "@/lib/i18n/context";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  Activity,
} from "lucide-react";

export default function CashFlowPage() {
  const { t } = useLocale();

  const cashFlowMetrics = [
    {
      title: "Current Cash Flow",
      value: "€745K",
      change: "+5.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Operating Cash Flow",
      value: "€892K",
      change: "+12.3%",
      trend: "up",
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "Free Cash Flow",
      value: "€634K",
      change: "-2.1%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "Cash Burn Rate",
      value: "€45K/month",
      change: "-8.7%",
      trend: "down",
      icon: TrendingUp,
      color: "text-green-600",
    },
  ];

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title="Cash Flow Analysis"
        description="Monitor cash flow patterns and financial liquidity"
        priority="primary"
      >
        <UltraPremiumGrid>
          {cashFlowMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <UltraPremiumCard
                key={index}
                title={metric.title}
                variant="glass"
                colSpan={1}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {metric.value}
                    </div>
                    <div
                      className={`text-sm flex items-center gap-1 ${
                        metric.trend === "up"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      <TrendingUp
                        className={`h-3 w-3 ${
                          metric.trend === "down" ? "rotate-180" : ""
                        }`}
                      />
                      {metric.change}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted/30 ${metric.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </UltraPremiumCard>
            );
          })}
        </UltraPremiumGrid>

        <UltraPremiumCard
          title="Cash Flow Forecast"
          description="12-month cash flow projection and trend analysis"
          variant="glass"
          colSpan={4}
        >
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Cash flow chart visualization will be implemented here
          </div>
        </UltraPremiumCard>
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
