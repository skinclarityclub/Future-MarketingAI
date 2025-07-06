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
import NormalButton from "@/components/ui/normal-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { clientMonitoring } from "@/lib/supabase/monitoring";
import type { SystemAlert, AlertSeverity } from "@/lib/supabase/types";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  CheckCircle,
} from "lucide-react";

export function SystemAlertsWidget() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadAlerts();

    // Set up real-time subscription for alerts
    const channel = clientMonitoring.subscribeToAlerts(payload => {
      console.log("Real-time alert update:", payload);
      loadAlerts(); // Refresh data when alerts change
      setLastUpdate(new Date());
    });

    // Set up periodic refresh
    const interval = setInterval(loadAlerts, 45000); // Refresh every 45 seconds

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await clientMonitoring.getActiveAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "low":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadgeVariant = (severity: AlertSeverity) => {
    switch (severity) {
      case "low":
        return "secondary";
      case "medium":
        return "outline";
      case "high":
        return "default";
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "low":
        return "border-l-blue-500";
      case "medium":
        return "border-l-yellow-500";
      case "high":
        return "border-l-orange-500";
      case "critical":
        return "border-l-red-500";
      default:
        return "border-l-gray-500";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getCriticalCount = () =>
    alerts.filter(a => a.severity === "critical").length;
  const getHighCount = () => alerts.filter(a => a.severity === "high").length;

  if (loading && alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Alerts
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
            <Bell className="h-5 w-5" />
            System Alerts
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Alerts
            {alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </div>
          {alerts.length === 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                All Clear
              </span>
            </div>
          )}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Last updated: {lastUpdate.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert Stats */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{alerts.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {getCriticalCount()}
              </div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {getHighCount()}
              </div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {alerts.filter(a => a.auto_resolve).length}
              </div>
              <div className="text-xs text-muted-foreground">Auto-resolve</div>
            </div>
          </div>
        )}

        {/* Active Alerts List */}
        {alerts.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Active Alerts</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.slice(0, 10).map(alert => (
                <div
                  key={alert.id}
                  className={`flex items-start justify-between p-3 rounded-lg border-l-4 bg-muted/30 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">
                          {alert.title}
                        </span>
                        <Badge
                          variant={getSeverityBadgeVariant(alert.severity)}
                          className="text-xs"
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      {alert.description && (
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                          {alert.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {alert.source_service && (
                          <span className="font-medium">
                            {alert.source_service}
                          </span>
                        )}
                        <span>•</span>
                        <span>{formatTimeAgo(alert.created_at)}</span>
                        {alert.auto_resolve && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">Auto-resolve</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {alerts.length > 10 && (
              <p className="text-xs text-muted-foreground text-center">
                Showing 10 of {alerts.length} alerts
              </p>
            )}
          </div>
        ) : (
          /* No Alerts State */
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium text-green-600">No Active Alerts</p>
            <p className="text-xs">Your system is running smoothly</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
