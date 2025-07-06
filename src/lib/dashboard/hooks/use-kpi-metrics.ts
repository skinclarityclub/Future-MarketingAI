"use client";

import { useState, useEffect, useCallback } from "react";
import { cachedApiCall, cacheKeys } from "../cache";

export interface KPIMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  trend: "up" | "down";
  icon: string;
  color: string;
  bgColor: string;
  period: string;
  lastUpdated: string;
}

export interface KPIResponse {
  metrics: KPIMetric[];
  lastUpdated: string;
  status: "success" | "error";
  message?: string;
}

interface UseKPIMetricsOptions {
  refetchInterval?: number; // in milliseconds, default 5 minutes
  enabled?: boolean;
}

interface UseKPIMetricsReturn {
  metrics: KPIMetric[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  lastUpdated: string | null;
  refetch: () => Promise<void>;
}

export function useKPIMetrics(
  options: UseKPIMetricsOptions = {}
): UseKPIMetricsReturn {
  const { refetchInterval = 5 * 60 * 1000, enabled = true } = options; // Default 5 minutes

  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsError(false);
      setError(null);

      // Use cached API call for performance
      const data = await cachedApiCall<KPIResponse>(
        cacheKeys.kpiMetrics(),
        async () => {
          const response = await fetch("/api/dashboard/kpi", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store", // Ensure fresh data from server
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const apiData: KPIResponse = await response.json();

          if (apiData.status === "error") {
            throw new Error(apiData.message || "Failed to fetch KPI metrics");
          }

          return apiData;
        },
        2 * 60 * 1000 // Cache for 2 minutes for faster updates
      );

      setMetrics(data.metrics);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      console.error("Error fetching KPI metrics:", err);
      setIsError(true);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchMetrics();
  }, [fetchMetrics]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchMetrics();
    }
  }, [fetchMetrics, enabled]);

  // Set up interval for real-time updates
  useEffect(() => {
    if (!enabled || refetchInterval <= 0) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [fetchMetrics, refetchInterval, enabled]);

  return {
    metrics,
    isLoading,
    isError,
    error,
    lastUpdated,
    refetch,
  };
}
