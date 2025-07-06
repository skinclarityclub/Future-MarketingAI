"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
} from "lucide-react";

// Safe formatting functions to prevent [object Event] errors
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

interface PremiumChartProps {
  data: any[];
  type?: "line" | "area" | "bar";
  title: string;
  metric: string;
  value: string;
  trend: number;
  trendLabel: string;
  priority?: "primary" | "secondary" | "tertiary";
  className?: string;
  animate?: boolean;
  interactive?: boolean;
}

const PremiumChart: React.FC<PremiumChartProps> = ({
  data,
  type = "area",
  title,
  metric,
  value,
  trend,
  trendLabel,
  priority = "secondary",
  className = "",
  animate = true,
  interactive = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for smooth entrance animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Staggered animation phases
          setTimeout(() => setAnimationPhase(1), 200);
          setTimeout(() => setAnimationPhase(2), 400);
          setTimeout(() => setAnimationPhase(3), 600);
        }
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Priority-based styling
  const getPriorityStyles = () => {
    switch (priority) {
      case "primary":
        return {
          container:
            "glass-luxury shadow-glow-primary border-2 border-primary-400/30",
          header: "text-primary-400",
          value: "text-display text-primary-400",
          chart: "stroke-primary-400 fill-primary-400",
          glow: "animate-pulse-glow",
          gradient: "from-primary-400/20 to-primary-600/5",
        };
      case "secondary":
        return {
          container:
            "glass-secondary shadow-elevated border border-neutral-600/30",
          header: "text-neutral-200",
          value: "text-h1 text-neutral-100",
          chart: "stroke-success-400 fill-success-400",
          glow: "hover-glow",
          gradient: "from-success-400/15 to-success-600/5",
        };
      case "tertiary":
        return {
          container: "glass-secondary shadow-soft border border-neutral-700/30",
          header: "text-neutral-300",
          value: "text-h2 text-neutral-200",
          chart: "stroke-warning-400 fill-warning-400",
          glow: "hover-micro",
          gradient: "from-warning-400/10 to-warning-600/5",
        };
    }
  };

  const styles = getPriorityStyles();

  // Chart type icon selection
  const getChartIcon = () => {
    switch (type) {
      case "line":
        return <LineChartIcon className="w-5 h-5" />;
      case "area":
        return <AreaChartIcon className="w-5 h-5" />;
      case "bar":
        return <BarChart3 className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  // Trend indicator with micro-animations
  const TrendIndicator = () => (
    <div
      className={`flex items-center gap-2 transition-all duration-fast ease-premium ${
        isHovered ? "scale-105" : ""
      }`}
    >
      {trend > 0 ? (
        <TrendingUp className="w-4 h-4 text-success-400 animate-micro-bounce" />
      ) : (
        <TrendingDown className="w-4 h-4 text-error-400 animate-micro-bounce" />
      )}
      <span
        className={`text-sm font-medium ${
          trend > 0 ? "text-success-400" : "text-error-400"
        }`}
      >
        {Math.abs(trend)}% {trendLabel}
      </span>
    </div>
  );

  // Custom tooltip with glass morphism
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-luxury rounded-premium p-4 shadow-enterprise animate-premium-fade-in-scale">
          <p className="text-neutral-200 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render appropriate chart type
  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <defs>
              <linearGradient
                id={`lineGradient-${priority}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.8} />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={3}
              dot={{ fill: "currentColor", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "currentColor", strokeWidth: 2 }}
              className={styles.chart}
              animationDuration={animate ? 1500 : 0}
              animationEasing="ease-in-out"
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient
                id={`areaGradient-${priority}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={2}
              fill={`url(#areaGradient-${priority})`}
              className={styles.chart}
              animationDuration={animate ? 1500 : 0}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="currentColor"
              className={styles.chart}
              radius={[4, 4, 0, 0]}
              animationDuration={animate ? 1500 : 0}
              animationEasing="ease-in-out"
            />
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={chartRef}
      className={`
        ${styles.container} 
        ${styles.glow}
        rounded-luxury p-6 transition-all duration-slow ease-luxury
        ${isVisible ? "animate-premium-fade-in" : "opacity-0 translate-y-8"}
        ${isHovered ? "transform scale-102 shadow-glow-primary" : ""}
        ${interactive ? "cursor-pointer" : ""}
        ${className}
      `}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Header Section with Staggered Animation */}
      <div
        className={`mb-6 ${animationPhase >= 1 ? "stagger-fade-primary" : "opacity-0"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-premium glass-secondary ${styles.header}`}
            >
              {getChartIcon()}
            </div>
            <h3 className={`font-semibold ${styles.header}`}>{title}</h3>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium glass-secondary ${styles.header}`}
          >
            {metric}
          </div>
        </div>

        {/* Value and Trend with Micro-animations */}
        <div className="flex items-end justify-between">
          <div
            className={`${animationPhase >= 2 ? "stagger-fade-secondary" : "opacity-0"}`}
          >
            <div className={`font-bold ${styles.value} mb-1`}>{value}</div>
            <TrendIndicator />
          </div>
        </div>
      </div>

      {/* Chart Section with Entrance Animation */}
      <div
        className={`
        h-64 transition-all duration-enterprise ease-luxury
        ${animationPhase >= 3 ? "stagger-fade-tertiary" : "opacity-0 scale-95"}
        ${isHovered ? "scale-102" : ""}
      `}
      >
        <ResponsiveContainer width="100%" height="100%">
          <div className={styles.chart}>{renderChart()}</div>
        </ResponsiveContainer>
      </div>

      {/* Interactive Overlay for Premium Feel */}
      {interactive && (
        <div
          className={`
          absolute inset-0 rounded-luxury pointer-events-none
          ${isHovered ? "bg-gradient-to-br opacity-5" : "opacity-0"}
          ${styles.gradient}
          transition-opacity duration-normal ease-premium
        `}
        />
      )}

      {/* Status Indicator */}
      <div
        className={`
        absolute top-4 right-4 w-2 h-2 rounded-full
        ${trend > 0 ? "bg-success-400 animate-success-pulse" : "bg-error-400 animate-pulse-glow"}
      `}
      />
    </div>
  );
};

export default PremiumChart;
