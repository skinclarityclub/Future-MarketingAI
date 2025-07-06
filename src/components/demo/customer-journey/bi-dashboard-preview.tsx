"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  DollarSign,
  Target,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface BIDashboardPreviewProps {
  onInteraction: (type: string, data?: any) => void;
}

interface DashboardView {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

// Sample data for demo
const sampleRevenueData = [
  { month: "Jan", revenue: 45000, leads: 320, conversion: 12.5 },
  { month: "Feb", revenue: 52000, leads: 380, conversion: 13.2 },
  { month: "Mar", revenue: 48000, leads: 340, conversion: 14.1 },
  { month: "Apr", revenue: 61000, leads: 420, conversion: 14.5 },
  { month: "May", revenue: 58000, leads: 390, conversion: 14.9 },
  { month: "Jun", revenue: 67000, leads: 450, conversion: 14.9 },
];

const sampleKPIData = [
  { name: "Marketing ROI", value: 340, change: 18, color: "#10B981" },
  { name: "Conversion Rate", value: 14.9, change: 12, color: "#3B82F6" },
  { name: "Customer LTV", value: 4250, change: 23, color: "#8B5CF6" },
  { name: "CAC Payback", value: 3.2, change: -15, color: "#F59E0B" },
];

const sampleCustomerSegments = [
  { name: "Enterprise", value: 45, color: "#10B981" },
  { name: "Mid-Market", value: 30, color: "#3B82F6" },
  { name: "SMB", value: 20, color: "#8B5CF6" },
  { name: "Startup", value: 5, color: "#F59E0B" },
];

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"];

// Executive Overview Dashboard
const ExecutiveOverview = () => (
  <div className="space-y-6">
    {/* KPI Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {sampleKPIData.map((kpi, index) => (
        <motion.div
          key={kpi.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div
              className={`flex items-center gap-1 ${kpi.change > 0 ? "text-green-400" : "text-red-400"}`}
            >
              {kpi.change > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="text-xs font-medium">
                {Math.abs(kpi.change)}%
              </span>
            </div>
          </div>
          <h3 className="text-xs text-gray-300 mb-1">{kpi.name}</h3>
          <p className="text-lg font-bold text-white">
            {kpi.name.includes("ROI") || kpi.name.includes("Rate")
              ? `${kpi.value}%`
              : kpi.name.includes("LTV")
                ? `€${kpi.value.toLocaleString()}`
                : `${kpi.value} mo`}
          </p>
        </motion.div>
      ))}
    </div>

    {/* Revenue Trend Chart */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        Revenue Performance
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sampleRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "white",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  </div>
);

// Financial Intelligence Dashboard
const FinancialIntelligence = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue vs Leads */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Revenue vs Lead Generation
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#3B82F6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Customer Segments */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Customer Segmentation
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sampleCustomerSegments}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                stroke="none"
              >
                {sampleCustomerSegments.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {sampleCustomerSegments.map((segment, index) => (
            <div key={segment.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-300">
                {segment.name} ({segment.value}%)
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Conversion Funnel */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        Conversion Rate Analysis
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sampleRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "white",
              }}
            />
            <Bar dataKey="conversion" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  </div>
);

// Customer Analytics Dashboard
const CustomerAnalytics = () => (
  <div className="space-y-6">
    {/* Customer Lifetime Value */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">€4,250</p>
            <p className="text-sm text-green-400">+23% vs last month</p>
          </div>
        </div>
        <h3 className="text-sm text-gray-300">Average Customer LTV</h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">1,847</p>
            <p className="text-sm text-blue-400">+18% vs last month</p>
          </div>
        </div>
        <h3 className="text-sm text-gray-300">Active Customers</h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">87.3%</p>
            <p className="text-sm text-purple-400">+5.2% vs last month</p>
          </div>
        </div>
        <h3 className="text-sm text-gray-300">Retention Rate</h3>
      </motion.div>
    </div>

    {/* Detailed Analytics Table */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        Customer Intelligence Insights
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">
              High-value customers increased by 34%
            </span>
          </div>
          <span className="text-green-400 font-semibold">
            +€187k revenue impact
          </span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">
              Churn risk customers identified
            </span>
          </div>
          <span className="text-blue-400 font-semibold">23 customers</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-300">Upsell opportunities detected</span>
          </div>
          <span className="text-purple-400 font-semibold">€89k potential</span>
        </div>
      </div>
    </motion.div>
  </div>
);

export default function BIDashboardPreview({
  onInteraction,
}: BIDashboardPreviewProps) {
  const [currentView, setCurrentView] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const dashboardViews: DashboardView[] = [
    {
      id: "executive",
      title: "Executive Overview",
      subtitle: "High-level business metrics en KPI's",
      icon: <BarChart3 className="w-5 h-5" />,
      component: <ExecutiveOverview />,
    },
    {
      id: "financial",
      title: "Financial Intelligence",
      subtitle: "Revenue analytics en financial insights",
      icon: <DollarSign className="w-5 h-5" />,
      component: <FinancialIntelligence />,
    },
    {
      id: "customer",
      title: "Customer Analytics",
      subtitle: "Customer intelligence en segmentation",
      icon: <Users className="w-5 h-5" />,
      component: <CustomerAnalytics />,
    },
  ];

  // Auto-rotate through views
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentView(prev => (prev + 1) % dashboardViews.length);
      onInteraction("dashboard-auto-rotate", {
        view: dashboardViews[currentView].id,
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, currentView, dashboardViews, onInteraction]);

  const handleViewChange = (index: number) => {
    setCurrentView(index);
    setIsAutoPlaying(false);
    onInteraction("dashboard-manual-view-change", {
      view: dashboardViews[index].id,
    });
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
    onInteraction("dashboard-autoplay-toggle", { enabled: !isAutoPlaying });
  };

  const resetDemo = () => {
    setCurrentView(0);
    setIsAutoPlaying(true);
    onInteraction("dashboard-demo-reset");
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
        <div className="flex items-center gap-4">
          <Eye className="w-5 h-5 text-blue-400" />
          <span className="text-white font-semibold">
            BI Dashboard Live Preview
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Live Data</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NormalButton
            onClick={toggleAutoPlay}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isAutoPlaying ? "Pause" : "Play"}
          </NormalButton>
          <NormalButton
            onClick={resetDemo}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </NormalButton>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="flex space-x-2">
        {dashboardViews.map((view, index) => (
          <NormalButton
            key={view.id}
            onClick={() => handleViewChange(index)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${
                currentView === index
                  ? "bg-blue-500/30 border-blue-400/50 text-white"
                  : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20"
              } border backdrop-blur-sm
            `}
          >
            {view.icon}
            <div className="text-left">
              <p className="text-sm font-semibold">{view.title}</p>
              <p className="text-xs opacity-80">{view.subtitle}</p>
            </div>
          </NormalButton>
        ))}
      </div>

      {/* Dashboard Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="min-h-[500px]"
        >
          {dashboardViews[currentView].component}
        </motion.div>
      </AnimatePresence>

      {/* Dashboard Features Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <h4 className="text-white font-semibold mb-2">Real-time Updates</h4>
          <p className="text-gray-300 text-sm">
            Data refreshes automatically every 30 seconds
          </p>
        </div>
        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <h4 className="text-white font-semibold mb-2">AI-Powered Insights</h4>
          <p className="text-gray-300 text-sm">
            Machine learning detecteert trends en anomalieën
          </p>
        </div>
        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <h4 className="text-white font-semibold mb-2">Custom Dashboards</h4>
          <p className="text-gray-300 text-sm">
            Volledig aanpasbare views per rol en department
          </p>
        </div>
      </motion.div>
    </div>
  );
}
