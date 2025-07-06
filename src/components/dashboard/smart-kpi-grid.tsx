"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import NormalButton from "@/components/ui/normal-button";
import {
  Settings,
  Filter,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Award,
  Activity,
  UserCheck,
  Brain,
  Layout,
  RotateCcw,
  Star,
  Grid3X3,
  List,
  PieChart,
} from "lucide-react";

// Smart KPI interfaces
interface SmartKPIMetric {
  id: string;
  title: string;
  value: string;
  subValue?: string;
  trend: number;
  isPositive: boolean;
  icon: React.ReactNode;
  category: "revenue" | "customers" | "performance" | "growth" | "operations";
  importance: "critical" | "high" | "medium" | "low";
  departmentAccess: string[];
  chartData?: number[];
  predictiveInsight?: string;
  aiRecommendation?: string;
  isVisible: boolean;
  order: number;
  color: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
}

interface GridLayout {
  id: string;
  name: string;
  description: string;
  columns: number;
  rows: number;
  type: "executive" | "analyst" | "department" | "custom";
}

interface SmartKPIGridProps {
  userRole?: "executive" | "analyst" | "manager" | "viewer";
  department?: string;
  className?: string;
  autoOptimize?: boolean;
}

const defaultMetrics: SmartKPIMetric[] = [
  {
    id: "total-revenue",
    title: "Total Revenue",
    value: "€3.2M",
    subValue: "+€570K vs last month",
    trend: 18.5,
    isPositive: true,
    icon: <DollarSign className="w-5 h-5" />,
    category: "revenue",
    importance: "critical",
    departmentAccess: ["executive", "finance", "sales"],
    chartData: [65, 78, 82, 88, 95, 102, 118],
    predictiveInsight: "Projected to reach €3.8M next month",
    aiRecommendation: "Consider expanding marketing budget by 15%",
    isVisible: true,
    order: 1,
    color: "blue",
  },
  {
    id: "mrr",
    title: "Monthly Recurring Revenue",
    value: "€847K",
    subValue: "€195K from new customers",
    trend: 23.2,
    isPositive: true,
    icon: <TrendingUp className="w-5 h-5" />,
    category: "revenue",
    importance: "critical",
    departmentAccess: ["executive", "finance", "sales"],
    chartData: [45, 52, 58, 67, 72, 81, 85],
    predictiveInsight: "Expected to hit €1M by Q4",
    aiRecommendation: "Focus on customer retention programs",
    isVisible: true,
    order: 2,
    color: "green",
  },
  {
    id: "customer-lifetime-value",
    title: "Customer Lifetime Value",
    value: "€1,680",
    subValue: "15% increase this quarter",
    trend: 15.3,
    isPositive: true,
    icon: <Users className="w-5 h-5" />,
    category: "customers",
    importance: "high",
    departmentAccess: ["executive", "sales", "marketing"],
    chartData: [1200, 1350, 1420, 1580, 1650, 1680],
    predictiveInsight: "Trending towards €1,800 by year-end",
    aiRecommendation: "Implement upselling strategies for top segments",
    isVisible: true,
    order: 3,
    color: "purple",
  },
  {
    id: "customer-acquisition-cost",
    title: "Customer Acquisition Cost",
    value: "€127",
    subValue: "€14 reduction this month",
    trend: -8.2,
    isPositive: true,
    icon: <Target className="w-5 h-5" />,
    category: "customers",
    importance: "high",
    departmentAccess: ["executive", "marketing", "sales"],
    chartData: [155, 148, 142, 138, 132, 127],
    predictiveInsight: "Could reach €115 with current optimization",
    aiRecommendation: "Optimize digital channels for better efficiency",
    isVisible: true,
    order: 4,
    color: "orange",
  },
  {
    id: "conversion-rate",
    title: "Conversion Rate",
    value: "12.4%",
    subValue: "+2.3% improvement",
    trend: 2.3,
    isPositive: true,
    icon: <BarChart3 className="w-5 h-5" />,
    category: "performance",
    importance: "high",
    departmentAccess: ["executive", "marketing", "sales"],
    chartData: [8.5, 9.2, 10.1, 11.3, 11.8, 12.4],
    predictiveInsight: "Potential to reach 15% with current trends",
    aiRecommendation: "A/B test new landing page designs",
    isVisible: true,
    order: 5,
    color: "red",
  },
  {
    id: "nps-score",
    title: "Net Promoter Score",
    value: "67",
    subValue: "+12 points this quarter",
    trend: 12,
    isPositive: true,
    icon: <Award className="w-5 h-5" />,
    category: "performance",
    importance: "medium",
    departmentAccess: ["executive", "support", "product"],
    chartData: [45, 52, 58, 61, 64, 67],
    predictiveInsight: "On track for 'World Class' status (70+)",
    aiRecommendation: "Focus on reducing support response times",
    isVisible: true,
    order: 6,
    color: "indigo",
  },
  {
    id: "monthly-active-users",
    title: "Monthly Active Users",
    value: "24.7K",
    subValue: "+7.6K new users",
    trend: 31.2,
    isPositive: true,
    icon: <Activity className="w-5 h-5" />,
    category: "growth",
    importance: "high",
    departmentAccess: ["executive", "product", "marketing"],
    chartData: [15200, 17800, 19500, 22100, 23900, 24700],
    predictiveInsight: "Expected to surpass 30K next month",
    aiRecommendation: "Prepare infrastructure for 50K+ users",
    isVisible: true,
    order: 7,
    color: "green",
  },
  {
    id: "churn-rate",
    title: "Churn Rate",
    value: "2.1%",
    subValue: "-0.8% improvement",
    trend: -0.8,
    isPositive: true,
    icon: <UserCheck className="w-5 h-5" />,
    category: "customers",
    importance: "critical",
    departmentAccess: ["executive", "support", "product"],
    chartData: [3.5, 3.2, 2.8, 2.5, 2.3, 2.1],
    predictiveInsight: "Could achieve <2% with focused retention",
    aiRecommendation: "Launch proactive outreach for at-risk accounts",
    isVisible: true,
    order: 8,
    color: "blue",
  },
];

const gridLayouts: GridLayout[] = [
  {
    id: "executive",
    name: "Executive Summary",
    description: "High-level KPIs for leadership overview",
    columns: 4,
    rows: 2,
    type: "executive",
  },
  {
    id: "analyst",
    name: "Analyst Dashboard",
    description: "Detailed metrics for in-depth analysis",
    columns: 3,
    rows: 3,
    type: "analyst",
  },
  {
    id: "department",
    name: "Department Focus",
    description: "Metrics relevant to specific departments",
    columns: 2,
    rows: 4,
    type: "department",
  },
  {
    id: "minimal",
    name: "Minimal View",
    description: "Key metrics only",
    columns: 2,
    rows: 1,
    type: "custom",
  },
];

export function SmartKPIGrid({
  userRole = "executive",
  department = "executive",
  className,
  autoOptimize = true,
}: SmartKPIGridProps) {
  // State management
  const [metrics, setMetrics] = useState<SmartKPIMetric[]>(defaultMetrics);
  const [currentLayout, setCurrentLayout] = useState<GridLayout>(
    gridLayouts[0]
  );
  const [viewMode, setViewMode] = useState<"grid" | "list" | "cards">("grid");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Filter metrics based on user permissions and preferences
  const filteredMetrics = useMemo(() => {
    return metrics
      .filter(metric => {
        // Role-based access control
        if (!metric.departmentAccess.includes(department)) return false;

        // Category filter
        if (filterCategory !== "all" && metric.category !== filterCategory)
          return false;

        // Visibility filter
        return metric.isVisible;
      })
      .sort((a, b) => a.order - b.order);
  }, [metrics, department, filterCategory]);

  // Smart layout optimization
  useEffect(() => {
    if (!autoOptimize) return;

    const optimizeLayout = () => {
      const screenWidth = window.innerWidth;
      let optimalLayout: GridLayout;

      if (screenWidth < 768) {
        optimalLayout =
          gridLayouts.find(l => l.id === "minimal") || gridLayouts[0];
      } else if (screenWidth < 1024) {
        optimalLayout =
          gridLayouts.find(l => l.id === "department") || gridLayouts[2];
      } else {
        optimalLayout =
          gridLayouts.find(l => l.id === userRole) || gridLayouts[0];
      }

      setCurrentLayout(optimalLayout);
    };

    optimizeLayout();
    window.addEventListener("resize", optimizeLayout);

    return () => window.removeEventListener("resize", optimizeLayout);
  }, [autoOptimize, userRole]);

  // Smart KPI Card Component
  const SmartKPICard = ({ metric }: { metric: SmartKPIMetric }) => {
    const [showDetails, setShowDetails] = useState(false);

    const colorClasses = {
      blue: "from-blue-500/20 via-blue-600/10 to-blue-700/5 border-blue-500/30 hover:border-blue-400/50",
      green:
        "from-emerald-500/20 via-emerald-600/10 to-emerald-700/5 border-emerald-500/30 hover:border-emerald-400/50",
      purple:
        "from-purple-500/20 via-purple-600/10 to-purple-700/5 border-purple-500/30 hover:border-purple-400/50",
      orange:
        "from-orange-500/20 via-orange-600/10 to-orange-700/5 border-orange-500/30 hover:border-orange-400/50",
      red: "from-red-500/20 via-red-600/10 to-red-700/5 border-red-500/30 hover:border-red-400/50",
      indigo:
        "from-indigo-500/20 via-indigo-600/10 to-indigo-700/5 border-indigo-500/30 hover:border-indigo-400/50",
    };

    return (
      <div
        className={cn(
          "relative backdrop-blur-xl border rounded-2xl p-6 group cursor-pointer",
          "bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02]",
          "shadow-2xl shadow-black/20 hover:scale-[1.02] transition-all duration-300",
          colorClasses[metric.color]
        )}
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-2 rounded-xl bg-gradient-to-r",
              colorClasses[metric.color]
            )}
          >
            <div className="text-white">{metric.icon}</div>
          </div>

          <div className="flex items-center gap-2">
            {metric.importance === "critical" && (
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            )}
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                metric.isPositive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {metric.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(metric.trend)}%
            </div>
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {metric.title}
          </h3>
          <p className="text-2xl font-bold text-foreground">{metric.value}</p>
          {metric.subValue && (
            <p className="text-xs text-muted-foreground mt-1">
              {metric.subValue}
            </p>
          )}
        </div>

        {/* Mini Chart */}
        {metric.chartData && (
          <div className="flex items-end h-8 gap-[1px] mt-3 mb-3">
            {metric.chartData.map((point, index) => {
              const max = Math.max(...metric.chartData!);
              const min = Math.min(...metric.chartData!);
              const height = ((point - min) / (max - min)) * 100;
              return (
                <div
                  key={index}
                  className={cn(
                    "bg-gradient-to-t rounded-[1px] transition-all duration-300",
                    metric.isPositive
                      ? "from-emerald-400/60 to-emerald-300/80"
                      : "from-red-400/60 to-red-300/80"
                  )}
                  style={{
                    height: `${Math.max(height, 10)}%`,
                    width: `${100 / metric.chartData!.length - 1}%`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* AI Insights (expandable) */}
        {aiInsightsEnabled &&
          showDetails &&
          (metric.predictiveInsight || metric.aiRecommendation) && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-purple-400">
                  AI Insights
                </span>
              </div>

              {metric.predictiveInsight && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Prediction:</span>{" "}
                    {metric.predictiveInsight}
                  </p>
                </div>
              )}

              {metric.aiRecommendation && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Recommendation:</span>{" "}
                    {metric.aiRecommendation}
                  </p>
                </div>
              )}
            </div>
          )}

        {/* Customization controls (when in customization mode) */}
        {isCustomizing && (
          <div className="absolute top-2 right-2 flex gap-1">
            <NormalButton
              onClick={e => {
                e.stopPropagation();
                setMetrics(prev =>
                  prev.map(m =>
                    m.id === metric.id ? { ...m, isVisible: !m.isVisible } : m
                  )
                );
              }}
              className="p-1 rounded bg-black/20 hover:bg-black/40 transition-colors"
            >
              {metric.isVisible ? (
                <Eye className="w-3 h-3 text-white" />
              ) : (
                <EyeOff className="w-3 h-3 text-white" />
              )}
            </NormalButton>
          </div>
        )}
      </div>
    );
  };

  // Grid Controls Component
  const GridControls = () => (
    <div className="flex items-center gap-4 mb-6 p-4 backdrop-blur-xl rounded-2xl bg-white/[0.08] border border-white/10">
      {/* Layout Selector */}
      <div className="flex items-center gap-2">
        <Layout className="w-4 h-4 text-muted-foreground" />
        <select
          value={currentLayout.id}
          onChange={e => {
            const layout = gridLayouts.find(l => l.id === e.target.value);
            if (layout) setCurrentLayout(layout);
          }}
          className="bg-transparent border border-white/20 rounded-lg px-3 py-1 text-sm text-foreground focus:outline-none focus:border-white/40"
          aria-label="Select grid layout"
        >
          {gridLayouts.map(layout => (
            <option key={layout.id} value={layout.id} className="bg-black">
              {layout.name}
            </option>
          ))}
        </select>
      </div>

      {/* View Mode */}
      <div className="flex items-center gap-1 p-1 bg-black/20 rounded-lg">
        {[
          { mode: "grid" as const, icon: Grid3X3 },
          { mode: "list" as const, icon: List },
          { mode: "cards" as const, icon: PieChart },
        ].map(({ mode, icon: Icon }) => (
          <NormalButton
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "p-2 rounded transition-colors",
              viewMode === mode
                ? "bg-white/20 text-white"
                : "text-muted-foreground hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" />
          </NormalButton>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-transparent border border-white/20 rounded-lg px-3 py-1 text-sm text-foreground focus:outline-none focus:border-white/40"
          aria-label="Filter by category"
        >
          <option value="all" className="bg-black">
            All Categories
          </option>
          <option value="revenue" className="bg-black">
            Revenue
          </option>
          <option value="customers" className="bg-black">
            Customers
          </option>
          <option value="performance" className="bg-black">
            Performance
          </option>
          <option value="growth" className="bg-black">
            Growth
          </option>
          <option value="operations" className="bg-black">
            Operations
          </option>
        </select>
      </div>

      {/* AI Insights Toggle */}
      <NormalButton
        onClick={() => setAiInsightsEnabled(!aiInsightsEnabled)}
        className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors",
          aiInsightsEnabled
            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
            : "bg-black/20 text-muted-foreground border border-white/20"
        )}
      >
        <Brain className="w-4 h-4" />
        AI Insights
      </NormalButton>

      {/* Customization Toggle */}
      <NormalButton
        onClick={() => setIsCustomizing(!isCustomizing)}
        className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors",
          isCustomizing
            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
            : "bg-black/20 text-muted-foreground border border-white/20"
        )}
      >
        <Settings className="w-4 h-4" />
        Customize
      </NormalButton>

      {/* Reset Button */}
      <NormalButton
        onClick={() => {
          setMetrics(defaultMetrics);
          setFilterCategory("all");
          setCurrentLayout(gridLayouts[0]);
          setViewMode("grid");
        }}
        className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm bg-black/20 text-muted-foreground border border-white/20 hover:text-white transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </NormalButton>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Grid Controls */}
      <GridControls />

      {/* Smart KPI Grid */}
      <div
        className={cn(
          "grid gap-6",
          viewMode === "grid" &&
            `grid-cols-1 md:grid-cols-${currentLayout.columns}`,
          viewMode === "list" && "grid-cols-1",
          viewMode === "cards" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {filteredMetrics.map(metric => (
          <SmartKPICard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Empty State */}
      {filteredMetrics.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No KPIs Available
          </h3>
          <p className="text-muted-foreground">
            Adjust your filters or check your permissions to see relevant
            metrics.
          </p>
        </div>
      )}
    </div>
  );
}
