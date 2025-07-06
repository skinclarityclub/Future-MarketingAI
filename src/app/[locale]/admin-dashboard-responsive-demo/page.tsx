"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ResponsiveAdminLayout from "@/components/admin/responsive-admin-layout";
import AdminDashboardExportReportingSystem from "@/components/admin/admin-dashboard-export-reporting-system";
import {
  Activity,
  Users,
  Bell,
  AlertTriangle,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  MonitorSpeaker,
  Grid3X3,
} from "lucide-react";

interface ResponsiveDemoModule {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  mobileOptimized: boolean;
  tabletOptimized: boolean;
  desktopOptimized: boolean;
}

export default function AdminDashboardResponsiveDemoPage() {
  // Mock admin status for demo
  const isAdmin = true;
  const isLoading = false;
  const [activeModule, setActiveModule] = useState("overview");
  const [viewportSimulation, setViewportSimulation] = useState<
    "auto" | "mobile" | "tablet" | "desktop"
  >("auto");

  // Demo modules showcasing responsive features
  const responsiveModules: ResponsiveDemoModule[] = [
    {
      id: "overview",
      title: "Responsive Overview",
      description: "Dashboard overview optimized for all screen sizes",
      mobileOptimized: true,
      tabletOptimized: true,
      desktopOptimized: true,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-cyan-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">99.8%</div>
                    <div className="text-sm text-cyan-400">Uptime</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">1,247</div>
                    <div className="text-sm text-green-400">Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">85ms</div>
                    <div className="text-sm text-purple-400">Response Time</div>
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
                    <div className="text-sm text-yellow-400">Active Alerts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-cyan-500/20 bg-cyan-500/10">
            <Monitor className="h-4 w-4" />
            <AlertDescription className="text-cyan-300">
              This overview adapts to your screen size. Try resizing your
              browser window to see the responsive behavior!
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "mobile-features",
      title: "Mobile-First Features",
      description: "Touch-optimized controls and mobile navigation",
      mobileOptimized: true,
      tabletOptimized: true,
      desktopOptimized: false,
      component: (
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                Mobile Navigation Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                  <h4 className="text-white font-semibold mb-2">
                    Touch-Friendly Controls
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="lg"
                      className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/20"
                    >
                      Large Touch Target
                    </Button>
                    <Button
                      size="lg"
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/20"
                    >
                      Accessible Button
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                  <h4 className="text-white font-semibold mb-2">
                    Swipe Navigation
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Mobile-optimized navigation with drawer overlay and tab
                    scrolling for easy one-handed operation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "tablet-layout",
      title: "Tablet Optimization",
      description: "Balanced layout for tablet devices",
      mobileOptimized: false,
      tabletOptimized: true,
      desktopOptimized: true,
      component: (
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tablet className="w-5 h-5 text-purple-400" />
                Tablet Layout Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-900/50">
                  <h4 className="text-white font-semibold mb-2">
                    Two-Column Layout
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Optimized for tablet portrait and landscape orientations.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-900/50">
                  <h4 className="text-white font-semibold mb-2">
                    Adaptive Widgets
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Widgets resize intelligently based on available space.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "desktop-features",
      title: "Desktop Power Features",
      description: "Full-featured desktop experience",
      mobileOptimized: false,
      tabletOptimized: false,
      desktopOptimized: true,
      component: (
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-green-400" />
                Desktop Advanced Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-900/50">
                  <h4 className="text-white font-semibold mb-2">Drag & Drop</h4>
                  <p className="text-slate-400 text-sm">
                    Customizable widget positioning with drag and drop support.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-900/50">
                  <h4 className="text-white font-semibold mb-2">
                    Multi-Column
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Up to 4-column layout for maximum information density.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-900/50">
                  <h4 className="text-white font-semibold mb-2">
                    Advanced Controls
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Hover effects, keyboard shortcuts, and context menus.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "export-reporting",
      title: "Export & Reporting",
      description: "Mobile-responsive export and reporting interface",
      mobileOptimized: true,
      tabletOptimized: true,
      desktopOptimized: true,
      component: <AdminDashboardExportReportingSystem />,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white">Loading Responsive Demo...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
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

  const currentModule =
    responsiveModules.find(m => m.id === activeModule) || responsiveModules[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Demo Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Responsive Admin Dashboard Demo
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2">
              Modular, mobile-responsive UI with customizable widgets - Task
              82.10
            </p>
          </div>

          {/* Viewport Simulation Controls */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Simulate:</span>
            <div className="flex gap-1">
              <Button
                variant={viewportSimulation === "auto" ? "default" : "outline"}
                size="sm"
                className={
                  viewportSimulation === "auto"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                    : "bg-slate-800/50 border-slate-700 text-slate-300"
                }
                onClick={() => setViewportSimulation("auto")}
              >
                Auto
              </Button>
              <Button
                variant={
                  viewportSimulation === "mobile" ? "default" : "outline"
                }
                size="sm"
                className={
                  viewportSimulation === "mobile"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                    : "bg-slate-800/50 border-slate-700 text-slate-300"
                }
                onClick={() => setViewportSimulation("mobile")}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
              <Button
                variant={
                  viewportSimulation === "tablet" ? "default" : "outline"
                }
                size="sm"
                className={
                  viewportSimulation === "tablet"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                    : "bg-slate-800/50 border-slate-700 text-slate-300"
                }
                onClick={() => setViewportSimulation("tablet")}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={
                  viewportSimulation === "desktop" ? "default" : "outline"
                }
                size="sm"
                className={
                  viewportSimulation === "desktop"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                    : "bg-slate-800/50 border-slate-700 text-slate-300"
                }
                onClick={() => setViewportSimulation("desktop")}
              >
                <Laptop className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Responsive Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="text-lg font-bold text-white">
                    Mobile-First
                  </div>
                  <div className="text-sm text-cyan-400">Touch-optimized</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Grid3X3 className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-lg font-bold text-white">Modular</div>
                  <div className="text-sm text-purple-400">
                    Customizable widgets
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MonitorSpeaker className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-lg font-bold text-white">Adaptive</div>
                  <div className="text-sm text-green-400">All screen sizes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Content using Responsive Layout */}
        <ResponsiveAdminLayout>
          <Tabs
            value={activeModule}
            onValueChange={setActiveModule}
            className="space-y-6"
          >
            <TabsList className="bg-slate-800/50 border border-slate-700 w-full justify-start overflow-x-auto">
              {responsiveModules.map(module => (
                <TabsTrigger
                  key={module.id}
                  value={module.id}
                  className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 flex-shrink-0"
                >
                  <div className="flex items-center gap-2">
                    <span>{module.title}</span>
                    <div className="flex gap-1">
                      {module.mobileOptimized && (
                        <Smartphone className="w-3 h-3 text-cyan-400" />
                      )}
                      {module.tabletOptimized && (
                        <Tablet className="w-3 h-3 text-purple-400" />
                      )}
                      {module.desktopOptimized && (
                        <Laptop className="w-3 h-3 text-green-400" />
                      )}
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {responsiveModules.map(module => (
              <TabsContent
                key={module.id}
                value={module.id}
                className="space-y-6"
              >
                <Card className="bg-slate-800/30 border-slate-700">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-white">
                          {module.title}
                        </CardTitle>
                        <p className="text-slate-400 text-sm mt-1">
                          {module.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {module.mobileOptimized && (
                          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                            <Smartphone className="w-3 h-3 mr-1" />
                            Mobile
                          </Badge>
                        )}
                        {module.tabletOptimized && (
                          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                            <Tablet className="w-3 h-3 mr-1" />
                            Tablet
                          </Badge>
                        )}
                        {module.desktopOptimized && (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            <Laptop className="w-3 h-3 mr-1" />
                            Desktop
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>{module.component}</CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </ResponsiveAdminLayout>

        {/* Implementation Notes */}
        <div className="mt-8 p-4 rounded-lg bg-gray-800/50 border border-gray-600">
          <p className="text-xs text-gray-400">
            <strong>Task Master Context:</strong> Task 82.10 - Design Modular,
            Mobile-Responsive UI | Part of Integrated Admin Dashboard (Master
            Command Center) | Implements responsive breakpoints, customizable
            widgets, mobile navigation, and progressive disclosure
          </p>
        </div>
      </div>
    </div>
  );
}
