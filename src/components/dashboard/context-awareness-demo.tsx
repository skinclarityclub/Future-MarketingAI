"use client";

import React, { useState } from "react";
import {
  useDashboardMode,
  useModeConfig,
  useComponentAdaptation,
  type DashboardMode,
} from "@/lib/contexts/dashboard-mode-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  Settings,
  BarChart3,
  Layers,
  Refresh,
  Monitor,
  Palette,
  Clock,
  CheckCircle,
  Info,
  Play,
  ArrowRight,
} from "lucide-react";

export function ContextAwarenessDemo() {
  const { currentMode, setMode, isTransitioning } = useDashboardMode();
  const modeConfig = useModeConfig();
  const kpiAdaptation = useComponentAdaptation("kpi-cards");
  const chartAdaptation = useComponentAdaptation("chart-widgets");
  const tableAdaptation = useComponentAdaptation("data-tables");
  const [demoMode, setDemoMode] = useState<
    "overview" | "technical" | "interactive"
  >("overview");

  const getModeColor = (mode: DashboardMode) => {
    switch (mode) {
      case "finance":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "marketing":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      default:
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  const handleModeSwitch = (mode: DashboardMode) => {
    if (mode !== currentMode) {
      setMode(mode);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card className="border-slate-800/50 bg-gradient-to-br from-slate-950/50 to-slate-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Context-Aware Components Demo
              </CardTitle>
              <p className="text-slate-400 mt-1">
                Explore how components adapt their behavior, styling, and
                content based on dashboard mode
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getModeColor(currentMode)}>
                Current: {modeConfig.label}
              </Badge>
              {isTransitioning && (
                <Badge variant="secondary" className="animate-pulse">
                  Transitioning...
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={demoMode}
            onValueChange={value => setDemoMode(value as typeof demoMode)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="interactive">Interactive</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Visual Adaptation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Primary Color</span>
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: modeConfig.primaryColor }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Accent Color</span>
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: modeConfig.accentColor }}
                        />
                      </div>
                      <div className="text-xs text-slate-400">
                        Components automatically adopt mode-specific color
                        schemes
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Behavioral Changes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Chart Type</span>
                        <Badge variant="outline" className="text-xs">
                          {modeConfig.componentPreferences.chartType}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Layout</span>
                        <Badge variant="outline" className="text-xs">
                          {modeConfig.componentPreferences.preferredLayout}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        Components adapt their behavior based on mode
                        preferences
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-700/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Content Adaptation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="text-slate-400">Active Features:</span>
                        <div className="mt-1 space-y-1">
                          {modeConfig.features.slice(0, 3).map(feature => (
                            <div
                              key={feature}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="capitalize">
                                {feature.replace("-", " ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Component Adaptations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">KPI Cards</span>
                          <Badge variant="outline" className="text-xs">
                            {kpiAdaptation.variant}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div>Priority: {kpiAdaptation.priority}</div>
                          <div>
                            Visibility:{" "}
                            {kpiAdaptation.visibility ? "Shown" : "Hidden"}
                          </div>
                          <div>
                            Props:{" "}
                            {Object.keys(kpiAdaptation.customProps).join(
                              ", "
                            ) || "None"}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            Chart Widgets
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {chartAdaptation.variant}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div>Priority: {chartAdaptation.priority}</div>
                          <div>
                            Visibility:{" "}
                            {chartAdaptation.visibility ? "Shown" : "Hidden"}
                          </div>
                          <div>
                            Props:{" "}
                            {Object.keys(chartAdaptation.customProps).join(
                              ", "
                            ) || "None"}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            Data Tables
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {tableAdaptation.variant}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div>Priority: {tableAdaptation.priority}</div>
                          <div>
                            Visibility:{" "}
                            {tableAdaptation.visibility ? "Shown" : "Hidden"}
                          </div>
                          <div>
                            Props:{" "}
                            {Object.keys(tableAdaptation.customProps).join(
                              ", "
                            ) || "None"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Performance Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Refresh Interval</span>
                        <span className="text-slate-400">
                          {modeConfig.componentPreferences.dataRefreshInterval /
                            1000}
                          s
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max Items</span>
                        <span className="text-slate-400">
                          {modeConfig.componentPreferences.maxVisibleItems}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Real-time Updates</span>
                        <span className="text-slate-400">
                          {modeConfig.componentPreferences.enableRealTimeUpdates
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Advanced Metrics</span>
                        <span className="text-slate-400">
                          {modeConfig.componentPreferences.showAdvancedMetrics
                            ? "Shown"
                            : "Hidden"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Implementation Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs text-slate-400">
                    <p>• Context preservation across mode transitions</p>
                    <p>
                      • Automatic component styling based on mode configuration
                    </p>
                    <p>• Dynamic behavior adaptation using React hooks</p>
                    <p>• Smooth animations during mode switching</p>
                    <p>• Type-safe configuration with TypeScript</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interactive Tab */}
            <TabsContent value="interactive" className="space-y-4 mt-4">
              <Card className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Interactive Mode Switching
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">
                    Click the buttons below to see how components adapt in
                    real-time
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(
                      ["executive", "finance", "marketing"] as DashboardMode[]
                    ).map(mode => (
                      <NormalButton
                        key={mode}
                        variant={currentMode === mode ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleModeSwitch(mode)}
                        disabled={isTransitioning}
                        className={`${currentMode === mode ? getModeColor(mode) : ""} transition-all`}
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        {mode === "executive"
                          ? "Executive Overview"
                          : mode === "finance"
                            ? "Financial BI"
                            : "Marketing Automation"}
                      </NormalButton>
                    ))}
                  </div>

                  {isTransitioning && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="h-4 w-4 animate-spin" />
                        Transitioning to {currentMode} mode...
                      </div>
                      <Progress value={75} className="h-1" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <Card className="border-slate-600/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs">Current Mode</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm font-medium capitalize">
                          {currentMode}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {modeConfig.description}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-600/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs">
                          Active Features
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs space-y-1">
                          {modeConfig.features.slice(0, 2).map(feature => (
                            <div
                              key={feature}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-2 w-2 text-green-500" />
                              <span className="capitalize">
                                {feature.replace("-", " ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-600/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs">
                          Chart Preference
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm font-medium capitalize">
                          {modeConfig.componentPreferences.chartType}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {modeConfig.componentPreferences.preferredLayout}{" "}
                          layout
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContextAwarenessDemo;
