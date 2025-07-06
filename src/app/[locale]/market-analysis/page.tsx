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
  BarChart3,
  TrendingUp,
  Target,
  Globe,
  Users,
  PieChart,
} from "lucide-react";

export default function MarketAnalysisPage() {
  const { t } = useLocale();

  const marketMetrics = [
    {
      title: "Market Share",
      value: "23.4%",
      change: "+2.1%",
      trend: "up",
      icon: PieChart,
      color: "text-blue-600",
    },
    {
      title: "Market Size",
      value: "€125M",
      change: "+15.3%",
      trend: "up",
      icon: Globe,
      color: "text-green-600",
    },
    {
      title: "Competitor Analysis",
      value: "8 tracked",
      change: "+2",
      trend: "up",
      icon: Target,
      color: "text-purple-600",
    },
    {
      title: "Market Penetration",
      value: "18.7%",
      change: "+3.2%",
      trend: "up",
      icon: Users,
      color: "text-orange-600",
    },
  ];

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title="Market Analysis"
        description="Comprehensive market trends, competitive analysis and opportunities"
        priority="primary"
      >
        <UltraPremiumGrid>
          {marketMetrics.map((metric, index) => {
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
          title="Market Trends"
          description="Industry trends and competitive landscape analysis"
          variant="glass"
          colSpan={4}
        >
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Market analysis charts and competitive intelligence will be
            displayed here
          </div>
        </UltraPremiumCard>
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
