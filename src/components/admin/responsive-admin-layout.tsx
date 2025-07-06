"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Menu,
  Shield,
  Activity,
  BarChart3,
  Settings,
  Database,
  Users,
  FileText,
  Bell,
  Monitor,
  Zap,
  AlertTriangle,
  CheckCircle,
  Grid3X3,
  Maximize2,
  Minimize2,
  Move,
  Eye,
  EyeOff,
  MoreVertical,
} from "lucide-react";

// ====================================================================
// TYPES & INTERFACES
// ====================================================================

interface DashboardWidget {
  id: string;
  title: string;
  type: "metric" | "chart" | "table" | "status" | "action";
  size: "sm" | "md" | "lg" | "xl";
  priority: "high" | "medium" | "low";
  mobileVisible: boolean;
  desktopVisible: boolean;
  position: { x: number; y: number };
  component: React.ReactNode;
  data?: any;
  status?: "operational" | "warning" | "critical";
}

interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  ultrawide: number;
}

interface LayoutConfiguration {
  widgets: DashboardWidget[];
  breakpoints: ResponsiveBreakpoints;
  mobileNavigation: "tabs" | "sidebar" | "drawer";
  customization: {
    allowDragDrop: boolean;
    allowWidgetToggle: boolean;
    allowSizeChange: boolean;
  };
}

// ====================================================================
// RESPONSIVE HOOKS
// ====================================================================

function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<
    "mobile" | "tablet" | "desktop" | "ultrawide"
  >("desktop");
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });

      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else if (width < 1440) {
        setBreakpoint("desktop");
      } else {
        setBreakpoint("ultrawide");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return { breakpoint, screenSize };
}

// ====================================================================
// WIDGET COMPONENTS
// ====================================================================

function MetricWidget({
  title,
  value,
  label,
  trend,
  icon,
  status = "operational",
  size = "md",
}: {
  title: string;
  value: string;
  label: string;
  trend?: "up" | "down" | "stable";
  icon: React.ReactNode;
  status?: "operational" | "warning" | "critical";
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const getStatusColor = () => {
    switch (status) {
      case "operational":
        return "from-green-500/10 to-emerald-500/10 border-green-500/20";
      case "warning":
        return "from-yellow-500/10 to-orange-500/10 border-yellow-500/20";
      case "critical":
        return "from-red-500/10 to-red-500/10 border-red-500/20";
      default:
        return "from-slate-500/10 to-slate-500/10 border-slate-500/20";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <Zap className="w-4 h-4 text-green-400" />;
      case "down":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "stable":
        return <CheckCircle className="w-4 h-4 text-slate-400" />;
      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        "bg-gradient-to-r border transition-all hover:shadow-lg",
        getStatusColor(),
        size === "sm" && "p-3",
        size === "lg" && "p-6"
      )}
    >
      <CardContent
        className={cn("p-4", size === "sm" && "p-3", size === "lg" && "p-6")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg bg-white/10",
                size === "sm" && "p-1",
                size === "lg" && "p-3"
              )}
            >
              {icon}
            </div>
            <div>
              <div
                className={cn(
                  "font-bold text-white",
                  size === "sm"
                    ? "text-lg"
                    : size === "lg"
                      ? "text-3xl"
                      : "text-2xl"
                )}
              >
                {value}
              </div>
              <div
                className={cn(
                  "text-slate-300",
                  size === "sm" ? "text-xs" : "text-sm"
                )}
              >
                {label}
              </div>
            </div>
          </div>
          {trend && getTrendIcon()}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusWidget({
  title,
  status,
  description,
  actions,
}: {
  title: string;
  status: "operational" | "warning" | "critical";
  description: string;
  actions?: React.ReactNode;
}) {
  const getStatusBadge = () => {
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
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">{title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-400 text-sm">{description}</p>
        {actions && <div className="flex gap-2">{actions}</div>}
      </CardContent>
    </Card>
  );
}

// ====================================================================
// MOBILE NAVIGATION COMPONENTS
// ====================================================================

function MobileDrawerNavigation({
  modules,
  activeModule,
  onModuleChange,
}: {
  modules: any[];
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden bg-slate-800/50 border-slate-700 text-white"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-slate-900 border-slate-700 p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Admin Modules</h2>
          <div className="space-y-2">
            {modules.map(module => (
              <Button
                key={module.id}
                variant={activeModule === module.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  activeModule === module.id
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                )}
                onClick={() => onModuleChange(module.id)}
              >
                <div className="mr-3">{module.icon}</div>
                {module.title}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ResponsiveTabNavigation({
  modules,
  activeModule,
  onModuleChange,
  breakpoint,
}: {
  modules: any[];
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  breakpoint: string;
}) {
  if (breakpoint === "mobile") {
    return (
      <div className="flex overflow-x-auto pb-2 gap-2">
        {modules.slice(0, 3).map(module => (
          <Button
            key={module.id}
            variant={activeModule === module.id ? "default" : "outline"}
            size="sm"
            className={cn(
              "shrink-0",
              activeModule === module.id
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                : "bg-slate-800/50 border-slate-700 text-slate-300"
            )}
            onClick={() => onModuleChange(module.id)}
          >
            <div className="mr-2">{module.icon}</div>
            <span className="hidden sm:inline">{module.title}</span>
          </Button>
        ))}
        <MobileDrawerNavigation
          modules={modules.slice(3)}
          activeModule={activeModule}
          onModuleChange={onModuleChange}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {modules.map(module => (
        <Button
          key={module.id}
          variant={activeModule === module.id ? "default" : "outline"}
          size="sm"
          className={cn(
            activeModule === module.id
              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
              : "bg-slate-800/50 border-slate-700 text-slate-300"
          )}
          onClick={() => onModuleChange(module.id)}
        >
          <div className="mr-2">{module.icon}</div>
          {module.title}
        </Button>
      ))}
    </div>
  );
}

// ====================================================================
// WIDGET GRID LAYOUT
// ====================================================================

function ResponsiveWidgetGrid({
  widgets,
  breakpoint,
  customization,
}: {
  widgets: DashboardWidget[];
  breakpoint: string;
  customization: LayoutConfiguration["customization"];
}) {
  const getGridCols = () => {
    switch (breakpoint) {
      case "mobile":
        return "grid-cols-1";
      case "tablet":
        return "grid-cols-2";
      case "desktop":
        return "grid-cols-3";
      case "ultrawide":
        return "grid-cols-4";
      default:
        return "grid-cols-2";
    }
  };

  const getVisibleWidgets = () => {
    return widgets.filter(widget => {
      if (breakpoint === "mobile") return widget.mobileVisible;
      return widget.desktopVisible;
    });
  };

  return (
    <div className={cn("grid gap-4 auto-rows-fr", getGridCols())}>
      {getVisibleWidgets().map(widget => (
        <div
          key={widget.id}
          className={cn(
            "relative group",
            widget.size === "lg" && breakpoint !== "mobile" && "col-span-2",
            widget.size === "xl" && breakpoint === "ultrawide" && "col-span-2"
          )}
        >
          {customization.allowDragDrop && (
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-slate-700/50 hover:bg-slate-700"
              >
                <Move className="w-3 h-3 text-slate-300" />
              </Button>
            </div>
          )}
          {widget.component}
        </div>
      ))}
    </div>
  );
}

// ====================================================================
// MAIN RESPONSIVE LAYOUT COMPONENT
// ====================================================================

interface ResponsiveAdminLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ResponsiveAdminLayout({
  children,
  className,
}: ResponsiveAdminLayoutProps) {
  const { breakpoint, screenSize } = useBreakpoint();
  const [activeModule, setActiveModule] = useState("overview");
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfiguration>({
    widgets: [],
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1440,
      ultrawide: 1920,
    },
    mobileNavigation: "tabs",
    customization: {
      allowDragDrop: true,
      allowWidgetToggle: true,
      allowSizeChange: true,
    },
  });

  // Mock admin modules
  const modules = [
    {
      id: "overview",
      title: "Overview",
      icon: <Monitor className="w-4 h-4" />,
      priority: "high",
    },
    {
      id: "system-health",
      title: "System Health",
      icon: <Activity className="w-4 h-4" />,
      priority: "high",
    },
    {
      id: "security",
      title: "Security",
      icon: <Shield className="w-4 h-4" />,
      priority: "high",
    },
    {
      id: "users",
      title: "Users",
      icon: <Users className="w-4 h-4" />,
      priority: "medium",
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      priority: "medium",
    },
    {
      id: "export",
      title: "Export",
      icon: <FileText className="w-4 h-4" />,
      priority: "low",
    },
  ];

  // Mock dashboard widgets
  const dashboardWidgets: DashboardWidget[] = [
    {
      id: "uptime",
      title: "System Uptime",
      type: "metric",
      size: "md",
      priority: "high",
      mobileVisible: true,
      desktopVisible: true,
      position: { x: 0, y: 0 },
      component: (
        <MetricWidget
          title="System Uptime"
          value="99.8%"
          label="Uptime"
          trend="stable"
          icon={<Monitor className="w-6 h-6 text-cyan-400" />}
          status="operational"
        />
      ),
    },
    {
      id: "active-users",
      title: "Active Users",
      type: "metric",
      size: "md",
      priority: "high",
      mobileVisible: true,
      desktopVisible: true,
      position: { x: 1, y: 0 },
      component: (
        <MetricWidget
          title="Active Users"
          value="1,247"
          label="Active Users"
          trend="up"
          icon={<Users className="w-6 h-6 text-purple-400" />}
          status="operational"
        />
      ),
    },
    {
      id: "security-status",
      title: "Security Status",
      type: "status",
      size: "lg",
      priority: "high",
      mobileVisible: true,
      desktopVisible: true,
      position: { x: 0, y: 1 },
      component: (
        <StatusWidget
          title="Security Status"
          status="operational"
          description="All security systems operational. No active threats detected."
          actions={
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              View Details
            </Button>
          }
        />
      ),
    },
    {
      id: "performance",
      title: "Performance",
      type: "metric",
      size: "md",
      priority: "medium",
      mobileVisible: false,
      desktopVisible: true,
      position: { x: 2, y: 0 },
      component: (
        <MetricWidget
          title="Performance"
          value="85ms"
          label="Avg Response"
          trend="stable"
          icon={<Zap className="w-6 h-6 text-yellow-400" />}
          status="warning"
        />
      ),
    },
  ];

  useEffect(() => {
    setLayoutConfig(prev => ({
      ...prev,
      widgets: dashboardWidgets,
    }));
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        className
      )}
    >
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Responsive Master Command Center
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Badge
              variant="outline"
              className="bg-slate-800/50 border-slate-700 text-slate-300"
            >
              {breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)}
            </Badge>
            <Badge
              variant="outline"
              className="bg-slate-800/50 border-slate-700 text-slate-300"
            >
              {screenSize.width}×{screenSize.height}
            </Badge>
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Live</span>
            </div>
          </div>
        </div>

        {/* Responsive Navigation */}
        <ResponsiveTabNavigation
          modules={modules}
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          breakpoint={breakpoint}
        />

        {/* Widget Grid */}
        <ResponsiveWidgetGrid
          widgets={layoutConfig.widgets}
          breakpoint={breakpoint}
          customization={layoutConfig.customization}
        />

        {/* Custom Children Content */}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
