"use client";

import { useState, useEffect } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Users,
  Heart,
  MessageCircle,
  Share,
  RefreshCw,
  Bell,
  Filter,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface CompetitorData {
  id: string;
  name: string;
  platform: string;
  url: string;
  metrics: {
    followers: number;
    engagement_rate: number;
    avg_likes: number;
    avg_comments: number;
    avg_shares: number;
    post_frequency: number;
    content_performance: number;
  };
  last_scraped: string;
  status: "active" | "inactive" | "error";
}

interface CompetitorAlert {
  id: string;
  competitor_id: string;
  alert_type:
    | "performance_drop"
    | "performance_spike"
    | "new_content"
    | "engagement_change";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  threshold_value: number;
  current_value: number;
  percentage_change: number;
  created_at: string;
  acknowledged: boolean;
}

interface CompetitorMonitoringDashboardProps {
  locale: string;
}

export function CompetitorMonitoringDashboard({
  locale,
}: CompetitorMonitoringDashboardProps) {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call with mock data
    setTimeout(() => {
      setDashboardData({
        summary: {
          total_competitors: 12,
          active_competitors: 10,
          pending_alerts: 3,
          critical_alerts: 1,
        },
        platform_breakdown: [
          { platform: "instagram", count: 5, percentage: 41.7 },
          { platform: "tiktok", count: 3, percentage: 25.0 },
          { platform: "linkedin", count: 2, percentage: 16.7 },
          { platform: "youtube", count: 2, percentage: 16.7 },
        ],
        top_performers: [
          {
            name: "Competitor A",
            metrics: { engagement_rate: 8.5 },
          },
        ],
      });

      setCompetitors([
        {
          id: "1",
          name: "Competitor A",
          platform: "instagram",
          url: "https://instagram.com/competitor-a",
          metrics: {
            followers: 45000,
            engagement_rate: 8.5,
            avg_likes: 1200,
            avg_comments: 89,
            avg_shares: 45,
            post_frequency: 5,
            content_performance: 85,
          },
          last_scraped: new Date().toISOString(),
          status: "active",
        },
        {
          id: "2",
          name: "Competitor B",
          platform: "tiktok",
          url: "https://tiktok.com/@competitor-b",
          metrics: {
            followers: 78000,
            engagement_rate: 6.2,
            avg_likes: 2100,
            avg_comments: 156,
            avg_shares: 89,
            post_frequency: 7,
            content_performance: 72,
          },
          last_scraped: new Date().toISOString(),
          status: "active",
        },
        {
          id: "3",
          name: "Competitor C",
          platform: "linkedin",
          url: "https://linkedin.com/company/competitor-c",
          metrics: {
            followers: 23000,
            engagement_rate: 4.8,
            avg_likes: 180,
            avg_comments: 34,
            avg_shares: 67,
            post_frequency: 3,
            content_performance: 68,
          },
          last_scraped: new Date().toISOString(),
          status: "active",
        },
      ]);

      setAlerts([
        {
          id: "alert-1",
          competitor_id: "1",
          alert_type: "performance_spike",
          severity: "high",
          message:
            "Competitor A heeft een significante stijging in engagement rate",
          threshold_value: 6.0,
          current_value: 8.5,
          percentage_change: 41.7,
          created_at: new Date().toISOString(),
          acknowledged: false,
        },
        {
          id: "alert-2",
          competitor_id: "2",
          alert_type: "engagement_change",
          severity: "medium",
          message:
            "Competitor B toont verhoogde activiteit in de afgelopen week",
          threshold_value: 5.0,
          current_value: 6.2,
          percentage_change: 24.0,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          acknowledged: false,
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const triggerScraping = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const platformColors = {
    instagram: "#E4405F",
    tiktok: "#000000",
    linkedin: "#0077B5",
    youtube: "#FF0000",
    facebook: "#1877F2",
  };

  // Mock data for charts
  const engagementTrends = [
    { name: "Jan", ours: 4.2, competitor_avg: 3.8 },
    { name: "Feb", ours: 4.5, competitor_avg: 4.1 },
    { name: "Mar", ours: 4.1, competitor_avg: 4.3 },
    { name: "Apr", ours: 4.8, competitor_avg: 4.0 },
    { name: "May", ours: 5.1, competitor_avg: 4.5 },
    { name: "Jun", ours: 4.9, competitor_avg: 4.8 },
  ];

  const performanceComparison = competitors.map(comp => ({
    name: comp.name,
    engagement: comp.metrics.engagement_rate,
    followers: comp.metrics.followers / 1000,
    platform: comp.platform,
  }));

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading competitor data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <NormalButton onClick={triggerScraping} disabled={refreshing}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Updating..." : "Update Data"}
          </NormalButton>
          <NormalButton variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </NormalButton>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <select
            value={selectedPlatform}
            onChange={e => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
      </div>

      {/* Dashboard Summary */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Competitors
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.summary.total_competitors}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.summary.active_competitors} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Alerts
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.summary.pending_alerts}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.summary.critical_alerts} critical
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Top Performer
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.top_performers[0]?.metrics.engagement_rate.toFixed(
                  1
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.top_performers[0]?.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Updated
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {competitors[0]
                  ? new Date(competitors[0].last_scraped).toLocaleTimeString()
                  : "--:--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {competitors.length} competitors monitored
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert Section */}
      {alerts.filter(alert => !alert.acknowledged).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Active Alerts (
              {alerts.filter(alert => !alert.acknowledged).length})
            </CardTitle>
            <CardDescription>
              Recent competitor activity requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts
                .filter(alert => !alert.acknowledged)
                .slice(0, 5)
                .map(alert => (
                  <Alert
                    key={alert.id}
                    className="border-l-4 border-l-orange-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <AlertTitle className="flex items-center">
                          <Badge
                            className={`mr-2 ${getSeverityColor(alert.severity)} text-white`}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {alert.alert_type.replace("_", " ").toUpperCase()}
                        </AlertTitle>
                        <AlertDescription className="mt-1">
                          {alert.message}
                          <div className="text-sm text-muted-foreground mt-1">
                            Change: {alert.percentage_change.toFixed(1)}% |
                            Current: {alert.current_value} | Threshold:{" "}
                            {alert.threshold_value}
                          </div>
                        </AlertDescription>
                      </div>
                      <NormalButton
                        size="sm"
                        variant="secondary"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </NormalButton>
                    </div>
                  </Alert>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate Trends</CardTitle>
                <CardDescription>
                  Your performance vs competitor average
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ours"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Our Performance"
                    />
                    <Line
                      type="monotone"
                      dataKey="competitor_avg"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Competitor Average"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>
                  Competitors across different platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.platform_breakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ platform, percentage }) =>
                        `${platform} (${percentage.toFixed(1)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(dashboardData?.platform_breakdown || []).map(
                        (entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              platformColors[
                                entry.platform as keyof typeof platformColors
                              ] || "#8884d8"
                            }
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Competitor Performance Comparison</CardTitle>
              <CardDescription>
                Engagement rates across all monitored competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="engagement"
                    fill="#8884d8"
                    name="Engagement Rate %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitors.map(competitor => (
              <Card key={competitor.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{competitor.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`${getStatusColor(competitor.status)} text-white`}
                      >
                        {competitor.status}
                      </Badge>
                      <Badge variant="outline">{competitor.platform}</Badge>
                    </div>
                  </div>
                  <CardDescription>{competitor.url}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {(competitor.metrics.followers / 1000).toFixed(1)}K
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Followers
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {competitor.metrics.engagement_rate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Engagement
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Likes:</span>
                        <span>{competitor.metrics.avg_likes}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg Comments:</span>
                        <span>{competitor.metrics.avg_comments}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Post Frequency:</span>
                        <span>{competitor.metrics.post_frequency}/week</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Last updated:{" "}
                        {new Date(competitor.last_scraped).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  AI-generated insights from competitor analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                      Top Performing Strategy
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Competitors posting 5+ times per week show 23% higher
                      engagement rates
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300">
                      Opportunity Gap
                    </h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      Your engagement rate is 15% below the competitor average
                      this month
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-700 dark:text-green-300">
                      Winning Platform
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Instagram shows the highest ROI potential based on
                      competitor success
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Actionable insights based on competitor analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">
                        Increase Posting Frequency
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Top competitors post 5-7 times per week vs your current
                        3 times
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Heart className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Optimize Content Timing</h4>
                      <p className="text-sm text-muted-foreground">
                        Competitors get 40% more engagement posting between 2-4
                        PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Increase Engagement</h4>
                      <p className="text-sm text-muted-foreground">
                        Focus on content types that generate more comments and
                        shares
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>
                All competitor monitoring alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg ${alert.acknowledged ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge
                            className={`${getSeverityColor(alert.severity)} text-white`}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">
                            {alert.alert_type.replace("_", " ").toUpperCase()}
                          </span>
                          {alert.acknowledged && (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600"
                            >
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>
                            Change: {alert.percentage_change.toFixed(1)}%
                          </span>
                          <span>Current: {alert.current_value}</span>
                          <span>Threshold: {alert.threshold_value}</span>
                          <span>
                            {new Date(alert.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <NormalButton
                          size="sm"
                          variant="secondary"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </NormalButton>
                      )}
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No alerts generated yet. Start monitoring competitors to see
                    alerts here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
