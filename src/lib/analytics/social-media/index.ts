// Instagram Business API
export {
  InstagramBusinessApiClient,
  createInstagramBusinessApiClient,
  type InstagramBusinessConfig,
  type InstagramMedia,
  type InstagramInsights,
  type InstagramAccountInsights,
  type InstagramAudienceInsights,
  type InstagramStoryInsights,
  type InstagramHashtagPerformance,
} from "./instagram-business-api";

// LinkedIn API
export {
  LinkedInApiClient,
  createLinkedInApiClient,
  type LinkedInConfig,
  type LinkedInPost,
  type LinkedInPostAnalytics,
  type LinkedInCompanyAnalytics,
  type LinkedInAudienceInsights,
  type LinkedInShareStatistics,
} from "./linkedin-api";

// Facebook Graph API
export {
  FacebookGraphApiClient,
  createFacebookGraphApiClient,
  type FacebookConfig,
  type FacebookPost,
  type FacebookPostInsights,
  type FacebookPageInsights,
  type FacebookVideoInsights,
  type FacebookAudienceInsights,
} from "./facebook-graph-api";

// Twitter API
export {
  TwitterApiClient,
  createTwitterApiClient,
  type TwitterConfig,
  type TwitterTweet,
  type TwitterUserMetrics,
  type TwitterAnalytics,
  type TwitterAudienceInsights,
} from "./twitter-api";

// TikTok Business API
export {
  TikTokBusinessApiClient,
  createTikTokBusinessApiClient,
  type TikTokConfig,
  type TikTokVideo,
  type TikTokVideoAnalytics,
  type TikTokAccountAnalytics,
  type TikTokAudienceInsights,
  type TikTokHashtagPerformance,
} from "./tiktok-business-api";

// Unified Analytics Manager
export { SocialMediaAnalyticsManager } from "./analytics-manager";
export { DataNormalizer } from "./data-normalizer";
export { KPICalculator } from "./kpi-calculator";
export { AnalyticsCollector } from "./analytics-collector";

// Common Types
export type SocialPlatform =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "twitter"
  | "tiktok";

export interface PlatformConfig {
  platform: SocialPlatform;
  enabled: boolean;
  config: any;
  priority: number;
}

export interface UnifiedAnalytics {
  platform: SocialPlatform;
  postId: string;
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  clicks?: number;
  saves?: number;
  period: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CrossPlatformInsights {
  totalImpressions: number;
  totalReach: number;
  totalEngagement: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageEngagementRate: number;
  topPerformingPlatform: SocialPlatform;
  platformBreakdown: Array<{
    platform: SocialPlatform;
    impressions: number;
    engagement: number;
    engagementRate: number;
  }>;
  period: string;
  generatedAt: string;
}
