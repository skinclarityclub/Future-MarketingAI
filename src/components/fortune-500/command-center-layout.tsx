"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Monitor,
  Grid3X3,
  Maximize2,
  Minimize2,
  Settings,
  CheckCircle,
  MousePointer,
  Layers,
  Target,
  Clock,
  AlertCircle,
  Download,
  FileText,
  Database,
} from "lucide-react";
// Import the fixed PremiumDropdown component
import { PremiumDropdown } from "@/components/ui/interactive-elements";
// import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
// import { AIAssistantPanel } from '@/components/ai-assistant/assistant-panel';
// import { ConnectionStatus } from '@/components/dashboard/connection-status';
// ⚡ PERFORMANCE OPTIMIZATION: Use lightweight background instead of heavy QuantumBackground
import LightweightBackground from "./lightweight-background";
import FuturisticSidebar from "./futuristic-sidebar";
import AIAvatarAssistant from "./ai-avatar-assistant";
// ⚡ PERFORMANCE: Use optimized real-time service
import { getOptimizedRealTimeService } from "@/lib/fortune-500/optimized-real-time-service";
import type { RealTimeDataState } from "@/lib/fortune-500/optimized-real-time-service";
import RealTimeDataWidget from "./real-time-data-widget";
// ⚡ PERFORMANCE OPTIMIZATION: Lazy load marketing widgets to reduce initial bundle
const EnhancedAlertWidget = React.lazy(() => import("./enhanced-alert-widget"));

// 🔐 RBAC & Tier Access Controls
import { useAccessTier } from "@/hooks/use-access-tier";
import { type MarketingRoleType } from "@/lib/rbac/marketing-rbac";

// Social Media Components (lazy loaded)
const SocialMediaOversightDashboard = React.lazy(
  () => import("@/components/marketing/social-media-oversight-dashboard")
);

// API Integrations Component
const ApiIntegrationsManagement = React.lazy(
  () => import("./api-integrations-management")
);

// API Credentials Interface Component
const APICredentialsInterface = React.lazy(
  () => import("../command-center/api-credentials-interface")
);

// Import mini components for Fortune 500 dashboard
import {
  ExecutiveDashboardMini,
  SocialMediaOversightMini,
  MarketingAutomationMini,
  CompetitorMonitoringMini,
  InfrastructureMonitoringMini,
  ContentPipelineMini,
  CrossPlatformAnalyticsMini,
} from "./marketing-mini-widgets";

// Import ClickUp components
import MarketingClickUpTasklist from "@/components/dashboard/marketing-clickup-tasklist";
import { liveAnalyticsService } from "@/lib/analytics/live-analytics-service";

// Import Content Calendar component
import ComprehensiveContentCalendar from "@/components/command-center/comprehensive-content-calendar";

// Import Blotato Monitoring Dashboard
import BlotatoMonitoringDashboard from "@/components/command-center/blotato-monitoring-dashboard";

// Task 103 Components (lazy loaded for better performance)
const AutomationControlPanel = React.lazy(
  () => import("@/components/marketing/automation-control-panel")
);
const MobileContentCreator = React.lazy(
  () => import("@/components/marketing/mobile-content-creator")
);
const EnterpriseDashboard = React.lazy(
  () => import("@/components/enterprise/enterprise-dashboard")
);

// Enterprise Components (lazy loaded)
const SOC2ComplianceDashboard = React.lazy(
  () => import("@/components/security/soc2-compliance-dashboard")
);
const AuditDashboard = React.lazy(
  () => import("@/components/admin/audit-dashboard")
);
const RBACManagementDashboard = React.lazy(() =>
  import("@/components/admin/rbac-management-dashboard").then(module => ({
    default: module.RBACManagementDashboard,
  }))
);
const ApprovalWorkflowDashboard = React.lazy(
  () => import("@/components/approval/approval-workflow-dashboard")
);
const ApprovalAnalyticsDashboard = React.lazy(
  () => import("@/components/approval/approval-analytics-dashboard")
);
const EnterpriseContractsDashboard = React.lazy(
  () => import("@/components/admin/enterprise-contracts-dashboard")
);

// Live ClickUp Stats Component
function LiveClickUpStats() {
  const [stats, setStats] = useState({
    ideation: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const clickupData = await liveAnalyticsService.getLiveClickUpData();
        setStats({
          ideation: Math.floor(clickupData.projectMetrics.totalTasks * 0.15), // Estimate ideation phase
          inProgress: clickupData.projectMetrics.inProgressTasks,
          completed: clickupData.projectMetrics.completedTasks,
          overdue: clickupData.projectMetrics.overdueTasks,
        });
      } catch (error) {
        console.error("Failed to load ClickUp stats:", error);
        // Fallback to mock data
        setStats({
          ideation: 8,
          inProgress: 15,
          completed: 23,
          overdue: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Refresh every 2 minutes
    const interval = setInterval(loadStats, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-700/50 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-8 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm">Ideation</p>
            <p className="text-white text-2xl font-bold">{stats.ideation}</p>
          </div>
          <Target className="h-8 w-8 text-purple-400" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">In Progress</p>
            <p className="text-white text-2xl font-bold">{stats.inProgress}</p>
          </div>
          <Clock className="h-8 w-8 text-blue-400" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-200 text-sm">Completed</p>
            <p className="text-white text-2xl font-bold">{stats.completed}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-4 border border-red-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-200 text-sm">Overdue</p>
            <p className="text-white text-2xl font-bold">{stats.overdue}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
      </div>
    </div>
  );
}

// Types for the Fortune 500 Command Center
interface GridWidget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  size: "sm" | "md" | "lg" | "xl";
  position: { x: number; y: number };
  data?: any;
  isFloating?: boolean;
  priority: "high" | "medium" | "low";
}

interface CommandCenterState {
  viewMode:
    | "overview"
    | "detailed"
    | "mission-critical"
    | "social-media"
    | "analytics"
    | "automation"
    | "enterprise";
  gridLayout: GridWidget[];
  isFullscreen: boolean;
  activeFloatingPanels: string[];
  realTimeConnection: boolean;
  multiScreenMode: boolean;
  // Add visual effects control
  visualEffectsEnabled: boolean;
  performanceMode: "high" | "medium" | "low";
}

interface UnifiedCommandCenterProps {
  locale: string;
  className?: string;
}

// ====================================================================
// MAIN UNIFIED COMMAND CENTER COMPONENT
// ====================================================================

export default function UnifiedCommandCenter({
  locale,
  className: _className,
}: UnifiedCommandCenterProps) {
  // 🔐 Access Control Hooks
  const { currentTier, hasFeature, requiresUpgrade } = useAccessTier();

  // Check if in demo mode via URL parameter
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get("demo");
    setIsDemoMode(demoParam === "true");
  }, []);

  // Set userRole based on demo mode - always admin in demo mode
  const userRole: MarketingRoleType = isDemoMode ? "admin" : "admin"; // Always admin for now, in real app: isDemoMode ? "admin" : getUserRoleFromAuth()

  const [commandCenterState, setCommandCenterState] =
    useState<CommandCenterState>({
      viewMode: "automation", // Default to automation to show Task 103 features immediately
      gridLayout: [],
      isFullscreen: false,
      activeFloatingPanels: [],
      realTimeConnection: true,
      multiScreenMode: false,
      visualEffectsEnabled: true,
      performanceMode: "high",
    });

  const [isLoading, setIsLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState<RealTimeDataState | null>(
    null
  );
  const [aiAssistantMinimized, setAiAssistantMinimized] = useState(true);

  // Add social media dashboard state
  const [socialMediaExpanded, setSocialMediaExpanded] = useState(false);
  const [layoutMode, setLayoutMode] = useState<
    "fullscreen" | "sidebar" | "header"
  >("sidebar");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  // Initialize command center with default layout
  useEffect(() => {
    const initializeCommandCenter = async () => {
      setIsLoading(true);

      // Load default Fortune 500 dashboard layout
      const defaultLayout = await getDefaultFortune500Layout();

      setCommandCenterState(prev => ({
        ...prev,
        gridLayout: defaultLayout,
      }));

      setIsLoading(false);
    };

    initializeCommandCenter();

    // ⚡ PERFORMANCE: Subscribe to optimized real-time data updates
    const realTimeService = getOptimizedRealTimeService();
    const unsubscribe = realTimeService.subscribe("command-center", data => {
      setRealTimeData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Real-time connection handler
  const handleConnectionStatusChange = useCallback((connected: boolean) => {
    setCommandCenterState(prev => ({
      ...prev,
      realTimeConnection: connected,
    }));
  }, []);

  // Add social media dashboard widget configuration
  const socialMediaWidget: GridWidget = {
    id: "social-media-dashboard",
    title: "Social Media Accounts",
    component: () => <div>Social Media Component</div>,
    size: "md",
    position: { x: 0, y: 2 },
    priority: "high",
    data: {
      platforms: [
        "linkedin",
        "twitter",
        "instagram",
        "facebook",
        "tiktok",
        "youtube",
      ],
      realTimeMetrics: true,
      showScheduler: true,
    },
  };

  // Add layout switching functionality
  const handleLayoutChange = (mode: "fullscreen" | "sidebar" | "header") => {
    setLayoutMode(mode);
    // Persist user preference
    localStorage.setItem("fortune500-layout-mode", mode);
  };

  // Render main content based on active section
  const renderMainContent = () => {
    switch (activeSection) {
      case "enterprise-security":
        return (
          <Suspense
            fallback={
              <div className="text-white">Loading Enterprise Security...</div>
            }
          >
            <SOC2ComplianceDashboard />
          </Suspense>
        );

      case "compliance-audit":
        return (
          <Suspense
            fallback={
              <div className="text-white">Loading Compliance & Audit...</div>
            }
          >
            <AuditDashboard />
          </Suspense>
        );

      case "user-management":
        return (
          <Suspense
            fallback={
              <div className="text-white">Loading User Management...</div>
            }
          >
            <RBACManagementDashboard />
          </Suspense>
        );

      case "approval-workflows":
        return (
          <Suspense
            fallback={
              <div className="text-white">Loading Approval Workflows...</div>
            }
          >
            <div className="space-y-6">
              <ApprovalWorkflowDashboard />
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">
                  📊 Approval Analytics
                </h3>
                <ApprovalAnalyticsDashboard />
              </div>
            </div>
          </Suspense>
        );

      case "enterprise-contracts":
        return (
          <Suspense
            fallback={
              <div className="text-white">Loading Enterprise Contracts...</div>
            }
          >
            <EnterpriseContractsDashboard />
          </Suspense>
        );

      case "social":
      case "social-accounts":
        return (
          <Suspense
            fallback={
              <div className="text-white">
                Loading Social Media Dashboard...
              </div>
            }
          >
            <SocialMediaOversightDashboard />
          </Suspense>
        );

      case "research":
        return (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h1 className="text-3xl font-bold text-white mb-4">
                Market Research & Insights
              </h1>
              <p className="text-white/70 mb-6">
                AI-powered research dashboard with real-time market intelligence
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">
                    Competitive Analysis
                  </h3>
                  <p className="text-white/60 text-sm">
                    Track competitor strategies and market positioning
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">
                    Market Trends
                  </h3>
                  <p className="text-white/60 text-sm">
                    Identify emerging trends and opportunities
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">
                    Consumer Insights
                  </h3>
                  <p className="text-white/60 text-sm">
                    Deep dive into customer behavior patterns
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <Suspense
            fallback={<div className="text-white">Loading Settings...</div>}
          >
            <div className="space-y-6">
              <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white mb-4">
                  Command Center Settings
                </h1>
                <p className="text-white/70 mb-6">
                  Configure API credentials and system settings for your Command
                  Center
                </p>
              </div>
              <APICredentialsInterface />
            </div>
          </Suspense>
        );

      case "api-integrations":
        return (
          <Suspense
            fallback={
              <div className="text-white">Loading API Integrations...</div>
            }
          >
            <div className="space-y-6">
              <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white mb-4">
                  API Integrations Management
                </h1>
                <p className="text-white/70 mb-6">
                  Configure and monitor all external API integrations for your
                  MarketingMachine
                </p>
              </div>
              <ApiIntegrationsManagement />
            </div>
          </Suspense>
        );

      case "workflow-control":
        return (
          <Suspense
            fallback={
              <div className="text-white">Loading Workflow Control...</div>
            }
          >
            <div className="space-y-6">
              <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  WorkFlow Control Center
                </h1>
                <p className="text-white/70">
                  Master automation and process orchestration
                </p>
              </div>
              {/* Import the master workflow controller dashboard */}
              <div className="bg-black/10 rounded-2xl overflow-hidden">
                <iframe
                  src="/master-workflow-controller"
                  className="w-full h-96 border-0"
                  title="Master Workflow Controller"
                />
              </div>
            </div>
          </Suspense>
        );

      case "tasklist":
        return (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                ClickUp Content Workflow
              </h1>
              <p className="text-white/70">
                Manage content tasks through their complete lifecycle - All
                content phases integrated
              </p>

              {/* Quick Stats Row */}
              <LiveClickUpStats />
            </div>

            {/* Direct ClickUp Integration */}
            <div className="bg-black/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <MarketingClickUpTasklist
                className="w-full"
                commandCenterMode={true}
                showFilters={false}
                maxHeight="800px"
              />
            </div>
          </div>
        );

      case "agenda-planning":
        return (
          <div className="space-y-8">
            {/* 1. REAL-TIME MONITORING - TOP PRIORITY */}
            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  📡 Real-Time Monitoring & Status
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">
                    All Systems Operational
                  </span>
                </div>
              </div>
              <Suspense
                fallback={
                  <div className="animate-pulse bg-slate-800 h-64 rounded-lg" />
                }
              >
                <BlotatoMonitoringDashboard />
              </Suspense>
            </div>

            {/* 2. OVERVIEW SECTION */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-3">
                    📅 Content Calendar & Marketing Automation Hub
                  </h1>
                  <p className="text-white/70 text-lg">
                    Comprehensive content planning met AI-powered scheduling en
                    Blotato integration
                  </p>
                </div>
                <div className="flex space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-white/60">
                      Active Campaigns
                    </div>
                    <div className="text-2xl font-bold text-green-400">12</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/60">Scheduled Posts</div>
                    <div className="text-2xl font-bold text-blue-400">47</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MAIN AGENDA/CALENDAR SECTION - FULL WIDTH */}
            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  📅 Content Calendar
                </h2>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    📊 Week View
                  </button>
                  <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    📅 Month View
                  </button>
                </div>
              </div>
              <Suspense
                fallback={
                  <div className="animate-pulse bg-slate-800 h-96 rounded-lg" />
                }
              >
                <ComprehensiveContentCalendar />
              </Suspense>
            </div>

            {/* 3. CAMPAIGN MANAGEMENT SECTION - FULL WIDTH */}
            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  🚀 Campaign Management
                </h2>
                <button
                  onClick={() => window.open(`/${locale}/campaigns`, "_blank")}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all"
                >
                  📊 Open Campaigns Dashboard
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-900/30 to-green-700/30 p-4 rounded-lg border border-green-500/20">
                  <div className="text-green-400 font-semibold">
                    Active Campaigns
                  </div>
                  <div className="text-2xl font-bold text-white">8</div>
                  <div className="text-sm text-green-300">+2 this week</div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-700/30 p-4 rounded-lg border border-blue-500/20">
                  <div className="text-blue-400 font-semibold">Total Reach</div>
                  <div className="text-2xl font-bold text-white">47.2K</div>
                  <div className="text-sm text-blue-300">+12% increase</div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-700/30 p-4 rounded-lg border border-purple-500/20">
                  <div className="text-purple-400 font-semibold">
                    Conversion Rate
                  </div>
                  <div className="text-2xl font-bold text-white">3.8%</div>
                  <div className="text-sm text-purple-300">Above average</div>
                </div>
              </div>
            </div>

            {/* 4. AI & AUTOMATION TOOLS - 2 COLUMN GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* AI Content Generation */}
              <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  🤖 AI Content Generator
                </h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all">
                    ✨ Generate Social Media Post
                  </button>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all">
                    📝 Create Content Template
                  </button>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all">
                    🎯 Campaign Content Suite
                  </button>
                </div>
              </div>

              {/* Automation Control */}
              <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  ⚙️ Advanced Automation
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-white">Auto-Publishing</span>
                    <div className="w-12 h-6 bg-green-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-white">Smart Scheduling</span>
                    <div className="w-12 h-6 bg-green-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-white">A/B Testing</span>
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. DATA MANAGEMENT TOOLS - 2 COLUMN GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* CSV Import/Export */}
              <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  📊 Data Management
                </h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-medium transition-all flex items-center justify-center">
                    📥 Import Content CSV
                  </button>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white rounded-lg font-medium transition-all flex items-center justify-center">
                    📤 Export Analytics CSV
                  </button>
                  <div className="text-sm text-white/60 text-center">
                    Last export: 2 hours ago
                  </div>
                </div>
              </div>

              {/* Mobile & Advanced Tools */}
              <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  📱 Mobile & Tools
                </h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all">
                    📱 Mobile Content Creator
                  </button>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all">
                    ⏰ Smart Scheduling Engine
                  </button>
                  <div className="text-sm text-white/60 text-center">
                    24/7 automation active
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Performance Analytics
              </h1>
              <p className="text-white/70">
                Real-time performance metrics and insights
              </p>
            </div>
            <div className="bg-black/10 rounded-2xl overflow-hidden">
              <iframe
                src="/analytics"
                className="w-full h-96 border-0"
                title="Analytics Dashboard"
              />
            </div>
          </div>
        );

      case "marketing-intel":
        return (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h1 className="text-3xl font-bold text-white mb-4">
                Marketing Intelligence Hub
              </h1>
              <p className="text-white/70 mb-6">
                AI-powered business intelligence for strategic marketing
                decisions
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                  <h3 className="text-white font-semibold mb-2">AI Insights</h3>
                  <p className="text-white/60 text-sm">
                    Machine learning powered recommendations
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                  <h3 className="text-white font-semibold mb-2">
                    ROI Analysis
                  </h3>
                  <p className="text-white/60 text-sm">
                    Real-time return on investment tracking
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                  <h3 className="text-white font-semibold mb-2">
                    Predictive Models
                  </h3>
                  <p className="text-white/60 text-sm">
                    Future performance predictions
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                  <h3 className="text-white font-semibold mb-2">
                    Strategic Planning
                  </h3>
                  <p className="text-white/60 text-sm">
                    Data-driven strategy recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "overview":
      default:
        // Render default Command Center grid layout
        return (
          <div className="grid gap-6 h-full grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
            {commandCenterState.gridLayout.map(widget => (
              <DashboardWidget
                key={widget.id}
                widget={widget}
                viewMode={commandCenterState.viewMode}
                onUpdate={updatedWidget => {
                  const newLayout = commandCenterState.gridLayout.map(w =>
                    w.id === widget.id ? updatedWidget : w
                  );
                  setCommandCenterState(prev => ({
                    ...prev,
                    gridLayout: newLayout,
                  }));
                }}
              />
            ))}
          </div>
        );
    }
  };

  if (isLoading) {
    return <CommandCenterLoader />;
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900",
        "relative overflow-hidden dark",
        layoutMode === "sidebar" && "flex",
        layoutMode === "header" && "flex flex-col"
      )}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent)] animate-pulse" />

      {/* ⚡ PERFORMANCE: Lightweight Background instead of heavy QuantumBackground */}
      <LightweightBackground
        intensity="medium"
        color="multi"
        className="opacity-40"
      />

      {/* Layout-specific rendering */}
      {layoutMode === "sidebar" && (
        <>
          {/* Futuristic Sidebar */}
          <FuturisticSidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            userRole={userRole}
          />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col">
            {/* Command Center Header */}
            <header className="bg-slate-950/95 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      MarketingMachine Command Center
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Ultimate Marketing Control Hub
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">
                        All Systems Operational
                      </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-blue-400 text-sm font-medium">
                        Real-Time Active
                      </span>
                    </div>

                    {/* Test Dropdown - Quick Actions */}
                    <PremiumDropdown
                      trigger={
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          <span>Quick Actions</span>
                        </div>
                      }
                      className="z-50"
                    >
                      <div className="p-2 space-y-1 min-w-[180px]">
                        <div className="menu-item-interactive flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-500/10">
                          <FileText className="w-4 h-4" />
                          <span>Export Report</span>
                        </div>
                        <div className="menu-item-interactive flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-500/10">
                          <Database className="w-4 h-4" />
                          <span>Backup Data</span>
                        </div>
                        <div className="menu-item-interactive flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-500/10">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </div>
                      </div>
                    </PremiumDropdown>
                  </div>
                </div>

                {/* Navigation & Status */}
                <div className="flex items-center gap-6">
                  {/* BI Dashboard Navigation */}
                  <a
                    href={`/${locale}/executive-dashboard`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all group"
                  >
                    <svg
                      className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                    </svg>
                    <span className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300">
                      Executive Dashboard
                    </span>
                  </a>

                  <div className="text-right">
                    <div className="text-cyan-400 font-mono text-lg">
                      {new Date().toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="w-3 h-3 rounded bg-purple-500 animate-pulse" />
                    <div>
                      <div className="text-purple-400 text-sm font-medium">
                        MISSION ACTIVE
                      </div>
                      <div className="text-purple-300 text-xs">
                        Operation Eagle Eye
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 p-6">{renderMainContent()}</div>
          </main>

          {/* AI Avatar Assistant - Enhanced with contextual intelligence */}
          <AIAvatarAssistant
            isMinimized={aiAssistantMinimized}
            onToggleMinimize={() =>
              setAiAssistantMinimized(!aiAssistantMinimized)
            }
            realTimeData={
              realTimeData
                ? {
                    systemHealth:
                      realTimeData.systemMetrics?.cpu > 80
                        ? "warning"
                        : realTimeData.systemMetrics?.cpu > 95
                          ? "critical"
                          : "operational",
                    activeAlerts: realTimeData.alerts?.length || 0,
                    performanceMetrics: realTimeData.systemMetrics,
                    roiMetrics: realTimeData.roiMetrics,
                    dataSources: realTimeData.dataSources,
                  }
                : undefined
            }
            contextualData={{
              currentPage: "MarketingMachine Command Center",
              activeWorkflows: [
                "Content Automation",
                "Publishing Pipeline",
                "Campaign Control",
              ],
              recentActions: [
                "Workflow Control",
                "Content Publishing",
                "Campaign Analytics",
              ],
              userRole: "manager",
              securityLevel: "high",
            }}
          />
        </>
      )}

      {layoutMode === "fullscreen" && (
        <main className="relative z-10 p-6">
          <div className="grid gap-6 h-full grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
            {commandCenterState.gridLayout.map(widget => (
              <DashboardWidget
                key={widget.id}
                widget={widget}
                viewMode={commandCenterState.viewMode}
                onUpdate={updatedWidget => {
                  const newLayout = commandCenterState.gridLayout.map(w =>
                    w.id === widget.id ? updatedWidget : w
                  );
                  setCommandCenterState(prev => ({
                    ...prev,
                    gridLayout: newLayout,
                  }));
                }}
              />
            ))}
          </div>
        </main>
      )}

      {layoutMode === "header" && (
        <>
          {/* Header Navigation */}
          <header className="bg-slate-950/95 backdrop-blur-xl border-b border-cyan-500/20">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">F500</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      MarketingMachine Command Center
                    </h1>
                    <p className="text-cyan-400">
                      Ultimate Marketing Control Hub
                    </p>
                  </div>
                </div>

                {/* Global Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-400 text-sm">
                      All Systems Operational
                    </span>
                  </div>

                  {/* Layout Mode Selector */}
                  <div className="flex gap-2">
                    <NormalButton
                      onClick={() => handleLayoutChange("fullscreen")}
                      size="sm"
                      className={cn(
                        "px-3 py-1 rounded-lg border transition-all duration-300 text-sm font-medium",
                        layoutMode === "fullscreen"
                          ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/10"
                          : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50"
                      )}
                    >
                      Fullscreen
                    </NormalButton>
                    <NormalButton
                      onClick={() => handleLayoutChange("sidebar")}
                      size="sm"
                      className={cn(
                        "px-3 py-1 rounded-lg border transition-all duration-300 text-sm font-medium",
                        layoutMode === "sidebar"
                          ? "bg-purple-500/20 border-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/10"
                          : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50"
                      )}
                    >
                      Sidebar
                    </NormalButton>
                    <NormalButton
                      onClick={() => handleLayoutChange("header")}
                      size="sm"
                      className={cn(
                        "px-3 py-1 rounded-lg border transition-all duration-300 text-sm font-medium",
                        layoutMode === "header"
                          ? "bg-pink-500/20 border-pink-500/30 text-pink-300 shadow-lg shadow-pink-500/10"
                          : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50"
                      )}
                    >
                      Header
                    </NormalButton>
                  </div>
                </div>
              </div>

              {/* Quick Access Menu */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-400">Quick Access:</span>
                <div className="flex gap-2">
                  <NormalButton
                    onClick={() =>
                      setCommandCenterState(prev => ({
                        ...prev,
                        viewMode: "automation",
                      }))
                    }
                    size="sm"
                    className="px-3 py-1 text-xs bg-orange-500/10 border border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                  >
                    📅 Content Calendar
                  </NormalButton>
                  <NormalButton
                    onClick={() =>
                      setCommandCenterState(prev => ({
                        ...prev,
                        viewMode: "automation",
                      }))
                    }
                    size="sm"
                    className="px-3 py-1 text-xs bg-orange-500/10 border border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                  >
                    🤖 AI Automation
                  </NormalButton>
                  <NormalButton
                    onClick={() =>
                      setCommandCenterState(prev => ({
                        ...prev,
                        viewMode: "automation",
                      }))
                    }
                    size="sm"
                    className="px-3 py-1 text-xs bg-orange-500/10 border border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                  >
                    📱 Mobile Creator
                  </NormalButton>
                  <NormalButton
                    onClick={() =>
                      setCommandCenterState(prev => ({
                        ...prev,
                        viewMode: "enterprise",
                      }))
                    }
                    size="sm"
                    className="px-3 py-1 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                  >
                    🏢 Enterprise RBAC
                  </NormalButton>
                  <NormalButton
                    onClick={() =>
                      setCommandCenterState(prev => ({
                        ...prev,
                        viewMode: "enterprise",
                      }))
                    }
                    size="sm"
                    className="px-3 py-1 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                  >
                    📊 Blotato API
                  </NormalButton>
                </div>
              </div>

              {/* Tab Navigation */}
              <nav className="flex gap-1">
                <NormalButton
                  onClick={() =>
                    setCommandCenterState(prev => ({
                      ...prev,
                      viewMode: "overview",
                    }))
                  }
                  className={cn(
                    "px-6 py-3 rounded-t-lg font-medium transition-all duration-300 border-b-2",
                    commandCenterState.viewMode === "overview"
                      ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10"
                      : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30"
                  )}
                >
                  Mission Control
                </NormalButton>
                <NormalButton
                  onClick={() =>
                    setCommandCenterState(prev => ({
                      ...prev,
                      viewMode: "social-media",
                    }))
                  }
                  className={cn(
                    "px-6 py-3 rounded-t-lg font-medium transition-all duration-300 border-b-2",
                    commandCenterState.viewMode === "social-media"
                      ? "bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/10"
                      : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30"
                  )}
                >
                  Social Media Accounts
                </NormalButton>
                <NormalButton
                  onClick={() =>
                    setCommandCenterState(prev => ({
                      ...prev,
                      viewMode: "analytics",
                    }))
                  }
                  className={cn(
                    "px-6 py-3 rounded-t-lg font-medium transition-all duration-300 border-b-2",
                    commandCenterState.viewMode === "analytics"
                      ? "bg-pink-500/10 border-pink-500/50 text-pink-300 shadow-lg shadow-pink-500/10"
                      : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30"
                  )}
                >
                  Analytics
                </NormalButton>
                <NormalButton
                  onClick={() =>
                    setCommandCenterState(prev => ({
                      ...prev,
                      viewMode: "automation",
                    }))
                  }
                  className={cn(
                    "px-6 py-3 rounded-t-lg font-medium transition-all duration-300 border-b-2",
                    commandCenterState.viewMode === "automation"
                      ? "bg-orange-500/10 border-orange-500/50 text-orange-300 shadow-lg shadow-orange-500/10"
                      : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30"
                  )}
                >
                  🤖 Automation
                </NormalButton>
                <NormalButton
                  onClick={() =>
                    setCommandCenterState(prev => ({
                      ...prev,
                      viewMode: "enterprise",
                    }))
                  }
                  className={cn(
                    "px-6 py-3 rounded-t-lg font-medium transition-all duration-300 border-b-2",
                    commandCenterState.viewMode === "enterprise"
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10"
                      : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30"
                  )}
                >
                  🏢 Enterprise
                </NormalButton>
              </nav>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6">
            {commandCenterState.viewMode === "social-media" ? (
              <SocialMediaDashboard />
            ) : commandCenterState.viewMode === "automation" ? (
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 h-full">
                <Suspense
                  fallback={
                    <div className="animate-pulse bg-slate-800/50 rounded-lg h-96" />
                  }
                >
                  <AutomationControlPanel />
                </Suspense>
                <Suspense
                  fallback={
                    <div className="animate-pulse bg-slate-800/50 rounded-lg h-96" />
                  }
                >
                  <MobileContentCreator />
                </Suspense>
                <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-cyan-300">
                      📅 Content Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ComprehensiveContentCalendar />
                  </CardContent>
                </Card>
              </div>
            ) : commandCenterState.viewMode === "enterprise" ? (
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 h-full">
                <Suspense
                  fallback={
                    <div className="animate-pulse bg-slate-800/50 rounded-lg h-96" />
                  }
                >
                  <EnterpriseDashboard />
                </Suspense>
                <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-emerald-300">
                      📊 Blotato Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BlotatoMonitoringDashboard />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-6 h-full",
                  commandCenterState.viewMode === "overview" &&
                    "grid-cols-1 lg:grid-cols-3 xl:grid-cols-4",
                  commandCenterState.viewMode === "detailed" &&
                    "grid-cols-1 lg:grid-cols-2",
                  commandCenterState.viewMode === "mission-critical" &&
                    "grid-cols-1"
                )}
              >
                {commandCenterState.gridLayout.map(widget => (
                  <DashboardWidget
                    key={widget.id}
                    widget={widget}
                    viewMode={commandCenterState.viewMode}
                    onUpdate={updatedWidget => {
                      const newLayout = commandCenterState.gridLayout.map(w =>
                        w.id === widget.id ? updatedWidget : w
                      );
                      setCommandCenterState(prev => ({
                        ...prev,
                        gridLayout: newLayout,
                      }));
                    }}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {layoutMode === "fullscreen" && (
        <>
          {/* Original fullscreen layout with floating widgets */}
          {/* Command Center Header */}
          <header className="relative z-10 flex items-center justify-between p-6 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20">
            {/* ... existing header content ... */}

            {/* Add Social Media toggle */}
            <div className="flex items-center gap-4">
              <NormalButton
                onClick={() => setSocialMediaExpanded(!socialMediaExpanded)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  socialMediaExpanded
                    ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                    : "bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
                )}
              >
                📱 Social Media {socialMediaExpanded ? "Expanded" : "Collapsed"}
              </NormalButton>

              {/* Layout Mode Selector */}
              <div className="flex gap-2">
                <NormalButton
                  onClick={() => handleLayoutChange("fullscreen")}
                  size="sm"
                  className={cn(
                    "px-3 py-1 rounded-lg border transition-all duration-300 text-sm font-medium",
                    layoutMode === "fullscreen"
                      ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50"
                  )}
                >
                  Fullscreen
                </NormalButton>
                <NormalButton
                  onClick={() => handleLayoutChange("sidebar")}
                  size="sm"
                  className={cn(
                    "px-3 py-1 rounded-lg border transition-all duration-300 text-sm font-medium",
                    layoutMode === "sidebar"
                      ? "bg-purple-500/20 border-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/10"
                      : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50"
                  )}
                >
                  Sidebar
                </NormalButton>
                <NormalButton
                  onClick={() => handleLayoutChange("header")}
                  size="sm"
                  className={cn(
                    "px-3 py-1 rounded-lg border transition-all duration-300 text-sm font-medium",
                    layoutMode === "header"
                      ? "bg-pink-500/20 border-pink-500/30 text-pink-300 shadow-lg shadow-pink-500/10"
                      : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50"
                  )}
                >
                  Header
                </NormalButton>
              </div>
            </div>
          </header>

          {/* Main Content Grid */}
          <main className="relative z-10 flex-1 p-6">
            {socialMediaExpanded ? (
              <div className="absolute inset-6 z-20">
                <SocialMediaDashboard />
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-6 h-full",
                  commandCenterState.viewMode === "overview" &&
                    "grid-cols-1 lg:grid-cols-3 xl:grid-cols-4",
                  commandCenterState.viewMode === "detailed" &&
                    "grid-cols-1 lg:grid-cols-2",
                  commandCenterState.viewMode === "mission-critical" &&
                    "grid-cols-1"
                )}
              >
                {commandCenterState.gridLayout.map(widget => (
                  <DashboardWidget
                    key={widget.id}
                    widget={widget}
                    viewMode={commandCenterState.viewMode}
                    onUpdate={updatedWidget => {
                      const newLayout = commandCenterState.gridLayout.map(w =>
                        w.id === widget.id ? updatedWidget : w
                      );
                      setCommandCenterState(prev => ({
                        ...prev,
                        gridLayout: newLayout,
                      }));
                    }}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* AI Avatar Assistant - Available in all layouts with enhanced intelligence */}
      <AIAvatarAssistant
        isMinimized={aiAssistantMinimized}
        onToggleMinimize={() => setAiAssistantMinimized(!aiAssistantMinimized)}
        realTimeData={
          realTimeData
            ? {
                systemHealth:
                  realTimeData.systemMetrics?.cpu > 80
                    ? "warning"
                    : realTimeData.systemMetrics?.cpu > 95
                      ? "critical"
                      : "operational",
                activeAlerts: realTimeData.alerts?.length || 0,
                performanceMetrics: realTimeData.systemMetrics,
                roiMetrics: realTimeData.roiMetrics,
                dataSources: realTimeData.dataSources,
              }
            : undefined
        }
        contextualData={{
          currentPage: "Fortune 500 Command Center",
          activeWorkflows: ["Data Sync", "Content Pipeline", "ROI Tracking"],
          recentActions: ["Dashboard Refresh", "Alert Review", "KPI Analysis"],
          userRole: "manager",
          securityLevel: "high",
        }}
      />
    </div>
  );
}

// ====================================================================
// COMMAND CENTER HEADER
// ====================================================================

interface CommandCenterHeaderProps {
  state: CommandCenterState;
  onStateChange: (state: CommandCenterState) => void;
  locale: string;
}

function CommandCenterHeader({
  state,
  onStateChange,
  locale,
}: CommandCenterHeaderProps) {
  const toggleFullscreen = () => {
    onStateChange({
      ...state,
      isFullscreen: !state.isFullscreen,
    });
  };

  const toggleMultiScreen = () => {
    onStateChange({
      ...state,
      multiScreenMode: !state.multiScreenMode,
    });
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              {state.realTimeConnection && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Fortune 500 Command Center
              </h1>
              <p className="text-sm text-gray-400">
                Real-time Marketing Intelligence
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            <ConnectionStatus connected={state.realTimeConnection} />
            <SystemHealthIndicator />

            {/* View Mode Selector */}
            <Tabs
              value={state.viewMode}
              onValueChange={mode =>
                onStateChange({
                  ...state,
                  viewMode: mode as CommandCenterState["viewMode"],
                })
              }
            >
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="overview" className="text-xs">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="detailed" className="text-xs">
                  Detailed
                </TabsTrigger>
                <TabsTrigger value="mission-critical" className="text-xs">
                  Mission Critical
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              <NormalButton
                variant="ghost"
                size="sm"
                onClick={toggleMultiScreen}
                className={cn(
                  "text-gray-400 hover:text-white",
                  state.multiScreenMode && "text-blue-400"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </NormalButton>

              <NormalButton
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-gray-400 hover:text-white"
              >
                {state.isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </NormalButton>

              <NormalButton
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </NormalButton>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

// ====================================================================
// DASHBOARD GRID SYSTEM
// ====================================================================

interface DashboardGridProps {
  layout: GridWidget[];
  viewMode: CommandCenterState["viewMode"];
  onLayoutChange: (layout: GridWidget[]) => void;
}

function DashboardGrid({
  layout,
  viewMode,
  onLayoutChange,
}: DashboardGridProps) {
  const getGridColumns = () => {
    switch (viewMode) {
      case "overview":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case "detailed":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6";
      case "mission-critical":
        return "grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  return (
    <div className={cn("grid gap-4", getGridColumns())}>
      {layout.map(widget => (
        <DashboardWidget
          key={widget.id}
          widget={widget}
          viewMode={viewMode}
          onUpdate={updatedWidget => {
            const newLayout = layout.map(w =>
              w.id === widget.id ? updatedWidget : w
            );
            onLayoutChange(newLayout);
          }}
        />
      ))}
    </div>
  );
}

// ====================================================================
// INDIVIDUAL DASHBOARD WIDGET
// ====================================================================

interface DashboardWidgetProps {
  widget: GridWidget;
  viewMode: CommandCenterState["viewMode"];
  onUpdate: (widget: GridWidget) => void;
}

function DashboardWidget({ widget, viewMode, onUpdate }: DashboardWidgetProps) {
  const getWidgetSize = () => {
    const baseSize = {
      sm: "col-span-1 row-span-1",
      md: "col-span-2 row-span-1",
      lg: "col-span-2 row-span-2",
      xl: "col-span-3 row-span-2",
    };

    return baseSize[widget.size] || baseSize.sm;
  };

  const getPriorityColor = () => {
    switch (widget.priority) {
      case "high":
        return "border-red-500/50 bg-red-950/20";
      case "medium":
        return "border-yellow-500/50 bg-yellow-950/20";
      case "low":
        return "border-green-500/50 bg-green-950/20";
      default:
        return "border-gray-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group transition-all duration-300 ease-out",
        getWidgetSize(),
        widget.isFloating && "fixed z-30"
      )}
    >
      <Card
        className={cn(
          "h-full bg-gray-900/80 backdrop-blur-sm border-gray-800 hover:border-gray-700 transition-all duration-200",
          "hover:shadow-xl hover:shadow-blue-500/10",
          getPriorityColor()
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-200">
              {widget.title}
            </CardTitle>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <NormalButton variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MousePointer className="w-3 h-3" />
              </NormalButton>
              <NormalButton variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Layers className="w-3 h-3" />
              </NormalButton>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Render the widget component */}
          <widget.component />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ====================================================================
// SUPPORTING COMPONENTS
// ====================================================================

function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          connected ? "bg-green-500 animate-pulse" : "bg-red-500"
        )}
      />
      <span className="text-xs text-gray-400">
        {connected ? "Live" : "Disconnected"}
      </span>
    </div>
  );
}

function SystemHealthIndicator() {
  return (
    <div className="flex items-center space-x-2">
      <CheckCircle className="w-4 h-4 text-green-500" />
      <span className="text-xs text-gray-400">All Systems Operational</span>
    </div>
  );
}

function FloatingPanel({
  panelId,
  onClose,
}: {
  panelId: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 100 }}
      className="fixed top-20 right-4 z-50 w-80 h-96"
    >
      <Card className="h-full bg-gray-900/95 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Floating Panel {panelId}</CardTitle>
            <NormalButton variant="ghost" size="sm" onClick={onClose}>
              ×
            </NormalButton>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Floating panel content</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// AI Assistant Panel is now handled by AIAvatarAssistant component

function CommandCenterLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/30 to-purple-900/20 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-r-purple-500 rounded-full animate-ping" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">
            Initializing Fortune 500 Command Center
          </h2>
          <p className="text-gray-400">Loading enterprise-grade dashboard...</p>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

async function getDefaultFortune500Layout(): Promise<GridWidget[]> {
  // Simulate API call to get default Fortune 500 enterprise layout
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          id: "executive-dashboard",
          title: "Executive Overview",
          component: () => <ExecutiveDashboardMini />,
          size: "xl",
          position: { x: 0, y: 0 },
          priority: "high",
        },
        {
          id: "social-media-command-center",
          title: "Social Media Command Center",
          component: () => <SocialMediaOversightMini />,
          size: "lg",
          position: { x: 4, y: 0 },
          priority: "high",
        },
        {
          id: "marketing-automation-control",
          title: "Marketing Automation",
          component: () => <MarketingAutomationMini />,
          size: "lg",
          position: { x: 0, y: 2 },
          priority: "high",
        },
        {
          id: "competitor-intelligence",
          title: "Competitor Intelligence",
          component: () => <CompetitorMonitoringMini />,
          size: "md",
          position: { x: 4, y: 2 },
          priority: "high",
        },
        {
          id: "infrastructure-monitoring",
          title: "Infrastructure Health",
          component: () => <InfrastructureMonitoringMini />,
          size: "md",
          position: { x: 6, y: 2 },
          priority: "medium",
        },
        {
          id: "content-production-pipeline",
          title: "Content Pipeline",
          component: () => <ContentPipelineMini />,
          size: "lg",
          position: { x: 0, y: 4 },
          priority: "medium",
        },
        {
          id: "cross-platform-analytics",
          title: "Cross-Platform Analytics",
          component: () => <CrossPlatformAnalyticsMini />,
          size: "lg",
          position: { x: 3, y: 4 },
          priority: "medium",
        },
        {
          id: "business-intelligence-kpis",
          title: "Business Intelligence KPIs",
          component: () => (
            <RealTimeDataWidget
              title="BI KPIs"
              type="kpis"
              className="h-full"
            />
          ),
          size: "md",
          position: { x: 6, y: 4 },
          priority: "high",
        },
        {
          id: "campaign-roi-analytics",
          title: "Campaign ROI",
          component: () => (
            <RealTimeDataWidget
              title="Campaign ROI"
              type="roi"
              className="h-full"
            />
          ),
          size: "md",
          position: { x: 0, y: 6 },
          priority: "high",
        },
        {
          id: "clickup-project-management",
          title: "ClickUp Projects",
          component: () => (
            <RealTimeDataWidget
              title="ClickUp Tasks"
              type="clickup"
              className="h-full"
            />
          ),
          size: "md",
          position: { x: 2, y: 6 },
          priority: "medium",
        },
        {
          id: "n8n-workflow-engine",
          title: "n8n Automation",
          component: () => (
            <RealTimeDataWidget
              title="n8n Workflows"
              type="n8n"
              className="h-full"
            />
          ),
          size: "md",
          position: { x: 4, y: 6 },
          priority: "medium",
        },
        {
          id: "blotato-campaign-monitor",
          title: "Blotato Campaigns",
          component: () => (
            <RealTimeDataWidget
              title="Blotato Campaigns"
              type="blotato"
              className="h-full"
            />
          ),
          size: "md",
          position: { x: 6, y: 6 },
          priority: "low",
        },
        {
          id: "enhanced-alert-system",
          title: "Real-Time Alerts",
          component: () => (
            <EnhancedAlertWidget
              className="h-full"
              maxAlertsDisplay={6}
              enableSound={true}
              autoRefresh={true}
              onAlertClick={alert => console.log("Alert clicked:", alert)}
              onAIAssistanceRequest={alert =>
                console.log("AI assistance requested for:", alert)
              }
            />
          ),
          size: "lg",
          position: { x: 0, y: 8 },
          priority: "high",
        },
      ]);
    }, 1000);
  });
}

// Use the full SocialMediaOversightDashboard component
function SocialMediaDashboard() {
  return (
    <div className="h-full">
      <Suspense
        fallback={
          <div className="text-white">Loading Social Media Dashboard...</div>
        }
      >
        <SocialMediaOversightDashboard />
      </Suspense>
    </div>
  );
}
