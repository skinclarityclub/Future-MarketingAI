"use client";

import React, { useMemo } from "react";
import { AlertCircle, Wifi, WifiOff, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useRealtimeChartData,
  ChartDataTransformer,
  REALTIME_CONFIGS,
  type RealtimeSubscriptionConfig,
} from "@/lib/data/real-time-data-service";
import {
  generateRevenueData,
  generatePerformanceData,
  generateCustomerData,
} from "@/lib/data/mock-chart-data";

interface RealtimeChartWrapperProps {
  chartType: "revenue" | "performance" | "customers" | "marketing";
  children: (
    data: any[],
    loading: boolean,
    error: string | null
  ) => React.ReactNode;
  title?: string;
  description?: string;
  fallbackData?: any[];
  className?: string;
  showRealtimeStatus?: boolean;
  customConfig?: RealtimeSubscriptionConfig;
}

/**
 * Real-time Chart Wrapper Component
 * Wraps chart components with real-time data fetching capabilities
 */
export function RealtimeChartWrapper({
  chartType,
  children,
  title,
  description,
  fallbackData,
  className,
  showRealtimeStatus = true,
  customConfig,
}: RealtimeChartWrapperProps) {
  // Get the appropriate config for the chart type
  const config = customConfig || REALTIME_CONFIGS[chartType];

  // Subscribe to real-time data
  const {
    data: rawData,
    loading,
    error,
    lastUpdated,
    isRealtime,
  } = useRealtimeChartData(`chart-${chartType}`, config, fallbackData);

  // Transform the data based on chart type
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      // Return fallback mock data if no real data available
      switch (chartType) {
        case "revenue":
          return generateRevenueData(12);
        case "performance":
          return generatePerformanceData(30);
        case "customers":
          return generateCustomerData().acquisition;
        case "marketing":
          return [];
        default:
          return [];
      }
    }

    // Transform real-time data for chart consumption
    switch (chartType) {
      case "revenue":
        return ChartDataTransformer.forRevenueChart(rawData);
      case "performance":
        return ChartDataTransformer.forPerformanceChart(rawData);
      case "customers":
        return ChartDataTransformer.forCustomerChart(rawData);
      default:
        return rawData;
    }
  }, [rawData, chartType]);

  // Real-time status indicator
  const statusIndicator = useMemo(() => {
    if (!showRealtimeStatus) return null;

    return (
      <div className="flex items-center gap-2 text-sm">
        {isRealtime ? (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <Wifi className="h-3 w-3 mr-1" />
            Live
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <WifiOff className="h-3 w-3 mr-1" />
            Cached
          </Badge>
        )}

        {lastUpdated && (
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  }, [isRealtime, lastUpdated, showRealtimeStatus]);

  // Error state
  if (error && !chartData.length) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-red-500 font-medium">
                Error loading real-time data
              </div>
              <div className="text-sm mt-1">{error}</div>
              <div className="text-xs mt-2 text-muted-foreground">
                Falling back to cached data...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render with header if title/description provided
  if (title || description) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {description}
                </div>
              )}
            </div>
            {statusIndicator}
          </div>
        </CardHeader>
        <CardContent>{children(chartData, loading, error)}</CardContent>
      </Card>
    );
  }

  // Render without card wrapper
  return (
    <div className={className}>
      {showRealtimeStatus && (
        <div className="flex justify-end mb-4">{statusIndicator}</div>
      )}
      {children(chartData, loading, error)}
    </div>
  );
}

/**
 * Higher-order component for making existing charts real-time
 */
export function withRealtimeData<T extends {}>(
  ChartComponent: React.ComponentType<T>,
  chartType: "revenue" | "performance" | "customers" | "marketing"
) {
  return function RealtimeChart(
    props: T & {
      showRealtimeStatus?: boolean;
      customConfig?: RealtimeSubscriptionConfig;
    }
  ) {
    const { showRealtimeStatus, customConfig, ...chartProps } = props;

    return (
      <RealtimeChartWrapper
        chartType={chartType}
        showRealtimeStatus={showRealtimeStatus}
        customConfig={customConfig}
      >
        {(data, loading, error) => (
          <ChartComponent
            {...(chartProps as T)}
            data={data}
            loading={loading}
            error={error}
          />
        )}
      </RealtimeChartWrapper>
    );
  };
}

/**
 * Real-time status indicator component (standalone)
 */
export function RealtimeStatusIndicator({
  isRealtime,
  lastUpdated,
  error,
}: {
  isRealtime: boolean;
  lastUpdated: Date | null;
  error: string | null;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {error ? (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 border-red-200"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      ) : isRealtime ? (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 border-green-200"
        >
          <Wifi className="h-3 w-3 mr-1" />
          Live
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          <WifiOff className="h-3 w-3 mr-1" />
          Cached
        </Badge>
      )}

      {lastUpdated && !error && (
        <span className="text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

/**
 * Hook for accessing real-time connection status
 */
export function useRealtimeStatus(chartType: string) {
  const { data, loading, error, lastUpdated, isRealtime } =
    useRealtimeChartData(
      `status-${chartType}`,
      { table: "metrics", enable_polling: false },
      []
    );

  return {
    isConnected: isRealtime && !error,
    lastUpdated,
    error,
    dataCount: data?.length || 0,
  };
}
