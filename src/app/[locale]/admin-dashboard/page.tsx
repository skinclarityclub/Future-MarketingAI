"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminDashboardExportReportingSystem from "@/components/admin/admin-dashboard-export-reporting-system";
import { UltraPremiumDashboardLayout } from "@/components/layout/ultra-premium-dashboard-layout";
import { useIsAdmin } from "@/hooks/use-rbac";
import ClickUpAnalyticsWidget from "@/components/dashboard/clickup-analytics-widget";
import WaitlistManagementDashboard from "@/components/admin/waitlist-management-dashboard";
import {
  Shield,
  Activity,
  BarChart3,
  Settings,
  Database,
  Users,
  FileText,
  Bell,
  Download,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Zap,
  ListChecks,
} from "lucide-react";

interface AdminDashboardModule {
  id: string;
  title: string;
  description: string;
  status: "operational" | "warning" | "critical";
  icon: React.ReactNode;
  path: string;
  metrics?: {
    value: string;
    label: string;
    trend?: "up" | "down" | "stable";
  };
}

export default function AdminDashboardPage() {
  const { isAdmin, isLoading } = useIsAdmin();
  // In demo/development mode, allow access to admin features
  const isDemoMode =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const hasAdminAccess = isAdmin || isDemoMode;
  const [activeTab, setActiveTab] = useState("overview");
  const [systemHealth, setSystemHealth] = useState<
    "operational" | "warning" | "critical"
  >("operational");

  const breadcrumbItems = [
    { label: "Admin", href: "/admin-dashboard", current: true },
  ];

  // Mock system modules data
  const modules: AdminDashboardModule[] = [
    {
      id: "system-health",
      title: "System Health",
      description: "Real-time monitoring van system performance en resources",
      status: "operational",
      icon: <Monitor className="w-5 h-5" />,
      path: "/admin/system-health",
      metrics: { value: "99.8%", label: "Uptime", trend: "stable" },
    },
    {
      id: "security",
      title: "Security Dashboard",
      description: "Beveiligingsmonitoring en compliance tracking",
      status: "operational",
      icon: <Shield className="w-5 h-5" />,
      path: "/admin/security-dashboard",
      metrics: { value: "0", label: "Active Threats", trend: "stable" },
    },
    {
      id: "user-management",
      title: "User Management",
      description: "RBAC en gebruikersrechten beheer",
      status: "operational",
      icon: <Users className="w-5 h-5" />,
      path: "/admin/rbac-management",
      metrics: { value: "1,247", label: "Active Users", trend: "up" },
    },
    {
      id: "performance",
      title: "Performance Monitoring",
      description: "Load testing en performance optimalisatie",
      status: "warning",
      icon: <Activity className="w-5 h-5" />,
      path: "/admin/performance-monitoring",
      metrics: { value: "85ms", label: "Avg Response", trend: "stable" },
    },
    {
      id: "analytics",
      title: "Business Analytics",
      description: "Revenue tracking en business intelligence",
      status: "operational",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/admin/business-analytics",
      metrics: { value: "€1.2M", label: "Monthly Revenue", trend: "up" },
    },
    {
      id: "export-reporting",
      title: "Export & Reporting",
      description: "Data export, rapportage en notificaties",
      status: "operational",
      icon: <FileText className="w-5 h-5" />,
      path: "#export-reporting",
      metrics: { value: "34", label: "Active Reports", trend: "stable" },
    },
    {
      id: "waitlist-management",
      title: "Waitlist Management",
      description: "MarketingMachine waitlist leads en conversie tracking",
      status: "operational",
      icon: <ListChecks className="w-5 h-5" />,
      path: "#waitlist-management",
      metrics: { value: "3", label: "Pending Leads", trend: "up" },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
            Operational
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            Warning
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
            Critical
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">
            Unknown
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Alert className="max-w-md border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-400">
            You do not have permission to access the Admin Dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="dark">
      <UltraPremiumDashboardLayout
        currentPage="Admin Dashboard"
        showSidebar={true}
        fullWidth={false}
        showBreadcrumbs={true}
        breadcrumbItems={breadcrumbItems}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard - Master Command Center
            </h1>
            <p className="text-slate-400 mt-2">
              Enterprise-grade system management en business intelligence
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(systemHealth)} animate-pulse`}
              />
              <span className="text-green-400 text-sm font-medium">
                {systemHealth === "operational"
                  ? "All Systems Operational"
                  : systemHealth === "warning"
                    ? "System Warning"
                    : "Critical Issues"}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="export-reporting"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export & Reporting
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Database className="w-4 h-4 mr-2" />
              Modules
            </TabsTrigger>
            <TabsTrigger
              value="clickup"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Activity className="w-4 h-4 mr-2" />
              ClickUp
            </TabsTrigger>
            <TabsTrigger
              value="waitlist-management"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Waitlist
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map(module => (
                <Card
                  key={module.id}
                  className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                          {module.icon}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">
                            {module.title}
                          </CardTitle>
                        </div>
                      </div>
                      {getStatusBadge(module.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-slate-400 text-sm">
                      {module.description}
                    </p>

                    {module.metrics && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                        <div>
                          <div className="text-2xl font-bold text-white">
                            {module.metrics.value}
                          </div>
                          <div className="text-xs text-slate-400">
                            {module.metrics.label}
                          </div>
                        </div>
                        {module.metrics.trend && (
                          <div
                            className={`flex items-center gap-1 ${
                              module.metrics.trend === "up"
                                ? "text-green-400"
                                : module.metrics.trend === "down"
                                  ? "text-red-400"
                                  : "text-slate-400"
                            }`}
                          >
                            {module.metrics.trend === "up" && (
                              <Zap className="w-4 h-4" />
                            )}
                            {module.metrics.trend === "down" && (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                            {module.metrics.trend === "stable" && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => {
                        if (module.path === "#export-reporting") {
                          setActiveTab("export-reporting");
                        } else if (module.path === "#waitlist-management") {
                          setActiveTab("waitlist-management");
                        } else {
                          window.location.href = module.path;
                        }
                      }}
                    >
                      Open Module
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-8 h-8 text-cyan-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">99.8%</div>
                      <div className="text-sm text-cyan-400">System Uptime</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">6/6</div>
                      <div className="text-sm text-green-400">
                        Modules Active
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">1,247</div>
                      <div className="text-sm text-purple-400">
                        Active Users
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Bell className="w-8 h-8 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">3</div>
                      <div className="text-sm text-yellow-400">
                        Active Alerts
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Export & Reporting Tab */}
          <TabsContent value="export-reporting" className="space-y-6">
            <AdminDashboardExportReportingSystem />
          </TabsContent>

          {/* ClickUp Analytics Tab */}
          <TabsContent value="clickup" className="space-y-6">
            <ClickUpAnalyticsWidget />
          </TabsContent>

          {/* Waitlist Management Tab */}
          <TabsContent value="waitlist-management" className="space-y-6">
            <WaitlistManagementDashboard />
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {modules.map(module => (
                <Card
                  key={module.id}
                  className="bg-slate-800/50 border-slate-700"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                          {module.icon}
                        </div>
                        <div>
                          <CardTitle className="text-white">
                            {module.title}
                          </CardTitle>
                          <p className="text-slate-400 text-sm mt-1">
                            {module.description}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(module.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {module.metrics && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-slate-900/50">
                          <div className="text-xl font-bold text-white">
                            {module.metrics.value}
                          </div>
                          <div className="text-xs text-slate-400">
                            {module.metrics.label}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900/50">
                          <div className="flex items-center gap-2">
                            {module.metrics.trend === "up" && (
                              <Zap className="w-4 h-4 text-green-400" />
                            )}
                            {module.metrics.trend === "down" && (
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                            )}
                            {module.metrics.trend === "stable" && (
                              <CheckCircle className="w-4 h-4 text-slate-400" />
                            )}
                            <span className="text-sm text-slate-300 capitalize">
                              {module.metrics.trend}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => {
                          if (module.path === "#export-reporting") {
                            setActiveTab("export-reporting");
                          } else if (module.path === "#waitlist-management") {
                            setActiveTab("waitlist-management");
                          } else {
                            window.location.href = module.path;
                          }
                        }}
                      >
                        Open Module
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </UltraPremiumDashboardLayout>
    </div>
  );
}
