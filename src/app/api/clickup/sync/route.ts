import { NextRequest, NextResponse } from "next/server";
import {
  createClickUpSyncService,
  type SyncResult,
} from "@/lib/sync/clickup-sync";

export const runtime = "nodejs";

interface SyncResponse {
  status: "success" | "error";
  message: string;
  results?: SyncResult[];
  total_processed?: number;
  successful_syncs?: number;
  failed_syncs?: number;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SyncResponse>> {
  try {
    const body = await request.json();
    const { action, clickupListId, projectId, direction, taskId } = body;

    console.log(`[ClickUp Sync API] Processing ${action} request`);

    const syncService = createClickUpSyncService();

    switch (action) {
      case "sync-single-task":
        if (!taskId || !direction) {
          return NextResponse.json(
            {
              status: "error",
              message:
                "Task ID and direction are required for single task sync",
            },
            { status: 400 }
          );
        }

        const singleResult = await syncService.syncSingleTask(
          taskId,
          direction,
          clickupListId,
          projectId
        );

        return NextResponse.json({
          status: singleResult.success ? "success" : "error",
          message: singleResult.message,
          results: [singleResult],
          total_processed: 1,
          successful_syncs: singleResult.success ? 1 : 0,
          failed_syncs: singleResult.success ? 0 : 1,
        });

      case "bidirectional-sync":
        if (!clickupListId) {
          return NextResponse.json(
            {
              status: "error",
              message: "ClickUp list ID is required for bidirectional sync",
            },
            { status: 400 }
          );
        }

        const syncReport = await syncService.performBidirectionalSync(
          clickupListId,
          projectId
        );

        return NextResponse.json({
          status: syncReport.failed_syncs === 0 ? "success" : "error",
          message: `Sync completed: ${syncReport.successful_syncs}/${syncReport.total_processed} successful`,
          results: syncReport.results,
          total_processed: syncReport.total_processed,
          successful_syncs: syncReport.successful_syncs,
          failed_syncs: syncReport.failed_syncs,
        });

      case "sync-status":
        if (!taskId) {
          return NextResponse.json(
            {
              status: "error",
              message: "Task ID is required for sync status check",
            },
            { status: 400 }
          );
        }

        const status = await syncService.getSyncStatus(taskId);

        return NextResponse.json({
          status: "success",
          message: "Sync status retrieved",
          ...status,
        });

      default:
        return NextResponse.json(
          {
            status: "error",
            message: `Unknown action: ${action}`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[ClickUp Sync API] Error processing request:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to process sync request",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<any>> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    console.log(`[ClickUp Sync API] Processing GET ${action} request`);

    const syncService = createClickUpSyncService();

    switch (action) {
      case "status":
        const taskId = searchParams.get("taskId");
        if (!taskId) {
          return NextResponse.json(
            {
              status: "error",
              message: "Task ID is required for sync status",
            },
            { status: 400 }
          );
        }

        const status = await syncService.getSyncStatus(taskId);

        return NextResponse.json({
          status: "success",
          message: "Sync status retrieved",
          data: status,
        });

      case "health":
        return NextResponse.json({
          status: "success",
          message: "ClickUp Sync API is healthy",
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            status: "error",
            message: `Unknown action: ${action}`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[ClickUp Sync API] Error processing GET request:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to process sync request",
      },
      { status: 500 }
    );
  }
}
