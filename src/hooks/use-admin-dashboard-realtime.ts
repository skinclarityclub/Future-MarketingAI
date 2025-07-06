/**
 * useAdminDashboardRealtime Hook
 * React hook for consuming real-time admin dashboard data
 * Handles SSE connections, data subscriptions, and state management
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AdminDashboardSnapshot,
  AdminDashboardDataPoint,
  AdminDashboardAlert,
  DataSource,
  DataCategory,
} from "@/lib/realtime/admin-dashboard-data-aggregator";

export interface UseAdminDashboardRealtimeOptions {
  sources?: DataSource[];
  categories?: DataCategory[];
  enableSSE?: boolean;
  pollingInterval?: number;
  autoStart?: boolean;
}

export interface AdminDashboardRealtimeState {
  snapshot: AdminDashboardSnapshot | null;
  alerts: AdminDashboardAlert[];
  dataPoints: AdminDashboardDataPoint[];
  systemStatus: {
    isRunning: boolean;
    dataSourcesActive: number;
    subscriptionsActive: number;
    totalDataPoints: number;
    memoryUsageMB: number;
    alertsActive: number;
  } | null;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  lastUpdate: Date | null;
  error: string | null;
  isLoading: boolean;
}

export interface AdminDashboardRealtimeActions {
  connect: () => void;
  disconnect: () => void;
  acknowledgeAlert: (alertId: string) => Promise<boolean>;
  forceRefresh: () => Promise<void>;
  startAggregator: () => Promise<boolean>;
  stopAggregator: () => Promise<boolean>;
}

export function useAdminDashboardRealtime(
  options: UseAdminDashboardRealtimeOptions = {}
): AdminDashboardRealtimeState & AdminDashboardRealtimeActions {
  const {
    sources = [],
    categories = [],
    enableSSE = true,
    pollingInterval = 30000, // 30 seconds
    autoStart = true,
  } = options;

  // State management
  const [state, setState] = useState<AdminDashboardRealtimeState>({
    snapshot: null,
    alerts: [],
    dataPoints: [],
    systemStatus: null,
    connectionStatus: "disconnected",
    lastUpdate: null,
    error: null,
    isLoading: false,
  });

  // Refs for cleanup
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Update state helper
  const updateState = useCallback(
    (updates: Partial<AdminDashboardRealtimeState>) => {
      if (!isActiveRef.current) return;
      setState(prev => ({ ...prev, ...updates }));
    },
    []
  );

  // Fetch initial data
  const fetchSnapshot = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });

      const response = await fetch(
        "/api/admin-dashboard/realtime?action=snapshot"
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch snapshot");
      }

      updateState({
        snapshot: result.data,
        lastUpdate: new Date(),
        isLoading: false,
      });

      return result.data;
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      updateState({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
      throw error;
    }
  }, [updateState]);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/admin-dashboard/realtime?action=alerts"
      );
      const result = await response.json();

      if (response.ok && result.success) {
        updateState({ alerts: result.data });
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  }, [updateState]);

  // Fetch system status
  const fetchSystemStatus = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/admin-dashboard/realtime?action=system-status"
      );
      const result = await response.json();

      if (response.ok && result.success) {
        updateState({ systemStatus: result.data });
      }
    } catch (error) {
      console.error("Error fetching system status:", error);
    }
  }, [updateState]);

  // Setup SSE connection
  const setupSSEConnection = useCallback(() => {
    if (!enableSSE || eventSourceRef.current) return;

    updateState({ connectionStatus: "connecting" });

    const sourcesParam =
      sources.length > 0 ? `&sources=${sources.join(",")}` : "";
    const categoriesParam =
      categories.length > 0 ? `&categories=${categories.join(",")}` : "";

    const eventSource = new EventSource(
      `/api/admin-dashboard/realtime?action=sse${sourcesParam}${categoriesParam}`
    );

    eventSource.onopen = () => {
      console.log("📡 SSE connection established");
      updateState({ connectionStatus: "connected", error: null });
    };

    eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            console.log("📡 SSE client connected:", data.payload);
            break;

          case "data-update":
            updateState({
              dataPoints: data.payload,
              lastUpdate: new Date(data.timestamp),
            });
            break;

          case "snapshot-update":
            updateState({
              snapshot: data.payload,
              lastUpdate: new Date(data.timestamp),
            });
            break;

          case "ping":
            // Keep-alive ping, no action needed
            break;

          default:
            console.log("📡 Unknown SSE message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = error => {
      console.error("📡 SSE connection error:", error);
      updateState({
        connectionStatus: "error",
        error: "Real-time connection lost",
      });

      // Attempt to reconnect after delay
      if (isActiveRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isActiveRef.current) {
            eventSource.close();
            eventSourceRef.current = null;
            setupSSEConnection();
          }
        }, 5000);
      }
    };

    eventSourceRef.current = eventSource;
  }, [enableSSE, sources, categories, updateState]);

  // Setup polling fallback
  const setupPolling = useCallback(() => {
    if (enableSSE || pollingIntervalRef.current) return;

    const poll = async () => {
      if (!isActiveRef.current) return;

      try {
        await Promise.all([
          fetchSnapshot(),
          fetchAlerts(),
          fetchSystemStatus(),
        ]);
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Initial fetch
    poll();

    // Setup interval
    pollingIntervalRef.current = setInterval(poll, pollingInterval);
  }, [
    enableSSE,
    pollingInterval,
    fetchSnapshot,
    fetchAlerts,
    fetchSystemStatus,
  ]);

  // Connect to real-time data
  const connect = useCallback(() => {
    if (enableSSE) {
      setupSSEConnection();
    } else {
      setupPolling();
    }
  }, [enableSSE, setupSSEConnection, setupPolling]);

  // Disconnect from real-time data
  const disconnect = useCallback(() => {
    // Close SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    updateState({ connectionStatus: "disconnected" });
  }, [updateState]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(
    async (alertId: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/admin-dashboard/realtime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "acknowledge-alert",
            alertId,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Update local alerts state
          updateState({
            alerts: state.alerts.map(alert =>
              alert.id === alertId ? { ...alert, acknowledged: true } : alert
            ),
          });
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error acknowledging alert:", error);
        return false;
      }
    },
    [state.alerts, updateState]
  );

  // Force refresh all data
  const forceRefresh = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([fetchSnapshot(), fetchAlerts(), fetchSystemStatus()]);
    } catch (error) {
      console.error("Error during force refresh:", error);
      throw error;
    }
  }, [fetchSnapshot, fetchAlerts, fetchSystemStatus]);

  // Start aggregator
  const startAggregator = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin-dashboard/realtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start-aggregator" }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        updateState({ systemStatus: result.data });
        return true;
      }

      updateState({ error: result.error || "Failed to start aggregator" });
      return false;
    } catch (error) {
      console.error("Error starting aggregator:", error);
      updateState({ error: "Failed to start aggregator" });
      return false;
    }
  }, [updateState]);

  // Stop aggregator
  const stopAggregator = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin-dashboard/realtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop-aggregator" }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        updateState({ systemStatus: result.data });
        return true;
      }

      updateState({ error: result.error || "Failed to stop aggregator" });
      return false;
    } catch (error) {
      console.error("Error stopping aggregator:", error);
      updateState({ error: "Failed to stop aggregator" });
      return false;
    }
  }, [updateState]);

  // Initial setup and cleanup
  useEffect(() => {
    isActiveRef.current = true;

    if (autoStart) {
      connect();
    }

    return () => {
      isActiveRef.current = false;
      disconnect();
    };
  }, [autoStart, connect, disconnect]);

  // Reconnect when options change
  useEffect(() => {
    if (state.connectionStatus === "connected" && enableSSE) {
      disconnect();
      setTimeout(() => {
        if (isActiveRef.current) {
          connect();
        }
      }, 100);
    }
  }, [
    sources,
    categories,
    enableSSE,
    connect,
    disconnect,
    state.connectionStatus,
  ]);

  return {
    ...state,
    connect,
    disconnect,
    acknowledgeAlert,
    forceRefresh,
    startAggregator,
    stopAggregator,
  };
}

// ====================================================================
// SPECIALIZED HOOKS FOR SPECIFIC DATA
// ====================================================================

/**
 * Hook specifically for system health monitoring
 */
export function useSystemHealthRealtime() {
  return useAdminDashboardRealtime({
    sources: ["system_health", "infrastructure"],
    categories: ["cpu_usage", "memory_usage", "response_time", "uptime"],
  });
}

/**
 * Hook specifically for business metrics
 */
export function useBusinessMetricsRealtime() {
  return useAdminDashboardRealtime({
    sources: ["business_analytics"],
    categories: ["revenue", "conversions", "customer_count", "churn_rate"],
  });
}

/**
 * Hook specifically for workflow performance
 */
export function useWorkflowPerformanceRealtime() {
  return useAdminDashboardRealtime({
    sources: ["workflow_performance"],
    categories: ["workflow_success_rate", "execution_time", "queue_size"],
  });
}

/**
 * Hook specifically for security monitoring
 */
export function useSecurityMonitoringRealtime() {
  return useAdminDashboardRealtime({
    sources: ["security_compliance"],
    categories: ["auth_failures", "api_requests", "compliance_violations"],
  });
}

/**
 * Hook specifically for customer intelligence
 */
export function useCustomerIntelligenceRealtime() {
  return useAdminDashboardRealtime({
    sources: ["customer_intelligence"],
    categories: ["active_users", "support_tickets", "health_score"],
  });
}
