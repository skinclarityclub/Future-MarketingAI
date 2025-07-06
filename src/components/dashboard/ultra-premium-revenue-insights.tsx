"use client";

import React from "react";
import {
  UltraPremiumCard,
  UltraPremiumGrid,
} from "@/components/layout/ultra-premium-dashboard-layout";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  BarChart3,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  sparklineData?: number[];
  color: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
}

function MetricCard({
  title,
  value,
  change,
  changeType,
  icon,
  sparklineData,
  color,
}: MetricCardProps) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20",
    green:
      "from-green-500/20 to-green-600/20 border-green-500/30 bg-green-50/50 dark:bg-green-950/20",
    purple:
      "from-purple-500/20 to-purple-600/20 border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20",
    orange:
      "from-orange-500/20 to-orange-600/20 border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20",
    red: "from-red-500/20 to-red-600/20 border-red-500/30 bg-red-50/50 dark:bg-red-950/20",
    indigo:
      "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20",
  };

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600",
    indigo: "text-indigo-600",
  };

  const changeColor =
    changeType === "positive"
      ? "text-green-600"
      : changeType === "negative"
        ? "text-red-600"
        : "text-gray-600";

  return (
    <div
      className={`
      relative p-6 rounded-2xl backdrop-blur-xl border-2 bg-gradient-to-br
      ${colorClasses[color]}
      hover:scale-[1.02] transition-all duration-300
      shadow-xl hover:shadow-2xl group cursor-pointer
    `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm ${iconColors[color]}`}
          >
            {icon}
          </div>
          {changeType !== "neutral" && (
            <div className={`flex items-center gap-1 ${changeColor}`}>
              {changeType === "positive" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">{change}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>

        {/* Sparkline */}
        {sparklineData && (
          <div className="mt-4 h-8 flex items-end justify-between gap-1">
            {sparklineData.map((value, index) => (
              <div
                key={index}
                className={`bg-gradient-to-t ${iconColors[color]} opacity-60 rounded-sm transition-all duration-300 group-hover:opacity-100`}
                style={{
                  height: `${(value / Math.max(...sparklineData)) * 100}%`,
                  width: "4px",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

export function UltraPremiumRevenueInsights() {
  const { t } = useLocale();

  const revenueMetrics = [
    {
      title: t("dashboard.totalRevenue"),
      value: "€3.2M",
      change: "+18%",
      changeType: "positive" as const,
      icon: <DollarSign className="w-5 h-5" />,
      color: "blue" as const,
      sparklineData: [40, 45, 42, 48, 52, 49, 55, 60, 58, 62, 65, 68, 72],
    },
    {
      title: t("dashboard.monthlyRecurringRevenue"),
      value: "€847K",
      change: "+23%",
      changeType: "positive" as const,
      icon: <Target className="w-5 h-5" />,
      color: "green" as const,
      sparklineData: [30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55, 58, 60],
    },
    {
      title: t("dashboard.averageOrderValue"),
      value: "€1,680",
      change: "+15%",
      changeType: "positive" as const,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "purple" as const,
      sparklineData: [25, 28, 30, 32, 35, 33, 36, 39, 41, 43, 45, 47, 50],
    },
    {
      title: t("dashboard.customerAcquisitionCost"),
      value: "€127",
      change: "-8%",
      changeType: "positive" as const,
      icon: <Users className="w-5 h-5" />,
      color: "orange" as const,
      sparklineData: [60, 58, 55, 52, 50, 48, 45, 42, 40, 38, 35, 32, 30],
    },
  ];

  return (
    <UltraPremiumCard
      title={t("dashboard.revenueInsights")}
      description={t("dashboard.revenueInsightsDesc")}
      variant="luxury"
      colSpan={4}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Additional Revenue Breakdown */}
      <div className="mt-8 pt-6 border-t border-border/20">
        <h4 className="text-lg font-semibold mb-4 text-foreground">
          {t("dashboard.revenueBreakdown")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">
                {t("dashboard.subscriptions")}
              </span>
            </div>
            <p className="text-xl font-bold text-blue-600 mt-2">€2.1M (65%)</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 border border-green-200/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">
                {t("dashboard.oneTimePayments")}
              </span>
            </div>
            <p className="text-xl font-bold text-green-600 mt-2">€890K (28%)</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 border border-purple-200/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">
                {t("dashboard.addOns")}
              </span>
            </div>
            <p className="text-xl font-bold text-purple-600 mt-2">€210K (7%)</p>
          </div>
        </div>
      </div>
    </UltraPremiumCard>
  );
}
