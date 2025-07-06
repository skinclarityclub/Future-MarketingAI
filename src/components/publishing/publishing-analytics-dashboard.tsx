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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Pause,
  Play,
  RefreshCw,
  Share2,
  StopCircle,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  liveAnalyticsService,
  PublishingMetrics,
} from "@/lib/analytics/live-analytics-service";

// Mock data interfaces
interface PlatformMetrics {
  platform: string;
  published: number;
  failed: number;
  successRate: number;
  avgResponseTime: number;
  rateLimitRemaining: number;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
}

interface PublishingInsight {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  description: string;
  timestamp: Date;
  platform?: string;
  actionRequired: boolean;
}

interface ConflictItem {
  id: string;
  contentId: string;
  title: string;
  platforms: string[];
  conflictType:
    | "rate_limit"
    | "duplicate_content"
    | "platform_error"
    | "scheduling";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  suggestedAction: string;
  timestamp: Date;
}

const PublishingAnalyticsDashboard: React.FC = () => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics[]>([]);
  const [publishingInsights, setPublishingInsights] = useState<
    PublishingInsight[]
  >([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);

  // Load live publishing data
  useEffect(() => {
    const loadPublishingData = async () => {
      try {
        const liveMetrics =
          await liveAnalyticsService.getLivePublishingMetrics();

        // Convert live metrics to component format
        const platforms = liveMetrics.platformBreakdown.map(p => ({
          platform: p.platform,
          published: p.published,
          failed: Math.floor(p.published * 0.05), // Estimate 5% failure rate
          successRate: Math.round(
            (p.published / (p.published + Math.floor(p.published * 0.05))) * 100
          ),
          avgResponseTime: Math.floor(Math.random() * 2000) + 500, // Mock for now
          rateLimitRemaining: Math.floor(Math.random() * 100) + 10, // Mock for now
          engagement: {
            likes: Math.floor(p.engagement * 0.4),
            shares: Math.floor(p.engagement * 0.2),
            comments: Math.floor(p.engagement * 0.15),
            views: p.reach,
          },
        }));

        setPlatformMetrics(platforms);

        // Generate insights from recent activity
        const insights: PublishingInsight[] = liveMetrics.recentActivity
          .slice(0, 5)
          .map((activity, i) => ({
            id: `insight_${i}`,
            type:
              activity.status === "success"
                ? "success"
                : activity.status === "failed"
                  ? "error"
                  : "info",
            title: `${activity.platform} publicatie ${activity.status === "success" ? "succesvol" : "status"}`,
            description: `Recente activiteit op ${activity.platform} met ${activity.engagement || 0} engagement`,
            timestamp: activity.timestamp,
            platform: activity.platform,
            actionRequired: activity.status === "failed",
          }));

        setPublishingInsights(insights);

        // Generate mock conflicts (in production, these would come from actual system)
        const conflictTypes = [
          "rate_limit",
          "duplicate_content",
          "platform_error",
          "scheduling",
        ] as const;
        const severities = ["low", "medium", "high", "critical"] as const;
        const conflictData: ConflictItem[] = Array.from(
          { length: 2 },
          (_, i) => ({
            id: `conflict_${i}`,
            contentId: `content_${i + 1}`,
            title: `Content Issue #${i + 1}`,
            platforms: ["LinkedIn", "Twitter"],
            conflictType:
              conflictTypes[Math.floor(Math.random() * conflictTypes.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            description: "Live system conflict detected",
            suggestedAction: "Review and resolve manually",
            timestamp: new Date(Date.now() - Math.random() * 1800000),
          })
        );

        setConflicts(conflictData);
      } catch (error) {
        console.error("Failed to load publishing data:", error);
        // Fallback to mock data if live data fails
        generateMockData();
      }
    };

    loadPublishingData();

    if (isAutoRefreshEnabled) {
      const interval = setInterval(loadPublishingData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, isAutoRefreshEnabled]);

  const generateMockData = () => {
    // Generate platform metrics
    const platforms = [
      "LinkedIn",
      "Twitter",
      "Facebook",
      "Instagram",
      "Email",
      "Blog",
    ];
    const metrics: PlatformMetrics[] = platforms.map(platform => ({
      platform,
      published: Math.floor(Math.random() * 100) + 50,
      failed: Math.floor(Math.random() * 10) + 1,
      successRate: Math.floor(Math.random() * 20) + 80,
      avgResponseTime: Math.floor(Math.random() * 2000) + 500,
      rateLimitRemaining: Math.floor(Math.random() * 100) + 10,
      engagement: {
        likes: Math.floor(Math.random() * 1000) + 100,
        shares: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 200) + 20,
        views: Math.floor(Math.random() * 10000) + 1000,
      },
    }));
    setPlatformMetrics(metrics);

    // Generate insights
    const insightTypes = ["success", "warning", "error", "info"] as const;
    const insights: PublishingInsight[] = Array.from({ length: 5 }, (_, i) => ({
      id: `insight_${i}`,
      type: insightTypes[Math.floor(Math.random() * insightTypes.length)],
      title: [
        "Hoge engagement rate op LinkedIn",
        "Rate limit waarschuwing voor Twitter",
        "Succesvolle batch publicatie voltooid",
        "Nieuwe trending hashtag gedetecteerd",
        "Platform connectie hersteld",
      ][i],
      description: [
        "LinkedIn posts tonen 25% hogere engagement dan gemiddeld",
        "Twitter rate limit bijna bereikt, publicaties worden vertraagd",
        "Alle 23 posts succesvol gepubliceerd naar 6 platforms",
        "#MarketingAutomation trending in Nederland",
        "Facebook API connectie automatisch hersteld",
      ][i],
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      actionRequired: Math.random() > 0.7,
    }));
    setPublishingInsights(insights);

    // Generate conflicts
    const conflictTypes = [
      "rate_limit",
      "duplicate_content",
      "platform_error",
      "scheduling",
    ] as const;
    const severities = ["low", "medium", "high", "critical"] as const;
    const conflictData: ConflictItem[] = Array.from({ length: 3 }, (_, i) => ({
      id: `conflict_${i}`,
      contentId: `content_${i + 1}`,
      title: [
        "Marketing Campaign Update #1",
        "Product Launch Announcement",
        "Weekly Newsletter Content",
      ][i],
      platforms: ["LinkedIn", "Twitter"],
      conflictType:
        conflictTypes[Math.floor(Math.random() * conflictTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: [
        "Rate limit overschreden voor LinkedIn API",
        "Duplicate content gedetecteerd op Twitter",
        "Platform API error bij Facebook publicatie",
      ][i],
      suggestedAction: [
        "Wacht 15 minuten en probeer opnieuw",
        "Wijzig content om duplicatie te voorkomen",
        "Controleer Facebook API credentials",
      ][i],
      timestamp: new Date(Date.now() - Math.random() * 1800000),
    }));
    setConflicts(conflictData);
  };

  const handleEmergencyStop = () => {
    setIsEmergencyMode(true);
    // In production, this would call the actual emergency stop API
    console.log("Emergency stop activated");
    setTimeout(() => setIsEmergencyMode(false), 5000); // Auto-reset after 5 seconds for demo
  };

  const handleResolveConflict = (conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  };

  const totalPublished = platformMetrics.reduce(
    (sum, m) => sum + m.published,
    0
  );
  const totalFailed = platformMetrics.reduce((sum, m) => sum + m.failed, 0);
  const overallSuccessRate =
    totalPublished > 0
      ? (totalPublished / (totalPublished + totalFailed)) * 100
      : 0;
  const totalEngagement = platformMetrics.reduce(
    (sum, m) =>
      sum + m.engagement.likes + m.engagement.shares + m.engagement.comments,
    0
  );

  // Chart data
  const successRateData = platformMetrics.map(m => ({
    platform: m.platform,
    successRate: m.successRate,
    published: m.published,
    failed: m.failed,
  }));

  const engagementData = platformMetrics.map(m => ({
    platform: m.platform,
    likes: m.engagement.likes,
    shares: m.engagement.shares,
    comments: m.engagement.comments,
    views: m.engagement.views,
  }));

  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${23 - i}:00`,
    published: Math.floor(Math.random() * 20) + 5,
    failed: Math.floor(Math.random() * 3),
    engagement: Math.floor(Math.random() * 500) + 100,
  })).reverse();

  const platformDistribution = platformMetrics.map(m => ({
    name: m.platform,
    value: m.published,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
  }));

  const getStatusColor = (rate: number) => {
    if (rate >= 95) return "text-green-600";
    if (rate >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Eye className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Publishing Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring van geautomatiseerde publicaties
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Laatste uur</SelectItem>
                <SelectItem value="24h">24 uur</SelectItem>
                <SelectItem value="7d">7 dagen</SelectItem>
                <SelectItem value="30d">30 dagen</SelectItem>
              </SelectContent>
            </Select>

            <NormalButton
              variant={isAutoRefreshEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
            >
              {isAutoRefreshEnabled ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Auto-refresh
            </NormalButton>

            <NormalButton
              variant="destructive"
              size="sm"
              onClick={handleEmergencyStop}
              disabled={isEmergencyMode}
              className="bg-red-600 hover:bg-red-700"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              {isEmergencyMode ? "Gestopt" : "Emergency Stop"}
            </NormalButton>
          </div>
        </div>

        {/* Emergency Mode Alert */}
        {isEmergencyMode && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              Emergency Mode Actief
            </AlertTitle>
            <AlertDescription className="text-red-700">
              Alle publicatie activiteiten zijn gepauzeerd. Systeem wordt
              automatisch herstart over enkele seconden.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Totaal Gepubliceerd
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalPublished}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% vs vorige periode
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getStatusColor(overallSuccessRate)}`}
              >
                {overallSuccessRate.toFixed(1)}%
              </div>
              <Progress value={overallSuccessRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Totale Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalEngagement.toLocaleString()}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>
                  <Heart className="inline h-3 w-3 mr-1" />
                  Likes
                </span>
                <span>
                  <Share2 className="inline h-3 w-3 mr-1" />
                  Shares
                </span>
                <span>
                  <MessageCircle className="inline h-3 w-3 mr-1" />
                  Comments
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Actieve Conflicten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {conflicts.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                {conflicts.filter(c => c.severity === "critical").length}{" "}
                kritiek
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicten</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Publishing Trends (24u)</CardTitle>
                  <CardDescription>
                    Gepubliceerde posts en engagement over tijd
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="published"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="engagement"
                        stackId="2"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Platform Distributie</CardTitle>
                  <CardDescription>Publicaties per platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Success Rate per Platform</CardTitle>
                <CardDescription>
                  Publicatie success rates en volumes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={successRateData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="successRate" fill="#3b82f6" />
                    <Bar dataKey="published" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Platform Status Overview</CardTitle>
                <CardDescription>
                  Gedetailleerde metrics per platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Gepubliceerd</TableHead>
                      <TableHead>Gefaald</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Avg Response Time</TableHead>
                      <TableHead>Rate Limit</TableHead>
                      <TableHead>Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {platformMetrics.map(metric => (
                      <TableRow key={metric.platform}>
                        <TableCell className="font-medium">
                          {metric.platform}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            {metric.published}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-200"
                          >
                            {metric.failed}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getStatusColor(metric.successRate)}>
                            {metric.successRate}%
                          </span>
                        </TableCell>
                        <TableCell>{metric.avgResponseTime}ms</TableCell>
                        <TableCell>
                          <Progress
                            value={(metric.rateLimitRemaining / 100) * 100}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>👍 {metric.engagement.likes}</div>
                            <div>🔄 {metric.engagement.shares}</div>
                            <div>💬 {metric.engagement.comments}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Publishing Insights</CardTitle>
                <CardDescription>
                  Automatisch gegenereerde inzichten en aanbevelingen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {publishingInsights.map(insight => (
                  <div
                    key={insight.id}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-gray-50/50"
                  >
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        {insight.platform && (
                          <Badge variant="outline" className="text-xs">
                            {insight.platform}
                          </Badge>
                        )}
                        {insight.actionRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Actie vereist
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {insight.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {insight.timestamp.toLocaleTimeString("nl-NL")}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conflicts Tab */}
          <TabsContent value="conflicts">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Conflict Resolution</CardTitle>
                <CardDescription>
                  Actieve conflicten en aanbevolen acties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {conflicts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>Geen actieve conflicten gevonden</p>
                  </div>
                ) : (
                  conflicts.map(conflict => (
                    <div
                      key={conflict.id}
                      className="p-4 rounded-lg border bg-gray-50/50 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{conflict.title}</h4>
                            <Badge
                              className={getSeverityColor(conflict.severity)}
                            >
                              {conflict.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {conflict.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              Platforms:
                            </span>
                            {conflict.platforms.map(platform => (
                              <Badge
                                key={platform}
                                variant="outline"
                                className="text-xs"
                              >
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <NormalButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveConflict(conflict.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Oplossen
                        </NormalButton>
                      </div>
                      <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        <p className="text-sm font-medium text-blue-800">
                          Aanbevolen actie:
                        </p>
                        <p className="text-sm text-blue-700">
                          {conflict.suggestedAction}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Engagement per platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="likes" fill="#f59e0b" />
                      <Bar dataKey="shares" fill="#3b82f6" />
                      <Bar dataKey="comments" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                  <CardDescription>
                    API response times per platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={platformMetrics}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="avgResponseTime"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Systeem prestatie indicatoren</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.floor(Math.random() * 100) + 900}ms
                    </div>
                    <p className="text-sm text-gray-600">
                      Gemiddelde Processing Time
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.floor(Math.random() * 50) + 150}/min
                    </div>
                    <p className="text-sm text-gray-600">Throughput</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      99.{Math.floor(Math.random() * 9) + 1}%
                    </div>
                    <p className="text-sm text-gray-600">Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublishingAnalyticsDashboard;
