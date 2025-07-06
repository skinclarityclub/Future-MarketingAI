import { logger } from "../logger";
import {
  BlotatoClient,
  SocialPlatform,
  PostContent,
  PublishRequest,
  BlotatoApiResponse,
} from "../apis/blotato-client";
import {
  PLATFORM_CONFIGS,
  getPlatformConfig,
  type PlatformConfig,
} from "../apis/blotato-config";

// Content Types
export interface ContentItem {
  id: string;
  text: string;
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[];
  link?: string;
  title?: string;
  description?: string;
}

// Platform-Specific Content
export interface PlatformContent extends ContentItem {
  platform: SocialPlatform;
  optimizedText: string;
  optimizedMediaUrls: string[];
  platformSpecificOptions?: Record<string, any>;
}

// Multi-Platform Post Request
export interface MultiPlatformPostRequest {
  content: ContentItem;
  platforms: SocialPlatform[];
  accounts: Record<SocialPlatform, string>; // platform -> accountId mapping
  pageIds?: Record<SocialPlatform, string>; // platform -> pageId mapping (for Facebook pages, etc.)
  scheduledTime?: string;
  options?: {
    enableContentOptimization?: boolean;
    enableHashtagOptimization?: boolean;
    enableMediaOptimization?: boolean;
    failureHandling?: "stop-on-first-failure" | "continue-on-failure";
    priority?: "high" | "medium" | "low";
  };
}

// Platform Publishing Result
export interface PlatformPublishResult {
  platform: SocialPlatform;
  success: boolean;
  response?: BlotatoApiResponse;
  error?: string;
  publishedAt?: Date;
  postId?: string;
  postUrl?: string;
}

// Multi-Platform Publishing Result
export interface MultiPlatformPublishResult {
  success: boolean;
  results: PlatformPublishResult[];
  totalPlatforms: number;
  successfulPlatforms: number;
  failedPlatforms: number;
  errors: string[];
  publishedAt: Date;
}

// Content Optimization Rules
interface ContentOptimizationRule {
  platform: SocialPlatform;
  textTransform?: (text: string) => string;
  hashtagStrategy?: "preserve" | "optimize" | "remove";
  mediaStrategy?: "preserve" | "optimize" | "crop";
  linkStrategy?: "preserve" | "shorten" | "remove";
}

// Platform Manager Class
export class BlatatoPlatformManager {
  private client: BlotatoClient;
  private optimizationRules: Map<SocialPlatform, ContentOptimizationRule> =
    new Map();

  constructor(client: BlotatoClient) {
    this.client = client;
    this.initializeOptimizationRules();

    logger.info("Blotato Platform Manager initialized", {
      supportedPlatforms: Object.keys(PLATFORM_CONFIGS),
    });
  }

  private initializeOptimizationRules(): void {
    // Twitter optimization
    this.optimizationRules.set("twitter", {
      platform: "twitter",
      textTransform: text => this.truncateText(text, 280),
      hashtagStrategy: "optimize",
      mediaStrategy: "optimize",
      linkStrategy: "shorten",
    });

    // LinkedIn optimization
    this.optimizationRules.set("linkedin", {
      platform: "linkedin",
      textTransform: text => this.truncateText(text, 3000),
      hashtagStrategy: "optimize",
      mediaStrategy: "preserve",
      linkStrategy: "preserve",
    });

    // Facebook optimization
    this.optimizationRules.set("facebook", {
      platform: "facebook",
      textTransform: text => text, // No length limit
      hashtagStrategy: "preserve",
      mediaStrategy: "preserve",
      linkStrategy: "preserve",
    });

    // Instagram optimization
    this.optimizationRules.set("instagram", {
      platform: "instagram",
      textTransform: text => this.truncateText(text, 2200),
      hashtagStrategy: "optimize",
      mediaStrategy: "optimize",
      linkStrategy: "remove", // Instagram doesn't support clickable links in posts
    });

    // TikTok optimization
    this.optimizationRules.set("tiktok", {
      platform: "tiktok",
      textTransform: text => this.truncateText(text, 150),
      hashtagStrategy: "optimize",
      mediaStrategy: "optimize",
      linkStrategy: "remove",
    });

    // YouTube optimization
    this.optimizationRules.set("youtube", {
      platform: "youtube",
      textTransform: text => this.truncateText(text, 5000),
      hashtagStrategy: "preserve",
      mediaStrategy: "preserve",
      linkStrategy: "preserve",
    });

    // Bluesky optimization
    this.optimizationRules.set("bluesky", {
      platform: "bluesky",
      textTransform: text => this.truncateText(text, 300),
      hashtagStrategy: "optimize",
      mediaStrategy: "optimize",
      linkStrategy: "shorten",
    });
  }

  // Content Optimization
  async optimizeContentForPlatform(
    content: ContentItem,
    platform: SocialPlatform,
    options: { enableOptimization?: boolean } = {}
  ): Promise<PlatformContent> {
    const config = getPlatformConfig(platform);
    const rule = this.optimizationRules.get(platform);

    if (!options.enableOptimization || !rule) {
      return {
        ...content,
        platform,
        optimizedText: content.text,
        optimizedMediaUrls: content.mediaUrls || [],
      };
    }

    logger.debug("Optimizing content for platform", {
      platform,
      originalTextLength: content.text.length,
      mediaCount: content.mediaUrls?.length || 0,
    });

    // Text optimization
    let optimizedText = rule.textTransform
      ? rule.textTransform(content.text)
      : content.text;

    // Hashtag optimization
    if (content.hashtags && rule.hashtagStrategy === "optimize") {
      optimizedText = this.optimizeHashtags(
        optimizedText,
        content.hashtags,
        platform
      );
    } else if (content.hashtags && rule.hashtagStrategy === "remove") {
      optimizedText = this.removeHashtags(optimizedText);
    }

    // Link optimization
    if (content.link && rule.linkStrategy === "remove") {
      optimizedText = this.removeLinks(optimizedText);
    } else if (content.link && rule.linkStrategy === "shorten") {
      optimizedText = await this.shortenLinks(optimizedText);
    }

    // Media optimization
    let optimizedMediaUrls = content.mediaUrls || [];
    if (rule.mediaStrategy === "optimize") {
      optimizedMediaUrls = await this.optimizeMediaForPlatform(
        optimizedMediaUrls,
        platform
      );
    }

    // Validate against platform limits
    optimizedMediaUrls = optimizedMediaUrls.slice(
      0,
      config.maxImages + config.maxVideos
    );

    const result: PlatformContent = {
      ...content,
      platform,
      optimizedText,
      optimizedMediaUrls,
    };

    logger.debug("Content optimization completed", {
      platform,
      optimizedTextLength: optimizedText.length,
      optimizedMediaCount: optimizedMediaUrls.length,
    });

    return result;
  }

  // Multi-Platform Publishing
  async publishToMultiplePlatforms(
    request: MultiPlatformPostRequest
  ): Promise<MultiPlatformPublishResult> {
    const startTime = new Date();
    const results: PlatformPublishResult[] = [];
    const errors: string[] = [];

    logger.info("Starting multi-platform publishing", {
      platforms: request.platforms,
      contentId: request.content.id,
      scheduled: !!request.scheduledTime,
    });

    for (const platform of request.platforms) {
      try {
        const result = await this.publishToPlatform(request, platform);
        results.push(result);

        if (!result.success) {
          errors.push(`${platform}: ${result.error}`);

          if (request.options?.failureHandling === "stop-on-first-failure") {
            logger.warn("Stopping multi-platform publishing due to failure", {
              platform,
              error: result.error,
            });
            break;
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push(`${platform}: ${errorMessage}`);

        results.push({
          platform,
          success: false,
          error: errorMessage,
        });

        if (request.options?.failureHandling === "stop-on-first-failure") {
          logger.error("Stopping multi-platform publishing due to error", {
            platform,
            error: errorMessage,
          });
          break;
        }
      }
    }

    const successfulPlatforms = results.filter(r => r.success).length;
    const failedPlatforms = results.filter(r => !r.success).length;

    const finalResult: MultiPlatformPublishResult = {
      success: successfulPlatforms > 0,
      results,
      totalPlatforms: request.platforms.length,
      successfulPlatforms,
      failedPlatforms,
      errors,
      publishedAt: startTime,
    };

    logger.info("Multi-platform publishing completed", {
      totalPlatforms: finalResult.totalPlatforms,
      successful: finalResult.successfulPlatforms,
      failed: finalResult.failedPlatforms,
      duration: Date.now() - startTime.getTime(),
    });

    return finalResult;
  }

  // Single Platform Publishing
  private async publishToPlatform(
    request: MultiPlatformPostRequest,
    platform: SocialPlatform
  ): Promise<PlatformPublishResult> {
    const accountId = request.accounts[platform];
    const pageId = request.pageIds?.[platform];

    if (!accountId) {
      return {
        platform,
        success: false,
        error: `No account ID configured for ${platform}`,
      };
    }

    try {
      // Optimize content for this platform
      const optimizedContent = await this.optimizeContentForPlatform(
        request.content,
        platform,
        {
          enableOptimization:
            request.options?.enableContentOptimization ?? true,
        }
      );

      // Upload media if needed
      const mediaUrls = await this.ensureMediaUploaded(
        optimizedContent.optimizedMediaUrls
      );

      // Create publish request
      const publishRequest: PublishRequest = {
        post: {
          accountId,
          content: {
            text: optimizedContent.optimizedText,
            platform,
            mediaUrls,
          },
          target: {
            targetType: platform,
            ...(pageId && { pageId }),
          },
        },
        ...(request.scheduledTime && { scheduledTime: request.scheduledTime }),
      };

      // Publish to platform
      const response = await this.client.publishPost(publishRequest);

      return {
        platform,
        success: response.success,
        response,
        publishedAt: new Date(),
        postId: response.data?.id,
        postUrl: response.data?.url,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Platform publishing failed", {
        platform,
        error: errorMessage,
      });

      return {
        platform,
        success: false,
        error: errorMessage,
      };
    }
  }

  // Utility Methods
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + "...";
    }

    return truncated + "...";
  }

  private optimizeHashtags(
    text: string,
    hashtags: string[],
    platform: SocialPlatform
  ): string {
    const config = getPlatformConfig(platform);
    const maxHashtags =
      platform === "instagram" ? 30 : platform === "twitter" ? 2 : 5;

    const optimizedHashtags = hashtags.slice(0, maxHashtags);

    if (text.includes("#")) {
      return text; // Already has hashtags
    }

    return `${text}\n\n${optimizedHashtags.map(tag => `#${tag}`).join(" ")}`;
  }

  private removeHashtags(text: string): string {
    return text.replace(/#\w+/g, "").replace(/\s+/g, " ").trim();
  }

  private removeLinks(text: string): string {
    return text
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private async shortenLinks(text: string): Promise<string> {
    // In a real implementation, you'd integrate with a URL shortening service
    // For now, we'll just return the original text
    return text;
  }

  private async optimizeMediaForPlatform(
    mediaUrls: string[],
    platform: SocialPlatform
  ): Promise<string[]> {
    // In a real implementation, you'd resize/optimize images for each platform
    // For now, we'll just return the original URLs
    return mediaUrls;
  }

  private async ensureMediaUploaded(mediaUrls: string[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const url of mediaUrls) {
      try {
        // Check if it's already a Blotato URL
        if (url.includes("database.blotato.com")) {
          uploadedUrls.push(url);
        } else {
          // Upload to Blotato
          const uploaded = await this.client.uploadMedia({ url });
          uploadedUrls.push(uploaded.url);
        }
      } catch (error) {
        logger.warn("Failed to upload media", { url, error });
      }
    }

    return uploadedUrls;
  }

  // Platform Information
  getSupportedPlatforms(): SocialPlatform[] {
    return Object.keys(PLATFORM_CONFIGS) as SocialPlatform[];
  }

  getPlatformLimits(platform: SocialPlatform): PlatformConfig {
    return getPlatformConfig(platform);
  }

  validateContentForPlatform(
    content: ContentItem,
    platform: SocialPlatform
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const config = getPlatformConfig(platform);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Text length validation
    if (content.text.length > config.maxTextLength) {
      errors.push(
        `Text too long for ${platform}: ${content.text.length}/${config.maxTextLength} characters`
      );
    }

    // Media count validation
    const mediaCount = content.mediaUrls?.length || 0;
    if (mediaCount > config.maxImages + config.maxVideos) {
      errors.push(
        `Too many media files for ${platform}: ${mediaCount}/${config.maxImages + config.maxVideos}`
      );
    }

    // Platform-specific warnings
    if (platform === "instagram" && content.link) {
      warnings.push("Instagram posts don't support clickable links");
    }

    if (platform === "twitter" && content.text.length > 240) {
      warnings.push(
        "Twitter posts longer than 240 characters may get truncated"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Factory function
export function createBlatatoPlatformManager(
  client: BlotatoClient
): BlatatoPlatformManager {
  return new BlatatoPlatformManager(client);
}

export default BlatatoPlatformManager;
