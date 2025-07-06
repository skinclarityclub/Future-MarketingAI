import { NextRequest, NextResponse } from "next/server";
import { intelligentAlertManager } from "@/lib/intelligent-alerts/alert-manager";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "list":
        const alerts = intelligentAlertManager.getActiveAlerts();
        return NextResponse.json({
          success: true,
          data: alerts,
        });

      case "statistics":
        const stats = intelligentAlertManager.getAlertStatistics();
        return NextResponse.json({
          success: true,
          data: stats,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action parameter",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in intelligent alerts API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId, threshold, metric } = body;

    switch (action) {
      case "acknowledge":
        if (!alertId) {
          return NextResponse.json(
            {
              success: false,
              error: "Alert ID is required",
            },
            { status: 400 }
          );
        }

        const acknowledged =
          await intelligentAlertManager.acknowledgeAlert(alertId);
        return NextResponse.json({
          success: acknowledged,
          message: acknowledged ? "Alert acknowledged" : "Alert not found",
        });

      case "resolve":
        if (!alertId) {
          return NextResponse.json(
            {
              success: false,
              error: "Alert ID is required",
            },
            { status: 400 }
          );
        }

        const resolved = await intelligentAlertManager.resolveAlert(alertId);
        return NextResponse.json({
          success: resolved,
          message: resolved ? "Alert resolved" : "Alert not found",
        });

      case "update_threshold":
        if (!metric || !threshold) {
          return NextResponse.json(
            {
              success: false,
              error: "Metric and threshold are required",
            },
            { status: 400 }
          );
        }

        await intelligentAlertManager.updateThreshold(metric, threshold);
        return NextResponse.json({
          success: true,
          message: "Threshold updated successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in intelligent alerts POST API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
