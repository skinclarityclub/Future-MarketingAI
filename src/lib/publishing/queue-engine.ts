// Core Publishing Queue Engine
// Advanced automated publishing system with intelligent scheduling and priority management

export type PublishingPriority = "urgent" | "high" | "medium" | "low";
export type PublishingStatus =
  | "pending"
  | "scheduled"
  | "processing"
  | "published"
  | "failed"
  | "cancelled"
  | "retrying";
export type PlatformType =
  | "linkedin"
  | "twitter"
  | "facebook"
  | "instagram"
  | "email"
  | "blog";

export interface PublishingItem {
  id: string;
  contentId: string;
  title: string;
  content: string;
  platforms: PlatformType[];
  scheduledTime: Date;
  priority: PublishingPriority;
  status: PublishingStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  retryCount: number;
  maxRetries: number;
  metadata: {
    hashtags: string[];
    mentions: string[];
    images: string[];
    videos: string[];
    author: string;
    campaign?: string;
  };
  results: PlatformPublishResult[];
  error?: string;
}

export interface PlatformPublishResult {
  platform: PlatformType;
  status: "success" | "failed" | "pending";
  publishedAt?: Date;
  postId?: string;
  url?: string;
  error?: string;
  metrics?: {
    reach?: number;
    engagement?: number;
    clicks?: number;
  };
}

export interface QueueStatistics {
  totalPosts: number;
  pendingPosts: number;
  scheduledPosts: number;
  publishedToday: number;
  failedPosts: number;
  retryingPosts: number;
  averageProcessingTime: number;
  successRate: number;
  queueHealth: "excellent" | "good" | "warning" | "critical";
}

export interface SchedulingConfig {
  maxConcurrentPublishing: number;
  defaultRetryAttempts: number;
  retryDelayMs: number;
  processingIntervalMs: number;
  priorityWeights: Record<PublishingPriority, number>;
  platformLimits: Record<
    PlatformType,
    {
      maxPerHour: number;
      maxPerDay: number;
      cooldownMs: number;
    }
  >;
}

export class PublishingQueueEngine {
  private queue: PublishingItem[] = [];
  private processing: Set<string> = new Set();
  private statistics: QueueStatistics;
  private config: SchedulingConfig;
  private isRunning = false;
  private processingInterval?: NodeJS.Timeout;

  constructor(config?: Partial<SchedulingConfig>) {
    this.config = {
      maxConcurrentPublishing: 5,
      defaultRetryAttempts: 3,
      retryDelayMs: 60000, // 1 minute
      processingIntervalMs: 10000, // 10 seconds
      priorityWeights: {
        urgent: 100,
        high: 75,
        medium: 50,
        low: 25,
      },
      platformLimits: {
        linkedin: { maxPerHour: 20, maxPerDay: 100, cooldownMs: 180000 }, // 3 min
        twitter: { maxPerHour: 100, maxPerDay: 500, cooldownMs: 30000 }, // 30 sec
        facebook: { maxPerHour: 25, maxPerDay: 150, cooldownMs: 120000 }, // 2 min
        instagram: { maxPerHour: 10, maxPerDay: 50, cooldownMs: 300000 }, // 5 min
        email: { maxPerHour: 500, maxPerDay: 2000, cooldownMs: 1000 }, // 1 sec
        blog: { maxPerHour: 5, maxPerDay: 20, cooldownMs: 600000 }, // 10 min
      },
      ...config,
    };

    this.statistics = {
      totalPosts: 0,
      pendingPosts: 0,
      scheduledPosts: 0,
      publishedToday: 0,
      failedPosts: 0,
      retryingPosts: 0,
      averageProcessingTime: 0,
      successRate: 0,
      queueHealth: "excellent",
    };
  }

  /**
   * Add item to publishing queue
   */
  async addToQueue(
    item: Omit<
      PublishingItem,
      "id" | "createdAt" | "updatedAt" | "status" | "retryCount" | "results"
    >
  ): Promise<string> {
    const queueItem: PublishingItem = {
      ...item,
      id: this.generateId(),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: this.config.defaultRetryAttempts,
      results: [],
    };

    // Insert item at correct position based on priority and scheduled time
    const insertIndex = this.findInsertPosition(queueItem);
    this.queue.splice(insertIndex, 0, queueItem);

    this.updateStatistics();
    console.log(
      `[PublishingQueue] Added item ${queueItem.id} to queue at position ${insertIndex}`
    );

    return queueItem.id;
  }

  /**
   * Remove item from queue
   */
  async removeFromQueue(itemId: string): Promise<boolean> {
    const index = this.queue.findIndex(item => item.id === itemId);
    if (index === -1) return false;

    const item = this.queue[index];
    if (this.processing.has(itemId)) {
      item.status = "cancelled";
      this.processing.delete(itemId);
    } else {
      this.queue.splice(index, 1);
    }

    this.updateStatistics();
    console.log(`[PublishingQueue] Removed item ${itemId} from queue`);
    return true;
  }

  /**
   * Update item priority
   */
  async updateItemPriority(
    itemId: string,
    newPriority: PublishingPriority
  ): Promise<boolean> {
    const item = this.queue.find(item => item.id === itemId);
    if (!item || this.processing.has(itemId)) return false;

    // Remove and re-insert at correct position
    const index = this.queue.findIndex(item => item.id === itemId);
    this.queue.splice(index, 1);

    item.priority = newPriority;
    item.updatedAt = new Date();

    const newIndex = this.findInsertPosition(item);
    this.queue.splice(newIndex, 0, item);

    console.log(
      `[PublishingQueue] Updated priority for ${itemId} to ${newPriority}`
    );
    return true;
  }

  /**
   * Start queue processing
   */
  async startProcessing(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log("[PublishingQueue] Starting queue processing...");

    this.processingInterval = setInterval(async () => {
      await this.processQueue();
    }, this.config.processingIntervalMs);

    // Initial processing
    await this.processQueue();
  }

  /**
   * Stop queue processing
   */
  async stopProcessing(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }

    console.log("[PublishingQueue] Stopped queue processing");
  }

  /**
   * Get queue statistics
   */
  getStatistics(): QueueStatistics {
    this.updateStatistics();
    return { ...this.statistics };
  }

  /**
   * Get queue items with filtering
   */
  getQueueItems(filter?: {
    status?: PublishingStatus[];
    platform?: PlatformType;
    priority?: PublishingPriority[];
    limit?: number;
  }): PublishingItem[] {
    let items = [...this.queue];

    if (filter?.status) {
      items = items.filter(item => filter.status!.includes(item.status));
    }

    if (filter?.platform) {
      items = items.filter(item => item.platforms.includes(filter.platform!));
    }

    if (filter?.priority) {
      items = items.filter(item => filter.priority!.includes(item.priority));
    }

    if (filter?.limit) {
      items = items.slice(0, filter.limit);
    }

    return items;
  }

  /**
   * Get today's published posts count
   */
  getTodayPublishedCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.queue.filter(
      item =>
        item.status === "published" &&
        item.publishedAt &&
        item.publishedAt >= today
    ).length;
  }

  /**
   * Emergency stop - cancel all pending operations
   */
  async emergencyStop(): Promise<void> {
    console.log("[PublishingQueue] EMERGENCY STOP - Cancelling all operations");

    await this.stopProcessing();

    // Cancel all processing items
    for (const itemId of this.processing) {
      const item = this.queue.find(item => item.id === itemId);
      if (item) {
        item.status = "cancelled";
        item.updatedAt = new Date();
      }
    }

    this.processing.clear();
    this.updateStatistics();
  }

  /**
   * Process queue items
   */
  private async processQueue(): Promise<void> {
    if (this.processing.size >= this.config.maxConcurrentPublishing) {
      return; // At capacity
    }

    const now = new Date();
    const itemsToProcess = this.queue
      .filter(
        item =>
          !this.processing.has(item.id) &&
          (item.status === "pending" || item.status === "scheduled") &&
          item.scheduledTime <= now
      )
      .sort((a, b) => this.compareItems(a, b))
      .slice(0, this.config.maxConcurrentPublishing - this.processing.size);

    for (const item of itemsToProcess) {
      await this.processItem(item);
    }
  }

  /**
   * Process individual item
   */
  private async processItem(item: PublishingItem): Promise<void> {
    this.processing.add(item.id);
    item.status = "processing";
    item.updatedAt = new Date();

    try {
      console.log(
        `[PublishingQueue] Processing item ${item.id} for platforms: ${item.platforms.join(", ")}`
      );

      // Simulate publishing to platforms
      const results: PlatformPublishResult[] = [];

      for (const platform of item.platforms) {
        const result = await this.publishToPlatform(item, platform);
        results.push(result);
      }

      item.results = results;
      const allSuccessful = results.every(r => r.status === "success");

      if (allSuccessful) {
        item.status = "published";
        item.publishedAt = new Date();
        console.log(`[PublishingQueue] Successfully published item ${item.id}`);
      } else {
        await this.handleFailedPublishing(item);
      }
    } catch (error) {
      console.error(
        `[PublishingQueue] Error processing item ${item.id}:`,
        error
      );
      await this.handleFailedPublishing(
        item,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    this.processing.delete(item.id);
    item.updatedAt = new Date();
    this.updateStatistics();
  }

  /**
   * Simulate publishing to a platform
   */
  private async publishToPlatform(
    item: PublishingItem,
    platform: PlatformType
  ): Promise<PlatformPublishResult> {
    // Check platform limits
    if (!this.checkPlatformLimits(platform)) {
      return {
        platform,
        status: "failed",
        error: "Platform rate limit exceeded",
      };
    }

    // Simulate API call with random success/failure
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      return {
        platform,
        status: "success",
        publishedAt: new Date(),
        postId: `${platform}_${Date.now()}`,
        url: `https://${platform}.com/post/${Date.now()}`,
        metrics: {
          reach: Math.floor(Math.random() * 10000),
          engagement: Math.floor(Math.random() * 500),
          clicks: Math.floor(Math.random() * 100),
        },
      };
    } else {
      return {
        platform,
        status: "failed",
        error: "Platform API error",
      };
    }
  }

  /**
   * Handle failed publishing with retry logic
   */
  private async handleFailedPublishing(
    item: PublishingItem,
    error?: string
  ): Promise<void> {
    if (error) {
      item.error = error;
    }

    if (item.retryCount < item.maxRetries) {
      item.retryCount++;
      item.status = "retrying";

      // Schedule retry with exponential backoff
      const retryDelay =
        this.config.retryDelayMs * Math.pow(2, item.retryCount - 1);
      item.scheduledTime = new Date(Date.now() + retryDelay);

      console.log(
        `[PublishingQueue] Scheduling retry ${item.retryCount}/${item.maxRetries} for item ${item.id} in ${retryDelay}ms`
      );
    } else {
      item.status = "failed";
      console.error(
        `[PublishingQueue] Item ${item.id} failed permanently after ${item.retryCount} retries`
      );
    }
  }

  /**
   * Check if platform limits allow publishing
   */
  private checkPlatformLimits(platform: PlatformType): boolean {
    const limits = this.config.platformLimits[platform];
    const now = new Date();

    // Check hourly limit
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentPosts = this.queue.filter(
      item =>
        item.status === "published" &&
        item.platforms.includes(platform) &&
        item.publishedAt &&
        item.publishedAt >= hourAgo
    );

    return recentPosts.length < limits.maxPerHour;
  }

  /**
   * Find correct insert position based on priority and scheduled time
   */
  private findInsertPosition(item: PublishingItem): number {
    for (let i = 0; i < this.queue.length; i++) {
      if (this.compareItems(item, this.queue[i]) < 0) {
        return i;
      }
    }
    return this.queue.length;
  }

  /**
   * Compare items for sorting (lower value = higher priority)
   */
  private compareItems(a: PublishingItem, b: PublishingItem): number {
    // First by priority weight
    const aPriority = this.config.priorityWeights[a.priority];
    const bPriority = this.config.priorityWeights[b.priority];

    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher weight first
    }

    // Then by scheduled time
    return a.scheduledTime.getTime() - b.scheduledTime.getTime();
  }

  /**
   * Update queue statistics
   */
  private updateStatistics(): void {
    const total = this.queue.length;
    const pending = this.queue.filter(item => item.status === "pending").length;
    const scheduled = this.queue.filter(
      item => item.status === "scheduled"
    ).length;
    const failed = this.queue.filter(item => item.status === "failed").length;
    const retrying = this.queue.filter(
      item => item.status === "retrying"
    ).length;
    const published = this.queue.filter(
      item => item.status === "published"
    ).length;

    const successRate = total > 0 ? (published / total) * 100 : 100;

    let queueHealth: QueueStatistics["queueHealth"] = "excellent";
    if (successRate < 50) queueHealth = "critical";
    else if (successRate < 75) queueHealth = "warning";
    else if (successRate < 90) queueHealth = "good";

    this.statistics = {
      totalPosts: total,
      pendingPosts: pending,
      scheduledPosts: scheduled,
      publishedToday: this.getTodayPublishedCount(),
      failedPosts: failed,
      retryingPosts: retrying,
      averageProcessingTime: 2500, // Mock value
      successRate,
      queueHealth,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export default instance
export const publishingQueueEngine = new PublishingQueueEngine();
