"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { UltraPremiumDashboardLayout } from "./ultra-premium-dashboard-layout";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Calendar,
  Activity,
  Share2,
  BarChart3,
  Send,
  CheckCircle,
  Monitor,
  AlertTriangle,
  Power,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useDashboardMode } from "@/lib/contexts/dashboard-mode-context";

interface ControlModule {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  status: "active" | "inactive" | "error";
  color: string;
  href: string;
}

const controlModules: ControlModule[] = [
  {
    id: "smart-scheduling",
    name: "Smart Scheduling",
    icon: Calendar,
    description: "AI-powered content scheduling",
    status: "active",
    color: "text-blue-400",
    href: "/marketing-automation?module=scheduling",
  },
  {
    id: "queue-processing",
    name: "Queue Processing",
    icon: Activity,
    description: "Real-time queue monitoring",
    status: "active",
    color: "text-green-400",
    href: "/marketing-automation?module=queue",
  },
  {
    id: "multi-platform",
    name: "Multi-Platform",
    icon: Share2,
    description: "Multi-platform management",
    status: "active",
    color: "text-purple-400",
    href: "/marketing-automation?module=platforms",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: BarChart3,
    description: "Performance analytics",
    status: "active",
    color: "text-amber-400",
    href: "/marketing-automation?module=analytics",
  },
  {
    id: "auto-publishing",
    name: "Auto Publishing",
    icon: Send,
    description: "Automated publishing control",
    status: "active",
    color: "text-cyan-400",
    href: "/marketing-automation?module=publishing",
  },
  {
    id: "approval-workflow",
    name: "Approval Workflow",
    icon: CheckCircle,
    description: "Content approval process",
    status: "inactive",
    color: "text-orange-400",
    href: "/marketing-automation?module=approval",
  },
  {
    id: "monitoring",
    name: "Real-time Monitoring",
    icon: Monitor,
    description: "Live system monitoring",
    status: "active",
    color: "text-emerald-400",
    href: "/marketing-automation?module=monitoring",
  },
  {
    id: "error-handling",
    name: "Error Handling",
    icon: AlertTriangle,
    description: "Error management",
    status: "error",
    color: "text-red-400",
    href: "/marketing-automation?module=errors",
  },
];

interface ControlCenterLayoutProps {
  children: React.ReactNode;
  currentModule?: string;
}

export function ControlCenterLayout({
  children,
  currentModule,
}: ControlCenterLayoutProps) {
  const [masterPower, setMasterPower] = useState(true);
  const { setMode } = useDashboardMode();

  const getStatusColor = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Control Center Sidebar */}
      <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 z-40">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Control Center</h1>
                <p className="text-sm text-gray-400">Marketing Automation</p>
              </div>
            </div>
          </div>

          {/* Master Control */}
          <div className="space-y-3">
            <NormalButton
              onClick={() => setMasterPower(!masterPower)}
              className={cn(
                "w-full h-10 font-semibold transition-all duration-300",
                masterPower
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
              )}
            >
              <Power className="w-4 h-4 mr-2" />
              {masterPower ? "Emergency Stop" : "Start System"}
            </NormalButton>
          </div>
        </div>

        {/* Control Modules */}
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Control Modules
          </h2>

          {controlModules.map(module => {
            const Icon = module.icon;
            const isActive = currentModule === module.id;

            return (
              <Link key={module.id} href={module.href}>
                <div
                  className={cn(
                    "group p-4 rounded-lg border transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-gray-800/80 border-amber-500/50 shadow-lg"
                      : "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg bg-gray-800",
                          isActive && "ring-2 ring-amber-500/50"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", module.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm mb-1">
                          {module.name}
                        </h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          getStatusColor(module.status)
                        )}
                      />
                      {isActive && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-600 text-white text-xs"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-80 pt-16">
        <UltraPremiumDashboardLayout showSidebar={false} fullWidth>
          {children}
        </UltraPremiumDashboardLayout>
      </div>
    </div>
  );
}
