import { logger } from "../logger";
import {
  BlotatoClient,
  createBlotatoClient,
  type BlotatoConfig,
} from "./blotato-client";
import {
  loadBlotatoConfig,
  validateBlotatoConfig,
  type BlotatoIntegrationConfig,
  type AccountConfig,
} from "./blotato-config";
import {
  BlatatoPlatformManager,
  createBlatatoPlatformManager,
  type MultiPlatformPostRequest,
  type MultiPlatformPublishResult,
  type ContentItem,
} from "../publishing/blotato-platform-manager";

// Integration Service Configuration
export interface BlotatoIntegrationServiceConfig {
  autoInitialize?: boolean;
  enableHealthCheck?: boolean;
  healthCheckInterval?: number; // milliseconds
  enableAnalytics?: boolean;
  enableRetryLogic?: boolean;
  defaultAccounts?: Record<string, AccountConfig>;
}

// Service Status
export interface BlotatoServiceStatus {
  isInitialized: boolean;
  isHealthy: boolean;
  lastHealthCheck?: Date;
  connectedAccounts: number;
  supportedPlatforms: string[];
  rateLimitStatus?: {
    remaining: number;
    resetTime?: Date;
  };
  errors: string[];
}

// Publishing Statistics
export interface BlotatoPublishingStats {
  totalPublished: number;
  successfulPublished: number;
  failedPublished: number;
  platformBreakdown: Record<
    string,
    {
      successful: number;
      failed: number;
      lastPublished?: Date;
    }
  >;
  averagePublishTime: number;
  lastPublishSession?: {
    timestamp: Date;
    platforms: string[];
    success: boolean;
  };
}

// Main Integration Service
export class BlotatoIntegrationService {
  private client?: BlotatoClient;
  private platformManager?: BlatatoPlatformManager;
  private config?: BlotatoIntegrationConfig;
  private serviceConfig: BlotatoIntegrationServiceConfig;
  private isInitialized = false;
  private healthCheckTimer?: NodeJS.Timeout;
  private stats: BlotatoPublishingStats = {
    totalPublished: 0,
    successfulPublished: 0,
    failedPublished: 0,
    platformBreakdown: {},
    averagePublishTime: 0,
  };

  constructor(serviceConfig: BlotatoIntegrationServiceConfig = {}) {
    this.serviceConfig = {
      autoInitialize: true,
      enableHealthCheck: true,
      healthCheckInterval: 300000, // 5 minutes
      enableAnalytics: true,
      enableRetryLogic: true,
      ...serviceConfig,
    };

    logger.info("Blotato Integration Service created", {
      autoInitialize: this.serviceConfig.autoInitialize,
      enableHealthCheck: this.serviceConfig.enableHealthCheck,
    });

    if (this.serviceConfig.autoInitialize) {
      this.initialize().catch(error => {
        logger.error("Auto-initialization failed", { error });
      });
    }
  }

  // Initialization
  async initialize(
    configSource?: "env" | Partial<BlotatoIntegrationConfig>
  ): Promise<void> {
    try {
      logger.info("Initializing Blotato Integration Service");

      // Load configuration
      this.config = loadBlotatoConfig(configSource);
      validateBlotatoConfig(this.config);

      // Initialize client
      this.client = createBlotatoClient(this.config.api);

      // Initialize platform manager
      this.platformManager = createBlatatoPlatformManager(this.client);

      // Health check
      if (this.serviceConfig.enableHealthCheck) {
        await this.performHealthCheck();
        this.startHealthCheckTimer();
      }

      this.isInitialized = true;
      logger.info("Blotato Integration Service initialized successfully", {
        supportedPlatforms: this.platformManager.getSupportedPlatforms(),
        accountsConfigured: this.config.accounts.length,
      });
    } catch (error) {
      logger.error("Failed to initialize Blotato Integration Service", {
        error,
      });
      throw error;
    }
  }

  // Health Management
  private async performHealthCheck(): Promise<boolean> {
    if (!this.client) {
      logger.warn("Health check failed: Client not initialized");
      return false;
    }

    try {
      const isHealthy = await this.client.healthCheck();
      logger.debug("Health check completed", { isHealthy });
      return isHealthy;
    } catch (error) {
      logger.error("Health check error", { error });
      return false;
    }
  }

  private startHealthCheckTimer(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.serviceConfig.healthCheckInterval);
  }

  // Publishing Operations
  async publishToMultiplePlatforms(
    content: ContentItem,
    platforms: string[],
    options: {
      scheduledTime?: string;
      enableOptimization?: boolean;
      failureHandling?: "stop-on-first-failure" | "continue-on-failure";
    } = {}
  ): Promise<MultiPlatformPublishResult> {
    this.ensureInitialized();

    const startTime = Date.now();

    // Map platform names to account IDs
    const accounts: Record<string, string> = {};
    const pageIds: Record<string, string> = {};

    for (const platform of platforms) {
      const account = this.config!.accounts.find(
        acc => acc.platform === platform && acc.isActive
      );
      if (account) {
        accounts[platform] = account.id;
        if (account.pageId) {
          pageIds[platform] = account.pageId;
        }
      }
    }

    const request: MultiPlatformPostRequest = {
      content,
      platforms: platforms as any[],
      accounts,
      pageIds: Object.keys(pageIds).length > 0 ? pageIds : undefined,
      scheduledTime: options.scheduledTime,
      options: {
        enableContentOptimization: options.enableOptimization ?? true,
        failureHandling: options.failureHandling ?? "continue-on-failure",
      },
    };

    try {
      const result =
        await this.platformManager!.publishToMultiplePlatforms(request);

      // Update statistics
      if (this.serviceConfig.enableAnalytics) {
        this.updateStats(result, Date.now() - startTime);
      }

      logger.info("Multi-platform publishing completed", {
        contentId: content.id,
        totalPlatforms: result.totalPlatforms,
        successful: result.successfulPlatforms,
        failed: result.failedPlatforms,
        duration: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      logger.error("Multi-platform publishing failed", {
        contentId: content.id,
        platforms,
        error,
      });
      throw error;
    }
  }

  async publishTextPost(
    text: string,
    platforms: string[],
    options: {
      hashtags?: string[];
      mentions?: string[];
      scheduledTime?: string;
    } = {}
  ): Promise<MultiPlatformPublishResult> {
    const content: ContentItem = {
      id: `text_${Date.now()}`,
      text,
      hashtags: options.hashtags,
      mentions: options.mentions,
    };

    return this.publishToMultiplePlatforms(content, platforms, {
      scheduledTime: options.scheduledTime,
    });
  }

  async publishImagePost(
    text: string,
    imageUrls: string[],
    platforms: string[],
    options: {
      hashtags?: string[];
      mentions?: string[];
      scheduledTime?: string;
    } = {}
  ): Promise<MultiPlatformPublishResult> {
    const content: ContentItem = {
      id: `image_${Date.now()}`,
      text,
      mediaUrls: imageUrls,
      hashtags: options.hashtags,
      mentions: options.mentions,
    };

    return this.publishToMultiplePlatforms(content, platforms, {
      scheduledTime: options.scheduledTime,
    });
  }

  // Video Creation and Publishing
  async createAndPublishVideoPost(
    script: string,
    platforms: string[],
    options: {
      voiceId?: string;
      style?: string;
      aspectRatio?: "16:9" | "9:16" | "1:1";
      scheduledTime?: string;
      waitForCompletion?: boolean;
      maxWaitTime?: number;
    } = {}
  ): Promise<MultiPlatformPublishResult & { videoUrl?: string }> {
    this.ensureInitialized();

    try {
      // Create video
      const videoCreation = await this.client!.createVideo({
        script,
        voiceId: options.voiceId,
        style: options.style,
        aspectRatio: options.aspectRatio || "16:9",
        includeSubtitles: true,
      });

      let videoUrl: string | undefined;

      if (options.waitForCompletion ?? true) {
        const completedVideo = await this.client!.waitForVideoCompletion(
          videoCreation.id,
          options.maxWaitTime
        );
        videoUrl = completedVideo.url;
      }

      // Create content with video
      const content: ContentItem = {
        id: `video_${Date.now()}`,
        text: script,
        mediaUrls: videoUrl ? [videoUrl] : [],
      };

      const result = await this.publishToMultiplePlatforms(content, platforms, {
        scheduledTime: options.scheduledTime,
      });

      return {
        ...result,
        videoUrl,
      };
    } catch (error) {
      logger.error("Video creation and publishing failed", {
        script: script.substring(0, 100),
        platforms,
        error,
      });
      throw error;
    }
  }

  // Service Status and Information
  getServiceStatus(): BlotatoServiceStatus {
    const status: BlotatoServiceStatus = {
      isInitialized: this.isInitialized,
      isHealthy: false,
      connectedAccounts:
        this.config?.accounts.filter(acc => acc.isActive).length || 0,
      supportedPlatforms: this.platformManager?.getSupportedPlatforms() || [],
      errors: [],
    };

    if (this.client) {
      const rateLimitInfo = this.client.getRateLimitInfo();
      if (rateLimitInfo) {
        status.rateLimitStatus = {
          remaining: rateLimitInfo.remaining,
          resetTime: rateLimitInfo.resetTime,
        };
      }
      status.isHealthy = !this.client.isRateLimited();
    }

    return status;
  }

  getPublishingStats(): BlotatoPublishingStats {
    return { ...this.stats };
  }

  getSupportedPlatforms(): string[] {
    return this.platformManager?.getSupportedPlatforms() || [];
  }

  getConnectedAccounts(): AccountConfig[] {
    return this.config?.accounts.filter(acc => acc.isActive) || [];
  }

  // Utility Methods
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.client || !this.platformManager) {
      throw new Error(
        "Blotato Integration Service not initialized. Call initialize() first."
      );
    }
  }

  private updateStats(
    result: MultiPlatformPublishResult,
    duration: number
  ): void {
    this.stats.totalPublished += result.totalPlatforms;
    this.stats.successfulPublished += result.successfulPlatforms;
    this.stats.failedPublished += result.failedPlatforms;

    // Update platform breakdown
    for (const platformResult of result.results) {
      const platform = platformResult.platform;
      if (!this.stats.platformBreakdown[platform]) {
        this.stats.platformBreakdown[platform] = { successful: 0, failed: 0 };
      }

      if (platformResult.success) {
        this.stats.platformBreakdown[platform].successful++;
        this.stats.platformBreakdown[platform].lastPublished = new Date();
      } else {
        this.stats.platformBreakdown[platform].failed++;
      }
    }

    // Update average publish time
    const totalOperations = this.stats.totalPublished;
    this.stats.averagePublishTime =
      (this.stats.averagePublishTime *
        (totalOperations - result.totalPlatforms) +
        duration) /
      totalOperations;

    // Update last session
    this.stats.lastPublishSession = {
      timestamp: result.publishedAt,
      platforms: result.results.map(r => r.platform),
      success: result.success,
    };
  }

  // Cleanup
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    this.isInitialized = false;
    this.client = undefined;
    this.platformManager = undefined;
    this.config = undefined;

    logger.info("Blotato Integration Service destroyed");
  }
}

// Singleton instance for global access
let globalBlotatoService: BlotatoIntegrationService | undefined;

export function getBlotatoService(): BlotatoIntegrationService {
  if (!globalBlotatoService) {
    globalBlotatoService = new BlotatoIntegrationService();
  }
  return globalBlotatoService;
}

export function createBlotatoIntegrationService(
  config?: BlotatoIntegrationServiceConfig
): BlotatoIntegrationService {
  return new BlotatoIntegrationService(config);
}

// Utility functions for quick access
export async function quickPublishText(
  text: string,
  platforms: string[],
  options?: { hashtags?: string[]; scheduledTime?: string }
): Promise<MultiPlatformPublishResult> {
  const service = getBlotatoService();
  return service.publishTextPost(text, platforms, options);
}

export async function quickPublishImage(
  text: string,
  imageUrls: string[],
  platforms: string[],
  options?: { hashtags?: string[]; scheduledTime?: string }
): Promise<MultiPlatformPublishResult> {
  const service = getBlotatoService();
  return service.publishImagePost(text, imageUrls, platforms, options);
}

export async function quickCreateVideo(
  script: string,
  platforms: string[],
  options?: { voiceId?: string; scheduledTime?: string }
): Promise<MultiPlatformPublishResult & { videoUrl?: string }> {
  const service = getBlotatoService();
  return service.createAndPublishVideoPost(script, platforms, options);
}

export default BlotatoIntegrationService;
