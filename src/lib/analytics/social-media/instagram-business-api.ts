import { logger } from "../../logger";

// Instagram Business API Configuration
export interface InstagramBusinessConfig {
  accessToken: string;
  appId: string;
  appSecret: string;
  businessAccountId: string;
  baseUrl?: string;
}

// Media Types
export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";
export type InstagramProductType = "FEED" | "STORY" | "REELS" | "IGTV";

// Instagram Media Object
export interface InstagramMedia {
  id: string;
  mediaType: InstagramMediaType;
  mediaProductType: InstagramProductType;
  mediaUrl?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
  username: string;
  thumbnailUrl?: string;
  children?: InstagramMedia[];
}

// Instagram Insights Metrics
export interface InstagramInsights {
  mediaId: string;
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  replays?: number; // For Reels
  plays?: number; // For Videos/Reels
  tapsForward?: number; // For Stories
  tapsBack?: number; // For Stories
  exits?: number; // For Stories
  websiteClicks?: number;
  profileViews?: number;
  period: "day" | "week" | "days_28" | "lifetime";
  endTime: string;
}

// Account Insights
export interface InstagramAccountInsights {
  accountId: string;
  impressions: number;
  reach: number;
  profileViews: number;
  websiteClicks: number;
  emailContacts?: number;
  phoneCallClicks?: number;
  textMessageClicks?: number;
  getDirectionsClicks?: number;
  followerCount: number;
  followingCount: number;
  mediaCount: number;
  period: "day" | "week" | "days_28";
  endTime: string;
}

// Audience Insights
export interface InstagramAudienceInsights {
  accountId: string;
  period: "lifetime";
  audienceGenderAge: Array<{
    gender: "M" | "F" | "U";
    ageRange: string;
    value: number;
  }>;
  audienceLocale: Array<{
    locale: string;
    value: number;
  }>;
  audienceCountry: Array<{
    country: string;
    value: number;
  }>;
  audienceCity: Array<{
    city: string;
    value: number;
  }>;
  onlineFollowers: Array<{
    hour: number;
    value: number;
  }>;
}

// Hashtag Performance
export interface InstagramHashtagPerformance {
  hashtag: string;
  topMediaId?: string;
  mediaCount: number;
}

// Stories Insights
export interface InstagramStoryInsights {
  mediaId: string;
  impressions: number;
  reach: number;
  tapsForward: number;
  tapsBack: number;
  exits: number;
  replies: number;
  shares?: number;
  period: "lifetime";
  endTime: string;
}

// API Response Types
export interface InstagramApiResponse<T> {
  data: T;
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

export interface InstagramError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

// Instagram Business API Client
export class InstagramBusinessApiClient {
  private config: InstagramBusinessConfig;
  private baseUrl: string;
  private rateLimitInfo: {
    callCount: number;
    totalTime: number;
    resetTime: Date;
  } = {
    callCount: 0,
    totalTime: 0,
    resetTime: new Date(),
  };

  constructor(config: InstagramBusinessConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://graph.facebook.com/v18.0";

    if (!config.accessToken) {
      throw new Error("Instagram Business API access token is required");
    }

    if (!config.businessAccountId) {
      throw new Error("Instagram Business Account ID is required");
    }

    logger.info("Instagram Business API client initialized", {
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
    } = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add access token to params
    url.searchParams.set("access_token", this.config.accessToken);

    // Add additional params
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const requestOptions: RequestInit = {
      method: options.method || "GET",
      headers: {
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

      if (!response.ok) {
        const errorData = await response.json();
        const error = errorData as InstagramError;

        logger.error("Instagram Business API request failed", {
          url: url.toString(),
          status: response.status,
          errorMessage: error.error.message,
          errorCode: error.error.code,
        });

        throw new Error(
          `Instagram API Error: ${error.error.message} (Code: ${error.error.code})`
        );
      }

      const data = await response.json();
      logger.debug("Instagram Business API request successful", {
        endpoint,
        method: options.method || "GET",
        responseTime: requestTime,
      });

      return data;
    } catch (error) {
      logger.error("Instagram Business API request error", {
        endpoint,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private updateRateLimitTracking(requestTime: number): void {
    this.rateLimitInfo.callCount++;
    this.rateLimitInfo.totalTime += requestTime;

    // Reset every hour
    const now = new Date();
    if (now.getTime() - this.rateLimitInfo.resetTime.getTime() > 3600000) {
      this.rateLimitInfo = {
        callCount: 1,
        totalTime: requestTime,
        resetTime: now,
      };
    }
  }

  // Get Account Information
  async getAccountInfo(): Promise<{
    id: string;
    username: string;
    name: string;
    biography: string;
    website?: string;
    followersCount: number;
    followsCount: number;
    mediaCount: number;
    profilePictureUrl: string;
  }> {
    logger.info("Fetching Instagram account information", {
      accountId: this.config.businessAccountId,
    });

    const response = await this.makeRequest<any>(
      `/${this.config.businessAccountId}`,
      {
        params: {
          fields:
            "id,username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url",
        },
      }
    );

    return {
      id: response.id,
      username: response.username,
      name: response.name,
      biography: response.biography || "",
      website: response.website,
      followersCount: response.followers_count || 0,
      followsCount: response.follows_count || 0,
      mediaCount: response.media_count || 0,
      profilePictureUrl: response.profile_picture_url || "",
    };
  }

  // Get Media List
  async getMedia(
    options: {
      limit?: number;
      since?: string;
      until?: string;
      after?: string;
      before?: string;
    } = {}
  ): Promise<InstagramApiResponse<InstagramMedia[]>> {
    logger.info("Fetching Instagram media", {
      accountId: this.config.businessAccountId,
      options,
    });

    const params: Record<string, string> = {
      fields:
        "id,media_type,media_product_type,media_url,caption,timestamp,permalink,username,thumbnail_url,children{id,media_type,media_url,thumbnail_url}",
    };

    if (options.limit) params.limit = options.limit.toString();
    if (options.since) params.since = options.since;
    if (options.until) params.until = options.until;
    if (options.after) params.after = options.after;
    if (options.before) params.before = options.before;

    const response = await this.makeRequest<InstagramApiResponse<any[]>>(
      `/${this.config.businessAccountId}/media`,
      { params }
    );

    return {
      data: response.data.map((item: any) => ({
        id: item.id,
        mediaType: item.media_type,
        mediaProductType: item.media_product_type,
        mediaUrl: item.media_url,
        caption: item.caption,
        timestamp: item.timestamp,
        permalink: item.permalink,
        username: item.username,
        thumbnailUrl: item.thumbnail_url,
        children: item.children?.data?.map((child: any) => ({
          id: child.id,
          mediaType: child.media_type,
          mediaUrl: child.media_url,
          thumbnailUrl: child.thumbnail_url,
        })),
      })),
      paging: response.paging,
    };
  }

  // Get Media Insights
  async getMediaInsights(
    mediaId: string,
    metrics: string[] = [
      "impressions",
      "reach",
      "engagement",
      "likes",
      "comments",
      "shares",
      "saves",
    ]
  ): Promise<InstagramInsights> {
    logger.info("Fetching Instagram media insights", {
      mediaId,
      metrics,
    });

    const response = await this.makeRequest<{ data: any[] }>(
      `/${mediaId}/insights`,
      {
        params: {
          metric: metrics.join(","),
        },
      }
    );

    const insights: Partial<InstagramInsights> = {
      mediaId,
      period: "lifetime",
      endTime: new Date().toISOString(),
    };

    response.data.forEach(metric => {
      const value = metric.values?.[0]?.value || 0;
      switch (metric.name) {
        case "impressions":
          insights.impressions = value;
          break;
        case "reach":
          insights.reach = value;
          break;
        case "engagement":
          insights.engagement = value;
          break;
        case "likes":
          insights.likes = value;
          break;
        case "comments":
          insights.comments = value;
          break;
        case "shares":
          insights.shares = value;
          break;
        case "saves":
          insights.saves = value;
          break;
        case "plays":
          insights.plays = value;
          break;
        case "replays":
          insights.replays = value;
          break;
      }
    });

    return insights as InstagramInsights;
  }

  // Get Reels Insights
  async getReelsInsights(
    mediaId: string
  ): Promise<InstagramInsights & { plays: number; replays: number }> {
    logger.info("Fetching Instagram Reels insights", { mediaId });

    const metrics = [
      "impressions",
      "reach",
      "engagement",
      "likes",
      "comments",
      "shares",
      "saves",
      "plays",
      "replays",
    ];

    const baseInsights = await this.getMediaInsights(mediaId, metrics);

    return {
      ...baseInsights,
      plays: baseInsights.plays || 0,
      replays: baseInsights.replays || 0,
    };
  }

  // Get Stories Insights
  async getStoriesInsights(mediaId: string): Promise<InstagramStoryInsights> {
    logger.info("Fetching Instagram Stories insights", { mediaId });

    const metrics = [
      "impressions",
      "reach",
      "taps_forward",
      "taps_back",
      "exits",
      "replies",
    ];

    const response = await this.makeRequest<{ data: any[] }>(
      `/${mediaId}/insights`,
      {
        params: {
          metric: metrics.join(","),
        },
      }
    );

    const insights: Partial<InstagramStoryInsights> = {
      mediaId,
      period: "lifetime",
      endTime: new Date().toISOString(),
    };

    response.data.forEach(metric => {
      const value = metric.values?.[0]?.value || 0;
      switch (metric.name) {
        case "impressions":
          insights.impressions = value;
          break;
        case "reach":
          insights.reach = value;
          break;
        case "taps_forward":
          insights.tapsForward = value;
          break;
        case "taps_back":
          insights.tapsBack = value;
          break;
        case "exits":
          insights.exits = value;
          break;
        case "replies":
          insights.replies = value;
          break;
      }
    });

    return insights as InstagramStoryInsights;
  }

  // Get Account Insights
  async getAccountInsights(
    period: "day" | "week" | "days_28" = "days_28",
    since?: string,
    until?: string
  ): Promise<InstagramAccountInsights> {
    logger.info("Fetching Instagram account insights", {
      accountId: this.config.businessAccountId,
      period,
      since,
      until,
    });

    const metrics = [
      "impressions",
      "reach",
      "profile_views",
      "website_clicks",
      "email_contacts",
      "phone_call_clicks",
      "text_message_clicks",
      "get_directions_clicks",
    ];

    const params: Record<string, string> = {
      metric: metrics.join(","),
      period,
    };

    if (since) params.since = since;
    if (until) params.until = until;

    const response = await this.makeRequest<{ data: any[] }>(
      `/${this.config.businessAccountId}/insights`,
      { params }
    );

    const accountInfo = await this.getAccountInfo();

    const insights: Partial<InstagramAccountInsights> = {
      accountId: this.config.businessAccountId,
      period,
      endTime: new Date().toISOString(),
      followerCount: accountInfo.followersCount,
      followingCount: accountInfo.followsCount,
      mediaCount: accountInfo.mediaCount,
    };

    response.data.forEach(metric => {
      const value = metric.values?.[0]?.value || 0;
      switch (metric.name) {
        case "impressions":
          insights.impressions = value;
          break;
        case "reach":
          insights.reach = value;
          break;
        case "profile_views":
          insights.profileViews = value;
          break;
        case "website_clicks":
          insights.websiteClicks = value;
          break;
        case "email_contacts":
          insights.emailContacts = value;
          break;
        case "phone_call_clicks":
          insights.phoneCallClicks = value;
          break;
        case "text_message_clicks":
          insights.textMessageClicks = value;
          break;
        case "get_directions_clicks":
          insights.getDirectionsClicks = value;
          break;
      }
    });

    return insights as InstagramAccountInsights;
  }

  // Get Audience Insights
  async getAudienceInsights(): Promise<InstagramAudienceInsights> {
    logger.info("Fetching Instagram audience insights", {
      accountId: this.config.businessAccountId,
    });

    const metrics = [
      "audience_gender_age",
      "audience_locale",
      "audience_country",
      "audience_city",
      "online_followers",
    ];

    const response = await this.makeRequest<{ data: any[] }>(
      `/${this.config.businessAccountId}/insights`,
      {
        params: {
          metric: metrics.join(","),
          period: "lifetime",
        },
      }
    );

    const insights: Partial<InstagramAudienceInsights> = {
      accountId: this.config.businessAccountId,
      period: "lifetime",
    };

    response.data.forEach(metric => {
      switch (metric.name) {
        case "audience_gender_age":
          insights.audienceGenderAge = Object.entries(
            metric.values?.[0]?.value || {}
          ).map(([key, value]) => {
            const [gender, ageRange] = key.split(".");
            return {
              gender: gender as "M" | "F" | "U",
              ageRange,
              value: value as number,
            };
          });
          break;
        case "audience_locale":
          insights.audienceLocale = Object.entries(
            metric.values?.[0]?.value || {}
          ).map(([locale, value]) => ({
            locale,
            value: value as number,
          }));
          break;
        case "audience_country":
          insights.audienceCountry = Object.entries(
            metric.values?.[0]?.value || {}
          ).map(([country, value]) => ({
            country,
            value: value as number,
          }));
          break;
        case "audience_city":
          insights.audienceCity = Object.entries(
            metric.values?.[0]?.value || {}
          ).map(([city, value]) => ({
            city,
            value: value as number,
          }));
          break;
        case "online_followers":
          insights.onlineFollowers = Object.entries(
            metric.values?.[0]?.value || {}
          ).map(([hour, value]) => ({
            hour: parseInt(hour),
            value: value as number,
          }));
          break;
      }
    });

    return insights as InstagramAudienceInsights;
  }

  // Get Hashtag Performance
  async getHashtagPerformance(
    hashtag: string
  ): Promise<InstagramHashtagPerformance> {
    logger.info("Fetching Instagram hashtag performance", { hashtag });

    try {
      const response = await this.makeRequest<{
        id: string;
        top_media: { data: { id: string }[] };
        media_count: number;
      }>(`/ig_hashtag_search`, {
        params: {
          user_id: this.config.businessAccountId,
          q: hashtag,
        },
      });

      return {
        hashtag,
        topMediaId: response.top_media?.data?.[0]?.id,
        mediaCount: response.media_count || 0,
      };
    } catch (error) {
      logger.warn("Failed to fetch hashtag performance", { hashtag, error });
      return {
        hashtag,
        mediaCount: 0,
      };
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.getAccountInfo();
      return true;
    } catch (error) {
      logger.error("Instagram Business API health check failed", { error });
      return false;
    }
  }

  // Rate Limit Information
  getRateLimitInfo(): {
    callCount: number;
    averageResponseTime: number;
    resetTime: Date;
  } {
    return {
      callCount: this.rateLimitInfo.callCount,
      averageResponseTime:
        this.rateLimitInfo.callCount > 0
          ? this.rateLimitInfo.totalTime / this.rateLimitInfo.callCount
          : 0,
      resetTime: this.rateLimitInfo.resetTime,
    };
  }

  // Batch Insights Collection
  async batchCollectInsights(
    mediaIds: string[],
    options: {
      includeReels?: boolean;
      includeStories?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{
    media: InstagramInsights[];
    reels: InstagramInsights[];
    stories: InstagramStoryInsights[];
    errors: Array<{ mediaId: string; error: string }>;
  }> {
    const batchSize = options.batchSize || 10;
    const results = {
      media: [] as InstagramInsights[],
      reels: [] as InstagramInsights[],
      stories: [] as InstagramStoryInsights[],
      errors: [] as Array<{ mediaId: string; error: string }>,
    };

    logger.info("Starting batch insights collection", {
      totalMediaIds: mediaIds.length,
      batchSize,
      options,
    });

    // Process in batches
    for (let i = 0; i < mediaIds.length; i += batchSize) {
      const batch = mediaIds.slice(i, i + batchSize);

      const batchPromises = batch.map(async mediaId => {
        try {
          // Get media info first to determine type
          const mediaInfo = await this.makeRequest<{
            media_product_type: string;
          }>(`/${mediaId}`, {
            params: { fields: "media_product_type" },
          });

          // Collect insights based on media type
          if (
            options.includeReels &&
            mediaInfo.media_product_type === "REELS"
          ) {
            const insights = await this.getReelsInsights(mediaId);
            results.reels.push(insights);
          } else if (
            options.includeStories &&
            mediaInfo.media_product_type === "STORY"
          ) {
            const insights = await this.getStoriesInsights(mediaId);
            results.stories.push(insights);
          } else {
            const insights = await this.getMediaInsights(mediaId);
            results.media.push(insights);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          results.errors.push({ mediaId, error: errorMessage });
          logger.warn("Failed to collect insights for media", {
            mediaId,
            error: errorMessage,
          });
        }
      });

      await Promise.allSettled(batchPromises);

      // Rate limiting: wait between batches
      if (i + batchSize < mediaIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info("Batch insights collection completed", {
      successful:
        results.media.length + results.reels.length + results.stories.length,
      errors: results.errors.length,
    });

    return results;
  }
}

// Factory function
export function createInstagramBusinessApiClient(
  config: InstagramBusinessConfig
): InstagramBusinessApiClient {
  return new InstagramBusinessApiClient(config);
}

export default InstagramBusinessApiClient;
