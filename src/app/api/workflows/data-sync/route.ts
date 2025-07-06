/**
 * Data Synchronization API
 * Task 33.4: Enable Bidirectional Data Synchronization
 * Manages bidirectional data sync between dashboard and n8n workflows
 */

import { NextRequest, NextResponse } from "next/server";
import { dataSyncService } from "@/lib/workflows/data-sync-service";
import { z } from "zod";

// Request schema validation
const syncRequestSchema = z.object({
  action: z.enum([
    "perform_sync",
    "get_status",
    "create_config",
    "update_config",
    "get_configs",
    "get_logs",
    "resolve_conflict",
    "queue_sync",
    "process_queue",
  ]),
  entityType: z.string().optional(),
  direction: z
    .enum(["dashboard_to_n8n", "n8n_to_dashboard", "bidirectional"])
    .optional(),
  configId: z.number().optional(),
  conflictId: z.number().optional(),
  config: z
    .object({
      sourceType: z.enum(["dashboard", "n8n"]),
      targetType: z.enum(["dashboard", "n8n"]),
      mapping: z.record(z.string()),
      transformations: z.array(
        z.object({
          field: z.string(),
          operation: z.enum([
            "map",
            "transform",
            "validate",
            "format",
            "filter",
          ]),
          rule: z.string(),
          parameters: z.record(z.any()).optional(),
        })
      ),
      syncDirection: z.enum(["bidirectional", "unidirectional"]),
      enabled: z.boolean(),
    })
    .optional(),
  queueItem: z
    .object({
      entityType: z.string(),
      entityId: z.string(),
      operation: z.enum(["create", "update", "delete"]),
      direction: z.enum(["dashboard_to_n8n", "n8n_to_dashboard"]),
      priority: z.number().min(1).max(10).optional(),
      payload: z.record(z.any()),
    })
    .optional(),
  resolutionStrategy: z
    .enum([
      "manual",
      "last_write_wins",
      "merge",
      "source_priority",
      "target_priority",
    ])
    .optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

type SyncRequest = z.infer<typeof syncRequestSchema>;

/**
 * Handle GET requests - Get sync status, configs, logs
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "get_status";
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const conflictId = url.searchParams.get("conflictId");

    // Initialize sync service
    await dataSyncService.initialize();

    switch (action) {
      case "get_status":
        const status = await dataSyncService.getSyncStatus();
        return NextResponse.json({
          success: true,
          data: status,
        });

      case "get_configs":
        const configs = await dataSyncService.getSyncStatus();
        return NextResponse.json({
          success: true,
          data: configs.configs,
        });

      case "get_logs":
        const logs = await dataSyncService.getSyncStatus();
        return NextResponse.json({
          success: true,
          data: logs.recentResults,
          pagination: {
            limit,
            offset,
            total: logs.recentResults.length,
          },
        });

      default:
        return NextResponse.json(
          { error: "Invalid action for GET request" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error handling GET request:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle POST requests - Perform sync operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = syncRequestSchema.parse(body);

    // Initialize sync service
    await dataSyncService.initialize();

    switch (validatedRequest.action) {
      case "perform_sync":
        if (!validatedRequest.entityType) {
          return NextResponse.json(
            { error: "entityType is required for sync operation" },
            { status: 400 }
          );
        }

        let syncResults;
        if (validatedRequest.direction === "bidirectional") {
          syncResults = await dataSyncService.performBidirectionalSync(
            validatedRequest.entityType
          );
        } else {
          // For unidirectional sync, we need to determine source and target
          const source =
            validatedRequest.direction === "dashboard_to_n8n"
              ? "dashboard"
              : "n8n";
          const target =
            validatedRequest.direction === "dashboard_to_n8n"
              ? "n8n"
              : "dashboard";

          // Get the appropriate config
          const status = await dataSyncService.getSyncStatus();
          const config = status.configs.find(
            c => c.sourceType === source && c.targetType === target
          );

          if (!config) {
            return NextResponse.json(
              {
                error: `No sync configuration found for ${source} to ${target}`,
              },
              { status: 404 }
            );
          }

          const result = await dataSyncService.syncData(
            source,
            target,
            validatedRequest.entityType,
            config
          );
          syncResults = [result];
        }

        return NextResponse.json({
          success: true,
          data: syncResults,
          message: `Sync operation completed for ${validatedRequest.entityType}`,
        });

      case "create_config":
        if (!validatedRequest.config) {
          return NextResponse.json(
            { error: "config is required for create_config action" },
            { status: 400 }
          );
        }

        const newConfig = await dataSyncService.createSyncConfig(
          validatedRequest.config
        );
        return NextResponse.json({
          success: true,
          data: newConfig,
          message: "Sync configuration created successfully",
        });

      case "queue_sync":
        if (!validatedRequest.queueItem) {
          return NextResponse.json(
            { error: "queueItem is required for queue_sync action" },
            { status: 400 }
          );
        }

        // Add item to sync queue (implementation would be in sync service)
        const queueResult = await addToSyncQueue(validatedRequest.queueItem);
        return NextResponse.json({
          success: true,
          data: queueResult,
          message: "Item added to sync queue",
        });

      case "process_queue":
        // Process pending items in sync queue
        const processResult = await processSyncQueue();
        return NextResponse.json({
          success: true,
          data: processResult,
          message: "Sync queue processing completed",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action for POST request" },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error handling POST request:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle PUT requests - Update configurations and resolve conflicts
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = syncRequestSchema.parse(body);

    // Initialize sync service
    await dataSyncService.initialize();

    switch (validatedRequest.action) {
      case "update_config":
        if (!validatedRequest.configId || !validatedRequest.config) {
          return NextResponse.json(
            {
              error:
                "configId and config are required for update_config action",
            },
            { status: 400 }
          );
        }

        const updatedConfig = await updateSyncConfig(
          validatedRequest.configId,
          validatedRequest.config
        );
        return NextResponse.json({
          success: true,
          data: updatedConfig,
          message: "Sync configuration updated successfully",
        });

      case "resolve_conflict":
        if (
          !validatedRequest.conflictId ||
          !validatedRequest.resolutionStrategy
        ) {
          return NextResponse.json(
            {
              error:
                "conflictId and resolutionStrategy are required for resolve_conflict action",
            },
            { status: 400 }
          );
        }

        const resolvedConflict = await resolveDataConflict(
          validatedRequest.conflictId,
          validatedRequest.resolutionStrategy
        );
        return NextResponse.json({
          success: true,
          data: resolvedConflict,
          message: "Conflict resolved successfully",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action for PUT request" },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error handling PUT request:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions

/**
 * Add item to sync queue
 */
async function addToSyncQueue(queueItem: any) {
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("sync_queue")
    .insert({
      entity_type: queueItem.entityType,
      entity_id: queueItem.entityId,
      operation: queueItem.operation,
      direction: queueItem.direction,
      priority: queueItem.priority || 5,
      payload: queueItem.payload,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Process sync queue
 */
async function processSyncQueue() {
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get pending items ordered by priority and scheduled time
  const { data: queueItems, error } = await supabase
    .from("sync_queue")
    .select("*")
    .eq("status", "pending")
    .order("priority", { ascending: true })
    .order("scheduled_at", { ascending: true })
    .limit(10);

  if (error) throw error;

  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [] as any[],
  };

  for (const item of queueItems || []) {
    try {
      // Mark as processing
      await supabase
        .from("sync_queue")
        .update({ status: "processing", started_at: new Date().toISOString() })
        .eq("id", item.id);

      // Perform sync operation based on direction and entity type
      const source =
        item.direction === "dashboard_to_n8n" ? "dashboard" : "n8n";
      const target =
        item.direction === "dashboard_to_n8n" ? "n8n" : "dashboard";

      // Get sync config
      const status = await dataSyncService.getSyncStatus();
      const config = status.configs.find(
        c => c.sourceType === source && c.targetType === target
      );

      if (config) {
        await dataSyncService.syncData(
          source,
          target,
          item.entity_type,
          config
        );

        // Mark as completed
        await supabase
          .from("sync_queue")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        results.successful++;
      } else {
        throw new Error(
          `No sync configuration found for ${source} to ${target}`
        );
      }

      results.processed++;
    } catch (error) {
      // Mark as failed and increment retry count
      const newRetryCount = item.retry_count + 1;
      const status = newRetryCount >= item.max_retries ? "failed" : "pending";

      await supabase
        .from("sync_queue")
        .update({
          status,
          retry_count: newRetryCount,
          error_message:
            error instanceof Error ? error.message : "Unknown error",
          completed_at: status === "failed" ? new Date().toISOString() : null,
        })
        .eq("id", item.id);

      results.failed++;
      results.errors.push({
        itemId: item.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Update sync configuration
 */
async function updateSyncConfig(configId: number, config: any) {
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("data_sync_configs")
    .update({
      source_type: config.sourceType,
      target_type: config.targetType,
      mapping: config.mapping,
      transformations: config.transformations,
      sync_direction: config.syncDirection,
      enabled: config.enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", configId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Resolve data conflict
 */
async function resolveDataConflict(conflictId: number, strategy: string) {
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get conflict details
  const { data: conflict, error: fetchError } = await supabase
    .from("data_sync_conflicts")
    .select("*")
    .eq("id", conflictId)
    .single();

  if (fetchError) throw fetchError;

  // Apply resolution strategy
  let resolutionData = {};
  switch (strategy) {
    case "last_write_wins":
      // Use the most recently modified data
      resolutionData = conflict.target_data;
      break;
    case "source_priority":
      resolutionData = conflict.source_data;
      break;
    case "target_priority":
      resolutionData = conflict.target_data;
      break;
    case "merge":
      // Simple merge strategy (target overwrites source)
      resolutionData = { ...conflict.source_data, ...conflict.target_data };
      break;
  }

  // Update conflict as resolved
  const { data, error } = await supabase
    .from("data_sync_conflicts")
    .update({
      resolved: true,
      resolution_strategy: strategy,
      resolution_data: resolutionData,
      resolved_at: new Date().toISOString(),
      resolved_by: "system", // Could be passed from request context
    })
    .eq("id", conflictId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
