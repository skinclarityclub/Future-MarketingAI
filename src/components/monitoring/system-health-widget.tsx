"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { clientMonitoring } from "@/lib/supabase/monitoring";
import type { SystemHealthMetric, HealthStatus } from "@/lib/supabase/types";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface SystemHealthData {
  overall_status: HealthStatus;
  metrics: SystemHealthMetric[];
  issues: number;
}

export function SystemHealthWidget() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadHealthData();

    // Set up real-time subscription
    const channel = clientMonitoring.subscribeToHealthMetrics(payload => {
      console.log("Real-time health metric update:", payload);
      loadHealthData(); // Refresh data when changes occur
      setLastUpdate(new Date());
    });

    // Set up periodic refresh
    const interval = setInterval(loadHealthData, 30000); // Refresh every 30 seconds

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const data = await clientMonitoring.getSystemHealth();
      setHealthData(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load health data"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return "default";
      case "warning":
        return "secondary";
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading && !healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${getStatusColor(healthData.overall_status)}`}
            />
            <Badge variant={getStatusBadgeVariant(healthData.overall_status)}>
              {healthData.overall_status.toUpperCase()}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Last updated: {lastUpdate.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {healthData.metrics.length}
            </div>
            <div className="text-sm text-muted-foreground">Active Metrics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {healthData.issues}
            </div>
            <div className="text-sm text-muted-foreground">Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {healthData.metrics.length - healthData.issues}
            </div>
            <div className="text-sm text-muted-foreground">Healthy</div>
          </div>
        </div>

        {/* Recent Metrics */}
        {healthData.metrics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Metrics</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {healthData.metrics.slice(0, 5).map(metric => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status as HealthStatus)}
                    <div>
                      <div className="text-sm font-medium">
                        {metric.service_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {metric.metric_type}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {metric.metric_value} {metric.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {healthData.metrics.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent metrics available</p>
            <p className="text-xs">
              Metrics will appear here as they are collected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
