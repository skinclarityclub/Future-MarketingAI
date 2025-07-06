/**
 * Content Workflow Tracking System
 * Tracks content through different workflow phases with ClickUp integration
 */

import { createClickUpSyncService } from "@/lib/sync/clickup-sync";
import { createClient } from "@/lib/supabase/client";

export type WorkflowPhase =
  | "planning"
  | "creation"
  | "review"
  | "approval"
  | "publication"
  | "published"
  | "archived";

export type ContentType =
  | "blog_post"
  | "social_media"
  | "email_campaign"
  | "video"
  | "infographic"
  | "whitepaper"
  | "case_study"
  | "landing_page";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  content_type: ContentType;
  workflow_phase: WorkflowPhase;
  priority: Priority;
  created_by: string;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  campaign_id?: string;
  platform?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  clickup_task_id?: string;
  clickup_list_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTransition {
  id: string;
  content_item_id: string;
  from_phase: WorkflowPhase;
  to_phase: WorkflowPhase;
  transition_date: string;
  user_id: string;
  notes?: string;
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  content_type: ContentType;
  phases: {
    phase: WorkflowPhase;
    order: number;
    estimated_hours: number;
    required_role?: string;
    approval_required: boolean;
    clickup_status?: string;
  }[];
  default_clickup_list_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentMetrics {
  total_items: number;
  by_phase: Record<WorkflowPhase, number>;
  by_type: Record<ContentType, number>;
  by_priority: Record<Priority, number>;
  avg_completion_time_hours: number;
  overdue_items: number;
  items_completed_last_week: number;
  workflow_efficiency: number;
}

export class ContentWorkflowService {
  private supabase;
  private syncService;

  constructor() {
    this.supabase = createClient();
    this.syncService = createClickUpSyncService();
  }

  /**
   * Map workflow phase to ClickUp status
   */
  private mapPhaseToClickUpStatus(phase: WorkflowPhase): string {
    const statusMap: Record<WorkflowPhase, string> = {
      planning: "to do",
      creation: "in progress",
      review: "review",
      approval: "approval pending",
      publication: "ready to publish",
      published: "complete",
      archived: "archived",
    };
    return statusMap[phase] || "to do";
  }

  /**
   * Create a new content item
   */
  async createContentItem(
    contentData: Omit<ContentItem, "id" | "created_at" | "updated_at">
  ): Promise<ContentItem> {
    try {
      const now = new Date().toISOString();

      const newItem = {
        ...contentData,
        created_at: now,
        updated_at: now,
      };

      // For MVP, we'll simulate database storage
      console.log("Creating content item:", newItem);

      // Create workflow transition
      await this.createWorkflowTransition({
        content_item_id: newItem.id || crypto.randomUUID(),
        from_phase: "planning",
        to_phase: contentData.workflow_phase,
        user_id: contentData.created_by,
        notes: "Content item created",
      });

      return { id: crypto.randomUUID(), ...newItem };
    } catch (error) {
      console.error("Error creating content item:", error);
      throw error;
    }
  }

  /**
   * Update content item workflow phase
   */
  async updateWorkflowPhase(
    contentItemId: string,
    newPhase: WorkflowPhase,
    userId: string,
    notes?: string
  ): Promise<void> {
    try {
      console.log(
        `Updating workflow phase for ${contentItemId} to ${newPhase}`
      );

      await this.createWorkflowTransition({
        content_item_id: contentItemId,
        from_phase: "planning", // Would fetch current phase in real implementation
        to_phase: newPhase,
        user_id: userId,
        notes,
      });
    } catch (error) {
      console.error("Error updating workflow phase:", error);
      throw error;
    }
  }

  /**
   * Create workflow transition record
   */
  private async createWorkflowTransition(
    transitionData: Omit<WorkflowTransition, "id" | "transition_date">
  ): Promise<WorkflowTransition> {
    try {
      const transition = {
        id: crypto.randomUUID(),
        ...transitionData,
        transition_date: new Date().toISOString(),
      };

      console.log("Creating workflow transition:", transition);
      return transition;
    } catch (error) {
      console.error("Error creating workflow transition:", error);
      throw error;
    }
  }

  /**
   * Sync content item to ClickUp
   */
  async syncContentToClickUp(contentItem: ContentItem): Promise<void> {
    try {
      if (!contentItem.clickup_list_id) {
        throw new Error("ClickUp list ID is required for sync");
      }

      const taskData = {
        name: contentItem.title,
        description: `${contentItem.description}\n\nContent Type: ${contentItem.content_type}\nWorkflow Phase: ${contentItem.workflow_phase}`,
        status: this.mapPhaseToClickUpStatus(contentItem.workflow_phase),
        priority: this.mapPriorityToClickUp(contentItem.priority),
        due_date: contentItem.due_date
          ? new Date(contentItem.due_date).getTime()
          : undefined,
        tags: [
          `content-type:${contentItem.content_type}`,
          `workflow-phase:${contentItem.workflow_phase}`,
          ...(contentItem.tags || []),
        ],
      };

      // Use sync service to create/update ClickUp task
      const platformTask = {
        id: contentItem.id,
        title: contentItem.title,
        description: taskData.description,
        status: this.mapWorkflowPhaseToTaskStatus(contentItem.workflow_phase),
        priority: contentItem.priority,
        due_date: contentItem.due_date,
        clickup_task_id: contentItem.clickup_task_id,
        clickup_list_id: contentItem.clickup_list_id,
        tags: taskData.tags,
        created_at: contentItem.created_at,
        updated_at: contentItem.updated_at,
      };

      await this.syncService.syncPlatformTaskToClickUp(
        platformTask,
        contentItem.clickup_list_id
      );
    } catch (error) {
      console.error("Error syncing content to ClickUp:", error);
      throw error;
    }
  }

  /**
   * Update ClickUp task status based on workflow phase
   */
  private async updateClickUpTaskStatus(
    clickupTaskId: string,
    phase: WorkflowPhase
  ): Promise<void> {
    try {
      const clickupStatus = this.mapPhaseToClickUpStatus(phase);
      // Note: This would use the ClickUp API directly
      // For now, we'll log the action
      console.log(
        `Would update ClickUp task ${clickupTaskId} to status: ${clickupStatus}`
      );
    } catch (error) {
      console.error("Error updating ClickUp task status:", error);
    }
  }

  /**
   * Map priority to ClickUp priority
   */
  private mapPriorityToClickUp(priority: Priority): number {
    const priorityMap: Record<Priority, number> = {
      low: 4,
      medium: 3,
      high: 2,
      urgent: 1,
    };
    return priorityMap[priority] || 3;
  }

  /**
   * Map workflow phase to platform task status
   */
  private mapWorkflowPhaseToTaskStatus(
    phase: WorkflowPhase
  ): "pending" | "in-progress" | "done" | "cancelled" | "blocked" {
    const statusMap: Record<
      WorkflowPhase,
      "pending" | "in-progress" | "done" | "cancelled" | "blocked"
    > = {
      planning: "pending",
      creation: "in-progress",
      review: "in-progress",
      approval: "in-progress",
      publication: "in-progress",
      published: "done",
      archived: "done",
    };
    return statusMap[phase] || "pending";
  }

  /**
   * Get content items with filters
   */
  async getContentItems(
    filters: {
      workflow_phase?: WorkflowPhase;
      content_type?: ContentType;
      assigned_to?: string;
      campaign_id?: string;
      priority?: Priority;
      overdue_only?: boolean;
    } = {}
  ): Promise<ContentItem[]> {
    try {
      let query = this.supabase
        .from("content_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.workflow_phase) {
        query = query.eq("workflow_phase", filters.workflow_phase);
      }

      if (filters.content_type) {
        query = query.eq("content_type", filters.content_type);
      }

      if (filters.assigned_to) {
        query = query.eq("assigned_to", filters.assigned_to);
      }

      if (filters.campaign_id) {
        query = query.eq("campaign_id", filters.campaign_id);
      }

      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }

      if (filters.overdue_only) {
        query = query.lt("due_date", new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch content items: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching content items:", error);
      throw error;
    }
  }

  /**
   * Get workflow transition history for content item
   */
  async getWorkflowHistory(
    contentItemId: string
  ): Promise<WorkflowTransition[]> {
    try {
      const { data, error } = await this.supabase
        .from("content_workflow_transitions")
        .select("*")
        .eq("content_item_id", contentItemId)
        .order("transition_date", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch workflow history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching workflow history:", error);
      throw error;
    }
  }

  /**
   * Get content workflow metrics
   */
  async getContentMetrics(): Promise<ContentMetrics> {
    try {
      const contentItems = await this.getContentItems();

      const metrics: ContentMetrics = {
        total_items: contentItems.length,
        by_phase: {
          planning: 0,
          creation: 0,
          review: 0,
          approval: 0,
          publication: 0,
          published: 0,
          archived: 0,
        },
        by_type: {
          blog_post: 0,
          social_media: 0,
          email_campaign: 0,
          video: 0,
          infographic: 0,
          whitepaper: 0,
          case_study: 0,
          landing_page: 0,
        },
        by_priority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0,
        },
        avg_completion_time_hours: 0,
        overdue_items: 0,
        items_completed_last_week: 0,
        workflow_efficiency: 0,
      };

      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      let totalCompletionTime = 0;
      let completedItems = 0;

      for (const item of contentItems) {
        // Count by phase
        metrics.by_phase[item.workflow_phase]++;

        // Count by type
        metrics.by_type[item.content_type]++;

        // Count by priority
        metrics.by_priority[item.priority]++;

        // Check if overdue
        if (
          item.due_date &&
          new Date(item.due_date) < now &&
          item.workflow_phase !== "published" &&
          item.workflow_phase !== "archived"
        ) {
          metrics.overdue_items++;
        }

        // Check if completed last week
        if (
          (item.workflow_phase === "published" ||
            item.workflow_phase === "archived") &&
          new Date(item.updated_at) >= lastWeek
        ) {
          metrics.items_completed_last_week++;
        }

        // Calculate completion time for published items
        if (item.workflow_phase === "published" && item.actual_hours) {
          totalCompletionTime += item.actual_hours;
          completedItems++;
        }
      }

      // Calculate averages
      if (completedItems > 0) {
        metrics.avg_completion_time_hours =
          totalCompletionTime / completedItems;
      }

      // Calculate workflow efficiency (completed vs total active items)
      const activeItems = contentItems.filter(
        item =>
          item.workflow_phase !== "published" &&
          item.workflow_phase !== "archived"
      ).length;

      if (activeItems > 0) {
        metrics.workflow_efficiency =
          (metrics.items_completed_last_week / activeItems) * 100;
      }

      return metrics;
    } catch (error) {
      console.error("Error calculating content metrics:", error);
      throw error;
    }
  }

  /**
   * Create workflow template
   */
  async createWorkflowTemplate(
    templateData: Omit<WorkflowTemplate, "id" | "created_at" | "updated_at">
  ): Promise<WorkflowTemplate> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("content_workflow_templates")
        .insert({
          ...templateData,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create workflow template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error creating workflow template:", error);
      throw error;
    }
  }

  /**
   * Get available workflow templates
   */
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from("content_workflow_templates")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(`Failed to fetch workflow templates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching workflow templates:", error);
      throw error;
    }
  }

  /**
   * Apply workflow template to content item
   */
  async applyWorkflowTemplate(
    contentItemId: string,
    templateId: string
  ): Promise<void> {
    try {
      const template = await this.supabase
        .from("content_workflow_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (template.error) {
        throw new Error(`Failed to fetch template: ${template.error.message}`);
      }

      // Update content item with template settings
      await this.supabase
        .from("content_items")
        .update({
          clickup_list_id: template.data.default_clickup_list_id,
          estimated_hours: template.data.phases.reduce(
            (sum, phase) => sum + phase.estimated_hours,
            0
          ),
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentItemId);
    } catch (error) {
      console.error("Error applying workflow template:", error);
      throw error;
    }
  }
}

/**
 * Create content workflow service instance
 */
export function createContentWorkflowService(): ContentWorkflowService {
  return new ContentWorkflowService();
}
