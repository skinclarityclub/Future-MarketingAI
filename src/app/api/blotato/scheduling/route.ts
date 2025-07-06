import { NextRequest, NextResponse } from "next/server";
import { getBlotatoSchedulingService } from "@/lib/workflows/blotato-scheduling-service";
import { ClickUpContentData } from "@/lib/workflows/clickup-content-extraction";

export const runtime = "nodejs";

const schedulingService = getBlotatoSchedulingService();

/**
 * POST: Schedule content via Blotato with intelligent optimization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "schedule_content":
        return handleScheduleContent(data);

      case "schedule_bulk":
        return handleBulkScheduling(data);

      case "emergency_schedule":
        return handleEmergencyScheduling(data);

      case "check_conflicts":
        return handleConflictCheck(data);

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Supported: schedule_content, schedule_bulk, emergency_schedule, check_conflicts",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Scheduling API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Get scheduling status and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const contentId = searchParams.get("content_id");
    const days = parseInt(searchParams.get("days") || "7");

    switch (action) {
      case "status":
        if (!contentId) {
          return NextResponse.json(
            { error: "content_id required for status check" },
            { status: 400 }
          );
        }
        return handleStatusCheck(contentId);

      case "analytics":
        return handleAnalyticsReport(days);

      case "upcoming":
        return handleUpcomingSchedule(days);

      case "conflicts":
        return handleConflictReport();

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Supported: status, analytics, upcoming, conflicts",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Scheduling GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle content scheduling
 */
async function handleScheduleContent(data: {
  content_data: ClickUpContentData;
  platforms?: string[];
  preferred_time?: string;
  enable_optimization?: boolean;
}) {
  const { content_data, platforms, preferred_time, enable_optimization } = data;

  if (!content_data || !content_data.task_id) {
    return NextResponse.json(
      { error: "content_data with task_id is required" },
      { status: 400 }
    );
  }

  const result = await schedulingService.scheduleContent(content_data, {
    platforms,
    preferred_time,
    enable_optimization,
  });

  return NextResponse.json({
    success: true,
    scheduling_result: result,
    message: result.success
      ? `Content scheduled successfully for ${result.platforms.join(", ")}`
      : `Scheduling failed: ${result.error}`,
  });
}

/**
 * Handle bulk scheduling
 */
async function handleBulkScheduling(data: {
  content_items: ClickUpContentData[];
  campaign_id?: string;
  scheduling_strategy:
    | "optimal_spacing"
    | "batch_publish"
    | "drip_campaign"
    | "custom";
  time_constraints?: any;
}) {
  const { content_items, campaign_id, scheduling_strategy, time_constraints } =
    data;

  if (!content_items || content_items.length === 0) {
    return NextResponse.json(
      { error: "content_items array is required" },
      { status: 400 }
    );
  }

  const results = await schedulingService.scheduleBulkContent({
    content_items,
    campaign_id,
    scheduling_strategy,
    time_constraints,
  });

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

  return NextResponse.json({
    success: true,
    bulk_results: results,
    summary: {
      total: results.length,
      successful: successCount,
      failed: failureCount,
      success_rate: (successCount / results.length) * 100,
    },
    message: `Bulk scheduling completed: ${successCount}/${results.length} successful`,
  });
}

/**
 * Handle emergency scheduling
 */
async function handleEmergencyScheduling(data: {
  content_data: ClickUpContentData;
  platforms?: string[];
  emergency_options: {
    priority_level: "urgent" | "high" | "critical";
    max_delay_minutes: number;
    override_conflicts: boolean;
    notification_channels: string[];
    fallback_platforms?: string[];
  };
}) {
  const { content_data, platforms, emergency_options } = data;

  if (!content_data || !emergency_options) {
    return NextResponse.json(
      { error: "content_data and emergency_options are required" },
      { status: 400 }
    );
  }

  const result = await schedulingService.scheduleContent(content_data, {
    platforms,
    emergency_options,
  });

  return NextResponse.json({
    success: true,
    emergency_result: result,
    message: result.success
      ? `Emergency content scheduled successfully`
      : `Emergency scheduling failed: ${result.error}`,
    priority_level: emergency_options.priority_level,
  });
}

/**
 * Handle conflict checking
 */
async function handleConflictCheck(data: {
  content_data: ClickUpContentData;
  platforms: string[];
  scheduled_time: string;
}) {
  // This would use the private detectSchedulingConflicts method
  // For now, return a mock response
  return NextResponse.json({
    success: true,
    conflicts: [],
    message: "No scheduling conflicts detected",
    optimal_alternatives: [],
  });
}

/**
 * Handle status checking
 */
async function handleStatusCheck(contentId: string) {
  // Mock implementation - would query actual scheduling status
  return NextResponse.json({
    success: true,
    content_id: contentId,
    status: "scheduled",
    scheduled_time: new Date().toISOString(),
    platforms: ["twitter", "linkedin"],
    analytics_tracking: {
      tracking_id: `analytics_${contentId}`,
      metrics_available: true,
    },
  });
}

/**
 * Handle analytics report
 */
async function handleAnalyticsReport(days: number) {
  // Mock implementation - would query actual analytics
  return NextResponse.json({
    success: true,
    period_days: days,
    summary: {
      total_scheduled: 45,
      successful_posts: 42,
      failed_posts: 3,
      success_rate: 93.3,
      avg_engagement_rate: 4.2,
      total_reach: 125000,
    },
    platform_breakdown: {
      twitter: { posts: 25, success_rate: 96, avg_engagement: 3.8 },
      linkedin: { posts: 15, success_rate: 93, avg_engagement: 5.1 },
      instagram: { posts: 5, success_rate: 80, avg_engagement: 6.2 },
    },
    performance_insights: [
      "Best performing time: 14:00-16:00",
      "LinkedIn posts have highest engagement",
      "Visual content performs 40% better",
    ],
  });
}

/**
 * Handle upcoming schedule
 */
async function handleUpcomingSchedule(days: number) {
  // Mock implementation - would query actual schedule
  const upcoming = [];
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const scheduleTime = new Date(now.getTime() + i * 4 * 60 * 60 * 1000); // Every 4 hours
    upcoming.push({
      content_id: `content_${i + 1}`,
      title: `Scheduled Content ${i + 1}`,
      scheduled_time: scheduleTime.toISOString(),
      platforms: ["twitter", "linkedin"],
      status: "scheduled",
      priority: i < 3 ? "high" : "medium",
    });
  }

  return NextResponse.json({
    success: true,
    period_days: days,
    upcoming_posts: upcoming,
    summary: {
      total_upcoming: upcoming.length,
      high_priority: upcoming.filter(p => p.priority === "high").length,
      platforms_used: ["twitter", "linkedin", "instagram"],
    },
  });
}

/**
 * Handle conflict report
 */
async function handleConflictReport() {
  // Mock implementation - would query actual conflicts
  return NextResponse.json({
    success: true,
    conflicts: [
      {
        type: "platform_overlap",
        severity: "medium",
        description: "3 posts scheduled on Twitter within 30 minutes",
        affected_content: ["content_1", "content_2", "content_3"],
        resolution_options: [
          "Reschedule posts with 45-minute spacing",
          "Move to different platforms",
          "Combine into thread",
        ],
      },
    ],
    recommendations: [
      "Consider 45-minute minimum spacing between platform posts",
      "Use bulk scheduling for better conflict avoidance",
      "Set up emergency fallback platforms",
    ],
  });
}
