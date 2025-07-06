import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.content_id || !body.suggestions) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: content_id, suggestions",
        },
        { status: 400 }
      );
    }

    const {
      content_id,
      content_title,
      suggestions,
      distribution_type,
      timestamp,
      total_suggestions,
      critical_count,
      high_count,
      estimated_impact,
    } = body;

    // Create in-app notification for dashboard users
    const notificationData = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "content_optimization_suggestion",
      title: `Content Optimization Suggestions Available`,
      message: `${total_suggestions} new optimization suggestions for "${content_title || "your content"}"`,
      data: {
        content_id,
        content_title,
        suggestions,
        distribution_type,
        total_suggestions,
        critical_count: critical_count || 0,
        high_count: high_count || 0,
        estimated_impact: estimated_impact || {
          engagement: 0,
          reach: 0,
          roi: 0,
        },
      },
      priority:
        distribution_type === "urgent"
          ? "high"
          : distribution_type === "priority"
            ? "medium"
            : "low",
      category: "content_optimization",
      status: "unread",
      created_at: timestamp || new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      action_url: `/[locale]/content-optimization?content_id=${content_id}`,
      metadata: {
        source: "content_optimization_workflow",
        distribution_type,
        suggestion_count: total_suggestions,
      },
    };

    // Store notification in database for all users
    // TODO: In production, you would get the actual user list from stakeholder preferences
    const mockUsers = [
      "user_content_manager_1",
      "user_marketing_director_1",
      "user_social_media_manager_1",
    ];

    const notificationPromises = mockUsers.map(async userId => {
      const userNotification = {
        ...notificationData,
        id: `${notificationData.id}_${userId}`,
        recipient_id: userId,
        recipient_type: "user",
      };

      return supabase.from("in_app_notifications").insert(userNotification);
    });

    await Promise.all(notificationPromises);

    // Create global notification for dashboard display
    await supabase.from("content_optimization_dashboard_notifications").insert({
      content_id,
      content_title: content_title || "Content Optimization",
      notification_type: distribution_type,
      suggestions_count: total_suggestions,
      critical_count: critical_count || 0,
      high_count: high_count || 0,
      estimated_impact: estimated_impact || { engagement: 0, reach: 0, roi: 0 },
      status: "active",
      created_at: timestamp || new Date().toISOString(),
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    });

    // If there are critical suggestions, create urgent alerts
    if (distribution_type === "urgent" && critical_count > 0) {
      await supabase.from("urgent_content_alerts").insert({
        content_id,
        alert_type: "critical_optimization_suggestions",
        message: `${critical_count} critical optimization suggestions require immediate attention`,
        priority: "critical",
        status: "active",
        created_at: timestamp || new Date().toISOString(),
        metadata: {
          content_title,
          critical_count,
          suggestions: suggestions.filter(
            (s: any) => s.priority === "critical"
          ),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Dashboard notifications created successfully",
      notifications_created: mockUsers.length,
      dashboard_alert_created: true,
      urgent_alert_created:
        distribution_type === "urgent" && critical_count > 0,
    });
  } catch (error) {
    console.error("Dashboard notification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create dashboard notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("content_id");
    const userId = searchParams.get("user_id");
    const status = searchParams.get("status") || "active";

    if (contentId) {
      // Get dashboard notifications for specific content
      const { data: notifications } = await supabase
        .from("content_optimization_dashboard_notifications")
        .select("*")
        .eq("content_id", contentId)
        .eq("status", status)
        .order("created_at", { ascending: false });

      return NextResponse.json({
        success: true,
        notifications: notifications || [],
      });
    }

    if (userId) {
      // Get user-specific in-app notifications
      const { data: userNotifications } = await supabase
        .from("in_app_notifications")
        .select("*")
        .eq("recipient_id", userId)
        .eq("category", "content_optimization")
        .order("created_at", { ascending: false })
        .limit(50);

      return NextResponse.json({
        success: true,
        notifications: userNotifications || [],
      });
    }

    // Get all active dashboard notifications
    const { data: dashboardNotifications } = await supabase
      .from("content_optimization_dashboard_notifications")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(20);

    // Get urgent alerts
    const { data: urgentAlerts } = await supabase
      .from("urgent_content_alerts")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      dashboard_notifications: dashboardNotifications || [],
      urgent_alerts: urgentAlerts || [],
    });
  } catch (error) {
    console.error("Error fetching dashboard notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { notification_id, status, user_id } = body;

    if (!notification_id || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: notification_id, status",
        },
        { status: 400 }
      );
    }

    // Update notification status
    if (user_id) {
      // Update user-specific notification
      await supabase
        .from("in_app_notifications")
        .update({
          status,
          read_at: status === "read" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", notification_id)
        .eq("recipient_id", user_id);
    } else {
      // Update dashboard notification
      await supabase
        .from("content_optimization_dashboard_notifications")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", notification_id);
    }

    return NextResponse.json({
      success: true,
      message: "Notification status updated successfully",
    });
  } catch (error) {
    console.error("Error updating notification status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update notification status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
