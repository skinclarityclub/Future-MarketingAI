"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Shield,
  RotateCcw,
  Play,
  Pause,
  TrendingUp,
} from "lucide-react";

// Types for Blotato monitoring data
interface BlotatoApiHealth {
  status: "healthy" | "degraded" | "down";
  response_time_ms: number;
  rate_limit_remaining: number;
  rate_limit_reset: string;
  last_checked: string;
  uptime_percentage: number;
  error_rate: number;
}

interface PostingStatus {
  id: string;
  content_id: string;
  title: string;
  platform: string;
  status: "pending" | "publishing" | "published" | "failed" | "retrying";
  scheduled_time: string;
  published_time?: string;
  retry_count: number;
  error_message?: string;
  blotato_response?: any;
  performance_metrics?: {
    reach?: number;
    engagement?: number;
    clicks?: number;
  };
}

interface PlatformMetrics {
  platform: string;
  posts_today: number;
  success_rate: number;
  avg_response_time: number;
  rate_limit_status: "ok" | "warning" | "critical";
  last_post: string;
  queue_size: number;
}

interface BlotatoMonitoringData {
  api_health: BlotatoApiHealth;
  posting_queue: PostingStatus[];
  platform_metrics: PlatformMetrics[];
  real_time_stats: {
    posts_published_today: number;
    posts_failed_today: number;
    posts_in_queue: number;
    avg_publish_time: number;
    success_rate_24h: number;
    retry_success_rate: number;
  };
  performance_timeline: Array<{
    time: string;
    published: number;
    failed: number;
    response_time: number;
  }>;
  alerts: Array<{
    id: string;
    type: "error" | "warning" | "info";
    message: string;
    platform?: string;
    timestamp: string;
    acknowledged: boolean;
  }>;
}

export default function BlotatoMonitoringDashboard() {
  const [monitoringData, setMonitoringData] =
    useState<BlotatoMonitoringData | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [autoRefreshInterval] = useState(5); // seconds

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      // Mock data - in production would fetch from actual APIs
      const mockData: BlotatoMonitoringData = {
        api_health: {
          status: "healthy",
          response_time_ms: 245,
          rate_limit_remaining: 847,
          rate_limit_reset: new Date(Date.now() + 3600000).toISOString(),
          last_checked: new Date().toISOString(),
          uptime_percentage: 99.7,
          error_rate: 0.3,
        },
        posting_queue: [
          {
            id: "post_001",
            content_id: "content_123",
            title: "Nieuwe productlancering: SKC Analytics Pro",
            platform: "linkedin",
            status: "publishing",
            scheduled_time: new Date(Date.now() + 300000).toISOString(),
            retry_count: 0,
          },
          {
            id: "post_002",
            content_id: "content_124",
            title: "Customer Success Story: 300% Groei",
            platform: "instagram",
            status: "published",
            scheduled_time: new Date(Date.now() - 1800000).toISOString(),
            published_time: new Date(Date.now() - 1700000).toISOString(),
            retry_count: 0,
            performance_metrics: {
              reach: 2340,
              engagement: 187,
              clicks: 23,
            },
          },
          {
            id: "post_003",
            content_id: "content_125",
            title: "AI-Driven Marketing Trends 2024",
            platform: "twitter",
            status: "failed",
            scheduled_time: new Date(Date.now() - 900000).toISOString(),
            retry_count: 2,
            error_message: "Platform rate limit exceeded",
          },
        ],
        platform_metrics: [
          {
            platform: "linkedin",
            posts_today: 8,
            success_rate: 95.5,
            avg_response_time: 1200,
            rate_limit_status: "ok",
            last_post: new Date(Date.now() - 1800000).toISOString(),
            queue_size: 3,
          },
          {
            platform: "instagram",
            posts_today: 5,
            success_rate: 88.2,
            avg_response_time: 2100,
            rate_limit_status: "warning",
            last_post: new Date(Date.now() - 3600000).toISOString(),
            queue_size: 2,
          },
        ],
        real_time_stats: {
          posts_published_today: 31,
          posts_failed_today: 4,
          posts_in_queue: 10,
          avg_publish_time: 1425,
          success_rate_24h: 88.6,
          retry_success_rate: 72.3,
        },
        performance_timeline: [
          { time: "14:00", published: 12, failed: 1, response_time: 1200 },
          { time: "14:15", published: 15, failed: 2, response_time: 1350 },
          { time: "14:30", published: 18, failed: 2, response_time: 1180 },
          { time: "14:45", published: 23, failed: 3, response_time: 1420 },
          { time: "15:00", published: 28, failed: 4, response_time: 1580 },
          { time: "15:15", published: 31, failed: 4, response_time: 1425 },
        ],
        alerts: [
          {
            id: "alert_001",
            type: "warning",
            message: "Twitter rate limit approaching (15 requests remaining)",
            platform: "twitter",
            timestamp: new Date(Date.now() - 300000).toISOString(),
            acknowledged: false,
          },
          {
            id: "alert_002",
            type: "error",
            message: "Instagram posting failed: Invalid access token",
            platform: "instagram",
            timestamp: new Date(Date.now() - 600000).toISOString(),
            acknowledged: false,
          },
        ],
      };

      setMonitoringData(mockData);
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    fetchMonitoringData();

    if (isLive) {
      const interval = setInterval(
        fetchMonitoringData,
        autoRefreshInterval * 1000
      );
      return () => clearInterval(interval);
    }
  }, [isLive, autoRefreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "publishing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "retrying":
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleRetryPost = async (postId: string) => {
    try {
      console.log("Retrying post:", postId);
      await fetchMonitoringData();
    } catch (error) {
      console.error("Failed to retry post:", error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      console.log("Acknowledging alert:", alertId);
      await fetchMonitoringData();
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  if (!monitoringData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">
            Loading Blotato monitoring data...
          </p>
        </div>
      </div>
    );
  }

  const {
    api_health,
    posting_queue,
    platform_metrics,
    real_time_stats,
    performance_timeline,
    alerts,
  } = monitoringData;

  return (
    <div className="space-y-6 p-6">
      {/* Header with live status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Blotato Real-Time Monitoring
          </h2>
          <p className="text-muted-foreground">
            Live monitoring van Blotato API en posting status
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
            />
            <span className="text-sm text-muted-foreground">
              {isLive ? "Live" : "Paused"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <NormalButton
              onClick={() => setIsLive(!isLive)}
              size="sm"
              variant={isLive ? "destructive" : "default"}
            >
              {isLive ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isLive ? "Pause" : "Start"}
            </NormalButton>
          </div>
        </div>
      </div>

      {/* API Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Blotato API Health</span>
            <Badge
              variant={
                api_health.status === "healthy" ? "secondary" : "destructive"
              }
            >
              {api_health.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getHealthStatusColor(api_health.status)}`}
              >
                {api_health.response_time_ms}ms
              </div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {api_health.uptime_percentage}%
              </div>
              <div className="text-sm text-muted-foreground">Uptime (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {api_health.rate_limit_remaining}
              </div>
              <div className="text-sm text-muted-foreground">
                Rate Limit Remaining
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {api_health.error_rate}%
              </div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {real_time_stats.posts_published_today}
            </div>
            <div className="text-xs text-muted-foreground">
              +{real_time_stats.posts_published_today - 25} from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {real_time_stats.posts_failed_today}
            </div>
            <div className="text-xs text-muted-foreground">
              {real_time_stats.posts_failed_today > 2
                ? "Above average"
                : "Normal"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Queue</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {real_time_stats.posts_in_queue}
            </div>
            <div className="text-xs text-muted-foreground">
              ~
              {Math.round(
                (real_time_stats.posts_in_queue *
                  real_time_stats.avg_publish_time) /
                  1000 /
                  60
              )}
              min remaining
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Publish Time
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(real_time_stats.avg_publish_time / 1000).toFixed(1)}s
            </div>
            <div className="text-xs text-muted-foreground">
              {real_time_stats.avg_publish_time < 1500 ? "Fast" : "Slow"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Success Rate 24h
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {real_time_stats.success_rate_24h.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {real_time_stats.success_rate_24h > 90
                ? "Excellent"
                : "Needs attention"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retry Success</CardTitle>
            <RotateCcw className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {real_time_stats.retry_success_rate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {real_time_stats.retry_success_rate > 70 ? "Good" : "Poor"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Posting Queue</TabsTrigger>
          <TabsTrigger value="platforms">Platform Status</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Posting Queue</CardTitle>
              <CardDescription>
                Real-time status van alle posts in de Blotato queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posting_queue.map(post => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(post.status)}
                            <Badge
                              variant={
                                post.status === "published"
                                  ? "secondary"
                                  : post.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {post.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{post.title}</div>
                          {post.error_message && (
                            <div className="text-xs text-red-500">
                              {post.error_message}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{post.platform}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(post.scheduled_time).toLocaleString(
                              "nl-NL"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {post.retry_count > 0 ? (
                              <Badge variant="destructive">
                                {post.retry_count}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.status === "failed" && (
                            <NormalButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetryPost(post.id)}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Retry
                            </NormalButton>
                          )}
                          {post.performance_metrics && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Reach: {post.performance_metrics.reach} |
                              Engagement: {post.performance_metrics.engagement}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {platform_metrics.map(platform => (
              <Card key={platform.platform}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{platform.platform}</span>
                    <Badge
                      variant={
                        platform.rate_limit_status === "ok"
                          ? "default"
                          : platform.rate_limit_status === "warning"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {platform.rate_limit_status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold">
                          {platform.posts_today}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Posts Today
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {platform.success_rate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Success Rate
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {platform.avg_response_time}ms
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Avg Response
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {platform.queue_size}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          In Queue
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span>{platform.success_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={platform.success_rate} className="h-2" />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last post:{" "}
                      {new Date(platform.last_post).toLocaleString("nl-NL")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Performance Timeline</CardTitle>
              <CardDescription>
                Real-time publishing metrics en response times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performance_timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="published"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Published"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="failed"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Failed"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="response_time"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Response Time (ms)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts & Issues</CardTitle>
              <CardDescription>
                System alerts en operationele issues die aandacht vereisen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <Alert
                    key={alert.id}
                    variant={alert.type === "error" ? "destructive" : "default"}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <AlertTitle className="flex items-center space-x-2">
                          {alert.type === "error" && (
                            <XCircle className="h-4 w-4" />
                          )}
                          {alert.type === "warning" && (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          {alert.type === "info" && (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          <span className="capitalize">{alert.type}</span>
                          {alert.platform && (
                            <Badge variant="outline">{alert.platform}</Badge>
                          )}
                        </AlertTitle>
                        <AlertDescription className="mt-2">
                          {alert.message}
                        </AlertDescription>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(alert.timestamp).toLocaleString("nl-NL")}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!alert.acknowledged && (
                          <NormalButton
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acknowledge
                          </NormalButton>
                        )}
                        {alert.acknowledged && (
                          <Badge variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acknowledged
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
