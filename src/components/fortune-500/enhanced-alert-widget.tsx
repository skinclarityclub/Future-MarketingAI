"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Filter,
  MoreVertical,
  Bot,
  Bell,
  BellOff,
  Settings,
  X,
} from "lucide-react";

interface RealtimeAlert {
  id: string;
  type: "performance" | "security" | "business" | "system" | "anomaly";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  metric?: string;
  currentValue?: number;
  threshold?: number;
  confidence?: number;
  acknowledged?: boolean;
  resolved?: boolean;
  suggestedActions?: string[];
  trend?: "increasing" | "decreasing" | "stable";
  relatedAlerts?: string[];
}

interface EnhancedAlertWidgetProps {
  className?: string;
  onAlertClick?: (alert: RealtimeAlert) => void;
  onAIAssistanceRequest?: (alert: RealtimeAlert) => void;
  maxAlertsDisplay?: number;
  enableSound?: boolean;
  autoRefresh?: boolean;
  showFilters?: boolean;
}

export default function EnhancedAlertWidget({
  className,
  onAlertClick,
  onAIAssistanceRequest,
  maxAlertsDisplay = 8,
  enableSound = true,
  autoRefresh = true,
  showFilters = true,
}: EnhancedAlertWidgetProps) {
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<RealtimeAlert[]>([]);
  const [selectedSeverityFilter, setSelectedSeverityFilter] =
    useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(enableSound);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  // Mock real-time alerts data
  const generateMockAlerts = useCallback((): RealtimeAlert[] => {
    const alertTypes = [
      "performance",
      "security",
      "business",
      "system",
      "anomaly",
    ] as const;
    const severities = ["low", "medium", "high", "critical"] as const;
    const sources = [
      "Marketing Campaign",
      "n8n Workflow",
      "ClickUp Integration",
      "Social Media API",
      "Analytics Service",
      "Payment Gateway",
    ];

    const sampleAlerts: RealtimeAlert[] = [
      {
        id: "1",
        type: "performance",
        severity: "high",
        title: "High Response Time Detected",
        message: "Social Media API response time exceeding 3.2s threshold",
        timestamp: new Date(Date.now() - 120000),
        source: "Social Media API",
        metric: "response_time",
        currentValue: 3247,
        threshold: 2000,
        confidence: 95,
        acknowledged: false,
        resolved: false,
        trend: "increasing",
        suggestedActions: [
          "Check API rate limits",
          "Review network connectivity",
          "Scale up service instances",
        ],
      },
      {
        id: "2",
        type: "business",
        severity: "critical",
        title: "Campaign ROI Below Target",
        message: "Q1 Lead Generation campaign performing 23% below target",
        timestamp: new Date(Date.now() - 300000),
        source: "Marketing Campaign",
        metric: "roi_percentage",
        currentValue: 18.5,
        threshold: 24.0,
        confidence: 88,
        acknowledged: false,
        resolved: false,
        trend: "decreasing",
        suggestedActions: [
          "Review targeting parameters",
          "Optimize ad creative",
          "Increase budget allocation",
        ],
      },
      {
        id: "3",
        type: "system",
        severity: "medium",
        title: "n8n Workflow Execution Delayed",
        message: "Content publishing workflow delayed by 15 minutes",
        timestamp: new Date(Date.now() - 600000),
        source: "n8n Workflow",
        metric: "execution_delay",
        currentValue: 15,
        threshold: 5,
        confidence: 92,
        acknowledged: true,
        resolved: false,
        trend: "stable",
        suggestedActions: [
          "Check workflow dependencies",
          "Review queue processing",
        ],
      },
      {
        id: "4",
        type: "anomaly",
        severity: "high",
        title: "Unusual Traffic Pattern",
        message: "Traffic spike detected: 340% above normal baseline",
        timestamp: new Date(Date.now() - 900000),
        source: "Analytics Service",
        metric: "traffic_volume",
        currentValue: 4400,
        threshold: 1000,
        confidence: 76,
        acknowledged: false,
        resolved: false,
        trend: "increasing",
        suggestedActions: [
          "Investigate traffic source",
          "Monitor server capacity",
          "Check for DDoS activity",
        ],
      },
      {
        id: "5",
        type: "security",
        severity: "critical",
        title: "Multiple Failed Login Attempts",
        message: "Detected 47 failed login attempts from suspicious IPs",
        timestamp: new Date(Date.now() - 180000),
        source: "Security Monitor",
        metric: "failed_logins",
        currentValue: 47,
        threshold: 10,
        confidence: 99,
        acknowledged: false,
        resolved: false,
        trend: "increasing",
        suggestedActions: [
          "Block suspicious IPs",
          "Enable two-factor authentication",
          "Review access logs",
        ],
      },
    ];

    return sampleAlerts;
  }, []);

  // Initialize alerts
  useEffect(() => {
    const initialAlerts = generateMockAlerts();
    setAlerts(initialAlerts);
    setLastAlertCount(initialAlerts.length);
  }, [generateMockAlerts]);

  // Filter alerts based on criteria
  useEffect(() => {
    let filtered = alerts;

    if (selectedSeverityFilter !== "all") {
      filtered = filtered.filter(
        alert => alert.severity === selectedSeverityFilter
      );
    }

    if (selectedTypeFilter !== "all") {
      filtered = filtered.filter(alert => alert.type === selectedTypeFilter);
    }

    if (!showAcknowledged) {
      filtered = filtered.filter(alert => !alert.acknowledged);
    }

    // Sort by severity and timestamp
    filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff =
        severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setFilteredAlerts(filtered.slice(0, maxAlertsDisplay));
  }, [
    alerts,
    selectedSeverityFilter,
    selectedTypeFilter,
    showAcknowledged,
    maxAlertsDisplay,
  ]);

  // Auto-refresh alerts
  useEffect(() => {
    if (!autoRefresh) return;

    refreshIntervalRef.current = setInterval(() => {
      // Simulate new alerts or updates
      const newAlerts = generateMockAlerts();

      // Check for new alerts and play sound
      if (soundEnabled && newAlerts.length > lastAlertCount) {
        playAlertSound();
      }

      setAlerts(newAlerts);
      setLastAlertCount(newAlerts.length);
    }, 30000); // Refresh every 30 seconds

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, generateMockAlerts, lastAlertCount, soundEnabled]);

  const playAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "high":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <Activity className="w-4 h-4" />;
      case "security":
        return <AlertTriangle className="w-4 h-4" />;
      case "business":
        return <TrendingDown className="w-4 h-4" />;
      case "system":
        return <Zap className="w-4 h-4" />;
      case "anomaly":
        return <Eye className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-3 h-3 text-red-400" />;
      case "decreasing":
        return <TrendingDown className="w-3 h-3 text-green-400" />;
      case "stable":
        return <Activity className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, resolved: true, acknowledged: true }
          : alert
      )
    );
  };

  const getActiveAlertsCount = () => {
    return alerts.filter(alert => !alert.acknowledged && !alert.resolved)
      .length;
  };

  const getCriticalAlertsCount = () => {
    return alerts.filter(
      alert => alert.severity === "critical" && !alert.resolved
    ).length;
  };

  return (
    <Card
      className={cn(
        "relative h-full w-full overflow-hidden",
        "bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-xl",
        "border border-slate-700/50 shadow-2xl",
        className
      )}
    >
      {/* Alert sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/alert-sound.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <CardHeader className="pb-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              animate={{
                scale: getCriticalAlertsCount() > 0 ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  getCriticalAlertsCount() > 0
                    ? "bg-red-500/20 border border-red-500/30"
                    : "bg-blue-500/20 border border-blue-500/30"
                )}
              >
                <AlertTriangle
                  className={cn(
                    "w-5 h-5",
                    getCriticalAlertsCount() > 0
                      ? "text-red-400"
                      : "text-blue-400"
                  )}
                />
              </div>
              {getActiveAlertsCount() > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {getActiveAlertsCount()}
                  </span>
                </div>
              )}
            </motion.div>

            <div>
              <CardTitle className="text-lg font-bold text-white">
                Real-Time Alerts
              </CardTitle>
              <p className="text-sm text-slate-400">
                {getActiveAlertsCount()} active • {getCriticalAlertsCount()}{" "}
                critical
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NormalButton
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "w-8 h-8 p-0",
                soundEnabled
                  ? "text-green-400 hover:text-green-300"
                  : "text-gray-500 hover:text-gray-400"
              )}
            >
              {soundEnabled ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </NormalButton>
            <NormalButton
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-slate-400 hover:text-slate-300"
            >
              <Settings className="w-4 h-4" />
            </NormalButton>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedSeverityFilter}
                onChange={e => setSelectedSeverityFilter(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <select
              value={selectedTypeFilter}
              onChange={e => setSelectedTypeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
            >
              <option value="all">All Types</option>
              <option value="performance">Performance</option>
              <option value="security">Security</option>
              <option value="business">Business</option>
              <option value="system">System</option>
              <option value="anomaly">Anomaly</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={showAcknowledged}
                onChange={e => setShowAcknowledged(e.target.checked)}
                className="rounded"
              />
              Show acknowledged
            </label>
          </div>
        )}
      </CardHeader>

      {/* Alerts List */}
      <CardContent className="p-0 h-full overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-32 text-slate-400"
              >
                <CheckCircle className="w-8 h-8 mb-2" />
                <p className="text-sm">No alerts matching filters</p>
              </motion.div>
            ) : (
              filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer",
                    alert.acknowledged && "opacity-60",
                    expandedAlert === alert.id && "bg-slate-800/30"
                  )}
                  onClick={() => {
                    setExpandedAlert(
                      expandedAlert === alert.id ? null : alert.id
                    );
                    onAlertClick?.(alert);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Severity indicator */}
                    <div
                      className={cn(
                        "w-2 h-full rounded-full flex-shrink-0 mt-1",
                        alert.severity === "critical" && "bg-red-500",
                        alert.severity === "high" && "bg-orange-500",
                        alert.severity === "medium" && "bg-yellow-500",
                        alert.severity === "low" && "bg-blue-500"
                      )}
                    />

                    <div className="flex-1 min-w-0">
                      {/* Alert header */}
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(alert.type)}
                        <h3 className="font-medium text-white truncate">
                          {alert.title}
                        </h3>
                        {getTrendIcon(alert.trend)}
                        <Badge
                          className={cn(
                            "text-xs border",
                            getSeverityColor(alert.severity)
                          )}
                        >
                          {alert.severity}
                        </Badge>
                      </div>

                      {/* Alert message */}
                      <p className="text-sm text-slate-300 mb-2 line-clamp-2">
                        {alert.message}
                      </p>

                      {/* Alert metadata */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>{alert.source}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                          {alert.confidence && (
                            <span>{alert.confidence}% confidence</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {alert.acknowledged && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          <NormalButton
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              onAIAssistanceRequest?.(alert);
                            }}
                            className="w-6 h-6 p-0 text-purple-400 hover:text-purple-300"
                          >
                            <Bot className="w-3 h-3" />
                          </NormalButton>
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {expandedAlert === alert.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 pt-3 border-t border-slate-700/50"
                          >
                            {/* Metrics */}
                            {alert.metric && (
                              <div className="mb-3">
                                <div className="text-xs text-slate-400 mb-1">
                                  Metrics
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-white">
                                    Current: {alert.currentValue}
                                  </span>
                                  {alert.threshold && (
                                    <span className="text-slate-400">
                                      Threshold: {alert.threshold}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Suggested Actions */}
                            {alert.suggestedActions &&
                              alert.suggestedActions.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs text-slate-400 mb-2">
                                    Suggested Actions
                                  </div>
                                  <ul className="space-y-1">
                                    {alert.suggestedActions.map(
                                      (action, idx) => (
                                        <li
                                          key={idx}
                                          className="text-sm text-slate-300 flex items-center gap-2"
                                        >
                                          <div className="w-1 h-1 rounded-full bg-blue-400" />
                                          {action}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {!alert.acknowledged && (
                                <NormalButton
                                  size="sm"
                                  variant="secondary"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleAcknowledgeAlert(alert.id);
                                  }}
                                  className="text-xs"
                                >
                                  Acknowledge
                                </NormalButton>
                              )}
                              {!alert.resolved && (
                                <NormalButton
                                  size="sm"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleResolveAlert(alert.id);
                                  }}
                                  className="text-xs bg-green-600 hover:bg-green-700"
                                >
                                  Resolve
                                </NormalButton>
                              )}
                              <NormalButton
                                size="sm"
                                variant="ghost"
                                onClick={e => {
                                  e.stopPropagation();
                                  onAIAssistanceRequest?.(alert);
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300"
                              >
                                <Bot className="w-3 h-3 mr-1" />
                                AI Assist
                              </NormalButton>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
