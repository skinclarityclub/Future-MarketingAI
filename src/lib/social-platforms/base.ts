// Social Platform Connectors - Base Types en Interface
// Foundation voor alle social media platform integraties

export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "tiktok";

export type PostType =
  | "text"
  | "image"
  | "video"
  | "carousel"
  | "story"
  | "reel"
  | "poll";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "failed"
  | "deleted";

export interface PlatformLimits {
  textLength: {
    max: number;
    recommended?: number;
  };
  mediaLimits: {
    images: {
      maxCount: number;
      maxSizeBytes: number;
      supportedFormats: string[];
      dimensions: {
        min: { width: number; height: number };
        max: { width: number; height: number };
        recommended?: { width: number; height: number };
      };
    };
    videos: {
      maxCount: number;
      maxSizeBytes: number;
      maxDurationSeconds: number;
      supportedFormats: string[];
      dimensions: {
        min: { width: number; height: number };
        max: { width: number; height: number };
        recommended?: { width: number; height: number };
      };
    };
  };
  hashtagLimits: {
    max: number;
    recommended: number;
  };
  rateLimit: {
    postsPerHour: number;
    postsPerDay: number;
    apiCallsPerHour: number;
  };
}

export interface AuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
  userId?: string;
  pageId?: string; // Voor Facebook/Instagram pages
  metadata?: {
    username?: string;
    displayName?: string;
    profileImage?: string;
    followerCount?: number;
  };
}

export interface PostContent {
  text?: string;
  media?: MediaItem[];
  hashtags?: string[];
  mentions?: string[];
  link?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
    placeId?: string;
  };
  scheduledTime?: Date;
  metadata?: {
    campaignId?: string;
    tags?: string[];
    priority?: "low" | "normal" | "high";
  };
}

export interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  altText?: string;
  thumbnail?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // Voor videos in seconds
  size?: number; // In bytes
  format?: string;
}

export interface PublishedPost {
  id: string;
  platformPostId: string;
  platform: SocialPlatform;
  status: PostStatus;
  content: PostContent;
  publishedAt?: Date;
  scheduledAt?: Date;
  metrics?: PostMetrics;
  errors?: PlatformError[];
  url?: string; // Link naar de geposte content
}

export interface PostMetrics {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  clicks?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
  engagementRate?: number;
  lastUpdated: Date;
}

export interface PlatformError {
  code: string;
  message: string;
  timestamp: Date;
  retryable: boolean;
  details?: any;
}

export interface RateLimitInfo {
  remaining: number;
  total: number;
  resetTime: Date;
  windowDuration: number; // in seconds
}

export interface PlatformConnectorConfig {
  platform: SocialPlatform;
  credentials: AuthCredentials;
  enableRateLimit: boolean;
  enableRetry: boolean;
  retryConfig: {
    maxAttempts: number;
    backoffMultiplier: number;
    maxBackoffSeconds: number;
  };
  logging: {
    enableDebug: boolean;
    logRequests: boolean;
    logResponses: boolean;
  };
}

/**
 * Base abstract class voor alle platform connectors
 */
export abstract class BasePlatformConnector {
  protected config: PlatformConnectorConfig;
  protected rateLimitInfo: RateLimitInfo | null = null;
  protected isAuthenticated = false;

  constructor(config: PlatformConnectorConfig) {
    this.config = config;
  }

  // Abstract methods die elke platform connector moet implementeren
  abstract authenticate(): Promise<boolean>;
  abstract refreshAuth(): Promise<boolean>;
  abstract validateCredentials(): Promise<boolean>;
  abstract createPost(content: PostContent): Promise<PublishedPost>;
  abstract updatePost(
    postId: string,
    content: Partial<PostContent>
  ): Promise<PublishedPost>;
  abstract deletePost(postId: string): Promise<boolean>;
  abstract getPost(postId: string): Promise<PublishedPost | null>;
  abstract getPostMetrics(postId: string): Promise<PostMetrics>;
  abstract getUserInfo(): Promise<AuthCredentials["metadata"]>;
  abstract getPlatformLimits(): PlatformLimits;

  // Shared helper methods
  protected async handleRateLimit(): Promise<void> {
    if (!this.config.enableRateLimit || !this.rateLimitInfo) return;

    if (this.rateLimitInfo.remaining <= 0) {
      const waitTime = this.rateLimitInfo.resetTime.getTime() - Date.now();
      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    if (!this.config.enableRetry) {
      return operation();
    }

    let lastError: Error;
    const { maxAttempts, backoffMultiplier, maxBackoffSeconds } =
      this.config.retryConfig;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        const platformError = this.convertToPlatformError(error);
        if (!platformError.retryable || attempt === maxAttempts) {
          throw error;
        }

        const backoffTime = Math.min(
          (attempt - 1) * backoffMultiplier * 1000,
          maxBackoffSeconds * 1000
        );

        console.log(
          `${context} failed (attempt ${attempt}/${maxAttempts}), retrying in ${backoffTime}ms`
        );
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }

    throw lastError!;
  }

  protected convertToPlatformError(error: any): PlatformError {
    return {
      code: error.code || "UNKNOWN_ERROR",
      message: error.message || "Unknown error occurred",
      timestamp: new Date(),
      retryable: this.isRetryableError(error),
      details: error,
    };
  }

  protected isRetryableError(error: any): boolean {
    // Algemene retryable error codes
    const retryableCodes = [
      "RATE_LIMIT_EXCEEDED",
      "SERVER_ERROR",
      "TIMEOUT",
      "NETWORK_ERROR",
      "TEMPORARY_UNAVAILABLE",
    ];

    // HTTP status codes die retryable zijn
    const retryableHttpCodes = [429, 500, 502, 503, 504];

    return (
      retryableCodes.includes(error.code) ||
      retryableHttpCodes.includes(error.status) ||
      retryableHttpCodes.includes(error.statusCode)
    );
  }

  protected validateContent(content: PostContent): void {
    const limits = this.getPlatformLimits();

    // Valideer text length
    if (content.text && content.text.length > limits.textLength.max) {
      throw new Error(
        `Text length (${content.text.length}) exceeds platform limit (${limits.textLength.max})`
      );
    }

    // Valideer hashtags
    if (
      content.hashtags &&
      content.hashtags.length > limits.hashtagLimits.max
    ) {
      throw new Error(
        `Hashtag count (${content.hashtags.length}) exceeds platform limit (${limits.hashtagLimits.max})`
      );
    }

    // Valideer media count
    if (content.media) {
      const imageCount = content.media.filter(m => m.type === "image").length;
      const videoCount = content.media.filter(m => m.type === "video").length;

      if (imageCount > limits.mediaLimits.images.maxCount) {
        throw new Error(
          `Image count (${imageCount}) exceeds platform limit (${limits.mediaLimits.images.maxCount})`
        );
      }

      if (videoCount > limits.mediaLimits.videos.maxCount) {
        throw new Error(
          `Video count (${videoCount}) exceeds platform limit (${limits.mediaLimits.videos.maxCount})`
        );
      }
    }
  }

  protected log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    data?: any
  ): void {
    if (level === "debug" && !this.config.logging.enableDebug) return;

    const logMessage = `[${this.config.platform}] ${message}`;

    switch (level) {
      case "debug":
        console.debug(logMessage, data);
        break;
      case "info":
        console.log(logMessage, data);
        break;
      case "warn":
        console.warn(logMessage, data);
        break;
      case "error":
        console.error(logMessage, data);
        break;
    }
  }

  // Public getters
  get platform(): SocialPlatform {
    return this.config.platform;
  }

  get authenticated(): boolean {
    return this.isAuthenticated;
  }

  get rateLimit(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }
}

/**
 * Factory interface voor platform connectors
 */
export interface PlatformConnectorFactory {
  createConnector(
    platform: SocialPlatform,
    config: Omit<PlatformConnectorConfig, "platform">
  ): BasePlatformConnector;
  getSupportedPlatforms(): SocialPlatform[];
  getDefaultConfig(platform: SocialPlatform): Partial<PlatformConnectorConfig>;
}

/**
 * Utility functies
 */
export function createDefaultConnectorConfig(
  platform: SocialPlatform
): Partial<PlatformConnectorConfig> {
  return {
    platform,
    enableRateLimit: true,
    enableRetry: true,
    retryConfig: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      maxBackoffSeconds: 60,
    },
    logging: {
      enableDebug: false,
      logRequests: true,
      logResponses: false,
    },
  };
}

export function validatePlatformCredentials(
  platform: SocialPlatform,
  credentials: AuthCredentials
): boolean {
  if (!credentials.accessToken) return false;

  // Platform-specific validation zou hier komen
  switch (platform) {
    case "facebook":
    case "instagram":
      return (
        credentials.scopes.includes("pages_manage_posts") ||
        credentials.scopes.includes("publish_actions")
      );

    case "twitter":
      return (
        credentials.scopes.includes("tweet.write") ||
        credentials.scopes.includes("tweet.read")
      );

    case "linkedin":
      return credentials.scopes.includes("w_member_social");

    case "tiktok":
      return credentials.scopes.includes("video.publish");

    default:
      return true;
  }
}

export function estimatePostReach(
  platform: SocialPlatform,
  followerCount: number
): number {
  // Simpele schatting op basis van platform algoritmes
  const reachRates = {
    facebook: 0.05, // 5% organic reach
    instagram: 0.09, // 9% organic reach
    twitter: 0.15, // 15% organic reach
    linkedin: 0.02, // 2% organic reach
    tiktok: 0.25, // 25% organic reach (algoritme driven)
  };

  return Math.floor(followerCount * reachRates[platform]);
}
