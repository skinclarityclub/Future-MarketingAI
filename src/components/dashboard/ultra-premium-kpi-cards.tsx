"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  UserCheck,
  Award,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

interface UltraPremiumKPICardProps {
  title: string;
  value: string;
  subValue?: string;
  trend: number;
  isPositive: boolean;
  icon: React.ReactNode;
  chartData?: number[];
  chartType?: "sparkline" | "progress" | "gauge";
  color: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
  className?: string;
}

function UltraPremiumKPICard({
  title,
  value,
  subValue,
  trend,
  isPositive,
  icon,
  chartData = [],
  chartType = "sparkline",
  color,
  className,
}: UltraPremiumKPICardProps) {
  const colorClasses = {
    blue: {
      gradient: "from-blue-500/20 via-blue-600/10 to-blue-700/5",
      border: "border-blue-500/30 hover:border-blue-400/50",
      text: "text-blue-400",
      trend: isPositive ? "text-emerald-400" : "text-red-400",
      glow: "shadow-blue-500/20",
    },
    green: {
      gradient: "from-emerald-500/20 via-emerald-600/10 to-emerald-700/5",
      border: "border-emerald-500/30 hover:border-emerald-400/50",
      text: "text-emerald-400",
      trend: isPositive ? "text-emerald-400" : "text-red-400",
      glow: "shadow-emerald-500/20",
    },
    purple: {
      gradient: "from-purple-500/20 via-purple-600/10 to-purple-700/5",
      border: "border-purple-500/30 hover:border-purple-400/50",
      text: "text-purple-400",
      trend: isPositive ? "text-emerald-400" : "text-red-400",
      glow: "shadow-purple-500/20",
    },
    orange: {
      gradient: "from-orange-500/20 via-orange-600/10 to-orange-700/5",
      border: "border-orange-500/30 hover:border-orange-400/50",
      text: "text-orange-400",
      trend: isPositive ? "text-emerald-400" : "text-red-400",
      glow: "shadow-orange-500/20",
    },
    red: {
      gradient: "from-red-500/20 via-red-600/10 to-red-700/5",
      border: "border-red-500/30 hover:border-red-400/50",
      text: "text-red-400",
      trend: isPositive ? "text-emerald-400" : "text-red-400",
      glow: "shadow-red-500/20",
    },
    indigo: {
      gradient: "from-indigo-500/20 via-indigo-600/10 to-indigo-700/5",
      border: "border-indigo-500/30 hover:border-indigo-400/50",
      text: "text-indigo-400",
      trend: isPositive ? "text-emerald-400" : "text-red-400",
      glow: "shadow-indigo-500/20",
    },
  };

  const currentColorTheme = colorClasses[color];

  const renderMicroChart = () => {
    if (chartType === "sparkline" && chartData.length > 0) {
      const max = Math.max(...chartData);
      const min = Math.min(...chartData);
      const range = max - min;

      return (
        <div className="flex items-end h-8 gap-[1px] mt-2">
          {chartData.map((point, index) => {
            const height = range > 0 ? ((point - min) / range) * 100 : 50;
            return (
              <div
                key={index}
                className={cn(
                  "bg-gradient-to-t rounded-[1px] transition-all duration-300",
                  `from-${color}-400/60 to-${color}-300/80`,
                  "hover:scale-110"
                )}
                style={{
                  height: `${Math.max(height, 10)}%`,
                  width: `${100 / chartData.length - 1}%`,
                }}
              />
            );
          })}
        </div>
      );
    }

    if (chartType === "progress") {
      const progressValue = Math.abs(trend);
      return (
        <div className="mt-2">
          <div className="w-full bg-neutral-800/50 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-500 bg-gradient-to-r",
                isPositive
                  ? "from-emerald-400 to-emerald-500"
                  : "from-red-400 to-red-500"
              )}
              style={{ width: `${Math.min(progressValue * 5, 100)}%` }}
            />
          </div>
        </div>
      );
    }

    if (chartType === "gauge") {
      const rotation = (Math.abs(trend) / 100) * 180;
      return (
        <div className="mt-2 flex justify-center">
          <div className="relative w-12 h-6 overflow-hidden">
            <div
              className={cn(
                "absolute inset-0 rounded-full border-4 border-t-transparent transition-transform duration-700",
                isPositive ? "border-emerald-400" : "border-red-400"
              )}
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        // Glass morphism base
        "relative backdrop-blur-xl border rounded-2xl p-6",
        "bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02]",
        "shadow-2xl shadow-black/20",

        // Color-specific styling
        currentColorTheme.border,
        currentColorTheme.gradient,

        // Hover effects
        "hover:scale-[1.02] hover:shadow-3xl transition-all duration-300 ease-out",
        `hover:${currentColorTheme.glow}`,

        // Animations
        "group cursor-pointer",

        className
      )}
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header with icon and trend */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "p-2 rounded-xl bg-gradient-to-r",
            currentColorTheme.gradient
          )}
        >
          <div className={currentColorTheme.text}>{icon}</div>
        </div>

        <div className="flex items-center gap-1">
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          )}
          <span className={cn("text-sm font-bold", currentColorTheme.trend)}>
            {isPositive ? "+" : ""}
            {trend}%
          </span>
        </div>
      </div>

      {/* Main value */}
      <div className="mb-2">
        <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
          {value}
        </h3>
        {subValue && (
          <p className="text-sm text-neutral-400 font-medium">{subValue}</p>
        )}
      </div>

      {/* Title */}
      <p className="text-sm text-neutral-300 font-medium mb-2">{title}</p>

      {/* Micro chart */}
      {renderMicroChart()}

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/3 to-transparent rounded-2xl" />
    </div>
  );
}

export function UltraPremiumKPICards() {
  const { t } = useLocale();

  const primaryMetrics = [
    {
      title: t("dashboard.totalRevenue") || "Total Revenue",
      value: "€3.2M",
      subValue: "Monthly target: €2.8M",
      trend: 18,
      isPositive: true,
      icon: <DollarSign className="w-5 h-5" />,
      chartData: [45, 52, 48, 61, 55, 67, 73, 69, 75, 82, 79, 88],
      chartType: "sparkline" as const,
      color: "blue" as const,
    },
    {
      title:
        t("dashboard.monthlyRecurringRevenue") || "Monthly Recurring Revenue",
      value: "€847K",
      subValue: "Subscription growth",
      trend: 23,
      isPositive: true,
      icon: <Activity className="w-5 h-5" />,
      chartData: [30, 35, 38, 42, 45, 48, 52, 55, 58, 62, 65, 69],
      chartType: "progress" as const,
      color: "green" as const,
    },
    {
      title: t("dashboard.customerLifetimeValue") || "Customer Lifetime Value",
      value: "€1,680",
      subValue: "Cohort analysis",
      trend: 15,
      isPositive: true,
      icon: <Users className="w-5 h-5" />,
      chartData: [68, 72, 70, 75, 73, 78, 82, 80, 85, 87, 84, 89],
      chartType: "sparkline" as const,
      color: "purple" as const,
    },
    {
      title:
        t("dashboard.customerAcquisitionCost") || "Customer Acquisition Cost",
      value: "€127",
      subValue: "Efficiency improvement",
      trend: -8,
      isPositive: true, // Negative is good for CAC
      icon: <Target className="w-5 h-5" />,
      chartData: [85, 82, 78, 75, 72, 69, 66, 63, 61, 58, 55, 52],
      chartType: "gauge" as const,
      color: "orange" as const,
    },
  ];

  const performanceMetrics = [
    {
      title: t("dashboard.conversionRate") || "Conversion Rate",
      value: "12.4%",
      subValue: "Funnel optimization",
      trend: 2.3,
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5" />,
      chartData: [8.5, 9.1, 9.8, 10.2, 10.8, 11.2, 11.6, 11.9, 12.1, 12.4],
      chartType: "sparkline" as const,
      color: "green" as const,
    },
    {
      title: t("dashboard.churnRate") || "Churn Rate",
      value: "2.1%",
      subValue: "Risk mitigation",
      trend: -0.8,
      isPositive: true, // Negative is good for churn
      icon: <TrendingDown className="w-5 h-5" />,
      chartData: [4.2, 3.8, 3.5, 3.2, 2.9, 2.6, 2.4, 2.2, 2.1],
      chartType: "progress" as const,
      color: "red" as const,
    },
    {
      title: t("dashboard.netPromoterScore") || "Net Promoter Score",
      value: "67",
      subValue: "Customer satisfaction",
      trend: 12,
      isPositive: true,
      icon: <Award className="w-5 h-5" />,
      chartData: [45, 48, 52, 55, 58, 61, 63, 65, 67],
      chartType: "gauge" as const,
      color: "indigo" as const,
    },
    {
      title: t("dashboard.monthlyActiveUsers") || "Monthly Active Users",
      value: "24.7K",
      subValue: "Engagement tracking",
      trend: 31,
      isPositive: true,
      icon: <UserCheck className="w-5 h-5" />,
      chartData: [15.2, 16.1, 17.3, 18.5, 19.8, 21.2, 22.4, 23.6, 24.7],
      chartType: "sparkline" as const,
      color: "purple" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Primary Metrics Row */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
          Executive KPI Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {primaryMetrics.map((metric, index) => (
            <UltraPremiumKPICard key={`primary-${index}`} {...metric} />
          ))}
        </div>
      </div>

      {/* Performance Metrics Row */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
          Performance Intelligence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric, index) => (
            <UltraPremiumKPICard key={`performance-${index}`} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
}
