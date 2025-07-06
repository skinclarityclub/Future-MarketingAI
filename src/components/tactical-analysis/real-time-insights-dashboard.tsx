"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useLocale } from "@/lib/i18n/context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import NormalButton from "@/components/ui/normal-button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  WifiOff,
  Wifi,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";

interface RealtimeDataStream {
  id: string;
  source: "shopify" | "kajabi" | "financial" | "marketing" | "external";
  metric: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface RealtimeInsight {
  id: string;
  type:
    | "prediction"
    | "anomaly"
    | "trend_change"
    | "threshold_alert"
    | "opportunity";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence_score: number;
  metric_affected: string;
  current_value: number;
  expected_value?: number;
  recommendations: string[];
  timestamp: string;
  expires_at?: string;
}

interface RealtimeAlert {
  id: string;
  type: "anomaly" | "threshold" | "trend_reversal" | "forecast_deviation";
  metric: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  current_value: number;
  threshold_value?: number;
  confidence: number;
  timestamp: string;
  action_required: boolean;
  suggested_actions: string[];
}

interface StreamingForecast {
  metric: string;
  current_value: number;
  short_term_forecast: {
    next_hour: number;
    next_day: number;
    next_week: number;
  };
  confidence_levels: {
    next_hour: number;
    next_day: number;
    next_week: number;
  };
  trend_direction: "up" | "down" | "stable";
  volatility_index: number;
  last_updated: string;
}

interface SSEMessage {
  type: "connected" | "data" | "ping" | "error";
  payload?: any;
  timestamp: string;
  clientId?: string;
  channels?: string[];
}

export default function RealtimeInsightsDashboard() {
  const { t } = useLocale();
  const [connected, setConnected] = useState(false);
  const [insights, setInsights] = useState<RealtimeInsight[]>([]);
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [forecasts, setForecasts] = useState<StreamingForecast[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [dataCount, setDataCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const connectToSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const url = new URL("/api/tactical-realtime/sse", window.location.origin);
      url.searchParams.set("clientId", generateClientId());
      url.searchParams.set("channels", "insights,alerts,forecasts");
      url.searchParams.set("token", "demo-token-123"); // In production, use proper auth

      console.log("Connecting to SSE:", url.toString());

      const eventSource = new EventSource(url.toString());
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connection opened");
        setConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
      };

      eventSource.onmessage = event => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          handleSSEMessage(message);
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = error => {
        console.error("SSE connection error:", error);
        setConnected(false);
        setConnectionError("Connection lost. Attempting to reconnect...");

        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(
            () => {
              setReconnectAttempts(prev => prev + 1);
              connectToSSE();
            },
            Math.pow(2, reconnectAttempts) * 1000
          ); // Exponential backoff
        } else {
          setConnectionError("Connection failed after multiple attempts");
        }
      };
    } catch (error) {
      console.error("Error creating SSE connection:", error);
      setConnectionError("Failed to establish connection");
    }
  }, [reconnectAttempts]);

  const handleSSEMessage = (message: SSEMessage) => {
    setLastUpdate(new Date());
    setDataCount(prev => prev + 1);

    switch (message.type) {
      case "connected":
        console.log("SSE connected:", message);
        break;

      case "data":
        const data = message.payload;

        // Route data based on type
        if (
          data.type === "prediction" ||
          data.type === "anomaly" ||
          data.type === "trend_change" ||
          data.type === "threshold_alert" ||
          data.type === "opportunity"
        ) {
          // It's an insight
          setInsights(prev => {
            const newInsights = [data as RealtimeInsight, ...prev].slice(0, 50);
            return newInsights;
          });
        } else if (
          data.type === "anomaly" ||
          data.type === "threshold" ||
          data.type === "trend_reversal" ||
          data.type === "forecast_deviation"
        ) {
          // It's an alert
          setAlerts(prev => {
            const newAlerts = [data as RealtimeAlert, ...prev].slice(0, 20);
            return newAlerts;
          });
        } else if (data.metric && data.short_term_forecast) {
          // It's a forecast
          setForecasts(prev => {
            const existingIndex = prev.findIndex(f => f.metric === data.metric);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = data as StreamingForecast;
              return updated;
            } else {
              return [...prev, data as StreamingForecast];
            }
          });
        }
        break;

      case "ping":
        // Keep connection alive
        break;

      case "error":
        console.error("SSE error message:", message.payload);
        setConnectionError(message.payload?.message || "Server error");
        break;
    }
  };

  const startConnection = () => {
    setIsRunning(true);
    connectToSSE();
  };

  const stopConnection = () => {
    setIsRunning(false);
    setConnected(false);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const clearData = () => {
    setInsights([]);
    setAlerts([]);
    setForecasts([]);
    setDataCount(0);
  };

  useEffect(() => {
    return () => {
      stopConnection();
    };
  }, []);

  const generateClientId = () => {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <Activity className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "stable":
        return <Target className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {t("dashboard.realTimeTacticalAnalysis")}
              </CardTitle>
              <CardDescription>
                Live business insights, alerts, and predictions
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {connected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isRunning}
                  onCheckedChange={isRunning ? stopConnection : startConnection}
                />
                <span className="text-sm">
                  {isRunning ? "Running" : "Stopped"}
                </span>
              </div>
              <NormalButton
                variant="outline"
                size="sm"
                onClick={clearData}
                disabled={!connected}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </NormalButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div>Data Points: {dataCount}</div>
            <div>Insights: {insights.length}</div>
            <div>Alerts: {alerts.length}</div>
            <div>Forecasts: {forecasts.length}</div>
            {lastUpdate && (
              <div>
                Last Update: {formatTimestamp(lastUpdate.toISOString())}
              </div>
            )}
          </div>
          {connectionError && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Live Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle>Live Forecasts</CardTitle>
          <CardDescription>Real-time predictions and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {forecasts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No forecasts available. Start the connection to see live
                predictions.
              </div>
            ) : (
              forecasts.map((forecast, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(forecast.trend_direction)}
                      <span className="font-medium capitalize">
                        {forecast.metric.replace(/_/g, " ")}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {formatValue(forecast.current_value)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Next Hour
                      </div>
                      <div className="font-medium">
                        {formatValue(forecast.short_term_forecast.next_hour)}
                      </div>
                      <Progress
                        value={forecast.confidence_levels.next_hour}
                        className="h-2 mt-1"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Next Day
                      </div>
                      <div className="font-medium">
                        {formatValue(forecast.short_term_forecast.next_day)}
                      </div>
                      <Progress
                        value={forecast.confidence_levels.next_day}
                        className="h-2 mt-1"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Next Week
                      </div>
                      <div className="font-medium">
                        {formatValue(forecast.short_term_forecast.next_week)}
                      </div>
                      <Progress
                        value={forecast.confidence_levels.next_week}
                        className="h-2 mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <span>
                      Volatility: {(forecast.volatility_index * 100).toFixed(1)}
                      %
                    </span>
                    <span>
                      Updated: {formatTimestamp(forecast.last_updated)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>
            Real-time business alerts and anomalies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active alerts. This is good news!
              </div>
            ) : (
              alerts.map((alert, index) => (
                <Alert key={index}>
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTitle className="capitalize">
                          {alert.type.replace(/_/g, " ")} - {alert.metric}
                        </AlertTitle>
                        <Badge variant={getSeverityBadgeColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <AlertDescription className="mb-2">
                        {alert.message}
                      </AlertDescription>
                      <div className="text-sm text-muted-foreground mb-2">
                        Current: {formatValue(alert.current_value)} |
                        Confidence: {(alert.confidence * 100).toFixed(0)}% |
                        {formatTimestamp(alert.timestamp)}
                      </div>
                      {alert.suggested_actions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium mb-1">
                            Suggested Actions:
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {alert.suggested_actions.map((action, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-xs">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Live Insights</CardTitle>
          <CardDescription>AI-powered business intelligence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No insights yet. Connect to start receiving AI-powered analysis.
              </div>
            ) : (
              insights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(insight.severity)}
                      <span className="font-medium">{insight.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityBadgeColor(insight.severity)}>
                        {insight.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {insight.confidence_score.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  <div className="text-sm mb-3">
                    <span className="font-medium">Metric:</span>{" "}
                    {insight.metric_affected} |
                    <span className="font-medium"> Current:</span>{" "}
                    {formatValue(insight.current_value)}
                    {insight.expected_value && (
                      <>
                        | <span className="font-medium">Expected:</span>{" "}
                        {formatValue(insight.expected_value)}
                      </>
                    )}
                  </div>
                  {insight.recommendations.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Recommendations:
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {insight.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-xs">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-3">
                    {formatTimestamp(insight.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
