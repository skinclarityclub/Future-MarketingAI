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
  Search,
  TrendingUp,
  Target,
  Brain,
  BarChart3,
  Users,
  Eye,
  Lightbulb,
  Globe,
  Zap,
} from "lucide-react";

export default function ResearchDashboardPage() {
  const { t } = useLocale();

  const breadcrumbItems = [
    { label: "Research", href: "/research", current: true },
  ];

  // Mock research data
  const researchKPIs = [
    {
      title: "Research Completion",
      value: "87%",
      change: "+12.3%",
      trend: "up",
      icon: Search,
      color: "text-orange-600",
    },
    {
      title: "Trend Strength",
      value: "8.4/10",
      change: "+0.8",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Market Opportunities",
      value: "23",
      change: "+5",
      trend: "up",
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "Competitive Advantage",
      value: "74%",
      change: "+6.2%",
      trend: "up",
      icon: Brain,
      color: "text-purple-600",
    },
  ];

  const marketTrends = [
    { sector: "AI Technology", growth: "+147%", confidence: "High" },
    { sector: "Sustainability", growth: "+89%", confidence: "High" },
    { sector: "Digital Health", growth: "+67%", confidence: "Medium" },
    { sector: "Remote Work Tools", growth: "+45%", confidence: "High" },
  ];

  const competitiveInsights = [
    { metric: "Market Share", value: "23.4%", status: "Stable" },
    { metric: "Innovation Score", value: "#3", status: "Rising" },
    { metric: "Threat Level", value: "Low", status: "Favorable" },
    { metric: "Brand Recognition", value: "78%", status: "Strong" },
  ];

  const recentInsights = [
    {
      title: "Emerging Market Opportunity in Southeast Asia",
      type: "Opportunity",
      confidence: "High",
      date: "2 hours ago",
    },
    {
      title: "Competitor X launching new product line",
      type: "Threat",
      confidence: "Medium",
      date: "4 hours ago",
    },
    {
      title: "Consumer behavior shift towards sustainability",
      type: "Trend",
      confidence: "High",
      date: "6 hours ago",
    },
    {
      title: "Technology disruption in logistics sector",
      type: "Disruption",
      confidence: "Medium",
      date: "8 hours ago",
    },
  ];

  return (
    <UltraPremiumDashboardLayout
      currentPage="Research Dashboard"
      showSidebar={true}
      fullWidth={false}
      showBreadcrumbs={true}
      breadcrumbItems={breadcrumbItems}
    >
      <UltraPremiumSection
        title="Research Dashboard"
        description="Strategic market intelligence and competitive analysis"
        priority="primary"
      >
        {/* Research KPI Cards */}
        <UltraPremiumGrid>
          {researchKPIs.map((kpi, index) => {
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

        {/* Market Trend Analysis */}
        <UltraPremiumCard
          title="Market Trend Analysis"
          description="Growth sectors and emerging opportunities"
          variant="glass"
          colSpan={2}
        >
          <div className="space-y-4">
            {marketTrends.map((trend, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                  <span className="font-medium text-foreground">
                    {trend.sector}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-600 font-semibold">
                    {trend.growth}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {trend.confidence} Confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </UltraPremiumCard>

        {/* Competitive Intelligence */}
        <UltraPremiumCard
          title="Competitive Intelligence"
          description="Market position and competitive landscape"
          variant="glass"
          colSpan={2}
        >
          <div className="grid grid-cols-2 gap-4">
            {competitiveInsights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-muted/20 border border-muted/30"
              >
                <div className="text-sm text-muted-foreground mb-1">
                  {insight.metric}
                </div>
                <div className="text-xl font-bold text-foreground mb-1">
                  {insight.value}
                </div>
                <div className="text-sm text-green-600">{insight.status}</div>
              </div>
            ))}
          </div>
        </UltraPremiumCard>

        {/* Research Tools */}
        <UltraPremiumCard
          title="Research Tools"
          description="Quick access to research capabilities"
          variant="glass"
          colSpan={4}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/research/trends"
              className="flex flex-col items-center p-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-all duration-300 group"
            >
              <TrendingUp className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Trend Analysis</span>
            </a>
            <a
              href="/research/competitors"
              className="flex flex-col items-center p-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 group"
            >
              <Users className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Competitor Analysis</span>
            </a>
            <a
              href="/research/insights"
              className="flex flex-col items-center p-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 group"
            >
              <Lightbulb className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Market Insights</span>
            </a>
            <a
              href="/research/data-mining"
              className="flex flex-col items-center p-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 group"
            >
              <Search className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Data Mining</span>
            </a>
          </div>
        </UltraPremiumCard>

        {/* Recent Insights */}
        <UltraPremiumCard
          title="Recent Insights"
          description="Latest market intelligence and findings"
          variant="glass"
          colSpan={4}
        >
          <div className="space-y-3">
            {recentInsights.map((insight, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-muted/20 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      insight.type === "Opportunity"
                        ? "bg-green-600"
                        : insight.type === "Threat"
                          ? "bg-red-600"
                          : insight.type === "Trend"
                            ? "bg-blue-600"
                            : "bg-purple-600"
                    }`}
                  ></div>
                  <div>
                    <div className="font-medium text-foreground">
                      {insight.title}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-medium">{insight.type}</span>
                      <span>•</span>
                      <span>{insight.confidence} Confidence</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {insight.date}
                </div>
              </div>
            ))}
          </div>
        </UltraPremiumCard>
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
