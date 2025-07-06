import { logger } from "../../logger";
import {
  type UnifiedAnalytics,
  type SocialPlatform,
  type InstagramInsights,
  type LinkedInPostAnalytics,
  type FacebookPostInsights,
  type TwitterAnalytics,
  type TikTokVideoAnalytics,
} from "./index";

// Normalized metrics interface for consistent data structure
export interface NormalizedMetrics {
  platform: SocialPlatform;
  postId: string;
  impressions: number;
  reach: number;
  engagement: number;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  clicks?: number;
  views?: number;
  videoViews?: number;
  profileViews?: number;
  period: string;
  timestamp: string;
  rawData: any;
  platformSpecific: Record<string, any>;
}

// Platform-specific mapping configurations
interface PlatformMappingConfig {
  impressionsField: string;
  reachField: string;
  likesField: string;
  commentsField: string;
  sharesField: string;
  savesField?: string;
  clicksField?: string;
  viewsField?: string;
  videoViewsField?: string;
  profileViewsField?: string;
  customFields?: Record<string, string>;
}

// Data Normalizer Class
export class DataNormalizer {
  private platformConfigs: Record<SocialPlatform, PlatformMappingConfig> = {
    instagram: {
      impressionsField: "impressions",
      reachField: "reach",
      likesField: "likes",
      commentsField: "comments",
      sharesField: "shares",
      savesField: "saves",
      clicksField: "websiteClicks",
      viewsField: "plays",
      videoViewsField: "plays",
      profileViewsField: "profileViews",
      customFields: {
        replays: "replays",
        tapsForward: "tapsForward",
        tapsBack: "tapsBack",
        exits: "exits",
      },
    },
    linkedin: {
      impressionsField: "impressions",
      reachField: "uniqueImpressions",
      likesField: "reactions",
      commentsField: "comments",
      sharesField: "shares",
      clicksField: "clicks",
      customFields: {
        follows: "follows",
        viralImpressions: "viralImpressions",
        organicImpressions: "organicImpressions",
        paidImpressions: "paidImpressions",
        clickThroughRate: "clickThroughRate",
      },
    },
    facebook: {
      impressionsField: "impressions",
      reachField: "reach",
      likesField: "reactions",
      commentsField: "comments",
      sharesField: "shares",
      clicksField: "clicks",
      viewsField: "views",
      videoViewsField: "views",
      customFields: {
        impressionsUnique: "impressionsUnique",
        impressionsPaid: "impressionsPaid",
        impressionsOrganic: "impressionsOrganic",
        reachPaid: "reachPaid",
        reachOrganic: "reachOrganic",
        linkClicks: "linkClicks",
        photoViews: "photoViews",
        videoViewsComplete: "videoViewsComplete",
        avgTimeWatched: "avgTimeWatched",
      },
    },
    twitter: {
      impressionsField: "impressions",
      reachField: "impressions", // Twitter doesn't separate reach from impressions in basic metrics
      likesField: "likes",
      commentsField: "replies",
      sharesField: "retweets",
      savesField: "bookmarks",
      clicksField: "urlClicks",
      customFields: {
        quotes: "quotes",
        hashtagClicks: "hashtagClicks",
        detailExpands: "detailExpands",
        mediaViews: "mediaViews",
        mediaEngagements: "mediaEngagements",
        videoViews: "videoViews",
        videoCompletions: "videoCompletions",
      },
    },
    tiktok: {
      impressionsField: "impressions",
      reachField: "reach",
      likesField: "likeCount",
      commentsField: "commentCount",
      sharesField: "shareCount",
      viewsField: "viewCount",
      videoViewsField: "viewCount",
      profileViewsField: "profileViews",
      customFields: {
        playTime: "playTime",
        averageWatchTime: "averageWatchTime",
        fullVideoWatches: "fullVideoWatches",
        uniqueViews: "uniqueViews",
        clickThroughRate: "clickThroughRate",
      },
    },
  };

  constructor() {
    logger.info("DataNormalizer initialized with platform configurations");
  }

  // Normalize Instagram analytics
  normalizeInstagramData(
    data: InstagramInsights,
    postId?: string
  ): NormalizedMetrics {
    const config = this.platformConfigs.instagram;

    const impressions = this.getFieldValue(data, config.impressionsField);
    const reach = this.getFieldValue(data, config.reachField);
    const likes = this.getFieldValue(data, config.likesField);
    const comments = this.getFieldValue(data, config.commentsField);
    const shares = this.getFieldValue(data, config.sharesField);
    const engagement = likes + comments + shares;

    return {
      platform: "instagram",
      postId: postId || data.mediaId,
      impressions,
      reach,
      engagement,
      engagementRate: impressions > 0 ? (engagement / impressions) * 100 : 0,
      likes,
      comments,
      shares,
      saves: this.getFieldValue(data, config.savesField),
      clicks: this.getFieldValue(data, config.clicksField),
      views: this.getFieldValue(data, config.viewsField),
      videoViews: this.getFieldValue(data, config.videoViewsField),
      profileViews: this.getFieldValue(data, config.profileViewsField),
      period: data.period,
      timestamp: data.endTime,
      rawData: data,
      platformSpecific: this.extractPlatformSpecific(
        data,
        config.customFields || {}
      ),
    };
  }

  // Normalize LinkedIn analytics
  normalizeLinkedInData(
    data: LinkedInPostAnalytics,
    postId?: string
  ): NormalizedMetrics {
    const config = this.platformConfigs.linkedin;

    const impressions = this.getFieldValue(data, config.impressionsField);
    const reach = this.getFieldValue(data, config.reachField);
    const likes = this.getFieldValue(data, config.likesField);
    const comments = this.getFieldValue(data, config.commentsField);
    const shares = this.getFieldValue(data, config.sharesField);
    const engagement = likes + comments + shares;

    return {
      platform: "linkedin",
      postId: postId || data.postId,
      impressions,
      reach,
      engagement,
      engagementRate: data.engagementRate || 0,
      likes,
      comments,
      shares,
      clicks: this.getFieldValue(data, config.clicksField),
      period: data.period,
      timestamp: data.endDate,
      rawData: data,
      platformSpecific: this.extractPlatformSpecific(
        data,
        config.customFields || {}
      ),
    };
  }

  // Normalize Facebook analytics
  normalizeFacebookData(
    data: FacebookPostInsights,
    postId?: string
  ): NormalizedMetrics {
    const config = this.platformConfigs.facebook;

    const impressions = this.getFieldValue(data, config.impressionsField);
    const reach = this.getFieldValue(data, config.reachField);
    const likes = this.getFieldValue(data, config.likesField);
    const comments = this.getFieldValue(data, config.commentsField);
    const shares = this.getFieldValue(data, config.sharesField);
    const engagement = (data.engagement || 0) + likes + comments + shares;

    return {
      platform: "facebook",
      postId: postId || data.postId,
      impressions,
      reach,
      engagement,
      engagementRate: impressions > 0 ? (engagement / impressions) * 100 : 0,
      likes,
      comments,
      shares,
      clicks: this.getFieldValue(data, config.clicksField),
      views: this.getFieldValue(data, config.viewsField),
      videoViews: this.getFieldValue(data, config.videoViewsField),
      period: data.period,
      timestamp: data.endTime,
      rawData: data,
      platformSpecific: this.extractPlatformSpecific(
        data,
        config.customFields || {}
      ),
    };
  }

  // Normalize Twitter analytics
  normalizeTwitterData(
    data: TwitterAnalytics,
    postId?: string
  ): NormalizedMetrics {
    const config = this.platformConfigs.twitter;

    const impressions = this.getFieldValue(data, config.impressionsField);
    const reach = this.getFieldValue(data, config.reachField);
    const likes = this.getFieldValue(data, config.likesField);
    const comments = this.getFieldValue(data, config.commentsField);
    const shares = this.getFieldValue(data, config.sharesField);
    const engagement = data.engagements || likes + comments + shares;

    return {
      platform: "twitter",
      postId: postId || data.tweetId,
      impressions,
      reach,
      engagement,
      engagementRate: data.engagementRate || 0,
      likes,
      comments,
      shares,
      saves: this.getFieldValue(data, config.savesField),
      clicks: this.getFieldValue(data, config.clicksField),
      videoViews: this.getFieldValue(data, config.customFields?.videoViews),
      period: data.period,
      timestamp: data.endTime,
      rawData: data,
      platformSpecific: this.extractPlatformSpecific(
        data,
        config.customFields || {}
      ),
    };
  }

  // Normalize TikTok analytics
  normalizeTikTokData(
    data: TikTokVideoAnalytics,
    postId?: string
  ): NormalizedMetrics {
    const config = this.platformConfigs.tiktok;

    const impressions = this.getFieldValue(data, config.impressionsField);
    const reach = this.getFieldValue(data, config.reachField);
    const likes = this.getFieldValue(data, config.likesField);
    const comments = this.getFieldValue(data, config.commentsField);
    const shares = this.getFieldValue(data, config.sharesField);
    const engagement = data.engagement || likes + comments + shares;

    return {
      platform: "tiktok",
      postId: postId || data.videoId,
      impressions,
      reach,
      engagement,
      engagementRate: data.engagementRate || 0,
      likes,
      comments,
      shares,
      views: this.getFieldValue(data, config.viewsField),
      videoViews: this.getFieldValue(data, config.videoViewsField),
      profileViews: this.getFieldValue(data, config.profileViewsField),
      period: data.period,
      timestamp: new Date().toISOString(),
      rawData: data,
      platformSpecific: this.extractPlatformSpecific(
        data,
        config.customFields || {}
      ),
    };
  }

  // Generic normalization method
  normalizeData(
    platform: SocialPlatform,
    data: any,
    postId?: string
  ): NormalizedMetrics {
    switch (platform) {
      case "instagram":
        return this.normalizeInstagramData(data, postId);
      case "linkedin":
        return this.normalizeLinkedInData(data, postId);
      case "facebook":
        return this.normalizeFacebookData(data, postId);
      case "twitter":
        return this.normalizeTwitterData(data, postId);
      case "tiktok":
        return this.normalizeTikTokData(data, postId);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Batch normalize multiple data points
  batchNormalizeData(
    items: Array<{
      platform: SocialPlatform;
      data: any;
      postId?: string;
    }>
  ): NormalizedMetrics[] {
    logger.info("Starting batch data normalization", {
      totalItems: items.length,
    });

    const normalized: NormalizedMetrics[] = [];
    const errors: Array<{ item: any; error: string }> = [];

    for (const item of items) {
      try {
        const normalizedData = this.normalizeData(
          item.platform,
          item.data,
          item.postId
        );
        normalized.push(normalizedData);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push({ item, error: errorMessage });
        logger.warn("Failed to normalize data item", {
          platform: item.platform,
          postId: item.postId,
          error: errorMessage,
        });
      }
    }

    logger.info("Batch data normalization completed", {
      successful: normalized.length,
      errors: errors.length,
    });

    return normalized;
  }

  // Aggregate normalized data across platforms
  aggregateNormalizedData(data: NormalizedMetrics[]): {
    totalImpressions: number;
    totalReach: number;
    totalEngagement: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    averageEngagementRate: number;
    platformBreakdown: Array<{
      platform: SocialPlatform;
      count: number;
      impressions: number;
      engagement: number;
      engagementRate: number;
    }>;
    topPerformers: NormalizedMetrics[];
    period: string;
  } {
    const totals = data.reduce(
      (acc, item) => ({
        impressions: acc.impressions + item.impressions,
        reach: acc.reach + item.reach,
        engagement: acc.engagement + item.engagement,
        likes: acc.likes + item.likes,
        comments: acc.comments + item.comments,
        shares: acc.shares + item.shares,
        engagementRateSum: acc.engagementRateSum + item.engagementRate,
      }),
      {
        impressions: 0,
        reach: 0,
        engagement: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagementRateSum: 0,
      }
    );

    // Platform breakdown
    const platformMap = new Map<SocialPlatform, NormalizedMetrics[]>();
    data.forEach(item => {
      if (!platformMap.has(item.platform)) {
        platformMap.set(item.platform, []);
      }
      platformMap.get(item.platform)!.push(item);
    });

    const platformBreakdown = Array.from(platformMap.entries()).map(
      ([platform, items]) => {
        const platformTotals = items.reduce(
          (acc, item) => ({
            impressions: acc.impressions + item.impressions,
            engagement: acc.engagement + item.engagement,
            engagementRateSum: acc.engagementRateSum + item.engagementRate,
          }),
          { impressions: 0, engagement: 0, engagementRateSum: 0 }
        );

        return {
          platform,
          count: items.length,
          impressions: platformTotals.impressions,
          engagement: platformTotals.engagement,
          engagementRate:
            items.length > 0
              ? platformTotals.engagementRateSum / items.length
              : 0,
        };
      }
    );

    // Top performers (top 10% by engagement rate)
    const sortedByEngagement = [...data].sort(
      (a, b) => b.engagementRate - a.engagementRate
    );
    const topPerformers = sortedByEngagement.slice(
      0,
      Math.max(1, Math.ceil(data.length * 0.1))
    );

    return {
      totalImpressions: totals.impressions,
      totalReach: totals.reach,
      totalEngagement: totals.engagement,
      totalLikes: totals.likes,
      totalComments: totals.comments,
      totalShares: totals.shares,
      averageEngagementRate:
        data.length > 0 ? totals.engagementRateSum / data.length : 0,
      platformBreakdown,
      topPerformers,
      period: this.determinePeriod(data),
    };
  }

  // Convert normalized data to UnifiedAnalytics format
  toUnifiedAnalytics(data: NormalizedMetrics): UnifiedAnalytics {
    return {
      platform: data.platform,
      postId: data.postId,
      impressions: data.impressions,
      reach: data.reach,
      engagement: data.engagement,
      likes: data.likes,
      comments: data.comments,
      shares: data.shares,
      clicks: data.clicks,
      saves: data.saves,
      period: data.period,
      timestamp: data.timestamp,
      metadata: {
        engagementRate: data.engagementRate,
        views: data.views,
        videoViews: data.videoViews,
        profileViews: data.profileViews,
        platformSpecific: data.platformSpecific,
      },
    };
  }

  // Utility Methods
  private getFieldValue(data: any, fieldPath?: string): number {
    if (!fieldPath || !data) return 0;

    const keys = fieldPath.split(".");
    let value = data;

    for (const key of keys) {
      value = value?.[key];
    }

    return typeof value === "number" ? value : 0;
  }

  private extractPlatformSpecific(
    data: any,
    customFields: Record<string, string>
  ): Record<string, any> {
    const specific: Record<string, any> = {};

    Object.entries(customFields).forEach(([key, fieldPath]) => {
      const value = this.getFieldValue(data, fieldPath);
      if (value !== undefined && value !== null) {
        specific[key] = value;
      }
    });

    return specific;
  }

  private determinePeriod(data: NormalizedMetrics[]): string {
    const periods = data.map(item => item.period);
    const mostCommon = periods.reduce(
      (acc, period) => {
        acc[period] = (acc[period] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(mostCommon).reduce((a, b) =>
      mostCommon[a[0]] > mostCommon[b[0]] ? a : b
    )[0];
  }

  // Data validation
  validateNormalizedData(data: NormalizedMetrics): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data.platform) errors.push("Platform is required");
    if (!data.postId) errors.push("Post ID is required");
    if (data.impressions < 0) errors.push("Impressions cannot be negative");
    if (data.reach < 0) errors.push("Reach cannot be negative");
    if (data.engagement < 0) errors.push("Engagement cannot be negative");

    // Logical validations
    if (data.reach > data.impressions) {
      warnings.push("Reach is greater than impressions, which is unusual");
    }

    if (data.engagement > data.impressions) {
      warnings.push("Engagement is greater than impressions, which is unusual");
    }

    if (data.engagementRate > 100) {
      warnings.push("Engagement rate is over 100%, which is unusual");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Export normalized data to CSV format
  exportToCSV(data: NormalizedMetrics[]): string {
    if (data.length === 0) return "";

    const headers = [
      "platform",
      "postId",
      "impressions",
      "reach",
      "engagement",
      "engagementRate",
      "likes",
      "comments",
      "shares",
      "saves",
      "clicks",
      "views",
      "videoViews",
      "profileViews",
      "period",
      "timestamp",
    ];

    const csvRows = [headers.join(",")];

    data.forEach(item => {
      const row = [
        item.platform,
        item.postId,
        item.impressions,
        item.reach,
        item.engagement,
        item.engagementRate.toFixed(2),
        item.likes,
        item.comments,
        item.shares,
        item.saves || 0,
        item.clicks || 0,
        item.views || 0,
        item.videoViews || 0,
        item.profileViews || 0,
        item.period,
        item.timestamp,
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }
}

// Factory function
export function createDataNormalizer(): DataNormalizer {
  return new DataNormalizer();
}

export default DataNormalizer;
