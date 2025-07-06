"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Users,
  FileText,
  Play,
  Pause,
  RefreshCw,
  Activity,
  Target,
  TrendingUp,
  Bell,
  ArrowUp,
  ArrowDown,
  Eye,
  Send,
  Hash,
  Megaphone,
  Filter,
  Search,
  Settings,
} from "lucide-react";
import { UltraPremiumCard } from "@/components/layout/ultra-premium-dashboard-layout";
import Link from "next/link";

// ClickUp-Blotato specific interfaces
interface ClickUpBlototoContent {
  id: string;
  clickup_task_id: string;
  title: string;
  content_preview: string;
  media_urls: string[];
  platforms: string[];
  scheduled_time: string;
  status:
    | "extracted"
    | "scheduled"
    | "published"
    | "failed"
    | "emergency"
    | "conflict";
  approval_status: "approved" | "pending" | "rejected";
  priority: "urgent" | "high" | "medium" | "low";
  author: string;
  blotato_schedule_id?: string;
  engagement_prediction?: number;
  conflicts?: string[];
  scheduling_type: "normal" | "emergency" | "bulk";
  created_at: string;
  updated_at: string;
  analytics_tracking_id?: string;
}

interface AgendaMetrics {
  total_content: number;
  scheduled_today: number;
  emergency_content: number;
  pending_approval: number;
  conflicts_detected: number;
  success_rate: number;
  avg_engagement: number;
  platforms_active: number;
}

interface RealTimeEvent {
  id: string;
  type:
    | "content_approved"
    | "content_scheduled"
    | "conflict_detected"
    | "published"
    | "emergency_triggered";
  content_id: string;
  title: string;
  message: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  metadata?: any;
}

interface ClickUpBlototoAgendaProps {
  className?: string;
  showRealTimeEvents?: boolean;
  enableFilters?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function ClickUpBlototoAgendaWidget({
  className = "",
  showRealTimeEvents = true,
  enableFilters = true,
  autoRefresh = true,
  refreshInterval = 30000,
}: ClickUpBlototoAgendaProps) {
  const [data, setData] = useState<{
    metrics: AgendaMetrics;
    content: ClickUpBlototoContent[];
    realTimeEvents: RealTimeEvent[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showConflicts, setShowConflicts] = useState(true);
  const [showEmergency, setShowEmergency] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLiveMode, setIsLiveMode] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAgendaData();

    if (autoRefresh && isLiveMode) {
      intervalRef.current = setInterval(fetchAgendaData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, isLiveMode, refreshInterval]);

  const fetchAgendaData = async () => {
    try {
      // Fetch content from our scheduling API
      const [contentResponse, analyticsResponse] = await Promise.all([
        fetch("/api/blotato/scheduling?action=upcoming&days=7"),
        fetch("/api/blotato/scheduling?action=analytics&days=7"),
      ]);

      const contentResult = await contentResponse.json();
      const analyticsResult = await analyticsResponse.json();

      if (contentResult.success && analyticsResult.success) {
        // Transform API data to our interface
        const transformedContent: ClickUpBlototoContent[] =
          contentResult.upcoming_posts?.map((post: any) => ({
            id: post.content_id,
            clickup_task_id: post.content_id,
            title: post.title,
            content_preview: post.title.substring(0, 80) + "...",
            media_urls: [],
            platforms: post.platforms || [],
            scheduled_time: post.scheduled_time,
            status: post.status,
            approval_status: "approved",
            priority: post.priority || "medium",
            author: "ClickUp Integration",
            scheduling_type: "normal",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })) || [];

        // Generate mock real-time events
        const recentEvents: RealTimeEvent[] = [
          {
            id: "event_1",
            type: "content_approved",
            content_id: "content_1",
            title: "Summer Campaign Post",
            message: "Content approved and scheduled for Twitter, LinkedIn",
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            priority: "medium",
          },
          {
            id: "event_2",
            type: "emergency_triggered",
            content_id: "content_2",
            title: "Breaking News Update",
            message:
              "🚨 Emergency content fast-tracked for immediate publishing",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            priority: "high",
          },
          {
            id: "event_3",
            type: "conflict_detected",
            content_id: "content_3",
            title: "Product Launch Post",
            message:
              "⚠️ Scheduling conflict detected - automatically rescheduled +2 hours",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            priority: "medium",
          },
        ];

        const metrics: AgendaMetrics = {
          total_content:
            analyticsResult.summary?.total_scheduled ||
            transformedContent.length,
          scheduled_today: transformedContent.filter(
            c =>
              new Date(c.scheduled_time).toDateString() ===
              new Date().toDateString()
          ).length,
          emergency_content: transformedContent.filter(
            c => c.priority === "urgent"
          ).length,
          pending_approval: transformedContent.filter(
            c => c.approval_status === "pending"
          ).length,
          conflicts_detected: transformedContent.filter(
            c => c.conflicts && c.conflicts.length > 0
          ).length,
          success_rate: analyticsResult.summary?.success_rate || 93.5,
          avg_engagement: analyticsResult.summary?.avg_engagement_rate || 4.2,
          platforms_active:
            analyticsResult.summary?.platforms_used?.length || 3,
        };

        setData({
          metrics,
          content: transformedContent,
          realTimeEvents: recentEvents,
        });
        setError(null);
      } else {
        throw new Error("Failed to fetch agenda data");
      }
    } catch (err) {
      console.error("Failed to fetch ClickUp-Blotato agenda data:", err);
      setError("Failed to load agenda data");

      // Fallback data
      setData({
        metrics: {
          total_content: 12,
          scheduled_today: 3,
          emergency_content: 1,
          pending_approval: 2,
          conflicts_detected: 1,
          success_rate: 93.5,
          avg_engagement: 4.2,
          platforms_active: 3,
        },
        content: [
          {
            id: "content_1",
            clickup_task_id: "CU-001",
            title: "Summer Sale Campaign Launch",
            content_preview:
              "🌞 Get ready for our biggest summer sale! Up to 50% off all products...",
            media_urls: ["image1.jpg", "video1.mp4"],
            platforms: ["twitter", "linkedin", "instagram"],
            scheduled_time: new Date(
              Date.now() + 2 * 60 * 60 * 1000
            ).toISOString(),
            status: "scheduled",
            approval_status: "approved",
            priority: "high",
            author: "Marketing Team",
            scheduling_type: "normal",
            engagement_prediction: 87,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            analytics_tracking_id: "track_001",
          },
          {
            id: "content_2",
            clickup_task_id: "CU-002",
            title: "Breaking: Product Update",
            content_preview:
              "🚨 BREAKING: Major product update released with new features...",
            media_urls: [],
            platforms: ["twitter"],
            scheduled_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            status: "emergency",
            approval_status: "approved",
            priority: "urgent",
            author: "Product Team",
            scheduling_type: "emergency",
            engagement_prediction: 95,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        realTimeEvents: [
          {
            id: "fallback_1",
            type: "content_approved",
            content_id: "content_1",
            title: "Fallback Content",
            message: "Using fallback data - Content approved",
            timestamp: new Date().toISOString(),
            priority: "low",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-400" />;
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "emergency":
        return <Zap className="h-4 w-4 text-red-400" />;
      case "conflict":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-900/30 text-blue-300 border-blue-500/30";
      case "published":
        return "bg-green-900/30 text-green-300 border-green-500/30";
      case "emergency":
        return "bg-red-900/30 text-red-300 border-red-500/30";
      case "conflict":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-500/30";
      case "failed":
        return "bg-red-900/30 text-red-300 border-red-500/30";
      default:
        return "bg-gray-900/30 text-gray-300 border-gray-500/30";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <ArrowUp className="h-3 w-3 text-red-400" />;
      case "high":
        return <ArrowUp className="h-3 w-3 text-orange-400" />;
      case "medium":
        return <ArrowDown className="h-3 w-3 text-blue-400" />;
      default:
        return <ArrowDown className="h-3 w-3 text-gray-400" />;
    }
  };

  const getPlatformEmoji = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "📘";
      case "instagram":
        return "📷";
      case "twitter":
        return "🐦";
      case "linkedin":
        return "💼";
      case "youtube":
        return "🎥";
      case "email":
        return "📧";
      default:
        return "📱";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "nu";
    if (diffInMinutes < 60) return `${diffInMinutes}m geleden`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)}u geleden`;
    return `${Math.floor(diffInMinutes / 1440)}d geleden`;
  };

  const formatScheduledTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (date >= today && date < tomorrow) {
      return `Vandaag ${date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (
      date >= tomorrow &&
      date < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
    ) {
      return `Morgen ${date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("nl-NL", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "content_approved":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "content_scheduled":
        return <Clock className="h-4 w-4 text-blue-400" />;
      case "conflict_detected":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "published":
        return <Send className="h-4 w-4 text-green-400" />;
      case "emergency_triggered":
        return <Zap className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredContent =
    data?.content.filter(content => {
      const matchesFilter =
        selectedFilter === "all" || content.status === selectedFilter;
      const matchesSearch =
        searchTerm === "" ||
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.content_preview
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const showConflictCheck =
        !showConflicts || !content.conflicts || content.conflicts.length === 0;
      const showEmergencyCheck =
        !showEmergency || content.priority !== "urgent";

      return (
        matchesFilter &&
        matchesSearch &&
        (showConflicts ? true : showConflictCheck) &&
        (showEmergency ? true : showEmergencyCheck)
      );
    }) || [];

  if (loading) {
    return (
      <UltraPremiumCard className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            ClickUp → Blotato Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </UltraPremiumCard>
    );
  }

  if (!data) {
    return (
      <UltraPremiumCard className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            ClickUp → Blotato Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-gray-400">
            Geen agenda data beschikbaar
          </div>
        </CardContent>
      </UltraPremiumCard>
    );
  }

  return (
    <UltraPremiumCard className={`h-[600px] ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            ClickUp → Blotato Agenda
            {isLiveMode && (
              <Badge className="bg-green-900/30 text-green-300 border-green-500/30 ml-2">
                <Activity className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <NormalButton
              variant="outline"
              size="sm"
              onClick={() => setIsLiveMode(!isLiveMode)}
              className="gap-1"
            >
              {isLiveMode ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              {isLiveMode ? "Pause" : "Start"}
            </NormalButton>
            <NormalButton
              variant="outline"
              size="sm"
              onClick={fetchAgendaData}
              className="gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </NormalButton>
            <Link
              href="/[locale]/clickup-blotato-manager"
              as="/nl/clickup-blotato-manager"
            >
              <NormalButton variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-3 w-3" />
                Manage
              </NormalButton>
            </Link>
          </div>
        </div>
        <CardDescription className="text-gray-400">
          Real-time content scheduling workflow tussen ClickUp en Blotato
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 overflow-hidden">
        {error && (
          <div className="text-yellow-400 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error} - Toont fallback data
          </div>
        )}

        {/* Quick Metrics */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-bold text-white">
              {data.metrics.scheduled_today}
            </div>
            <div className="text-xs text-gray-400">Vandaag</div>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-bold text-red-400">
              {data.metrics.emergency_content}
            </div>
            <div className="text-xs text-gray-400">Urgent</div>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-bold text-yellow-400">
              {data.metrics.conflicts_detected}
            </div>
            <div className="text-xs text-gray-400">Conflicts</div>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-bold text-green-400">
              {data.metrics.success_rate}%
            </div>
            <div className="text-xs text-gray-400">Success</div>
          </div>
        </div>

        {/* Filters & Controls */}
        {enableFilters && (
          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="scheduled">Gepland</SelectItem>
                <SelectItem value="emergency">Urgent</SelectItem>
                <SelectItem value="conflict">Conflicts</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                checked={showConflicts}
                onCheckedChange={setShowConflicts}
              />
              <Label className="text-xs text-gray-400">Conflicts</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={showEmergency}
                onCheckedChange={setShowEmergency}
              />
              <Label className="text-xs text-gray-400">Emergency</Label>
            </div>
          </div>
        )}

        {/* Content List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="h-4 w-4" />
            Geplande Content ({filteredContent.length})
          </h4>
          {filteredContent.map(content => (
            <div
              key={content.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(content.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-white truncate">
                      {content.title}
                    </div>
                    {getPriorityIcon(content.priority)}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{formatScheduledTime(content.scheduled_time)}</span>
                    <span>
                      {content.platforms.map(p => getPlatformEmoji(p)).join("")}
                    </span>
                    {content.media_urls.length > 0 && (
                      <span>📎{content.media_urls.length}</span>
                    )}
                    {content.engagement_prediction && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {content.engagement_prediction}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={getStatusColor(content.status)}
                  variant="outline"
                >
                  {content.status === "emergency" ? "🚨" : content.status}
                </Badge>
                {content.scheduling_type === "emergency" && (
                  <Badge
                    className="bg-red-900/30 text-red-300 border-red-500/30"
                    variant="outline"
                  >
                    FAST
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Events */}
        {showRealTimeEvents && data.realTimeEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Real-time Events
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {data.realTimeEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg text-sm"
                >
                  {getEventTypeIcon(event.type)}
                  <div className="flex-1">
                    <div className="text-white">{event.message}</div>
                    <div className="text-xs text-gray-400">
                      {formatTimeAgo(event.timestamp)}
                    </div>
                  </div>
                  {event.priority === "high" && (
                    <Badge className="bg-red-900/30 text-red-300 border-red-500/30 text-xs">
                      HIGH
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </UltraPremiumCard>
  );
}
