"use client";

import { useState } from "react";
import {
  Settings,
  Filter,
  Download,
  Share,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Bell,
  Search,
} from "lucide-react";

export default function InteractiveDemo() {
  const [darkMode, setDarkMode] = useState(false);
  const [realTimeData, setRealTimeData] = useState(true);
  const [refreshRate, setRefreshRate] = useState(30);

  // Demo KPI cards with interactive hover states
  const kpiCards = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: "$2.4M",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      id: "users",
      title: "Active Users",
      value: "14.2K",
      change: "+8.3%",
      icon: Users,
      color: "text-blue-400",
    },
    {
      id: "conversion",
      title: "Conversion Rate",
      value: "3.4%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-purple-400",
    },
    {
      id: "activity",
      title: "Session Activity",
      value: "89.2%",
      change: "+5.7%",
      icon: Activity,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with interactive elements */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Premium Interactive Dashboard
            </h1>
            <p className="text-neutral-400">
              Enterprise-grade interactive components showcase
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Interactive Buttons with Ripple Effects */}
            <NormalButton
              className="btn-interactive-premium px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 focus-ring-premium"
              aria-label="Search dashboard"
            >
              <Search className="w-5 h-5" />
            </NormalButton>

            <NormalButton
              className="btn-interactive-premium px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 focus-ring-premium"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
            </NormalButton>

            {/* Dropdown Example */}
            <div className="dropdown-premium">
              <div className="dropdown-trigger">
                <Download className="w-4 h-4" />
                Export
              </div>
              <div className="dropdown-content">
                <div className="menu-interactive-premium">
                  <div className="menu-item-interactive">Export as PDF</div>
                  <div className="menu-item-interactive">Export as Excel</div>
                  <div className="menu-item-interactive">Export as CSV</div>
                </div>
              </div>
            </div>

            <NormalButton className="btn-interactive-premium px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl">
              <Settings className="w-5 h-5" />
            </NormalButton>
          </div>
        </div>

        {/* Interactive KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map(card => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                className="card-interactive-premium p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl"
              >
                <div className="card-interactive-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm text-neutral-400 mb-1 tooltip-premium"
                        data-tooltip={`Click to view ${card.title} details`}
                      >
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {card.value}
                      </p>
                      <p className={`text-sm ${card.color} mt-1`}>
                        {card.change}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br from-white/20 to-white/5 ${card.color}`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Tabs System */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="tabs-premium mb-6">
            <NormalButton className="tab-premium active">Overview</NormalButton>
            <NormalButton className="tab-premium">Analytics</NormalButton>
            <NormalButton className="tab-premium">Settings</NormalButton>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Chart area with interactive elements */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Revenue Analytics
                </h3>
                <div className="flex items-center gap-3">
                  <NormalButton
                    className="btn-interactive-premium px-3 py-2 bg-white/10 text-white rounded-lg tooltip-premium"
                    data-tooltip="Switch to bar chart"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </NormalButton>
                  <NormalButton
                    className="btn-interactive-premium px-3 py-2 bg-white/10 text-white rounded-lg tooltip-premium"
                    data-tooltip="Switch to pie chart"
                  >
                    <PieChart className="w-4 h-4" />
                  </NormalButton>
                </div>
              </div>

              {/* Interactive Chart Bars */}
              <div className="h-64 flex items-end justify-center gap-4 bg-gradient-to-t from-blue-500/10 to-transparent rounded-xl p-4">
                {[400, 300, 200, 278, 189].map((value, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg data-point-interactive tooltip-premium"
                    data-tooltip={`Month ${index + 1}: $${value}k`}
                    style={{
                      height: `${(value / 400) * 100}%`,
                      width: "40px",
                      minHeight: "20px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Interactive Controls Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Toggle Controls */}
              <div className="bg-gradient-to-br from-white/5 to-white/2 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Dashboard Settings
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-200">
                      Dark Mode
                    </span>
                    <label className="toggle-premium">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={e => setDarkMode(e.target.checked)}
                        aria-label="Toggle dark mode"
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-200">
                      Real-time Updates
                    </span>
                    <label className="toggle-premium">
                      <input
                        type="checkbox"
                        checked={realTimeData}
                        onChange={e => setRealTimeData(e.target.checked)}
                        aria-label="Toggle real-time updates"
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="bg-gradient-to-br from-white/5 to-white/2 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Performance Tuning
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-neutral-200">
                        Refresh Rate
                      </label>
                      <span className="text-sm text-neutral-400">
                        {refreshRate}s
                      </span>
                    </div>
                    <div
                      className="slider-premium"
                      style={
                        {
                          "--slider-percentage": `${((refreshRate - 5) / 295) * 100}%`,
                        } as React.CSSProperties
                      }
                    >
                      <div
                        className="slider-thumb"
                        style={{ left: `${((refreshRate - 5) / 295) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Accordion */}
            <div className="accordion-premium">
              <div className="border-b border-white/5">
                <NormalButton className="accordion-header w-full">
                  <span className="font-medium text-left">User Metrics</span>
                  <span className="accordion-icon">▶</span>
                </NormalButton>
                <div className="accordion-content">
                  <div className="accordion-body">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-400 mb-2">
                          Page Views
                        </p>
                        <p className="text-xl font-bold text-white">127.4K</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400 mb-2">
                          Unique Visitors
                        </p>
                        <p className="text-xl font-bold text-white">45.2K</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-white/5">
                <NormalButton className="accordion-header w-full">
                  <span className="font-medium text-left">
                    Performance Metrics
                  </span>
                  <span className="accordion-icon">▶</span>
                </NormalButton>
                <div className="accordion-content">
                  <div className="accordion-body">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-400 mb-2">
                          Load Time
                        </p>
                        <p className="text-xl font-bold text-white">1.2s</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400 mb-2">
                          Bounce Rate
                        </p>
                        <p className="text-xl font-bold text-white">23.5%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                Implementation Progress
              </h4>
              <div className="progress-steps">
                <div
                  className="progress-step completed"
                  title="Data Collection"
                >
                  ✓
                </div>
                <div className="progress-step completed" title="Analysis">
                  ✓
                </div>
                <div className="progress-step active" title="Visualization">
                  3
                </div>
                <div className="progress-step" title="Reporting">
                  4
                </div>
                <div className="progress-step" title="Optimization">
                  5
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
