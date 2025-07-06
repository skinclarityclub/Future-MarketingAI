import { logger } from "../../logger";

// Twitter API Configuration
export interface TwitterConfig {
  bearerToken: string;
  apiKey?: string;
  apiSecretKey?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  userId?: string;
  baseUrl?: string;
}

// Twitter Tweet Types
export type TwitterTweetType = "Tweet" | "Retweet" | "Quote" | "Reply";

// Twitter Tweet Object
export interface TwitterTweet {
  id: string;
  text: string;
  authorId: string;
  username?: string;
  createdAt: string;
  editedAt?: string;
  conversationId: string;
  inReplyToUserId?: string;
  lang?: string;
  source?: string;
  type: TwitterTweetType;
  contextAnnotations?: Array<{
    domain: string;
    entity: string;
  }>;
  publicMetrics: {
    retweetCount: number;
    likeCount: number;
    replyCount: number;
    quoteCount: number;
    bookmarkCount: number;
    impressionCount: number;
  };
  organicMetrics?: {
    retweetCount: number;
    likeCount: number;
    replyCount: number;
    quoteCount: number;
    impressionCount: number;
    urlLinkClicks: number;
    userProfileClicks: number;
  };
  promotedMetrics?: {
    retweetCount: number;
    likeCount: number;
    replyCount: number;
    quoteCount: number;
    impressionCount: number;
    urlLinkClicks: number;
    userProfileClicks: number;
  };
  attachments?: {
    mediaKeys?: string[];
    pollIds?: string[];
  };
  entities?: {
    urls?: Array<{
      start: number;
      end: number;
      url: string;
      expandedUrl: string;
      displayUrl: string;
    }>;
    hashtags?: Array<{
      start: number;
      end: number;
      tag: string;
    }>;
    mentions?: Array<{
      start: number;
      end: number;
      username: string;
      id: string;
    }>;
  };
}

// Twitter User Metrics
export interface TwitterUserMetrics {
  userId: string;
  username: string;
  name: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  listedCount: number;
  verified: boolean;
  description?: string;
  location?: string;
  website?: string;
  profileImageUrl?: string;
  createdAt: string;
  publicMetrics: {
    followersCount: number;
    followingCount: number;
    tweetCount: number;
    listedCount: number;
  };
}

// Twitter Analytics Metrics
export interface TwitterAnalytics {
  tweetId: string;
  impressions: number;
  engagements: number;
  engagementRate: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  urlClicks: number;
  hashtagClicks: number;
  detailExpands: number;
  mediaViews?: number;
  mediaEngagements?: number;
  videoViews?: number;
  videoCompletions?: number;
  period: "day" | "hour" | "lifetime";
  startTime: string;
  endTime: string;
}

// Twitter Audience Insights
export interface TwitterAudienceInsights {
  userId: string;
  totalFollowers: number;
  audienceGrowth: Array<{
    date: string;
    followers: number;
    following: number;
  }>;
  topCountries: Array<{
    country: string;
    percentage: number;
  }>;
  topInterests: Array<{
    interest: string;
    percentage: number;
  }>;
  genderBreakdown: Array<{
    gender: "male" | "female" | "unknown";
    percentage: number;
  }>;
  ageBreakdown: Array<{
    ageRange: string;
    percentage: number;
  }>;
  period: "lifetime" | "day" | "week";
}

// API Response Types
export interface TwitterApiResponse<T> {
  data: T;
  includes?: {
    users?: TwitterUserMetrics[];
    tweets?: TwitterTweet[];
    media?: Array<{
      mediaKey: string;
      type: "photo" | "video" | "animated_gif";
      url?: string;
      previewImageUrl?: string;
      durationMs?: number;
      height?: number;
      width?: number;
      publicMetrics?: {
        viewCount: number;
      };
    }>;
  };
  meta?: {
    resultCount: number;
    nextToken?: string;
    previousToken?: string;
    newestId?: string;
    oldestId?: string;
  };
  errors?: Array<{
    detail: string;
    title: string;
    resourceType: string;
    parameter: string;
    value: string;
    type: string;
  }>;
}

// Twitter API Client
export class TwitterApiClient {
  private config: TwitterConfig;
  private baseUrl: string;
  private rateLimitInfo: {
    callCount: number;
    totalTime: number;
    resetTime: Date;
    remainingRequests: number;
    resetTimeEpoch: number;
  } = {
    callCount: 0,
    totalTime: 0,
    resetTime: new Date(),
    remainingRequests: 75, // Twitter API v2 default rate limit
    resetTimeEpoch: 0,
  };

  constructor(config: TwitterConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://api.twitter.com/2";

    if (!config.bearerToken) {
      throw new Error("Twitter API Bearer Token is required");
    }

    logger.info("Twitter API client initialized", {
      baseUrl: this.baseUrl,
      hasBearerToken: !!config.bearerToken,
      userId: config.userId,
    });
  }

  // Make API Request
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: string;
      params?: Record<string, string>;
      useUserAuth?: boolean;
    } = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "SKC-BI-Dashboard/1.0",
    };

    // Use appropriate authentication
    if (options.useUserAuth && this.config.accessToken) {
      // OAuth 1.0a for user context endpoints
      headers["Authorization"] = `Bearer ${this.config.accessToken}`;
    } else {
      // App-only authentication with Bearer Token
      headers["Authorization"] = `Bearer ${this.config.bearerToken}`;
    }

    const requestOptions: RequestInit = {
      method: options.method || "GET",
      headers,
    };

    if (options.body) {
      requestOptions.body = options.body;
    }

    try {
      const startTime = Date.now();
      const response = await fetch(url.toString(), requestOptions);
      const requestTime = Date.now() - startTime;

      // Update rate limit tracking
      this.updateRateLimitTracking(response, requestTime);

      if (!response.ok) {
        const errorData = await response.json();

        logger.error("Twitter API request failed", {
          endpoint: url.toString(),
          status: response.status,
          errors: errorData.errors,
        });

        const errorMessage =
          errorData.errors?.[0]?.detail ||
          errorData.detail ||
          `HTTP ${response.status}`;
        throw new Error(`Twitter API Error: ${errorMessage}`);
      }

      const data = await response.json();
      logger.debug("Twitter API request successful", {
        endpoint,
        method: options.method || "GET",
        responseTime: requestTime,
        resultCount: data.meta?.resultCount,
      });

      return data;
    } catch (error) {
      logger.error("Twitter API request error", {
        endpoint,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private updateRateLimitTracking(
    response: Response,
    requestTime: number
  ): void {
    this.rateLimitInfo.callCount++;
    this.rateLimitInfo.totalTime += requestTime;

    // Update rate limit info from headers
    const remaining = response.headers.get("x-rate-limit-remaining");
    const reset = response.headers.get("x-rate-limit-reset");

    if (remaining) {
      this.rateLimitInfo.remainingRequests = parseInt(remaining);
    }

    if (reset) {
      this.rateLimitInfo.resetTimeEpoch = parseInt(reset);
      this.rateLimitInfo.resetTime = new Date(parseInt(reset) * 1000);
    }
  }

  // Get User Information
  async getUserInfo(
    userId?: string,
    username?: string
  ): Promise<TwitterUserMetrics> {
    const identifier = userId || this.config.userId || username;
    if (!identifier) {
      throw new Error("User ID or username is required");
    }

    logger.info("Fetching Twitter user information", {
      identifier,
    });

    const endpoint =
      userId || this.config.userId
        ? `/users/${identifier}`
        : `/users/by/username/${identifier}`;

    const response = await this.makeRequest<
      TwitterApiResponse<TwitterUserMetrics>
    >(endpoint, {
      params: {
        "user.fields":
          "id,name,username,created_at,description,location,url,verified,public_metrics,profile_image_url",
      },
    });

    const user = response.data;
    return {
      userId: user.userId,
      username: user.username,
      name: user.name,
      followersCount: user.publicMetrics.followersCount,
      followingCount: user.publicMetrics.followingCount,
      tweetCount: user.publicMetrics.tweetCount,
      listedCount: user.publicMetrics.listedCount,
      verified: user.verified,
      description: user.description,
      location: user.location,
      website: user.website,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      publicMetrics: user.publicMetrics,
    };
  }

  // Get User Tweets
  async getUserTweets(
    userId?: string,
    options: {
      maxResults?: number;
      sinceId?: string;
      untilId?: string;
      startTime?: string;
      endTime?: string;
      excludeReplies?: boolean;
      excludeRetweets?: boolean;
      paginationToken?: string;
    } = {}
  ): Promise<TwitterApiResponse<TwitterTweet[]>> {
    const userIdToUse = userId || this.config.userId;
    if (!userIdToUse) {
      throw new Error("User ID is required");
    }

    logger.info("Fetching Twitter user tweets", {
      userId: userIdToUse,
      options,
    });

    const params: Record<string, string> = {
      "tweet.fields":
        "id,text,author_id,created_at,conversation_id,in_reply_to_user_id,lang,source,context_annotations,public_metrics,organic_metrics,promoted_metrics,attachments,entities",
      "user.fields": "id,name,username,verified",
      "media.fields":
        "media_key,type,url,preview_image_url,duration_ms,height,width,public_metrics",
      expansions: "author_id,attachments.media_keys",
    };

    if (options.maxResults)
      params.max_results = Math.min(options.maxResults, 100).toString();
    if (options.sinceId) params.since_id = options.sinceId;
    if (options.untilId) params.until_id = options.untilId;
    if (options.startTime) params.start_time = options.startTime;
    if (options.endTime) params.end_time = options.endTime;
    if (options.excludeReplies) params.exclude = "replies";
    if (options.excludeRetweets)
      params.exclude = params.exclude
        ? `${params.exclude},retweets`
        : "retweets";
    if (options.paginationToken)
      params.pagination_token = options.paginationToken;

    const response = await this.makeRequest<TwitterApiResponse<any[]>>(
      `/users/${userIdToUse}/tweets`,
      { params }
    );

    return {
      data:
        response.data?.map((tweet: any) => ({
          id: tweet.id,
          text: tweet.text,
          authorId: tweet.author_id,
          username: response.includes?.users?.find(
            (u: any) => u.id === tweet.author_id
          )?.username,
          createdAt: tweet.created_at,
          editedAt: tweet.edited_at,
          conversationId: tweet.conversation_id,
          inReplyToUserId: tweet.in_reply_to_user_id,
          lang: tweet.lang,
          source: tweet.source,
          type: this.determineTweetType(tweet),
          contextAnnotations: tweet.context_annotations,
          publicMetrics: tweet.public_metrics,
          organicMetrics: tweet.organic_metrics,
          promotedMetrics: tweet.promoted_metrics,
          attachments: tweet.attachments,
          entities: tweet.entities,
        })) || [],
      includes: response.includes,
      meta: response.meta,
      errors: response.errors,
    };
  }

  private determineTweetType(tweet: any): TwitterTweetType {
    if (tweet.referenced_tweets) {
      const refType = tweet.referenced_tweets[0]?.type;
      if (refType === "retweeted") return "Retweet";
      if (refType === "quoted") return "Quote";
      if (refType === "replied_to") return "Reply";
    }
    return "Tweet";
  }

  // Get Tweet Analytics (requires user context/elevated access)
  async getTweetAnalytics(
    tweetId: string,
    granularity: "hour" | "day" = "day"
  ): Promise<TwitterAnalytics> {
    logger.info("Fetching Twitter tweet analytics", {
      tweetId,
      granularity,
    });

    // This requires elevated access and user context
    const response = await this.makeRequest<any>(`/tweets/${tweetId}/metrics`, {
      params: {
        granularity,
        "tweet.fields": "public_metrics,organic_metrics,promoted_metrics",
      },
      useUserAuth: true,
    });

    const metrics = response.data;
    const publicMetrics = metrics.public_metrics || {};
    const organicMetrics = metrics.organic_metrics || {};
    const promotedMetrics = metrics.promoted_metrics || {};

    const totalImpressions =
      (organicMetrics.impression_count || 0) +
      (promotedMetrics.impression_count || 0);
    const totalEngagements =
      (organicMetrics.like_count || 0) +
      (organicMetrics.retweet_count || 0) +
      (organicMetrics.reply_count || 0) +
      (organicMetrics.quote_count || 0);

    return {
      tweetId,
      impressions: totalImpressions,
      engagements: totalEngagements,
      engagementRate:
        totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0,
      likes: publicMetrics.like_count || 0,
      retweets: publicMetrics.retweet_count || 0,
      replies: publicMetrics.reply_count || 0,
      quotes: publicMetrics.quote_count || 0,
      bookmarks: publicMetrics.bookmark_count || 0,
      urlClicks: organicMetrics.url_link_clicks || 0,
      hashtagClicks: 0, // Not available in basic metrics
      detailExpands: 0, // Not available in basic metrics
      mediaViews: 0, // Would need media-specific metrics
      mediaEngagements: 0, // Would need media-specific metrics
      videoViews: 0, // Would need video-specific metrics
      videoCompletions: 0, // Would need video-specific metrics
      period: granularity,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    };
  }

  // Get Tweet by ID
  async getTweet(tweetId: string): Promise<TwitterTweet> {
    logger.info("Fetching Twitter tweet", { tweetId });

    const response = await this.makeRequest<TwitterApiResponse<any>>(
      `/tweets/${tweetId}`,
      {
        params: {
          "tweet.fields":
            "id,text,author_id,created_at,conversation_id,in_reply_to_user_id,lang,source,context_annotations,public_metrics,organic_metrics,promoted_metrics,attachments,entities",
          "user.fields": "id,name,username,verified",
          "media.fields":
            "media_key,type,url,preview_image_url,duration_ms,height,width,public_metrics",
          expansions: "author_id,attachments.media_keys",
        },
      }
    );

    const tweet = response.data;
    return {
      id: tweet.id,
      text: tweet.text,
      authorId: tweet.author_id,
      username: response.includes?.users?.find(
        (u: any) => u.id === tweet.author_id
      )?.username,
      createdAt: tweet.created_at,
      editedAt: tweet.edited_at,
      conversationId: tweet.conversation_id,
      inReplyToUserId: tweet.in_reply_to_user_id,
      lang: tweet.lang,
      source: tweet.source,
      type: this.determineTweetType(tweet),
      contextAnnotations: tweet.context_annotations,
      publicMetrics: tweet.public_metrics,
      organicMetrics: tweet.organic_metrics,
      promotedMetrics: tweet.promoted_metrics,
      attachments: tweet.attachments,
      entities: tweet.entities,
    };
  }

  // Search Tweets
  async searchTweets(
    query: string,
    options: {
      maxResults?: number;
      startTime?: string;
      endTime?: string;
      nextToken?: string;
      sortOrder?: "recency" | "relevancy";
    } = {}
  ): Promise<TwitterApiResponse<TwitterTweet[]>> {
    logger.info("Searching Twitter tweets", { query, options });

    const params: Record<string, string> = {
      query,
      "tweet.fields":
        "id,text,author_id,created_at,conversation_id,lang,source,context_annotations,public_metrics,attachments,entities",
      "user.fields": "id,name,username,verified",
      expansions: "author_id,attachments.media_keys",
    };

    if (options.maxResults)
      params.max_results = Math.min(options.maxResults, 100).toString();
    if (options.startTime) params.start_time = options.startTime;
    if (options.endTime) params.end_time = options.endTime;
    if (options.nextToken) params.next_token = options.nextToken;
    if (options.sortOrder) params.sort_order = options.sortOrder;

    const response = await this.makeRequest<TwitterApiResponse<any[]>>(
      "/tweets/search/recent",
      { params }
    );

    return {
      data:
        response.data?.map((tweet: any) => ({
          id: tweet.id,
          text: tweet.text,
          authorId: tweet.author_id,
          username: response.includes?.users?.find(
            (u: any) => u.id === tweet.author_id
          )?.username,
          createdAt: tweet.created_at,
          editedAt: tweet.edited_at,
          conversationId: tweet.conversation_id,
          inReplyToUserId: tweet.in_reply_to_user_id,
          lang: tweet.lang,
          source: tweet.source,
          type: this.determineTweetType(tweet),
          contextAnnotations: tweet.context_annotations,
          publicMetrics: tweet.public_metrics,
          organicMetrics: tweet.organic_metrics,
          promotedMetrics: tweet.promoted_metrics,
          attachments: tweet.attachments,
          entities: tweet.entities,
        })) || [],
      includes: response.includes,
      meta: response.meta,
      errors: response.errors,
    };
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest("/tweets/search/recent", {
        params: {
          query: "hello",
          max_results: "10",
        },
      });
      return true;
    } catch (error) {
      logger.error("Twitter API health check failed", { error });
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

  // Batch Tweet Collection
  async batchCollectTweets(
    tweetIds: string[],
    options: {
      includeAnalytics?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{
    tweets: TwitterTweet[];
    analytics: TwitterAnalytics[];
    errors: Array<{ tweetId: string; error: string }>;
  }> {
    const batchSize = options.batchSize || 100; // Twitter API supports up to 100 tweet IDs per request
    const results = {
      tweets: [] as TwitterTweet[],
      analytics: [] as TwitterAnalytics[],
      errors: [] as Array<{ tweetId: string; error: string }>,
    };

    logger.info("Starting batch Twitter tweet collection", {
      totalTweetIds: tweetIds.length,
      batchSize,
      options,
    });

    // Process in batches
    for (let i = 0; i < tweetIds.length; i += batchSize) {
      const batch = tweetIds.slice(i, i + batchSize);

      try {
        // Get tweets in batch
        const response = await this.makeRequest<TwitterApiResponse<any[]>>(
          "/tweets",
          {
            params: {
              ids: batch.join(","),
              "tweet.fields":
                "id,text,author_id,created_at,conversation_id,lang,source,context_annotations,public_metrics,organic_metrics,promoted_metrics,attachments,entities",
              "user.fields": "id,name,username,verified",
              expansions: "author_id,attachments.media_keys",
            },
          }
        );

        // Process successful tweets
        if (response.data) {
          const tweets = response.data.map((tweet: any) => ({
            id: tweet.id,
            text: tweet.text,
            authorId: tweet.author_id,
            username: response.includes?.users?.find(
              (u: any) => u.id === tweet.author_id
            )?.username,
            createdAt: tweet.created_at,
            editedAt: tweet.edited_at,
            conversationId: tweet.conversation_id,
            inReplyToUserId: tweet.in_reply_to_user_id,
            lang: tweet.lang,
            source: tweet.source,
            type: this.determineTweetType(tweet),
            contextAnnotations: tweet.context_annotations,
            publicMetrics: tweet.public_metrics,
            organicMetrics: tweet.organic_metrics,
            promotedMetrics: tweet.promoted_metrics,
            attachments: tweet.attachments,
            entities: tweet.entities,
          }));

          results.tweets.push(...tweets);

          // Collect analytics if requested (requires elevated access)
          if (options.includeAnalytics) {
            for (const tweet of tweets) {
              try {
                const analytics = await this.getTweetAnalytics(tweet.id);
                results.analytics.push(analytics);
              } catch (analyticsError) {
                logger.warn("Failed to collect analytics for tweet", {
                  tweetId: tweet.id,
                  error:
                    analyticsError instanceof Error
                      ? analyticsError.message
                      : String(analyticsError),
                });
              }
            }
          }
        }

        // Process errors
        if (response.errors) {
          response.errors.forEach(error => {
            results.errors.push({
              tweetId: error.value,
              error: error.detail,
            });
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        batch.forEach(tweetId => {
          results.errors.push({ tweetId, error: errorMessage });
        });
        logger.warn("Failed to collect batch of tweets", {
          batch,
          error: errorMessage,
        });
      }

      // Rate limiting: wait between batches
      if (i + batchSize < tweetIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info("Batch Twitter tweet collection completed", {
      successful: results.tweets.length,
      analytics: results.analytics.length,
      errors: results.errors.length,
    });

    return results;
  }
}

// Factory function
export function createTwitterApiClient(
  config: TwitterConfig
): TwitterApiClient {
  return new TwitterApiClient(config);
}

export default TwitterApiClient;
