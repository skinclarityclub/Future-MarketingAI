"use client";

import React from "react";
import {
  UltraPremiumSection,
  UltraPremiumGrid,
  UltraPremiumCard,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { SmartKPIGrid } from "@/components/dashboard/smart-kpi-grid";
import { useLocale } from "@/lib/i18n/context";
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Activity,
  Target,
} from "lucide-react";

// Streamlined Executive KPI Cards
function ExecutiveKPICards() {
  const kpis = [
    {
      title: "Total Revenue",
      value: "€2.4M",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Customers",
      value: "7,208",
      change: "+8.3%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Growth Rate",
      value: "23.4%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Performance Score",
      value: "94.2",
      change: "-1.2%",
      trend: "down",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  return (
    <UltraPremiumGrid>
      {kpis.map((kpi, index) => {
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
  );
}

// Quick Action Cards
function QuickActionsGrid() {
  const actions = [
    {
      title: "Financial Overview",
      description: "Switch to finance dashboard",
      href: "/financial",
      color: "bg-blue-600 hover:bg-blue-700",
      icon: DollarSign,
    },
    {
      title: "Marketing Insights",
      description: "View marketing analytics",
      href: "/marketing",
      color: "bg-purple-600 hover:bg-purple-700",
      icon: Target,
    },
    {
      title: "Advanced Analytics",
      description: "Deep dive into data",
      href: "/analytics",
      color: "bg-emerald-600 hover:bg-emerald-700",
      icon: BarChart3,
    },
    {
      title: "Generate Report",
      description: "Create executive report",
      href: "/reports",
      color: "bg-orange-600 hover:bg-orange-700",
      icon: Activity,
    },
  ];

  return (
    <UltraPremiumGrid>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <UltraPremiumCard
            key={index}
            title={action.title}
            description={action.description}
            variant="minimal"
            colSpan={1}
          >
            <a
              href={action.href}
              className={`block p-4 rounded-lg text-white transition-all duration-300 ${action.color} group`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </div>
            </a>
          </UltraPremiumCard>
        );
      })}
    </UltraPremiumGrid>
  );
}

// Executive Summary Cards
function ExecutiveSummary() {
  const { t: _t } = useLocale();

  return (
    <UltraPremiumGrid>
      <UltraPremiumCard
        title="Business Highlights"
        description="Key achievements this month"
        variant="glass"
        colSpan={2}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Revenue target exceeded by 12.5%
              </p>
              <p className="text-xs text-muted-foreground">
                Achieved €2.4M vs €2.1M target
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Customer base growth of 8.3%
              </p>
              <p className="text-xs text-muted-foreground">
                1,247 new customers acquired
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Marketing ROI improved by 15%
              </p>
              <p className="text-xs text-muted-foreground">
                Campaign optimization success
              </p>
            </div>
          </div>
        </div>
      </UltraPremiumCard>

      <UltraPremiumCard
        title="Key Metrics Summary"
        description="Critical business indicators"
        variant="glass"
        colSpan={2}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Customer Satisfaction
            </span>
            <span className="text-sm font-medium">4.8/5.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Market Share</span>
            <span className="text-sm font-medium">23.4%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">System Uptime</span>
            <span className="text-sm font-medium text-green-600">99.9%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Team Productivity
            </span>
            <span className="text-sm font-medium">+18%</span>
          </div>
        </div>
      </UltraPremiumCard>
    </UltraPremiumGrid>
  );
}

export function ExecutiveOverview() {
  const { t: _t } = useLocale();

  return (
    <div className="space-y-8">
      {/* Executive KPI Overview */}
      <UltraPremiumSection
        title="Executive Dashboard"
        description="High-level business overview and key performance indicators"
      >
        <ExecutiveKPICards />
      </UltraPremiumSection>

      {/* Quick Access to Department Dashboards */}
      <UltraPremiumSection
        title="Department Dashboards"
        description="Quick access to specialized analytics"
      >
        <QuickActionsGrid />
      </UltraPremiumSection>

      {/* Smart KPI Grid - Intelligent Component */}
      <UltraPremiumSection
        title="Smart KPI Management"
        description="AI-driven intelligent insights with dynamic layouts"
      >
        <SmartKPIGrid
          userRole="executive"
          department="executive"
          autoOptimize={true}
        />
      </UltraPremiumSection>

      {/* Executive Summary */}
      <UltraPremiumSection
        title="Business Summary"
        description="Highlights and key achievements"
      >
        <ExecutiveSummary />
      </UltraPremiumSection>
    </div>
  );
}
