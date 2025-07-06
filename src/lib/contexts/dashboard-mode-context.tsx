"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { usePathname, useRouter } from "next/navigation";

export type DashboardMode =
  | "executive"
  | "finance"
  | "marketing"
  | "admin"
  | "research";

// Enhanced mode configuration for context-aware components
export interface ModeConfiguration {
  id: DashboardMode;
  label: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  features: string[];
  defaultMetrics: string[];
  navigationStructure: NavigationItem[];
  componentPreferences: ComponentPreferences;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  priority: number;
  requiredRole?: string[];
}

export interface ComponentPreferences {
  chartType: "line" | "bar" | "area" | "combo";
  dataRefreshInterval: number; // in milliseconds
  defaultViewPeriod: "7d" | "30d" | "90d" | "1y";
  showAdvancedMetrics: boolean;
  enableRealTimeUpdates: boolean;
  preferredLayout: "grid" | "list" | "cards";
  maxVisibleItems: number;
}

interface DashboardModeContextType {
  currentMode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
  isLoading: boolean;
  modeConfig: ModeConfiguration;
  isTransitioning: boolean;
  contextData: ContextData;
  updateContextData: (data: Partial<ContextData>) => void;
  getComponentConfig: (componentId: string) => ComponentAdaptation;
}

interface ContextData {
  userPreferences: Record<string, any>;
  sessionData: Record<string, any>;
  lastActiveTime: Date;
  moduleStates: Record<string, any>;
  customSettings: Record<string, any>;
}

interface ComponentAdaptation {
  variant: string;
  priority: number;
  visibility: boolean;
  customProps: Record<string, any>;
}

const DashboardModeContext = createContext<
  DashboardModeContextType | undefined
>(undefined);

// Enhanced mode configurations
const MODE_CONFIGURATIONS: Record<DashboardMode, ModeConfiguration> = {
  executive: {
    id: "executive",
    label: "Executive Overview",
    description: "High-level KPIs and strategic insights",
    primaryColor: "#10b981", // emerald-500
    accentColor: "#065f46", // emerald-800
    gradientFrom: "#ecfdf5", // emerald-50
    gradientTo: "#a7f3d0", // emerald-200
    icon: "briefcase",
    features: [
      "strategic-kpis",
      "executive-reports",
      "trend-analysis",
      "forecasting",
    ],
    defaultMetrics: ["revenue", "profit", "growth", "efficiency"],
    navigationStructure: [
      {
        id: "overview",
        label: "Overview",
        href: "/",
        icon: "layout-dashboard",
        priority: 1,
      },
      {
        id: "reports",
        label: "Reports",
        href: "/reports-center",
        icon: "file-text",
        priority: 2,
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/analytics",
        icon: "bar-chart",
        priority: 3,
      },
    ],
    componentPreferences: {
      chartType: "combo",
      dataRefreshInterval: 30000,
      defaultViewPeriod: "30d",
      showAdvancedMetrics: true,
      enableRealTimeUpdates: true,
      preferredLayout: "grid",
      maxVisibleItems: 6,
    },
  },
  finance: {
    id: "finance",
    label: "Financial BI",
    description: "Detailed financial analytics and reporting",
    primaryColor: "#3b82f6", // blue-500
    accentColor: "#1e40af", // blue-800
    gradientFrom: "#eff6ff", // blue-50
    gradientTo: "#bfdbfe", // blue-200
    icon: "building-2",
    features: [
      "financial-reports",
      "budget-tracking",
      "cash-flow",
      "forecasting",
    ],
    defaultMetrics: [
      "revenue",
      "expenses",
      "profit-margin",
      "cash-flow",
      "budget-variance",
    ],
    navigationStructure: [
      {
        id: "financial",
        label: "Overview",
        href: "/financial",
        icon: "trending-up",
        priority: 1,
      },
      {
        id: "revenue",
        label: "Revenue",
        href: "/revenue-analytics",
        icon: "dollar-sign",
        priority: 2,
      },
      {
        id: "budget",
        label: "Budget",
        href: "/budget",
        icon: "calculator",
        priority: 3,
      },
      {
        id: "cash-flow",
        label: "Cash Flow",
        href: "/cash-flow",
        icon: "arrow-up-down",
        priority: 4,
      },
    ],
    componentPreferences: {
      chartType: "line",
      dataRefreshInterval: 60000,
      defaultViewPeriod: "90d",
      showAdvancedMetrics: true,
      enableRealTimeUpdates: false,
      preferredLayout: "cards",
      maxVisibleItems: 8,
    },
  },
  marketing: {
    id: "marketing",
    label: "Marketing Automation",
    description: "Campaign management and marketing insights",
    primaryColor: "#8b5cf6", // purple-500
    accentColor: "#6d28d9", // purple-700
    gradientFrom: "#f5f3ff", // purple-50
    gradientTo: "#d8b4fe", // purple-200
    icon: "trending-up",
    features: [
      "campaign-management",
      "audience-insights",
      "content-performance",
      "automation",
    ],
    defaultMetrics: [
      "campaign-roi",
      "conversion-rate",
      "engagement",
      "lead-generation",
    ],
    navigationStructure: [
      {
        id: "marketing",
        label: "Overview",
        href: "/marketing",
        icon: "megaphone",
        priority: 1,
      },
      {
        id: "campaigns",
        label: "Campaigns",
        href: "/campaigns",
        icon: "target",
        priority: 2,
      },
      {
        id: "content",
        label: "Content",
        href: "/content",
        icon: "edit",
        priority: 3,
      },
      {
        id: "insights",
        label: "Insights",
        href: "/customer-insights",
        icon: "users",
        priority: 4,
      },
    ],
    componentPreferences: {
      chartType: "area",
      dataRefreshInterval: 15000,
      defaultViewPeriod: "7d",
      showAdvancedMetrics: false,
      enableRealTimeUpdates: true,
      preferredLayout: "grid",
      maxVisibleItems: 10,
    },
  },
  admin: {
    id: "admin",
    label: "Admin Dashboard",
    description: "System administration and management control center",
    primaryColor: "#dc2626", // red-600
    accentColor: "#b91c1c", // red-700
    gradientFrom: "#fef2f2", // red-50
    gradientTo: "#fecaca", // red-200
    icon: "shield",
    features: [
      "user-management",
      "system-monitoring",
      "configuration",
      "audit-logging",
    ],
    defaultMetrics: [
      "system-health",
      "active-users",
      "total-operations",
      "security-alerts",
    ],
    navigationStructure: [
      {
        id: "admin-dashboard",
        label: "Admin Dashboard",
        href: "/admin-dashboard",
        icon: "shield",
        priority: 1,
      },
      {
        id: "user-management",
        label: "User Management",
        href: "/admin-dashboard?tab=users",
        icon: "users",
        priority: 2,
      },
      {
        id: "system-health",
        label: "System Health",
        href: "/admin-dashboard?tab=health",
        icon: "activity",
        priority: 3,
      },
      {
        id: "configuration",
        label: "Configuration",
        href: "/admin-dashboard?tab=config",
        icon: "settings",
        priority: 4,
      },
      {
        id: "export-reports",
        label: "Export & Reports",
        href: "/admin-dashboard?tab=export",
        icon: "file-down",
        priority: 5,
      },
      {
        id: "audit-logs",
        label: "Audit Logs",
        href: "/admin-dashboard?tab=audit",
        icon: "file-text",
        priority: 6,
      },
    ],
    componentPreferences: {
      chartType: "combo",
      dataRefreshInterval: 5000, // 5 seconds for admin monitoring
      defaultViewPeriod: "7d",
      showAdvancedMetrics: true,
      enableRealTimeUpdates: true,
      preferredLayout: "grid",
      maxVisibleItems: 8,
    },
  },
  research: {
    id: "research",
    label: "Research Dashboard",
    description: "Market intelligence and competitive analysis",
    primaryColor: "#f97316", // orange-500
    accentColor: "#ea580c", // orange-600
    gradientFrom: "#fff7ed", // orange-50
    gradientTo: "#fed7aa", // orange-200
    icon: "search",
    features: [
      "market-intelligence",
      "competitive-analysis",
      "trend-analysis",
      "research-tools",
    ],
    defaultMetrics: [
      "research-completion",
      "trend-strength",
      "market-opportunities",
      "competitive-advantage",
    ],
    navigationStructure: [
      {
        id: "research-overview",
        label: "Research Overview",
        href: "/research",
        icon: "search",
        priority: 1,
      },
      {
        id: "trends",
        label: "Trend Analysis",
        href: "/research/trends",
        icon: "trending-up",
        priority: 2,
      },
      {
        id: "competitors",
        label: "Competitor Analysis",
        href: "/research/competitors",
        icon: "users",
        priority: 3,
      },
      {
        id: "insights",
        label: "Market Insights",
        href: "/research/insights",
        icon: "lightbulb",
        priority: 4,
      },
      {
        id: "data-mining",
        label: "Data Mining",
        href: "/research/data-mining",
        icon: "database",
        priority: 5,
      },
    ],
    componentPreferences: {
      chartType: "area",
      dataRefreshInterval: 30000, // 30 seconds for research data
      defaultViewPeriod: "30d",
      showAdvancedMetrics: true,
      enableRealTimeUpdates: true,
      preferredLayout: "grid",
      maxVisibleItems: 8,
    },
  },
};

// Mode route mappings - Updated for locale structure
const MODE_ROUTES: Record<DashboardMode, string> = {
  executive: "/executive-dashboard",
  finance: "/finance",
  marketing: "/marketing",
  admin: "/admin-dashboard",
  research: "/research",
};

const ROUTE_TO_MODE: Record<string, DashboardMode> = {
  "/": "executive", // Homepage stays as marketing landing
  "/executive-dashboard": "executive",
  "/finance": "finance",
  "/financial": "finance", // Legacy redirect
  "/revenue-analytics": "finance",
  "/budget": "finance",
  "/cash-flow": "finance",
  "/reports": "finance",
  "/marketing": "marketing",
  "/campaigns": "marketing",
  "/customer-insights": "marketing",
  "/content": "marketing",
  "/market-analysis": "marketing",
  "/research": "research", // Research intelligence
  "/admin-dashboard": "admin",
  "/command-center": "executive", // Command center maps to executive
  "/analytics": "executive", // Default shared to executive
  "/reports-center": "executive", // Default shared to executive
  "/calendar": "executive", // Default shared to executive
  "/settings": "executive", // Default shared to executive
  "/help": "executive", // Default shared to executive
};

// Component adaptation rules based on mode
const COMPONENT_ADAPTATIONS: Record<
  DashboardMode,
  Record<string, ComponentAdaptation>
> = {
  executive: {
    "kpi-cards": {
      variant: "compact",
      priority: 1,
      visibility: true,
      customProps: { showTrends: true },
    },
    "chart-widgets": {
      variant: "summary",
      priority: 2,
      visibility: true,
      customProps: { timeframe: "month" },
    },
    "data-tables": {
      variant: "minimal",
      priority: 3,
      visibility: false,
      customProps: {},
    },
    "analytics-panel": {
      variant: "strategic",
      priority: 1,
      visibility: true,
      customProps: { focus: "growth" },
    },
  },
  finance: {
    "kpi-cards": {
      variant: "detailed",
      priority: 1,
      visibility: true,
      customProps: { showVariance: true },
    },
    "chart-widgets": {
      variant: "detailed",
      priority: 1,
      visibility: true,
      customProps: { timeframe: "quarter" },
    },
    "data-tables": {
      variant: "full",
      priority: 2,
      visibility: true,
      customProps: { exportable: true },
    },
    "analytics-panel": {
      variant: "financial",
      priority: 2,
      visibility: true,
      customProps: { focus: "performance" },
    },
  },
  marketing: {
    "kpi-cards": {
      variant: "campaign-focused",
      priority: 2,
      visibility: true,
      customProps: { showConversion: true },
    },
    "chart-widgets": {
      variant: "engagement",
      priority: 1,
      visibility: true,
      customProps: { timeframe: "week" },
    },
    "data-tables": {
      variant: "campaigns",
      priority: 3,
      visibility: true,
      customProps: { filterable: true },
    },
    "analytics-panel": {
      variant: "audience",
      priority: 1,
      visibility: true,
      customProps: { focus: "engagement" },
    },
  },
  admin: {
    "kpi-cards": {
      variant: "admin-focused",
      priority: 1,
      visibility: true,
      customProps: { showSystemStats: true, refreshRate: 5000 },
    },
    "chart-widgets": {
      variant: "system-monitoring",
      priority: 1,
      visibility: true,
      customProps: { timeframe: "day", showAlerts: true },
    },
    "data-tables": {
      variant: "admin-panel",
      priority: 2,
      visibility: true,
      customProps: { actionable: true, sortable: true, exportable: true },
    },
    "analytics-panel": {
      variant: "system-admin",
      priority: 1,
      visibility: true,
      customProps: { focus: "administration", showSecurity: true },
    },
  },
  research: {
    "kpi-cards": {
      variant: "research-focused",
      priority: 1,
      visibility: true,
      customProps: { showTrends: true, refreshRate: 30000 },
    },
    "chart-widgets": {
      variant: "market-analysis",
      priority: 1,
      visibility: true,
      customProps: { timeframe: "month", showConfidence: true },
    },
    "data-tables": {
      variant: "insights",
      priority: 2,
      visibility: true,
      customProps: { filterable: true, sortable: true },
    },
    "analytics-panel": {
      variant: "market-intelligence",
      priority: 1,
      visibility: true,
      customProps: { focus: "research", showOpportunities: true },
    },
  },
};

interface DashboardModeProviderProps {
  children: ReactNode;
}

export function DashboardModeProvider({
  children,
}: DashboardModeProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<DashboardMode>("executive");
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contextData, setContextData] = useState<ContextData>({
    userPreferences: {},
    sessionData: {},
    lastActiveTime: new Date(),
    moduleStates: {},
    customSettings: {},
  });

  // Memoized mode configuration
  const modeConfig = useMemo(() => {
    return MODE_CONFIGURATIONS[currentMode];
  }, [currentMode]);

  // Detect mode from current route
  const getModeFromPath = (pathname: string): DashboardMode => {
    // Remove locale prefix (e.g., /nl/financial -> /financial)
    const basePath = pathname.replace(/^\/[a-z]{2}/, "") || "/";

    // Check exact match first
    if (ROUTE_TO_MODE[basePath]) {
      return ROUTE_TO_MODE[basePath];
    }

    // Check if path starts with any known route
    for (const [route, mode] of Object.entries(ROUTE_TO_MODE)) {
      if (route !== "/" && basePath.startsWith(route)) {
        return mode;
      }
    }

    return "executive";
  };

  // Update mode when pathname changes
  useEffect(() => {
    const newMode = getModeFromPath(pathname);
    if (newMode !== currentMode) {
      setIsTransitioning(true);
      setCurrentMode(newMode);

      // Preserve context during mode transition
      setContextData(prev => ({
        ...prev,
        lastActiveTime: new Date(),
        moduleStates: {
          ...prev.moduleStates,
          [`${currentMode}_lastState`]: prev.moduleStates,
        },
      }));

      // Simulate transition delay for smooth UX
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
    setIsLoading(false);
  }, [pathname, currentMode]);

  const setMode = (mode: DashboardMode) => {
    if (mode !== currentMode) {
      setIsTransitioning(true);
      setCurrentMode(mode);

      // Preserve context data when switching modes
      setContextData(prev => ({
        ...prev,
        lastActiveTime: new Date(),
        moduleStates: {
          ...prev.moduleStates,
          [`${currentMode}_state`]: {
            timestamp: Date.now(),
            preferences: prev.userPreferences,
          },
        },
      }));

      // Navigate to the main dashboard for the selected mode
      const targetRoute = MODE_ROUTES[mode];
      const currentLocale = pathname.split("/")[1];
      const newPath =
        currentLocale && currentLocale.length === 2
          ? `/${currentLocale}${targetRoute === "/" ? "" : targetRoute}`
          : targetRoute;

      router.push(newPath);
    }
  };

  const updateContextData = (data: Partial<ContextData>) => {
    setContextData(prev => ({
      ...prev,
      ...data,
      lastActiveTime: new Date(),
    }));
  };

  const getComponentConfig = (componentId: string): ComponentAdaptation => {
    return (
      COMPONENT_ADAPTATIONS[currentMode]?.[componentId] || {
        variant: "default",
        priority: 5,
        visibility: true,
        customProps: {},
      }
    );
  };

  const value: DashboardModeContextType = {
    currentMode,
    setMode,
    isLoading,
    modeConfig,
    isTransitioning,
    contextData,
    updateContextData,
    getComponentConfig,
  };

  return (
    <DashboardModeContext.Provider value={value}>
      {children}
    </DashboardModeContext.Provider>
  );
}

export function useDashboardMode() {
  const context = useContext(DashboardModeContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardMode must be used within a DashboardModeProvider"
    );
  }
  return context;
}

// Utility hooks for context-aware components
export function useModeConfig() {
  const { modeConfig } = useDashboardMode();
  return modeConfig;
}

export function useComponentAdaptation(componentId: string) {
  const { getComponentConfig } = useDashboardMode();
  return getComponentConfig(componentId);
}

export function useModeTransition() {
  const { isTransitioning } = useDashboardMode();
  return { isTransitioning };
}

export { MODE_ROUTES, ROUTE_TO_MODE, MODE_CONFIGURATIONS };
