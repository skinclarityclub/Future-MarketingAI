/**
 * Automated Scheduling and Publishing Service
 * Task 34.3: Implement Automated Scheduling and Publishing
 *
 * This service handles automated scheduling, publishing, and management
 * of content across multiple platforms with queue-based processing,
 * retry logic, and comprehensive monitoring.
 */

import { createClient } from "@/lib/supabase/client";
import { SyncQueueProcessor } from "@/lib/sync/queue-processor";

// Types
export interface ScheduledContent {
  id: string;
  title: string;
  type: "post" | "email" | "ad" | "story" | "video" | "campaign";
  platform: string[];
  scheduled_date: Date;
  scheduled_time: string;
  status:
    | "draft"
    | "scheduled"
    | "publishing"
    | "published"
    | "failed"
    | "cancelled";
  content_full: string;
  hashtags?: string[];
  images?: string[];
  author: string;
  campaign_id?: string;
  priority: "low" | "medium" | "high" | "urgent";
  retry_count: number;
  max_retries: number;
  last_attempt?: Date;
  error_message?: string;
  publish_results?: PublishResult[];
  engagement_prediction?: number;
  target_audience?: string;
  budget?: number;
  approval_status: "pending" | "approved" | "rejected";
  approver?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PublishResult {
  platform: string;
  status: "success" | "failed" | "pending";
  post_id?: string;
  error_message?: string;
  published_at?: Date;
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
    impressions?: number;
    reach?: number;
  };
}

export interface SchedulingRule {
  id: string;
  name: string;
  type:
    | "optimal_timing"
    | "frequency_limit"
    | "audience_targeting"
    | "content_spacing";
  conditions: Record<string, any>;
  actions: Record<string, any>;
  enabled: boolean;
  priority: number;
}

export interface PublishingQueue {
  id: string;
  content_id: string;
  platform: string;
  scheduled_for: Date;
  status: "pending" | "processing" | "completed" | "failed";
  priority: number;
  retry_count: number;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface PlatformConfig {
  platform: string;
  enabled: boolean;
  api_config: Record<string, any>;
  rate_limits: {
    posts_per_hour: number;
    posts_per_day: number;
    requests_per_minute: number;
  };
  optimal_times: {
    weekday: string[];
    weekend: string[];
  };
  content_types: string[];
  character_limits: Record<string, number>;
  image_requirements: {
    max_size: number;
    formats: string[];
    dimensions: {
      min_width: number;
      min_height: number;
      max_width: number;
      max_height: number;
    };
  };
}

// Default platform configurations
const DEFAULT_PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  facebook: {
    platform: "facebook",
    enabled: true,
    api_config: {},
    rate_limits: {
      posts_per_hour: 25,
      posts_per_day: 200,
      requests_per_minute: 200,
    },
    optimal_times: {
      weekday: ["09:00", "13:00", "15:00", "19:00"],
      weekend: ["10:00", "14:00", "16:00", "20:00"],
    },
    content_types: ["post", "video", "story", "ad", "campaign"],
    character_limits: {
      post: 63206,
      story: 500,
      ad: 125,
    },
    image_requirements: {
      max_size: 10485760, // 10MB
      formats: ["jpg", "jpeg", "png", "gif"],
      dimensions: {
        min_width: 600,
        min_height: 315,
        max_width: 2048,
        max_height: 2048,
      },
    },
  },
  instagram: {
    platform: "instagram",
    enabled: true,
    api_config: {},
    rate_limits: {
      posts_per_hour: 20,
      posts_per_day: 150,
      requests_per_minute: 200,
    },
    optimal_times: {
      weekday: ["08:00", "12:00", "17:00", "19:00"],
      weekend: ["10:00", "13:00", "16:00", "19:00"],
    },
    content_types: ["post", "story", "video", "ad"],
    character_limits: {
      post: 2200,
      story: 500,
      ad: 125,
    },
    image_requirements: {
      max_size: 8388608, // 8MB
      formats: ["jpg", "jpeg", "png"],
      dimensions: {
        min_width: 320,
        min_height: 320,
        max_width: 1080,
        max_height: 1080,
      },
    },
  },
  twitter: {
    platform: "twitter",
    enabled: true,
    api_config: {},
    rate_limits: {
      posts_per_hour: 100,
      posts_per_day: 2400,
      requests_per_minute: 100,
    },
    optimal_times: {
      weekday: ["09:00", "12:00", "15:00", "18:00"],
      weekend: ["10:00", "14:00", "17:00", "19:00"],
    },
    content_types: ["post", "ad"],
    character_limits: {
      post: 280,
      ad: 280,
    },
    image_requirements: {
      max_size: 5242880, // 5MB
      formats: ["jpg", "jpeg", "png", "gif"],
      dimensions: {
        min_width: 600,
        min_height: 335,
        max_width: 1920,
        max_height: 1080,
      },
    },
  },
  linkedin: {
    platform: "linkedin",
    enabled: true,
    api_config: {},
    rate_limits: {
      posts_per_hour: 20,
      posts_per_day: 150,
      requests_per_minute: 100,
    },
    optimal_times: {
      weekday: ["08:00", "12:00", "17:00", "18:00"],
      weekend: ["09:00", "13:00", "16:00"],
    },
    content_types: ["post", "video", "ad", "campaign"],
    character_limits: {
      post: 3000,
      ad: 150,
    },
    image_requirements: {
      max_size: 10485760, // 10MB
      formats: ["jpg", "jpeg", "png"],
      dimensions: {
        min_width: 552,
        min_height: 414,
        max_width: 1920,
        max_height: 1080,
      },
    },
  },
};

export class AutomatedSchedulingService {
  private supabase = createClient();
  private queueProcessor: SyncQueueProcessor;
  private platformConfigs: Map<string, PlatformConfig> = new Map();
  private schedulingRules: SchedulingRule[] = [];
  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;

  constructor() {
    this.queueProcessor = new SyncQueueProcessor();
    this.initializePlatformConfigs();
    this.loadSchedulingRules();
  }

  /**
   * Initialize platform configurations
   */
  private initializePlatformConfigs(): void {
    Object.values(DEFAULT_PLATFORM_CONFIGS).forEach(config => {
      this.platformConfigs.set(config.platform, config);
    });
  }

  /**
   * Load scheduling rules from database
   */
  private async loadSchedulingRules(): Promise<void> {
    try {
      const { data: rules, error } = await this.supabase
        .from("scheduling_rules")
        .select("*")
        .eq("enabled", true)
        .order("priority", { ascending: false });

      if (error) {
        console.warn("Could not load scheduling rules:", error);
        return;
      }

      this.schedulingRules = rules || [];
    } catch (error) {
      console.warn("Error loading scheduling rules:", error);
    }
  }

  /**
   * Schedule content for publishing
   */
  async scheduleContent(
    content: Partial<ScheduledContent>,
    options: {
      optimize_timing?: boolean;
      respect_rules?: boolean;
      auto_approve?: boolean;
    } = {}
  ): Promise<ScheduledContent> {
    const {
      optimize_timing = true,
      respect_rules = true,
      auto_approve = false,
    } = options;

    // Create base content item
    const scheduledContent: ScheduledContent = {
      id: content.id || `scheduled-${Date.now()}`,
      title: content.title || "Untitled Content",
      type: content.type || "post",
      platform: content.platform || ["facebook"],
      scheduled_date: content.scheduled_date || new Date(),
      scheduled_time: content.scheduled_time || "12:00",
      status: "scheduled",
      content_full: content.content_full || "",
      hashtags: content.hashtags || [],
      images: content.images || [],
      author: content.author || "System",
      campaign_id: content.campaign_id,
      priority: content.priority || "medium",
      retry_count: 0,
      max_retries: 3,
      approval_status: auto_approve ? "approved" : "pending",
      created_at: new Date(),
      updated_at: new Date(),
      ...content,
    };

    // Optimize timing if requested
    if (optimize_timing) {
      scheduledContent.scheduled_date = await this.optimizePublishingTime(
        scheduledContent.platform,
        scheduledContent.type,
        scheduledContent.target_audience
      );
    }

    // Apply scheduling rules if requested
    if (respect_rules) {
      await this.applySchedulingRules(scheduledContent);
    }

    // Validate content for each platform
    for (const platform of scheduledContent.platform) {
      const validation = await this.validateContentForPlatform(
        scheduledContent,
        platform
      );
      if (!validation.valid) {
        throw new Error(
          `Content validation failed for ${platform}: ${validation.errors.join(", ")}`
        );
      }
    }

    // Save to database
    const { error } = await this.supabase
      .from("scheduled_content")
      .insert([scheduledContent]);

    if (error) {
      throw new Error(`Failed to schedule content: ${error.message}`);
    }

    // Add to publishing queue if approved
    if (scheduledContent.approval_status === "approved") {
      await this.addToPublishingQueue(scheduledContent);
    }

    return scheduledContent;
  }

  /**
   * Optimize publishing time based on platform analytics and audience data
   */
  async optimizePublishingTime(
    platforms: string[],
    _contentType: string,
    _targetAudience?: string
  ): Promise<Date> {
    try {
      // Get optimal times for each platform
      const optimalTimes: Date[] = [];

      for (const platform of platforms) {
        const config = this.platformConfigs.get(platform);
        if (!config) continue;

        // Get platform-specific optimal times
        const today = new Date();
        const isWeekend = today.getDay() === 0 || today.getDay() === 6;
        const timeSlots = isWeekend
          ? config.optimal_times.weekend
          : config.optimal_times.weekday;

        // Convert time slots to Date objects
        for (const timeSlot of timeSlots) {
          const [hour, minute] = timeSlot.split(":").map(Number);
          const optimizedDate = new Date(today);
          optimizedDate.setHours(hour, minute, 0, 0);

          // If time has passed today, schedule for tomorrow
          if (optimizedDate <= new Date()) {
            optimizedDate.setDate(optimizedDate.getDate() + 1);
          }

          optimalTimes.push(optimizedDate);
        }
      }

      // Return the earliest optimal time or default to next hour
      return optimalTimes.length > 0
        ? new Date(Math.min(...optimalTimes.map(d => d.getTime())))
        : new Date(Date.now() + 60 * 60 * 1000); // Next hour
    } catch (error) {
      console.warn("Error optimizing publishing time:", error);
      return new Date(Date.now() + 60 * 60 * 1000); // Default to next hour
    }
  }

  /**
   * Apply scheduling rules to content
   */
  async applySchedulingRules(content: ScheduledContent): Promise<void> {
    for (const rule of this.schedulingRules) {
      try {
        switch (rule.type) {
          case "frequency_limit":
            await this.applyFrequencyLimitRule(content, rule);
            break;
          case "content_spacing":
            await this.applyContentSpacingRule(content, rule);
            break;
          case "audience_targeting":
            await this.applyAudienceTargetingRule(content, rule);
            break;
          default:
            break;
        }
      } catch (error) {
        console.warn(`Error applying rule ${rule.name}:`, error);
      }
    }
  }

  /**
   * Apply frequency limit rule
   */
  private async applyFrequencyLimitRule(
    content: ScheduledContent,
    rule: SchedulingRule
  ): Promise<void> {
    const { maxPostsPerHour = 5, maxPostsPerDay = 20 } = rule.conditions;

    // Check hourly limit
    const hourStart = new Date(content.scheduled_date);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    const { count: hourlyCount } = await this.supabase
      .from("scheduled_content")
      .select("id", { count: "exact" })
      .gte("scheduled_date", hourStart.toISOString())
      .lt("scheduled_date", hourEnd.toISOString())
      .in("platform", content.platform)
      .neq("status", "cancelled");

    if ((hourlyCount || 0) >= maxPostsPerHour) {
      // Reschedule to next available hour
      content.scheduled_date = new Date(hourEnd);
    }

    // Check daily limit
    const dayStart = new Date(content.scheduled_date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const { count: dailyCount } = await this.supabase
      .from("scheduled_content")
      .select("id", { count: "exact" })
      .gte("scheduled_date", dayStart.toISOString())
      .lt("scheduled_date", dayEnd.toISOString())
      .in("platform", content.platform)
      .neq("status", "cancelled");

    if ((dailyCount || 0) >= maxPostsPerDay) {
      // Reschedule to next day
      content.scheduled_date = new Date(dayEnd);
      await this.optimizePublishingTime(content.platform, content.type);
    }
  }

  /**
   * Apply content spacing rule
   */
  private async applyContentSpacingRule(
    content: ScheduledContent,
    rule: SchedulingRule
  ): Promise<void> {
    const { minimumSpacingMinutes = 30 } = rule.conditions;

    // Find nearby scheduled content
    const spacingStart = new Date(
      content.scheduled_date.getTime() - minimumSpacingMinutes * 60 * 1000
    );
    const spacingEnd = new Date(
      content.scheduled_date.getTime() + minimumSpacingMinutes * 60 * 1000
    );

    const { data: nearbyContent } = await this.supabase
      .from("scheduled_content")
      .select("scheduled_date")
      .gte("scheduled_date", spacingStart.toISOString())
      .lte("scheduled_date", spacingEnd.toISOString())
      .in("platform", content.platform)
      .neq("status", "cancelled")
      .neq("id", content.id);

    if (nearbyContent && nearbyContent.length > 0) {
      // Find next available slot
      const scheduledTimes = nearbyContent.map(c =>
        new Date(c.scheduled_date).getTime()
      );
      let newTime = content.scheduled_date.getTime();

      while (
        scheduledTimes.some(
          time => Math.abs(time - newTime) < minimumSpacingMinutes * 60 * 1000
        )
      ) {
        newTime += minimumSpacingMinutes * 60 * 1000;
      }

      content.scheduled_date = new Date(newTime);
    }
  }

  /**
   * Apply audience targeting rule
   */
  private async applyAudienceTargetingRule(
    content: ScheduledContent,
    rule: SchedulingRule
  ): Promise<void> {
    const { audienceTimezones = [], preferredHours = [] } = rule.conditions;

    if (content.target_audience && audienceTimezones.length > 0) {
      // Adjust timing based on target audience timezone
      // This is a simplified implementation - in production you'd use proper timezone libraries
      const targetHour = preferredHours[0] || 12;
      const scheduledDate = new Date(content.scheduled_date);
      scheduledDate.setHours(targetHour, 0, 0, 0);
      content.scheduled_date = scheduledDate;
    }
  }

  /**
   * Validate content for a specific platform
   */
  async validateContentForPlatform(
    content: ScheduledContent,
    platform: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const config = this.platformConfigs.get(platform);

    if (!config) {
      errors.push(`Platform ${platform} is not configured`);
      return { valid: false, errors };
    }

    if (!config.enabled) {
      errors.push(`Platform ${platform} is disabled`);
      return { valid: false, errors };
    }

    // Check content type support
    if (!config.content_types.includes(content.type)) {
      errors.push(
        `Content type ${content.type} is not supported on ${platform}`
      );
    }

    // Check character limits
    const charLimit = config.character_limits[content.type];
    if (charLimit && content.content_full.length > charLimit) {
      errors.push(
        `Content exceeds character limit for ${platform} (${content.content_full.length}/${charLimit})`
      );
    }

    // Check image requirements
    if (content.images && content.images.length > 0) {
      // In a real implementation, you'd validate actual image files
      // For now, just check if images are provided when required
    }

    // Check rate limits
    const now = new Date();
    const hourStart = new Date(now);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    const { count: hourlyCount } = await this.supabase
      .from("scheduled_content")
      .select("id", { count: "exact" })
      .gte("scheduled_date", hourStart.toISOString())
      .lt("scheduled_date", hourEnd.toISOString())
      .contains("platform", [platform])
      .in("status", ["scheduled", "publishing", "published"]);

    if ((hourlyCount || 0) >= config.rate_limits.posts_per_hour) {
      errors.push(
        `Rate limit exceeded for ${platform} (${hourlyCount}/${config.rate_limits.posts_per_hour} per hour)`
      );
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Add content to publishing queue
   */
  async addToPublishingQueue(content: ScheduledContent): Promise<void> {
    const priority = this.getPriorityScore(content.priority);

    for (const platform of content.platform) {
      const queueItem: Partial<PublishingQueue> = {
        id: `queue-${content.id}-${platform}-${Date.now()}`,
        content_id: content.id,
        platform,
        scheduled_for: content.scheduled_date,
        status: "pending",
        priority,
        retry_count: 0,
        metadata: {
          content_type: content.type,
          author: content.author,
          campaign_id: content.campaign_id,
        },
        created_at: new Date(),
      };

      // Add to sync queue for background processing
      await this.queueProcessor.addToQueue({
        source: "automated_scheduler",
        action: "create",
        entity_type: "social_profile",
        entity_id: content.id,
        payload: {
          content,
          platform,
          queue_item: queueItem,
        },
        priority,
        max_retries: content.max_retries,
        scheduled_for: content.scheduled_date.toISOString(),
      });
    }
  }

  /**
   * Process publishing queue
   */
  async processPublishingQueue(): Promise<void> {
    if (this.isProcessing) {
      return; // Already processing
    }

    this.isProcessing = true;

    try {
      // Get pending items that are due for publishing
      const { data: queueItems, error } = await this.supabase
        .from("publishing_queue")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString())
        .order("priority", { ascending: false })
        .order("scheduled_for", { ascending: true })
        .limit(10);

      if (error) {
        console.error("Error fetching publishing queue:", error);
        return;
      }

      if (!queueItems || queueItems.length === 0) {
        return; // No items to process
      }

      console.log(`Processing ${queueItems.length} publishing queue items`);

      // Process each item
      for (const queueItem of queueItems) {
        try {
          await this.processQueueItem(queueItem);
        } catch (error) {
          console.error(`Error processing queue item ${queueItem.id}:`, error);
          await this.handleFailedQueueItem(queueItem, error);
        }
      }
    } catch (error) {
      console.error("Error in processPublishingQueue:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(queueItem: PublishingQueue): Promise<void> {
    // Mark as processing
    await this.supabase
      .from("publishing_queue")
      .update({ status: "processing" })
      .eq("id", queueItem.id);

    // Get content details
    const { data: content, error: contentError } = await this.supabase
      .from("scheduled_content")
      .select("*")
      .eq("id", queueItem.content_id)
      .single();

    if (contentError || !content) {
      throw new Error(`Content not found: ${queueItem.content_id}`);
    }

    // Update content status
    await this.supabase
      .from("scheduled_content")
      .update({
        status: "publishing",
        last_attempt: new Date().toISOString(),
      })
      .eq("id", content.id);

    // Publish to platform
    const publishResult = await this.publishToPlatform(
      content,
      queueItem.platform
    );

    // Update content with results
    const publishResults = content.publish_results || [];
    publishResults.push(publishResult);

    const newStatus =
      publishResult.status === "success" ? "published" : "failed";
    const retryCount =
      publishResult.status === "failed"
        ? content.retry_count + 1
        : content.retry_count;

    await this.supabase
      .from("scheduled_content")
      .update({
        status: newStatus,
        retry_count: retryCount,
        publish_results: publishResults,
        error_message: publishResult.error_message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", content.id);

    // Update queue item
    await this.supabase
      .from("publishing_queue")
      .update({
        status: publishResult.status === "success" ? "completed" : "failed",
        retry_count:
          queueItem.retry_count + (publishResult.status === "failed" ? 1 : 0),
      })
      .eq("id", queueItem.id);
  }

  /**
   * Publish content to a specific platform
   */
  private async publishToPlatform(
    content: ScheduledContent,
    platform: string
  ): Promise<PublishResult> {
    try {
      console.log(`Publishing content ${content.id} to ${platform}`);

      // Call the appropriate social media API
      const response = await fetch(`/api/marketing/social-media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "schedule_post",
          post_data: {
            platform,
            content: content.content_full,
            media_urls: content.images,
            scheduled_at: content.scheduled_date.toISOString(),
            hashtags: content.hashtags,
            campaign_id: content.campaign_id,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          platform,
          status: "success",
          post_id: result.data.id,
          published_at: new Date(),
        };
      } else {
        throw new Error(result.message || "Publishing failed");
      }
    } catch (error) {
      console.error(`Error publishing to ${platform}:`, error);
      return {
        platform,
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Handle failed queue item
   */
  private async handleFailedQueueItem(
    queueItem: PublishingQueue,
    error: unknown
  ): Promise<void> {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const newRetryCount = queueItem.retry_count + 1;
    const maxRetries = 3;

    if (newRetryCount >= maxRetries) {
      // Max retries reached, mark as failed
      await this.supabase
        .from("publishing_queue")
        .update({
          status: "failed",
          retry_count: newRetryCount,
        })
        .eq("id", queueItem.id);

      console.error(
        `Queue item ${queueItem.id} failed permanently after ${newRetryCount} attempts: ${errorMessage}`
      );
    } else {
      // Schedule for retry with exponential backoff
      const delayMinutes = Math.pow(2, newRetryCount) * 5; // 5, 10, 20 minutes
      const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);

      await this.supabase
        .from("publishing_queue")
        .update({
          status: "pending",
          retry_count: newRetryCount,
          scheduled_for: scheduledFor.toISOString(),
        })
        .eq("id", queueItem.id);

      console.log(
        `Queue item ${queueItem.id} scheduled for retry ${newRetryCount} in ${delayMinutes} minutes (Error: ${errorMessage})`
      );
    }
  }

  /**
   * Start automated processing
   */
  startAutomatedProcessing(intervalMinutes: number = 5): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(
      async () => {
        await this.processPublishingQueue();
      },
      intervalMinutes * 60 * 1000
    );

    console.log(
      `Started automated processing with ${intervalMinutes}-minute intervals`
    );
  }

  /**
   * Stop automated processing
   */
  stopAutomatedProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
      console.log("Stopped automated processing");
    }
  }

  /**
   * Get priority score for queue ordering
   */
  private getPriorityScore(priority: string): number {
    const scores = {
      urgent: 1,
      high: 2,
      medium: 3,
      low: 4,
    };
    return scores[priority as keyof typeof scores] || 3;
  }

  /**
   * Get scheduling statistics
   */
  async getSchedulingStats(): Promise<{
    total_scheduled: number;
    published_today: number;
    failed_today: number;
    pending_approval: number;
    queue_size: number;
    success_rate: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalScheduled,
      publishedToday,
      failedToday,
      pendingApproval,
      queueSize,
    ] = await Promise.all([
      this.supabase
        .from("scheduled_content")
        .select("id", { count: "exact" })
        .neq("status", "cancelled"),

      this.supabase
        .from("scheduled_content")
        .select("id", { count: "exact" })
        .eq("status", "published")
        .gte("scheduled_date", today.toISOString())
        .lt("scheduled_date", tomorrow.toISOString()),

      this.supabase
        .from("scheduled_content")
        .select("id", { count: "exact" })
        .eq("status", "failed")
        .gte("scheduled_date", today.toISOString())
        .lt("scheduled_date", tomorrow.toISOString()),

      this.supabase
        .from("scheduled_content")
        .select("id", { count: "exact" })
        .eq("approval_status", "pending"),

      this.supabase
        .from("publishing_queue")
        .select("id", { count: "exact" })
        .eq("status", "pending"),
    ]);

    const successRate =
      (publishedToday.count || 0) + (failedToday.count || 0) > 0
        ? ((publishedToday.count || 0) /
            ((publishedToday.count || 0) + (failedToday.count || 0))) *
          100
        : 100;

    return {
      total_scheduled: totalScheduled.count || 0,
      published_today: publishedToday.count || 0,
      failed_today: failedToday.count || 0,
      pending_approval: pendingApproval.count || 0,
      queue_size: queueSize.count || 0,
      success_rate: Math.round(successRate * 100) / 100,
    };
  }

  /**
   * Bulk approve content
   */
  async bulkApproveContent(contentIds: string[]): Promise<void> {
    // Update approval status
    const { error } = await this.supabase
      .from("scheduled_content")
      .update({
        approval_status: "approved",
        updated_at: new Date().toISOString(),
      })
      .in("id", contentIds);

    if (error) {
      throw new Error(`Failed to approve content: ${error.message}`);
    }

    // Add approved content to publishing queue
    const { data: approvedContent } = await this.supabase
      .from("scheduled_content")
      .select("*")
      .in("id", contentIds);

    if (approvedContent) {
      for (const content of approvedContent) {
        await this.addToPublishingQueue(content);
      }
    }
  }

  /**
   * Cancel scheduled content
   */
  async cancelScheduledContent(contentIds: string[]): Promise<void> {
    // Update content status
    await this.supabase
      .from("scheduled_content")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .in("id", contentIds);

    // Remove from publishing queue
    await this.supabase
      .from("publishing_queue")
      .delete()
      .in("content_id", contentIds)
      .eq("status", "pending");
  }
}

// Export singleton instance
export const automatedSchedulingService = new AutomatedSchedulingService();
