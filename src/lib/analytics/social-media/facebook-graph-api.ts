import { logger } from "../../logger";

// Facebook Graph API Configuration
export interface FacebookConfig {
  accessToken: string;
  appId: string;
  appSecret: string;
  pageId: string;
  baseUrl?: string;
  apiVersion?: string;
}

// Facebook Post Types
export type FacebookPostType =
  | "status"
  | "photo"
  | "video"
  | "link"
  | "event"
  | "offer"
  | "note";

// Facebook Post Object
export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  createdTime: string;
  updatedTime?: string;
  type: FacebookPostType;
  link?: string;
  picture?: string;
  fullPicture?: string;
  source?: string; // For videos
  permalink: string;
  isPublished: boolean;
  statusType?: string;
  engagement: {
    reactions: number;
    comments: number;
    shares: number;
  };
}

// Facebook Post Insights
export interface FacebookPostInsights {
  postId: string;
  impressions: number;
  impressionsUnique: number;
  impressionsPaid: number;
  impressionsOrganic: number;
  reach: number;
  reachPaid: number;
  reachOrganic: number;
  engagement: number;
  reactions: number;
  comments: number;
  shares: number;
  clicks: number;
  linkClicks: number;
  photoViews?: number;
  videoViews?: number;
  videoViewsComplete?: number;
  videoViewsUniqueComplete?: number;
  period: "lifetime" | "day" | "week" | "days_28";
  endTime: string;
}

// Facebook Page Insights
export interface FacebookPageInsights {
  pageId: string;
  pageFans: number;
  pageFansGender: Array<{
    gender: "M" | "F" | "U";
    value: number;
  }>;
  pageFansAge: Array<{
    ageRange: string;
    value: number;
  }>;
  pageFansCountry: Array<{
    country: string;
    value: number;
  }>;
  pageFansCity: Array<{
    city: string;
    value: number;
  }>;
  pageImpressions: number;
  pageImpressionsUnique: number;
  pageImpressionsOrganic: number;
  pageImpressionsPaid: number;
  pageViews: number;
  pageViewsUnique: number;
  pageEngagedUsers: number;
  pagePostsImpressions: number;
  pagePostsImpressionsUnique: number;
  period: "day" | "week" | "days_28";
  endTime: string;
}

// Facebook Video Insights
export interface FacebookVideoInsights {
  videoId: string;
  views: number;
  viewsUnique: number;
  views10s: number;
  views30s: number;
  viewsComplete: number;
  viewsCompleteUnique: number;
  viewTime: number; // Total video view time in seconds
  avgTimeWatched: number;
  engagement: number;
  reactions: number;
  comments: number;
  shares: number;
  period: "lifetime";
  endTime: string;
}

// Facebook Audience Insights
export interface FacebookAudienceInsights {
  pageId: string;
  totalFans: number;
  fansByCountry: Array<{
    country: string;
    value: number;
  }>;
  fansByCity: Array<{
    city: string;
    value: number;
  }>;
  fansByGenderAge: Array<{
    gender: "M" | "F" | "U";
    ageRange: string;
    value: number;
  }>;
  fansByLocale: Array<{
    locale: string;
    value: number;
  }>;
  period: "lifetime";
}

// API Response Types
export interface FacebookApiResponse<T> {
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

export interface FacebookInsightResponse {
  data: Array<{
    name: string;
    period: string;
    values: Array<{
      value: number | Record<string, number>;
      end_time: string;
    }>;
  }>;
  paging?: {
    previous?: string;
    next?: string;
  };
}

export interface FacebookError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

// Facebook Graph API Client
export class FacebookGraphApiClient {
  private config: FacebookConfig;
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

  constructor(config: FacebookConfig) {
    this.config = config;
    const apiVersion = config.apiVersion || "v18.0";
    this.baseUrl = config.baseUrl || `https://graph.facebook.com/${apiVersion}`;

    if (!config.accessToken) {
      throw new Error("Facebook Graph API access token is required");
    }

    if (!config.pageId) {
      throw new Error("Facebook Page ID is required");
    }

    logger.info("Facebook Graph API client initialized", {
      baseUrl: this.baseUrl,
      pageId: config.pageId,
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
        const error = errorData as FacebookError;

        logger.error("Facebook Graph API request failed", {
          endpoint: url.toString(),
          status: response.status,
          errorMessage: error.error.message,
          errorCode: error.error.code,
        });

        throw new Error(
          `Facebook API Error: ${error.error.message} (Code: ${error.error.code})`
        );
      }

      const data = await response.json();
      logger.debug("Facebook Graph API request successful", {
        endpoint,
        method: options.method || "GET",
        responseTime: requestTime,
      });

      return data;
    } catch (error) {
      logger.error("Facebook Graph API request error", {
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

  // Get Page Information
  async getPageInfo(): Promise<{
    id: string;
    name: string;
    category: string;
    about?: string;
    website?: string;
    fanCount: number;
    picture: string;
    cover?: string;
  }> {
    logger.info("Fetching Facebook page information", {
      pageId: this.config.pageId,
    });

    const response = await this.makeRequest<any>(`/${this.config.pageId}`, {
      params: {
        fields: "id,name,category,about,website,fan_count,picture,cover",
      },
    });

    return {
      id: response.id,
      name: response.name,
      category: response.category,
      about: response.about,
      website: response.website,
      fanCount: response.fan_count || 0,
      picture: response.picture?.data?.url || "",
      cover: response.cover?.source,
    };
  }

  // Get Page Posts
  async getPagePosts(
    options: {
      limit?: number;
      since?: string;
      until?: string;
      after?: string;
      before?: string;
    } = {}
  ): Promise<FacebookApiResponse<FacebookPost[]>> {
    logger.info("Fetching Facebook page posts", {
      pageId: this.config.pageId,
      options,
    });

    const params: Record<string, string> = {
      fields:
        "id,message,story,created_time,updated_time,type,link,picture,full_picture,source,permalink_url,is_published,status_type,reactions.summary(true),comments.summary(true),shares",
    };

    if (options.limit) params.limit = options.limit.toString();
    if (options.since) params.since = options.since;
    if (options.until) params.until = options.until;
    if (options.after) params.after = options.after;
    if (options.before) params.before = options.before;

    const response = await this.makeRequest<FacebookApiResponse<any[]>>(
      `/${this.config.pageId}/posts`,
      { params }
    );

    return {
      data: response.data.map((post: any) => ({
        id: post.id,
        message: post.message,
        story: post.story,
        createdTime: post.created_time,
        updatedTime: post.updated_time,
        type: post.type,
        link: post.link,
        picture: post.picture,
        fullPicture: post.full_picture,
        source: post.source,
        permalink: post.permalink_url || `https://facebook.com/${post.id}`,
        isPublished: post.is_published !== false,
        statusType: post.status_type,
        engagement: {
          reactions: post.reactions?.summary?.total_count || 0,
          comments: post.comments?.summary?.total_count || 0,
          shares: post.shares?.count || 0,
        },
      })),
      paging: response.paging,
    };
  }

  // Get Post Insights
  async getPostInsights(
    postId: string,
    metrics: string[] = [
      "post_impressions",
      "post_impressions_unique",
      "post_impressions_paid",
      "post_impressions_organic",
      "post_reach",
      "post_reach_paid",
      "post_reach_organic",
      "post_engaged_users",
      "post_clicks",
      "post_reactions_by_type_total",
    ]
  ): Promise<FacebookPostInsights> {
    logger.info("Fetching Facebook post insights", {
      postId,
      metrics,
    });

    const response = await this.makeRequest<FacebookInsightResponse>(
      `/${postId}/insights`,
      {
        params: {
          metric: metrics.join(","),
        },
      }
    );

    const insights: Partial<FacebookPostInsights> = {
      postId,
      period: "lifetime",
      endTime: new Date().toISOString(),
    };

    response.data.forEach(metric => {
      const value = metric.values?.[0]?.value || 0;
      switch (metric.name) {
        case "post_impressions":
          insights.impressions = typeof value === "number" ? value : 0;
          break;
        case "post_impressions_unique":
          insights.impressionsUnique = typeof value === "number" ? value : 0;
          break;
        case "post_impressions_paid":
          insights.impressionsPaid = typeof value === "number" ? value : 0;
          break;
        case "post_impressions_organic":
          insights.impressionsOrganic = typeof value === "number" ? value : 0;
          break;
        case "post_reach":
          insights.reach = typeof value === "number" ? value : 0;
          break;
        case "post_reach_paid":
          insights.reachPaid = typeof value === "number" ? value : 0;
          break;
        case "post_reach_organic":
          insights.reachOrganic = typeof value === "number" ? value : 0;
          break;
        case "post_engaged_users":
          insights.engagement = typeof value === "number" ? value : 0;
          break;
        case "post_clicks":
          insights.clicks = typeof value === "number" ? value : 0;
          break;
        case "post_reactions_by_type_total":
          if (typeof value === "object" && value !== null) {
            insights.reactions = Object.values(value).reduce(
              (sum, count) => sum + (count as number),
              0
            );
          }
          break;
      }
    });

    return insights as FacebookPostInsights;
  }

  // Get Video Insights
  async getVideoInsights(videoId: string): Promise<FacebookVideoInsights> {
    logger.info("Fetching Facebook video insights", { videoId });

    const metrics = [
      "post_video_views",
      "post_video_views_unique",
      "post_video_views_10s",
      "post_video_views_30s",
      "post_video_complete_views_30s",
      "post_video_complete_views_30s_unique",
      "post_video_view_time",
      "post_video_avg_time_watched",
    ];

    const response = await this.makeRequest<FacebookInsightResponse>(
      `/${videoId}/insights`,
      {
        params: {
          metric: metrics.join(","),
        },
      }
    );

    const insights: Partial<FacebookVideoInsights> = {
      videoId,
      period: "lifetime",
      endTime: new Date().toISOString(),
    };

    response.data.forEach(metric => {
      const value = metric.values?.[0]?.value || 0;
      switch (metric.name) {
        case "post_video_views":
          insights.views = typeof value === "number" ? value : 0;
          break;
        case "post_video_views_unique":
          insights.viewsUnique = typeof value === "number" ? value : 0;
          break;
        case "post_video_views_10s":
          insights.views10s = typeof value === "number" ? value : 0;
          break;
        case "post_video_views_30s":
          insights.views30s = typeof value === "number" ? value : 0;
          break;
        case "post_video_complete_views_30s":
          insights.viewsComplete = typeof value === "number" ? value : 0;
          break;
        case "post_video_complete_views_30s_unique":
          insights.viewsCompleteUnique = typeof value === "number" ? value : 0;
          break;
        case "post_video_view_time":
          insights.viewTime = typeof value === "number" ? value : 0;
          break;
        case "post_video_avg_time_watched":
          insights.avgTimeWatched = typeof value === "number" ? value : 0;
          break;
      }
    });

    // Get additional engagement metrics from post insights
    const postInsights = await this.getPostInsights(videoId, [
      "post_engaged_users",
      "post_reactions_by_type_total",
    ]);

    insights.engagement = postInsights.engagement;
    insights.reactions = postInsights.reactions;

    return insights as FacebookVideoInsights;
  }

  // Get Page Insights
  async getPageInsights(
    period: "day" | "week" | "days_28" = "days_28",
    since?: string,
    until?: string
  ): Promise<FacebookPageInsights> {
    logger.info("Fetching Facebook page insights", {
      pageId: this.config.pageId,
      period,
      since,
      until,
    });

    const metrics = [
      "page_fans",
      "page_fans_gender_age",
      "page_fans_country",
      "page_fans_city",
      "page_impressions",
      "page_impressions_unique",
      "page_impressions_organic",
      "page_impressions_paid",
      "page_views_total",
      "page_views_unique",
      "page_engaged_users",
      "page_posts_impressions",
      "page_posts_impressions_unique",
    ];

    const params: Record<string, string> = {
      metric: metrics.join(","),
      period,
    };

    if (since) params.since = since;
    if (until) params.until = until;

    const response = await this.makeRequest<FacebookInsightResponse>(
      `/${this.config.pageId}/insights`,
      { params }
    );

    const insights: Partial<FacebookPageInsights> = {
      pageId: this.config.pageId,
      period,
      endTime: new Date().toISOString(),
    };

    response.data.forEach(metric => {
      const value = metric.values?.[0]?.value;
      switch (metric.name) {
        case "page_fans":
          insights.pageFans = typeof value === "number" ? value : 0;
          break;
        case "page_fans_gender_age":
          if (typeof value === "object" && value !== null) {
            const genderAge = value as Record<string, number>;
            insights.pageFansGender = Object.entries(genderAge)
              .filter(
                ([key]) =>
                  key.startsWith("M.") ||
                  key.startsWith("F.") ||
                  key.startsWith("U.")
              )
              .reduce((acc: any[], [key, count]) => {
                const gender = key.split(".")[0] as "M" | "F" | "U";
                const existing = acc.find(item => item.gender === gender);
                if (existing) {
                  existing.value += count;
                } else {
                  acc.push({ gender, value: count });
                }
                return acc;
              }, []);

            insights.pageFansAge = Object.entries(genderAge).reduce(
              (acc: any[], [key, count]) => {
                const ageRange = key.includes(".") ? key.split(".")[1] : key;
                if (ageRange && !["M", "F", "U"].includes(ageRange)) {
                  const existing = acc.find(item => item.ageRange === ageRange);
                  if (existing) {
                    existing.value += count;
                  } else {
                    acc.push({ ageRange, value: count });
                  }
                }
                return acc;
              },
              []
            );
          }
          break;
        case "page_fans_country":
          if (typeof value === "object" && value !== null) {
            insights.pageFansCountry = Object.entries(
              value as Record<string, number>
            ).map(([country, count]) => ({ country, value: count }));
          }
          break;
        case "page_fans_city":
          if (typeof value === "object" && value !== null) {
            insights.pageFansCity = Object.entries(
              value as Record<string, number>
            ).map(([city, count]) => ({ city, value: count }));
          }
          break;
        case "page_impressions":
          insights.pageImpressions = typeof value === "number" ? value : 0;
          break;
        case "page_impressions_unique":
          insights.pageImpressionsUnique =
            typeof value === "number" ? value : 0;
          break;
        case "page_impressions_organic":
          insights.pageImpressionsOrganic =
            typeof value === "number" ? value : 0;
          break;
        case "page_impressions_paid":
          insights.pageImpressionsPaid = typeof value === "number" ? value : 0;
          break;
        case "page_views_total":
          insights.pageViews = typeof value === "number" ? value : 0;
          break;
        case "page_views_unique":
          insights.pageViewsUnique = typeof value === "number" ? value : 0;
          break;
        case "page_engaged_users":
          insights.pageEngagedUsers = typeof value === "number" ? value : 0;
          break;
        case "page_posts_impressions":
          insights.pagePostsImpressions = typeof value === "number" ? value : 0;
          break;
        case "page_posts_impressions_unique":
          insights.pagePostsImpressionsUnique =
            typeof value === "number" ? value : 0;
          break;
      }
    });

    return insights as FacebookPageInsights;
  }

  // Get Audience Insights
  async getAudienceInsights(): Promise<FacebookAudienceInsights> {
    logger.info("Fetching Facebook audience insights", {
      pageId: this.config.pageId,
    });

    const pageInsights = await this.getPageInsights("days_28");

    return {
      pageId: this.config.pageId,
      totalFans: pageInsights.pageFans,
      fansByCountry: pageInsights.pageFansCountry,
      fansByCity: pageInsights.pageFansCity,
      fansByGenderAge:
        pageInsights.pageFansGender?.flatMap(
          genderData =>
            pageInsights.pageFansAge?.map(ageData => ({
              gender: genderData.gender,
              ageRange: ageData.ageRange,
              value: Math.round(
                (genderData.value * ageData.value) / pageInsights.pageFans
              ),
            })) || []
        ) || [],
      fansByLocale: [], // Would need additional API call for locale data
      period: "lifetime",
    };
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.getPageInfo();
      return true;
    } catch (error) {
      logger.error("Facebook Graph API health check failed", { error });
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
    postIds: string[],
    options: {
      includeVideoInsights?: boolean;
      batchSize?: number;
      metrics?: string[];
    } = {}
  ): Promise<{
    postInsights: FacebookPostInsights[];
    videoInsights: FacebookVideoInsights[];
    errors: Array<{ postId: string; error: string }>;
  }> {
    const batchSize = options.batchSize || 15;
    const results = {
      postInsights: [] as FacebookPostInsights[],
      videoInsights: [] as FacebookVideoInsights[],
      errors: [] as Array<{ postId: string; error: string }>,
    };

    logger.info("Starting batch Facebook insights collection", {
      totalPostIds: postIds.length,
      batchSize,
      options,
    });

    // Process in batches
    for (let i = 0; i < postIds.length; i += batchSize) {
      const batch = postIds.slice(i, i + batchSize);

      const batchPromises = batch.map(async postId => {
        try {
          const insights = await this.getPostInsights(postId, options.metrics);
          results.postInsights.push(insights);

          // Check if it's a video and get video insights
          if (options.includeVideoInsights) {
            try {
              const videoInsights = await this.getVideoInsights(postId);
              results.videoInsights.push(videoInsights);
            } catch (videoError) {
              // Not all posts are videos, so this is expected to fail sometimes
              logger.debug(
                "Post is not a video or video insights unavailable",
                {
                  postId,
                }
              );
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          results.errors.push({ postId, error: errorMessage });
          logger.warn("Failed to collect insights for post", {
            postId,
            error: errorMessage,
          });
        }
      });

      await Promise.allSettled(batchPromises);

      // Rate limiting: wait between batches
      if (i + batchSize < postIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info("Batch Facebook insights collection completed", {
      successful: results.postInsights.length,
      videoInsights: results.videoInsights.length,
      errors: results.errors.length,
    });

    return results;
  }
}

// Factory function
export function createFacebookGraphApiClient(
  config: FacebookConfig
): FacebookGraphApiClient {
  return new FacebookGraphApiClient(config);
}

export default FacebookGraphApiClient;
