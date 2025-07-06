import { logger } from "../logger";

// Blotato API Configuration
export interface BlotatoConfig {
  apiKey: string;
  baseUrl?: string;
}

// Media Upload Types
export interface MediaUploadRequest {
  url: string;
}

export interface MediaUploadResponse {
  url: string;
}

// Post Content Types
export interface PostContent {
  text: string;
  mediaUrls?: string[];
  platform: SocialPlatform;
  additionalPosts?: Array<{
    text: string;
    mediaUrls?: string[];
  }>;
}

// Platform Types
export type SocialPlatform =
  | "twitter"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "bluesky";

// Target Configuration
export interface PostTarget {
  targetType: SocialPlatform;
  pageId?: string;
}

// Post Request
export interface PostRequest {
  accountId: string;
  content: PostContent;
  target: PostTarget;
}

// Publish Request
export interface PublishRequest {
  post: PostRequest;
  scheduledTime?: string; // ISO 8601 format
}

// API Response Types
export interface BlotatoApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Video Creation Types
export interface VideoCreationRequest {
  script: string;
  voiceId?: string;
  style?: string;
  duration?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  includeSubtitles?: boolean;
}

export interface VideoCreationResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
}

// Account Types
export interface ConnectedAccount {
  id: string;
  accountId: string;
  platform: SocialPlatform;
  username: string;
  isActive: boolean;
  pageId?: string;
  permissions: string[];
}

// Rate Limiting
interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
}

export class BlotatoClient {
  private config: BlotatoConfig;
  private baseUrl: string;
  private rateLimitInfo?: RateLimitInfo;

  constructor(config: BlotatoConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://backend.blotato.com";

    if (!config.apiKey) {
      throw new Error("Blotato API key is required");
    }

    logger.info("Blotato client initialized", {
      baseUrl: this.baseUrl,
      hasApiKey: !!config.apiKey,
    });
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "blotato-api-key": this.config.apiKey,
      "Content-Type": "application/json",
      "User-Agent": "SKC-BI-Dashboard/1.0",
      ...options.headers,
    };

    // Rate limiting check
    if (this.rateLimitInfo && this.rateLimitInfo.remaining <= 0) {
      const waitTime = this.rateLimitInfo.resetTime.getTime() - Date.now();
      if (waitTime > 0) {
        logger.warn(`Rate limit exceeded. Waiting ${waitTime}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Update rate limit info from headers
      this.updateRateLimitInfo(response);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Blotato API error: ${response.status} ${response.statusText}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        logger.error("Blotato API request failed", {
          url,
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();
      logger.debug("Blotato API request successful", {
        url,
        method: options.method || "GET",
      });

      return data;
    } catch (error) {
      logger.error("Blotato API request error", {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private updateRateLimitInfo(response: Response): void {
    const limit = response.headers.get("x-ratelimit-limit");
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        resetTime: new Date(parseInt(reset, 10) * 1000),
      };
    }
  }

  // Media Upload
  async uploadMedia(
    mediaRequest: MediaUploadRequest
  ): Promise<MediaUploadResponse> {
    logger.info("Uploading media to Blotato", { url: mediaRequest.url });

    const response = await this.makeRequest<MediaUploadResponse>("/v2/media", {
      method: "POST",
      body: JSON.stringify(mediaRequest),
    });

    logger.info("Media uploaded successfully", {
      originalUrl: mediaRequest.url,
      blobUrl: response.url,
    });

    return response;
  }

  // Publish Post
  async publishPost(
    publishRequest: PublishRequest
  ): Promise<BlotatoApiResponse> {
    const { post, scheduledTime } = publishRequest;

    logger.info("Publishing post to Blotato", {
      platform: post.target.targetType,
      accountId: post.accountId,
      scheduled: !!scheduledTime,
      hasMedia: (post.content.mediaUrls?.length ?? 0) > 0,
      isThread: (post.content.additionalPosts?.length ?? 0) > 0,
    });

    const requestBody = {
      post,
      ...(scheduledTime && { scheduledTime }),
    };

    const response = await this.makeRequest<BlotatoApiResponse>("/v2/posts", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    logger.info("Post published successfully", {
      platform: post.target.targetType,
      success: response.success,
    });

    return response;
  }

  // Create AI Video
  async createVideo(
    videoRequest: VideoCreationRequest
  ): Promise<VideoCreationResponse> {
    logger.info("Creating AI video with Blotato", {
      scriptLength: videoRequest.script.length,
      voiceId: videoRequest.voiceId,
      style: videoRequest.style,
      aspectRatio: videoRequest.aspectRatio,
    });

    const response = await this.makeRequest<VideoCreationResponse>(
      "/v2/videos/creations",
      {
        method: "POST",
        body: JSON.stringify(videoRequest),
      }
    );

    logger.info("Video creation initiated", {
      videoId: response.id,
      status: response.status,
    });

    return response;
  }

  // Get Video Status
  async getVideoStatus(videoId: string): Promise<VideoCreationResponse> {
    logger.debug("Checking video status", { videoId });

    const response = await this.makeRequest<VideoCreationResponse>(
      `/v2/videos/creations/${videoId}`,
      {
        method: "GET",
      }
    );

    logger.debug("Video status retrieved", {
      videoId,
      status: response.status,
      hasUrl: !!response.url,
    });

    return response;
  }

  // Wait for Video Completion
  async waitForVideoCompletion(
    videoId: string,
    maxWaitTime: number = 300000, // 5 minutes
    pollInterval: number = 10000 // 10 seconds
  ): Promise<VideoCreationResponse> {
    const startTime = Date.now();

    logger.info("Waiting for video completion", {
      videoId,
      maxWaitTime: maxWaitTime / 1000,
      pollInterval: pollInterval / 1000,
    });

    while (Date.now() - startTime < maxWaitTime) {
      const video = await this.getVideoStatus(videoId);

      if (video.status === "completed") {
        logger.info("Video completed successfully", {
          videoId,
          url: video.url,
          duration: video.duration,
        });
        return video;
      }

      if (video.status === "failed") {
        logger.error("Video creation failed", { videoId });
        throw new Error(`Video creation failed for ID: ${videoId}`);
      }

      logger.debug("Video still processing, waiting...", {
        videoId,
        status: video.status,
        elapsed: (Date.now() - startTime) / 1000,
      });

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    logger.error("Video creation timeout", { videoId, maxWaitTime });
    throw new Error(`Video creation timeout for ID: ${videoId}`);
  }

  // Convenience Methods
  async publishTextPost(
    accountId: string,
    platform: SocialPlatform,
    text: string,
    options: {
      pageId?: string;
      scheduledTime?: string;
    } = {}
  ): Promise<BlotatoApiResponse> {
    return this.publishPost({
      post: {
        accountId,
        content: {
          text,
          platform,
          mediaUrls: [],
        },
        target: {
          targetType: platform,
          pageId: options.pageId,
        },
      },
      scheduledTime: options.scheduledTime,
    });
  }

  async publishImagePost(
    accountId: string,
    platform: SocialPlatform,
    text: string,
    imageUrls: string[],
    options: {
      pageId?: string;
      scheduledTime?: string;
    } = {}
  ): Promise<BlotatoApiResponse> {
    // Upload images to Blotato first
    const uploadedImages = await Promise.all(
      imageUrls.map(url => this.uploadMedia({ url }))
    );

    return this.publishPost({
      post: {
        accountId,
        content: {
          text,
          platform,
          mediaUrls: uploadedImages.map(img => img.url),
        },
        target: {
          targetType: platform,
          pageId: options.pageId,
        },
      },
      scheduledTime: options.scheduledTime,
    });
  }

  async publishThread(
    accountId: string,
    platform: SocialPlatform,
    posts: Array<{ text: string; mediaUrls?: string[] }>,
    options: {
      pageId?: string;
      scheduledTime?: string;
    } = {}
  ): Promise<BlotatoApiResponse> {
    const [firstPost, ...additionalPosts] = posts;

    // Upload all media if present
    const processedPosts = await Promise.all(
      posts.map(async post => {
        if (post.mediaUrls && post.mediaUrls.length > 0) {
          const uploadedMedia = await Promise.all(
            post.mediaUrls.map(url => this.uploadMedia({ url }))
          );
          return {
            text: post.text,
            mediaUrls: uploadedMedia.map(media => media.url),
          };
        }
        return { text: post.text, mediaUrls: [] };
      })
    );

    const [processedFirst, ...processedAdditional] = processedPosts;

    return this.publishPost({
      post: {
        accountId,
        content: {
          text: processedFirst.text,
          platform,
          mediaUrls: processedFirst.mediaUrls,
          additionalPosts: processedAdditional,
        },
        target: {
          targetType: platform,
          pageId: options.pageId,
        },
      },
      scheduledTime: options.scheduledTime,
    });
  }

  // Utility Methods
  getRateLimitInfo(): RateLimitInfo | undefined {
    return this.rateLimitInfo;
  }

  isRateLimited(): boolean {
    return this.rateLimitInfo ? this.rateLimitInfo.remaining <= 0 : false;
  }

  getRateLimitResetTime(): Date | undefined {
    return this.rateLimitInfo?.resetTime;
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      // Try a simple request to verify API key and connectivity
      await this.makeRequest("/v2/posts", { method: "OPTIONS" });
      return true;
    } catch (error) {
      logger.error("Blotato health check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

// Factory function for easy instantiation
export function createBlotatoClient(config: BlotatoConfig): BlotatoClient {
  return new BlotatoClient(config);
}

// Default export
export default BlotatoClient;
