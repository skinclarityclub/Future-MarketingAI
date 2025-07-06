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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Clock,
  Mail,
  MessageSquare,
  Webhook,
  ChevronDown,
  ChevronUp,
  Filter,
  MoreVertical,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  Zap,
  CheckCircle,
  XCircle,
  AlertOctagon,
} from "lucide-react";

// Types
interface SystemAlert {
  id: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  source_service?: string;
  status: "active" | "acknowledged" | "resolved" | "dismissed";
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  auto_resolve: boolean;
  created_at: string;
  updated_at: string;
  trigger_condition?: any;
  alert_data?: any;
}

interface AlertStatistics {
  total_alerts: number;
  active_alerts: number;
  resolved_alerts: number;
  acknowledged_alerts: number;
  by_severity: Record<string, number>;
  by_status: Record<string, number>;
  avg_resolution_time_minutes: number;
  escalations_triggered: number;
  notifications_sent: number;
  sla_breaches: number;
  time_to_acknowledge_avg_minutes: number;
  recent_trends: {
    alerts_trend: "increasing" | "stable" | "decreasing";
    resolution_time_trend: "improving" | "stable" | "degrading";
    escalation_rate_trend: "improving" | "stable" | "degrading";
  };
}

interface NotificationChannel {
  id: string;
  type: "email" | "slack" | "webhook" | "in_app";
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  filter?: any;
  success_rate: number;
  last_used: string;
}

export function AlertManagementDashboard() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [notificationChannels, setNotificationChannels] = useState<
    NotificationChannel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Load data
  useEffect(() => {
    loadDashboardData();

    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [alertsRes, statsRes, channelsRes, statusRes] = await Promise.all([
        fetch("/api/monitoring/alerts?action=get_all_alerts"),
        fetch("/api/monitoring/alerts?action=get_alert_statistics"),
        fetch("/api/monitoring/alerts?action=get_notification_channels"),
        fetch("/api/monitoring/alerts?action=get_system_status"),
      ]);

      const [alertsData, statsData, channelsData, statusData] =
        await Promise.all([
          alertsRes.json(),
          statsRes.json(),
          channelsRes.json(),
          statusRes.json(),
        ]);

      if (alertsData.success) setAlerts(alertsData.data);
      if (statsData.success) setStatistics(statsData.data);
      if (channelsData.success) setNotificationChannels(channelsData.data);
      if (statusData.success) setSystemStatus(statusData.data);

      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Alert actions
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch("/api/monitoring/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "acknowledge_alert",
          alertId,
          acknowledgedBy: "current-user@company.com",
          notes: "Acknowledged via dashboard",
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch("/api/monitoring/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve_alert",
          alertId,
          resolvedBy: "current-user@company.com",
          resolutionNotes: "Resolved via dashboard",
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  const bulkAcknowledge = async () => {
    if (selectedAlerts.size === 0) return;

    try {
      const response = await fetch("/api/monitoring/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_acknowledge",
          alertIds: Array.from(selectedAlerts),
          acknowledgedBy: "current-user@company.com",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSelectedAlerts(new Set());
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Error bulk acknowledging alerts:", error);
    }
  };

  const testNotificationChannel = async (channelId: string) => {
    try {
      const response = await fetch("/api/monitoring/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_notification_channel",
          channelId,
          testMessage: "This is a test notification from the SKC BI Dashboard.",
        }),
      });

      const result = await response.json();
      console.log("Test notification result:", result);
    } catch (error) {
      console.error("Error testing notification channel:", error);
    }
  };

  // Utility functions
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "critical":
        return <AlertOctagon className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "border-l-blue-500 bg-blue-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "critical":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "destructive";
      case "acknowledged":
        return "default";
      case "resolved":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "decreasing":
      case "improving":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case "stable":
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "slack":
        return <MessageSquare className="h-4 w-4" />;
      case "webhook":
        return <Webhook className="h-4 w-4" />;
      case "in_app":
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
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

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== "all" && alert.severity !== filterSeverity)
      return false;
    if (filterStatus !== "all" && alert.status !== filterStatus) return false;
    if (filterService !== "all" && alert.source_service !== filterService)
      return false;
    if (
      searchQuery &&
      !alert.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const uniqueServices = [
    ...new Set(alerts.map(a => a.source_service).filter(Boolean)),
  ];

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading alert dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alert Management Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage system alerts, notifications, and escalations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NormalButton
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </NormalButton>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-refresh</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statistics.active_alerts}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(statistics.recent_trends.alerts_trend)}
                <span className="ml-1">
                  {statistics.recent_trends.alerts_trend} trend
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Critical Alerts
              </CardTitle>
              <AlertOctagon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statistics.by_severity.critical || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Requiring immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Resolution Time
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(statistics.avg_resolution_time_minutes)}m
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(statistics.recent_trends.resolution_time_trend)}
                <span className="ml-1">
                  {statistics.recent_trends.resolution_time_trend}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                SLA Breaches
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statistics.sla_breaches}
              </div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Search:</label>
                  <Input
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-48"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Severity:</label>
                  <Select
                    value={filterSeverity}
                    onValueChange={setFilterSeverity}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Status:</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Service:</label>
                  <Select
                    value={filterService}
                    onValueChange={setFilterService}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {uniqueServices.map(service => (
                        <SelectItem key={service} value={service!}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAlerts.size > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-muted-foreground">
                      {selectedAlerts.size} selected
                    </span>
                    <NormalButton size="sm" onClick={bulkAcknowledge}>
                      <Check className="h-4 w-4 mr-2" />
                      Acknowledge All
                    </NormalButton>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredAlerts.map(alert => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${getSeverityColor(alert.severity)} transition-all duration-200 hover:shadow-md`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAlerts.has(alert.id)}
                          onChange={e => {
                            const newSelected = new Set(selectedAlerts);
                            if (e.target.checked) {
                              newSelected.add(alert.id);
                            } else {
                              newSelected.delete(alert.id);
                            }
                            setSelectedAlerts(newSelected);
                          }}
                          className="rounded"
                        />

                        {getSeverityIcon(alert.severity)}

                        <div>
                          <CardTitle className="text-base">
                            {alert.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={getStatusBadgeVariant(alert.status)}
                            >
                              {alert.status}
                            </Badge>
                            <Badge variant="secondary">{alert.severity}</Badge>
                            {alert.source_service && (
                              <Badge variant="outline">
                                {alert.source_service}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(alert.created_at)}
                        </span>

                        {alert.status === "active" && (
                          <div className="flex gap-1">
                            <NormalButton
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              <Check className="h-4 w-4" />
                            </NormalButton>
                            <NormalButton
                              size="sm"
                              variant="outline"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </NormalButton>
                          </div>
                        )}

                        <NormalButton
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setExpandedAlert(
                              expandedAlert === alert.id ? null : alert.id
                            )
                          }
                        >
                          {expandedAlert === alert.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </NormalButton>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-2">
                      {alert.description}
                    </p>

                    {expandedAlert === alert.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Alert Type:</strong> {alert.alert_type}
                          </div>
                          <div>
                            <strong>Auto Resolve:</strong>{" "}
                            {alert.auto_resolve ? "Yes" : "No"}
                          </div>
                          <div>
                            <strong>Created:</strong>{" "}
                            {new Date(alert.created_at).toLocaleString()}
                          </div>
                          <div>
                            <strong>Updated:</strong>{" "}
                            {new Date(alert.updated_at).toLocaleString()}
                          </div>
                          {alert.acknowledged_by && (
                            <>
                              <div>
                                <strong>Acknowledged by:</strong>{" "}
                                {alert.acknowledged_by}
                              </div>
                              <div>
                                <strong>Acknowledged at:</strong>{" "}
                                {alert.acknowledged_at
                                  ? new Date(
                                      alert.acknowledged_at
                                    ).toLocaleString()
                                  : "N/A"}
                              </div>
                            </>
                          )}
                        </div>

                        {alert.alert_data && (
                          <div className="mt-3">
                            <strong className="text-sm">Alert Data:</strong>
                            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
                              {JSON.stringify(alert.alert_data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredAlerts.length === 0 && (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No alerts found
                      </h3>
                      <p className="text-muted-foreground">
                        {alerts.length === 0
                          ? "All systems are running smoothly!"
                          : "No alerts match your current filters."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Channels
              </CardTitle>
              <CardDescription>
                Manage how alerts are delivered to your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationChannels.map(channel => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getChannelIcon(channel.type)}
                      <div>
                        <h4 className="font-medium">{channel.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {channel.type.toUpperCase()} • Success rate:{" "}
                          {channel.success_rate}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={channel.enabled ? "default" : "secondary"}
                      >
                        {channel.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <NormalButton
                        size="sm"
                        variant="outline"
                        onClick={() => testNotificationChannel(channel.id)}
                      >
                        Test
                      </NormalButton>
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={checked => {
                          // Update channel status
                          console.log(`Toggle channel ${channel.id}:`, checked);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escalations Tab */}
        <TabsContent value="escalations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Escalation Policies
              </CardTitle>
              <CardDescription>
                Configure automatic escalation workflows for different alert
                types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Escalation Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  Configure escalation policies, delay intervals, and
                  notification targets
                </p>
                <NormalButton variant="outline">
                  Configure Escalations
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {statistics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Distribution by Severity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(statistics.by_severity).map(
                      ([severity, count]) => (
                        <div
                          key={severity}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(severity)}
                            <span className="capitalize">{severity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{count}</span>
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  severity === "critical"
                                    ? "bg-red-500"
                                    : severity === "high"
                                      ? "bg-orange-500"
                                      : severity === "medium"
                                        ? "bg-yellow-500"
                                        : "bg-blue-500"
                                }`}
                                style={{
                                  width: `${(count / statistics.total_alerts) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Response Time</span>
                        <span>
                          {statistics.time_to_acknowledge_avg_minutes.toFixed(
                            1
                          )}
                          m
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Resolution Efficiency</span>
                        <span>82%</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Notification Success Rate</span>
                        <span>98.5%</span>
                      </div>
                      <Progress value={98.5} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
