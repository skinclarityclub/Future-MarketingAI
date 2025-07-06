"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Eye,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IntelligentAlert,
  intelligentAlertManager,
} from "@/lib/intelligent-alerts/alert-manager";

interface AlertStatistics {
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  acknowledged: number;
  resolved: number;
}

interface AlertDashboardProps {
  locale?: string;
}

const AlertIcons = {
  critical: AlertTriangle,
  high: AlertCircle,
  medium: Info,
  low: Bell,
};

const AlertColors = {
  critical: "text-red-500 bg-red-500/10 border-red-500/20",
  high: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
};

const TypeIcons = {
  performance: Activity,
  business: TrendingUp,
  security: Eye,
  anomaly: Zap,
  forecast: Clock,
  workflow: Settings,
};

export function IntelligentAlertsDashboard({
  locale = "en",
}: AlertDashboardProps) {
  const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<IntelligentAlert | null>(
    null
  );
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load alerts data
  const loadAlertsData = async () => {
    try {
      setLoading(true);
      const activeAlerts = intelligentAlertManager.getActiveAlerts();
      const stats = intelligentAlertManager.getAlertStatistics();

      setAlerts(activeAlerts);
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading alerts data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertsData();

    // Auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(loadAlertsData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Start the alert manager
  useEffect(() => {
    intelligentAlertManager.start();
    return () => intelligentAlertManager.stop();
  }, []);

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== "all" && alert.severity !== filterSeverity)
      return false;
    if (filterType !== "all" && alert.type !== filterType) return false;
    return true;
  });

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await intelligentAlertManager.acknowledgeAlert(alertId);
      await loadAlertsData();
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  // Handle alert resolution
  const handleResolveAlert = async (alertId: string) => {
    try {
      await intelligentAlertManager.resolveAlert(alertId);
      await loadAlertsData();
      if (selectedAlert?.id === alertId) {
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(locale === "nl" ? "nl-NL" : "en-US");
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-yellow-500 text-black",
      low: "bg-blue-500 text-white",
    };

    return (
      <Badge
        className={
          colors[severity as keyof typeof colors] || "bg-gray-500 text-white"
        }
      >
        {severity.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {locale === "nl"
                ? "Intelligente Waarschuwingen"
                : "Intelligent Alerts"}
            </h1>
            <p className="text-gray-400">
              {locale === "nl"
                ? "Real-time monitoring en anomaly detection dashboard"
                : "Real-time monitoring and anomaly detection dashboard"}
            </p>
          </div>
          <div className="flex gap-3">
            <NormalButton
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {autoRefresh ? "⏸️" : "▶️"} Auto Refresh
            </NormalButton>
            <NormalButton
              variant="outline"
              size="sm"
              onClick={loadAlertsData}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              🔄 Refresh
            </NormalButton>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">
                  {locale === "nl" ? "Totaal Actief" : "Total Active"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {statistics.total}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">
                  {locale === "nl"
                    ? "Kritieke Waarschuwingen"
                    : "Critical Alerts"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {statistics.bySeverity.critical || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">
                  {locale === "nl" ? "Bevestigd" : "Acknowledged"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {statistics.acknowledged}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">
                  {locale === "nl" ? "Opgelost" : "Resolved"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {statistics.resolved}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger
              value="alerts"
              className="data-[state=active]:bg-gray-700"
            >
              {locale === "nl" ? "Actieve Waarschuwingen" : "Active Alerts"}
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gray-700"
            >
              {locale === "nl" ? "Analyse" : "Analytics"}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-gray-700"
            >
              {locale === "nl" ? "Instellingen" : "Settings"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 items-center">
              <select
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2"
              >
                <option value="all">
                  {locale === "nl" ? "Alle Niveaus" : "All Severities"}
                </option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2"
              >
                <option value="all">
                  {locale === "nl" ? "Alle Types" : "All Types"}
                </option>
                <option value="performance">Performance</option>
                <option value="business">Business</option>
                <option value="security">Security</option>
                <option value="anomaly">Anomaly</option>
                <option value="forecast">Forecast</option>
                <option value="workflow">Workflow</option>
              </select>
            </div>

            {/* Alerts List */}
            <div className="grid gap-4">
              {filteredAlerts.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-gray-400">
                        {locale === "nl"
                          ? "Geen actieve waarschuwingen"
                          : "No active alerts"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredAlerts.map(alert => {
                  const AlertIcon =
                    AlertIcons[alert.severity as keyof typeof AlertIcons];
                  const TypeIcon =
                    TypeIcons[alert.type as keyof typeof TypeIcons];

                  return (
                    <Card
                      key={alert.id}
                      className={`bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer ${
                        selectedAlert?.id === alert.id
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <AlertIcon
                              className={`h-5 w-5 ${AlertColors[alert.severity as keyof typeof AlertColors].split(" ")[0]}`}
                            />
                            <TypeIcon className="h-4 w-4 text-gray-400" />
                            <div>
                              <CardTitle className="text-white text-sm">
                                {alert.title}
                              </CardTitle>
                              <CardDescription className="text-gray-400 text-xs">
                                {alert.source} •{" "}
                                {formatTimestamp(alert.timestamp)}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(alert.severity)}
                            {alert.acknowledged && (
                              <Badge
                                variant="outline"
                                className="border-green-500 text-green-400"
                              >
                                ✓ ACK
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-3">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {!alert.acknowledged && (
                              <NormalButton
                                size="sm"
                                variant="outline"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleAcknowledgeAlert(alert.id);
                                }}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                ✓{" "}
                                {locale === "nl" ? "Bevestigen" : "Acknowledge"}
                              </NormalButton>
                            )}
                            <NormalButton
                              size="sm"
                              variant="outline"
                              onClick={e => {
                                e.stopPropagation();
                                handleResolveAlert(alert.id);
                              }}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              ✗ {locale === "nl" ? "Oplossen" : "Resolve"}
                            </NormalButton>
                          </div>
                          <div className="text-xs text-gray-500">
                            {locale === "nl" ? "Vertrouwen" : "Confidence"}:{" "}
                            {(alert.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {locale === "nl"
                    ? "Waarschuwingen Analyse"
                    : "Alert Analytics"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statistics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* By Severity */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">
                        {locale === "nl" ? "Per Niveau" : "By Severity"}
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(statistics.bySeverity).map(
                          ([severity, count]) => (
                            <div
                              key={severity}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-300 capitalize">
                                {severity}
                              </span>
                              <span className="text-white font-semibold">
                                {count}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* By Type */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">
                        {locale === "nl" ? "Per Type" : "By Type"}
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(statistics.byType).map(
                          ([type, count]) => (
                            <div
                              key={type}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-300 capitalize">
                                {type}
                              </span>
                              <span className="text-white font-semibold">
                                {count}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {locale === "nl"
                    ? "Waarschuwingen Instellingen"
                    : "Alert Settings"}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {locale === "nl"
                    ? "Configureer drempels en notificatie-instellingen"
                    : "Configure thresholds and notification settings"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-gray-400">
                  {locale === "nl"
                    ? "Instellingen configuratie komt binnenkort beschikbaar"
                    : "Settings configuration coming soon"}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="bg-gray-800 border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-white font-semibold">
                      {selectedAlert.title}
                    </div>
                    {getSeverityBadge(selectedAlert.severity)}
                  </div>
                  <NormalButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAlert(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </NormalButton>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">
                    {locale === "nl" ? "Beschrijving" : "Description"}
                  </h4>
                  <p className="text-gray-300">{selectedAlert.message}</p>
                </div>

                {selectedAlert.current_value !== undefined && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">
                      {locale === "nl" ? "Waarden" : "Values"}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400">
                          {locale === "nl" ? "Huidige Waarde" : "Current Value"}
                          :
                        </span>
                        <span className="text-white ml-2">
                          {selectedAlert.current_value}
                        </span>
                      </div>
                      {selectedAlert.expected_value !== undefined && (
                        <div>
                          <span className="text-gray-400">
                            {locale === "nl"
                              ? "Verwachte Waarde"
                              : "Expected Value"}
                            :
                          </span>
                          <span className="text-white ml-2">
                            {selectedAlert.expected_value}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedAlert.suggested_actions.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">
                      {locale === "nl"
                        ? "Voorgestelde Acties"
                        : "Suggested Actions"}
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedAlert.suggested_actions.map((action, index) => (
                        <li key={index} className="text-gray-300">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {!selectedAlert.acknowledged && (
                    <NormalButton
                      onClick={() => handleAcknowledgeAlert(selectedAlert.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      ✓ {locale === "nl" ? "Bevestigen" : "Acknowledge"}
                    </NormalButton>
                  )}
                  <NormalButton
                    onClick={() => handleResolveAlert(selectedAlert.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    ✗ {locale === "nl" ? "Oplossen" : "Resolve"}
                  </NormalButton>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
