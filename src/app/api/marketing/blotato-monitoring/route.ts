/**
 * Blotato Real-Time Monitoring API - Task 103.6
 * Provides real-time monitoring data for Blotato API and posting status
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BlotatoIntegrationService } from "@/lib/apis/blotato-integration";

// Mock Blotato monitoring service - in production would integrate with actual monitoring
class BlotatoMonitoringService {
  private blotatoService: BlotatoIntegrationService;

  constructor() {
    this.blotatoService = new BlotatoIntegrationService();
  }

  async getApiHealth() {
    try {
      // Check Blotato API health using service status
      const serviceStatus = this.blotatoService.getServiceStatus();
      const stats = this.blotatoService.getPublishingStats();

      return {
        status:
          serviceStatus.isHealthy && serviceStatus.isInitialized
            ? "healthy"
            : "degraded",
        response_time_ms: Math.floor(Math.random() * 500) + 200, // Mock response time
        rate_limit_remaining: serviceStatus.rateLimitStatus?.remaining || 847,
        rate_limit_reset:
          serviceStatus.rateLimitStatus?.resetTime?.toISOString() ||
          new Date(Date.now() + 3600000).toISOString(),
        last_checked: new Date().toISOString(),
        uptime_percentage: serviceStatus.isHealthy ? 99.7 : 85.2,
        error_rate: (stats.failedPublished / (stats.totalPublished || 1)) * 100,
      };
    } catch (error) {
      console.error("Error getting API health:", error);
      return {
        status: "down",
        response_time_ms: 0,
        rate_limit_remaining: 0,
        rate_limit_reset: new Date(Date.now() + 3600000).toISOString(),
        last_checked: new Date().toISOString(),
        uptime_percentage: 0,
        error_rate: 100,
      };
    }
  }

  async getPostingQueue() {
    const supabase = await createClient();

    try {
      const { data: posts, error } = await supabase
        .from("content_calendar")
        .select("*")
        .in("status", [
          "pending",
          "publishing",
          "published",
          "failed",
          "retrying",
        ])
        .order("calendar_date", { ascending: true })
        .limit(20);

      if (error) throw error;

      return (
        posts?.map((post: any) => ({
          id: post.id,
          content_id: post.content_id || post.id,
          title: post.title || "Untitled Post",
          platform: Array.isArray(post.target_platforms)
            ? post.target_platforms[0]
            : "unknown",
          status: post.status,
          scheduled_time: post.calendar_date,
          published_time: post.published_at,
          retry_count: post.retry_count || 0,
          error_message: post.error_message,
          blotato_response: post.blotato_response,
          performance_metrics: post.performance_metrics
            ? {
                reach: post.performance_metrics.reach,
                engagement: post.performance_metrics.engagement,
                clicks: post.performance_metrics.clicks,
              }
            : undefined,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching posting queue:", error);
      return [];
    }
  }

  async getPlatformMetrics() {
    const supabase = await createClient();

    try {
      // Get platform-specific metrics from the last 24 hours
      const yesterday = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();

      const { data: posts, error } = await supabase
        .from("content_calendar")
        .select("target_platforms, status, calendar_date, created_at")
        .gte("calendar_date", yesterday);

      if (error) throw error;

      const platforms = ["linkedin", "instagram", "twitter", "facebook"];

      return platforms.map(platform => {
        const platformPosts =
          posts?.filter(
            (post: any) =>
              Array.isArray(post.target_platforms) &&
              post.target_platforms.includes(platform)
          ) || [];

        const published = platformPosts.filter(
          (p: any) => p.status === "published"
        ).length;
        const failed = platformPosts.filter((p: any) => p.status === "failed").length;
        const pending = platformPosts.filter(
          (p: any) => p.status === "pending"
        ).length;
        const total = platformPosts.length;

        return {
          platform,
          posts_today: total,
          success_rate: total > 0 ? (published / total) * 100 : 100,
          avg_response_time: Math.floor(Math.random() * 2000) + 800, // Mock response time
          rate_limit_status:
            failed > 2 ? "critical" : failed > 0 ? "warning" : "ok",
          last_post:
            platformPosts.length > 0
              ? platformPosts[platformPosts.length - 1].calendar_date
              : new Date(Date.now() - 3600000).toISOString(),
          queue_size: pending,
        };
      });
    } catch (error) {
      console.error("Error fetching platform metrics:", error);
      return [];
    }
  }

  async getRealTimeStats() {
    const supabase = await createClient();

    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: todayPosts, error } = await supabase
        .from("content_calendar")
        .select("status")
        .gte("calendar_date", today + "T00:00:00.000Z");

      if (error) throw error;

      const published =
        todayPosts?.filter((p: any) => p.status === "published").length || 0;
      const failed = todayPosts?.filter((p: any) => p.status === "failed").length || 0;
      const pending =
        todayPosts?.filter((p: any) => p.status === "pending").length || 0;
      const total = todayPosts?.length || 0;

      return {
        posts_published_today: published,
        posts_failed_today: failed,
        posts_in_queue: pending,
        avg_publish_time: 1425, // Mock average
        success_rate_24h: total > 0 ? (published / total) * 100 : 100,
        retry_success_rate: 72.3, // Mock retry success rate
      };
    } catch (error) {
      console.error("Error fetching real-time stats:", error);
      return {
        posts_published_today: 0,
        posts_failed_today: 0,
        posts_in_queue: 0,
        avg_publish_time: 0,
        success_rate_24h: 0,
        retry_success_rate: 0,
      };
    }
  }

  async getPerformanceTimeline() {
    // Mock timeline data - in production would query actual metrics
    const timeline = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 15 * 60 * 1000); // 15-minute intervals
      timeline.push({
        time: time.toTimeString().substring(0, 5),
        published: Math.floor(Math.random() * 10) + 10,
        failed: Math.floor(Math.random() * 3),
        response_time: Math.floor(Math.random() * 500) + 1000,
      });
    }

    return timeline;
  }

  async getActiveAlerts() {
    const supabase = await createClient();

    try {
      // Check for failed posts in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data: failedPosts, error } = await supabase
        .from("content_calendar")
        .select("title, error_message, calendar_date, target_platforms")
        .eq("status", "failed")
        .gte("calendar_date", oneHourAgo);

      if (error) throw error;

      const alerts = [];

      // Add failed post alerts
      if (failedPosts && failedPosts.length > 0) {
        alerts.push({
          id: "failed_posts",
          type: "error",
          title: "Failed Posts Detected",
          message: `${failedPosts.length} posts failed to publish in the last hour`,
          timestamp: new Date().toISOString(),
          severity: "high",
          details: failedPosts.map((post: any) => ({
            title: post.title || "Untitled Post",
            error: post.error_message || "Unknown error",
            platforms: post.target_platforms || [],
            scheduled_time: post.calendar_date,
          })),
        });
      }

      // Mock rate limit alert
      if (Math.random() < 0.1) {
        alerts.push({
          id: "rate_limit",
          type: "warning",
          title: "Rate Limit Approaching",
          message: "LinkedIn API rate limit at 85% capacity",
          timestamp: new Date().toISOString(),
          severity: "medium",
          details: {
            platform: "linkedin",
            current_usage: 85,
            limit_reset: new Date(Date.now() + 3600000).toISOString(),
          },
        });
      }

      return alerts;
    } catch (error) {
      console.error("Error fetching active alerts:", error);
      return [];
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // const monitoringService = new BlotatoMonitoringService();
    const monitoringService = new BlotatoMonitoringService();

    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get("endpoint");

    switch (endpoint) {
      case "health":
        return NextResponse.json(await monitoringService.getApiHealth());

      case "queue":
        return NextResponse.json(await monitoringService.getPostingQueue());

      case "metrics":
        return NextResponse.json(await monitoringService.getPlatformMetrics());

      case "stats":
        return NextResponse.json(await monitoringService.getRealTimeStats());

      case "timeline":
        return NextResponse.json(await monitoringService.getPerformanceTimeline());

      case "alerts":
        return NextResponse.json(await monitoringService.getActiveAlerts());

      default:
        // Return all data for dashboard
        const [health, queue, metrics, stats, timeline, alerts] = await Promise.all([
          monitoringService.getApiHealth(),
          monitoringService.getPostingQueue(),
          monitoringService.getPlatformMetrics(),
          monitoringService.getRealTimeStats(),
          monitoringService.getPerformanceTimeline(),
          monitoringService.getActiveAlerts(),
        ]);

        return NextResponse.json({
          health,
          queue,
          metrics,
          stats,
          timeline,
          alerts,
          last_updated: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error("Error in Blotato monitoring API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    const monitoringService = new BlotatoMonitoringService();

    switch (action) {
      case "retry_failed_posts":
        // Mock retry logic - in production would integrate with actual retry mechanism
        const failedPosts = await monitoringService.getPostingQueue();
        const failed = failedPosts.filter(post => post.status === "failed");

        // Simulate retry attempt
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
          success: true,
          message: `Retrying ${failed.length} failed posts`,
          retried_posts: failed.map(post => ({
            id: post.id,
            title: post.title,
            new_status: "retrying",
          })),
        });

      case "pause_posting":
        // Mock pause logic
        return NextResponse.json({
          success: true,
          message: "Posting paused for all platforms",
          paused_at: new Date().toISOString(),
        });

      case "resume_posting":
        // Mock resume logic
        return NextResponse.json({
          success: true,
          message: "Posting resumed for all platforms",
          resumed_at: new Date().toISOString(),
        });

      case "clear_alerts":
        // Mock clear alerts logic
        return NextResponse.json({
          success: true,
          message: "All alerts cleared",
          cleared_at: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in Blotato monitoring POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
