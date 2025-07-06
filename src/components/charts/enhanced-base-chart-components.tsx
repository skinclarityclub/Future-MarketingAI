"use client";

import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SmartLoadingWrapper,
  EnhancedChartSkeleton,
  type LoadingStateConfig,
} from "./enhanced-loading-states";

// Enhanced chart color palette with consistent branding
export const ENHANCED_CHART_COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  accent: "#F59E0B",
  danger: "#EF4444",
  warning: "#F97316",
  info: "#06B6D4",
  success: "#22C55E",
  muted: "#6B7280",
  purple: "#8B5CF6",
  pink: "#EC4899",
  indigo: "#6366F1",
  emerald: "#059669",
} as const;

export const CHART_COLOR_ARRAY = Object.values(ENHANCED_CHART_COLORS);

// Enhanced chart props with loading states
interface EnhancedBaseChartProps {
  data: any[];
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  loadingConfig?: LoadingStateConfig;
  retryFn?: () => void;
  animated?: boolean;
  responsive?: boolean;
}

// Enhanced custom tooltip component
export function EnhancedTooltip({
  active,
  payload,
  label,
  formatValue,
  currency = "EUR",
}: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {entry.name}:
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatValue ? formatValue(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// Enhanced KPI Card with improved animations and states
interface EnhancedKPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  className?: string;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export function EnhancedKPICard({
  title,
  value,
  change,
  icon,
  loading = false,
  error,
  className,
  animated = true,
  size = "md",
}: EnhancedKPICardProps) {
  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const valueClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  if (error) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className={sizeClasses[size]}>
          <div className="text-center text-red-600">
            <div className="text-sm font-medium">Error</div>
            <div className="text-xs mt-1">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        animated && "hover:scale-[1.02]",
        className
      )}
    >
      <CardContent className={sizeClasses[size]}>
        <SmartLoadingWrapper
          loading={loading}
          loadingConfig={{ type: "skeleton", variant: "kpi", height: 80 }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              {icon && <div className="flex-shrink-0">{icon}</div>}
            </div>

            <div className={cn("font-bold", valueClasses[size])}>{value}</div>

            {change && (
              <div className="flex items-center gap-1 text-sm">
                {change.trend === "up" && (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
                {change.trend === "down" && (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                {change.trend === "neutral" && (
                  <Minus className="h-4 w-4 text-gray-600" />
                )}

                <span
                  className={cn(
                    "font-medium",
                    change.trend === "up" && "text-green-600",
                    change.trend === "down" && "text-red-600",
                    change.trend === "neutral" && "text-gray-600"
                  )}
                >
                  {change.value > 0 ? "+" : ""}
                  {change.value}%
                </span>

                <span className="text-muted-foreground">{change.label}</span>
              </div>
            )}
          </div>
        </SmartLoadingWrapper>
      </CardContent>
    </Card>
  );
}

// Enhanced Line Chart
interface EnhancedLineChartProps extends EnhancedBaseChartProps {
  xDataKey: string;
  lines: {
    dataKey: string;
    name: string;
    color?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    dot?: boolean;
  }[];
}

export function EnhancedLineChart({
  data,
  title,
  description,
  loading = false,
  error,
  height = 300,
  className,
  xDataKey,
  lines,
  showLegend = true,
  showGrid = true,
  loadingConfig,
  retryFn,
  animated = true,
  responsive = true,
}: EnhancedLineChartProps) {
  const content = (
    <SmartLoadingWrapper
      loading={loading}
      error={error}
      data={data}
      loadingConfig={
        loadingConfig || { type: "skeleton", variant: "chart", height }
      }
      retryFn={retryFn}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="opacity-30"
              stroke="hsl(var(--border))"
            />
          )}
          <XAxis
            dataKey={xDataKey}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip content={<EnhancedTooltip />} />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={
                line.color ||
                CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
              }
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray}
              dot={line.dot !== false ? { r: 4 } : false}
              activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
              animationDuration={animated ? 1000 : 0}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </SmartLoadingWrapper>
  );

  if (title || description) {
    return (
      <Card className={cn("dashboard-card", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              )}
              {description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {description}
                </div>
              )}
            </div>
            {data && data.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {data.length} points
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}

// Enhanced Area Chart
interface EnhancedAreaChartProps extends EnhancedBaseChartProps {
  xDataKey: string;
  areas: {
    dataKey: string;
    name: string;
    color?: string;
    fillOpacity?: number;
    stackId?: string;
  }[];
}

export function EnhancedAreaChart({
  data,
  title,
  description,
  loading = false,
  error,
  height = 300,
  className,
  xDataKey,
  areas,
  showLegend = true,
  showGrid = true,
  loadingConfig,
  retryFn,
  animated = true,
}: EnhancedAreaChartProps) {
  const content = (
    <SmartLoadingWrapper
      loading={loading}
      error={error}
      data={data}
      loadingConfig={
        loadingConfig || { type: "skeleton", variant: "chart", height }
      }
      retryFn={retryFn}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="opacity-30"
              stroke="hsl(var(--border))"
            />
          )}
          <XAxis
            dataKey={xDataKey}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip content={<EnhancedTooltip />} />
          {showLegend && <Legend />}
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stackId={area.stackId}
              stroke={
                area.color ||
                CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
              }
              fill={
                area.color ||
                CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
              }
              fillOpacity={area.fillOpacity || 0.6}
              animationDuration={animated ? 1000 : 0}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </SmartLoadingWrapper>
  );

  if (title || description) {
    return (
      <Card className={cn("dashboard-card", className)}>
        <CardHeader>
          {title && (
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          )}
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}

// Enhanced Bar Chart
interface EnhancedBarChartProps extends EnhancedBaseChartProps {
  xDataKey: string;
  bars: {
    dataKey: string;
    name: string;
    color?: string;
    stackId?: string;
  }[];
  layout?: "vertical" | "horizontal";
}

export function EnhancedBarChart({
  data,
  title,
  description,
  loading = false,
  error,
  height = 300,
  className,
  xDataKey,
  bars,
  layout = "horizontal",
  showLegend = true,
  showGrid = true,
  loadingConfig,
  retryFn,
  animated = true,
}: EnhancedBarChartProps) {
  const content = (
    <SmartLoadingWrapper
      loading={loading}
      error={error}
      data={data}
      loadingConfig={
        loadingConfig || { type: "skeleton", variant: "chart", height }
      }
      retryFn={retryFn}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="opacity-30"
              stroke="hsl(var(--border))"
            />
          )}
          <XAxis
            dataKey={xDataKey}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip content={<EnhancedTooltip />} />
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              stackId={bar.stackId}
              fill={
                bar.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
              }
              radius={[4, 4, 0, 0]}
              animationDuration={animated ? 1000 : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </SmartLoadingWrapper>
  );

  if (title || description) {
    return (
      <Card className={cn("dashboard-card", className)}>
        <CardHeader>
          {title && (
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          )}
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}

// Export enhanced components
export {
  EnhancedChartSkeleton,
  SmartLoadingWrapper,
} from "./enhanced-loading-states";
