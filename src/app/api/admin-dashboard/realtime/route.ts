/**
 * Admin Dashboard Real-Time Data API
 * Provides endpoints for real-time data subscriptions and dashboard snapshots
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDashboardDataAggregator } from "@/lib/realtime/admin-dashboard-data-aggregator";

export const dynamic = "force-dynamic";

// ====================================================================
// GET: Get dashboard snapshot or subscribe to real-time data
// ====================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "snapshot";
    const sources = searchParams.get("sources")?.split(",") || [];
    const categories = searchParams.get("categories")?.split(",") || [];

    // Mock authentication for demo
    const userId = "demo-user";
    const userRole = "admin";

    switch (action) {
      case "snapshot":
        return await handleSnapshotRequest(userId, userRole);

      case "system-status":
        return await handleSystemStatusRequest();

      case "alerts":
        return await handleAlertsRequest(userId, userRole);

      case "sse":
        return await handleSSEConnection(request, userId, userRole, {
          sources,
          categories,
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Admin dashboard realtime API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ====================================================================
// POST: Manage subscriptions and alerts
// ====================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    // Mock authentication for demo
    const userId = "demo-user";
    const userRole = "admin";

    switch (action) {
      case "acknowledge-alert":
        return await handleAcknowledgeAlert(params.alertId, userId);

      case "force-aggregation":
        return await handleForceAggregation(userId, userRole);

      case "start-aggregator":
        return await handleStartAggregator(userId, userRole);

      case "stop-aggregator":
        return await handleStopAggregator(userId, userRole);

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Admin dashboard realtime POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ====================================================================
// HANDLER FUNCTIONS
// ====================================================================

async function handleSnapshotRequest(userId: string, userRole: string) {
  try {
    // Start aggregator if not running
    const systemStatus = adminDashboardDataAggregator.getSystemStatus();
    if (!systemStatus.isRunning) {
      await adminDashboardDataAggregator.start();
    }

    // Get latest snapshot
    let snapshot = adminDashboardDataAggregator.getLatestSnapshot();

    // If no snapshot exists, force aggregation
    if (!snapshot) {
      snapshot = await adminDashboardDataAggregator.forceAggregation();
    }

    return NextResponse.json({
      success: true,
      data: snapshot,
      metadata: {
        timestamp: new Date().toISOString(),
        systemStatus,
        userId,
      },
    });
  } catch (error) {
    console.error("Error getting dashboard snapshot:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get dashboard snapshot" },
      { status: 500 }
    );
  }
}

async function handleSystemStatusRequest() {
  try {
    const status = adminDashboardDataAggregator.getSystemStatus();

    return NextResponse.json({
      success: true,
      data: status,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting system status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get system status" },
      { status: 500 }
    );
  }
}

async function handleAlertsRequest(userId: string, userRole: string) {
  try {
    const alerts = adminDashboardDataAggregator.getActiveAlerts();

    return NextResponse.json({
      success: true,
      data: alerts,
      metadata: {
        timestamp: new Date().toISOString(),
        count: alerts.length,
        userId,
      },
    });
  } catch (error) {
    console.error("Error getting alerts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get alerts" },
      { status: 500 }
    );
  }
}

async function handleSSEConnection(
  request: NextRequest,
  userId: string,
  userRole: string,
  options: { sources: string[]; categories: string[] }
) {
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    start(controller) {
      const sendData = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial connection confirmation
      sendData({
        type: "connection",
        status: "established",
        userId,
        timestamp: new Date().toISOString(),
      });

      // Send periodic updates
      const interval = setInterval(() => {
        try {
          const snapshot = adminDashboardDataAggregator.getLatestSnapshot();
          if (snapshot) {
            sendData({
              type: "snapshot",
              data: snapshot,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("SSE update error:", error);
        }
      }, 5000);

      // Cleanup on client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },

    cancel() {
      console.log("SSE connection cancelled");
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}

async function handleAcknowledgeAlert(alertId: string, userId: string) {
  try {
    // Mock alert acknowledgment
    return NextResponse.json({
      success: true,
      message: `Alert ${alertId} acknowledged by ${userId}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to acknowledge alert" },
      { status: 500 }
    );
  }
}

async function handleForceAggregation(userId: string, userRole: string) {
  try {
    if (userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const snapshot = await adminDashboardDataAggregator.forceAggregation();

    return NextResponse.json({
      success: true,
      message: "Aggregation forced successfully",
      data: snapshot,
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error forcing aggregation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to force aggregation" },
      { status: 500 }
    );
  }
}

async function handleStartAggregator(userId: string, userRole: string) {
  try {
    if (userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await adminDashboardDataAggregator.start();

    return NextResponse.json({
      success: true,
      message: "Aggregator started successfully",
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error starting aggregator:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start aggregator" },
      { status: 500 }
    );
  }
}

async function handleStopAggregator(userId: string, userRole: string) {
  try {
    if (userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await adminDashboardDataAggregator.stop();

    return NextResponse.json({
      success: true,
      message: "Aggregator stopped successfully",
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error stopping aggregator:", error);
    return NextResponse.json(
      { success: false, error: "Failed to stop aggregator" },
      { status: 500 }
    );
  }
}
