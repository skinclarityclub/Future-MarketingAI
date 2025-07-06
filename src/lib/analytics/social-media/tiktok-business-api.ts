import { logger } from "../../logger";

// TikTok Business API Configuration
export interface TikTokConfig {
  accessToken: string;
  appId: string;
  secret: string;
  businessAccountId: string;
  baseUrl?: string;
}

// TikTok Video Object
export interface TikTokVideo {
  videoId: string;
  caption: string;
  videoDescription: string;
  shareCover: string;
  shareUrl: string;
  embedHtml: string;
  embedLink: string;
  createTime: number;
  duration: number;
  height: number;
  width: number;
  videoStatus: "processing" | "ready" | "deleted" | "blocked";
  visibility: "public" | "mutual_follow_friends" | "self_only";
}

// TikTok Video Analytics
export interface TikTokVideoAnalytics {
  videoId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  playTime: number;
  reach: number;
  engagement: number;
  engagementRate: number;
  averageWatchTime: number;
  fullVideoWatches: number;
  profileViews: number;
  uniqueViews: number;
  impressions: number;
  clickThroughRate: number;
  period: "lifetime" | "7days" | "28days";
  dimensions: {
    country?: Array<{
      countryCode: string;
      views: number;
    }>;
    gender?: Array<{
      gender: "male" | "female";
      percentage: number;
    }>;
    age?: Array<{
      ageGroup: string;
      percentage: number;
    }>;
    activity?: Array<{
      hour: number;
      views: number;
    }>;
  };
}

// TikTok Account Analytics
export interface TikTokAccountAnalytics {
  accountId: string;
  followerCount: number;
  followingCount: number;
  likesCount: number;
  videoCount: number;
  profileViews: number;
  videoViews: number;
  engagement: number;
  avgEngagementRate: number;
  followerGrowth: Array<{
    date: string;
    count: number;
  }>;
  viewsGrowth: Array<{
    date: string;
    views: number;
  }>;
  period: "7days" | "28days" | "lifetime";
}

// TikTok Audience Insights
export interface TikTokAudienceInsights {
  accountId: string;
  totalFollowers: number;
  audienceGender: Array<{
    gender: "male" | "female";
    percentage: number;
  }>;
  audienceAge: Array<{
    ageGroup: string;
    percentage: number;
  }>;
  audienceCountries: Array<{
    countryCode: string;
    countryName: string;
    percentage: number;
  }>;
  audienceActivity: Array<{
    hour: number;
    activeFollowers: number;
  }>;
  audienceDevices: Array<{
    deviceType: string;
    percentage: number;
  }>;
  period: "lifetime";
}

// TikTok Hashtag Performance
export interface TikTokHashtagPerformance {
  hashtag: string;
  viewCount: number;
  videoCount: number;
  trending: boolean;
  relatedHashtags: string[];
}

// API Response Types
export interface TikTokApiResponse<T> {
  data: T;
  error?: {
    code: string;
    message: string;
    logId: string;
  };
}

export interface TikTokListResponse<T> {
  data: {
    videos?: T[];
    hasMore: boolean;
    cursor?: string;
  };
  error?: {
    code: string;
    message: string;
    logId: string;
  };
}

// TikTok Business API Client
export class TikTokBusinessApiClient {
  private config: TikTokConfig;
  private baseUrl: string;
  private rateLimitInfo: {
    callCount: number;
    totalTime: number;
    resetTime: Date;
    remainingRequests: number;
  } = {
    callCount: 0,
    totalTime: 0,
    resetTime: new Date(),
    remainingRequests: 1000, // TikTok default daily limit
  };

  constructor(config: TikTokConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://business-api.tiktok.com";

    if (!config.accessToken) {
      throw new Error("TikTok Business API access token is required");
    }

    if (!config.businessAccountId) {
      throw new Error("TikTok Business Account ID is required");
    }

    logger.info("TikTok Business API client initialized", {
      baseUrl: this.baseUrl,
      accountId: config.businessAccountId,
      hasAccessToken: !!config.accessToken,
    });
  }

  // Make API Request
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: string;
      params?: Record<string, string>;
      apiVersion?: string;
    } = {}
  ): Promise<T> {
    const apiVersion = options.apiVersion || "v1.3";
    const url = new URL(`${this.baseUrl}/${apiVersion}${endpoint}`);

    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const requestOptions: RequestInit = {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
        "User-Agent": "SKC-BI-Dashboard/1.0",
      },
    };

    if (options.body) {
      requestOptions.body = options.body;
    }

    try {
      const startTime = Date.now();
      const response = await fetch(url.toString(), requestOptions);
      const requestTime = Date.now() - startTime;

      // Update rate limit tracking
      this.updateRateLimitTracking(requestTime);

      const data = await response.json();

      if (!response.ok || data.error) {
        logger.error("TikTok Business API request failed", {
          endpoint: url.toString(),
          status: response.status,
          error: data.error,
        });

        throw new Error(
          `TikTok API Error: ${data.error?.message || "Unknown error"} (Code: ${data.error?.code || response.status})`
        );
      }

      logger.debug("TikTok Business API request successful", {
        endpoint,
        method: options.method || "GET",
        responseTime: requestTime,
      });

      return data;
    } catch (error) {
      logger.error("TikTok Business API request error", {
        endpoint,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private updateRateLimitTracking(requestTime: number): void {
    this.rateLimitInfo.callCount++;
    this.rateLimitInfo.totalTime += requestTime;

    // Reset daily tracking
    const now = new Date();
    if (now.getDate() !== this.rateLimitInfo.resetTime.getDate()) {
      this.rateLimitInfo = {
        callCount: 1,
        totalTime: requestTime,
        resetTime: now,
        remainingRequests: 999,
      };
    } else {
      this.rateLimitInfo.remainingRequests--;
    }
  }

  // Get Account Information
  async getAccountInfo(): Promise<{
    businessId: string;
    name: string;
    email: string;
    status: string;
    createTime: number;
    timezone: string;
    currency: string;
  }> {
    logger.info("Fetching TikTok account information", {
      accountId: this.config.businessAccountId,
    });

    const response = await this.makeRequest<TikTokApiResponse<any>>(
      "/business/get/",
      {
        params: {
          business_id: this.config.businessAccountId,
        },
      }
    );

    const account = response.data;
    return {
      businessId: account.business_id,
      name: account.name,
      email: account.email,
      status: account.status,
      createTime: account.create_time,
      timezone: account.timezone,
      currency: account.currency,
    };
  }

  // Get Videos List
  async getVideos(
    options: {
      cursor?: string;
      count?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<TikTokListResponse<TikTokVideo>> {
    logger.info("Fetching TikTok videos", {
      accountId: this.config.businessAccountId,
      options,
    });

    const params: Record<string, string> = {
      business_id: this.config.businessAccountId,
    };

    if (options.cursor) params.cursor = options.cursor;
    if (options.count) params.count = Math.min(options.count, 100).toString();
    if (options.startDate) params.start_date = options.startDate;
    if (options.endDate) params.end_date = options.endDate;

    const response = await this.makeRequest<TikTokListResponse<any>>(
      "/business/video/list/",
      { params }
    );

    return {
      data: {
        videos:
          response.data.videos?.map((video: any) => ({
            videoId: video.video_id,
            caption: video.caption,
            videoDescription: video.video_description,
            shareCover: video.share_cover,
            shareUrl: video.share_url,
            embedHtml: video.embed_html,
            embedLink: video.embed_link,
            createTime: video.create_time,
            duration: video.duration,
            height: video.height,
            width: video.width,
            videoStatus: video.video_status,
            visibility: video.visibility,
          })) || [],
        hasMore: response.data.hasMore,
        cursor: response.data.cursor,
      },
      error: response.error,
    };
  }

  // Get Video Analytics
  async getVideoAnalytics(
    videoId: string,
    metrics: string[] = [
      "view_count",
      "like_count",
      "comment_count",
      "share_count",
      "play_time",
      "reach",
      "engagement",
      "average_watch_time",
      "full_video_watches",
      "profile_views",
    ],
    dimensions: string[] = ["country", "gender", "age"]
  ): Promise<TikTokVideoAnalytics> {
    logger.info("Fetching TikTok video analytics", {
      videoId,
      metrics,
      dimensions,
    });

    const response = await this.makeRequest<TikTokApiResponse<any>>(
      "/business/video/analytics/",
      {
        method: "POST",
        body: JSON.stringify({
          business_id: this.config.businessAccountId,
          video_id: videoId,
          metrics,
          dimensions,
          data_level: "video",
          report_type: "basic",
        }),
      }
    );

    const data = response.data;
    const videoMetrics = data.list?.[0]?.metrics || {};
    const dimensionData = data.list?.[0]?.dimensions || {};

    const views = videoMetrics.view_count || 0;
    const likes = videoMetrics.like_count || 0;
    const comments = videoMetrics.comment_count || 0;
    const shares = videoMetrics.share_count || 0;
    const engagement = likes + comments + shares;

    return {
      videoId,
      viewCount: views,
      likeCount: likes,
      commentCount: comments,
      shareCount: shares,
      playTime: videoMetrics.play_time || 0,
      reach: videoMetrics.reach || views,
      engagement,
      engagementRate: views > 0 ? (engagement / views) * 100 : 0,
      averageWatchTime: videoMetrics.average_watch_time || 0,
      fullVideoWatches: videoMetrics.full_video_watches || 0,
      profileViews: videoMetrics.profile_views || 0,
      uniqueViews: videoMetrics.unique_views || views,
      impressions: videoMetrics.impressions || views,
      clickThroughRate: videoMetrics.click_through_rate || 0,
      period: "lifetime",
      dimensions: {
        country:
          dimensionData.country?.map((item: any) => ({
            countryCode: item.dimension_value,
            views: item.metrics?.view_count || 0,
          })) || [],
        gender:
          dimensionData.gender?.map((item: any) => ({
            gender: item.dimension_value,
            percentage: item.percentage || 0,
          })) || [],
        age:
          dimensionData.age?.map((item: any) => ({
            ageGroup: item.dimension_value,
            percentage: item.percentage || 0,
          })) || [],
        activity:
          dimensionData.activity?.map((item: any) => ({
            hour: parseInt(item.dimension_value),
            views: item.metrics?.view_count || 0,
          })) || [],
      },
    };
  }

  // Get Account Analytics
  async getAccountAnalytics(
    period: "7days" | "28days" | "lifetime" = "28days",
    metrics: string[] = [
      "follower_count",
      "following_count",
      "likes_count",
      "video_count",
      "profile_views",
      "video_views",
    ]
  ): Promise<TikTokAccountAnalytics> {
    logger.info("Fetching TikTok account analytics", {
      accountId: this.config.businessAccountId,
      period,
      metrics,
    });

    const response = await this.makeRequest<TikTokApiResponse<any>>(
      "/business/account/analytics/",
      {
        method: "POST",
        body: JSON.stringify({
          business_id: this.config.businessAccountId,
          metrics,
          data_level: "account",
          report_type: "basic",
          time_granularity: "daily",
          start_date: this.getStartDate(period),
          end_date: new Date().toISOString().split("T")[0],
        }),
      }
    );

    const data = response.data;
    const accountMetrics = data.list?.[0]?.metrics || {};

    return {
      accountId: this.config.businessAccountId,
      followerCount: accountMetrics.follower_count || 0,
      followingCount: accountMetrics.following_count || 0,
      likesCount: accountMetrics.likes_count || 0,
      videoCount: accountMetrics.video_count || 0,
      profileViews: accountMetrics.profile_views || 0,
      videoViews: accountMetrics.video_views || 0,
      engagement: accountMetrics.engagement || 0,
      avgEngagementRate: accountMetrics.avg_engagement_rate || 0,
      followerGrowth:
        data.time_series?.map((item: any) => ({
          date: item.date,
          count: item.metrics?.follower_count || 0,
        })) || [],
      viewsGrowth:
        data.time_series?.map((item: any) => ({
          date: item.date,
          views: item.metrics?.video_views || 0,
        })) || [],
      period,
    };
  }

  // Get Audience Insights
  async getAudienceInsights(): Promise<TikTokAudienceInsights> {
    logger.info("Fetching TikTok audience insights", {
      accountId: this.config.businessAccountId,
    });

    const response = await this.makeRequest<TikTokApiResponse<any>>(
      "/business/audience/analytics/",
      {
        method: "POST",
        body: JSON.stringify({
          business_id: this.config.businessAccountId,
          dimensions: ["gender", "age", "country", "activity", "device"],
          data_level: "audience",
          report_type: "basic",
        }),
      }
    );

    const data = response.data;
    const audienceData = data.list?.[0]?.dimensions || {};

    return {
      accountId: this.config.businessAccountId,
      totalFollowers: data.total_followers || 0,
      audienceGender:
        audienceData.gender?.map((item: any) => ({
          gender: item.dimension_value,
          percentage: item.percentage || 0,
        })) || [],
      audienceAge:
        audienceData.age?.map((item: any) => ({
          ageGroup: item.dimension_value,
          percentage: item.percentage || 0,
        })) || [],
      audienceCountries:
        audienceData.country?.map((item: any) => ({
          countryCode: item.dimension_value,
          countryName: item.country_name || item.dimension_value,
          percentage: item.percentage || 0,
        })) || [],
      audienceActivity:
        audienceData.activity?.map((item: any) => ({
          hour: parseInt(item.dimension_value),
          activeFollowers: item.metrics?.active_followers || 0,
        })) || [],
      audienceDevices:
        audienceData.device?.map((item: any) => ({
          deviceType: item.dimension_value,
          percentage: item.percentage || 0,
        })) || [],
      period: "lifetime",
    };
  }

  // Get Hashtag Performance
  async getHashtagPerformance(
    hashtag: string
  ): Promise<TikTokHashtagPerformance> {
    logger.info("Fetching TikTok hashtag performance", { hashtag });

    try {
      const response = await this.makeRequest<TikTokApiResponse<any>>(
        "/business/hashtag/analytics/",
        {
          method: "POST",
          body: JSON.stringify({
            business_id: this.config.businessAccountId,
            hashtag: hashtag.startsWith("#") ? hashtag : `#${hashtag}`,
            metrics: ["view_count", "video_count"],
          }),
        }
      );

      const data = response.data;
      return {
        hashtag,
        viewCount: data.view_count || 0,
        videoCount: data.video_count || 0,
        trending: data.trending || false,
        relatedHashtags: data.related_hashtags || [],
      };
    } catch (error) {
      logger.warn("Failed to fetch hashtag performance", { hashtag, error });
      return {
        hashtag,
        viewCount: 0,
        videoCount: 0,
        trending: false,
        relatedHashtags: [],
      };
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.getAccountInfo();
      return true;
    } catch (error) {
      logger.error("TikTok Business API health check failed", { error });
      return false;
    }
  }

  // Rate Limit Information
  getRateLimitInfo(): {
    callCount: number;
    averageResponseTime: number;
    remainingRequests: number;
    resetTime: Date;
  } {
    return {
      callCount: this.rateLimitInfo.callCount,
      averageResponseTime:
        this.rateLimitInfo.callCount > 0
          ? this.rateLimitInfo.totalTime / this.rateLimitInfo.callCount
          : 0,
      remainingRequests: this.rateLimitInfo.remainingRequests,
      resetTime: this.rateLimitInfo.resetTime,
    };
  }

  // Utility Methods
  private getStartDate(period: "7days" | "28days" | "lifetime"): string {
    const now = new Date();
    switch (period) {
      case "7days":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      case "28days":
        return new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      case "lifetime":
        return "2020-01-01"; // TikTok Business API earliest supported date
      default:
        return new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
    }
  }

  // Batch Video Analytics Collection
  async batchCollectVideoAnalytics(
    videoIds: string[],
    options: {
      batchSize?: number;
      metrics?: string[];
      dimensions?: string[];
    } = {}
  ): Promise<{
    analytics: TikTokVideoAnalytics[];
    errors: Array<{ videoId: string; error: string }>;
  }> {
    const batchSize = options.batchSize || 10; // TikTok has smaller batch limits
    const results = {
      analytics: [] as TikTokVideoAnalytics[],
      errors: [] as Array<{ videoId: string; error: string }>,
    };

    logger.info("Starting batch TikTok video analytics collection", {
      totalVideoIds: videoIds.length,
      batchSize,
      options,
    });

    // Process in batches
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);

      const batchPromises = batch.map(async videoId => {
        try {
          const analytics = await this.getVideoAnalytics(
            videoId,
            options.metrics,
            options.dimensions
          );
          results.analytics.push(analytics);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          results.errors.push({ videoId, error: errorMessage });
          logger.warn("Failed to collect analytics for video", {
            videoId,
            error: errorMessage,
          });
        }
      });

      await Promise.allSettled(batchPromises);

      // Rate limiting: wait longer between batches for TikTok
      if (i + batchSize < videoIds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    logger.info("Batch TikTok video analytics collection completed", {
      successful: results.analytics.length,
      errors: results.errors.length,
    });

    return results;
  }
}

// Factory function
export function createTikTokBusinessApiClient(
  config: TikTokConfig
): TikTokBusinessApiClient {
  return new TikTokBusinessApiClient(config);
}

export default TikTokBusinessApiClient;
