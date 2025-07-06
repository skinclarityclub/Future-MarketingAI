/**
 * SKC BI Dashboard - Social Media Platforms Manager
 * Comprehensive configuration and management for all social media API integrations
 */

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "twitter"
  | "tiktok"
  | "youtube";

export interface PlatformCredentials {
  platform: SocialPlatform;
  credentials: Record<string, string>;
  isConfigured: boolean;
  lastValidated?: Date;
  status: "connected" | "disconnected" | "error" | "pending";
  accountInfo?: {
    id: string;
    name: string;
    username?: string;
    followers?: number;
    verified?: boolean;
  };
}

export interface PlatformConfig {
  platform: SocialPlatform;
  name: string;
  baseUrl: string;
  authType: "oauth2" | "api_key";
  requiredCredentials: Array<{
    key: string;
    name: string;
    required: boolean;
    sensitive: boolean;
  }>;
  permissions: string[];
  rateLimits: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
  features: string[];
  documentation: string;
}

// ====================================================================
// PLATFORM CONFIGURATIONS
// ====================================================================

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  instagram: {
    platform: "instagram",
    name: "Instagram Business API",
    baseUrl: "https://graph.facebook.com",
    authType: "oauth2",
    requiredCredentials: [
      { key: "app_id", name: "App ID", required: true, sensitive: false },
      {
        key: "app_secret",
        name: "App Secret",
        required: true,
        sensitive: true,
      },
      {
        key: "access_token",
        name: "Access Token",
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
    },
    features: ["Analytics", "Publishing", "Stories", "Reels"],
    documentation: "https://developers.facebook.com/docs/instagram-api",
  },

  facebook: {
    platform: "facebook",
    name: "Facebook Graph API",
    baseUrl: "https://graph.facebook.com",
    authType: "oauth2",
    requiredCredentials: [
      { key: "app_id", name: "App ID", required: true, sensitive: false },
      {
        key: "app_secret",
        name: "App Secret",
        required: true,
        sensitive: true,
      },
      {
        key: "access_token",
        name: "Page Access Token",
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
    requiredCredentials: [
      { key: "client_id", name: "Client ID", required: true, sensitive: false },
      {
        key: "client_secret",
        name: "Client Secret",
        required: true,
        sensitive: true,
      },
      {
        key: "access_token",
        name: "Access Token",
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
    features: ["Analytics", "Publishing", "Company Page Management"],
    documentation: "https://docs.microsoft.com/en-us/linkedin/",
  },

  twitter: {
    platform: "twitter",
    name: "Twitter/X API v2",
    baseUrl: "https://api.twitter.com",
    authType: "oauth2",
    requiredCredentials: [
      { key: "api_key", name: "API Key", required: true, sensitive: true },
      {
        key: "api_secret",
        name: "API Secret",
        required: true,
        sensitive: true,
      },
      {
        key: "bearer_token",
        name: "Bearer Token",
        required: true,
        sensitive: true,
      },
    ],
    permissions: ["tweet.read", "tweet.write", "users.read"],
    rateLimits: {
      requestsPerHour: 300,
      requestsPerDay: 7200,
    },
    features: ["Analytics", "Publishing", "Trending Topics"],
    documentation: "https://developer.twitter.com/en/docs/twitter-api",
  },

  tiktok: {
    platform: "tiktok",
    name: "TikTok Business API",
    baseUrl: "https://business-api.tiktok.com",
    authType: "oauth2",
    requiredCredentials: [
      { key: "app_id", name: "App ID", required: true, sensitive: false },
      {
        key: "app_secret",
        name: "App Secret",
        required: true,
        sensitive: true,
      },
      {
        key: "access_token",
        name: "Access Token",
        required: true,
        sensitive: true,
      },
    ],
    permissions: ["user_info.basic", "video.list", "video.insights"],
    rateLimits: {
      requestsPerHour: 100,
      requestsPerDay: 2400,
    },
    features: ["Analytics", "Video Insights", "Creator Insights"],
    documentation: "https://business.tiktok.com/portal/docs/introduction",
  },

  youtube: {
    platform: "youtube",
    name: "YouTube Data API v3",
    baseUrl: "https://www.googleapis.com",
    authType: "api_key",
    requiredCredentials: [
      { key: "api_key", name: "API Key", required: true, sensitive: true },
      {
        key: "client_id",
        name: "OAuth Client ID",
        required: false,
        sensitive: false,
      },
    ],
    permissions: ["https://www.googleapis.com/auth/youtube.readonly"],
    rateLimits: {
      requestsPerHour: 10000,
      requestsPerDay: 1000000,
    },
    features: ["Analytics", "Channel Insights", "Video Performance"],
    documentation: "https://developers.google.com/youtube/v3",
  },
};

// ====================================================================
// SOCIAL PLATFORMS MANAGER
// ====================================================================

export class SocialPlatformsManager {
  private static instance: SocialPlatformsManager;
  private platformCredentials: Map<SocialPlatform, PlatformCredentials>;

  private constructor() {
    this.platformCredentials = new Map();
    this.initializePlatforms();
  }

  public static getInstance(): SocialPlatformsManager {
    if (!SocialPlatformsManager.instance) {
      SocialPlatformsManager.instance = new SocialPlatformsManager();
    }
    return SocialPlatformsManager.instance;
  }

  private initializePlatforms(): void {
    Object.keys(PLATFORM_CONFIGS).forEach(platform => {
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
    const config = PLATFORM_CONFIGS[platform];
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
      // Test credentials with validation
      const validation = await this.validateCredentials(platform, credentials);

      if (!validation.success) {
        return { success: false, message: validation.message };
      }

      // Store credentials
      this.platformCredentials.set(platform, {
        platform,
        credentials,
        isConfigured: true,
        lastValidated: new Date(),
        status: "connected",
        accountInfo: validation.accountInfo,
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
    const config = PLATFORM_CONFIGS[platform];

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

        case "youtube":
          response = await fetch(
            `${config.baseUrl}/youtube/v3/channels?part=snippet&mine=true&key=${credentials.api_key}`
          );
          if (response.ok) {
            const data = await response.json();
            accountInfo = data.items?.[0]?.snippet;
          }
          break;

        default:
          return { success: true, message: "Validation not implemented" };
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
  ): PlatformCredentials | null {
    return this.platformCredentials.get(platform) || null;
  }

  public getAllPlatformStatuses(): PlatformCredentials[] {
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

  public getPlatformConfig(platform: SocialPlatform): PlatformConfig | null {
    return PLATFORM_CONFIGS[platform] || null;
  }

  public getSupportedPlatforms(): SocialPlatform[] {
    return Object.keys(PLATFORM_CONFIGS) as SocialPlatform[];
  }

  public getSetupProgress(): {
    configured: number;
    total: number;
    percentage: number;
    missing: SocialPlatform[];
  } {
    const total = Object.keys(PLATFORM_CONFIGS).length;
    const configured = this.getConfiguredPlatforms().length;
    const missing = Object.keys(PLATFORM_CONFIGS).filter(
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
}

// Export singleton instance
export const socialPlatformsManager = SocialPlatformsManager.getInstance();

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

export function formatPlatformName(platform: SocialPlatform): string {
  const names: Record<SocialPlatform, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    twitter: "Twitter/X",
    tiktok: "TikTok",
    youtube: "YouTube",
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
  };

  return icons[platform] || "📱";
}

export default SocialPlatformsManager;
