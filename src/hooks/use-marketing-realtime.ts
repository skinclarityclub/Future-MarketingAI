"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  RealTimeMetrics,
  WorkflowExecution,
  QueueItem,
  Alert,
  PlatformStatus,
  Platform,
  ControlCenterState,
} from "@/lib/types/marketing-control-center";
import {
  getMockWebSocketManager,
  WebSocketManager,
} from "@/lib/realtime/websocket-manager";

// ====================================================================
// HOOK INTERFACE
// ====================================================================

interface UseMarketingRealtimeOptions {
  enableAutoConnect?: boolean;
  enableMockMode?: boolean;
  updateInterval?: number;
  maxRetries?: number;
}

interface UseMarketingRealtimeReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Data state
  metrics: RealTimeMetrics | null;
  workflows: WorkflowExecution[];
  queue: QueueItem[];
  alerts: Alert[];
  platformStatus: Record<Platform, PlatformStatus> | null;

  // Control methods
  connect: () => Promise<void>;
  disconnect: () => void;
  retry: () => Promise<void>;

  // Update counters (for animations)
  metricsUpdateCount: number;
  workflowsUpdateCount: number;
  queueUpdateCount: number;
  alertsUpdateCount: number;
}

// ====================================================================
// MAIN HOOK
// ====================================================================

export function useMarketingRealtime(
  options: UseMarketingRealtimeOptions = {}
): UseMarketingRealtimeReturn {
  const {
    enableAutoConnect = true,
    enableMockMode = process.env.NODE_ENV === "development",
    updateInterval = 5000,
    maxRetries = 5,
  } = options;

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Data state
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [platformStatus, setPlatformStatus] = useState<Record<
    Platform,
    PlatformStatus
  > | null>(null);

  // Update counters for animations
  const [metricsUpdateCount, setMetricsUpdateCount] = useState(0);
  const [workflowsUpdateCount, setWorkflowsUpdateCount] = useState(0);
  const [queueUpdateCount, setQueueUpdateCount] = useState(0);
  const [alertsUpdateCount, setAlertsUpdateCount] = useState(0);

  // Refs
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const retryCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ====================================================================
  // WEBSOCKET MANAGER SETUP
  // ====================================================================

  const initializeWebSocketManager = useCallback(() => {
    if (wsManagerRef.current) {
      return wsManagerRef.current;
    }

    const wsManager = enableMockMode
      ? getMockWebSocketManager({ enableLogging: true })
      : getMockWebSocketManager({ enableLogging: true }); // Use mock for now, replace with real WS later

    // Connection events
    wsManager.subscribeToConnection(connected => {
      setIsConnected(connected);
      setIsConnecting(false);

      if (connected) {
        setConnectionError(null);
        retryCountRef.current = 0;
      }
    });

    // Data subscriptions
    wsManager.subscribeToMetrics(newMetrics => {
      setMetrics(newMetrics);
      setMetricsUpdateCount(prev => prev + 1);
    });

    wsManager.subscribeToWorkflows(newWorkflows => {
      setWorkflows(newWorkflows);
      setWorkflowsUpdateCount(prev => prev + 1);
    });

    wsManager.subscribeToQueue(newQueue => {
      setQueue(newQueue);
      setQueueUpdateCount(prev => prev + 1);
    });

    wsManager.subscribeToAlerts(newAlerts => {
      // For alerts, we want to append new ones, not replace
      setAlerts(prev => {
        const existingIds = new Set(prev.map(alert => alert.id));
        const uniqueNewAlerts = Array.isArray(newAlerts)
          ? newAlerts.filter(alert => !existingIds.has(alert.id))
          : [newAlerts].filter(alert => !existingIds.has(alert.id));

        const combined = [...prev, ...uniqueNewAlerts];
        // Keep only the latest 10 alerts
        return combined.slice(-10);
      });
      setAlertsUpdateCount(prev => prev + 1);
    });

    wsManager.subscribeToPlatformStatus(newStatus => {
      setPlatformStatus(newStatus);
    });

    wsManagerRef.current = wsManager;
    return wsManager;
  }, [enableMockMode]);

  // ====================================================================
  // CONNECTION METHODS
  // ====================================================================

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const wsManager = initializeWebSocketManager();
      await wsManager.connect();
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      setConnectionError(
        error instanceof Error ? error.message : "Connection failed"
      );
      setIsConnecting(false);

      // Auto-retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const retryDelay = Math.min(
          1000 * Math.pow(2, retryCountRef.current),
          30000
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, retryDelay);
      }
    }
  }, [isConnecting, isConnected, initializeWebSocketManager, maxRetries]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
      wsManagerRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
    retryCountRef.current = 0;
  }, []);

  const retry = useCallback(async () => {
    disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
    await connect();
  }, [disconnect, connect]);

  // ====================================================================
  // EFFECTS
  // ====================================================================

  // Auto-connect on mount
  useEffect(() => {
    if (enableAutoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [enableAutoConnect]); // Only run on mount/unmount

  // Visibility change handling (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        !isConnected &&
        !isConnecting
      ) {
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isConnected, isConnecting, connect]);

  // ====================================================================
  // RETURN VALUE
  // ====================================================================

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,

    // Data state
    metrics,
    workflows,
    queue,
    alerts,
    platformStatus,

    // Control methods
    connect,
    disconnect,
    retry,

    // Update counters
    metricsUpdateCount,
    workflowsUpdateCount,
    queueUpdateCount,
    alertsUpdateCount,
  };
}

// ====================================================================
// ADDITIONAL HOOKS
// ====================================================================

/**
 * Hook for system health monitoring
 */
export function useSystemHealth() {
  const { metrics, platformStatus, isConnected, connectionError } =
    useMarketingRealtime();

  const systemHealth = useMemo(() => {
    if (!isConnected) {
      return {
        overall: "critical" as const,
        uptime: 0,
        apiConnectivity: {},
        databaseHealth: "down" as const,
        queueHealth: 0,
        errorRate: 100,
      };
    }

    const apiConnectivity: Record<string, boolean> = {};
    if (platformStatus) {
      Object.entries(platformStatus).forEach(([platform, status]) => {
        apiConnectivity[platform] = status.isConnected || false;
      });
    }

    return {
      overall: connectionError ? ("warning" as const) : ("healthy" as const),
      uptime: Date.now(),
      apiConnectivity,
      databaseHealth: "healthy" as const,
      queueHealth: metrics?.successRate || 95,
      errorRate: connectionError ? 5 : 2,
    };
  }, [isConnected, connectionError, metrics, platformStatus]);

  return systemHealth;
}

/**
 * Hook for specific metric tracking with change detection
 */
export function useMetricTracker(metricKey: keyof RealTimeMetrics) {
  const { metrics, metricsUpdateCount } = useMarketingRealtime();
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [change, setChange] = useState<{
    value: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    if (metrics && metrics[metricKey] !== undefined) {
      const currentValue = metrics[metricKey] as number;

      if (previousValue !== null && currentValue !== previousValue) {
        const changeValue = currentValue - previousValue;
        const changePercentage =
          previousValue > 0 ? (changeValue / previousValue) * 100 : 0;

        setChange({
          value: changeValue,
          percentage: changePercentage,
        });
      }

      setPreviousValue(currentValue);
    }
  }, [metrics, metricKey, previousValue, metricsUpdateCount]);

  return {
    currentValue: (metrics?.[metricKey] as number) || 0,
    previousValue,
    change,
    hasChanged: change !== null,
  };
}

/**
 * Hook for alert management with filtering
 */
export function useAlertManager(
  options: { maxAlerts?: number; filterSeverity?: string[] } = {}
) {
  const { alerts, alertsUpdateCount } = useMarketingRealtime();
  const { maxAlerts = 10, filterSeverity } = options;

  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    if (filterSeverity && filterSeverity.length > 0) {
      filtered = filtered.filter(alert =>
        filterSeverity.includes(alert.severity)
      );
    }

    return filtered
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, maxAlerts);
  }, [alerts, alertsUpdateCount, filterSeverity, maxAlerts]);

  const alertCounts = useMemo(() => {
    return alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        acc.total = (acc.total || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [alerts, alertsUpdateCount]);

  return {
    alerts: filteredAlerts,
    alertCounts,
    totalAlerts: alerts.length,
    hasNewAlerts: alertsUpdateCount > 0,
  };
}

// Helper function to create a complete ControlCenterState from real-time data
export function useControlCenterState(): ControlCenterState | null {
  const realtimeData = useMarketingRealtime();
  const systemHealth = useSystemHealth();

  return useMemo(() => {
    if (!realtimeData.metrics) {
      return null;
    }

    return {
      systemHealth,
      activeWorkflows: realtimeData.workflows,
      publishingQueue: realtimeData.queue,
      realTimeMetrics: realtimeData.metrics,
      platformStatus: realtimeData.platformStatus || {},
      activeAlerts: realtimeData.alerts,
      recentNotifications: [],
      selectedModule: undefined,
      activeFilters: {
        platforms: [],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        status: [],
        contentTypes: [],
        campaigns: [],
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      viewMode: "overview",
      lastUpdated: new Date(),
      autoRefresh: true,
      refreshInterval: 30000,
    };
  }, [realtimeData, systemHealth]);
}
