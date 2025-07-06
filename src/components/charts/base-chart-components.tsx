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
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Chart color palette
export const CHART_COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  accent: "#F59E0B",
  danger: "#EF4444",
  warning: "#F97316",
  info: "#06B6D4",
  success: "#22C55E",
  muted: "#6B7280",
} as const;

export const CHART_COLOR_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.accent,
  CHART_COLORS.danger,
  CHART_COLORS.warning,
  CHART_COLORS.info,
  CHART_COLORS.success,
  CHART_COLORS.muted,
];

// Common chart props
interface BaseChartProps {
  data: any[];
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

// Loading component for charts
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="w-full h-64" />
    </div>
  );
}

// Error component for charts
export function ChartError({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <div className="text-center">
        <div className="text-red-500 font-medium">Error loading chart</div>
        <div className="text-sm mt-1">{error}</div>
      </div>
    </div>
  );
}

// Chart wrapper component
interface ChartWrapperProps {
  data?: any[];
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
  height?: number;
  className?: string;
  children: React.ReactElement;
}

export function ChartWrapper({
  title,
  description,
  loading,
  error,
  height = 300,
  className,
  children,
}: ChartWrapperProps) {
  if (loading) return <ChartSkeleton height={height} />;
  if (error) return <ChartError error={error} />;

  const content = (
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  );

  if (title || description) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
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

// Line Chart Component
interface LineChartProps extends BaseChartProps {
  xDataKey: string;
  lines: {
    dataKey: string;
    name: string;
    color?: string;
    strokeWidth?: number;
  }[];
}

export function RevenueLineChart({
  data,
  title,
  description,
  loading,
  error,
  height = 300,
  className,
  xDataKey,
  lines,
  showLegend = true,
  showGrid = true,
}: LineChartProps) {
  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      error={error}
      height={height}
      className={className}
    >
      <LineChart data={data}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        )}
        <XAxis
          dataKey={xDataKey}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        />
        {showLegend && <Legend />}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={
              line.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
            }
            strokeWidth={line.strokeWidth || 2}
            dot={{
              fill:
                line.color ||
                CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length],
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ChartWrapper>
  );
}

// Area Chart Component
interface AreaChartProps extends BaseChartProps {
  xDataKey: string;
  areas: {
    dataKey: string;
    name: string;
    color?: string;
    fillOpacity?: number;
  }[];
}

export function RevenueAreaChart({
  data,
  title,
  description,
  loading,
  error,
  height = 300,
  className,
  xDataKey,
  areas,
  showLegend = true,
  showGrid = true,
}: AreaChartProps) {
  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      error={error}
      height={height}
      className={className}
    >
      <AreaChart data={data}>
        <defs>
          {areas.map((area, index) => (
            <linearGradient
              key={area.dataKey}
              id={`gradient-${area.dataKey}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={
                  area.color ||
                  CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
                }
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={
                  area.color ||
                  CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
                }
                stopOpacity={0.1}
              />
            </linearGradient>
          ))}
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        )}
        <XAxis
          dataKey={xDataKey}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        />
        {showLegend && <Legend />}
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={
              area.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
            }
            strokeWidth={2}
            fillOpacity={area.fillOpacity || 1}
            fill={`url(#gradient-${area.dataKey})`}
          />
        ))}
      </AreaChart>
    </ChartWrapper>
  );
}

// Bar Chart Component
interface BarChartProps extends BaseChartProps {
  xDataKey: string;
  bars: {
    dataKey: string;
    name: string;
    color?: string;
  }[];
}

export function RevenueBarChart({
  data,
  title,
  description,
  loading,
  error,
  height = 300,
  className,
  xDataKey,
  bars,
  showLegend = true,
  showGrid = true,
}: BarChartProps) {
  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      error={error}
      height={height}
      className={className}
    >
      <BarChart data={data}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        )}
        <XAxis
          dataKey={xDataKey}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        />
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={
              bar.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
            }
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartWrapper>
  );
}

// Pie Chart Component
interface PieChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function RevenuePieChart({
  data,
  title,
  description,
  loading,
  error,
  height = 300,
  className,
  dataKey,
  nameKey,
  showLabels = true,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 100,
}: PieChartProps) {
  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      error={error}
      height={height}
      className={className}
    >
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={
            showLabels
              ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`
              : false
          }
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey={dataKey}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        />
        {showLegend && <Legend />}
      </PieChart>
    </ChartWrapper>
  );
}

// KPI Card with trend indicator
interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  icon,
  loading,
  className,
}: KPICardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p
                className={cn(
                  "text-xs flex items-center gap-1",
                  change.trend === "up"
                    ? "text-green-600"
                    : change.trend === "down"
                      ? "text-red-600"
                      : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "inline-block",
                    change.trend === "up"
                      ? "text-green-500"
                      : change.trend === "down"
                        ? "text-red-500"
                        : ""
                  )}
                >
                  {change.trend === "up"
                    ? "↗"
                    : change.trend === "down"
                      ? "↘"
                      : "→"}
                </span>
                {change.value > 0 ? "+" : ""}
                {change.value}% {change.label}
              </p>
            )}
          </div>
          {icon && <div className="p-2 bg-primary/10 rounded-full">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
