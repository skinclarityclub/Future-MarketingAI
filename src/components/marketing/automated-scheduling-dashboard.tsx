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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  BarChart3,
  Users,
  Target,
  Zap,
  Activity,
  Bell,
  Filter,
  Download,
  Upload,
  Send,
  Timer,
  Circle,
} from "lucide-react";

// Types
interface SchedulingStats {
  total_scheduled: number;
  published_today: number;
  failed_today: number;
  pending_approval: number;
  queue_size: number;
  success_rate: number;
}

interface ScheduledContent {
  id: string;
  title: string;
  type: "post" | "email" | "ad" | "story" | "video" | "campaign";
  platform: string[];
  scheduled_date: string;
  scheduled_time: string;
  status:
    | "draft"
    | "scheduled"
    | "publishing"
    | "published"
    | "failed"
    | "cancelled";
  content_full: string;
  hashtags?: string[];
  author: string;
  priority: "low" | "medium" | "high" | "urgent";
  approval_status: "pending" | "approved" | "rejected";
  engagement_prediction?: number;
  created_at: string;
  updated_at: string;
}

interface QueueStatus {
  is_processing: boolean;
  processing_interval_minutes: number;
  pending_items: number;
  processing_items: number;
  completed_items_today: number;
  failed_items_today: number;
  last_processed: string;
  next_processing: string;
  queue_health: "healthy" | "warning" | "critical";
  error_rate: number;
}

const PLATFORM_CONFIG = {
  facebook: { name: "Facebook", icon: "📘", color: "#1877F2" },
  instagram: { name: "Instagram", icon: "📷", color: "#E4405F" },
  twitter: { name: "Twitter", icon: "🐦", color: "#1DA1F2" },
  linkedin: { name: "LinkedIn", icon: "💼", color: "#0A66C2" },
  youtube: { name: "YouTube", icon: "🎥", color: "#FF0000" },
  tiktok: { name: "TikTok", icon: "🎵", color: "#000000" },
  email: { name: "Email", icon: "📧", color: "#EA4335" },
};

const PRIORITY_COLORS = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-gray-500",
};

const STATUS_COLORS = {
  draft: "bg-gray-500",
  scheduled: "bg-blue-500",
  publishing: "bg-purple-500",
  published: "bg-green-500",
  failed: "bg-red-500",
  cancelled: "bg-gray-400",
};

export default function AutomatedSchedulingDashboard() {
  const [stats, setStats] = useState<SchedulingStats | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContent, setSelectedContent] =
    useState<ScheduledContent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterAuthor, setFilterAuthor] = useState<string>("all");

  // Form state for creating new content
  const [newContent, setNewContent] = useState({
    title: "",
    type: "post" as const,
    platform: ["facebook"],
    content_full: "",
    scheduled_date: "",
    scheduled_time: "12:00",
    hashtags: "",
    priority: "medium" as const,
    target_audience: "",
    optimize_timing: true,
    respect_rules: true,
    auto_approve: false,
  });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setRefreshing(true);

      // Fetch stats, queue status, and scheduled content in parallel
      const [statsResponse, queueResponse, contentResponse] = await Promise.all(
        [
          fetch("/api/marketing/automated-scheduling?action=stats"),
          fetch("/api/marketing/automated-scheduling?action=queue_status"),
          fetch("/api/marketing/automated-scheduling?action=scheduled_content"),
        ]
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data.stats);
      }

      if (queueResponse.ok) {
        const queueData = await queueResponse.json();
        setQueueStatus(queueData.data.queue_status);
      }

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setScheduledContent(contentData.data.content || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleScheduleContent = async () => {
    try {
      const response = await fetch("/api/marketing/automated-scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule_content",
          ...newContent,
          hashtags: newContent.hashtags
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean),
          scheduled_date: newContent.scheduled_date || new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setNewContent({
          title: "",
          type: "post",
          platform: ["facebook"],
          content_full: "",
          scheduled_date: "",
          scheduled_time: "12:00",
          hashtags: "",
          priority: "medium",
          target_audience: "",
          optimize_timing: true,
          respect_rules: true,
          auto_approve: false,
        });
        await fetchAllData();
      }
    } catch (error) {
      console.error("Error scheduling content:", error);
    }
  };

  const handleBulkAction = async (
    action: "approve" | "cancel",
    contentIds: string[]
  ) => {
    try {
      const response = await fetch("/api/marketing/automated-scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_action",
          bulk_action: action,
          content_ids: contentIds,
        }),
      });

      if (response.ok) {
        await fetchAllData();
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const handleQueueControl = async (
    action: "start" | "stop" | "process_now"
  ) => {
    try {
      const response = await fetch("/api/marketing/automated-scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process_queue",
          queue_action: action,
          interval_minutes: 5,
        }),
      });

      if (response.ok) {
        await fetchAllData();
      }
    } catch (error) {
      console.error("Error controlling queue:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "publishing":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "published":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      case "cancelled":
        return <Square className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case "high":
        return <TrendingUp className="h-3 w-3 text-orange-500" />;
      case "medium":
        return <Target className="h-3 w-3 text-yellow-500" />;
      case "low":
        return <Activity className="h-3 w-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const filteredContent = scheduledContent.filter(content => {
    const statusMatch =
      filterStatus === "all" || content.status === filterStatus;
    const platformMatch =
      filterPlatform === "all" || content.platform.includes(filterPlatform);
    const authorMatch =
      filterAuthor === "all" || content.author === filterAuthor;
    return statusMatch && platformMatch && authorMatch;
  });

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8 text-white">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading scheduling dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Automated Scheduling & Publishing
          </h1>
          <p className="text-gray-400 mt-1">
            Manage content scheduling, queue processing, and automated
            publishing across all platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NormalButton
            onClick={fetchAllData}
            variant="secondary"
            size="sm"
            disabled={refreshing}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </NormalButton>
          <NormalButton
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Content
          </NormalButton>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">
                    Total Scheduled
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.total_scheduled}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">
                    Published Today
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.published_today}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm font-medium">
                    Failed Today
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.failed_today}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">
                    Pending Approval
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.pending_approval}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">
                    Queue Size
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.queue_size}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-300 text-sm font-medium">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.success_rate}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="scheduled" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border-gray-700">
          <TabsTrigger
            value="scheduled"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
          >
            Scheduled Content
          </TabsTrigger>
          <TabsTrigger
            value="queue"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
          >
            Queue Management
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Scheduled Content Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          {/* Filters */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Filter className="h-5 w-5" />
                Filters & Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label htmlFor="status-filter" className="text-gray-300">
                    Status:
                  </Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-gray-700"
                      >
                        All
                      </SelectItem>
                      <SelectItem
                        value="scheduled"
                        className="text-white hover:bg-gray-700"
                      >
                        Scheduled
                      </SelectItem>
                      <SelectItem
                        value="published"
                        className="text-white hover:bg-gray-700"
                      >
                        Published
                      </SelectItem>
                      <SelectItem
                        value="failed"
                        className="text-white hover:bg-gray-700"
                      >
                        Failed
                      </SelectItem>
                      <SelectItem
                        value="draft"
                        className="text-white hover:bg-gray-700"
                      >
                        Draft
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="platform-filter" className="text-gray-300">
                    Platform:
                  </Label>
                  <Select
                    value={filterPlatform}
                    onValueChange={setFilterPlatform}
                  >
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-gray-700"
                      >
                        All
                      </SelectItem>
                      {Object.keys(PLATFORM_CONFIG).map(platform => (
                        <SelectItem
                          key={platform}
                          value={platform}
                          className="text-white hover:bg-gray-700"
                        >
                          {
                            PLATFORM_CONFIG[
                              platform as keyof typeof PLATFORM_CONFIG
                            ].name
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1" />

                <NormalButton
                  onClick={() =>
                    handleBulkAction(
                      "approve",
                      filteredContent
                        .filter(c => c.approval_status === "pending")
                        .map(c => c.id)
                    )
                  }
                  variant="secondary"
                  size="sm"
                  disabled={
                    !filteredContent.some(c => c.approval_status === "pending")
                  }
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All Pending
                </NormalButton>
              </div>
            </CardContent>
          </Card>

          {/* Content List */}
          <div className="grid gap-4">
            {filteredContent.map(content => (
              <Card
                key={content.id}
                className="hover:shadow-lg transition-shadow bg-gray-800/50 border-gray-700 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-white">
                          {content.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`${STATUS_COLORS[content.status]} text-white`}
                        >
                          {getStatusIcon(content.status)}
                          <span className="ml-1 capitalize">
                            {content.status}
                          </span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${PRIORITY_COLORS[content.priority]} text-white border-none`}
                        >
                          {getPriorityIcon(content.priority)}
                          <span className="ml-1 capitalize">
                            {content.priority}
                          </span>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(
                            content.scheduled_date
                          ).toLocaleDateString()}{" "}
                          at {content.scheduled_time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {content.author}
                        </div>
                        <div className="flex items-center gap-1">
                          {content.platform.map(platform => (
                            <span key={platform} className="text-lg">
                              {
                                PLATFORM_CONFIG[
                                  platform as keyof typeof PLATFORM_CONFIG
                                ]?.icon
                              }
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-300 mb-3 line-clamp-2">
                        {content.content_full}
                      </p>

                      {content.hashtags && content.hashtags.length > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          {content.hashtags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-gray-700 text-gray-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {content.hashtags.length > 3 && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-gray-700 text-gray-300"
                            >
                              +{content.hashtags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {content.engagement_prediction && (
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-blue-300">
                            Predicted engagement:{" "}
                            {content.engagement_prediction}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {content.approval_status === "pending" && (
                        <>
                          <NormalButton
                            onClick={() =>
                              handleBulkAction("approve", [content.id])
                            }
                            size="sm"
                            variant="secondary"
                            className="text-green-400 border-green-600 hover:bg-green-900/20 hover:text-green-300"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </NormalButton>
                          <NormalButton
                            onClick={() =>
                              handleBulkAction("cancel", [content.id])
                            }
                            size="sm"
                            variant="secondary"
                            className="text-red-400 border-red-600 hover:bg-red-900/20 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </NormalButton>
                        </>
                      )}
                      <NormalButton
                        onClick={() => setSelectedContent(content)}
                        size="sm"
                        variant="secondary"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </NormalButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredContent.length === 0 && (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    No content found
                  </h3>
                  <p className="text-gray-400">
                    Try adjusting your filters or schedule some new content.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Queue Management Tab */}
        <TabsContent value="queue" className="space-y-4">
          {queueStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="h-5 w-5" />
                    Queue Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Processing:</span>
                      <Badge
                        variant={
                          queueStatus.is_processing ? "default" : "secondary"
                        }
                        className={
                          queueStatus.is_processing
                            ? "bg-green-600 text-white"
                            : "bg-gray-600 text-gray-300"
                        }
                      >
                        {queueStatus.is_processing ? "Active" : "Stopped"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Health:</span>
                      <Badge
                        variant={
                          queueStatus.queue_health === "healthy"
                            ? "default"
                            : "destructive"
                        }
                        className={
                          queueStatus.queue_health === "healthy"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }
                      >
                        {queueStatus.queue_health}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Error Rate:</span>
                      <span className="font-semibold text-white">
                        {queueStatus.error_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Timer className="h-5 w-5" />
                    Queue Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Pending:</span>
                      <span className="font-semibold text-white">
                        {queueStatus.pending_items}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Processing:</span>
                      <span className="font-semibold text-white">
                        {queueStatus.processing_items}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Completed Today:</span>
                      <span className="font-semibold text-green-400">
                        {queueStatus.completed_items_today}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Failed Today:</span>
                      <span className="font-semibold text-red-400">
                        {queueStatus.failed_items_today}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="h-5 w-5" />
                    Queue Controls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <NormalButton
                      onClick={() => handleQueueControl("start")}
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                      variant="secondary"
                      disabled={queueStatus.is_processing}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Processing
                    </NormalButton>
                    <NormalButton
                      onClick={() => handleQueueControl("stop")}
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                      variant="secondary"
                      disabled={!queueStatus.is_processing}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Processing
                    </NormalButton>
                    <NormalButton
                      onClick={() => handleQueueControl("process_now")}
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      variant="secondary"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Process Now
                    </NormalButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Publishing Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                Performance metrics and insights for scheduled content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-gray-400">
                  Detailed analytics and performance insights will be available
                  here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Scheduling Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Configure platform settings, scheduling rules, and automation
                preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Settings Coming Soon
                </h3>
                <p className="text-gray-400">
                  Platform configurations and scheduling rules will be
                  manageable here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Content Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Schedule New Content</CardTitle>
              <CardDescription>
                Create and schedule content for automated publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newContent.title}
                    onChange={e =>
                      setNewContent({ ...newContent, title: e.target.value })
                    }
                    placeholder="Content title"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newContent.type}
                    onValueChange={value =>
                      setNewContent({ ...newContent, type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="ad">Advertisement</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newContent.content_full}
                  onChange={e =>
                    setNewContent({
                      ...newContent,
                      content_full: e.target.value,
                    })
                  }
                  placeholder="Enter your content here..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduled_date">Scheduled Date</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={newContent.scheduled_date}
                    onChange={e =>
                      setNewContent({
                        ...newContent,
                        scheduled_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="scheduled_time">Scheduled Time</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={newContent.scheduled_time}
                    onChange={e =>
                      setNewContent({
                        ...newContent,
                        scheduled_time: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hashtags">Hashtags (comma separated)</Label>
                <Input
                  id="hashtags"
                  value={newContent.hashtags}
                  onChange={e =>
                    setNewContent({ ...newContent, hashtags: e.target.value })
                  }
                  placeholder="#marketing, #automation, #social"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="optimize_timing"
                    checked={newContent.optimize_timing}
                    onCheckedChange={checked =>
                      setNewContent({ ...newContent, optimize_timing: checked })
                    }
                  />
                  <Label htmlFor="optimize_timing">Optimize Timing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="respect_rules"
                    checked={newContent.respect_rules}
                    onCheckedChange={checked =>
                      setNewContent({ ...newContent, respect_rules: checked })
                    }
                  />
                  <Label htmlFor="respect_rules">Respect Rules</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_approve"
                    checked={newContent.auto_approve}
                    onCheckedChange={checked =>
                      setNewContent({ ...newContent, auto_approve: checked })
                    }
                  />
                  <Label htmlFor="auto_approve">Auto Approve</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <NormalButton
                  variant="secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </NormalButton>
                <NormalButton
                  onClick={handleScheduleContent}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Schedule Content
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
