/**
 * SKC BI Dashboard - Social Media Platforms Manager
 * Comprehensive configuration and management for all social media API integrations
 */

export interface SocialPlatformCredentials {
  platform: SocialPlatform;
  credentials: Record<string, string>;
  isConfigured: boolean;
  lastValidated?: Date;
  expiresAt?: Date;
  status: "connected" | "disconnected" | "error" | "expired" | "pending";
  rateLimits?: {
    requestsPerHour: number;
    requestsPerDay: number;
    remaining?: number;
    resetTime?: Date;
  };
  permissions?: string[];
  accountInfo?: {
    id: string;
    name: string;
    username?: string;
    followers?: number;
    profilePicture?: string;
    verified?: boolean;
  };
}

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "twitter"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "snapchat";

export interface PlatformApiConfig {
  platform: SocialPlatform;
  name: string;
  baseUrl: string;
  authType: "oauth2" | "api_key" | "bearer_token";
  endpoints: {
    auth: string;
    profile: string;
    posts: string;
    analytics: string;
    publish?: string;
  };
  requiredCredentials: Array<{
    key: string;
    name: string;
    type:
      | "client_id"
      | "client_secret"
      | "access_token"
      | "api_key"
      | "bearer_token";
    required: boolean;
    sensitive: boolean;
  }>;
  permissions: string[];
  rateLimits: {
    requestsPerHour: number;
    requestsPerDay: number;
    burstLimit?: number;
  };
  features: string[];
  documentation: string;
}

export interface SocialMediaMetrics {
  platform: SocialPlatform;
  accountId: string;
  metrics: {
    followers: number;
    posts: number;
    engagement_rate: number;
    impressions_24h: number;
    reach_24h: number;
    likes_24h: number;
    comments_24h: number;
    shares_24h: number;
    saves_24h?: number;
    clicks_24h?: number;
  };
  timestamp: Date;
}

export interface PublishingCapabilities {
  platform: SocialPlatform;
  canPublish: boolean;
  supportedContentTypes: Array<
    "text" | "image" | "video" | "carousel" | "story" | "reel"
  >;
  schedulingSupported: boolean;
  maxCharacters?: number;
  maxImages?: number;
  maxVideos?: number;
  videoMaxDuration?: number; // in seconds
  imageRequirements?: {
    maxSize: number; // in bytes
    formats: string[];
    dimensions?: {
      minWidth: number;
      minHeight: number;
      maxWidth: number;
      maxHeight: number;
    };
  };
}

// ====================================================================
// PLATFORM CONFIGURATIONS
// ====================================================================

export const SOCIAL_PLATFORM_CONFIGS: Record<
  SocialPlatform,
  PlatformApiConfig
> = {
  instagram: {
    platform: "instagram",
    name: "Instagram Business API",
    baseUrl: "https://graph.facebook.com",
    authType: "oauth2",
    endpoints: {
      auth: "/oauth/authorize",
      profile: "/me",
      posts: "/me/media",
      analytics: "/me/insights",
      publish: "/me/media",
    },
    requiredCredentials: [
      {
        key: "app_id",
        name: "App ID",
        type: "client_id",
        required: true,
        sensitive: false,
      },
      {
        key: "app_secret",
        name: "App Secret",
        type: "client_secret",
        required: true,
        sensitive: true,
      },
      {
        key: "access_token",
        name: "Access Token",
        type: "access_token",
        required: true,
        sensitive: true,
      },
    ],
    permissions: [
      "instagram_basic",
      "instagram_content_publish",
      "pages_read_engagement",
    ],
    rateLimits: {
      requestsPerHour: 200,
      requestsPerDay: 4800,
      burstLimit: 50,
    },
    features: ["Analytics", "Publishing", "Stories", "Reels", "Insights"],
    documentation: "https://developers.facebook.com/docs/instagram-api",
  },

  facebook: {
    platform: "facebook",
    name: "Facebook Graph API",
    baseUrl: "https://graph.facebook.com",
    authType: "oauth2",
    endpoints: {
      auth: "/oauth/authorize",
      profile: "/me",
      posts: "/me/posts",
      analytics: "/me/insights",
      publish: "/me/feed",
    },
    requiredCredentials: [
      {
        key: "app_id",
        name: "App ID",
        type: "client_id",
        required: true,
        sensitive: false,
      },
      {
        key: "app_secret",
        name: "App Secret",
        type: "client_secret",
        required: true,
        sensitive: true,
      },
      {
        key: "access_token",
        name: "Page Access Token",
        type: "access_token",
        required: true,
        sensitive: true,
      },
    ],
    permissions: [
      "pages_manage_posts",
      "pages_read_engagement",
      "pages_show_list",
    ],
    rateLimits: {
      requestsPerHour: 200,
      requestsPerDay: 4800,
    },
    features: ["Analytics", "Publishing", "Page Management", "Ad Insights"],
    documentation: "https://developers.facebook.com/docs/graph-api",
  },

  linkedin: {
    platform: "linkedin",
    name: "LinkedIn Marketing API",
    baseUrl: "https://api.linkedin.com",
    authType: "oauth2",
    endpoints: {
      auth: "/oauth/v2/authorization",
      profile: "/v2/organizations",
      posts: "/v2/shares",
      analytics: "/v2/organizationalEntityShareStatistics",
      publish: "/v2/ugcPosts",
    },
    requiredCredentials: [
      {
        key: "client_id",
        name: "Client ID",
        type: "client_id",
        required: true,
        sensitive: false,
      },
      {
        key: "client_secret",
        name: "Client Secret",
        type: "client_secret",
        required: true,
        sensitive: true,
      },
      {
        key: "access_token",
        name: "Access Token",
        type: "access_token",
        required: true,
        sensitive: true,
      },
    ],
    permissions: [
      "r_organization_social",
      "rw_organization_admin",
      "w_member_social",
    ],
    rateLimits: {
      requestsPerHour: 100,
      requestsPerDay: 2400,
    },
    features: [
      "Analytics",
      "Publishing",
      "Company Page Management",
      "Audience Insights",
    ],
    documentation: "https://docs.microsoft.com/en-us/linkedin/",
  },

  twitter: {
    platform: "twitter",
    name: "Twitter/X API v2",
    baseUrl: "https://api.twitter.com",
    authType: "oauth2",
    endpoints: {
      auth: "/2/oauth2/authorize",
      profile: "/2/users/me",
      posts: "/2/users/me/tweets",
      analytics: "/2/tweets/metrics",
      publish: "/2/tweets",
    },
    requiredCredentials: [
      {
        key: "api_key",
        name: "API Key",
        type: "api_key",
        required: true,
        sensitive: true,
      },
      {
        key: "api_secret",
        name: "API Secret",
        type: "client_secret",
        required: true,
        sensitive: true,
      },
      {
        key: "bearer_token",
        name: "Bearer Token",
        type: "bearer_token",
        required: true,
        sensitive: true,
      },
    ],
    permissions: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    rateLimits: {
      requestsPerHour: 300,
      requestsPerDay: 7200,
    },
    features: ["Analytics", "Publishing", "Trending Topics", "User Metrics"],
    documentation: "https://developer.twitter.com/en/docs/twitter-api",
  },

  tiktok: {
    platform: "tiktok",
    name: "TikTok Business API",
    baseUrl: "https://business-api.tiktok.com",
    authType: "oauth2",
    endpoints: {
      auth: "/open_api/v1.3/oauth2/authorize",
      profile: "/open_api/v1.3/user/info",
      posts: "/open_api/v1.3/video/list",
      analytics: "/open_api/v1.3/video/data",
    },
    requiredCredentials: [
      {
        key: "app_id",
        name: "App ID",
        type: "client_id",
        required: true,
        sensitive: false,
      },
      {
        key: "app_secret",
        name: "App Secret",
        type: "client_secret",
        required: true,
        sensitive: true,
      },
      {
        key: "access_token",
        name: "Access Token",
        type: "access_token",
        required: true,
        sensitive: true,
      },
    ],
    permissions: ["user_info.basic", "video.list", "video.insights"],
    rateLimits: {
      requestsPerHour: 100,
      requestsPerDay: 2400,
    },
    features: [
      "Analytics",
      "Video Insights",
      "Creator Insights",
      "Hashtag Performance",
    ],
    documentation: "https://business.tiktok.com/portal/docs/introduction",
  },

  youtube: {
    platform: "youtube",
    name: "YouTube Data API v3",
    baseUrl: "https://www.googleapis.com",
    authType: "oauth2",
    endpoints: {
      auth: "/youtube/v3/oauth2/authorize",
      profile: "/youtube/v3/channels",
      posts: "/youtube/v3/videos",
      analytics: "/youtube/analytics/v2/reports",
    },
    requiredCredentials: [
      {
        key: "api_key",
        name: "API Key",
        type: "api_key",
        required: true,
        sensitive: true,
      },
      {
        key: "client_id",
        name: "OAuth Client ID",
        type: "client_id",
        required: false,
        sensitive: false,
      },
      {
        key: "client_secret",
        name: "OAuth Client Secret",
        type: "client_secret",
        required: false,
        sensitive: true,
      },
    ],
    permissions: ["https://www.googleapis.com/auth/youtube.readonly"],
    rateLimits: {
      requestsPerHour: 10000,
      requestsPerDay: 1000000,
    },
    features: [
      "Analytics",
      "Channel Insights",
      "Video Performance",
      "Subscriber Metrics",
    ],
    documentation: "https://developers.google.com/youtube/v3",
  },

  pinterest: {
    platform: "pinterest",
    name: "Pinterest API v5",
    baseUrl: "https://api.pinterest.com",
    authType: "oauth2",
    endpoints: {
      auth: "/oauth/authorize",
      profile: "/v5/user_account",
      posts: "/v5/pins",
      analytics: "/v5/user_account/analytics",
    },
    requiredCredentials: [
      {
        key: "app_id",
        name: "App ID",
        type: "client_id",
        required: true,
        sensitive: false,
      },
      {
        key: "app_secret",
        name: "App Secret",
        type: "client_secret",
        required: true,
        sensitive: true,
      },
      {
        key: "access_token",
        name: "Access Token",
        type: "access_token",
        required: true,
        sensitive: true,
      },
    ],
    permissions: ["user_accounts:read", "pins:read", "pins:write"],
    rateLimits: {
      requestsPerHour: 200,
      requestsPerDay: 4800,
    },
    features: [
      "Analytics",
      "Pin Management",
      "Board Analytics",
      "Audience Insights",
    ],
    documentation: "https://developers.pinterest.com/docs/api/v5/",
  },

  snapchat: {
    platform: "snapchat",
    name: "Snapchat Marketing API",
    baseUrl: "https://adsapi.snapchat.com",
    authType: "oauth2",
    endpoints: {
      auth: "/login/oauth2/authorize",
      profile: "/v1/me",
      posts: "/v1/adaccounts/{id}/ads",
      analytics: "/v1/adaccounts/{id}/stats",
    },
    requiredCredentials: [
      {
        key: "client_id",
        name: "Client ID",
        type: "client_id",
        required: true,
        sensitive: false,
      },
      {
        key: "client_secret",
        name: "Client Secret",
        type: "client_secret",
        required: true,
        sensitive: true,
      },
      {
        key: "access_token",
        name: "Access Token",
        type: "access_token",
        required: true,
        sensitive: true,
      },
    ],
    permissions: ["snapchat-marketing-api"],
    rateLimits: {
      requestsPerHour: 1000,
      requestsPerDay: 24000,
    },
    features: ["Ad Analytics", "Campaign Performance", "Audience Insights"],
    documentation: "https://marketingapi.snapchat.com/docs/",
  },
};

// ====================================================================
// PUBLISHING CAPABILITIES CONFIGURATION
// ====================================================================

export const PUBLISHING_CAPABILITIES: Record<
  SocialPlatform,
  PublishingCapabilities
> = {
  instagram: {
    platform: "instagram",
    canPublish: true,
    supportedContentTypes: ["image", "video", "carousel", "story", "reel"],
    schedulingSupported: true,
    maxCharacters: 2200,
    maxImages: 10,
    maxVideos: 1,
    videoMaxDuration: 60,
    imageRequirements: {
      maxSize: 8 * 1024 * 1024, // 8MB
      formats: ["jpg", "jpeg", "png"],
      dimensions: {
        minWidth: 320,
        minHeight: 320,
        maxWidth: 1080,
        maxHeight: 1080,
      },
    },
  },

  facebook: {
    platform: "facebook",
    canPublish: true,
    supportedContentTypes: ["text", "image", "video", "carousel"],
    schedulingSupported: true,
    maxCharacters: 63206,
    maxImages: 10,
    maxVideos: 1,
    videoMaxDuration: 240,
    imageRequirements: {
      maxSize: 10 * 1024 * 1024, // 10MB
      formats: ["jpg", "jpeg", "png", "gif"],
      dimensions: {
        minWidth: 600,
        minHeight: 315,
        maxWidth: 2048,
        maxHeight: 2048,
      },
    },
  },

  linkedin: {
    platform: "linkedin",
    canPublish: true,
    supportedContentTypes: ["text", "image", "video", "carousel"],
    schedulingSupported: true,
    maxCharacters: 3000,
    maxImages: 9,
    maxVideos: 1,
    videoMaxDuration: 600,
    imageRequirements: {
      maxSize: 5 * 1024 * 1024, // 5MB
      formats: ["jpg", "jpeg", "png", "gif"],
      dimensions: {
        minWidth: 400,
        minHeight: 400,
        maxWidth: 2048,
        maxHeight: 2048,
      },
    },
  },

  twitter: {
    platform: "twitter",
    canPublish: true,
    supportedContentTypes: ["text", "image", "video"],
    schedulingSupported: false, // Requires third-party tools
    maxCharacters: 280,
    maxImages: 4,
    maxVideos: 1,
    videoMaxDuration: 140,
    imageRequirements: {
      maxSize: 5 * 1024 * 1024, // 5MB
      formats: ["jpg", "jpeg", "png", "gif", "webp"],
      dimensions: {
        minWidth: 400,
        minHeight: 400,
        maxWidth: 2048,
        maxHeight: 2048,
      },
    },
  },

  tiktok: {
    platform: "tiktok",
    canPublish: false, // Analytics only for most apps
    supportedContentTypes: ["video"],
    schedulingSupported: false,
    videoMaxDuration: 60,
  },

  youtube: {
    platform: "youtube",
    canPublish: false, // Analytics only with Data API
    supportedContentTypes: ["video"],
    schedulingSupported: false,
  },

  pinterest: {
    platform: "pinterest",
    canPublish: true,
    supportedContentTypes: ["image"],
    schedulingSupported: true,
    maxCharacters: 500,
    maxImages: 1,
    imageRequirements: {
      maxSize: 10 * 1024 * 1024, // 10MB
      formats: ["jpg", "jpeg", "png"],
      dimensions: {
        minWidth: 236,
        minHeight: 200,
        maxWidth: 2048,
        maxHeight: 2048,
      },
    },
  },

  snapchat: {
    platform: "snapchat",
    canPublish: false, // Marketing API for ads only
    supportedContentTypes: ["image", "video"],
    schedulingSupported: false,
  },
};

// ====================================================================
// SOCIAL PLATFORMS MANAGER
// ====================================================================

export class SocialPlatformsManager {
  private static instance: SocialPlatformsManager;
  private platformCredentials: Map<SocialPlatform, SocialPlatformCredentials>;
  private validationCache: Map<string, Date>;

  private constructor() {
    this.platformCredentials = new Map();
    this.validationCache = new Map();
    this.initializePlatforms();
  }

  public static getInstance(): SocialPlatformsManager {
    if (!SocialPlatformsManager.instance) {
      SocialPlatformsManager.instance = new SocialPlatformsManager();
    }
    return SocialPlatformsManager.instance;
  }

  private initializePlatforms(): void {
    Object.keys(SOCIAL_PLATFORM_CONFIGS).forEach(platform => {
      this.platformCredentials.set(platform as SocialPlatform, {
        platform: platform as SocialPlatform,
        credentials: {},
        isConfigured: false,
        status: "disconnected",
      });
    });
  }

  // ====================================================================
  // PLATFORM CONFIGURATION
  // ====================================================================

  public async configurePlatform(
    platform: SocialPlatform,
    credentials: Record<string, string>
  ): Promise<{ success: boolean; message: string; accountInfo?: any }> {
    const config = SOCIAL_PLATFORM_CONFIGS[platform];
    if (!config) {
      return { success: false, message: `Platform ${platform} not supported` };
    }

    // Validate required credentials
    const missingCredentials = config.requiredCredentials
      .filter(cred => cred.required && !credentials[cred.key])
      .map(cred => cred.name);

    if (missingCredentials.length > 0) {
      return {
        success: false,
        message: `Missing required credentials: ${missingCredentials.join(", ")}`,
      };
    }

    try {
      // Test the credentials by making a basic API call
      const validation = await this.validateCredentials(platform, credentials);

      if (!validation.success) {
        return { success: false, message: validation.message };
      }

      // Store credentials and mark as configured
      this.platformCredentials.set(platform, {
        platform,
        credentials,
        isConfigured: true,
        lastValidated: new Date(),
        status: "connected",
        accountInfo: validation.accountInfo,
        rateLimits: config.rateLimits,
        permissions: config.permissions,
      });

      return {
        success: true,
        message: `${config.name} configured successfully`,
        accountInfo: validation.accountInfo,
      };
    } catch (error) {
      return {
        success: false,
        message: `Configuration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  private async validateCredentials(
    platform: SocialPlatform,
    credentials: Record<string, string>
  ): Promise<{ success: boolean; message: string; accountInfo?: any }> {
    const config = SOCIAL_PLATFORM_CONFIGS[platform];

    try {
      let response;
      let accountInfo;

      switch (platform) {
        case "instagram":
          response = await fetch(
            `${config.baseUrl}/me?fields=id,username,account_type&access_token=${credentials.access_token}`
          );
          if (response.ok) {
            accountInfo = await response.json();
          }
          break;

        case "facebook":
          response = await fetch(
            `${config.baseUrl}/me?fields=id,name&access_token=${credentials.access_token}`
          );
          if (response.ok) {
            accountInfo = await response.json();
          }
          break;

        case "linkedin":
          response = await fetch(`${config.baseUrl}/v2/me`, {
            headers: { Authorization: `Bearer ${credentials.access_token}` },
          });
          if (response.ok) {
            accountInfo = await response.json();
          }
          break;

        case "twitter":
          response = await fetch(`${config.baseUrl}/2/users/me`, {
            headers: { Authorization: `Bearer ${credentials.bearer_token}` },
          });
          if (response.ok) {
            const data = await response.json();
            accountInfo = data.data;
          }
          break;

        case "tiktok":
          response = await fetch(`${config.baseUrl}/open_api/v1.3/user/info/`, {
            headers: { Authorization: `Bearer ${credentials.access_token}` },
          });
          if (response.ok) {
            const data = await response.json();
            accountInfo = data.data?.user;
          }
          break;

        default:
          return {
            success: true,
            message: "Validation not implemented for this platform",
          };
      }

      if (response && response.ok) {
        return {
          success: true,
          message: "Credentials validated successfully",
          accountInfo,
        };
      } else {
        const errorData = response ? await response.text() : "No response";
        return {
          success: false,
          message: `API validation failed: ${errorData}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  // ====================================================================
  // STATUS AND MONITORING
  // ====================================================================

  public getPlatformStatus(
    platform: SocialPlatform
  ): SocialPlatformCredentials | null {
    return this.platformCredentials.get(platform) || null;
  }

  public getAllPlatformStatuses(): SocialPlatformCredentials[] {
    return Array.from(this.platformCredentials.values());
  }

  public getConfiguredPlatforms(): SocialPlatform[] {
    return Array.from(this.platformCredentials.entries())
      .filter(([, creds]) => creds.isConfigured)
      .map(([platform]) => platform);
  }

  public getConnectedPlatforms(): SocialPlatform[] {
    return Array.from(this.platformCredentials.entries())
      .filter(([, creds]) => creds.status === "connected")
      .map(([platform]) => platform);
  }

  public async checkAllPlatformHealth(): Promise<
    Record<SocialPlatform, boolean>
  > {
    const healthStatus: Record<string, boolean> = {};

    for (const platform of this.getConfiguredPlatforms()) {
      const credentials = this.platformCredentials.get(platform);
      if (credentials) {
        const validation = await this.validateCredentials(
          platform,
          credentials.credentials
        );
        healthStatus[platform] = validation.success;

        // Update status based on validation
        credentials.status = validation.success ? "connected" : "error";
        credentials.lastValidated = new Date();
      }
    }

    return healthStatus as Record<SocialPlatform, boolean>;
  }

  // ====================================================================
  // METRICS AND ANALYTICS
  // ====================================================================

  public async getPlatformMetrics(
    platform: SocialPlatform
  ): Promise<SocialMediaMetrics | null> {
    const credentials = this.platformCredentials.get(platform);
    if (!credentials || !credentials.isConfigured) {
      return null;
    }

    // Implementation would fetch actual metrics from each platform's API
    // This is a placeholder structure
    return {
      platform,
      accountId: credentials.accountInfo?.id || "unknown",
      metrics: {
        followers: credentials.accountInfo?.followers || 0,
        posts: 0,
        engagement_rate: 0,
        impressions_24h: 0,
        reach_24h: 0,
        likes_24h: 0,
        comments_24h: 0,
        shares_24h: 0,
      },
      timestamp: new Date(),
    };
  }

  public async getAllPlatformMetrics(): Promise<SocialMediaMetrics[]> {
    const metrics: SocialMediaMetrics[] = [];

    for (const platform of this.getConnectedPlatforms()) {
      const platformMetrics = await this.getPlatformMetrics(platform);
      if (platformMetrics) {
        metrics.push(platformMetrics);
      }
    }

    return metrics;
  }

  // ====================================================================
  // PUBLISHING CAPABILITIES
  // ====================================================================

  public getPublishingCapabilities(
    platform: SocialPlatform
  ): PublishingCapabilities | null {
    return PUBLISHING_CAPABILITIES[platform] || null;
  }

  public canPublishToPlatform(platform: SocialPlatform): boolean {
    const capabilities = this.getPublishingCapabilities(platform);
    const credentials = this.platformCredentials.get(platform);

    return !!(
      capabilities?.canPublish &&
      credentials?.isConfigured &&
      credentials.status === "connected"
    );
  }

  public getPublishingPlatforms(): SocialPlatform[] {
    return this.getConnectedPlatforms().filter(platform =>
      this.canPublishToPlatform(platform)
    );
  }

  // ====================================================================
  // CONFIGURATION MANAGEMENT
  // ====================================================================

  public exportConfiguration(): Record<SocialPlatform, any> {
    const config: Record<string, any> = {};

    this.platformCredentials.forEach((creds, platform) => {
      if (creds.isConfigured) {
        config[platform] = {
          status: creds.status,
          lastValidated: creds.lastValidated,
          accountInfo: creds.accountInfo,
          // Note: Don't export sensitive credentials
        };
      }
    });

    return config as Record<SocialPlatform, any>;
  }

  public getSetupProgress(): {
    configured: number;
    total: number;
    percentage: number;
    missing: SocialPlatform[];
  } {
    const total = Object.keys(SOCIAL_PLATFORM_CONFIGS).length;
    const configured = this.getConfiguredPlatforms().length;
    const missing = Object.keys(SOCIAL_PLATFORM_CONFIGS).filter(
      platform =>
        !this.getConfiguredPlatforms().includes(platform as SocialPlatform)
    ) as SocialPlatform[];

    return {
      configured,
      total,
      percentage: Math.round((configured / total) * 100),
      missing,
    };
  }

  // ====================================================================
  // UTILITY METHODS
  // ====================================================================

  public getPlatformConfig(platform: SocialPlatform): PlatformApiConfig | null {
    return SOCIAL_PLATFORM_CONFIGS[platform] || null;
  }

  public getSupportedPlatforms(): SocialPlatform[] {
    return Object.keys(SOCIAL_PLATFORM_CONFIGS) as SocialPlatform[];
  }

  public getPlatformsByPriority(): {
    high: SocialPlatform[];
    medium: SocialPlatform[];
    low: SocialPlatform[];
  } {
    const high: SocialPlatform[] = [];
    const medium: SocialPlatform[] = [];
    const low: SocialPlatform[] = [];

    Object.entries(SOCIAL_PLATFORM_CONFIGS).forEach(([platform, config]) => {
      // Instagram, Facebook, LinkedIn, Twitter are high priority
      if (["instagram", "facebook", "linkedin", "twitter"].includes(platform)) {
        high.push(platform as SocialPlatform);
      }
      // TikTok, YouTube are medium priority
      else if (["tiktok", "youtube"].includes(platform)) {
        medium.push(platform as SocialPlatform);
      }
      // Pinterest, Snapchat are low priority
      else {
        low.push(platform as SocialPlatform);
      }
    });

    return { high, medium, low };
  }
}

// Export singleton instance
export const socialPlatformsManager = SocialPlatformsManager.getInstance();

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

export function createPlatformAuthUrl(
  platform: SocialPlatform,
  clientId: string,
  redirectUri: string
): string | null {
  const config = SOCIAL_PLATFORM_CONFIGS[platform];
  if (!config) return null;

  const baseAuthUrl = `${config.baseUrl}${config.endpoints.auth}`;
  const scopes = config.permissions.join(",");

  switch (platform) {
    case "instagram":
    case "facebook":
      return `${baseAuthUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code`;

    case "linkedin":
      return `${baseAuthUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

    case "twitter":
      return `${baseAuthUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=social-media-setup`;

    default:
      return null;
  }
}

export function formatPlatformName(platform: SocialPlatform): string {
  const names: Record<SocialPlatform, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    twitter: "Twitter/X",
    tiktok: "TikTok",
    youtube: "YouTube",
    pinterest: "Pinterest",
    snapchat: "Snapchat",
  };

  return names[platform] || platform;
}

export function getPlatformIcon(platform: SocialPlatform): string {
  const icons: Record<SocialPlatform, string> = {
    instagram: "📸",
    facebook: "👥",
    linkedin: "💼",
    twitter: "🐦",
    tiktok: "🎵",
    youtube: "📺",
    pinterest: "📌",
    snapchat: "👻",
  };

  return icons[platform] || "📱";
}

export default SocialPlatformsManager;
