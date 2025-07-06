/**
 * ClickUp Bidirectional Sync Service
 * Handles synchronization between platform tasks and ClickUp tasks
 */

import {
  createClickUpService,
  type ClickUpTask,
  type ClickUpList,
} from "@/lib/apis/clickup";
import { createClient } from "@/lib/supabase/client";

export interface PlatformTask {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "done" | "cancelled" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  assignee_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  clickup_task_id?: string;
  clickup_list_id?: string;
  project_id?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SyncMapping {
  id?: string;
  platform_task_id: string;
  clickup_task_id: string;
  clickup_list_id: string;
  last_sync_platform: string;
  last_sync_clickup: string;
  sync_direction:
    | "platform_to_clickup"
    | "clickup_to_platform"
    | "bidirectional";
  created_at: string;
  updated_at: string;
}

export interface SyncResult {
  success: boolean;
  action: "created" | "updated" | "skipped" | "deleted";
  platform_task_id?: string;
  clickup_task_id?: string;
  message: string;
  error?: string;
}

export interface SyncReport {
  total_processed: number;
  successful_syncs: number;
  failed_syncs: number;
  created_tasks: number;
  updated_tasks: number;
  skipped_tasks: number;
  results: SyncResult[];
  started_at: string;
  completed_at: string;
  duration_ms: number;
}

export class ClickUpSyncService {
  private clickupService;
  private supabase;

  constructor() {
    this.clickupService = createClickUpService();
    this.supabase = createClient();
  }

  /**
   * Map platform status to ClickUp status
   */
  private mapPlatformToClickUpStatus(platformStatus: string): string {
    const statusMap: Record<string, string> = {
      pending: "to do",
      "in-progress": "in progress",
      done: "complete",
      cancelled: "cancelled",
      blocked: "blocked",
    };
    return statusMap[platformStatus] || "to do";
  }

  /**
   * Map ClickUp status to platform status
   */
  private mapClickUpToPlatformStatus(
    clickupStatus: string
  ): PlatformTask["status"] {
    const statusMap: Record<string, PlatformTask["status"]> = {
      "to do": "pending",
      "in progress": "in-progress",
      complete: "done",
      cancelled: "cancelled",
      blocked: "blocked",
    };
    return statusMap[clickupStatus.toLowerCase()] || "pending";
  }

  /**
   * Map platform priority to ClickUp priority
   */
  private mapPlatformToClickUpPriority(platformPriority: string): number {
    const priorityMap: Record<string, number> = {
      low: 4,
      medium: 3,
      high: 2,
      urgent: 1,
    };
    return priorityMap[platformPriority] || 3;
  }

  /**
   * Map ClickUp priority to platform priority
   */
  private mapClickUpToPlatformPriority(clickupPriority?: {
    priority: string;
  }): PlatformTask["priority"] {
    if (!clickupPriority) return "medium";

    const priorityMap: Record<string, PlatformTask["priority"]> = {
      urgent: "urgent",
      high: "high",
      normal: "medium",
      low: "low",
    };
    return priorityMap[clickupPriority.priority.toLowerCase()] || "medium";
  }

  /**
   * Get platform tasks from Supabase
   */
  async getPlatformTasks(projectId?: string): Promise<PlatformTask[]> {
    try {
      let query = this.supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch platform tasks: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching platform tasks:", error);
      throw error;
    }
  }

  /**
   * Create or update platform task
   */
  async upsertPlatformTask(task: Partial<PlatformTask>): Promise<PlatformTask> {
    try {
      const { data, error } = await this.supabase
        .from("tasks")
        .upsert({
          ...task,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upsert platform task: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error upserting platform task:", error);
      throw error;
    }
  }

  /**
   * Get or create sync mapping
   */
  async getSyncMapping(
    platformTaskId: string,
    clickupTaskId?: string
  ): Promise<SyncMapping | null> {
    try {
      let query = this.supabase.from("clickup_sync_mappings").select("*");

      if (clickupTaskId) {
        query = query.or(
          `platform_task_id.eq.${platformTaskId},clickup_task_id.eq.${clickupTaskId}`
        );
      } else {
        query = query.eq("platform_task_id", platformTaskId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw new Error(`Failed to fetch sync mapping: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching sync mapping:", error);
      return null;
    }
  }

  /**
   * Create or update sync mapping
   */
  async upsertSyncMapping(mapping: Partial<SyncMapping>): Promise<SyncMapping> {
    try {
      const { data, error } = await this.supabase
        .from("clickup_sync_mappings")
        .upsert({
          ...mapping,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upsert sync mapping: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error upserting sync mapping:", error);
      throw error;
    }
  }

  /**
   * Sync platform task to ClickUp
   */
  async syncPlatformTaskToClickUp(
    platformTask: PlatformTask,
    clickupListId: string
  ): Promise<SyncResult> {
    try {
      const existingMapping = await this.getSyncMapping(platformTask.id);

      if (existingMapping?.clickup_task_id) {
        // Update existing ClickUp task
        const updateData = {
          name: platformTask.title,
          description: platformTask.description,
          status: this.mapPlatformToClickUpStatus(platformTask.status),
          priority: this.mapPlatformToClickUpPriority(platformTask.priority),
        };

        await this.clickupService.updateTask(
          existingMapping.clickup_task_id,
          updateData
        );

        // Update sync mapping
        await this.upsertSyncMapping({
          ...existingMapping,
          last_sync_platform: new Date().toISOString(),
        });

        return {
          success: true,
          action: "updated",
          platform_task_id: platformTask.id,
          clickup_task_id: existingMapping.clickup_task_id,
          message: `Updated ClickUp task ${existingMapping.clickup_task_id}`,
        };
      } else {
        // Create new ClickUp task
        const createData = {
          name: platformTask.title,
          description: platformTask.description,
          status: this.mapPlatformToClickUpStatus(platformTask.status),
          priority: this.mapPlatformToClickUpPriority(platformTask.priority),
          tags: platformTask.tags,
        };

        const clickupTask = await this.clickupService.createTask(
          clickupListId,
          createData
        );

        // Create sync mapping
        await this.upsertSyncMapping({
          platform_task_id: platformTask.id,
          clickup_task_id: clickupTask.id,
          clickup_list_id: clickupListId,
          last_sync_platform: new Date().toISOString(),
          last_sync_clickup: new Date().toISOString(),
          sync_direction: "bidirectional",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Update platform task with ClickUp info
        await this.upsertPlatformTask({
          ...platformTask,
          clickup_task_id: clickupTask.id,
          clickup_list_id: clickupListId,
        });

        return {
          success: true,
          action: "created",
          platform_task_id: platformTask.id,
          clickup_task_id: clickupTask.id,
          message: `Created ClickUp task ${clickupTask.id}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        action: "skipped",
        platform_task_id: platformTask.id,
        message: "Failed to sync to ClickUp",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Sync ClickUp task to platform
   */
  async syncClickUpTaskToPlatform(
    clickupTask: ClickUpTask,
    projectId?: string
  ): Promise<SyncResult> {
    try {
      const existingMapping = await this.getSyncMapping("", clickupTask.id);

      const platformTaskData: Partial<PlatformTask> = {
        title: clickupTask.name,
        description: clickupTask.description,
        status: this.mapClickUpToPlatformStatus(clickupTask.status.status),
        clickup_task_id: clickupTask.id,
        clickup_list_id: clickupTask.list.id,
        project_id: projectId,
        tags: clickupTask.tags?.map(tag => tag.name),
      };

      if (existingMapping?.platform_task_id) {
        // Update existing platform task
        platformTaskData.id = existingMapping.platform_task_id;
        const updatedTask = await this.upsertPlatformTask(platformTaskData);

        await this.upsertSyncMapping({
          ...existingMapping,
          last_sync_clickup: new Date().toISOString(),
        });

        return {
          success: true,
          action: "updated",
          platform_task_id: updatedTask.id,
          clickup_task_id: clickupTask.id,
          message: `Updated platform task ${updatedTask.id}`,
        };
      } else {
        // Create new platform task
        platformTaskData.created_at = new Date().toISOString();
        const newTask = await this.upsertPlatformTask(platformTaskData);

        await this.upsertSyncMapping({
          platform_task_id: newTask.id,
          clickup_task_id: clickupTask.id,
          clickup_list_id: clickupTask.list.id,
          last_sync_platform: new Date().toISOString(),
          last_sync_clickup: new Date().toISOString(),
          sync_direction: "bidirectional",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        return {
          success: true,
          action: "created",
          platform_task_id: newTask.id,
          clickup_task_id: clickupTask.id,
          message: `Created platform task ${newTask.id}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        action: "skipped",
        clickup_task_id: clickupTask.id,
        message: "Failed to sync to platform",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Perform full bidirectional sync
   */
  async performBidirectionalSync(
    clickupListId: string,
    projectId?: string
  ): Promise<SyncReport> {
    const startTime = Date.now();
    const results: SyncResult[] = [];

    try {
      console.log(`Starting bidirectional sync for list ${clickupListId}...`);

      // Get platform tasks
      const platformTasks = await this.getPlatformTasks(projectId);
      console.log(`Found ${platformTasks.length} platform tasks`);

      // Get ClickUp tasks
      const clickupTasks = await this.clickupService.getTasks(clickupListId, {
        include_closed: true,
        subtasks: false,
      });
      console.log(`Found ${clickupTasks.length} ClickUp tasks`);

      // Sync platform tasks to ClickUp
      for (const platformTask of platformTasks) {
        const result = await this.syncPlatformTaskToClickUp(
          platformTask,
          clickupListId
        );
        results.push(result);
      }

      // Sync ClickUp tasks to platform
      for (const clickupTask of clickupTasks) {
        const result = await this.syncClickUpTaskToPlatform(
          clickupTask,
          projectId
        );
        results.push(result);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log the sync operation
      await this.logSyncOperation({
        sync_type: "bidirectional",
        direction: "bidirectional",
        clickup_list_id: clickupListId,
        project_id: projectId,
        results,
        duration_ms: duration,
      });

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const created = results.filter(r => r.action === "created").length;
      const updated = results.filter(r => r.action === "updated").length;
      const skipped = results.filter(r => r.action === "skipped").length;

      const report: SyncReport = {
        total_processed: results.length,
        successful_syncs: successful,
        failed_syncs: failed,
        created_tasks: created,
        updated_tasks: updated,
        skipped_tasks: skipped,
        results,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date(endTime).toISOString(),
        duration_ms: duration,
      };

      console.log(`Sync completed: ${successful}/${results.length} successful`);
      return report;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log the failed sync operation
      await this.logSyncOperation({
        sync_type: "bidirectional",
        direction: "bidirectional",
        clickup_list_id: clickupListId,
        project_id: projectId,
        results,
        duration_ms: duration,
        error_message: error instanceof Error ? error.message : "Unknown error",
      });

      console.error("Error during bidirectional sync:", error);

      return {
        total_processed: results.length,
        successful_syncs: results.filter(r => r.success).length,
        failed_syncs: results.filter(r => !r.success).length + 1,
        created_tasks: results.filter(r => r.action === "created").length,
        updated_tasks: results.filter(r => r.action === "updated").length,
        skipped_tasks: results.filter(r => r.action === "skipped").length,
        results,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date(endTime).toISOString(),
        duration_ms: duration,
      };
    }
  }

  /**
   * Sync single task by ID
   */
  async syncSingleTask(
    taskId: string,
    direction: "platform_to_clickup" | "clickup_to_platform",
    clickupListId?: string,
    projectId?: string
  ): Promise<SyncResult> {
    try {
      if (direction === "platform_to_clickup") {
        if (!clickupListId) {
          throw new Error(
            "ClickUp list ID is required for platform to ClickUp sync"
          );
        }

        const platformTasks = await this.getPlatformTasks(projectId);
        const platformTask = platformTasks.find(t => t.id === taskId);

        if (!platformTask) {
          throw new Error(`Platform task ${taskId} not found`);
        }

        return await this.syncPlatformTaskToClickUp(
          platformTask,
          clickupListId
        );
      } else {
        const clickupTask = await this.clickupService.getTask(taskId);
        return await this.syncClickUpTaskToPlatform(clickupTask, projectId);
      }
    } catch (error) {
      console.error("Error syncing single task:", error);
      return {
        success: false,
        action: "skipped",
        message: "Failed to sync single task",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get sync status for a platform task
   */
  async getSyncStatus(platformTaskId: string): Promise<{
    is_synced: boolean;
    clickup_task_id?: string;
    last_sync?: string;
    sync_direction?: string;
  }> {
    try {
      const mapping = await this.getSyncMapping(platformTaskId);

      if (!mapping) {
        return { is_synced: false };
      }

      return {
        is_synced: true,
        clickup_task_id: mapping.clickup_task_id,
        last_sync:
          mapping.last_sync_platform > mapping.last_sync_clickup
            ? mapping.last_sync_platform
            : mapping.last_sync_clickup,
        sync_direction: mapping.sync_direction,
      };
    } catch (error) {
      console.error("Error getting sync status:", error);
      return { is_synced: false };
    }
  }

  async logSyncOperation(logData: {
    sync_type: string;
    direction: string;
    clickup_list_id?: string;
    project_id?: string;
    results: SyncResult[];
    duration_ms: number;
    error_message?: string;
  }): Promise<void> {
    try {
      const successful = logData.results.filter(r => r.success).length;
      const failed = logData.results.filter(r => !r.success).length;
      const created = logData.results.filter(
        r => r.action === "created"
      ).length;
      const updated = logData.results.filter(
        r => r.action === "updated"
      ).length;
      const skipped = logData.results.filter(
        r => r.action === "skipped"
      ).length;

      await this.supabase.from("clickup_sync_logs").insert({
        ...logData,
        total_processed: logData.results.length,
        successful_syncs: successful,
        failed_syncs: failed,
        created_tasks: created,
        updated_tasks: updated,
        skipped_tasks: skipped,
        results: logData.results,
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error logging sync operation:", error);
    }
  }
}

/**
 * Create ClickUp sync service instance
 */
export function createClickUpSyncService(): ClickUpSyncService {
  return new ClickUpSyncService();
}
