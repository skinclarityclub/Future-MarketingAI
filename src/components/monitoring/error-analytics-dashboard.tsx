"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Activity,
  TrendingUp,
  Bell,
  Clock,
  Target,
  Settings,
  RefreshCw,
  ChevronRight,
  Shield,
  Users,
  Mail,
  Phone,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

interface ErrorMetric {
  timestamp: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  count: number;
  resolved: number;
  escalated: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  category: string;
  threshold: number;
  enabled: boolean;
  escalationLevel: number;
  recipients: string[];
}

interface EscalationStep {
  level: number;
  delay: number; // minutes
  channels: string[];
  recipients: string[];
  description: string;
}

interface TrendData {
  time: string;
  errors: number;
  resolved: number;
  critical: number;
  escalated: number;
}

export function ErrorAnalyticsDashboard() {
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetric[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [escalationSteps, setEscalationSteps] = useState<EscalationStep[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [stats, setStats] = useState({
    totalErrors: 0,
    resolvedErrors: 0,
    criticalErrors: 0,
    escalatedErrors: 0,
    resolutionRate: 0,
    avgResponseTime: 0,
  });

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const response = await fetch("/api/error-handling/analytics");
      if (response.ok) {
        const data = await response.json();
        setErrorMetrics(data.metrics || []);
        setTrendData(data.trends || generateMockTrendData());
        setStats(data.stats || calculateStats(data.metrics || []));
      } else {
        // Use mock data as fallback
        const mockData = generateMockData();
        setErrorMetrics(mockData.metrics);
        setTrendData(mockData.trends);
        setStats(mockData.stats);
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      // Use mock data as fallback
      const mockData = generateMockData();
      setErrorMetrics(mockData.metrics);
      setTrendData(mockData.trends);
      setStats(mockData.stats);
    } finally {
      setIsLoading(false);
      setLastUpdate(new Date());
    }
  }, []);

  const fetchAlertRules = useCallback(async () => {
    try {
      const response = await fetch("/api/error-handling/alert-rules");
      if (response.ok) {
        const data = await response.json();
        setAlertRules(data.rules || []);
        setEscalationSteps(data.escalation || getDefaultEscalationSteps());
      } else {
        setAlertRules(getDefaultAlertRules());
        setEscalationSteps(getDefaultEscalationSteps());
      }
    } catch (error) {
      console.error("Failed to fetch alert rules:", error);
      setAlertRules(getDefaultAlertRules());
      setEscalationSteps(getDefaultEscalationSteps());
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
    fetchAlertRules();
  }, [fetchAnalyticsData, fetchAlertRules]);

  useEffect(() => {
    if (realTimeEnabled) {
      const interval = setInterval(fetchAnalyticsData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled, fetchAnalyticsData]);

  const generateMockTrendData = (): TrendData[] => {
    const data: TrendData[] = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        errors: Math.floor(Math.random() * 50) + 10,
        resolved: Math.floor(Math.random() * 45) + 8,
        critical: Math.floor(Math.random() * 10),
        escalated: Math.floor(Math.random() * 5),
      });
    }
    return data;
  };

  const generateMockData = () => {
    const metrics: ErrorMetric[] = [
      {
        timestamp: new Date().toISOString(),
        category: "API_ERROR",
        severity: "high",
        count: 15,
        resolved: 12,
        escalated: true,
      },
      {
        timestamp: new Date(Date.now() - 30000).toISOString(),
        category: "SYSTEM_ERROR",
        severity: "critical",
        count: 3,
        resolved: 1,
        escalated: true,
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        category: "VALIDATION_ERROR",
        severity: "medium",
        count: 8,
        resolved: 8,
        escalated: false,
      },
    ];

    return {
      metrics,
      trends: generateMockTrendData(),
      stats: calculateStats(metrics),
    };
  };

  const calculateStats = (metrics: ErrorMetric[]) => {
    const totalErrors = metrics.reduce((sum, m) => sum + m.count, 0);
    const resolvedErrors = metrics.reduce((sum, m) => sum + m.resolved, 0);
    const criticalErrors = metrics
      .filter(m => m.severity === "critical")
      .reduce((sum, m) => sum + m.count, 0);
    const escalatedErrors = metrics
      .filter(m => m.escalated)
      .reduce((sum, m) => sum + m.count, 0);

    return {
      totalErrors,
      resolvedErrors,
      criticalErrors,
      escalatedErrors,
      resolutionRate:
        totalErrors > 0 ? Math.round((resolvedErrors / totalErrors) * 100) : 0,
      avgResponseTime: Math.floor(Math.random() * 300) + 60, // Mock response time in seconds
    };
  };

  const getDefaultAlertRules = (): AlertRule[] => [
    {
      id: "1",
      name: "High Error Rate",
      category: "API_ERROR",
      threshold: 50,
      enabled: true,
      escalationLevel: 1,
      recipients: ["admin@example.com", "ops-team@example.com"],
    },
    {
      id: "2",
      name: "Critical System Errors",
      category: "SYSTEM_ERROR",
      threshold: 1,
      enabled: true,
      escalationLevel: 3,
      recipients: ["admin@example.com", "dev-team@example.com"],
    },
  ];

  const getDefaultEscalationSteps = (): EscalationStep[] => [
    {
      level: 1,
      delay: 0,
      channels: ["email"],
      recipients: ["ops-team@example.com"],
      description: "Immediate notification to operations team",
    },
    {
      level: 2,
      delay: 15,
      channels: ["email", "slack"],
      recipients: ["team-lead@example.com"],
      description: "Escalate to team lead after 15 minutes",
    },
    {
      level: 3,
      delay: 30,
      channels: ["email", "slack", "phone"],
      recipients: ["admin@example.com"],
      description: "Emergency escalation to admin after 30 minutes",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
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

  const toggleRealTime = () => {
    setRealTimeEnabled(!realTimeEnabled);
  };

  const toggleAlertRule = async (ruleId: string) => {
    setAlertRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );

    try {
      await fetch("/api/error-handling/alert-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          ruleId,
        }),
      });
    } catch (error) {
      console.error("Failed to toggle alert rule:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Error Analytics Dashboard</h2>
          <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Error Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString("nl-NL")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NormalButton
            variant="outline"
            size="sm"
            onClick={toggleRealTime}
            className={realTimeEnabled ? "text-green-600" : "text-gray-600"}
          >
            <Activity className="h-4 w-4 mr-2" />
            {realTimeEnabled ? "Real-time ON" : "Real-time OFF"}
          </NormalButton>
          <NormalButton
            variant="outline"
            size="sm"
            onClick={fetchAnalyticsData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </NormalButton>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Errors
                </p>
                <p className="text-2xl font-bold">{stats.totalErrors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Resolution Rate
                </p>
                <p className="text-2xl font-bold">{stats.resolutionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={stats.resolutionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Critical Errors
                </p>
                <p className="text-2xl font-bold">{stats.criticalErrors}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="alerts">Alert Management</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Error Trends (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="critical"
                      stroke="#f97316"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Error Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Error Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" />
                    <Bar dataKey="resolved" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid gap-6">
            {/* Recent Errors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Error Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getSeverityColor(metric.severity)}`}
                        />
                        <div>
                          <p className="font-medium">{metric.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(metric.timestamp).toLocaleString("nl-NL")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getSeverityBadgeVariant(metric.severity)}
                        >
                          {metric.severity}
                        </Badge>
                        <span className="text-sm">
                          {metric.count} errors, {metric.resolved} resolved
                        </span>
                        {metric.escalated && (
                          <Badge variant="destructive">Escalated</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alert Rules Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertRules.map(rule => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant="outline">{rule.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Threshold: {rule.threshold} errors
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Recipients: {rule.recipients.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.enabled ? "default" : "secondary"}>
                        {rule.enabled ? "Active" : "Disabled"}
                      </Badge>
                      <NormalButton
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAlertRule(rule.id)}
                      >
                        {rule.enabled ? "Disable" : "Enable"}
                      </NormalButton>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChevronRight className="h-5 w-5" />
                Escalation Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escalationSteps.map((step, index) => (
                  <div key={step.level} className="relative">
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {step.level}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">
                          Level {step.level} Escalation
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {step.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {step.delay === 0
                                ? "Immediate"
                                : `${step.delay} min delay`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{step.channels.join(", ")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{step.recipients.length} recipient(s)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < escalationSteps.length - 1 && (
                      <div className="flex justify-center my-2">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
