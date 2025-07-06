/**
 * Cross-Platform Content Management System
 * Task 80.8: Implement Cross-Platform Content Management
 *
 * Unified scheduling, publishing, and analytics for Instagram, LinkedIn,
 * Facebook, Twitter/X, and TikTok within the control center.
 */

import { EventEmitter } from "events";
import { MultiPlatformPublishingHub } from "@/lib/publishing/multi-platform-hub";
import { PublishingQueueEngine } from "@/lib/publishing/queue-engine";
import { AutomatedSchedulingService } from "@/lib/services/automated-scheduling-service";
import { ContentOptimizationPipeline } from "@/lib/publishing/content-optimization";
import { BlatatoPlatformManager } from "@/lib/publishing/blotato-platform-manager";
import { BlotatoClient } from "@/lib/apis/blotato-client";
import { CrossPlatformLearningEngine } from "@/lib/ml/cross-platform-learning-engine";
import { createSupabaseClient } from "@/lib/supabase/server";

export type CrossPlatformType =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "twitter"
  | "tiktok";

export type ContentType =
  | "post"
  | "story"
  | "video"
  | "image"
  | "carousel"
  | "reel"
  | "thread";

export type PublishingStrategy =
  | "immediate"
  | "scheduled"
  | "optimal-timing"
  | "cascade"
  | "synchronized";

export interface CrossPlatformContent {
  id: string;
  title?: string;
  content: string;
  contentType: ContentType;
  mediaUrls: string[];
  hashtags: string[];
  mentions: string[];
  link?: string;
  targetPlatforms: CrossPlatformType[];
  targetAudience: string[];
  campaignId?: string;
  brandVoice:
    | "professional"
    | "casual"
    | "friendly"
    | "authoritative"
    | "creative";
  publishingStrategy: PublishingStrategy;
  scheduledTime?: Date;
  platformSpecificContent: Map<CrossPlatformType, PlatformOptimizedContent>;
  status:
    | "draft"
    | "scheduled"
    | "publishing"
    | "published"
    | "failed"
    | "paused";
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  approvalRequired: boolean;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface PlatformOptimizedContent {
  platform: CrossPlatformType;
  optimizedText: string;
  optimizedHashtags: string[];
  optimizedMedia: string[];
  platformSpecificOptions: Record<string, any>;
  characterCount: number;
  estimatedReach: number;
  engagementPrediction: number;
  optimalPostingTime: Date;
}

export interface PlatformAccount {
  id: string;
  platform: CrossPlatformType;
  accountId: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  isActive: boolean;
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  permissions: string[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate: number;
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrossPlatformAnalytics {
  contentId: string;
  platform: CrossPlatformType;
  publishedAt: Date;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  clicks?: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  clickThroughRate?: number;
  costPerEngagement?: number;
  roi?: number;
  audienceData: {
    demographics: Record<string, number>;
    interests: Record<string, number>;
    locations: Record<string, number>;
  };
  performanceScore: number;
  insights: string[];
  updatedAt: Date;
}

export interface CrossPlatformCampaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetPlatforms: CrossPlatformType[];
  budget?: number;
  goals: string[];
  targetAudience: string[];
  contentIds: string[];
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  metrics: {
    totalReach: number;
    totalEngagement: number;
    totalCost: number;
    roi: number;
    conversionRate: number;
    clickThroughRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentCalendarEvent {
  id: string;
  contentId: string;
  platforms: CrossPlatformType[];
  scheduledTime: Date;
  title: string;
  status: "scheduled" | "published" | "failed" | "cancelled";
  recurringPattern?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: Date;
  };
}

export class CrossPlatformContentManager extends EventEmitter {
  private supabase = createSupabaseClient();
  private publishingHub = new MultiPlatformPublishingHub();
  private publishingQueue = new PublishingQueueEngine();
  private schedulingService = new AutomatedSchedulingService();
  private optimizationPipeline = new ContentOptimizationPipeline();
  private learningEngine = new CrossPlatformLearningEngine();

  private blotatoClient: BlotatoClient;
  private blatatoPlatformManager: BlatatoPlatformManager;

  private connectedAccounts: Map<CrossPlatformType, PlatformAccount[]> =
    new Map();
  private activeContent: Map<string, CrossPlatformContent> = new Map();
  private contentCalendar: Map<string, ContentCalendarEvent[]> = new Map();
  private campaignMetrics: Map<string, CrossPlatformCampaign> = new Map();

  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;

  constructor() {
    super();

    // Initialize Blotato integration
    this.blotatoClient = new BlotatoClient({
      apiKey: process.env.BLOTATO_API_KEY || "",
      baseUrl: process.env.BLOTATO_BASE_URL || "https://api.blotato.com",
      timeout: 30000,
      retryAttempts: 3,
    });

    this.blatatoPlatformManager = new BlatatoPlatformManager(
      this.blotatoClient
    );

    this.initializePlatformConnections();
    this.startProcessingLoop();
  }

  /**
   * Initialize platform connections and load accounts
   */
  private async initializePlatformConnections(): Promise<void> {
    try {
      const { data: accounts, error } = await this.supabase
        .from("social_accounts")
        .select("*")
        .eq("status", "connected");

      if (error) {
        console.error("[CrossPlatformManager] Error loading accounts:", error);
        return;
      }

      // Group accounts by platform
      for (const account of accounts || []) {
        const platform = account.platform as CrossPlatformType;
        if (!this.connectedAccounts.has(platform)) {
          this.connectedAccounts.set(platform, []);
        }
        this.connectedAccounts.get(platform)?.push(account);
      }

      console.log(
        `[CrossPlatformManager] Initialized with ${accounts?.length || 0} connected accounts`
      );
    } catch (error) {
      console.error(
        "[CrossPlatformManager] Error initializing platform connections:",
        error
      );
    }
  }

  /**
   * Create new cross-platform content
   */
  async createContent(contentData: {
    title?: string;
    content: string;
    contentType: ContentType;
    mediaUrls?: string[];
    hashtags?: string[];
    mentions?: string[];
    link?: string;
    targetPlatforms: CrossPlatformType[];
    targetAudience?: string[];
    campaignId?: string;
    brandVoice?: CrossPlatformContent["brandVoice"];
    publishingStrategy?: PublishingStrategy;
    scheduledTime?: Date;
    userId: string;
    approvalRequired?: boolean;
  }): Promise<CrossPlatformContent> {
    const contentId = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const content: CrossPlatformContent = {
      id: contentId,
      title: contentData.title,
      content: contentData.content,
      contentType: contentData.contentType,
      mediaUrls: contentData.mediaUrls || [],
      hashtags: contentData.hashtags || [],
      mentions: contentData.mentions || [],
      link: contentData.link,
      targetPlatforms: contentData.targetPlatforms,
      targetAudience: contentData.targetAudience || [],
      campaignId: contentData.campaignId,
      brandVoice: contentData.brandVoice || "professional",
      publishingStrategy: contentData.publishingStrategy || "scheduled",
      scheduledTime: contentData.scheduledTime,
      platformSpecificContent: new Map(),
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: contentData.userId,
      approvalRequired: contentData.approvalRequired ?? true,
    };

    // Optimize content for each platform
    await this.optimizeContentForPlatforms(content);

    // Store in database
    await this.persistContent(content);

    // Store in active content
    this.activeContent.set(contentId, content);

    this.emit("content-created", { contentId, content });

    console.log(
      `[CrossPlatformManager] Created content ${contentId} for platforms: ${contentData.targetPlatforms.join(", ")}`
    );

    return content;
  }

  /**
   * Optimize content for specific platforms
   */
  private async optimizeContentForPlatforms(
    content: CrossPlatformContent
  ): Promise<void> {
    for (const platform of content.targetPlatforms) {
      try {
        const platformConfig = this.getPlatformConfig(platform);

        // Basic optimization
        let optimizedText = content.content;
        let optimizedHashtags = [...content.hashtags];

        // Platform-specific optimizations
        switch (platform) {
          case "twitter":
            if (optimizedText.length > 280) {
              optimizedText = optimizedText.substring(0, 260) + "...";
            }
            optimizedHashtags = optimizedHashtags.slice(0, 5);
            break;

          case "linkedin":
            if (optimizedText.length > 3000) {
              optimizedText = optimizedText.substring(0, 2980) + "...";
            }
            optimizedHashtags = optimizedHashtags.slice(0, 10);
            break;

          case "instagram":
            if (optimizedText.length > 2200) {
              optimizedText = optimizedText.substring(0, 2180) + "...";
            }
            optimizedHashtags = optimizedHashtags.slice(0, 30);
            break;

          case "facebook":
            // Facebook has generous limits
            optimizedHashtags = optimizedHashtags.slice(0, 5);
            break;

          case "tiktok":
            if (optimizedText.length > 150) {
              optimizedText = optimizedText.substring(0, 130) + "...";
            }
            optimizedHashtags = optimizedHashtags.slice(0, 20);
            break;
        }

        // Get optimal posting time for platform
        const optimalTime = await this.getOptimalPostingTime(
          platform,
          content.targetAudience
        );

        // Predict engagement
        const engagementPrediction = await this.predictEngagement(
          platform,
          optimizedText,
          content.mediaUrls
        );

        const platformContent: PlatformOptimizedContent = {
          platform,
          optimizedText,
          optimizedHashtags,
          optimizedMedia: content.mediaUrls,
          platformSpecificOptions: this.getPlatformSpecificOptions(
            platform,
            content
          ),
          characterCount: optimizedText.length,
          estimatedReach: await this.estimateReach(
            platform,
            content.targetAudience
          ),
          engagementPrediction,
          optimalPostingTime: optimalTime,
        };

        content.platformSpecificContent.set(platform, platformContent);
      } catch (error) {
        console.error(
          `[CrossPlatformManager] Error optimizing for ${platform}:`,
          error
        );
      }
    }
  }

  /**
   * Schedule content for publishing
   */
  async scheduleContent(
    contentId: string,
    schedulingOptions: {
      strategy?: PublishingStrategy;
      customSchedule?: Map<CrossPlatformType, Date>;
      approvalRequired?: boolean;
    } = {}
  ): Promise<void> {
    const content = this.activeContent.get(contentId);
    if (!content) {
      throw new Error(`Content ${contentId} not found`);
    }

    const strategy = schedulingOptions.strategy || content.publishingStrategy;

    switch (strategy) {
      case "immediate":
        await this.publishImmediately(content);
        break;

      case "scheduled":
        await this.scheduleForLater(content, schedulingOptions.customSchedule);
        break;

      case "optimal-timing":
        await this.scheduleOptimalTiming(content);
        break;

      case "cascade":
        await this.scheduleCascade(content);
        break;

      case "synchronized":
        await this.scheduleSynchronized(content);
        break;
    }

    content.status = "scheduled";
    content.updatedAt = new Date();

    await this.persistContent(content);

    this.emit("content-scheduled", { contentId, strategy });

    console.log(
      `[CrossPlatformManager] Scheduled content ${contentId} with strategy: ${strategy}`
    );
  }

  /**
   * Publish content immediately to all platforms
   */
  private async publishImmediately(
    content: CrossPlatformContent
  ): Promise<void> {
    content.status = "publishing";

    const publishingPromises = content.targetPlatforms.map(platform =>
      this.publishToPlatform(content, platform)
    );

    try {
      const results = await Promise.allSettled(publishingPromises);

      let successCount = 0;
      let failCount = 0;

      results.forEach((result, index) => {
        const platform = content.targetPlatforms[index];
        if (result.status === "fulfilled") {
          successCount++;
          console.log(
            `[CrossPlatformManager] Successfully published to ${platform}`
          );
        } else {
          failCount++;
          console.error(
            `[CrossPlatformManager] Failed to publish to ${platform}:`,
            result.reason
          );
        }
      });

      content.status =
        failCount === 0
          ? "published"
          : successCount > 0
            ? "published"
            : "failed";

      this.emit("content-published", {
        contentId: content.id,
        successCount,
        failCount,
        platforms: content.targetPlatforms,
      });
    } catch (error) {
      content.status = "failed";
      console.error(
        `[CrossPlatformManager] Error in immediate publish:`,
        error
      );
    }
  }

  /**
   * Schedule content for optimal timing
   */
  private async scheduleOptimalTiming(
    content: CrossPlatformContent
  ): Promise<void> {
    for (const platform of content.targetPlatforms) {
      const platformContent = content.platformSpecificContent.get(platform);
      if (platformContent) {
        await this.addToPublishingQueue(
          content,
          platform,
          platformContent.optimalPostingTime
        );
      }
    }
  }

  /**
   * Schedule content with cascade strategy (staggered timing)
   */
  private async scheduleCascade(content: CrossPlatformContent): Promise<void> {
    const baseTime = content.scheduledTime || new Date();
    const interval = 30 * 60 * 1000; // 30 minutes between platforms

    for (let i = 0; i < content.targetPlatforms.length; i++) {
      const platform = content.targetPlatforms[i];
      const publishTime = new Date(baseTime.getTime() + i * interval);

      await this.addToPublishingQueue(content, platform, publishTime);
    }
  }

  /**
   * Schedule content synchronized across all platforms
   */
  private async scheduleSynchronized(
    content: CrossPlatformContent
  ): Promise<void> {
    const publishTime = content.scheduledTime || new Date();

    for (const platform of content.targetPlatforms) {
      await this.addToPublishingQueue(content, platform, publishTime);
    }
  }

  /**
   * Add content to publishing queue
   */
  private async addToPublishingQueue(
    content: CrossPlatformContent,
    platform: CrossPlatformType,
    publishTime: Date
  ): Promise<void> {
    const queueItem = {
      id: `${content.id}_${platform}`,
      contentId: content.id,
      platform,
      publishTime,
      priority: content.brandVoice === "urgent" ? "high" : "medium",
      retryCount: 0,
      maxRetries: 3,
      status: "pending" as const,
    };

    await this.publishingQueue.addToQueue(queueItem);

    // Also add to calendar
    if (!this.contentCalendar.has(content.id)) {
      this.contentCalendar.set(content.id, []);
    }

    this.contentCalendar.get(content.id)?.push({
      id: queueItem.id,
      contentId: content.id,
      platforms: [platform],
      scheduledTime: publishTime,
      title: content.title || content.content.substring(0, 50),
      status: "scheduled",
    });
  }

  /**
   * Publish content to specific platform
   */
  private async publishToPlatform(
    content: CrossPlatformContent,
    platform: CrossPlatformType
  ): Promise<void> {
    const platformContent = content.platformSpecificContent.get(platform);
    if (!platformContent) {
      throw new Error(`No optimized content found for platform ${platform}`);
    }

    const accounts = this.connectedAccounts.get(platform);
    if (!accounts || accounts.length === 0) {
      throw new Error(`No connected accounts found for platform ${platform}`);
    }

    // Use first active account (could be enhanced to select best account)
    const account = accounts.find(acc => acc.isActive) || accounts[0];

    try {
      // Use Blotato platform manager for publishing
      const publishResult =
        await this.blatatoPlatformManager.publishToMultiplePlatforms({
          content: {
            id: content.id,
            text: platformContent.optimizedText,
            mediaUrls: platformContent.optimizedMedia,
            hashtags: platformContent.optimizedHashtags,
            mentions: content.mentions,
            link: content.link,
          },
          platforms: [platform],
          accounts: { [platform]: account.accountId },
          options: {
            enableContentOptimization: true,
            enableHashtagOptimization: true,
            enableMediaOptimization: true,
            failureHandling: "continue-on-failure",
          },
        });

      if (publishResult.successful.includes(platform)) {
        // Store analytics data
        await this.recordPublishingAnalytics(
          content.id,
          platform,
          publishResult
        );

        this.emit("platform-published", {
          contentId: content.id,
          platform,
          accountId: account.accountId,
        });
      } else {
        throw new Error(
          `Publishing failed for ${platform}: ${publishResult.errors[platform]}`
        );
      }
    } catch (error) {
      console.error(
        `[CrossPlatformManager] Error publishing to ${platform}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get analytics for content across all platforms
   */
  /**
   * Get content by ID
   */
  getContent(contentId: string): CrossPlatformContent | undefined {
    return this.activeContent.get(contentId);
  }

  /**
   * Get all active content
   */
  getAllContent(): CrossPlatformContent[] {
    return Array.from(this.activeContent.values());
  }

  /**
   * Get connected accounts for all platforms
   */
  getConnectedAccounts(): Map<CrossPlatformType, PlatformAccount[]> {
    return this.connectedAccounts;
  }

  /**
   * Get content calendar events
   */
  getContentCalendar(): Map<string, ContentCalendarEvent[]> {
    return this.contentCalendar;
  }

  async getContentAnalytics(
    contentId: string
  ): Promise<Map<CrossPlatformType, CrossPlatformAnalytics>> {
    const analytics = new Map<CrossPlatformType, CrossPlatformAnalytics>();

    try {
      const { data, error } = await this.supabase
        .from("cross_platform_analytics")
        .select("*")
        .eq("content_id", contentId);

      if (error) {
        console.error(
          "[CrossPlatformManager] Error fetching analytics:",
          error
        );
        return analytics;
      }

      for (const record of data || []) {
        analytics.set(record.platform, record);
      }

      return analytics;
    } catch (error) {
      console.error("[CrossPlatformManager] Error getting analytics:", error);
      return analytics;
    }
  }

  /**
   * Get platform-specific optimal posting time
   */
  private async getOptimalPostingTime(
    platform: CrossPlatformType,
    targetAudience: string[]
  ): Promise<Date> {
    // Use learning engine to determine optimal time
    try {
      const insights = await this.learningEngine.generateOptimalPostingSchedule(
        [platform],
        targetAudience
      );

      const platformInsight = insights.find(
        insight => insight.platform === platform
      );
      if (platformInsight && platformInsight.optimalTimes.length > 0) {
        const now = new Date();
        const todayOptimal = platformInsight.optimalTimes[0];
        const [hours, minutes] = todayOptimal.split(":").map(Number);

        const optimalTime = new Date(now);
        optimalTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (optimalTime <= now) {
          optimalTime.setDate(optimalTime.getDate() + 1);
        }

        return optimalTime;
      }
    } catch (error) {
      console.error(
        "[CrossPlatformManager] Error getting optimal time:",
        error
      );
    }

    // Fallback to default optimal times
    const defaultOptimalHours = {
      instagram: 11, // 11 AM
      linkedin: 9, // 9 AM
      facebook: 15, // 3 PM
      twitter: 12, // 12 PM
      tiktok: 18, // 6 PM
    };

    const now = new Date();
    const optimalTime = new Date(now);
    optimalTime.setHours(defaultOptimalHours[platform] || 12, 0, 0, 0);

    if (optimalTime <= now) {
      optimalTime.setDate(optimalTime.getDate() + 1);
    }

    return optimalTime;
  }

  /**
   * Predict engagement for platform and content
   */
  private async predictEngagement(
    platform: CrossPlatformType,
    content: string,
    mediaUrls: string[]
  ): Promise<number> {
    try {
      // Use learning engine for prediction
      const prediction = await this.learningEngine.predictContentPerformance(
        { text: content, mediaUrls, platform },
        [platform]
      );

      return prediction.engagementScore || 0.5;
    } catch (error) {
      console.error(
        "[CrossPlatformManager] Error predicting engagement:",
        error
      );
      return 0.5; // Default prediction
    }
  }

  /**
   * Estimate reach for platform and audience
   */
  private async estimateReach(
    platform: CrossPlatformType,
    targetAudience: string[]
  ): Promise<number> {
    const accounts = this.connectedAccounts.get(platform);
    if (!accounts || accounts.length === 0) return 0;

    // Simple estimation based on follower count and engagement rate
    const account = accounts[0];
    const baseReach = account.followersCount * account.engagementRate;

    // Adjust for audience targeting (simplified)
    const audienceMultiplier = targetAudience.length > 0 ? 0.3 : 1.0;

    return Math.floor(baseReach * audienceMultiplier);
  }

  /**
   * Get platform-specific configuration
   */
  private getPlatformConfig(platform: CrossPlatformType) {
    const configs = {
      instagram: { maxChars: 2200, maxHashtags: 30, maxMedia: 10 },
      linkedin: { maxChars: 3000, maxHashtags: 10, maxMedia: 9 },
      facebook: { maxChars: 63206, maxHashtags: 5, maxMedia: 10 },
      twitter: { maxChars: 280, maxHashtags: 5, maxMedia: 4 },
      tiktok: { maxChars: 2200, maxHashtags: 20, maxMedia: 1 },
    };

    return configs[platform];
  }

  /**
   * Get platform-specific publishing options
   */
  private getPlatformSpecificOptions(
    platform: CrossPlatformType,
    content: CrossPlatformContent
  ) {
    const baseOptions = {
      brandVoice: content.brandVoice,
      targetAudience: content.targetAudience,
    };

    switch (platform) {
      case "instagram":
        return {
          ...baseOptions,
          aspectRatio: "1:1",
          useStories: content.contentType === "story",
          enableCommenting: true,
        };

      case "linkedin":
        return {
          ...baseOptions,
          professionalTone: true,
          industryTagging: true,
          companyMentions: content.mentions.filter(m => m.includes("company")),
        };

      case "twitter":
        return {
          ...baseOptions,
          enableThreads: content.content.length > 240,
          enableRetweets: true,
          enableReplies: true,
        };

      case "facebook":
        return {
          ...baseOptions,
          enableSharing: true,
          audienceTargeting: content.targetAudience,
          callToAction: "learn_more",
        };

      case "tiktok":
        return {
          ...baseOptions,
          musicSync: true,
          trendingHashtags: true,
          videoFormat: "vertical",
        };

      default:
        return baseOptions;
    }
  }

  /**
   * Record publishing analytics
   */
  private async recordPublishingAnalytics(
    contentId: string,
    platform: CrossPlatformType,
    publishResult: any
  ): Promise<void> {
    try {
      const analyticsData = {
        content_id: contentId,
        platform,
        published_at: new Date(),
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        impressions: 0,
        engagement_rate: 0,
        performance_score: 0.5,
        insights: ["Content published successfully"],
        updated_at: new Date(),
      };

      const { error } = await this.supabase
        .from("cross_platform_analytics")
        .insert(analyticsData);

      if (error) {
        console.error(
          "[CrossPlatformManager] Error recording analytics:",
          error
        );
      }
    } catch (error) {
      console.error("[CrossPlatformManager] Error recording analytics:", error);
    }
  }

  /**
   * Persist content to database
   */
  private async persistContent(content: CrossPlatformContent): Promise<void> {
    try {
      const contentData = {
        id: content.id,
        title: content.title,
        content: content.content,
        content_type: content.contentType,
        media_urls: content.mediaUrls,
        hashtags: content.hashtags,
        mentions: content.mentions,
        link: content.link,
        target_platforms: content.targetPlatforms,
        target_audience: content.targetAudience,
        campaign_id: content.campaignId,
        brand_voice: content.brandVoice,
        publishing_strategy: content.publishingStrategy,
        scheduled_time: content.scheduledTime,
        platform_specific_content: Object.fromEntries(
          content.platformSpecificContent
        ),
        status: content.status,
        created_at: content.createdAt,
        updated_at: content.updatedAt,
        user_id: content.userId,
        approval_required: content.approvalRequired,
        approved_at: content.approvedAt,
        approved_by: content.approvedBy,
      };

      const { error } = await this.supabase
        .from("cross_platform_content")
        .upsert(contentData);

      if (error) {
        console.error(
          "[CrossPlatformManager] Error persisting content:",
          error
        );
      }
    } catch (error) {
      console.error("[CrossPlatformManager] Error persisting content:", error);
    }
  }

  /**
   * Start processing loop for queue management
   */
  private startProcessingLoop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processScheduledContent();
      }
    }, 10000); // Process every 10 seconds
  }

  /**
   * Process scheduled content
   */
  private async processScheduledContent(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      // Process publishing queue
      await this.publishingQueue.processQueue();

      // Update calendar events
      await this.updateCalendarEvents();
    } catch (error) {
      console.error(
        "[CrossPlatformManager] Error processing scheduled content:",
        error
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Update calendar events status
   */
  private async updateCalendarEvents(): Promise<void> {
    const now = new Date();

    for (const [contentId, events] of this.contentCalendar.entries()) {
      for (const event of events) {
        if (event.status === "scheduled" && event.scheduledTime <= now) {
          // Check if content was actually published
          const analytics = await this.getContentAnalytics(contentId);
          const hasPublishedData = event.platforms.some(platform =>
            analytics.has(platform)
          );

          if (hasPublishedData) {
            event.status = "published";
          } else {
            // Check if it failed
            event.status = "failed";
          }
        }
      }
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<{
    totalContent: number;
    scheduledContent: number;
    publishedContent: number;
    failedContent: number;
    connectedPlatforms: number;
    totalAccounts: number;
    todayScheduled: number;
    weeklyEngagement: number;
  }> {
    const totalContent = this.activeContent.size;

    const statusCounts = Array.from(this.activeContent.values()).reduce(
      (acc, content) => {
        acc[content.status] = (acc[content.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const connectedPlatforms = this.connectedAccounts.size;
    const totalAccounts = Array.from(this.connectedAccounts.values()).reduce(
      (sum, accounts) => sum + accounts.length,
      0
    );

    // Count today's scheduled content
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayScheduled = Array.from(this.contentCalendar.values())
      .flat()
      .filter(
        event =>
          event.scheduledTime >= today &&
          event.scheduledTime < tomorrow &&
          event.status === "scheduled"
      ).length;

    return {
      totalContent,
      scheduledContent: statusCounts.scheduled || 0,
      publishedContent: statusCounts.published || 0,
      failedContent: statusCounts.failed || 0,
      connectedPlatforms,
      totalAccounts,
      todayScheduled,
      weeklyEngagement: 0, // Could calculate from analytics
    };
  }

  /**
   * Shutdown manager
   */
  async shutdown(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.isProcessing = false;
    this.removeAllListeners();

    console.log("[CrossPlatformManager] Shutdown completed");
  }
}

// Export singleton instance
export const crossPlatformContentManager = new CrossPlatformContentManager();
export default CrossPlatformContentManager;
