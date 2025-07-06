/**
 * Sync Management API
 * Manages the real-time synchronization system and webhook processing
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncQueueProcessor } from "@/lib/sync/queue-processor";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const supabase = await createClient();

    switch (action) {
      case "status":
        return await getSystemStatus(supabase);
      case "queue":
        return await getQueueStatus(supabase);
      case "webhooks":
        return await getWebhookLogs(supabase, searchParams);
      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Management API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "start":
        await syncQueueProcessor.startProcessor();
        return NextResponse.json({ message: "Queue processor started" });
      case "stop":
        syncQueueProcessor.stopProcessor();
        return NextResponse.json({ message: "Queue processor stopped" });
      case "process":
        // Process items directly
        await syncQueueProcessor.addToQueue({
          source: "manual",
          action: "upsert",
          entity_type: "customer",
          entity_id: "manual_trigger",
          payload: {},
          priority: 1,
          max_retries: 3,
          scheduled_for: new Date().toISOString(),
        });
        return NextResponse.json({ message: "Queue processing triggered" });
      case "clear-failed":
        await clearFailedJobs();
        return NextResponse.json({ message: "Failed jobs cleared" });
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Management action error:", error);
    return NextResponse.json(
      { error: "Failed to execute action" },
      { status: 500 }
    );
  }
}

async function getSystemStatus(supabase: any) {
  const stats = await Promise.allSettled([
    supabase.from("sync_queue").select("status", { count: "exact" }),
    supabase.from("webhook_logs").select("source", { count: "exact" }),
    supabase.from("unified_customers").select("status", { count: "exact" }),
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    queue_processor: {
      status: "active",
      last_run: new Date().toISOString(),
    },
    database: {
      queue_items: stats[0].status === "fulfilled" ? stats[0].value.count : 0,
      webhook_logs: stats[1].status === "fulfilled" ? stats[1].value.count : 0,
      customers: stats[2].status === "fulfilled" ? stats[2].value.count : 0,
    },
  });
}

async function getQueueStatus(supabase: any) {
  const { data: queueItems } = await supabase
    .from("sync_queue")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: priorityStats } = await supabase
    .from("sync_queue")
    .select("priority, status")
    .order("priority");

  // Group by priority and status
  const groupedStats = priorityStats?.reduce((acc: any, item: any) => {
    const key = `${item.priority}_${item.status}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    items: queueItems || [],
    statistics: {
      by_priority: groupedStats || {},
      total: queueItems?.length || 0,
    },
  });
}

async function getWebhookLogs(supabase: any, searchParams: URLSearchParams) {
  const limit = parseInt(searchParams.get("limit") || "50");
  const source = searchParams.get("source");

  let query = supabase
    .from("webhook_logs")
    .select("*")
    .order("processed_at", { ascending: false })
    .limit(limit);

  if (source) {
    query = query.eq("source", source);
  }

  const { data: logs } = await query;

  return NextResponse.json({
    logs: logs || [],
    filters: { source, limit },
  });
}

async function clearFailedJobs() {
  const supabase = await createClient();

  await supabase.from("sync_queue").delete().eq("status", "failed");
}
