"use client";

// Types
interface QueueItem {
  id: string;
  post_id: string;
  platform: string;
  account_id: string;
  scheduled_for: Date;
  status: "waiting" | "processing" | "completed" | "failed" | "retrying";
  attempts: number;
  error_message?: string;
  estimated_time?: Date;
  priority: "low" | "medium" | "high" | "urgent";
  created_at: Date;
  updated_at: Date;
}

interface PublishingPost {
  id: string;
  title: string;
  content: string;
  media_urls: string[];
  platforms: string[];
  scheduled_date?: Date;
  status:
    | "draft"
    | "queued"
    | "publishing"
    | "published"
    | "failed"
    | "cancelled";
  created_at: Date;
  engagement_prediction?: number;
  hashtags: string[];
  target_audience?: string;
  campaign_id?: string;
}

interface PlatformConfig {
  platform: string;
  enabled: boolean;
  rate_limits: {
    posts_per_hour: number;
    posts_per_day: number;
    requests_per_minute: number;
  };
  optimal_times: {
    weekday: string[];
    weekend: string[];
  };
  character_limits: Record<string, number>;
}

interface PublishResult {
  success: boolean;
  platform: string;
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

export class PublishingQueueService {
  private queue: QueueItem[] = [];
  private processing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds
  private readonly PROCESSING_INTERVAL = 10000; // 10 seconds

  constructor() {
    this.startQueueProcessor();
  }

  /**
   * Add a new item to the publishing queue
   */
  async addToQueue(
    postId: string,
    platform: string,
    accountId: string,
    scheduledFor: Date,
    priority: "low" | "medium" | "high" | "urgent" = "medium"
  ): Promise<QueueItem> {
    const queueItem: QueueItem = {
      id: `queue-${Date.now()}-${platform}`,
      post_id: postId,
      platform,
      account_id: accountId,
      scheduled_for: scheduledFor,
      status: "waiting",
      attempts: 0,
      priority,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Insert based on priority and scheduled time
    const insertIndex = this.findInsertPosition(queueItem);
    this.queue.splice(insertIndex, 0, queueItem);

    console.log(
      `Added item to queue: ${queueItem.id} for platform ${platform}`
    );
    return queueItem;
  }

  /**
   * Start the queue processor
   */
  private startQueueProcessor(): void {
    if (this.processingInterval) {
      return;
    }

    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.PROCESSING_INTERVAL);

    console.log("Queue processor started");
  }

  /**
   * Stop the queue processor
   */
  stopQueueProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log("Queue processor stopped");
    }
  }

  /**
   * Process items in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      const itemsToProcess = this.queue.filter(
        item => item.status === "waiting" && new Date() >= item.scheduled_for
      );

      // Process items by priority
      const sortedItems = itemsToProcess.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      for (const item of sortedItems.slice(0, 5)) {
        // Process max 5 items at once
        await this.processQueueItem(item);
      }
    } catch (error) {
      console.error("Error processing queue:", error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: QueueItem): Promise<void> {
    console.log(`Processing queue item: ${item.id}`);

    // Update status to processing
    item.status = "processing";
    item.updated_at = new Date();

    try {
      // Check rate limits
      if (!(await this.checkRateLimits(item.platform))) {
        // Reschedule for later
        item.scheduled_for = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes later
        item.status = "waiting";
        item.updated_at = new Date();
        console.log(`Rate limit exceeded for ${item.platform}, rescheduled`);
        return;
      }

      // Attempt to publish
      const result = await this.publishContent(item);

      if (result.success) {
        item.status = "completed";
        item.updated_at = new Date();
        console.log(`Successfully published ${item.id} to ${item.platform}`);

        // Remove from queue
        this.removeFromQueue(item.id);
      } else {
        throw new Error(result.error_message || "Publishing failed");
      }
    } catch (error) {
      console.error(`Error publishing ${item.id}:`, error);

      item.attempts += 1;
      item.error_message =
        error instanceof Error ? error.message : "Unknown error";
      item.updated_at = new Date();

      if (item.attempts >= this.MAX_RETRIES) {
        item.status = "failed";
        console.log(
          `Item ${item.id} failed after ${this.MAX_RETRIES} attempts`
        );
      } else {
        item.status = "retrying";
        item.scheduled_for = new Date(
          Date.now() + this.RETRY_DELAY * item.attempts
        );
        console.log(
          `Retrying item ${item.id} in ${this.RETRY_DELAY * item.attempts}ms`
        );
      }
    }
  }

  /**
   * Publish content to the specified platform
   */
  private async publishContent(item: QueueItem): Promise<PublishResult> {
    try {
      // Simulate API call to publishing service
      const response = await fetch("/api/marketing/multi-platform-publishing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "publish_to_platform",
          queue_item_id: item.id,
          post_id: item.post_id,
          platform: item.platform,
          account_id: item.account_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          platform: item.platform,
          post_id: result.data?.post_id,
          published_at: new Date(),
        };
      } else {
        return {
          success: false,
          platform: item.platform,
          error_message: result.message || "Unknown error",
        };
      }
    } catch (error) {
      return {
        success: false,
        platform: item.platform,
        error_message: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  /**
   * Check rate limits for a platform
   */
  private async checkRateLimits(platform: string): Promise<boolean> {
    // Simulate rate limit checking
    const recentPublishes = this.queue.filter(
      item =>
        item.platform === platform &&
        item.status === "completed" &&
        new Date().getTime() - item.updated_at.getTime() < 60 * 60 * 1000 // Last hour
    );

    // Platform-specific rate limits
    const rateLimits: Record<string, number> = {
      facebook: 25,
      instagram: 20,
      twitter: 300,
      linkedin: 150,
      youtube: 6,
      tiktok: 10,
    };

    const limit = rateLimits[platform] || 10;
    return recentPublishes.length < limit;
  }

  /**
   * Find the correct position to insert a new queue item
   */
  private findInsertPosition(newItem: QueueItem): number {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };

    for (let i = 0; i < this.queue.length; i++) {
      const currentItem = this.queue[i];

      // Higher priority goes first
      if (
        priorityOrder[newItem.priority] > priorityOrder[currentItem.priority]
      ) {
        return i;
      }

      // Same priority, earlier scheduled time goes first
      if (
        priorityOrder[newItem.priority] ===
          priorityOrder[currentItem.priority] &&
        newItem.scheduled_for < currentItem.scheduled_for
      ) {
        return i;
      }
    }

    return this.queue.length;
  }

  /**
   * Remove an item from the queue
   */
  removeFromQueue(itemId: string): boolean {
    const index = this.queue.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      console.log(`Removed item ${itemId} from queue`);
      return true;
    }
    return false;
  }

  /**
   * Cancel a queued item
   */
  cancelQueueItem(itemId: string): boolean {
    const item = this.queue.find(item => item.id === itemId);
    if (item && item.status === "waiting") {
      item.status = "failed";
      item.error_message = "Cancelled by user";
      item.updated_at = new Date();
      return true;
    }
    return false;
  }

  /**
   * Retry a failed queue item
   */
  retryQueueItem(itemId: string): boolean {
    const item = this.queue.find(item => item.id === itemId);
    if (item && item.status === "failed") {
      item.status = "waiting";
      item.attempts = 0;
      item.error_message = undefined;
      item.scheduled_for = new Date();
      item.updated_at = new Date();
      console.log(`Retrying queue item: ${itemId}`);
      return true;
    }
    return false;
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): {
    total: number;
    waiting: number;
    processing: number;
    completed: number;
    failed: number;
    retrying: number;
  } {
    return {
      total: this.queue.length,
      waiting: this.queue.filter(item => item.status === "waiting").length,
      processing: this.queue.filter(item => item.status === "processing")
        .length,
      completed: this.queue.filter(item => item.status === "completed").length,
      failed: this.queue.filter(item => item.status === "failed").length,
      retrying: this.queue.filter(item => item.status === "retrying").length,
    };
  }

  /**
   * Get all queue items
   */
  getQueue(): QueueItem[] {
    return [...this.queue];
  }

  /**
   * Get queue items for a specific platform
   */
  getQueueByPlatform(platform: string): QueueItem[] {
    return this.queue.filter(item => item.platform === platform);
  }

  /**
   * Get queue items for a specific post
   */
  getQueueByPost(postId: string): QueueItem[] {
    return this.queue.filter(item => item.post_id === postId);
  }

  /**
   * Clear completed items from queue
   */
  clearCompleted(): number {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(item => item.status !== "completed");
    const removedCount = initialLength - this.queue.length;
    console.log(`Cleared ${removedCount} completed items from queue`);
    return removedCount;
  }

  /**
   * Get estimated completion time for waiting items
   */
  getEstimatedCompletionTime(): Date | null {
    const waitingItems = this.queue.filter(item => item.status === "waiting");
    if (waitingItems.length === 0) {
      return null;
    }

    // Estimate based on processing rate (assume 1 item per 30 seconds)
    const estimatedSeconds = waitingItems.length * 30;
    return new Date(Date.now() + estimatedSeconds * 1000);
  }

  /**
   * Update queue item priority
   */
  updateItemPriority(
    itemId: string,
    priority: "low" | "medium" | "high" | "urgent"
  ): boolean {
    const item = this.queue.find(item => item.id === itemId);
    if (item && item.status === "waiting") {
      item.priority = priority;
      item.updated_at = new Date();

      // Reposition item in queue
      this.removeFromQueue(itemId);
      const insertIndex = this.findInsertPosition(item);
      this.queue.splice(insertIndex, 0, item);

      console.log(`Updated priority for ${itemId} to ${priority}`);
      return true;
    }
    return false;
  }

  /**
   * Pause queue processing
   */
  pauseQueue(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log("Queue processing paused");
    }
  }

  /**
   * Resume queue processing
   */
  resumeQueue(): void {
    if (!this.processingInterval) {
      this.startQueueProcessor();
      console.log("Queue processing resumed");
    }
  }

  /**
   * Get queue health metrics
   */
  getQueueHealth(): {
    healthy: boolean;
    metrics: {
      average_processing_time: number;
      success_rate: number;
      items_processed_last_hour: number;
      estimated_backlog_time: number;
    };
  } {
    const completedItems = this.queue.filter(
      item => item.status === "completed"
    );
    const failedItems = this.queue.filter(item => item.status === "failed");
    const totalProcessed = completedItems.length + failedItems.length;

    const successRate =
      totalProcessed > 0 ? (completedItems.length / totalProcessed) * 100 : 100;
    const isHealthy = successRate >= 90; // Consider healthy if 90%+ success rate

    // Calculate average processing time (mock data)
    const avgProcessingTime = 45; // seconds

    // Items processed in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const itemsLastHour = this.queue.filter(
      item => item.status === "completed" && item.updated_at > oneHourAgo
    ).length;

    // Estimated backlog time
    const waitingItems = this.queue.filter(
      item => item.status === "waiting"
    ).length;
    const estimatedBacklogTime = waitingItems * avgProcessingTime;

    return {
      healthy: isHealthy,
      metrics: {
        average_processing_time: avgProcessingTime,
        success_rate: successRate,
        items_processed_last_hour: itemsLastHour,
        estimated_backlog_time: estimatedBacklogTime,
      },
    };
  }
}

// Singleton instance
let queueServiceInstance: PublishingQueueService | null = null;

export function getPublishingQueueService(): PublishingQueueService {
  if (!queueServiceInstance) {
    queueServiceInstance = new PublishingQueueService();
  }
  return queueServiceInstance;
}
