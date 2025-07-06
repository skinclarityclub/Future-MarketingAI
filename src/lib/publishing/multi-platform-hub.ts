// Multi-Platform Publishing Hub
// Simultaneous publishing naar alle platforms met intelligent retry en platform-specific API integration

import { PlatformType, PublishingItem, PublishingStatus } from "./queue-engine";
import {
  OptimizedContent,
  ContentOptimizationPipeline,
} from "./content-optimization";

export interface PlatformCredentials {
  platform: PlatformType;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  webhookUrl?: string;
  customFields?: Record<string, any>;
  isActive: boolean;
  lastValidated: Date;
  rateLimits: {
    requestsPerHour: number;
    requestsPerDay: number;
    currentHourlyCount: number;
    currentDailyCount: number;
    resetTime: Date;
  };
}

export interface PublishResult {
  platform: PlatformType;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  errorCode?: string;
  retryable: boolean;
  publishedAt?: Date;
  metadata: {
    responseTime: number;
    rateLimitRemaining: number;
    engagement?: {
      likes: number;
      shares: number;
      comments: number;
      views: number;
    };
  };
}

export interface BatchPublishResult {
  publishingItemId: string;
  totalPlatforms: number;
  successfulPlatforms: number;
  failedPlatforms: number;
  results: Map<PlatformType, PublishResult>;
  overallSuccess: boolean;
  publishedAt: Date;
  processingTime: number;
}

export interface PlatformAPI {
  platform: PlatformType;
  isConnected(): Promise<boolean>;
  validateCredentials(): Promise<boolean>;
  publish(content: OptimizedContent): Promise<PublishResult>;
  updatePost(postId: string, content: OptimizedContent): Promise<PublishResult>;
  deletePost(postId: string): Promise<boolean>;
  getPostMetrics(postId: string): Promise<any>;
  getRateLimits(): Promise<{ remaining: number; resetTime: Date }>;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrorCodes: string[];
}

export interface PublishingHubConfig {
  maxConcurrentPublishing: number;
  defaultRetryConfig: RetryConfig;
  enableFailureRecovery: boolean;
  enableAnalytics: boolean;
  webhookUrl?: string;
  enableWebhooks: boolean;
}

export class MultiPlatformPublishingHub {
  private platformAPIs: Map<PlatformType, PlatformAPI>;
  private credentials: Map<PlatformType, PlatformCredentials>;
  private optimizationPipeline: ContentOptimizationPipeline;
  private config: PublishingHubConfig;
  private publishingQueue: Map<string, PublishingItem>;
  private retryQueue: Map<
    string,
    { item: PublishingItem; retryCount: number; nextRetry: Date }
  >;
  private activePublishing: Set<string>;

  constructor(config?: Partial<PublishingHubConfig>) {
    this.config = {
      maxConcurrentPublishing: 5,
      defaultRetryConfig: {
        maxRetries: 3,
        initialDelayMs: 60000, // 1 minute
        maxDelayMs: 900000, // 15 minutes
        backoffMultiplier: 2,
        retryableErrorCodes: [
          "RATE_LIMIT",
          "TEMPORARY_ERROR",
          "NETWORK_ERROR",
          "TIMEOUT",
        ],
      },
      enableFailureRecovery: true,
      enableAnalytics: true,
      enableWebhooks: false,
      ...config,
    };

    this.platformAPIs = new Map();
    this.credentials = new Map();
    this.optimizationPipeline = new ContentOptimizationPipeline();
    this.publishingQueue = new Map();
    this.retryQueue = new Map();
    this.activePublishing = new Set();

    this.initializePlatformAPIs();
    this.initializeDefaultCredentials();
    this.startRetryProcessor();
  }

  /**
   * Publish content to multiple platforms simultaneously
   */
  async publishToMultiplePlatforms(
    publishingItem: PublishingItem,
    platforms: PlatformType[]
  ): Promise<BatchPublishResult> {
    const startTime = Date.now();
    console.log(
      `[MultiPlatformHub] Starting batch publish for item ${publishingItem.id} to ${platforms.length} platforms`
    );

    // Check if already publishing
    if (this.activePublishing.has(publishingItem.id)) {
      throw new Error(
        `Publishing item ${publishingItem.id} is already being processed`
      );
    }

    this.activePublishing.add(publishingItem.id);

    try {
      // Validate platforms and credentials
      const validPlatforms = await this.validatePlatforms(platforms);
      if (validPlatforms.length === 0) {
        throw new Error("No valid platforms with credentials found");
      }

      // Optimize content for each platform
      const optimizedContent =
        await this.optimizationPipeline.optimizeForPlatforms(
          {
            id: publishingItem.contentId,
            title: publishingItem.title,
            content: publishingItem.content,
            author: publishingItem.metadata.author,
            campaign: publishingItem.metadata.campaign,
            originalFormat: "text",
            metadata: {
              images: publishingItem.metadata.images,
              videos: publishingItem.metadata.videos,
              links: publishingItem.metadata.links || [],
              mentions: publishingItem.metadata.mentions,
              hashtags: publishingItem.metadata.hashtags,
              keywords: [],
            },
            createdAt: publishingItem.createdAt,
            updatedAt: publishingItem.updatedAt,
          },
          validPlatforms
        );

      // Publish to platforms in parallel
      const publishPromises = validPlatforms.map(platform =>
        this.publishToPlatform(platform, optimizedContent.get(platform)!)
      );

      const results = await Promise.allSettled(publishPromises);
      const platformResults = new Map<PlatformType, PublishResult>();

      // Process results
      let successfulPlatforms = 0;
      let failedPlatforms = 0;

      results.forEach((result, index) => {
        const platform = validPlatforms[index];

        if (result.status === "fulfilled") {
          platformResults.set(platform, result.value);
          if (result.value.success) {
            successfulPlatforms++;
          } else {
            failedPlatforms++;
            // Add to retry queue if retryable
            if (result.value.retryable && this.config.enableFailureRecovery) {
              this.addToRetryQueue(publishingItem, platform);
            }
          }
        } else {
          // Handle rejected promise
          const errorResult: PublishResult = {
            platform,
            success: false,
            error: result.reason?.message || "Unknown error",
            retryable: true,
            metadata: {
              responseTime: 0,
              rateLimitRemaining: 0,
            },
          };
          platformResults.set(platform, errorResult);
          failedPlatforms++;

          if (this.config.enableFailureRecovery) {
            this.addToRetryQueue(publishingItem, platform);
          }
        }
      });

      const batchResult: BatchPublishResult = {
        publishingItemId: publishingItem.id,
        totalPlatforms: validPlatforms.length,
        successfulPlatforms,
        failedPlatforms,
        results: platformResults,
        overallSuccess: successfulPlatforms > 0,
        publishedAt: new Date(),
        processingTime: Date.now() - startTime,
      };

      // Send webhook if enabled
      if (this.config.enableWebhooks && this.config.webhookUrl) {
        this.sendWebhook("batch_publish_completed", batchResult);
      }

      console.log(
        `[MultiPlatformHub] Batch publish completed: ${successfulPlatforms}/${validPlatforms.length} successful`
      );
      return batchResult;
    } finally {
      this.activePublishing.delete(publishingItem.id);
    }
  }

  /**
   * Publish to single platform
   */
  async publishToPlatform(
    platform: PlatformType,
    optimizedContent: OptimizedContent
  ): Promise<PublishResult> {
    const startTime = Date.now();

    try {
      console.log(`[MultiPlatformHub] Publishing to ${platform}`);

      // Check credentials
      const credentials = this.credentials.get(platform);
      if (!credentials || !credentials.isActive) {
        return {
          platform,
          success: false,
          error: "Platform credentials not configured or inactive",
          retryable: false,
          metadata: {
            responseTime: Date.now() - startTime,
            rateLimitRemaining: 0,
          },
        };
      }

      // Check rate limits
      if (!this.checkRateLimit(credentials)) {
        return {
          platform,
          success: false,
          error: "Rate limit exceeded",
          errorCode: "RATE_LIMIT",
          retryable: true,
          metadata: {
            responseTime: Date.now() - startTime,
            rateLimitRemaining: 0,
          },
        };
      }

      // Get platform API
      const api = this.platformAPIs.get(platform);
      if (!api) {
        return {
          platform,
          success: false,
          error: "Platform API not available",
          retryable: false,
          metadata: {
            responseTime: Date.now() - startTime,
            rateLimitRemaining: 0,
          },
        };
      }

      // Attempt to publish
      const result = await api.publish(optimizedContent);

      // Update rate limit counters
      this.updateRateLimit(credentials);

      return {
        ...result,
        metadata: {
          ...result.metadata,
          responseTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error(
        `[MultiPlatformHub] Error publishing to ${platform}:`,
        error
      );

      return {
        platform,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorCode: "UNKNOWN_ERROR",
        retryable: true,
        metadata: {
          responseTime: Date.now() - startTime,
          rateLimitRemaining: 0,
        },
      };
    }
  }

  /**
   * Add platform credentials
   */
  async addPlatformCredentials(
    credentials: PlatformCredentials
  ): Promise<boolean> {
    try {
      // Validate credentials
      const api = this.platformAPIs.get(credentials.platform);
      if (api) {
        // Mock validation - in production, actually validate with platform API
        credentials.isActive = true;
        credentials.lastValidated = new Date();
      }

      this.credentials.set(credentials.platform, credentials);
      console.log(
        `[MultiPlatformHub] Added credentials for ${credentials.platform}`
      );
      return true;
    } catch (error) {
      console.error(
        `[MultiPlatformHub] Failed to add credentials for ${credentials.platform}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get publishing statistics
   */
  getPublishingStatistics(): {
    totalPublished: number;
    successRate: number;
    platformStats: Map<
      PlatformType,
      { published: number; failed: number; successRate: number }
    >;
    retryQueueSize: number;
    activePublishing: number;
  } {
    // Mock statistics - in production, track these metrics
    const platformStats = new Map<
      PlatformType,
      { published: number; failed: number; successRate: number }
    >();

    for (const platform of this.platformAPIs.keys()) {
      const published = Math.floor(Math.random() * 100) + 50;
      const failed = Math.floor(Math.random() * 10) + 1;
      platformStats.set(platform, {
        published,
        failed,
        successRate: (published / (published + failed)) * 100,
      });
    }

    const totalPublished = Array.from(platformStats.values()).reduce(
      (sum, stats) => sum + stats.published,
      0
    );
    const totalFailed = Array.from(platformStats.values()).reduce(
      (sum, stats) => sum + stats.failed,
      0
    );

    return {
      totalPublished,
      successRate:
        totalPublished > 0
          ? (totalPublished / (totalPublished + totalFailed)) * 100
          : 0,
      platformStats,
      retryQueueSize: this.retryQueue.size,
      activePublishing: this.activePublishing.size,
    };
  }

  /**
   * Get failed posts for manual review
   */
  getFailedPosts(): Array<{
    publishingItem: PublishingItem;
    platform: PlatformType;
    error: string;
    retryCount: number;
    nextRetry?: Date;
  }> {
    const failedPosts: Array<{
      publishingItem: PublishingItem;
      platform: PlatformType;
      error: string;
      retryCount: number;
      nextRetry?: Date;
    }> = [];

    for (const [id, retryData] of this.retryQueue) {
      // Mock failed post data
      failedPosts.push({
        publishingItem: retryData.item,
        platform: "linkedin", // Mock platform
        error: "Rate limit exceeded",
        retryCount: retryData.retryCount,
        nextRetry: retryData.nextRetry,
      });
    }

    return failedPosts;
  }

  /**
   * Emergency stop all publishing
   */
  async emergencyStop(): Promise<void> {
    console.log("[MultiPlatformHub] Emergency stop initiated");

    // Clear active publishing
    this.activePublishing.clear();

    // Clear retry queue
    this.retryQueue.clear();

    // Send emergency stop webhook
    if (this.config.enableWebhooks && this.config.webhookUrl) {
      this.sendWebhook("emergency_stop", { timestamp: new Date() });
    }
  }

  /**
   * Private helper methods
   */
  private async validatePlatforms(
    platforms: PlatformType[]
  ): Promise<PlatformType[]> {
    const validPlatforms: PlatformType[] = [];

    for (const platform of platforms) {
      const credentials = this.credentials.get(platform);
      const api = this.platformAPIs.get(platform);

      if (credentials && credentials.isActive && api) {
        validPlatforms.push(platform);
      } else {
        console.warn(
          `[MultiPlatformHub] Platform ${platform} not available - missing credentials or API`
        );
      }
    }

    return validPlatforms;
  }

  private checkRateLimit(credentials: PlatformCredentials): boolean {
    const now = new Date();

    // Reset counters if needed
    if (now >= credentials.rateLimits.resetTime) {
      credentials.rateLimits.currentHourlyCount = 0;
      credentials.rateLimits.currentDailyCount = 0;
      credentials.rateLimits.resetTime = new Date(
        now.getTime() + 60 * 60 * 1000
      ); // Next hour
    }

    // Check limits
    return (
      credentials.rateLimits.currentHourlyCount <
        credentials.rateLimits.requestsPerHour &&
      credentials.rateLimits.currentDailyCount <
        credentials.rateLimits.requestsPerDay
    );
  }

  private updateRateLimit(credentials: PlatformCredentials): void {
    credentials.rateLimits.currentHourlyCount++;
    credentials.rateLimits.currentDailyCount++;
  }

  private addToRetryQueue(item: PublishingItem, platform: PlatformType): void {
    const retryId = `${item.id}_${platform}`;
    const existingRetry = this.retryQueue.get(retryId);
    const retryCount = existingRetry ? existingRetry.retryCount + 1 : 1;

    if (retryCount <= this.config.defaultRetryConfig.maxRetries) {
      const delay = Math.min(
        this.config.defaultRetryConfig.initialDelayMs *
          Math.pow(
            this.config.defaultRetryConfig.backoffMultiplier,
            retryCount - 1
          ),
        this.config.defaultRetryConfig.maxDelayMs
      );

      this.retryQueue.set(retryId, {
        item,
        retryCount,
        nextRetry: new Date(Date.now() + delay),
      });

      console.log(
        `[MultiPlatformHub] Added ${platform} to retry queue for item ${item.id} (attempt ${retryCount})`
      );
    } else {
      console.log(
        `[MultiPlatformHub] Max retries reached for ${platform} item ${item.id}`
      );
    }
  }

  private startRetryProcessor(): void {
    // Process retry queue every minute
    setInterval(() => {
      this.processRetryQueue();
    }, 60000);
  }

  private async processRetryQueue(): Promise<void> {
    const now = new Date();
    const readyToRetry: Array<{ id: string; data: any }> = [];

    for (const [id, retryData] of this.retryQueue) {
      if (now >= retryData.nextRetry) {
        readyToRetry.push({ id, data: retryData });
      }
    }

    for (const { id, data } of readyToRetry) {
      this.retryQueue.delete(id);

      // Extract platform from retry ID
      const platform = id.split("_").pop() as PlatformType;

      try {
        // Retry publishing
        console.log(
          `[MultiPlatformHub] Retrying publish to ${platform} for item ${data.item.id}`
        );
        // In production, actually retry the publish operation
        // For now, just simulate success/failure
        const success = Math.random() > 0.3; // 70% success rate

        if (!success) {
          this.addToRetryQueue(data.item, platform);
        }
      } catch (error) {
        console.error(
          `[MultiPlatformHub] Retry failed for ${platform}:`,
          error
        );
        this.addToRetryQueue(data.item, platform);
      }
    }
  }

  private async sendWebhook(event: string, data: any): Promise<void> {
    if (!this.config.webhookUrl) return;

    try {
      // Mock webhook sending - in production, make actual HTTP request
      console.log(`[MultiPlatformHub] Sending webhook: ${event}`, data);
    } catch (error) {
      console.error("[MultiPlatformHub] Webhook failed:", error);
    }
  }

  private initializePlatformAPIs(): void {
    // Initialize mock platform APIs
    const platforms: PlatformType[] = [
      "linkedin",
      "twitter",
      "facebook",
      "instagram",
      "email",
      "blog",
    ];

    for (const platform of platforms) {
      this.platformAPIs.set(platform, new MockPlatformAPI(platform));
    }
  }

  private initializeDefaultCredentials(): void {
    // Initialize with mock credentials for demo
    const platforms: PlatformType[] = [
      "linkedin",
      "twitter",
      "facebook",
      "instagram",
      "email",
      "blog",
    ];

    for (const platform of platforms) {
      const credentials: PlatformCredentials = {
        platform,
        apiKey: `mock_api_key_${platform}`,
        accessToken: `mock_access_token_${platform}`,
        isActive: true,
        lastValidated: new Date(),
        rateLimits: {
          requestsPerHour:
            platform === "twitter" ? 100 : platform === "linkedin" ? 20 : 50,
          requestsPerDay:
            platform === "twitter" ? 500 : platform === "linkedin" ? 100 : 200,
          currentHourlyCount: 0,
          currentDailyCount: 0,
          resetTime: new Date(Date.now() + 60 * 60 * 1000),
        },
      };

      this.credentials.set(platform, credentials);
    }
  }
}

/**
 * Mock Platform API implementation for demo purposes
 */
class MockPlatformAPI implements PlatformAPI {
  constructor(public platform: PlatformType) {}

  async isConnected(): Promise<boolean> {
    return true;
  }

  async validateCredentials(): Promise<boolean> {
    return true;
  }

  async publish(content: OptimizedContent): Promise<PublishResult> {
    // Simulate API call delay
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      return {
        platform: this.platform,
        success: true,
        postId: `${this.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        url: `https://${this.platform}.com/post/${Date.now()}`,
        publishedAt: new Date(),
        retryable: false,
        metadata: {
          responseTime: 500 + Math.random() * 1000,
          rateLimitRemaining: Math.floor(Math.random() * 50) + 10,
          engagement: {
            likes: 0,
            shares: 0,
            comments: 0,
            views: 0,
          },
        },
      };
    } else {
      const errorCodes = [
        "RATE_LIMIT",
        "TEMPORARY_ERROR",
        "NETWORK_ERROR",
        "INVALID_CONTENT",
      ];
      const errorCode =
        errorCodes[Math.floor(Math.random() * errorCodes.length)];

      return {
        platform: this.platform,
        success: false,
        error: `Mock error: ${errorCode}`,
        errorCode,
        retryable: errorCode !== "INVALID_CONTENT",
        metadata: {
          responseTime: 200 + Math.random() * 300,
          rateLimitRemaining: Math.floor(Math.random() * 50) + 10,
        },
      };
    }
  }

  async updatePost(
    postId: string,
    content: OptimizedContent
  ): Promise<PublishResult> {
    // Mock implementation
    return this.publish(content);
  }

  async deletePost(postId: string): Promise<boolean> {
    return Math.random() > 0.1; // 90% success rate
  }

  async getPostMetrics(postId: string): Promise<any> {
    return {
      likes: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 20),
      views: Math.floor(Math.random() * 1000) + 100,
    };
  }

  async getRateLimits(): Promise<{ remaining: number; resetTime: Date }> {
    return {
      remaining: Math.floor(Math.random() * 50) + 10,
      resetTime: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
}

// Export default instance
export const multiPlatformPublishingHub = new MultiPlatformPublishingHub();
