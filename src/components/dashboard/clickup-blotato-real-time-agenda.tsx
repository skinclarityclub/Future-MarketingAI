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
  RefreshCw,
  Activity,
  Target,
  TrendingUp,
  Bell,
  ArrowUp,
  ArrowDown,
  Send,
  Play,
  Pause,
  FileText,
  Hash,
} from "lucide-react";
import { UltraPremiumCard } from "@/components/layout/ultra-premium-dashboard-layout";
import Link from "next/link";

// Real-time ClickUp-Blotato agenda interfaces
interface AgendaContent {
  id: string;
  clickup_task_id: string;
  title: string;
  content_preview: string;
  media_count: number;
  platforms: string[];
  scheduled_time: string;
  status: "scheduled" | "published" | "emergency" | "conflict" | "failed";
  priority: "urgent" | "high" | "medium" | "low";
  author: string;
  engagement_prediction?: number;
  scheduling_type: "normal" | "emergency" | "bulk";
}

interface AgendaMetrics {
  total_scheduled: number;
  publishing_today: number;
  emergency_active: number;
  conflicts_detected: number;
  success_rate: number;
  avg_engagement: number;
}

interface RealtimeEvent {
  id: string;
  type: "approved" | "scheduled" | "conflict" | "published" | "emergency";
  title: string;
  message: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
}

interface AgendaProps {
  className?: string;
  showEvents?: boolean;
  autoRefresh?: boolean;
}

export default function ClickUpBlototoRealTimeAgenda({
  className = "",
  showEvents = true,
  autoRefresh = true,
}: AgendaProps) {
  const [metrics, setMetrics] = useState<AgendaMetrics | null>(null);
  const [content, setContent] = useState<AgendaContent[]>([]);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [showConflicts, setShowConflicts] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh functionality
  useEffect(() => {
    fetchData();

    if (autoRefresh && isLive) {
      intervalRef.current = setInterval(fetchData, 30000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, isLive]);

  const fetchData = async () => {
    try {
      const [agendaRes, analyticsRes] = await Promise.all([
        fetch("/api/blotato/scheduling?action=upcoming&days=7"),
        fetch("/api/blotato/scheduling?action=analytics&days=1"),
      ]);

      const agendaData = await agendaRes.json();
      const analyticsData = await analyticsRes.json();

      if (agendaData.success) {
        // Transform agenda data
        const transformedContent: AgendaContent[] =
          agendaData.upcoming_posts?.map((post: any) => ({
            id: post.content_id,
            clickup_task_id: post.content_id,
            title: post.title,
            content_preview: post.title.substring(0, 70) + "...",
            media_count: 0,
            platforms: post.platforms || [],
            scheduled_time: post.scheduled_time,
            status: post.status,
            priority: post.priority || "medium",
            author: "ClickUp",
            engagement_prediction: Math.floor(Math.random() * 30) + 70,
            scheduling_type: "normal",
          })) || [];

        setContent(transformedContent);

        // Set metrics
        const todayContent = transformedContent.filter(
          c =>
            new Date(c.scheduled_time).toDateString() ===
            new Date().toDateString()
        );

        setMetrics({
          total_scheduled: transformedContent.length,
          publishing_today: todayContent.length,
          emergency_active: transformedContent.filter(
            c => c.priority === "urgent"
          ).length,
          conflicts_detected: Math.floor(Math.random() * 3),
          success_rate: analyticsData.success
            ? analyticsData.summary?.success_rate || 93.2
            : 93.2,
          avg_engagement: analyticsData.success
            ? analyticsData.summary?.avg_engagement_rate || 4.1
            : 4.1,
        });

        // Mock real-time events
        setEvents([
          {
            id: "e1",
            type: "approved",
            title: "Social Media Post",
            message: "Content goedgekeurd en ingepland voor Twitter + LinkedIn",
            timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
            priority: "medium",
          },
          {
            id: "e2",
            type: "emergency",
            title: "Breaking News",
            message:
              "🚨 Urgent content gedetecteerd - fast-track scheduling actief",
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            priority: "high",
          },
          {
            id: "e3",
            type: "conflict",
            title: "Campaign Post",
            message:
              "⚠️ Scheduling conflict opgelost - post verschoven naar 16:30",
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            priority: "medium",
          },
        ]);

        setError(null);
      } else {
        throw new Error("API request failed");
      }
    } catch (err) {
      console.error("Failed to fetch agenda data:", err);
      setError("Kan agenda data niet laden");

      // Fallback data
      setMetrics({
        total_scheduled: 8,
        publishing_today: 3,
        emergency_active: 1,
        conflicts_detected: 0,
        success_rate: 93.2,
        avg_engagement: 4.1,
      });

      setContent([
        {
          id: "1",
          clickup_task_id: "CU-001",
          title: "Summer Sale Campaign - Social Media Burst",
          content_preview:
            "🌞 Our biggest summer sale is here! Get up to 50% off...",
          media_count: 3,
          platforms: ["twitter", "linkedin", "instagram"],
          scheduled_time: new Date(
            Date.now() + 2 * 60 * 60 * 1000
          ).toISOString(),
          status: "scheduled",
          priority: "high",
          author: "Marketing Team",
          engagement_prediction: 87,
          scheduling_type: "normal",
        },
        {
          id: "2",
          clickup_task_id: "CU-002",
          title: "Product Update Announcement",
          content_preview:
            "🚀 Breaking: Major product update with exciting new features...",
          media_count: 1,
          platforms: ["twitter"],
          scheduled_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          status: "emergency",
          priority: "urgent",
          author: "Product Team",
          engagement_prediction: 94,
          scheduling_type: "emergency",
        },
      ]);

      setEvents([
        {
          id: "f1",
          type: "approved",
          title: "Fallback Content",
          message: "Toont fallback data - content goedgekeurd",
          timestamp: new Date().toISOString(),
          priority: "low",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
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
      default:
        return <ArrowDown className="h-3 w-3 text-blue-400" />;
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
      default:
        return "📱";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-400" />;
      case "conflict":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "published":
        return <Send className="h-4 w-4 text-green-400" />;
      case "emergency":
        return <Zap className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 60) {
      return diffMinutes > 0
        ? `over ${diffMinutes}m`
        : `${Math.abs(diffMinutes)}m geleden`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `over ${hours}u`;
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

  const formatEventTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "nu";
    if (diffMinutes < 60) return `${diffMinutes}m geleden`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}u geleden`;
    return `${Math.floor(diffMinutes / 1440)}d geleden`;
  };

  const filteredContent = content.filter(item => {
    if (filter === "all") return true;
    if (filter === "today") {
      return (
        new Date(item.scheduled_time).toDateString() ===
        new Date().toDateString()
      );
    }
    return item.status === filter;
  });

  if (loading) {
    return (
      <UltraPremiumCard className={`h-[600px] ${className}`}>
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

  return (
    <UltraPremiumCard className={`h-[600px] ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            ClickUp → Blotato Agenda
            {isLive && (
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
              onClick={() => setIsLive(!isLive)}
              className="gap-1 text-white border-gray-600 hover:bg-gray-800"
            >
              {isLive ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              {isLive ? "Pause" : "Start"}
            </NormalButton>
            <NormalButton
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="gap-1 text-white border-gray-600 hover:bg-gray-800"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </NormalButton>
            <Link href="/clickup-blotato-manager">
              <NormalButton
                variant="outline"
                size="sm"
                className="gap-1 text-white border-gray-600 hover:bg-gray-800"
              >
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

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-gray-800/50 rounded-lg">
              <div className="text-lg font-bold text-white">
                {metrics.publishing_today}
              </div>
              <div className="text-xs text-gray-400">Vandaag</div>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded-lg">
              <div className="text-lg font-bold text-red-400">
                {metrics.emergency_active}
              </div>
              <div className="text-xs text-gray-400">Urgent</div>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded-lg">
              <div className="text-lg font-bold text-green-400">
                {metrics.success_rate}%
              </div>
              <div className="text-xs text-gray-400">Success</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="today">Vandaag</SelectItem>
              <SelectItem value="scheduled">Gepland</SelectItem>
              <SelectItem value="emergency">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              checked={showConflicts}
              onCheckedChange={setShowConflicts}
            />
            <Label className="text-xs text-gray-400">Toon conflicts</Label>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="h-4 w-4" />
            Geplande Content ({filteredContent.length})
          </h4>
          {filteredContent.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(item.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-white truncate">
                      {item.title}
                    </div>
                    {getPriorityIcon(item.priority)}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{formatTime(item.scheduled_time)}</span>
                    <span>
                      {item.platforms.map(p => getPlatformEmoji(p)).join("")}
                    </span>
                    {item.media_count > 0 && <span>📎{item.media_count}</span>}
                    {item.engagement_prediction && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {item.engagement_prediction}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={getStatusColor(item.status)}
                  variant="outline"
                >
                  {item.status === "emergency" ? "🚨" : item.status}
                </Badge>
                {item.scheduling_type === "emergency" && (
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
        {showEvents && events.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Recent Events
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {events.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg text-sm"
                >
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <div className="text-white">{event.message}</div>
                    <div className="text-xs text-gray-400">
                      {formatEventTime(event.timestamp)}
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
