"use client";

import React, { use, useState, useEffect } from "react";
import { ControlCenterLayout } from "@/components/layout/control-center-layout";
import AutomatedSchedulingDashboard from "@/components/marketing/automated-scheduling-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Users,
  BarChart3,
  CheckCircle,
  Activity,
  Play,
  Pause,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
import LiveWorkflowTriggers from "@/components/marketing/live-workflow-triggers";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Real-time monitoring data interface
interface MonitoringData {
  queueHealth: number;
  activeJobs: number;
  totalProcessed: number;
  failedJobs: number;
  isConnected: boolean;
  platformsStatus: {
    facebook: "active" | "inactive" | "error";
    instagram: "active" | "inactive" | "error";
    twitter: "active" | "inactive" | "error";
    linkedin: "active" | "inactive" | "error";
    tiktok: "active" | "inactive" | "error";
  };
}

const content = {
  en: {
    title: "Marketing Machine Super Control Center",
    subtitle: "Unified Control Hub for Complete Marketing Automation",
    description:
      "Real-time monitoring and control of all marketing automation processes",
    dashboard: {
      title: "Live Dashboard",
      queueHealth: "Queue Health",
      activeJobs: "Active Jobs",
      totalProcessed: "Total Processed",
      failedJobs: "Failed Jobs",
      platformsStatus: "Platform Status",
      systemStatus: "System Status",
    },
    controlCenter: {
      title: "Master Controls",
      smartScheduling: "Smart Scheduling",
      queueProcessing: "Queue Processing",
      multiPlatform: "Multi-Platform",
      analytics: "Analytics",
      autoPublishing: "Auto Publishing",
      approvalWorkflow: "Approval Workflow",
      realTimeMonitoring: "Real-time Monitoring",
      errorHandling: "Error Handling",
    },
    actions: {
      start: "Start",
      pause: "Pause",
      configure: "Configure",
      monitor: "Monitor",
      emergency: "Emergency Stop",
    },
  },
  nl: {
    title: "Marketing Machine Super Control Center",
    subtitle: "Unified Control Hub voor Complete Marketing Automatisering",
    description:
      "Real-time monitoring en controle van alle marketing automatisering processen",
    dashboard: {
      title: "Live Dashboard",
      queueHealth: "Wachtrij Gezondheid",
      activeJobs: "Actieve Jobs",
      totalProcessed: "Totaal Verwerkt",
      failedJobs: "Gefaalde Jobs",
      platformsStatus: "Platform Status",
      systemStatus: "Systeem Status",
    },
    controlCenter: {
      title: "Master Controls",
      smartScheduling: "Slimme Planning",
      queueProcessing: "Wachtrij Verwerking",
      multiPlatform: "Multi-Platform",
      analytics: "Analytics",
      autoPublishing: "Geautomatiseerde Publicatie",
      approvalWorkflow: "Goedkeuring Workflow",
      realTimeMonitoring: "Real-time Monitoring",
      errorHandling: "Fout Behandeling",
    },
    actions: {
      start: "Start",
      pause: "Pauzeer",
      configure: "Configureer",
      monitor: "Monitor",
      emergency: "Noodstop",
    },
  },
};

export default function MarketingAutomationPage({ params }: PageProps) {
  const { locale } = use(params);
  const t = content[locale as keyof typeof content] || content.en;

  // Get current module from URL params
  const [currentModule, setCurrentModule] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setCurrentModule(urlParams.get("module"));
  }, []);

  // Real-time monitoring state
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    queueHealth: 94,
    activeJobs: 12,
    totalProcessed: 1547,
    failedJobs: 3,
    isConnected: true,
    platformsStatus: {
      facebook: "active",
      instagram: "active",
      twitter: "active",
      linkedin: "inactive",
      tiktok: "error",
    },
  });

  const [masterPower, setMasterPower] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // Individual module states
  const [moduleStates, setModuleStates] = useState({
    smartScheduling: { active: true, lastAction: "configure" },
    queueProcessing: { active: true, lastAction: "monitor" },
    multiPlatform: { active: true, lastAction: "configure" },
    analytics: { active: true, lastAction: "monitor" },
    autoPublishing: { active: true, lastAction: "configure" },
    approvalWorkflow: { active: true, lastAction: "monitor" },
    realTimeMonitoring: { active: true, lastAction: "monitor" },
    errorHandling: { active: true, lastAction: "configure" },
  });

  // Handle module button clicks
  const handleModuleAction = (module: string, action: string) => {
    setActiveModule(module);
    setModuleStates(prev => ({
      ...prev,
      [module]: { ...prev[module as keyof typeof prev], lastAction: action },
    }));

    // Simulate action feedback
    setTimeout(() => setActiveModule(null), 1000);

    // You can add actual functionality here later
    console.log(`${action} action triggered for ${module}`);
  };

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMonitoringData(prev => ({
        ...prev,
        queueHealth: Math.max(
          85,
          Math.min(100, prev.queueHealth + (Math.random() - 0.5) * 2)
        ),
        activeJobs: Math.max(
          0,
          prev.activeJobs + Math.floor((Math.random() - 0.5) * 3)
        ),
        totalProcessed: prev.totalProcessed + Math.floor(Math.random() * 2),
        failedJobs: Math.max(
          0,
          prev.failedJobs + (Math.random() > 0.95 ? 1 : 0)
        ),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getPlatformStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return "text-green-400";
    if (health >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <ControlCenterLayout currentModule={currentModule || undefined}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl backdrop-blur-sm">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-xl text-gray-300 mt-2">{t.subtitle}</p>
            </div>
            {/* System Status */}
            <div className="ml-auto flex items-center gap-3">
              {monitoringData.isConnected ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Wifi className="h-5 w-5" />
                  <span className="text-sm font-medium">ONLINE</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <WifiOff className="h-5 w-5" />
                  <span className="text-sm font-medium">OFFLINE</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Queue Health */}
          <Card className="bg-black/40 backdrop-blur-lg border-gray-700 hover:border-blue-500 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  {t.dashboard.queueHealth}
                </h3>
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div className="space-y-2">
                <div
                  className={`text-3xl font-bold ${getHealthColor(monitoringData.queueHealth)}`}
                >
                  {monitoringData.queueHealth.toFixed(1)}%
                </div>
                <Progress value={monitoringData.queueHealth} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Active Jobs */}
          <Card className="bg-black/40 backdrop-blur-lg border-gray-700 hover:border-purple-500 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  {t.dashboard.activeJobs}
                </h3>
                <Activity className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {monitoringData.activeJobs}
              </div>
            </CardContent>
          </Card>

          {/* Total Processed */}
          <Card className="bg-black/40 backdrop-blur-lg border-gray-700 hover:border-green-500 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  {t.dashboard.totalProcessed}
                </h3>
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400">
                {monitoringData.totalProcessed.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Failed Jobs */}
          <Card className="bg-black/40 backdrop-blur-lg border-gray-700 hover:border-red-500 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  {t.dashboard.failedJobs}
                </h3>
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-red-400">
                {monitoringData.failedJobs}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Status Monitor */}
        <Card className="bg-black/40 backdrop-blur-lg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {t.dashboard.platformsStatus}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(monitoringData.platformsStatus).map(
                ([platform, status]) => (
                  <div
                    key={platform}
                    className="flex items-center gap-3 p-3 bg-black/20 rounded-lg"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${getPlatformStatusColor(status)}`}
                    />
                    <span className="text-white capitalize font-medium">
                      {platform}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Workflow Triggers Section */}
        <div className="col-span-full">
          <LiveWorkflowTriggers />
        </div>

        {/* Existing Master Controls Section */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              {t.controlCenter.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Smart Scheduling Control */}
              <div
                className={`space-y-4 p-4 rounded-lg transition-all duration-300 ${
                  activeModule === "smartScheduling"
                    ? "bg-blue-500/20 border border-blue-500"
                    : "bg-black/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-blue-400" />
                  <h3 className="text-white font-semibold">
                    {t.controlCenter.smartScheduling}
                  </h3>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() =>
                      handleModuleAction("smartScheduling", "configure")
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none font-medium"
                    size="sm"
                  >
                    {t.actions.configure}
                  </Button>
                  <div className="text-sm text-gray-400">
                    Status:{" "}
                    {moduleStates.smartScheduling.active
                      ? "Active"
                      : "Inactive"}
                  </div>
                  <div className="text-sm text-gray-400">Next: 15:30</div>
                </div>
              </div>

              {/* Queue Processing Control */}
              <div
                className={`space-y-4 p-4 rounded-lg transition-all duration-300 ${
                  activeModule === "queueProcessing"
                    ? "bg-purple-500/20 border border-purple-500"
                    : "bg-black/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-purple-400" />
                  <h3 className="text-white font-semibold">
                    {t.controlCenter.queueProcessing}
                  </h3>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() =>
                      handleModuleAction("queueProcessing", "monitor")
                    }
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white border-none font-medium"
                    size="sm"
                  >
                    {t.actions.monitor}
                  </Button>
                  <div className="text-sm text-gray-400">Workers: 8/10</div>
                  <div className="text-sm text-gray-400">Rate: 45/min</div>
                </div>
              </div>

              {/* Multi-Platform Control */}
              <div
                className={`space-y-4 p-4 rounded-lg transition-all duration-300 ${
                  activeModule === "multiPlatform"
                    ? "bg-green-500/20 border border-green-500"
                    : "bg-black/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-green-400" />
                  <h3 className="text-white font-semibold">
                    {t.controlCenter.multiPlatform}
                  </h3>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() =>
                      handleModuleAction("multiPlatform", "configure")
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white border-none font-medium"
                    size="sm"
                  >
                    {t.actions.configure}
                  </Button>
                  <div className="text-sm text-gray-400">Platforms: 5</div>
                  <div className="text-sm text-gray-400">Active: 4</div>
                </div>
              </div>

              {/* Analytics Control */}
              <div
                className={`space-y-4 p-4 rounded-lg transition-all duration-300 ${
                  activeModule === "analytics"
                    ? "bg-yellow-500/20 border border-yellow-500"
                    : "bg-black/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-white font-semibold">
                    {t.controlCenter.analytics}
                  </h3>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleModuleAction("analytics", "monitor")}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white border-none font-medium"
                    size="sm"
                  >
                    {t.actions.monitor}
                  </Button>
                  <div className="text-sm text-gray-400">CTR: 3.2%</div>
                  <div className="text-sm text-gray-400">Engagement: +12%</div>
                </div>
              </div>

              {/* Auto Publishing Control */}
              <div
                className={`space-y-4 p-4 rounded-lg transition-all duration-300 ${
                  activeModule === "autoPublishing"
                    ? "bg-orange-500/20 border border-orange-500"
                    : "bg-black/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-orange-400" />
                  <h3 className="text-white font-semibold">
                    {t.controlCenter.autoPublishing}
                  </h3>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() =>
                      handleModuleAction("autoPublishing", "configure")
                    }
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white border-none font-medium"
                    size="sm"
                  >
                    {t.actions.configure}
                  </Button>
                  <div className="text-sm text-gray-400">Queue: 23 posts</div>
                  <div className="text-sm text-gray-400">Today: 12 posted</div>
                </div>
              </div>

              {/* Approval Workflow Control */}
              <div
                className={`space-y-4 p-4 rounded-lg transition-all duration-300 ${
                  activeModule === "approvalWorkflow"
                    ? "bg-pink-500/20 border border-pink-500"
                    : "bg-black/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-pink-400" />
                  <h3 className="text-white font-semibold">
                    {t.controlCenter.approvalWorkflow}
                  </h3>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() =>
                      handleModuleAction("approvalWorkflow", "monitor")
                    }
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white border-none font-medium"
                    size="sm"
                  >
                    {t.actions.monitor}
                  </Button>
                  <div className="text-sm text-gray-400">Pending: 5</div>
                  <div className="text-sm text-gray-400">Approved: 18</div>
                </div>
              </div>

              {/* Real-time Monitoring Control */}
              <div
                className={`space-y-4 p-4 rounded-lg transition-all duration-300 ${
                  activeModule === "realTimeMonitoring"
                    ? "bg-cyan-500/20 border border-cyan-500"
                    : "bg-black/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-white font-semibold">
                    {t.controlCenter.realTimeMonitoring}
                  </h3>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() =>
                      handleModuleAction("realTimeMonitoring", "monitor")
                    }
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white border-none font-medium"
                    size="sm"
                  >
                    {t.actions.monitor}
                  </Button>
                  <div className="text-sm text-gray-400">Uptime: 99.8%</div>
                  <div className="text-sm text-gray-400">Response: 45ms</div>
                </div>
              </div>

              {/* Error Handling Control */}
              <div
                className={`space-y-4 p-4 rounded-lg transition-all duration-300 ${
                  activeModule === "errorHandling"
                    ? "bg-red-500/20 border border-red-500"
                    : "bg-black/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-red-400" />
                  <h3 className="text-white font-semibold">
                    {t.controlCenter.errorHandling}
                  </h3>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() =>
                      handleModuleAction("errorHandling", "configure")
                    }
                    className="w-full bg-red-600 hover:bg-red-700 text-white border-none font-medium"
                    size="sm"
                  >
                    {t.actions.configure}
                  </Button>
                  <div className="text-sm text-gray-400">
                    Errors: {monitoringData.failedJobs}
                  </div>
                  <div className="text-sm text-gray-400">Auto-retry: On</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrated Scheduling Dashboard */}
        <Card className="bg-black/40 backdrop-blur-lg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Automated Scheduling Dashboard
            </CardTitle>
            <CardDescription className="text-gray-400">
              Complete view of your marketing automation scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AutomatedSchedulingDashboard />
          </CardContent>
        </Card>
      </div>
    </ControlCenterLayout>
  );
}
