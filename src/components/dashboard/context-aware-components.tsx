"use client";

import React, { useMemo, ReactNode, ComponentType } from "react";
import { cn } from "@/lib/utils";
import {
  useDashboardMode,
  useModeConfig,
  useComponentAdaptation,
  useModeTransition,
  type DashboardMode,
} from "@/lib/contexts/dashboard-mode-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Briefcase,
  Building2,
} from "lucide-react";

// Context-Aware KPI Card Component
interface ContextAwareKPICardProps {
  componentId?: string;
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  period?: string;
  className?: string;
  icon?: ComponentType<any>;
  children?: ReactNode;
}

export function ContextAwareKPICard({
  componentId = "kpi-cards",
  title,
  value,
  change,
  trend = "neutral",
  period = "vs last period",
  className,
  icon: Icon,
  children,
}: ContextAwareKPICardProps) {
  const { currentMode } = useDashboardMode();
  const modeConfig = useModeConfig();
  const adaptation = useComponentAdaptation(componentId);
  const { isTransitioning } = useModeTransition();

  // Mode-specific styling and behavior
  const modeStyles = useMemo(() => {
    switch (currentMode) {
      case "finance":
        return {
          cardBg:
            "bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20",
          headerBg: "bg-blue-500/10",
          accentColor: "text-blue-600 dark:text-blue-400",
          borderColor: "border-blue-200/50 dark:border-blue-800/50",
          iconColor: "text-blue-500",
        };
      case "marketing":
        return {
          cardBg:
            "bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/30 dark:to-purple-900/20",
          headerBg: "bg-purple-500/10",
          accentColor: "text-purple-600 dark:text-purple-400",
          borderColor: "border-purple-200/50 dark:border-purple-800/50",
          iconColor: "text-purple-500",
        };
      default: // executive
        return {
          cardBg:
            "bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20",
          headerBg: "bg-emerald-500/10",
          accentColor: "text-emerald-600 dark:text-emerald-400",
          borderColor: "border-emerald-200/50 dark:border-emerald-800/50",
          iconColor: "text-emerald-500",
        };
    }
  }, [currentMode]);

  // Dynamic content based on mode configuration
  const getAdaptedContent = () => {
    const showTrends =
      adaptation.customProps?.showTrends || currentMode === "executive";
    const showVariance =
      adaptation.customProps?.showVariance || currentMode === "finance";
    const showConversion =
      adaptation.customProps?.showConversion || currentMode === "marketing";

    return {
      showTrends,
      showVariance,
      showConversion,
      variant: adaptation.variant,
    };
  };

  const adaptedContent = getAdaptedContent();

  if (!adaptation.visibility) {
    return null;
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-in-out",
        modeStyles.cardBg,
        modeStyles.borderColor,
        "hover:shadow-lg hover:scale-[1.02]",
        "border backdrop-blur-sm",
        isTransitioning && "opacity-50 scale-95",
        className
      )}
    >
      <CardHeader className={cn("pb-2", modeStyles.headerBg, "rounded-t-lg")}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && <Icon className={cn("h-4 w-4", modeStyles.iconColor)} />}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className={cn("text-2xl font-bold", modeStyles.accentColor)}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {change !== undefined && adaptedContent.showTrends && (
              <div className="flex items-center gap-1">
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : trend === "down" ? (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                ) : (
                  <Activity className="h-3 w-3 text-gray-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend === "up" && "text-green-600 dark:text-green-400",
                    trend === "down" && "text-red-600 dark:text-red-400",
                    trend === "neutral" && "text-gray-600 dark:text-gray-400"
                  )}
                >
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
              </div>
            )}
          </div>

          {/* Mode-specific additional information */}
          {adaptedContent.showVariance && currentMode === "finance" && (
            <div className="text-xs text-muted-foreground">
              Budget variance:{" "}
              {change !== undefined
                ? `${change > 0 ? "+" : ""}${change}%`
                : "N/A"}
            </div>
          )}

          {adaptedContent.showConversion && currentMode === "marketing" && (
            <div className="text-xs text-muted-foreground">
              Conversion impact:{" "}
              {change !== undefined
                ? `${Math.abs(change * 0.8).toFixed(1)}% CVR`
                : "N/A"}
            </div>
          )}

          <p className="text-xs text-muted-foreground">{period}</p>

          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// Context-Aware Chart Widget Component
interface ContextAwareChartWidgetProps {
  componentId?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  chartType?: "line" | "bar" | "area" | "combo";
}

export function ContextAwareChartWidget({
  componentId = "chart-widgets",
  title,
  subtitle,
  children,
  actions,
  className,
  chartType,
}: ContextAwareChartWidgetProps) {
  const { currentMode } = useDashboardMode();
  const modeConfig = useModeConfig();
  const adaptation = useComponentAdaptation(componentId);
  const { isTransitioning } = useModeTransition();

  // Use mode-specific chart preferences
  const preferredChartType =
    chartType || modeConfig.componentPreferences.chartType;
  const timeframe = adaptation.customProps?.timeframe || "month";

  // Mode-specific styling
  const modeStyles = useMemo(() => {
    const baseClasses = "transition-all duration-500 ease-in-out";

    switch (currentMode) {
      case "finance":
        return cn(
          baseClasses,
          "bg-gradient-to-br from-blue-50/30 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10",
          "border-blue-200/30 dark:border-blue-800/30"
        );
      case "marketing":
        return cn(
          baseClasses,
          "bg-gradient-to-br from-purple-50/30 to-purple-100/20 dark:from-purple-950/20 dark:to-purple-900/10",
          "border-purple-200/30 dark:border-purple-800/30"
        );
      default:
        return cn(
          baseClasses,
          "bg-gradient-to-br from-emerald-50/30 to-emerald-100/20 dark:from-emerald-950/20 dark:to-emerald-900/10",
          "border-emerald-200/30 dark:border-emerald-800/30"
        );
    }
  }, [currentMode]);

  if (!adaptation.visibility) {
    return null;
  }

  return (
    <Card
      className={cn(
        modeStyles,
        "border backdrop-blur-sm hover:shadow-lg",
        isTransitioning && "opacity-50 scale-95",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {preferredChartType}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {timeframe}
            </Badge>
            {actions}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mode-specific chart configuration indicator */}
          {adaptation.variant === "detailed" && (
            <div className="text-xs text-muted-foreground border-l-2 pl-2 border-current/20">
              Configured for {modeConfig.label} • Refresh:{" "}
              {modeConfig.componentPreferences.dataRefreshInterval / 1000}s
            </div>
          )}
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// Context-Aware Data Table Component
interface ContextAwareDataTableProps {
  componentId?: string;
  title: string;
  data: any[];
  columns: string[];
  className?: string;
  onExport?: () => void;
}

export function ContextAwareDataTable({
  componentId = "data-tables",
  title,
  data,
  columns,
  className,
  onExport,
}: ContextAwareDataTableProps) {
  const { currentMode } = useDashboardMode();
  const modeConfig = useModeConfig();
  const adaptation = useComponentAdaptation(componentId);
  const { isTransitioning } = useModeTransition();

  const isExportable = adaptation.customProps?.exportable || false;
  const isFilterable = adaptation.customProps?.filterable || false;
  const maxRows = modeConfig.componentPreferences.maxVisibleItems;

  if (!adaptation.visibility) {
    return null;
  }

  const displayData = data.slice(0, maxRows);

  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-in-out",
        "border backdrop-blur-sm",
        isTransitioning && "opacity-50 scale-95",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {adaptation.variant}
            </Badge>
            {isExportable && (
              <NormalButton size="sm" variant="outline" onClick={onExport}>
                Export
              </NormalButton>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isFilterable && (
            <div className="text-xs text-muted-foreground">
              Filtering enabled for {modeConfig.label} mode
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columns.map((column, index) => (
                    <th key={index} className="text-left p-2 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="p-2">
                        {row[column] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length > maxRows && (
            <p className="text-xs text-muted-foreground text-center">
              Showing {maxRows} of {data.length} rows (limited by{" "}
              {modeConfig.label} mode)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Context-Aware Analytics Panel Component
interface ContextAwareAnalyticsPanelProps {
  componentId?: string;
  className?: string;
  children?: ReactNode;
}

export function ContextAwareAnalyticsPanel({
  componentId = "analytics-panel",
  className,
  children,
}: ContextAwareAnalyticsPanelProps) {
  const { currentMode } = useDashboardMode();
  const modeConfig = useModeConfig();
  const adaptation = useComponentAdaptation(componentId);
  const { isTransitioning } = useModeTransition();

  const focus = adaptation.customProps?.focus || "general";

  if (!adaptation.visibility) {
    return null;
  }

  // Mode-specific panel configuration
  const panelConfig = useMemo(() => {
    switch (currentMode) {
      case "finance":
        return {
          title: "Financial Analytics",
          subtitle: "Performance indicators and financial health metrics",
          icon: Building2,
          focusArea: "Financial performance analysis",
          bgGradient: "from-blue-500/10 to-blue-600/5",
        };
      case "marketing":
        return {
          title: "Marketing Insights",
          subtitle: "Campaign performance and audience engagement metrics",
          icon: Target,
          focusArea: "Marketing engagement analysis",
          bgGradient: "from-purple-500/10 to-purple-600/5",
        };
      default:
        return {
          title: "Strategic Overview",
          subtitle: "Executive-level insights and key performance indicators",
          icon: Briefcase,
          focusArea: "Strategic growth analysis",
          bgGradient: "from-emerald-500/10 to-emerald-600/5",
        };
    }
  }, [currentMode]);

  const IconComponent = panelConfig.icon;

  return (
    <Card
      className={cn(
        "transition-all duration-500 ease-in-out",
        `bg-gradient-to-br ${panelConfig.bgGradient}`,
        "border backdrop-blur-sm",
        isTransitioning && "opacity-50 scale-95",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 dark:bg-black/10">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              {panelConfig.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {panelConfig.subtitle}
            </p>
          </div>
          <div className="ml-auto">
            <Badge variant="outline" className="text-xs">
              {adaptation.variant}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground border-l-2 pl-2 border-current/20">
            Focus: {panelConfig.focusArea} • Mode: {modeConfig.label}
          </div>

          {children || (
            <div className="text-center py-8 text-muted-foreground">
              Analytics content for {modeConfig.label} mode
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// HOC for making any component context-aware
export function withContextAwareness<P extends object>(
  Component: ComponentType<P>,
  componentId: string
) {
  return function ContextAwareComponent(props: P) {
    const adaptation = useComponentAdaptation(componentId);
    const { isTransitioning } = useModeTransition();

    if (!adaptation.visibility) {
      return null;
    }

    return (
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isTransitioning && "opacity-50 scale-95"
        )}
        style={{
          order: adaptation.priority,
          ...adaptation.customProps,
        }}
      >
        <Component {...props} {...adaptation.customProps} />
      </div>
    );
  };
}

// Context-aware layout wrapper
interface ContextAwareLayoutProps {
  children: ReactNode;
  className?: string;
}

export function ContextAwareLayout({
  children,
  className,
}: ContextAwareLayoutProps) {
  const modeConfig = useModeConfig();
  const { isTransitioning } = useModeTransition();

  const layout = modeConfig.componentPreferences.preferredLayout;

  const layoutClasses = useMemo(() => {
    switch (layout) {
      case "list":
        return "space-y-4";
      case "cards":
        return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6";
      default: // grid
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    }
  }, [layout]);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-in-out",
        layoutClasses,
        isTransitioning && "opacity-75",
        className
      )}
    >
      {children}
    </div>
  );
}
