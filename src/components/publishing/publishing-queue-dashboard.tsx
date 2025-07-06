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
  LineChart,
  Line,
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
import {
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Zap,
  Globe,
} from "lucide-react";
import {
  PublishingQueueEngine,
  PublishingItem,
  QueueStatistics,
  PublishingStatus,
  PlatformType,
  PublishingPriority,
} from "@/lib/publishing/queue-engine";

interface PublishingQueueDashboardProps {
  queueEngine?: PublishingQueueEngine;
}

export function PublishingQueueDashboard({
  queueEngine,
}: PublishingQueueDashboardProps) {
  const [engine] = useState(() => queueEngine || new PublishingQueueEngine());
  const [statistics, setStatistics] = useState<QueueStatistics | null>(null);
  const [queueItems, setQueueItems] = useState<PublishingItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<
    PlatformType | "all"
  >("all");
  const [selectedStatus, setSelectedStatus] = useState<
    PublishingStatus | "all"
  >("all");
  const [chartData, setChartData] = useState<
    Array<{
      time: string;
      published: number;
      failed: number;
      pending: number;
    }>
  >([]);

  // Initialize demo data and start monitoring
  useEffect(() => {
    const initializeDemoData = async () => {
      // Add demo publishing items
      const demoItems = [
        {
          contentId: "content_1",
          title: "Nieuwe Product Launch Aankondiging",
          content: "We zijn trots om onze nieuwste innovatie te presenteren...",
          platforms: ["linkedin", "twitter", "facebook"] as PlatformType[],
          scheduledTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
          priority: "high" as PublishingPriority,
          maxRetries: 3,
          metadata: {
            hashtags: ["#innovation", "#productlaunch", "#technology"],
            mentions: ["@company", "@team"],
            images: ["product-image.jpg"],
            videos: [],
            author: "Marketing Team",
            campaign: "Q2 Product Launch",
          },
        },
        {
          contentId: "content_2",
          title: "Weekly Industry Update",
          content: "Deze week in de industrie: belangrijke ontwikkelingen...",
          platforms: ["linkedin", "email"] as PlatformType[],
          scheduledTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          priority: "medium" as PublishingPriority,
          maxRetries: 2,
          metadata: {
            hashtags: ["#industryupdate", "#weekly", "#insights"],
            mentions: [],
            images: [],
            videos: [],
            author: "Content Team",
            campaign: "Weekly Updates",
          },
        },
        {
          contentId: "content_3",
          title: "Customer Success Story",
          content: "Ontdek hoe onze klant 300% groei bereikte...",
          platforms: ["instagram", "facebook", "blog"] as PlatformType[],
          scheduledTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
          priority: "medium" as PublishingPriority,
          maxRetries: 3,
          metadata: {
            hashtags: ["#success", "#customer", "#growth"],
            mentions: ["@customer"],
            images: ["success-story.jpg", "metrics-chart.png"],
            videos: ["testimonial.mp4"],
            author: "Success Team",
            campaign: "Customer Stories",
          },
        },
      ];

      for (const item of demoItems) {
        await engine.addToQueue(item);
      }

      // Start processing
      await engine.startProcessing();
      setIsProcessing(true);
    };

    initializeDemoData();

    // Update statistics and queue items every 2 seconds
    const updateInterval = setInterval(() => {
      const stats = engine.getStatistics();
      const items = engine.getQueueItems();

      setStatistics(stats);
      setQueueItems(items);

      // Update chart data
      const now = new Date();
      const timeString =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

      setChartData(prev => {
        const newData = [
          ...prev.slice(-9), // Keep last 9 entries
          {
            time: timeString,
            published: stats.publishedToday,
            failed: stats.failedPosts,
            pending: stats.pendingPosts,
          },
        ];
        return newData;
      });
    }, 2000);

    return () => {
      clearInterval(updateInterval);
      engine.stopProcessing();
    };
  }, [engine]);

  const handleStartProcessing = async () => {
    await engine.startProcessing();
    setIsProcessing(true);
  };

  const handleStopProcessing = async () => {
    await engine.stopProcessing();
    setIsProcessing(false);
  };

  const handleEmergencyStop = async () => {
    await engine.emergencyStop();
    setIsProcessing(false);
  };

  const getStatusIcon = (status: PublishingStatus) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "retrying":
        return <RotateCcw className="h-4 w-4 text-orange-500 animate-spin" />;
      case "cancelled":
        return <Square className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: PublishingPriority) => {
    const variants = {
      urgent: "destructive",
      high: "secondary",
      medium: "outline",
      low: "default",
    } as const;

    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getHealthColor = (health: QueueStatistics["queueHealth"]) => {
    switch (health) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredItems = queueItems.filter(item => {
    const platformMatch =
      selectedPlatform === "all" || item.platforms.includes(selectedPlatform);
    const statusMatch =
      selectedStatus === "all" || item.status === selectedStatus;
    return platformMatch && statusMatch;
  });

  const platformData = [
    { name: "LinkedIn", value: 45, color: "#0077B5" },
    { name: "Twitter", value: 30, color: "#1DA1F2" },
    { name: "Facebook", value: 15, color: "#4267B2" },
    { name: "Instagram", value: 8, color: "#E4405F" },
    { name: "Email", value: 2, color: "#34495E" },
  ];

  if (!statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading publishing queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Publishing Queue Control
          </h2>
          <p className="text-muted-foreground">
            Geautomatiseerde content publicatie management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${isProcessing ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-sm text-muted-foreground">
            {isProcessing ? "Actief" : "Gestopt"}
          </span>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Queue Controle</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <NormalButton
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Start Processing</span>
            </NormalButton>
            <NormalButton
              onClick={handleStopProcessing}
              disabled={!isProcessing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Pause className="h-4 w-4" />
              <span>Stop Processing</span>
            </NormalButton>
            <NormalButton
              onClick={handleEmergencyStop}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>Emergency Stop</span>
            </NormalButton>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalPosts}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span
                className={`font-medium ${getHealthColor(statistics.queueHealth)}`}
              >
                {statistics.queueHealth.toUpperCase()}
              </span>
              <span>queue health</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vandaag Gepubliceerd
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.publishedToday}
            </div>
            <div className="text-xs text-muted-foreground">
              Success rate: {statistics.successRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Wachtrij</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statistics.pendingPosts}
            </div>
            <div className="text-xs text-muted-foreground">
              Scheduled: {statistics.scheduledPosts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processing Time
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.averageProcessingTime}ms
            </div>
            <div className="text-xs text-muted-foreground">
              Failed: {statistics.failedPosts} | Retrying:{" "}
              {statistics.retryingPosts}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Queue Management */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="queue">Queue Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Publishing Trend</CardTitle>
                <CardDescription>
                  Real-time queue status over tijd
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="published"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Gepubliceerd"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="In Wachtrij"
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                      name="Gefaald"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distributie</CardTitle>
                <CardDescription>
                  Publishing activiteit per platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Queue Items</CardTitle>
              <CardDescription>
                Beheer en monitor alle publishing items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Select
                  value={selectedPlatform}
                  onValueChange={(value: PlatformType | "all") =>
                    setSelectedPlatform(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Platforms</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={(value: PublishingStatus | "all") =>
                    setSelectedStatus(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Statussen</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="retrying">Retrying</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Titel</TableHead>
                      <TableHead>Platforms</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Author</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <span className="text-sm capitalize">
                              {item.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate font-medium">
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.platforms.map(platform => (
                              <Badge
                                key={platform}
                                variant="outline"
                                className="text-xs"
                              >
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {item.scheduledTime.toLocaleString("nl-NL")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {item.metadata.author}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Success Rate Analysis</CardTitle>
              <CardDescription>
                Detailed publishing performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Success Rate</span>
                    <span className="font-medium">
                      {statistics.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={statistics.successRate} className="h-2" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {statistics.publishedToday}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Succesvol Vandaag
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {statistics.failedPosts}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Gefaalde Posts
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {statistics.retryingPosts}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Retry Pogingen
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
