import { logger } from "../../logger";

// LinkedIn API Configuration
export interface LinkedInConfig {
  accessToken: string;
  clientId: string;
  clientSecret: string;
  organizationId?: string; // For company pages
  personId?: string; // For personal profiles
  baseUrl?: string;
}

// LinkedIn Post Types
export type LinkedInPostType =
  | "ARTICLE"
  | "IMAGE"
  | "VIDEO"
  | "DOCUMENT"
  | "POLL"
  | "EVENT";

// LinkedIn Post Object
export interface LinkedInPost {
  id: string;
  author: string;
  text: string;
  publishedAt: string;
  lastModifiedAt: string;
  visibility: "PUBLIC" | "CONNECTIONS" | "LOGGED_IN_MEMBERS";
  postType: LinkedInPostType;
  mediaUrl?: string;
  articleUrl?: string;
  shareUrl: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
  };
}

// LinkedIn Analytics Metrics
export interface LinkedInPostAnalytics {
  postId: string;
  impressions: number;
  uniqueImpressions: number;
  clicks: number;
  reactions: number;
  comments: number;
  shares: number;
  follows: number;
  engagement: number;
  engagementRate: number;
  clickThroughRate: number;
  viralImpressions: number;
  organicImpressions: number;
  paidImpressions: number;
  period: "lifetime" | "day";
  startDate: string;
  endDate: string;
}

// LinkedIn Company Analytics
export interface LinkedInCompanyAnalytics {
  organizationId: string;
  followerGains: number;
  followerLosses: number;
  totalFollowers: number;
  impressions: number;
  uniqueImpressions: number;
  clicks: number;
  engagement: number;
  engagementRate: number;
  period: "day" | "month";
  startDate: string;
  endDate: string;
}

// LinkedIn Audience Insights
export interface LinkedInAudienceInsights {
  organizationId: string;
  totalFollowers: number;
  followerCountsByRegion: Array<{
    region: string;
    followerCounts: number;
  }>;
  followerCountsByIndustry: Array<{
    industry: string;
    followerCounts: number;
  }>;
  followerCountsByFunction: Array<{
    function: string;
    followerCounts: number;
  }>;
  followerCountsBySeniority: Array<{
    seniority: string;
    followerCounts: number;
  }>;
  followerCountsByCompanySize: Array<{
    companySize: string;
    followerCounts: number;
  }>;
  period: "lifetime";
}

// LinkedIn Share Statistics
export interface LinkedInShareStatistics {
  shareId: string;
  clickCount: number;
  commentCount: number;
  engagement: number;
  impressionCount: number;
  likeCount: number;
  shareCount: number;
  uniqueImpressionsCount: number;
}

// API Response Types
export interface LinkedInApiResponse<T> {
  elements: T[];
  paging?: {
    count: number;
    start: number;
    total?: number;
    links?: Array<{
      rel: string;
      href: string;
    }>;
  };
}

export interface LinkedInError {
  errorCode: string;
  message: string;
  requestId?: string;
  status: number;
  timestamp: number;
}

// LinkedIn API Client
export class LinkedInApiClient {
  private config: LinkedInConfig;
  private baseUrl: string;
  private rateLimitInfo: {
    callCount: number;
    totalTime: number;
    resetTime: Date;
    dailyLimit: number;
    hourlyLimit: number;
  } = {
    callCount: 0,
    totalTime: 0,
    resetTime: new Date(),
    dailyLimit: 100000, // LinkedIn daily rate limit
    hourlyLimit: 100, // LinkedIn hourly rate limit per app
  };

  constructor(config: LinkedInConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://api.linkedin.com/v2";

    if (!config.accessToken) {
      throw new Error("LinkedIn API access token is required");
    }

    logger.info("LinkedIn API client initialized", {
      baseUrl: this.baseUrl,
      hasAccessToken: !!config.accessToken,
      organizationId: config.organizationId,
      personId: config.personId,
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
        "LinkedIn-Version": "202308",
        "X-Restli-Protocol-Version": "2.0.0",
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
        const error = errorData as LinkedInError;

        logger.error("LinkedIn API request failed", {
          endpoint: url.toString(),
          status: response.status,
          errorCode: error.errorCode,
          message: error.message,
        });

        throw new Error(
          `LinkedIn API Error: ${error.message} (Code: ${error.errorCode})`
        );
      }

      const data = await response.json();
      logger.debug("LinkedIn API request successful", {
        endpoint,
        method: options.method || "GET",
        responseTime: requestTime,
      });

      return data;
    } catch (error) {
      logger.error("LinkedIn API request error", {
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
        dailyLimit: this.rateLimitInfo.dailyLimit,
        hourlyLimit: this.rateLimitInfo.hourlyLimit,
      };
    }
  }

  // Get Organization Information
  async getOrganizationInfo(organizationId?: string): Promise<{
    id: string;
    name: string;
    description?: string;
    website?: string;
    industry?: string;
    companyType?: string;
    followerCount: number;
    logo?: string;
  }> {
    const orgId = organizationId || this.config.organizationId;
    if (!orgId) {
      throw new Error("Organization ID is required");
    }

    logger.info("Fetching LinkedIn organization information", {
      organizationId: orgId,
    });

    const response = await this.makeRequest<any>(`/organizations/${orgId}`, {
      params: {
        projection:
          "(id,name,description,website,industries,companyType,logo,followerCount)",
      },
    });

    return {
      id: response.id,
      name: response.name?.localized?.en_US || response.name,
      description:
        response.description?.localized?.en_US || response.description,
      website: response.website?.url,
      industry: response.industries?.[0]?.localized?.en_US,
      companyType: response.companyType,
      followerCount: response.followerCount || 0,
      logo: response.logo?.original?.elements?.[0]?.identifiers?.[0]
        ?.identifier,
    };
  }

  // Get Company Posts
  async getCompanyPosts(
    organizationId?: string,
    options: {
      count?: number;
      start?: number;
      sortBy?: "CREATION_TIME" | "LAST_MODIFIED_TIME";
    } = {}
  ): Promise<LinkedInApiResponse<LinkedInPost>> {
    const orgId = organizationId || this.config.organizationId;
    if (!orgId) {
      throw new Error("Organization ID is required");
    }

    logger.info("Fetching LinkedIn company posts", {
      organizationId: orgId,
      options,
    });

    const params: Record<string, string> = {
      q: "author",
      author: `urn:li:organization:${orgId}`,
      projection:
        "(elements*(id,author,commentary,publishedAt,lastModifiedAt,visibility,content,socialDetail))",
    };

    if (options.count) params.count = options.count.toString();
    if (options.start) params.start = options.start.toString();
    if (options.sortBy) params.sortBy = options.sortBy;

    const response = await this.makeRequest<any>("/shares", { params });

    return {
      elements:
        response.elements?.map((post: any) => ({
          id: post.id,
          author: post.author,
          text: post.commentary || "",
          publishedAt: post.publishedAt,
          lastModifiedAt: post.lastModifiedAt,
          visibility: post.visibility?.code || "PUBLIC",
          postType: this.determinePostType(post.content),
          mediaUrl: post.content?.media?.elements?.[0]?.originalUrl,
          articleUrl: post.content?.article?.resolvedUrl,
          shareUrl: `https://www.linkedin.com/feed/update/${post.id}/`,
          engagement: {
            likes: post.socialDetail?.totalSocialActivityCounts?.numLikes || 0,
            comments:
              post.socialDetail?.totalSocialActivityCounts?.numComments || 0,
            shares:
              post.socialDetail?.totalSocialActivityCounts?.numShares || 0,
            clicks: 0, // Not available in basic API
          },
        })) || [],
      paging: response.paging,
    };
  }

  private determinePostType(content: any): LinkedInPostType {
    if (content?.article) return "ARTICLE";
    if (content?.media?.elements?.[0]?.media?.includes("video")) return "VIDEO";
    if (content?.media?.elements?.[0]?.media?.includes("image")) return "IMAGE";
    if (content?.poll) return "POLL";
    if (content?.event) return "EVENT";
    return "ARTICLE";
  }

  // Get Post Analytics
  async getPostAnalytics(
    shareId: string,
    timeRange: {
      start: string; // ISO date
      end: string; // ISO date
    }
  ): Promise<LinkedInPostAnalytics> {
    logger.info("Fetching LinkedIn post analytics", {
      shareId,
      timeRange,
    });

    const params = {
      q: "share",
      share: shareId,
      timeGranularity: "DAY",
      dateRange: `(start:(year:${new Date(timeRange.start).getFullYear()},month:${new Date(timeRange.start).getMonth() + 1},day:${new Date(timeRange.start).getDate()}),end:(year:${new Date(timeRange.end).getFullYear()},month:${new Date(timeRange.end).getMonth() + 1},day:${new Date(timeRange.end).getDate()}))`,
    };

    const response = await this.makeRequest<any>(
      "/organizationalEntityShareStatistics",
      { params }
    );

    const stats = response.elements?.[0] || {};

    return {
      postId: shareId,
      impressions: stats.totalShareStatistics?.impressionCount || 0,
      uniqueImpressions:
        stats.totalShareStatistics?.uniqueImpressionsCount || 0,
      clicks: stats.totalShareStatistics?.clickCount || 0,
      reactions: stats.totalShareStatistics?.likeCount || 0,
      comments: stats.totalShareStatistics?.commentCount || 0,
      shares: stats.totalShareStatistics?.shareCount || 0,
      follows: 0, // Not available in basic share statistics
      engagement: stats.totalShareStatistics?.engagement || 0,
      engagementRate: this.calculateEngagementRate(
        stats.totalShareStatistics?.engagement || 0,
        stats.totalShareStatistics?.impressionCount || 0
      ),
      clickThroughRate: this.calculateClickThroughRate(
        stats.totalShareStatistics?.clickCount || 0,
        stats.totalShareStatistics?.impressionCount || 0
      ),
      viralImpressions: stats.totalShareStatistics?.viralImpressionCount || 0,
      organicImpressions:
        stats.totalShareStatistics?.organicImpressionCount || 0,
      paidImpressions:
        stats.totalShareStatistics?.sponsoredImpressionCount || 0,
      period: "lifetime",
      startDate: timeRange.start,
      endDate: timeRange.end,
    };
  }

  // Get Company Analytics
  async getCompanyAnalytics(
    organizationId?: string,
    timeRange: {
      start: string;
      end: string;
    } = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    }
  ): Promise<LinkedInCompanyAnalytics> {
    const orgId = organizationId || this.config.organizationId;
    if (!orgId) {
      throw new Error("Organization ID is required");
    }

    logger.info("Fetching LinkedIn company analytics", {
      organizationId: orgId,
      timeRange,
    });

    const params = {
      q: "organizationalEntity",
      organizationalEntity: `urn:li:organization:${orgId}`,
      timeGranularity: "DAY",
      dateRange: `(start:(year:${new Date(timeRange.start).getFullYear()},month:${new Date(timeRange.start).getMonth() + 1},day:${new Date(timeRange.start).getDate()}),end:(year:${new Date(timeRange.end).getFullYear()},month:${new Date(timeRange.end).getMonth() + 1},day:${new Date(timeRange.end).getDate()}))`,
    };

    const [followerStats, pageStats] = await Promise.all([
      this.makeRequest<any>("/organizationalEntityFollowerStatistics", {
        params,
      }),
      this.makeRequest<any>("/organizationalEntityPageStatistics", { params }),
    ]);

    const followerData = followerStats.elements?.[0] || {};
    const pageData = pageStats.elements?.[0] || {};

    return {
      organizationId: orgId,
      followerGains: followerData.followerGains?.organicFollowerGains || 0,
      followerLosses: followerData.followerGains?.paidFollowerGains || 0,
      totalFollowers:
        followerData.followerCountsByAssociationType?.find(
          (item: any) => item.associationType === "ORGANIC"
        )?.followerCounts?.organicFollowerCount || 0,
      impressions:
        pageData.totalPageStatistics?.views?.allDesktopPageViews?.pageViews ||
        0,
      uniqueImpressions:
        pageData.totalPageStatistics?.views?.allMobilePageViews
          ?.uniquePageViews || 0,
      clicks:
        pageData.totalPageStatistics?.clicks?.careersPageClicks
          ?.careersPagePromoClicks || 0,
      engagement: 0, // Calculated separately
      engagementRate: 0, // Calculated separately
      period: "day",
      startDate: timeRange.start,
      endDate: timeRange.end,
    };
  }

  // Get Audience Insights
  async getAudienceInsights(
    organizationId?: string
  ): Promise<LinkedInAudienceInsights> {
    const orgId = organizationId || this.config.organizationId;
    if (!orgId) {
      throw new Error("Organization ID is required");
    }

    logger.info("Fetching LinkedIn audience insights", {
      organizationId: orgId,
    });

    const params = {
      q: "organizationalEntity",
      organizationalEntity: `urn:li:organization:${orgId}`,
    };

    const response = await this.makeRequest<any>(
      "/organizationalEntityFollowerStatistics",
      { params }
    );

    const data = response.elements?.[0] || {};

    return {
      organizationId: orgId,
      totalFollowers:
        data.followerCountsByAssociationType?.find(
          (item: any) => item.associationType === "ORGANIC"
        )?.followerCounts?.organicFollowerCount || 0,
      followerCountsByRegion:
        data.followerCountsByRegion?.map((item: any) => ({
          region: item.region,
          followerCounts: item.followerCounts?.organicFollowerCount || 0,
        })) || [],
      followerCountsByIndustry:
        data.followerCountsByIndustry?.map((item: any) => ({
          industry: item.industry,
          followerCounts: item.followerCounts?.organicFollowerCount || 0,
        })) || [],
      followerCountsByFunction:
        data.followerCountsByFunction?.map((item: any) => ({
          function: item.function,
          followerCounts: item.followerCounts?.organicFollowerCount || 0,
        })) || [],
      followerCountsBySeniority:
        data.followerCountsBySeniority?.map((item: any) => ({
          seniority: item.seniority,
          followerCounts: item.followerCounts?.organicFollowerCount || 0,
        })) || [],
      followerCountsByCompanySize:
        data.followerCountsByCompanySize?.map((item: any) => ({
          companySize: item.companySize,
          followerCounts: item.followerCounts?.organicFollowerCount || 0,
        })) || [],
      period: "lifetime",
    };
  }

  // Get Share Statistics (Detailed)
  async getShareStatistics(shareId: string): Promise<LinkedInShareStatistics> {
    logger.info("Fetching LinkedIn share statistics", { shareId });

    const params = {
      q: "share",
      share: shareId,
    };

    const response = await this.makeRequest<any>(
      "/organizationalEntityShareStatistics",
      { params }
    );

    const stats = response.elements?.[0]?.totalShareStatistics || {};

    return {
      shareId,
      clickCount: stats.clickCount || 0,
      commentCount: stats.commentCount || 0,
      engagement: stats.engagement || 0,
      impressionCount: stats.impressionCount || 0,
      likeCount: stats.likeCount || 0,
      shareCount: stats.shareCount || 0,
      uniqueImpressionsCount: stats.uniqueImpressionsCount || 0,
    };
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest("/me", {
        params: { projection: "(id)" },
      });
      return true;
    } catch (error) {
      logger.error("LinkedIn API health check failed", { error });
      return false;
    }
  }

  // Rate Limit Information
  getRateLimitInfo(): {
    callCount: number;
    averageResponseTime: number;
    resetTime: Date;
    dailyLimit: number;
    remainingDaily: number;
  } {
    return {
      callCount: this.rateLimitInfo.callCount,
      averageResponseTime:
        this.rateLimitInfo.callCount > 0
          ? this.rateLimitInfo.totalTime / this.rateLimitInfo.callCount
          : 0,
      resetTime: this.rateLimitInfo.resetTime,
      dailyLimit: this.rateLimitInfo.dailyLimit,
      remainingDaily: Math.max(
        0,
        this.rateLimitInfo.dailyLimit - this.rateLimitInfo.callCount
      ),
    };
  }

  // Utility Methods
  private calculateEngagementRate(
    engagement: number,
    impressions: number
  ): number {
    return impressions > 0 ? (engagement / impressions) * 100 : 0;
  }

  private calculateClickThroughRate(
    clicks: number,
    impressions: number
  ): number {
    return impressions > 0 ? (clicks / impressions) * 100 : 0;
  }

  // Batch Analytics Collection
  async batchCollectAnalytics(
    shareIds: string[],
    timeRange: {
      start: string;
      end: string;
    },
    options: {
      batchSize?: number;
      includeDetailedStats?: boolean;
    } = {}
  ): Promise<{
    postAnalytics: LinkedInPostAnalytics[];
    shareStatistics: LinkedInShareStatistics[];
    errors: Array<{ shareId: string; error: string }>;
  }> {
    const batchSize = options.batchSize || 5; // LinkedIn has stricter rate limits
    const results = {
      postAnalytics: [] as LinkedInPostAnalytics[],
      shareStatistics: [] as LinkedInShareStatistics[],
      errors: [] as Array<{ shareId: string; error: string }>,
    };

    logger.info("Starting batch LinkedIn analytics collection", {
      totalShareIds: shareIds.length,
      batchSize,
      timeRange,
      options,
    });

    // Process in batches
    for (let i = 0; i < shareIds.length; i += batchSize) {
      const batch = shareIds.slice(i, i + batchSize);

      const batchPromises = batch.map(async shareId => {
        try {
          const analytics = await this.getPostAnalytics(shareId, timeRange);
          results.postAnalytics.push(analytics);

          if (options.includeDetailedStats) {
            const stats = await this.getShareStatistics(shareId);
            results.shareStatistics.push(stats);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          results.errors.push({ shareId, error: errorMessage });
          logger.warn("Failed to collect analytics for share", {
            shareId,
            error: errorMessage,
          });
        }
      });

      await Promise.allSettled(batchPromises);

      // Rate limiting: wait longer between batches for LinkedIn
      if (i + batchSize < shareIds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    logger.info("Batch LinkedIn analytics collection completed", {
      successful: results.postAnalytics.length,
      errors: results.errors.length,
    });

    return results;
  }
}

// Factory function
export function createLinkedInApiClient(
  config: LinkedInConfig
): LinkedInApiClient {
  return new LinkedInApiClient(config);
}

export default LinkedInApiClient;
