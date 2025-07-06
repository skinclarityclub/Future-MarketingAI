// Social Platform Connectors - Main Export
// Centralized export voor alle social media platform connectors

export {
  // Base types en abstract class
  BasePlatformConnector,
  type SocialPlatform,
  type PostType,
  type PostStatus,
  type PlatformLimits,
  type AuthCredentials,
  type PostContent,
  type MediaItem,
  type PublishedPost,
  type PostMetrics,
  type PlatformError,
  type RateLimitInfo,
  type PlatformConnectorConfig,
  type PlatformConnectorFactory,
  createDefaultConnectorConfig,
  validatePlatformCredentials,
  estimatePostReach,
} from "./base";

// Platform-specific connectors (to be implemented)
// export { LinkedInConnector, createLinkedInConnector } from './linkedin';
// export { TwitterConnector, createTwitterConnector } from './twitter';
// export { FacebookConnector, createFacebookConnector } from './facebook';
// export { InstagramConnector, createInstagramConnector } from './instagram';
// export { TikTokConnector, createTikTokConnector } from './tiktok';

/**
 * Platform Connector Factory Implementation
 */
export class SocialPlatformFactory implements PlatformConnectorFactory {
  private static instance: SocialPlatformFactory;

  static getInstance(): SocialPlatformFactory {
    if (!SocialPlatformFactory.instance) {
      SocialPlatformFactory.instance = new SocialPlatformFactory();
    }
    return SocialPlatformFactory.instance;
  }

  createConnector(
    platform: SocialPlatform,
    config: Omit<PlatformConnectorConfig, "platform">
  ): BasePlatformConnector {
    const fullConfig = { ...config, platform };

    switch (platform) {
      case "linkedin":
        // return new LinkedInConnector(fullConfig);
        throw new Error("LinkedIn connector not yet implemented");

      case "twitter":
        // return new TwitterConnector(fullConfig);
        throw new Error("Twitter connector not yet implemented");

      case "facebook":
        // return new FacebookConnector(fullConfig);
        throw new Error("Facebook connector not yet implemented");

      case "instagram":
        // return new InstagramConnector(fullConfig);
        throw new Error("Instagram connector not yet implemented");

      case "tiktok":
        // return new TikTokConnector(fullConfig);
        throw new Error("TikTok connector not yet implemented");

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  getSupportedPlatforms(): SocialPlatform[] {
    return ["linkedin", "twitter", "facebook", "instagram", "tiktok"];
  }

  getDefaultConfig(platform: SocialPlatform): Partial<PlatformConnectorConfig> {
    return createDefaultConnectorConfig(platform);
  }
}

/**
 * Convenience functions
 */
export function createPlatformConnector(
  platform: SocialPlatform,
  credentials: AuthCredentials,
  config?: Partial<PlatformConnectorConfig>
): BasePlatformConnector {
  const factory = SocialPlatformFactory.getInstance();
  const defaultConfig = factory.getDefaultConfig(platform);

  const finalConfig = {
    ...defaultConfig,
    ...config,
    credentials,
  };

  return factory.createConnector(platform, finalConfig);
}

export function validatePlatformSetup(
  platform: SocialPlatform,
  credentials: AuthCredentials
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Basic validation
  if (!validatePlatformCredentials(platform, credentials)) {
    errors.push("Invalid credentials for platform");
  }

  if (!credentials.accessToken) {
    errors.push("Access token is required");
  }

  // Platform-specific validation
  switch (platform) {
    case "facebook":
    case "instagram":
      if (!credentials.pageId && platform === "facebook") {
        errors.push("Page ID required for Facebook posting");
      }
      break;

    case "linkedin":
      if (!credentials.userId) {
        errors.push("User ID required for LinkedIn posting");
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Platform-specific limit helpers
 */
export function getPlatformLimits(platform: SocialPlatform): PlatformLimits {
  // Default limits - each connector overrides these
  const defaultLimits: Record<SocialPlatform, PlatformLimits> = {
    linkedin: {
      textLength: { max: 3000, recommended: 1300 },
      mediaLimits: {
        images: {
          maxCount: 9,
          maxSizeBytes: 100 * 1024 * 1024,
          supportedFormats: ["jpg", "jpeg", "png", "gif"],
          dimensions: {
            min: { width: 400, height: 400 },
            max: { width: 7680, height: 4320 },
            recommended: { width: 1200, height: 627 },
          },
        },
        videos: {
          maxCount: 1,
          maxSizeBytes: 5 * 1024 * 1024 * 1024,
          maxDurationSeconds: 600,
          supportedFormats: ["mp4", "mov", "avi"],
          dimensions: {
            min: { width: 256, height: 144 },
            max: { width: 4096, height: 2304 },
            recommended: { width: 1280, height: 720 },
          },
        },
      },
      hashtagLimits: { max: 30, recommended: 5 },
      rateLimit: { postsPerHour: 150, postsPerDay: 500, apiCallsPerHour: 2000 },
    },

    twitter: {
      textLength: { max: 280, recommended: 250 },
      mediaLimits: {
        images: {
          maxCount: 4,
          maxSizeBytes: 5 * 1024 * 1024,
          supportedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
          dimensions: {
            min: { width: 600, height: 335 },
            max: { width: 1200, height: 675 },
            recommended: { width: 1200, height: 675 },
          },
        },
        videos: {
          maxCount: 1,
          maxSizeBytes: 512 * 1024 * 1024,
          maxDurationSeconds: 140,
          supportedFormats: ["mp4", "mov"],
          dimensions: {
            min: { width: 32, height: 32 },
            max: { width: 1280, height: 1024 },
            recommended: { width: 1280, height: 720 },
          },
        },
      },
      hashtagLimits: { max: 10, recommended: 3 },
      rateLimit: {
        postsPerHour: 300,
        postsPerDay: 2400,
        apiCallsPerHour: 1500,
      },
    },

    facebook: {
      textLength: { max: 63206, recommended: 500 },
      mediaLimits: {
        images: {
          maxCount: 10,
          maxSizeBytes: 4 * 1024 * 1024,
          supportedFormats: ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
          dimensions: {
            min: { width: 600, height: 315 },
            max: { width: 2048, height: 2048 },
            recommended: { width: 1200, height: 630 },
          },
        },
        videos: {
          maxCount: 1,
          maxSizeBytes: 4 * 1024 * 1024 * 1024,
          maxDurationSeconds: 7200,
          supportedFormats: ["mp4", "mov", "avi"],
          dimensions: {
            min: { width: 120, height: 120 },
            max: { width: 1280, height: 720 },
            recommended: { width: 1280, height: 720 },
          },
        },
      },
      hashtagLimits: { max: 30, recommended: 5 },
      rateLimit: { postsPerHour: 200, postsPerDay: 1000, apiCallsPerHour: 600 },
    },

    instagram: {
      textLength: { max: 2200, recommended: 1000 },
      mediaLimits: {
        images: {
          maxCount: 10,
          maxSizeBytes: 8 * 1024 * 1024,
          supportedFormats: ["jpg", "jpeg", "png"],
          dimensions: {
            min: { width: 320, height: 320 },
            max: { width: 1080, height: 1350 },
            recommended: { width: 1080, height: 1080 },
          },
        },
        videos: {
          maxCount: 1,
          maxSizeBytes: 100 * 1024 * 1024,
          maxDurationSeconds: 60,
          supportedFormats: ["mp4", "mov"],
          dimensions: {
            min: { width: 320, height: 320 },
            max: { width: 1080, height: 1350 },
            recommended: { width: 1080, height: 1080 },
          },
        },
      },
      hashtagLimits: { max: 30, recommended: 10 },
      rateLimit: { postsPerHour: 60, postsPerDay: 200, apiCallsPerHour: 240 },
    },

    tiktok: {
      textLength: { max: 150, recommended: 100 },
      mediaLimits: {
        images: {
          maxCount: 0, // TikTok is primair video
          maxSizeBytes: 0,
          supportedFormats: [],
          dimensions: {
            min: { width: 0, height: 0 },
            max: { width: 0, height: 0 },
          },
        },
        videos: {
          maxCount: 1,
          maxSizeBytes: 500 * 1024 * 1024,
          maxDurationSeconds: 180,
          supportedFormats: ["mp4", "mov", "avi"],
          dimensions: {
            min: { width: 640, height: 640 },
            max: { width: 1080, height: 1920 },
            recommended: { width: 1080, height: 1920 },
          },
        },
      },
      hashtagLimits: { max: 20, recommended: 5 },
      rateLimit: { postsPerHour: 30, postsPerDay: 100, apiCallsPerHour: 1000 },
    },
  };

  return defaultLimits[platform];
}

/**
 * Content optimization helpers
 */
export function optimizeContentForPlatform(
  content: PostContent,
  platform: SocialPlatform
): PostContent {
  const limits = getPlatformLimits(platform);
  const optimizedContent = { ...content };

  // Truncate text if needed
  if (
    optimizedContent.text &&
    optimizedContent.text.length > limits.textLength.max
  ) {
    optimizedContent.text =
      optimizedContent.text.substring(0, limits.textLength.max - 3) + "...";
  }

  // Limit hashtags
  if (
    optimizedContent.hashtags &&
    optimizedContent.hashtags.length > limits.hashtagLimits.max
  ) {
    optimizedContent.hashtags = optimizedContent.hashtags.slice(
      0,
      limits.hashtagLimits.max
    );
  }

  // Platform-specific optimizations
  switch (platform) {
    case "twitter":
      // Remove line breaks voor Twitter
      if (optimizedContent.text) {
        optimizedContent.text = optimizedContent.text.replace(/\n/g, " ");
      }
      break;

    case "linkedin":
      // LinkedIn prefers professional tone - could add tone adjustment here
      break;

    case "instagram":
      // Instagram is visual-first - ensure media is present
      if (!optimizedContent.media || optimizedContent.media.length === 0) {
        console.warn("Instagram posts work best with media");
      }
      break;
  }

  return optimizedContent;
}

/**
 * Multi-platform posting helper
 */
export async function postToMultiplePlatforms(
  content: PostContent,
  platforms: Array<{
    platform: SocialPlatform;
    connector: BasePlatformConnector;
  }>
): Promise<Array<{ platform: SocialPlatform; result: PublishedPost | Error }>> {
  const results = await Promise.allSettled(
    platforms.map(async ({ platform, connector }) => {
      const optimizedContent = optimizeContentForPlatform(content, platform);
      const result = await connector.createPost(optimizedContent);
      return { platform, result };
    })
  );

  return results.map((result, index) => {
    const platform = platforms[index].platform;

    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return { platform, result: result.reason };
    }
  });
}
