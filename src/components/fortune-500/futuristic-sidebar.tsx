"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Brain,
  Workflow,
  Rocket,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Share2,
  Search,
  Calendar,
  ListTodo,
  Settings,
  Home,
} from "lucide-react";
import { useAccessTier } from "@/hooks/use-access-tier";
import {
  MarketingRBAC,
  type MarketingRoleType,
} from "@/lib/rbac/marketing-rbac";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole?: MarketingRoleType;
}

const navigationItems = [
  {
    id: "overview",
    label: "Command Center",
    icon: Home,
    color: "from-cyan-500 to-blue-500",
    description: "Marketing Command Center",
    permissions: { resource: "campaigns", action: "view" },
    tier: "free",
  },
  {
    id: "social-accounts",
    label: "Social Accounts",
    icon: Share2,
    color: "from-blue-500 to-cyan-500",
    description: "Social Media Management",
    permissions: { resource: "campaigns", action: "manage" },
    tier: "starter",
  },
  {
    id: "research",
    label: "Research",
    icon: Search,
    color: "from-purple-500 to-pink-500",
    description: "Market Research & Insights",
    permissions: { resource: "analytics", action: "view" },
    tier: "professional",
  },
  {
    id: "workflow-control",
    label: "WorkFlow Control",
    icon: Workflow,
    color: "from-violet-500 to-purple-500",
    description: "Process Automation & Control",
    permissions: { resource: "campaigns", action: "manage" },
    tier: "professional",
  },
  {
    id: "tasklist",
    label: "Tasklist",
    icon: ListTodo,
    color: "from-green-500 to-emerald-500",
    description: "ClickUp Content Workflow",
    permissions: { resource: "content", action: "edit" },
    tier: "starter",
  },
  {
    id: "agenda-planning",
    label: "Agenda/Planning",
    icon: Calendar,
    color: "from-orange-500 to-red-500",
    description: "Schedule & Content Planning",
    permissions: { resource: "schedule", action: "edit" },
    tier: "starter",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    color: "from-purple-500 to-pink-500",
    description: "Performance Analytics",
    permissions: { resource: "analytics", action: "view" },
    tier: "professional",
  },
  {
    id: "marketing-intel",
    label: "Marketing/Business Intel",
    icon: Brain,
    color: "from-indigo-500 to-blue-500",
    description: "AI-Powered Marketing Intelligence",
    permissions: { resource: "roi_data", action: "view" },
    tier: "enterprise",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    color: "from-slate-500 to-gray-500",
    description: "API Configuration & Settings",
    permissions: { resource: "analytics", action: "view" },
    tier: "free",
  },
];

export default function FuturisticSidebar({
  isCollapsed,
  onToggleCollapse,
  activeSection,
  onSectionChange,
  userRole = "marketing_manager",
}: SidebarProps) {
  const { currentTier } = useAccessTier();
  const router = useRouter();

  // Check if in demo mode via URL parameter
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get("demo");
    setIsDemoMode(demoParam === "true");
  }, []);

  // Override userRole to admin in demo mode
  const effectiveUserRole: MarketingRoleType = isDemoMode ? "admin" : userRole;

  // Filter navigation items based on permissions and tier access
  const filteredNavigationItems = navigationItems.filter(item => {
    // Check RBAC permissions
    const hasRBACPermission = MarketingRBAC.hasPermission(
      effectiveUserRole,
      item.permissions.resource as any,
      item.permissions.action as any
    );

    // Check tier access (simplified tier comparison)
    const tierLevels = { free: 0, starter: 1, professional: 2, enterprise: 3 };
    const currentTierLevel =
      tierLevels[currentTier as keyof typeof tierLevels] || 0;
    const requiredTierLevel =
      tierLevels[item.tier as keyof typeof tierLevels] || 0;
    const hasTierAccess = currentTierLevel >= requiredTierLevel;

    return hasRBACPermission && hasTierAccess;
  });

  const handleItemClick = (item: (typeof navigationItems)[0]) => {
    // Special handling for Settings - navigate to dedicated settings page
    if (item.id === "settings") {
      router.push("/nl/settings");
      return;
    }

    // For all other items, use internal section change
    onSectionChange(item.id);
  };

  return (
    <motion.div
      className={cn(
        "relative h-screen bg-gradient-to-b from-black via-slate-900 to-black",
        "border-r border-cyan-500/20 overflow-hidden"
      )}
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 280,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="relative z-10 p-4 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-cyan-400">COMMAND</h1>
                  <p className="text-xs text-slate-400">NEURAL INTERFACE</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/20 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 p-4 space-y-2">
        {filteredNavigationItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                "relative w-full p-3 rounded-xl transition-all duration-300 group",
                "bg-transparent hover:bg-slate-800/30",
                "border border-transparent hover:border-cyan-500/30",
                isActive &&
                  "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
                      : "bg-slate-800/50 group-hover:bg-slate-700/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive
                        ? "text-cyan-400"
                        : "text-slate-400 group-hover:text-slate-300"
                    )}
                  />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div
                      className={cn(
                        "font-medium transition-colors",
                        isActive
                          ? "text-white"
                          : "text-slate-300 group-hover:text-white"
                      )}
                    >
                      {item.label}
                    </div>
                    <div
                      className={cn(
                        "text-xs transition-colors",
                        isActive
                          ? "text-cyan-300/70"
                          : "text-slate-500 group-hover:text-slate-400"
                      )}
                    >
                      {item.description}
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
