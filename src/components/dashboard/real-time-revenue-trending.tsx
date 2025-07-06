"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  UltraPremiumCard,
  UltraPremiumGrid,
} from "@/components/layout/ultra-premium-dashboard-layout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Activity,
  Zap,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Play,
  Pause,
  Calendar,
  Globe,
  Users,
  ShoppingCart,
  CreditCard,
  Smartphone,
} from "lucide-react";

// Safe formatting functions to prevent [object Event] errors
function formatCurrency(value: unknown): string {
  if (value === null || value === undefined || typeof value === "object") {
    return "€0";
  }
  const numValue =
    typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(numValue)) {
    return "€0";
  }
  return `€${numValue.toLocaleString()}`;
}

function formatNumber(value: unknown): string {
  if (value === null || value === undefined || typeof value === "object") {
    return "0";
  }
  const numValue =
    typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(numValue)) {
    return "0";
  }
  return numValue.toLocaleString();
}

// Real-time data interfaces
interface RealtimeDataPoint {
  timestamp: number;
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
}

interface RevenueStream {
  id: string;
  name: string;
  value: number;
  change: number;
  isPositive: boolean;
  color: string;
  icon: React.ReactNode;
}

interface RealtimeTrend {
  period: string;
  current: number;
  previous: number;
  change: number;
  trend: "up" | "down" | "stable";
}

interface RealTimeRevenueProps {
  className?: string;
  updateInterval?: number;
  maxDataPoints?: number;
  enableLiveStream?: boolean;
}

// Simulated real-time data generator
const generateRealtimeData = (): RealtimeDataPoint => {
  const baseRevenue = 125000;
  const variation = 0.15;
  const trend = Math.sin(Date.now() / 10000000) * 0.1;

  return {
    timestamp: Date.now(),
    revenue: baseRevenue * (1 + trend + (Math.random() - 0.5) * variation),
    orders: Math.floor(Math.random() * 50) + 30,
    customers: Math.floor(Math.random() * 25) + 15,
    avgOrderValue: 150 + Math.random() * 100,
  };
};

// Revenue stream data
const revenueStreams: RevenueStream[] = [
  {
    id: "online",
    name: "Online Sales",
    value: 847520,
    change: 18.5,
    isPositive: true,
    color: "#3B82F6",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: "mobile",
    name: "Mobile App",
    value: 425840,
    change: 24.7,
    isPositive: true,
    color: "#10B981",
    icon: <Smartphone className="w-4 h-4" />,
  },
  {
    id: "retail",
    name: "Retail Stores",
    value: 312670,
    change: -3.2,
    isPositive: false,
    color: "#F59E0B",
    icon: <ShoppingCart className="w-4 h-4" />,
  },
  {
    id: "subscriptions",
    name: "Subscriptions",
    value: 658930,
    change: 31.4,
    isPositive: true,
    color: "#8B5CF6",
    icon: <CreditCard className="w-4 h-4" />,
  },
];

export function RealTimeRevenueTrending({
  className,
  updateInterval = 2000,
  maxDataPoints = 20,
  enableLiveStream = true,
}: RealTimeRevenueProps) {
  // State management
  const [realtimeData, setRealtimeData] = useState<RealtimeDataPoint[]>([]);
  const [isLiveStreaming, setIsLiveStreaming] = useState(enableLiveStream);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<
    "1h" | "24h" | "7d"
  >("1h");

  // Initialize data
  useEffect(() => {
    const initialData: RealtimeDataPoint[] = [];
    const now = Date.now();

    for (let i = maxDataPoints - 1; i >= 0; i--) {
      initialData.push({
        timestamp: now - i * updateInterval,
        revenue:
          125000 *
          (1 +
            Math.sin((now - i * updateInterval) / 10000000) * 0.1 +
            (Math.random() - 0.5) * 0.1),
        orders: Math.floor(Math.random() * 50) + 30,
        customers: Math.floor(Math.random() * 25) + 15,
        avgOrderValue: 150 + Math.random() * 100,
      });
    }

    setRealtimeData(initialData);
    setCurrentRevenue(initialData[initialData.length - 1]?.revenue || 0);
  }, [maxDataPoints, updateInterval]);

  // Real-time data streaming
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const newDataPoint = generateRealtimeData();

      setRealtimeData(prev => {
        const newData = [...prev, newDataPoint];
        if (newData.length > maxDataPoints) {
          newData.shift();
        }

        // Calculate revenue change
        if (prev.length > 0) {
          const previousRevenue = prev[prev.length - 1].revenue;
          const change =
            ((newDataPoint.revenue - previousRevenue) / previousRevenue) * 100;
          setRevenueChange(change);
        }

        setCurrentRevenue(newDataPoint.revenue);
        setLastUpdate(new Date());

        return newData;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isLiveStreaming, updateInterval, maxDataPoints]);

  // Chart data transformation
  const chartData = useMemo(() => {
    return realtimeData.map((point, index) => ({
      name: new Date(point.timestamp).toLocaleTimeString(),
      revenue: Math.round(point.revenue),
      orders: point.orders,
      customers: point.customers,
      aov: Math.round(point.avgOrderValue),
      index,
    }));
  }, [realtimeData]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    if (realtimeData.length < 2) return [];

    const latest = realtimeData[realtimeData.length - 1];
    const previous = realtimeData[realtimeData.length - 2];

    return [
      {
        label: "Revenue/Min",
        value: `€${(latest.revenue / 60).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        change: ((latest.revenue - previous.revenue) / previous.revenue) * 100,
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        label: "Orders/Min",
        value: latest.orders.toString(),
        change: ((latest.orders - previous.orders) / previous.orders) * 100,
        icon: <ShoppingCart className="w-4 h-4" />,
      },
      {
        label: "New Customers",
        value: latest.customers.toString(),
        change:
          ((latest.customers - previous.customers) / previous.customers) * 100,
        icon: <Users className="w-4 h-4" />,
      },
      {
        label: "Avg Order Value",
        value: `€${latest.avgOrderValue.toFixed(0)}`,
        change:
          ((latest.avgOrderValue - previous.avgOrderValue) /
            previous.avgOrderValue) *
          100,
        icon: <Target className="w-4 h-4" />,
      },
    ];
  }, [realtimeData]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-2xl">
          <p className="text-white text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === "revenue" && "€"}
              {formatNumber(entry.value)}
              {entry.dataKey === "aov" && " AOV"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Toggle live streaming
  const toggleLiveStream = useCallback(() => {
    setIsLiveStreaming(prev => !prev);
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Real-Time Header */}
      <UltraPremiumCard
        title="Real-Time Revenue Dashboard"
        description="Live revenue streaming with AI-powered insights"
        variant="luxury"
        colSpan={4}
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <NormalButton
              onClick={toggleLiveStream}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors",
                isLiveStreaming
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              )}
            >
              {isLiveStreaming ? (
                <>
                  <Activity className="w-4 h-4" />
                  Live
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Paused
                </>
              )}
            </NormalButton>
          </div>
        }
      >
        {/* Current Revenue Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-4">
            <h2 className="text-4xl font-bold text-foreground">
              €
              {currentRevenue.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </h2>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
                revenueChange >= 0
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {revenueChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(revenueChange).toFixed(2)}%
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Total revenue this hour • Real-time streaming
          </p>
        </div>

        {/* Real-Time Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickFormatter={value => `€${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "#3B82F6",
                  strokeWidth: 2,
                  fill: "#1E40AF",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </UltraPremiumCard>

      {/* Performance Metrics */}
      <UltraPremiumGrid>
        {performanceMetrics.map((metric, index) => (
          <UltraPremiumCard
            key={index}
            title={metric.label}
            variant="glass"
            colSpan={1}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {metric.value}
                </p>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm",
                    metric.change >= 0 ? "text-green-400" : "text-red-400"
                  )}
                >
                  {metric.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(metric.change).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/10">{metric.icon}</div>
            </div>
          </UltraPremiumCard>
        ))}
      </UltraPremiumGrid>

      {/* Revenue Streams Breakdown */}
      <UltraPremiumCard
        title="Revenue Streams"
        description="Real-time breakdown by channel"
        variant="glass"
        colSpan={4}
      >
        <UltraPremiumGrid>
          {revenueStreams.map(stream => (
            <div
              key={stream.id}
              className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${stream.color}20` }}
                >
                  <div style={{ color: stream.color }}>{stream.icon}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    {stream.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">Live tracking</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(stream.value)}
                </p>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm",
                    stream.isPositive ? "text-green-400" : "text-red-400"
                  )}
                >
                  {stream.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(stream.change)}% today
                </div>
              </div>
            </div>
          ))}
        </UltraPremiumGrid>
      </UltraPremiumCard>

      {/* Real-Time Activity Feed */}
      <UltraPremiumCard
        title="Live Activity Feed"
        description="Real-time transaction monitoring"
        variant="minimal"
        colSpan={4}
      >
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {realtimeData
            .slice(-8)
            .reverse()
            .map((point, index) => (
              <div
                key={point.timestamp}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    €
                    {point.revenue.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    revenue generated
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {point.orders} orders • {point.customers} new customers •{" "}
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">Just now</div>
              </div>
            ))}
        </div>
      </UltraPremiumCard>
    </div>
  );
}
