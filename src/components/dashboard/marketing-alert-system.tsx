"use client";

import React, { useState, useEffect } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Bell,
  Mail,
  MessageSquare,
  Settings,
  RefreshCw,
  Info,
  Zap,
  ArrowUp,
  ArrowDown,
  Clock,
  Users,
  BarChart3,
} from "lucide-react";
import { UltraPremiumCard } from "@/components/layout/ultra-premium-dashboard-layout";

// Marketing Alert Types
interface MarketingAlert {
  id: string;
  type: "critical" | "warning" | "opportunity" | "info";
  category: "roi" | "budget" | "conversion" | "campaign" | "trend" | "anomaly";
  title: string;
  description: string;
  metric_value: number;
  threshold_value: number;
  metric_name: string;
  severity: "low" | "medium" | "high" | "critical";
  triggered_at: string;
  campaign_id?: string;
  channel?: string;
  auto_resolve: boolean;
  status: "active" | "acknowledged" | "resolved";
  recommended_actions: string[];
  confidence_score: number;
}

interface AlertThresholds {
  roi_critical: number; // ROI below this triggers critical alert
  roi_warning: number; // ROI below this triggers warning
  roas_critical: number; // ROAS below this triggers critical alert
  conversion_drop: number; // Conversion rate drop percentage
  budget_utilization: number; // Budget utilization threshold
  cpa_spike: number; // CPA increase percentage
  spend_anomaly: number; // Spending anomaly multiplier
  opportunity_roi: number; // ROI above this triggers opportunity alert
}

interface AlertStatistics {
  total_alerts: number;
  critical_alerts: number;
  active_alerts: number;
  resolved_today: number;
  avg_resolution_time: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  roi_critical: 50, // 50% ROI
  roi_warning: 100, // 100% ROI
  roas_critical: 2.0, // 2.0 ROAS
  conversion_drop: 25, // 25% drop
  budget_utilization: 85, // 85% budget used
  cpa_spike: 50, // 50% CPA increase
  spend_anomaly: 2.0, // 2x normal spending
  opportunity_roi: 300, // 300% ROI opportunity
};

export function MarketingAlertSystem() {
  const [alerts, setAlerts] = useState<MarketingAlert[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [thresholds, setThresholds] =
    useState<AlertThresholds>(DEFAULT_THRESHOLDS);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("active");

  useEffect(() => {
    loadAlertData();

    if (autoRefresh) {
      const interval = setInterval(loadAlertData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadAlertData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load marketing alerts from API
      const [alertsRes, statsRes] = await Promise.all([
        fetch("/api/marketing/alerts?action=get_active_alerts"),
        fetch("/api/marketing/alerts?action=get_statistics"),
      ]);

      if (alertsRes.ok && statsRes.ok) {
        const alertsData = await alertsRes.json();
        const statsData = await statsRes.json();

        setAlerts(alertsData.data || generateSampleAlerts());
        setStatistics(statsData.data || generateSampleStatistics());
      } else {
        // Fallback to sample data
        setAlerts(generateSampleAlerts());
        setStatistics(generateSampleStatistics());
      }
    } catch (err) {
      console.error("Error loading alert data:", err);
      setError("Failed to load alert data");
      // Use sample data as fallback
      setAlerts(generateSampleAlerts());
      setStatistics(generateSampleStatistics());
    } finally {
      setLoading(false);
    }
  };

  const generateSampleAlerts = (): MarketingAlert[] => {
    const now = new Date();
    return [
      {
        id: "alert-001",
        type: "critical",
        category: "roi",
        title: "Kritiek lage ROI - Google Ads Campagne",
        description:
          'De "Summer Sale 2024" campagne heeft een ROI van slechts 45%, ver onder de 100% doelstelling.',
        metric_value: 45,
        threshold_value: 100,
        metric_name: "ROI Percentage",
        severity: "critical",
        triggered_at: new Date(
          now.getTime() - 2 * 60 * 60 * 1000
        ).toISOString(),
        campaign_id: "camp-001",
        channel: "google_ads",
        auto_resolve: false,
        status: "active",
        recommended_actions: [
          "Pauzeer onderperformerende keywords",
          "Optimaliseer ad copy en landing pages",
          "Verhoog biedingen op high-performing keywords",
          "Review doelgroep targeting",
        ],
        confidence_score: 0.92,
      },
      {
        id: "alert-002",
        type: "warning",
        category: "budget",
        title: "Budget bijna opgebruikt - Facebook Campagne",
        description:
          'De "Brand Awareness Q3" campagne heeft 88% van het budget gebruikt met nog 8 dagen te gaan.',
        metric_value: 88,
        threshold_value: 85,
        metric_name: "Budget Utilization",
        severity: "medium",
        triggered_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        campaign_id: "camp-002",
        channel: "facebook_ads",
        auto_resolve: false,
        status: "active",
        recommended_actions: [
          "Verhoog dagelijks budget als performance goed is",
          "Evalueer campaign performance vs targets",
          "Overweeg budget reallocation van andere campagnes",
        ],
        confidence_score: 0.87,
      },
      {
        id: "alert-003",
        type: "opportunity",
        category: "roi",
        title: "Hoge Performance Opportunity - LinkedIn Ads",
        description:
          'De "B2B Lead Gen" campagne presteert exceptionally met 425% ROI - overweeg budget verhoging.',
        metric_value: 425,
        threshold_value: 300,
        metric_name: "ROI Percentage",
        severity: "low",
        triggered_at: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
        campaign_id: "camp-003",
        channel: "linkedin_ads",
        auto_resolve: true,
        status: "active",
        recommended_actions: [
          "Verhoog budget met 50% voor maximale ROI",
          "Duplicate high-performing ad sets",
          "Expand naar vergelijkbare doelgroepen",
        ],
        confidence_score: 0.96,
      },
      {
        id: "alert-004",
        type: "warning",
        category: "conversion",
        title: "Conversion Rate Daling - Email Campaign",
        description:
          "Email conversion rate is gedaald van 4.2% naar 2.8% (-33%) in de laatste 48 uur.",
        metric_value: 2.8,
        threshold_value: 4.2,
        metric_name: "Conversion Rate",
        severity: "medium",
        triggered_at: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
        campaign_id: "camp-004",
        channel: "email",
        auto_resolve: false,
        status: "active",
        recommended_actions: [
          "Check email deliverability rates",
          "Review recent email content changes",
          "Analyze recipient engagement patterns",
          "Test verschillende CTA buttons",
        ],
        confidence_score: 0.84,
      },
      {
        id: "alert-005",
        type: "info",
        category: "trend",
        title: "Positieve Trend - Mobile Traffic",
        description:
          "Mobile conversions zijn 15% gestegen week-over-week, mogelijk door verbeterde mobiele ervaring.",
        metric_value: 115,
        threshold_value: 110,
        metric_name: "Mobile Conversion Trend",
        severity: "low",
        triggered_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        auto_resolve: true,
        status: "active",
        recommended_actions: [
          "Monitor trend continuïteit",
          "Verhoog mobile ad spend als trend aanhoudt",
          "Optimaliseer desktop ervaring",
        ],
        confidence_score: 0.78,
      },
    ];
  };

  const generateSampleStatistics = (): AlertStatistics => {
    return {
      total_alerts: 247,
      critical_alerts: 3,
      active_alerts: 12,
      resolved_today: 8,
      avg_resolution_time: 45, // minutes
    };
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch("/api/marketing/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "acknowledge_alert",
          alertId,
          acknowledgedBy: "current-user@company.com",
        }),
      });

      if (response.ok) {
        setAlerts(prev =>
          prev.map(alert =>
            alert.id === alertId ? { ...alert, status: "acknowledged" } : alert
          )
        );
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch("/api/marketing/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve_alert",
          alertId,
          resolvedBy: "current-user@company.com",
        }),
      });

      if (response.ok) {
        setAlerts(prev =>
          prev.map(alert =>
            alert.id === alertId ? { ...alert, status: "resolved" } : alert
          )
        );
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case "critical":
        return "destructive";
      case "warning":
        return "secondary";
      case "opportunity":
        return "default";
      case "info":
        return "outline";
      default:
        return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "roi":
        return <Target className="h-3 w-3" />;
      case "budget":
        return <DollarSign className="h-3 w-3" />;
      case "conversion":
        return <BarChart3 className="h-3 w-3" />;
      case "campaign":
        return <Zap className="h-3 w-3" />;
      case "trend":
        return <TrendingUp className="h-3 w-3" />;
      case "anomaly":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Zojuist";
    if (diffInMinutes < 60) return `${diffInMinutes}m geleden`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)}u geleden`;
    return `${Math.floor(diffInMinutes / 1440)}d geleden`;
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterType !== "all" && alert.type !== filterType) return false;
    if (filterStatus !== "all" && alert.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <UltraPremiumCard className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Marketing Alert System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Loading alerts...</span>
          </div>
        </CardContent>
      </UltraPremiumCard>
    );
  }

  return (
    <UltraPremiumCard className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Marketing Alert System
            </CardTitle>
            <CardDescription>
              Real-time monitoring van kritieke marketing metrics en kansen
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <NormalButton
              size="sm"
              variant="outline"
              onClick={loadAlertData}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </NormalButton>
            <NormalButton size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </NormalButton>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Alert Statistics */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {statistics.total_alerts}
              </div>
              <div className="text-xs text-gray-400">Total Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {statistics.critical_alerts}
              </div>
              <div className="text-xs text-gray-400">Kritiek</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {statistics.active_alerts}
              </div>
              <div className="text-xs text-gray-400">Actief</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {statistics.resolved_today}
              </div>
              <div className="text-xs text-gray-400">Opgelost Vandaag</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {statistics.avg_resolution_time}m
              </div>
              <div className="text-xs text-gray-400">Gem. Oplostijd</div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-sm bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
          >
            <option value="all">Alle Types</option>
            <option value="critical">Kritiek</option>
            <option value="warning">Waarschuwing</option>
            <option value="opportunity">Kans</option>
            <option value="info">Info</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
          >
            <option value="all">Alle Status</option>
            <option value="active">Actief</option>
            <option value="acknowledged">Bevestigd</option>
            <option value="resolved">Opgelost</option>
          </select>
        </div>

        {/* Active Alerts List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-4 border border-gray-700/50 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type, alert.severity)}
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(alert.category)}
                      <span className="text-xs text-gray-400 uppercase">
                        {alert.category}
                      </span>
                    </div>
                    <Badge variant={getAlertBadgeVariant(alert.type)}>
                      {alert.type.toUpperCase()}
                    </Badge>
                    {alert.channel && (
                      <Badge variant="outline" className="text-xs">
                        {alert.channel.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatTimeAgo(alert.triggered_at)}
                  </div>
                </div>

                <h4 className="font-medium text-white mb-1">{alert.title}</h4>
                <p className="text-sm text-gray-300 mb-3">
                  {alert.description}
                </p>

                {/* Metric Display */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-400">Waarde: </span>
                    <span className="font-medium text-white">
                      {alert.metric_name.includes("Percentage") ||
                      alert.metric_name.includes("Rate")
                        ? `${alert.metric_value}%`
                        : alert.metric_value.toLocaleString("nl-NL")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Drempel: </span>
                    <span className="font-medium text-white">
                      {alert.metric_name.includes("Percentage") ||
                      alert.metric_name.includes("Rate")
                        ? `${alert.threshold_value}%`
                        : alert.threshold_value.toLocaleString("nl-NL")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Betrouwbaarheid: </span>
                    <span className="font-medium text-white">
                      {Math.round(alert.confidence_score * 100)}%
                    </span>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-2">
                    Aanbevolen Acties:
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {alert.recommended_actions
                      .slice(0, 2)
                      .map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                          {action}
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {alert.status === "active" && (
                    <>
                      <NormalButton
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Bevestig
                      </NormalButton>
                      <NormalButton
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        Los Op
                      </NormalButton>
                    </>
                  )}
                  {alert.campaign_id && (
                    <NormalButton size="sm" variant="ghost" className="text-xs">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      View Campaign
                    </NormalButton>
                  )}
                </div>
              </div>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Geen alerts gevonden
                </h3>
                <p className="text-gray-400">
                  {alerts.length === 0
                    ? "Alle marketing metrics presteren binnen normale parameters!"
                    : "Geen alerts gevonden voor de huidige filters."}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </CardContent>
    </UltraPremiumCard>
  );
}
