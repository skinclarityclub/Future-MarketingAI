// LinkedIn Platform Connector
// Implementatie voor LinkedIn API integratie

import {
  BasePlatformConnector,
  PlatformConnectorConfig,
  PostContent,
  PublishedPost,
  PostMetrics,
  PlatformLimits,
  AuthCredentials,
  MediaItem,
  PlatformError,
} from "./base";

export interface LinkedInPostRequest {
  author: string;
  lifecycleState: "PUBLISHED" | "DRAFT";
  specificContent: {
    "com.linkedin.ugc.ShareContent": {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: "NONE" | "IMAGE" | "VIDEO" | "ARTICLE";
      media?: Array<{
        status: "READY";
        description?: {
          text: string;
        };
        media: string; // URN of uploaded media
        title?: {
          text: string;
        };
      }>;
    };
  };
  visibility: {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" | "CONNECTIONS";
  };
}

export interface LinkedInProfile {
  id: string;
  firstName: {
    localized: Record<string, string>;
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  lastName: {
    localized: Record<string, string>;
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  profilePicture?: {
    "displayImage~": {
      elements: Array<{
        identifiers: Array<{
          identifier: string;
        }>;
      }>;
    };
  };
}

export class LinkedInConnector extends BasePlatformConnector {
  private readonly apiBaseUrl = "https://api.linkedin.com/v2";
  private readonly mediaApiUrl = "https://api.linkedin.com/media/upload";
  private profile: LinkedInProfile | null = null;

  constructor(config: PlatformConnectorConfig) {
    super(config);
    if (config.platform !== "linkedin") {
      throw new Error(
        "LinkedInConnector can only be used with linkedin platform"
      );
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      this.log("info", "Authenticating with LinkedIn API");

      // Valideer credentials door profile op te halen
      const profile = await this.getUserProfile();
      if (profile) {
        this.profile = profile;
        this.isAuthenticated = true;
        this.log("info", "LinkedIn authentication successful");
        return true;
      }

      return false;
    } catch (error) {
      this.log("error", "LinkedIn authentication failed", error);
      this.isAuthenticated = false;
      return false;
    }
  }

  async refreshAuth(): Promise<boolean> {
    try {
      if (!this.config.credentials.refreshToken) {
        this.log("warn", "No refresh token available");
        return false;
      }

      this.log("info", "Refreshing LinkedIn access token");

      const response = await fetch(
        "https://www.linkedin.com/oauth/v2/accessToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: this.config.credentials.refreshToken,
            client_id: process.env.LINKEDIN_CLIENT_ID || "",
            client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Token refresh failed: " + response.statusText);
      }

      const data = await response.json();

      // Update credentials
      this.config.credentials.accessToken = data.access_token;
      if (data.refresh_token) {
        this.config.credentials.refreshToken = data.refresh_token;
      }
      this.config.credentials.expiresAt = new Date(
        Date.now() + data.expires_in * 1000
      );

      this.log("info", "LinkedIn token refreshed successfully");
      return true;
    } catch (error) {
      this.log("error", "LinkedIn token refresh failed", error);
      return false;
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.makeApiCall("/people/~");
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async createPost(content: PostContent): Promise<PublishedPost> {
    this.log("info", "Creating LinkedIn post");
    this.validateContent(content);
    await this.handleRateLimit();

    return this.retryOperation(async () => {
      // Upload media indien aanwezig
      const mediaUrns: string[] = [];
      if (content.media && content.media.length > 0) {
        for (const media of content.media) {
          const urn = await this.uploadMedia(media);
          mediaUrns.push(urn);
        }
      }

      // Creëer post payload
      const postData = this.buildPostPayload(content, mediaUrns);

      const response = await this.makeApiCall("/ugcPosts", {
        method: "POST",
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw this.convertLinkedInError(error);
      }

      const result = await response.json();

      const publishedPost: PublishedPost = {
        id: "linkedin-" + Date.now(),
        platformPostId: result.id,
        platform: "linkedin",
        status: "published",
        content,
        publishedAt: new Date(),
        url: "https://www.linkedin.com/feed/update/" + result.id,
      };

      this.log("info", "LinkedIn post created successfully", {
        postId: result.id,
      });
      return publishedPost;
    }, "createPost");
  }

  async updatePost(
    postId: string,
    content: Partial<PostContent>
  ): Promise<PublishedPost> {
    // LinkedIn API ondersteunt geen post updates na publicatie
    throw new Error("LinkedIn does not support updating published posts");
  }

  async deletePost(postId: string): Promise<boolean> {
    this.log("info", "Deleting LinkedIn post", { postId });
    await this.handleRateLimit();

    return this.retryOperation(async () => {
      const response = await this.makeApiCall("/ugcPosts/" + postId, {
        method: "DELETE",
      });

      if (response.ok) {
        this.log("info", "LinkedIn post deleted successfully", { postId });
        return true;
      }

      const error = await response.json();
      throw this.convertLinkedInError(error);
    }, "deletePost");
  }

  async getPost(postId: string): Promise<PublishedPost | null> {
    this.log("debug", "Fetching LinkedIn post", { postId });
    await this.handleRateLimit();

    try {
      const response = await this.makeApiCall("/ugcPosts/" + postId);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch post: " + response.statusText);
      }

      const postData = await response.json();
      return this.convertLinkedInPostToPublishedPost(postData);
    } catch (error) {
      this.log("error", "Failed to fetch LinkedIn post", error);
      return null;
    }
  }

  async getPostMetrics(postId: string): Promise<PostMetrics> {
    this.log("debug", "Fetching LinkedIn post metrics", { postId });
    await this.handleRateLimit();

    try {
      // LinkedIn heeft beperkte metrics API - meestal alleen voor company pages
      const response = await this.makeApiCall(
        "/socialActions/" + postId + "/statistics"
      );

      if (response.ok) {
        const data = await response.json();
        return {
          likes: data.numLikes || 0,
          comments: data.numComments || 0,
          shares: data.numShares || 0,
          views: data.numViews || 0,
          clicks: data.numClicks || 0,
          lastUpdated: new Date(),
        };
      }

      // Return empty metrics indien niet beschikbaar
      return {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.log("warn", "Failed to fetch LinkedIn metrics", error);
      return {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        lastUpdated: new Date(),
      };
    }
  }

  async getUserInfo(): Promise<AuthCredentials["metadata"]> {
    if (!this.profile) {
      this.profile = await this.getUserProfile();
    }

    if (!this.profile) {
      return {};
    }

    const firstName = Object.values(this.profile.firstName.localized)[0] || "";
    const lastName = Object.values(this.profile.lastName.localized)[0] || "";

    return {
      userId: this.profile.id,
      displayName: (firstName + " " + lastName).trim(),
      username: firstName.toLowerCase() + "." + lastName.toLowerCase(),
      profileImage: this.extractProfileImageUrl(this.profile),
    };
  }

  getPlatformLimits(): PlatformLimits {
    return {
      textLength: {
        max: 3000,
        recommended: 1300,
      },
      mediaLimits: {
        images: {
          maxCount: 9,
          maxSizeBytes: 100 * 1024 * 1024, // 100MB
          supportedFormats: ["jpg", "jpeg", "png", "gif"],
          dimensions: {
            min: { width: 400, height: 400 },
            max: { width: 7680, height: 4320 },
            recommended: { width: 1200, height: 627 },
          },
        },
        videos: {
          maxCount: 1,
          maxSizeBytes: 5 * 1024 * 1024 * 1024, // 5GB
          maxDurationSeconds: 600, // 10 minutes
          supportedFormats: ["mp4", "mov", "avi"],
          dimensions: {
            min: { width: 256, height: 144 },
            max: { width: 4096, height: 2304 },
            recommended: { width: 1280, height: 720 },
          },
        },
      },
      hashtagLimits: {
        max: 30,
        recommended: 5,
      },
      rateLimit: {
        postsPerHour: 150,
        postsPerDay: 500,
        apiCallsPerHour: 2000,
      },
    };
  }

  // Private helper methods

  private async makeApiCall(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = this.apiBaseUrl + endpoint;

    const defaultHeaders = {
      Authorization: "Bearer " + this.config.credentials.accessToken,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    };

    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    if (this.config.logging.logRequests) {
      this.log("debug", "LinkedIn API request", {
        url,
        options: requestOptions,
      });
    }

    const response = await fetch(url, requestOptions);

    if (this.config.logging.logResponses) {
      this.log("debug", "LinkedIn API response", {
        status: response.status,
        statusText: response.statusText,
      });
    }

    // Update rate limit info indien aanwezig
    this.updateRateLimitFromHeaders(response.headers);

    return response;
  }

  private async getUserProfile(): Promise<LinkedInProfile | null> {
    try {
      const response = await this.makeApiCall(
        "/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))"
      );

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      this.log("error", "Failed to fetch LinkedIn profile", error);
      return null;
    }
  }

  private async uploadMedia(media: MediaItem): Promise<string> {
    this.log("info", "Uploading media to LinkedIn", {
      mediaId: media.id,
      type: media.type,
    });

    // Stap 1: Registreer upload
    const registerResponse = await this.makeApiCall(
      "/assets?action=registerUpload",
      {
        method: "POST",
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: [
              media.type === "image"
                ? "urn:li:digitalmediaRecipe:feedshare-image"
                : "urn:li:digitalmediaRecipe:feedshare-video",
            ],
            owner: "urn:li:person:" + this.config.credentials.userId,
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent",
              },
            ],
          },
        }),
      }
    );

    if (!registerResponse.ok) {
      throw new Error("Failed to register media upload");
    }

    const registerData = await registerResponse.json();
    const uploadUrl =
      registerData.value.uploadMechanism[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ].uploadUrl;
    const asset = registerData.value.asset;

    // Stap 2: Upload binary data
    const mediaResponse = await fetch(media.url);
    const mediaBuffer = await mediaResponse.arrayBuffer();

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: mediaBuffer,
      headers: {
        Authorization: "Bearer " + this.config.credentials.accessToken,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload media binary");
    }

    this.log("info", "Media uploaded successfully", { asset });
    return asset;
  }

  private buildPostPayload(
    content: PostContent,
    mediaUrns: string[]
  ): LinkedInPostRequest {
    const hasMedia = mediaUrns.length > 0;

    const payload: LinkedInPostRequest = {
      author: "urn:li:person:" + this.config.credentials.userId,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: this.formatTextWithHashtags(
              content.text || "",
              content.hashtags || []
            ),
          },
          shareMediaCategory: hasMedia ? "IMAGE" : "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    // Voeg media toe indien aanwezig
    if (hasMedia) {
      payload.specificContent["com.linkedin.ugc.ShareContent"].media =
        mediaUrns.map(urn => ({
          status: "READY" as const,
          media: urn,
        }));
    }

    return payload;
  }

  private formatTextWithHashtags(text: string, hashtags: string[]): string {
    let formattedText = text;

    if (hashtags.length > 0) {
      const hashtagString = hashtags
        .map(tag => (tag.startsWith("#") ? tag : "#" + tag))
        .join(" ");
      formattedText = text + "\n\n" + hashtagString;
    }

    return formattedText;
  }

  private convertLinkedInPostToPublishedPost(linkedInPost: any): PublishedPost {
    return {
      id: "linkedin-" + linkedInPost.id,
      platformPostId: linkedInPost.id,
      platform: "linkedin",
      status: "published",
      content: {
        text:
          linkedInPost.specificContent?.["com.linkedin.ugc.ShareContent"]
            ?.shareCommentary?.text || "",
      },
      publishedAt: new Date(linkedInPost.created?.time || Date.now()),
      url: "https://www.linkedin.com/feed/update/" + linkedInPost.id,
    };
  }

  private convertLinkedInError(error: any): PlatformError {
    return {
      code: error.code || error.status || "LINKEDIN_ERROR",
      message: error.message || "LinkedIn API error",
      timestamp: new Date(),
      retryable: this.isRetryableLinkedInError(error),
      details: error,
    };
  }

  private isRetryableLinkedInError(error: any): boolean {
    const retryableCodes = [
      "RATE_LIMIT_EXCEEDED",
      "THROTTLE_LIMIT_EXCEEDED",
      "INTERNAL_ERROR",
    ];
    return retryableCodes.includes(error.code) || this.isRetryableError(error);
  }

  private updateRateLimitFromHeaders(headers: Headers): void {
    const remaining = headers.get("X-RateLimit-Remaining");
    const total = headers.get("X-RateLimit-Limit");
    const reset = headers.get("X-RateLimit-Reset");

    if (remaining && total && reset) {
      this.rateLimitInfo = {
        remaining: parseInt(remaining),
        total: parseInt(total),
        resetTime: new Date(parseInt(reset) * 1000),
        windowDuration: 3600, // LinkedIn gebruikt 1 hour windows
      };
    }
  }

  private extractProfileImageUrl(profile: LinkedInProfile): string | undefined {
    try {
      const elements = profile.profilePicture?.["displayImage~"]?.elements;
      if (elements && elements.length > 0) {
        return elements[0].identifiers[0].identifier;
      }
    } catch (error) {
      this.log("debug", "Could not extract profile image URL", error);
    }
    return undefined;
  }
}

/**
 * Factory function voor LinkedIn connector
 */
export function createLinkedInConnector(
  credentials: AuthCredentials
): LinkedInConnector {
  const config: PlatformConnectorConfig = {
    platform: "linkedin",
    credentials,
    enableRateLimit: true,
    enableRetry: true,
    retryConfig: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      maxBackoffSeconds: 60,
    },
    logging: {
      enableDebug: false,
      logRequests: true,
      logResponses: false,
    },
  };

  return new LinkedInConnector(config);
}
