import { NextRequest, NextResponse } from "next/server";
import { MarketingDataSyncService } from "@/lib/marketing/sync-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = "demo-user",
      startDate,
      endDate,
      platforms,
      syncType = "incremental",
    } = body;

    const syncService = new MarketingDataSyncService();

    let result;
    if (syncType === "full") {
      result = await syncService.scheduleFullSync(userId);
    } else if (syncType === "incremental") {
      result = await syncService.scheduleIncrementalSync(userId);
    } else if (startDate && endDate) {
      result = await syncService.syncAllPlatforms(
        userId,
        startDate,
        endDate,
        platforms
      );
    } else {
      return NextResponse.json(
        { error: "Invalid sync parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Marketing sync API error:", error);
    return NextResponse.json(
      { error: "Failed to sync marketing data", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || "demo-user";

    const syncService = new MarketingDataSyncService();
    const status = await syncService.getSyncStatus(userId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Marketing sync status API error:", error);
    return NextResponse.json(
      { error: "Failed to get sync status", details: String(error) },
      { status: 500 }
    );
  }
}
