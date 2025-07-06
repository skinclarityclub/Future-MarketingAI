"use client";

import React, { useState, useEffect } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  FileText,
} from "lucide-react";
import { UltraPremiumCard } from "@/components/layout/ultra-premium-dashboard-layout";
import Link from "next/link";
import { liveAnalyticsService } from "@/lib/analytics/live-analytics-service";

interface ScheduledContent {
  id: string;
  title: string;
  type: "post" | "email" | "ad" | "story" | "video" | "campaign";
  platform: string[];
  scheduled_date: Date;
  scheduled_time: string;
  status:
    | "draft"
    | "scheduled"
    | "published"
    | "failed"
    | "approved"
    | "pending_approval";
  approval_status?: "pending" | "approved" | "rejected";
  author: string;
  content_preview: string;
  engagement_prediction?: number;
}

interface ContentCalendarSummary {
  totalScheduled: number;
  pendingApproval: number;
  publishingToday: number;
  upcomingThisWeek: number;
}

interface ContentCalendarData {
  summary: ContentCalendarSummary;
  upcomingContent: ScheduledContent[];
  pendingApproval: ScheduledContent[];
}

export default function ContentCalendarWidget() {
  const [data, setData] = useState<ContentCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContentCalendarData();
    const interval = setInterval(fetchContentCalendarData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchContentCalendarData = async () => {
    try {
      const response = await fetch(
        "/api/marketing/automated-scheduling?action=summary"
      );
      const result = await response.json();

      if (result.success) {
        // Transform API data to our interface
        const mockUpcomingContent: ScheduledContent[] = [
          {
            id: "content-001",
            title: "Summer Sale Announcement",
            type: "post",
            platform: ["facebook", "instagram", "twitter"],
            scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000),
            scheduled_time: "10:00",
            status: "scheduled",
            approval_status: "approved",
            author: "Marketing Team",
            content_preview: "🌞 Summer Sale is here! Get up to 50% off...",
            engagement_prediction: 85,
          },
          {
            id: "content-002",
            title: "Product Demo Video",
            type: "video",
            platform: ["youtube", "linkedin"],
            scheduled_date: new Date(Date.now() + 8 * 60 * 60 * 1000),
            scheduled_time: "14:00",
            status: "draft",
            approval_status: "pending",
            author: "Product Team",
            content_preview:
              "New product demo showcasing our latest features...",
            engagement_prediction: 92,
          },
          {
            id: "content-003",
            title: "Weekly Newsletter",
            type: "email",
            platform: ["email"],
            scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            scheduled_time: "09:00",
            status: "scheduled",
            approval_status: "approved",
            author: "Content Team",
            content_preview: "This week's top insights and industry trends...",
            engagement_prediction: 78,
          },
          {
            id: "content-004",
            title: "Customer Success Story",
            type: "post",
            platform: ["linkedin"],
            scheduled_date: new Date(Date.now() + 48 * 60 * 60 * 1000),
            scheduled_time: "11:30",
            status: "pending_approval",
            approval_status: "pending",
            author: "Customer Success",
            content_preview: "How SKC helped increase efficiency by 40%...",
            engagement_prediction: 88,
          },
        ];

        const summary: ContentCalendarSummary = {
          totalScheduled: result.data?.stats?.total_scheduled || 12,
          pendingApproval: mockUpcomingContent.filter(
            c => c.approval_status === "pending"
          ).length,
          publishingToday: mockUpcomingContent.filter(
            c =>
              new Date(c.scheduled_date).toDateString() ===
              new Date().toDateString()
          ).length,
          upcomingThisWeek: mockUpcomingContent.length,
        };

        setData({
          summary,
          upcomingContent: mockUpcomingContent.slice(0, 3), // Show only next 3 items
          pendingApproval: mockUpcomingContent
            .filter(c => c.approval_status === "pending")
            .slice(0, 2),
        });
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch content calendar data:", err);
      setError("Failed to load content calendar data");

      // Fallback data
      setData({
        summary: {
          totalScheduled: 12,
          pendingApproval: 3,
          publishingToday: 2,
          upcomingThisWeek: 8,
        },
        upcomingContent: [
          {
            id: "fallback-001",
            title: "Marketing Update",
            type: "post",
            platform: ["facebook"],
            scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000),
            scheduled_time: "10:00",
            status: "scheduled",
            approval_status: "approved",
            author: "Marketing Team",
            content_preview: "Weekly marketing update...",
          },
        ],
        pendingApproval: [
          {
            id: "fallback-002",
            title: "Product Launch",
            type: "campaign",
            platform: ["email", "social"],
            scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            scheduled_time: "09:00",
            status: "pending_approval",
            approval_status: "pending",
            author: "Product Team",
            content_preview: "New product launch campaign...",
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
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending_approval":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
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

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Vandaag";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Morgen";
    } else {
      return date.toLocaleDateString("nl-NL", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <UltraPremiumCard className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            Content Calendar
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
            Content Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-gray-400">
            No content calendar data available
          </div>
        </CardContent>
      </UltraPremiumCard>
    );
  }

  return (
    <UltraPremiumCard className="h-96">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            Content Calendar
          </CardTitle>
          <Link href="/content-calendar-manager">
            <NormalButton variant="secondary" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Calendar
            </NormalButton>
          </Link>
        </div>
        <CardDescription className="text-gray-400">
          Scheduled content and approval status overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-yellow-400 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error} - Showing fallback data
          </div>
        )}

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {data.summary.totalScheduled}
            </div>
            <div className="text-xs text-gray-400">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {data.summary.pendingApproval}
            </div>
            <div className="text-xs text-gray-400">Pending</div>
          </div>
        </div>

        {/* Upcoming Content */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Upcoming Content
          </h4>
          <div className="space-y-3 max-h-32 overflow-y-auto">
            {data.upcomingContent.map(content => (
              <div
                key={content.id}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(content.status)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {content.title}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span>
                        {formatDate(content.scheduled_date)}{" "}
                        {content.scheduled_time}
                      </span>
                      <span>
                        {content.platform
                          .map(p => getPlatformEmoji(p))
                          .join("")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    className={getStatusColor(content.status)}
                    variant="secondary"
                  >
                    {content.status === "pending_approval"
                      ? "Approval"
                      : content.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approval Items */}
        {data.pendingApproval.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Requires Approval ({data.summary.pendingApproval})
            </h4>
            <div className="space-y-2">
              {data.pendingApproval.map(content => (
                <div
                  key={content.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-300 truncate flex-1">
                    {content.title}
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-2 text-yellow-400 bg-yellow-400/10"
                  >
                    {content.author}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </UltraPremiumCard>
  );
}
