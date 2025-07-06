import { createClient } from "@supabase/supabase-js";

// Content extraction interfaces
export interface ClickUpContentData {
  task_id: string;
  title: string;
  description?: string;
  content?: string;
  media_urls: string[];
  scheduling_preferences: {
    preferred_time?: string;
    preferred_dates?: string[];
    priority: "urgent" | "high" | "medium" | "low";
    platforms?: string[];
  };
  approval_status: "approved" | "pending" | "rejected";
  extracted_at: string;
}

export interface BlototoSchedulingRequest {
  content_id: string;
  title: string;
  content: string;
  media_urls: string[];
  scheduled_time?: string;
  platforms: string[];
  priority: number;
}

export class ClickUpContentExtractionService {
  private supabase;
  private clickupApiKey: string;
  private baseUrl = "https://api.clickup.com/api/v2";

  constructor(clickupApiKey: string) {
    this.clickupApiKey = clickupApiKey;
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Extract content data from approved ClickUp task
   */
  async extractContentFromTask(
    taskId: string
  ): Promise<ClickUpContentData | null> {
    try {
      // Get task details from ClickUp API
      const response = await fetch(`${this.baseUrl}/task/${taskId}`, {
        headers: {
          Authorization: this.clickupApiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch task: ${response.statusText}`);
      }

      const task = await response.json();

      // Check if task is approved for content publishing
      const isApproved = this.checkApprovalStatus(task);
      if (!isApproved) {
        console.log(`Task ${taskId} is not approved for publishing`);
        return null;
      }

      // Extract content data
      const contentData: ClickUpContentData = {
        task_id: taskId,
        title: task.name || "",
        description: task.description || "",
        content: this.extractContentText(task),
        media_urls: this.extractMediaUrls(task),
        scheduling_preferences: this.extractSchedulingPreferences(task),
        approval_status: "approved",
        extracted_at: new Date().toISOString(),
      };

      // Store extracted content for tracking
      await this.storeExtractedContent(contentData);

      return contentData;
    } catch (error) {
      console.error("Error extracting content from task:", error);
      throw error;
    }
  }

  /**
   * Check if task is approved for content publishing
   */
  private checkApprovalStatus(task: any): boolean {
    // Check status
    const approvedStatuses = ["approved", "ready for posting", "scheduled"];
    const currentStatus = task.status?.status?.toLowerCase() || "";

    if (approvedStatuses.includes(currentStatus)) {
      return true;
    }

    // Check for approval tags
    const approvalTags = ["approved", "ready-to-post", "content-approved"];
    const taskTags = task.tags?.map((tag: any) => tag.name.toLowerCase()) || [];

    return approvalTags.some(tag => taskTags.includes(tag));
  }

  /**
   * Extract content text from task description and custom fields
   */
  private extractContentText(task: any): string {
    let content = "";

    // Add description if available
    if (task.description) {
      content += task.description;
    }

    // Check custom fields for content
    const customFields = task.custom_fields || [];
    for (const field of customFields) {
      if (
        field.name?.toLowerCase().includes("content") ||
        field.name?.toLowerCase().includes("post") ||
        field.name?.toLowerCase().includes("caption")
      ) {
        if (field.value) {
          content += `\n\n${field.value}`;
        }
      }
    }

    return content.trim();
  }

  /**
   * Extract media URLs from task attachments and custom fields
   */
  private extractMediaUrls(task: any): string[] {
    const mediaUrls: string[] = [];

    // Check attachments
    const attachments = task.attachments || [];
    for (const attachment of attachments) {
      if (attachment.url && this.isMediaFile(attachment.url)) {
        mediaUrls.push(attachment.url);
      }
    }

    // Check custom fields for media URLs
    const customFields = task.custom_fields || [];
    for (const field of customFields) {
      if (
        field.name?.toLowerCase().includes("image") ||
        field.name?.toLowerCase().includes("media") ||
        field.name?.toLowerCase().includes("photo")
      ) {
        if (field.value && typeof field.value === "string") {
          // Try to extract URLs from field value
          const urls = this.extractUrlsFromText(field.value);
          mediaUrls.push(...urls.filter(url => this.isMediaFile(url)));
        }
      }
    }

    return [...new Set(mediaUrls)]; // Remove duplicates
  }

  /**
   * Extract scheduling preferences from task due date and custom fields
   */
  private extractSchedulingPreferences(
    task: any
  ): ClickUpContentData["scheduling_preferences"] {
    const preferences: ClickUpContentData["scheduling_preferences"] = {
      priority: this.mapPriority(task.priority),
    };

    // Check due date
    if (task.due_date) {
      preferences.preferred_time = new Date(
        parseInt(task.due_date)
      ).toISOString();
    }

    // Check custom fields for scheduling info
    const customFields = task.custom_fields || [];
    for (const field of customFields) {
      const fieldName = field.name?.toLowerCase() || "";

      if (fieldName.includes("schedule") || fieldName.includes("publish")) {
        if (field.value) {
          if (fieldName.includes("time")) {
            preferences.preferred_time = field.value;
          } else if (fieldName.includes("platform")) {
            preferences.platforms = Array.isArray(field.value)
              ? field.value
              : [field.value];
          }
        }
      }
    }

    return preferences;
  }

  /**
   * Map ClickUp priority to our priority system
   */
  private mapPriority(
    clickupPriority: any
  ): "urgent" | "high" | "medium" | "low" {
    if (!clickupPriority) return "medium";

    const priority = clickupPriority.priority?.toLowerCase() || "";

    switch (priority) {
      case "urgent":
      case "1":
        return "urgent";
      case "high":
      case "2":
        return "high";
      case "normal":
      case "3":
        return "medium";
      case "low":
      case "4":
      default:
        return "low";
    }
  }

  /**
   * Check if URL is a media file
   */
  private isMediaFile(url: string): boolean {
    const mediaExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".mp4",
      ".mov",
      ".avi",
      ".webp",
    ];
    const urlLower = url.toLowerCase();
    return mediaExtensions.some(ext => urlLower.includes(ext));
  }

  /**
   * Extract URLs from text using regex
   */
  private extractUrlsFromText(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches || [];
  }

  /**
   * Store extracted content in database for tracking
   */
  private async storeExtractedContent(
    contentData: ClickUpContentData
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("clickup_extracted_content")
        .upsert({
          task_id: contentData.task_id,
          title: contentData.title,
          description: contentData.description,
          content: contentData.content,
          media_urls: contentData.media_urls,
          scheduling_preferences: contentData.scheduling_preferences,
          approval_status: contentData.approval_status,
          extracted_at: contentData.extracted_at,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error storing extracted content:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to store extracted content:", error);
      throw error;
    }
  }

  /**
   * Get extracted content by task ID
   */
  async getExtractedContent(
    taskId: string
  ): Promise<ClickUpContentData | null> {
    try {
      const { data, error } = await this.supabase
        .from("clickup_extracted_content")
        .select("*")
        .eq("task_id", taskId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error getting extracted content:", error);
      throw error;
    }
  }

  /**
   * Convert to Blotato scheduling request
   */
  convertToBlototoRequest(
    contentData: ClickUpContentData
  ): BlototoSchedulingRequest {
    return {
      content_id: contentData.task_id,
      title: contentData.title,
      content: contentData.content || contentData.description || "",
      media_urls: contentData.media_urls,
      scheduled_time: contentData.scheduling_preferences.preferred_time,
      platforms: contentData.scheduling_preferences.platforms || [
        "instagram",
        "facebook",
      ],
      priority: this.mapPriorityToNumber(
        contentData.scheduling_preferences.priority
      ),
    };
  }

  /**
   * Map priority to number for Blotato API
   */
  private mapPriorityToNumber(priority: string): number {
    switch (priority) {
      case "urgent":
        return 1;
      case "high":
        return 2;
      case "medium":
        return 3;
      case "low":
        return 4;
      default:
        return 3;
    }
  }
}
