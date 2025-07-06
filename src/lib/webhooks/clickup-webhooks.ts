import { createClient } from "@supabase/supabase-js";
import { ClickUpContentExtractionService } from "../workflows/clickup-content-extraction";
import { getBlotatoSchedulingService } from "../workflows/blotato-scheduling-service";

// ClickUp Webhook Event Types
export interface ClickUpWebhookEvent {
  event: string;
  task_id?: string;
  list_id?: string;
  folder_id?: string;
  space_id?: string;
  team_id?: string;
  history_items?: Array<{
    id: string;
    type: number;
    date: string;
    field: string;
    parent_id: string;
    data: Record<string, any>;
    source: string;
    user: {
      id: number;
      username: string;
      email: string;
      color: string;
      initials: string;
      profilePicture: string;
    };
    before?: Record<string, any>;
    after?: Record<string, any>;
  }>;
  webhook_id: string;
}

// Webhook Event Types
export enum ClickUpEventType {
  TASK_CREATED = "taskCreated",
  TASK_UPDATED = "taskUpdated",
  TASK_DELETED = "taskDeleted",
  TASK_PRIORITY_UPDATED = "taskPriorityUpdated",
  TASK_STATUS_UPDATED = "taskStatusUpdated",
  TASK_ASSIGNEE_UPDATED = "taskAssigneeUpdated",
  TASK_DUE_DATE_UPDATED = "taskDueDateUpdated",
  TASK_TAG_UPDATED = "taskTagUpdated",
  TASK_MOVED = "taskMoved",
  TASK_COMMENT_POSTED = "taskCommentPosted",
  TASK_COMMENT_UPDATED = "taskCommentUpdated",
  TASK_TIME_ESTIMATE_UPDATED = "taskTimeEstimateUpdated",
  TASK_TIME_TRACKED_UPDATED = "taskTimeTrackedUpdated",
  LIST_CREATED = "listCreated",
  LIST_UPDATED = "listUpdated",
  LIST_DELETED = "listDeleted",
  FOLDER_CREATED = "folderCreated",
  FOLDER_UPDATED = "folderUpdated",
  FOLDER_DELETED = "folderDeleted",
  SPACE_CREATED = "spaceCreated",
  SPACE_UPDATED = "spaceUpdated",
  SPACE_DELETED = "spaceDeleted",
  GOAL_CREATED = "goalCreated",
  GOAL_UPDATED = "goalUpdated",
  GOAL_DELETED = "goalDeleted",
  KEY_RESULT_CREATED = "keyResultCreated",
  KEY_RESULT_UPDATED = "keyResultUpdated",
  KEY_RESULT_DELETED = "keyResultDeleted",
}

// Webhook Registration Data
export interface WebhookRegistration {
  id: string;
  team_id: string;
  endpoint: string;
  events: ClickUpEventType[];
  health?: {
    status: string;
    fail_count: number;
  };
  secret?: string;
}

// Webhook Event Log
export interface WebhookEventLog {
  id: string;
  webhook_id: string;
  event_type: ClickUpEventType;
  event_data: ClickUpWebhookEvent;
  processed_at?: string;
  processing_status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  sync_triggered: boolean;
  created_at: string;
}

export class ClickUpWebhookService {
  private supabase;
  private apiKey: string;
  private baseUrl = "https://api.clickup.com/api/v2";
  private contentExtractionService: ClickUpContentExtractionService;
  private schedulingService = getBlotatoSchedulingService();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.contentExtractionService = new ClickUpContentExtractionService(apiKey);
  }

  /**
   * Register a webhook with ClickUp
   */
  async registerWebhook(
    teamId: string,
    endpoint: string,
    events: ClickUpEventType[],
    secret?: string
  ): Promise<WebhookRegistration> {
    try {
      const response = await fetch(`${this.baseUrl}/team/${teamId}/webhook`, {
        method: "POST",
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint,
          events,
          secret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to register webhook: ${response.statusText}`);
      }

      const data = await response.json();

      // Store webhook registration in database
      await this.storeWebhookRegistration({
        id: data.id,
        team_id: teamId,
        endpoint,
        events,
        secret,
      });

      return {
        id: data.id,
        team_id: teamId,
        endpoint,
        events,
        health: data.health,
        secret,
      };
    } catch (error) {
      console.error("Error registering webhook:", error);
      throw error;
    }
  }

  /**
   * Get all webhooks for a team
   */
  async getWebhooks(teamId: string): Promise<WebhookRegistration[]> {
    try {
      const response = await fetch(`${this.baseUrl}/team/${teamId}/webhook`, {
        method: "GET",
        headers: {
          Authorization: this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get webhooks: ${response.statusText}`);
      }

      const data = await response.json();
      return data.webhooks || [];
    } catch (error) {
      console.error("Error getting webhooks:", error);
      throw error;
    }
  }

  /**
   * Update a webhook
   */
  async updateWebhook(
    webhookId: string,
    endpoint?: string,
    events?: ClickUpEventType[],
    status?: "active" | "inactive",
    secret?: string
  ): Promise<WebhookRegistration> {
    try {
      const updateData: any = {};
      if (endpoint) updateData.endpoint = endpoint;
      if (events) updateData.events = events;
      if (status) updateData.status = status;
      if (secret) updateData.secret = secret;

      const response = await fetch(`${this.baseUrl}/webhook/${webhookId}`, {
        method: "PUT",
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update webhook: ${response.statusText}`);
      }

      const data = await response.json();
      return data.webhook;
    } catch (error) {
      console.error("Error updating webhook:", error);
      throw error;
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/${webhookId}`, {
        method: "DELETE",
        headers: {
          Authorization: this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete webhook: ${response.statusText}`);
      }

      // Remove from database
      await this.removeWebhookRegistration(webhookId);
    } catch (error) {
      console.error("Error deleting webhook:", error);
      throw error;
    }
  }

  /**
   * Process incoming webhook event
   */
  async processWebhookEvent(event: ClickUpWebhookEvent): Promise<void> {
    try {
      // Log the event
      const eventLog = await this.logWebhookEvent(event);

      // Update processing status
      await this.updateEventStatus(eventLog.id, "processing");

      // Process based on event type
      await this.handleEventType(event);

      // Mark as completed
      await this.updateEventStatus(eventLog.id, "completed", true);

      console.log(`Successfully processed webhook event: ${event.event}`);
    } catch (error) {
      console.error("Error processing webhook event:", error);
      // Mark as failed
      if (event.webhook_id) {
        await this.updateEventStatus(
          event.webhook_id,
          "failed",
          false,
          error.message
        );
      }
      throw error;
    }
  }

  /**
   * Handle specific event types
   */
  private async handleEventType(event: ClickUpWebhookEvent): Promise<void> {
    const { event: eventType } = event;

    switch (eventType) {
      case ClickUpEventType.TASK_CREATED:
      case ClickUpEventType.TASK_UPDATED:
      case ClickUpEventType.TASK_STATUS_UPDATED:
      case ClickUpEventType.TASK_PRIORITY_UPDATED:
      case ClickUpEventType.TASK_ASSIGNEE_UPDATED:
      case ClickUpEventType.TASK_DUE_DATE_UPDATED:
        await this.handleTaskEvent(event);
        break;

      case ClickUpEventType.TASK_DELETED:
        await this.handleTaskDeletion(event);
        break;

      case ClickUpEventType.LIST_CREATED:
      case ClickUpEventType.LIST_UPDATED:
      case ClickUpEventType.LIST_DELETED:
        await this.handleListEvent(event);
        break;

      case ClickUpEventType.TASK_COMMENT_POSTED:
      case ClickUpEventType.TASK_COMMENT_UPDATED:
        await this.handleCommentEvent(event);
        break;

      case ClickUpEventType.TASK_TIME_TRACKED_UPDATED:
        await this.handleTimeTrackingEvent(event);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  }

  /**
   * Enhanced task event handler with content extraction and scheduling
   */
  private async handleTaskEvent(event: ClickUpWebhookEvent): Promise<void> {
    try {
      const { task_id, status, tags } = event.task_data;

      console.log(`Processing task event for ${task_id}:`, {
        status,
        tags,
        eventType: event.event_type,
      });

      // Check if this is an approval event
      const isApproved = this.isTaskApproved(status, tags);

      if (isApproved) {
        console.log(
          `Task ${task_id} detected as approved, triggering content extraction`
        );

        // Extract content data
        const contentData =
          await this.contentExtractionService.extractContentFromTask(task_id);

        if (contentData) {
          // Store extracted content
          await this.storeExtractedContent(contentData);

          // Update content calendar
          await this.updateContentCalendar(contentData);

          // Trigger intelligent scheduling
          await this.triggerIntelligentScheduling(contentData);

          // Notify dashboard for real-time updates
          await this.notifyDashboard(
            contentData,
            "content_approved_and_scheduled"
          );
        }
      }

      // Log the event
      await this.logWebhookEvent(event);
    } catch (error) {
      console.error("Error handling task event:", error);
      throw error;
    }
  }

  /**
   * Trigger intelligent Blotato scheduling with optimization
   */
  private async triggerIntelligentScheduling(contentData: any): Promise<void> {
    try {
      console.log(
        `Starting intelligent scheduling for content ${contentData.task_id}`
      );

      // Determine if this is emergency content
      const isEmergency = this.isEmergencyContent(contentData);

      if (isEmergency) {
        // Handle emergency scheduling
        const emergencyOptions = {
          priority_level: this.getEmergencyPriorityLevel(contentData),
          max_delay_minutes: 15,
          override_conflicts: true,
          notification_channels: ["slack", "email", "dashboard"],
          fallback_platforms: ["twitter"], // Safe fallback platform
        };

        const result = await this.schedulingService.scheduleContent(
          contentData,
          {
            platforms: contentData.scheduling_preferences.platforms,
            emergency_options: emergencyOptions,
          }
        );

        console.log(`Emergency scheduling result:`, result);

        // Store emergency scheduling details
        await this.storeSchedulingResult(
          contentData.task_id,
          result,
          "emergency"
        );
      } else {
        // Normal intelligent scheduling
        const result = await this.schedulingService.scheduleContent(
          contentData,
          {
            platforms: contentData.scheduling_preferences.platforms,
            preferred_time: contentData.scheduling_preferences.preferred_time,
            enable_optimization: true,
          }
        );

        console.log(`Intelligent scheduling result:`, result);

        // Store scheduling details
        await this.storeSchedulingResult(contentData.task_id, result, "normal");

        // Setup performance feedback loop
        if (result.success && result.scheduled_time) {
          await this.schedulingService.setupPerformanceFeedback(
            contentData.task_id,
            result.scheduled_time,
            result.platforms
          );
        }
      }
    } catch (error) {
      console.error("Error in intelligent scheduling:", error);
      throw error;
    }
  }

  /**
   * Check if content requires emergency handling
   */
  private isEmergencyContent(contentData: any): boolean {
    const emergencyTags = [
      "urgent",
      "breaking",
      "critical",
      "emergency",
      "asap",
    ];
    const contentTags = (
      contentData.scheduling_preferences.priority || ""
    ).toLowerCase();

    return emergencyTags.some(
      tag =>
        contentTags.includes(tag) ||
        contentData.title.toLowerCase().includes(tag) ||
        (contentData.description &&
          contentData.description.toLowerCase().includes(tag))
    );
  }

  /**
   * Get emergency priority level based on content analysis
   */
  private getEmergencyPriorityLevel(
    contentData: any
  ): "urgent" | "high" | "critical" {
    const content =
      `${contentData.title} ${contentData.description || ""}`.toLowerCase();

    if (content.includes("critical") || content.includes("breaking")) {
      return "critical";
    } else if (content.includes("urgent") || content.includes("asap")) {
      return "urgent";
    } else {
      return "high";
    }
  }

  /**
   * Store scheduling result with enhanced metadata
   */
  private async storeSchedulingResult(
    taskId: string,
    result: any,
    schedulingType: "normal" | "emergency" | "bulk"
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("blotato_scheduling_results")
        .upsert({
          clickup_task_id: taskId,
          blotato_schedule_id: result.scheduled_id || `schedule_${Date.now()}`,
          scheduled_posts:
            result.platforms?.map((platform: string) => ({
              platform,
              status: result.success ? "scheduled" : "failed",
              scheduled_time: result.scheduled_time,
            })) || [],
          scheduling_status: result.success ? "scheduled" : "failed",
          scheduling_type: schedulingType,
          conflicts_detected: result.conflicts?.length || 0,
          analytics_tracking_id: result.analytics_tracking_id,
          error_details: result.error,
          scheduled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error storing scheduling result:", error);
        throw error;
      }

      console.log(`Scheduling result stored for task ${taskId}:`, {
        success: result.success,
        type: schedulingType,
        platforms: result.platforms,
      });
    } catch (error) {
      console.error("Error storing scheduling result:", error);
      throw error;
    }
  }

  /**
   * Update content calendar with real-time agenda synchronization
   */
  private async updateContentCalendar(contentData: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("content_calendar_items")
        .upsert({
          content_id: contentData.task_id,
          title: contentData.title,
          description: contentData.description,
          content_type: contentData.media_urls.length > 0 ? "media" : "text",
          platforms: contentData.scheduling_preferences.platforms || [],
          scheduled_time:
            contentData.scheduling_preferences.preferred_time || null,
          priority: contentData.scheduling_preferences.priority || "medium",
          approval_status: contentData.approval_status,
          status: "scheduled",
          source: "clickup",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error updating content calendar:", error);
        throw error;
      }

      console.log(`Content calendar updated for ${contentData.task_id}`);
    } catch (error) {
      console.error("Error updating content calendar:", error);
      throw error;
    }
  }

  /**
   * Send real-time notifications to dashboard
   */
  private async notifyDashboard(
    contentData: any,
    eventType: string
  ): Promise<void> {
    try {
      // Store notification for dashboard real-time updates
      const notification = {
        id: `notif_${Date.now()}`,
        type: eventType,
        content_id: contentData.task_id,
        title: contentData.title,
        message: this.generateNotificationMessage(eventType, contentData),
        priority: this.isEmergencyContent(contentData) ? "high" : "normal",
        timestamp: new Date().toISOString(),
        metadata: {
          platforms: contentData.scheduling_preferences.platforms,
          approval_status: contentData.approval_status,
        },
      };

      // Store in dashboard notifications table
      await this.supabase.from("dashboard_notifications").insert(notification);

      // Could also trigger websocket or SSE for real-time updates
      console.log(`Dashboard notification sent:`, notification);
    } catch (error) {
      console.error("Error notifying dashboard:", error);
      // Don't throw here as this is not critical for the main flow
    }
  }

  /**
   * Generate contextual notification messages
   */
  private generateNotificationMessage(
    eventType: string,
    contentData: any
  ): string {
    switch (eventType) {
      case "content_approved_and_scheduled":
        const platforms =
          contentData.scheduling_preferences.platforms?.join(", ") ||
          "default platforms";
        return `Content "${contentData.title}" has been approved and scheduled for ${platforms}`;
      case "emergency_scheduled":
        return `🚨 Emergency content "${contentData.title}" has been fast-tracked for immediate publishing`;
      case "scheduling_conflict":
        return `⚠️ Scheduling conflict detected for "${contentData.title}" - manual review recommended`;
      default:
        return `Content "${contentData.title}" status updated`;
    }
  }

  /**
   * Handle task deletion
   */
  private async handleTaskDeletion(event: ClickUpWebhookEvent): Promise<void> {
    if (!event.task_id) return;

    try {
      // Mark sync mapping as deleted
      const { error } = await this.supabase
        .from("clickup_sync_mappings")
        .update({
          sync_status: "deleted",
          last_synced_at: new Date().toISOString(),
        })
        .eq("clickup_task_id", event.task_id);

      if (error) throw error;

      console.log(`Marked task ${event.task_id} as deleted in sync mappings`);
    } catch (error) {
      console.error(`Error handling task deletion ${event.task_id}:`, error);
      throw error;
    }
  }

  /**
   * Handle list events
   */
  private async handleListEvent(event: ClickUpWebhookEvent): Promise<void> {
    if (!event.list_id) return;

    try {
      // Import sync service
      const { ClickUpSyncService } = await import("../sync/clickup-sync");
      const syncService = new ClickUpSyncService(this.apiKey);

      // Sync all tasks in the list
      await syncService.syncTasksFromList(event.list_id);

      console.log(`Synced list ${event.list_id} after ${event.event}`);
    } catch (error) {
      console.error(`Error syncing list ${event.list_id}:`, error);
      throw error;
    }
  }

  /**
   * Handle comment events
   */
  private async handleCommentEvent(event: ClickUpWebhookEvent): Promise<void> {
    // For now, just log the comment event
    // In the future, we could sync comments or trigger notifications
    console.log(`Comment event received for task ${event.task_id}`);
  }

  /**
   * Handle time tracking events
   */
  private async handleTimeTrackingEvent(
    event: ClickUpWebhookEvent
  ): Promise<void> {
    if (!event.task_id) return;

    try {
      // Import sync service
      const { ClickUpSyncService } = await import("../sync/clickup-sync");
      const syncService = new ClickUpSyncService(this.apiKey);

      // Sync time tracking data
      await syncService.syncSingleTask(event.task_id, "clickup_to_platform");

      console.log(`Synced time tracking for task ${event.task_id}`);
    } catch (error) {
      console.error(
        `Error syncing time tracking for task ${event.task_id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Store webhook registration in database
   */
  private async storeWebhookRegistration(
    registration: Omit<WebhookRegistration, "health">
  ): Promise<void> {
    const { error } = await this.supabase
      .from("clickup_webhook_registrations")
      .upsert([
        {
          webhook_id: registration.id,
          team_id: registration.team_id,
          endpoint: registration.endpoint,
          events: registration.events,
          secret_hash: registration.secret
            ? this.hashSecret(registration.secret)
            : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error("Error storing webhook registration:", error);
      throw error;
    }
  }

  /**
   * Remove webhook registration from database
   */
  private async removeWebhookRegistration(webhookId: string): Promise<void> {
    const { error } = await this.supabase
      .from("clickup_webhook_registrations")
      .delete()
      .eq("webhook_id", webhookId);

    if (error) {
      console.error("Error removing webhook registration:", error);
      throw error;
    }
  }

  /**
   * Log webhook event
   */
  private async logWebhookEvent(
    event: ClickUpWebhookEvent
  ): Promise<WebhookEventLog> {
    const eventLog = {
      id: `${event.webhook_id}_${Date.now()}`,
      webhook_id: event.webhook_id,
      event_type: event.event as ClickUpEventType,
      event_data: event,
      processing_status: "pending" as const,
      sync_triggered: false,
      created_at: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from("clickup_webhook_events")
      .insert([eventLog]);

    if (error) {
      console.error("Error logging webhook event:", error);
      throw error;
    }

    return eventLog;
  }

  /**
   * Update event processing status
   */
  private async updateEventStatus(
    eventId: string,
    status: "pending" | "processing" | "completed" | "failed",
    syncTriggered: boolean = false,
    errorMessage?: string
  ): Promise<void> {
    const updateData: any = {
      processing_status: status,
      sync_triggered: syncTriggered,
    };

    if (status === "completed") {
      updateData.processed_at = new Date().toISOString();
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { error } = await this.supabase
      .from("clickup_webhook_events")
      .update(updateData)
      .eq("id", eventId);

    if (error) {
      console.error("Error updating event status:", error);
      throw error;
    }
  }

  /**
   * Hash webhook secret for storage
   */
  private hashSecret(secret: string): string {
    // In a real implementation, use proper crypto hashing
    // For now, simple base64 encoding (NOT secure for production)
    return Buffer.from(secret).toString("base64");
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      // This would implement proper HMAC signature verification
      // For now, return true (implement proper verification in production)
      return true;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return false;
    }
  }

  /**
   * Get webhook event logs
   */
  async getWebhookEventLogs(
    webhookId?: string,
    limit: number = 100
  ): Promise<WebhookEventLog[]> {
    try {
      let query = this.supabase
        .from("clickup_webhook_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (webhookId) {
        query = query.eq("webhook_id", webhookId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error getting webhook event logs:", error);
      throw error;
    }
  }

  /**
   * Get webhook health status
   */
  async getWebhookHealth(webhookId: string): Promise<{
    total_events: number;
    successful_events: number;
    failed_events: number;
    success_rate: number;
    last_event_at?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from("clickup_webhook_events")
        .select("processing_status, created_at")
        .eq("webhook_id", webhookId);

      if (error) throw error;

      const totalEvents = data?.length || 0;
      const successfulEvents =
        data?.filter(e => e.processing_status === "completed").length || 0;
      const failedEvents =
        data?.filter(e => e.processing_status === "failed").length || 0;
      const successRate =
        totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0;
      const lastEventAt =
        data && data.length > 0 ? data[0].created_at : undefined;

      return {
        total_events: totalEvents,
        successful_events: successfulEvents,
        failed_events: failedEvents,
        success_rate: Math.round(successRate * 100) / 100,
        last_event_at: lastEventAt,
      };
    } catch (error) {
      console.error("Error getting webhook health:", error);
      throw error;
    }
  }
}

export default ClickUpWebhookService;
