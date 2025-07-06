/**
 * Enhanced API Connectors for Unified Data Collection Pipeline
 * Task 72.2: Ontwikkel unified data collection pipeline
 *
 * Verbeterde API connectors met robuuste error handling, rate limiting,
 * en data quality validation voor alle social media platforms
 */

import { logger } from "../logger";
import {
  InstagramBusinessApiClient,
  type InstagramBusinessConfig,
} from "../analytics/social-media/instagram-business-api";
import {
  LinkedInApiClient,
  type LinkedInConfig,
} from "../analytics/social-media/linkedin-api";
import {
  FacebookGraphApiClient,
  type FacebookConfig,
} from "../analytics/social-media/facebook-graph-api";

// Enhanced API Response Interface
export interface EnhancedApiResponse<T = any> {
  success: boolean;
  data: T;
  metadata: {
    source: string;
    timestamp: string;
    request_id: string;
    rate_limit_remaining?: number;
    quality_score: number;
    confidence_level: "high" | "medium" | "low";
  };
  pagination?: {
    has_next: boolean;
    next_cursor?: string;
    total_count?: number;
    page_size: number;
  };
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
    severity: "error" | "warning" | "info";
  }>;
  warnings?: string[];
}

// Rate Limiting Configuration
export interface RateLimitConfig {
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  backoff_strategy: "exponential" | "linear" | "fixed";
  max_retries: number;
  initial_delay_ms: number;
  max_delay_ms: number;
}

// Data Quality Metrics
export interface DataQualityMetrics {
  completeness_score: number; // 0-1
  accuracy_score: number; // 0-1
  consistency_score: number; // 0-1
  timeliness_score: number; // 0-1
  validity_score: number; // 0-1
  overall_quality: number; // 0-1
  quality_issues: Array<{
    field: string;
    issue_type: "missing" | "invalid" | "outdated" | "inconsistent";
    description: string;
    severity: "critical" | "high" | "medium" | "low";
  }>;
}

// Enhanced Connector Base Class
export abstract class EnhancedApiConnector {
  protected rateLimitConfig: RateLimitConfig;
  protected requestHistory: Array<{ timestamp: number; success: boolean }> = [];
  protected lastRequestTime: number = 0;
  protected consecutiveErrors: number = 0;
  protected isHealthy: boolean = true;

  constructor(rateLimitConfig: Partial<RateLimitConfig> = {}) {
    this.rateLimitConfig = {
      requests_per_minute: 60,
      requests_per_hour: 1000,
      requests_per_day: 5000,
      backoff_strategy: "exponential",
      max_retries: 3,
      initial_delay_ms: 1000,
      max_delay_ms: 30000,
      ...rateLimitConfig,
    };
  }

  // Rate Limiting Logic
  protected async enforceRateLimit(): Promise<void> {
    const now = Date.now();

    // Clean old entries from request history
    const oneHourAgo = now - 60 * 60 * 1000;
    this.requestHistory = this.requestHistory.filter(
      req => req.timestamp > oneHourAgo
    );

    // Check rate limits
    const recentRequests = this.requestHistory.filter(
      req => req.timestamp > now - 60 * 1000
    );

    if (recentRequests.length >= this.rateLimitConfig.requests_per_minute) {
      const waitTime = 60000 - (now - recentRequests[0].timestamp);
      logger.warn("Rate limit approaching, waiting", {
        waitTime,
        connector: this.constructor.name,
      });
      await this.sleep(waitTime);
    }

    // Minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minDelay = 60000 / this.rateLimitConfig.requests_per_minute;

    if (timeSinceLastRequest < minDelay) {
      await this.sleep(minDelay - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  // Retry Logic with Exponential Backoff
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (
      let attempt = 1;
      attempt <= this.rateLimitConfig.max_retries;
      attempt++
    ) {
      try {
        await this.enforceRateLimit();

        const result = await operation();

        // Reset error counter on success
        this.consecutiveErrors = 0;
        this.isHealthy = true;

        // Record successful request
        this.requestHistory.push({ timestamp: Date.now(), success: true });

        return result;
      } catch (error) {
        lastError = error as Error;
        this.consecutiveErrors++;

        // Record failed request
        this.requestHistory.push({ timestamp: Date.now(), success: false });

        logger.warn(
          `API call failed (attempt ${attempt}/${this.rateLimitConfig.max_retries})`,
          {
            context,
            error: error.message,
            connector: this.constructor.name,
          }
        );

        // Don't retry on the last attempt
        if (attempt === this.rateLimitConfig.max_retries) {
          this.isHealthy = false;
          break;
        }

        // Calculate backoff delay
        const delay = this.calculateBackoffDelay(attempt);
        await this.sleep(delay);
      }
    }

    throw (
      lastError ||
      new Error(`Failed after ${this.rateLimitConfig.max_retries} attempts`)
    );
  }

  // Backoff Strategy Implementation
  private calculateBackoffDelay(attempt: number): number {
    const { backoff_strategy, initial_delay_ms, max_delay_ms } =
      this.rateLimitConfig;

    let delay: number;

    switch (backoff_strategy) {
      case "exponential":
        delay = initial_delay_ms * Math.pow(2, attempt - 1);
        break;
      case "linear":
        delay = initial_delay_ms * attempt;
        break;
      case "fixed":
      default:
        delay = initial_delay_ms;
        break;
    }

    return Math.min(delay, max_delay_ms);
  }

  // Data Quality Assessment
  protected assessDataQuality(
    data: any,
    requiredFields: string[]
  ): DataQualityMetrics {
    const issues: DataQualityMetrics["quality_issues"] = [];

    // Completeness Check
    let completeFields = 0;
    requiredFields.forEach(field => {
      if (
        data[field] !== undefined &&
        data[field] !== null &&
        data[field] !== ""
      ) {
        completeFields++;
      } else {
        issues.push({
          field,
          issue_type: "missing",
          description: `Required field '${field}' is missing or empty`,
          severity: "high",
        });
      }
    });

    const completeness_score = completeFields / requiredFields.length;

    // Validity Check
    let validFields = 0;
    const fieldsToCheck = Object.keys(data);

    fieldsToCheck.forEach(field => {
      const value = data[field];
      let isValid = true;

      // Date validation
      if (
        field.includes("date") ||
        field.includes("time") ||
        field.includes("_at")
      ) {
        if (value && !this.isValidDate(value)) {
          isValid = false;
          issues.push({
            field,
            issue_type: "invalid",
            description: `Invalid date format in '${field}'`,
            severity: "medium",
          });
        }
      }

      // Numeric validation
      if (
        field.includes("count") ||
        field.includes("rate") ||
        field.includes("score")
      ) {
        if (value && !this.isValidNumber(value)) {
          isValid = false;
          issues.push({
            field,
            issue_type: "invalid",
            description: `Invalid numeric value in '${field}'`,
            severity: "medium",
          });
        }
      }

      if (isValid) validFields++;
    });

    const validity_score =
      fieldsToCheck.length > 0 ? validFields / fieldsToCheck.length : 1;

    // Timeliness Check
    const timeliness_score = this.assessTimeliness(data);

    // Consistency Check (simplified)
    const consistency_score = 0.9; // Placeholder for more complex consistency checks

    // Accuracy Check (simplified)
    const accuracy_score = 0.85; // Placeholder for accuracy validation

    // Overall Quality Score
    const overall_quality =
      completeness_score * 0.3 +
      validity_score * 0.25 +
      timeliness_score * 0.2 +
      consistency_score * 0.15 +
      accuracy_score * 0.1;

    return {
      completeness_score,
      accuracy_score,
      consistency_score,
      timeliness_score,
      validity_score,
      overall_quality,
      quality_issues: issues,
    };
  }

  // Helper Methods
  private isValidDate(value: any): boolean {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime()) && date.getTime() > 0;
  }

  private isValidNumber(value: any): boolean {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
  }

  private assessTimeliness(data: any): number {
    // Check for timestamp fields and assess how recent the data is
    const timestampFields = [
      "created_at",
      "updated_at",
      "published_at",
      "timestamp",
    ];
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    for (const field of timestampFields) {
      if (data[field]) {
        const timestamp = new Date(data[field]).getTime();
        const age = now - timestamp;

        // Newer data gets higher timeliness score
        if (age < oneWeek) {
          return 1.0;
        } else if (age < oneWeek * 4) {
          return 0.8;
        } else {
          return 0.6;
        }
      }
    }

    return 0.5; // Default score if no timestamp found
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health Check
  public getHealthStatus(): {
    healthy: boolean;
    consecutive_errors: number;
    success_rate: number;
    last_success: Date | null;
  } {
    const recentRequests = this.requestHistory.slice(-100);
    const successfulRequests = recentRequests.filter(req => req.success);
    const success_rate =
      recentRequests.length > 0
        ? successfulRequests.length / recentRequests.length
        : 0;

    const lastSuccess =
      successfulRequests.length > 0
        ? new Date(successfulRequests[successfulRequests.length - 1].timestamp)
        : null;

    return {
      healthy: this.isHealthy && this.consecutiveErrors < 5,
      consecutive_errors: this.consecutiveErrors,
      success_rate,
      last_success: lastSuccess,
    };
  }

  // Abstract methods to be implemented by specific connectors
  abstract connect(): Promise<boolean>;
  abstract fetchData(params: any): Promise<EnhancedApiResponse>;
  abstract validateConnection(): Promise<boolean>;
}

// Enhanced Instagram Connector
export class EnhancedInstagramConnector extends EnhancedApiConnector {
  private client: InstagramBusinessApiClient;
  private config: InstagramBusinessConfig;

  constructor(
    config: InstagramBusinessConfig,
    rateLimitConfig?: Partial<RateLimitConfig>
  ) {
    super({
      requests_per_minute: 50, // Instagram specific limits
      requests_per_hour: 800,
      requests_per_day: 4800,
      ...rateLimitConfig,
    });

    this.config = config;
    this.client = new InstagramBusinessApiClient(config);
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.getAccountInfo();
      this.isHealthy = true;
      return true;
    } catch (error) {
      logger.error("Instagram connection failed", { error: error.message });
      this.isHealthy = false;
      return false;
    }
  }

  async validateConnection(): Promise<boolean> {
    return await this.connect();
  }

  async fetchData(params: {
    type: "media" | "insights" | "account";
    limit?: number;
    since?: string;
    until?: string;
  }): Promise<EnhancedApiResponse> {
    return await this.executeWithRetry(async () => {
      const requestId = `ig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      let data: any;
      let qualityScore = 0;

      switch (params.type) {
        case "media":
          const mediaResponse = await this.client.getMedia(params);
          data = mediaResponse.data;
          qualityScore = this.assessMediaDataQuality(data);
          break;

        case "account":
          data = await this.client.getAccountInfo();
          qualityScore = this.assessAccountDataQuality(data);
          break;

        default:
          throw new Error(`Unsupported data type: ${params.type}`);
      }

      const qualityMetrics = this.assessDataQuality(
        data,
        this.getRequiredFields(params.type)
      );

      return {
        success: true,
        data,
        metadata: {
          source: "instagram_business_api",
          timestamp: new Date().toISOString(),
          request_id: requestId,
          quality_score: qualityMetrics.overall_quality,
          confidence_level:
            qualityMetrics.overall_quality > 0.8
              ? "high"
              : qualityMetrics.overall_quality > 0.6
                ? "medium"
                : "low",
        },
        errors: qualityMetrics.quality_issues
          .filter(issue => issue.severity === "critical")
          .map(issue => ({
            code: "QUALITY_ISSUE",
            message: issue.description,
            field: issue.field,
            severity: "error" as const,
          })),
        warnings: qualityMetrics.quality_issues
          .filter(issue => issue.severity !== "critical")
          .map(issue => issue.description),
      };
    }, "Instagram data fetch");
  }

  private assessMediaDataQuality(data: any[]): number {
    if (!Array.isArray(data) || data.length === 0) return 0;

    let qualitySum = 0;
    data.forEach(item => {
      const requiredFields = ["id", "mediaType", "timestamp"];
      const qualityMetrics = this.assessDataQuality(item, requiredFields);
      qualitySum += qualityMetrics.overall_quality;
    });

    return qualitySum / data.length;
  }

  private assessAccountDataQuality(data: any): number {
    const requiredFields = ["id", "username", "followersCount"];
    const qualityMetrics = this.assessDataQuality(data, requiredFields);
    return qualityMetrics.overall_quality;
  }

  private getRequiredFields(type: string): string[] {
    switch (type) {
      case "media":
        return ["id", "mediaType", "timestamp", "caption"];
      case "account":
        return ["id", "username", "followersCount"];
      default:
        return [];
    }
  }
}

// Enhanced LinkedIn Connector
export class EnhancedLinkedInConnector extends EnhancedApiConnector {
  private client: LinkedInApiClient;
  private config: LinkedInConfig;

  constructor(
    config: LinkedInConfig,
    rateLimitConfig?: Partial<RateLimitConfig>
  ) {
    super({
      requests_per_minute: 100, // LinkedIn specific limits
      requests_per_hour: 2000,
      requests_per_day: 10000,
      ...rateLimitConfig,
    });

    this.config = config;
    this.client = new LinkedInApiClient(config);
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.getProfile();
      this.isHealthy = true;
      return true;
    } catch (error) {
      logger.error("LinkedIn connection failed", { error: error.message });
      this.isHealthy = false;
      return false;
    }
  }

  async validateConnection(): Promise<boolean> {
    return await this.connect();
  }

  async fetchData(params: {
    type: "posts" | "profile" | "analytics";
    organizationId?: string;
    count?: number;
    start?: number;
  }): Promise<EnhancedApiResponse> {
    return await this.executeWithRetry(async () => {
      const requestId = `li_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      let data: any;

      switch (params.type) {
        case "posts":
          const postsResponse = await this.client.getCompanyPosts(
            params.organizationId,
            {
              count: params.count,
              start: params.start,
            }
          );
          data = postsResponse.elements;
          break;

        case "profile":
          data = await this.client.getProfile();
          break;

        default:
          throw new Error(`Unsupported data type: ${params.type}`);
      }

      const qualityMetrics = this.assessDataQuality(
        data,
        this.getRequiredFields(params.type)
      );

      return {
        success: true,
        data,
        metadata: {
          source: "linkedin_api",
          timestamp: new Date().toISOString(),
          request_id: requestId,
          quality_score: qualityMetrics.overall_quality,
          confidence_level:
            qualityMetrics.overall_quality > 0.8
              ? "high"
              : qualityMetrics.overall_quality > 0.6
                ? "medium"
                : "low",
        },
        errors: qualityMetrics.quality_issues
          .filter(issue => issue.severity === "critical")
          .map(issue => ({
            code: "QUALITY_ISSUE",
            message: issue.description,
            field: issue.field,
            severity: "error" as const,
          })),
        warnings: qualityMetrics.quality_issues
          .filter(issue => issue.severity !== "critical")
          .map(issue => issue.description),
      };
    }, "LinkedIn data fetch");
  }

  private getRequiredFields(type: string): string[] {
    switch (type) {
      case "posts":
        return ["id", "author", "publishedAt"];
      case "profile":
        return ["id", "firstName", "lastName"];
      default:
        return [];
    }
  }
}

// Enhanced Facebook Connector
export class EnhancedFacebookConnector extends EnhancedApiConnector {
  private client: FacebookGraphApiClient;
  private config: FacebookConfig;

  constructor(
    config: FacebookConfig,
    rateLimitConfig?: Partial<RateLimitConfig>
  ) {
    super({
      requests_per_minute: 200, // Facebook specific limits
      requests_per_hour: 4800,
      requests_per_day: 24000,
      ...rateLimitConfig,
    });

    this.config = config;
    this.client = new FacebookGraphApiClient(config);
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.getPageInfo();
      this.isHealthy = true;
      return true;
    } catch (error) {
      logger.error("Facebook connection failed", { error: error.message });
      this.isHealthy = false;
      return false;
    }
  }

  async validateConnection(): Promise<boolean> {
    return await this.connect();
  }

  async fetchData(params: {
    type: "posts" | "page" | "insights";
    limit?: number;
    since?: string;
    until?: string;
  }): Promise<EnhancedApiResponse> {
    return await this.executeWithRetry(async () => {
      const requestId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      let data: any;

      switch (params.type) {
        case "posts":
          const postsResponse = await this.client.getPosts(params);
          data = postsResponse.data;
          break;

        case "page":
          data = await this.client.getPageInfo();
          break;

        default:
          throw new Error(`Unsupported data type: ${params.type}`);
      }

      const qualityMetrics = this.assessDataQuality(
        data,
        this.getRequiredFields(params.type)
      );

      return {
        success: true,
        data,
        metadata: {
          source: "facebook_graph_api",
          timestamp: new Date().toISOString(),
          request_id: requestId,
          quality_score: qualityMetrics.overall_quality,
          confidence_level:
            qualityMetrics.overall_quality > 0.8
              ? "high"
              : qualityMetrics.overall_quality > 0.6
                ? "medium"
                : "low",
        },
        errors: qualityMetrics.quality_issues
          .filter(issue => issue.severity === "critical")
          .map(issue => ({
            code: "QUALITY_ISSUE",
            message: issue.description,
            field: issue.field,
            severity: "error" as const,
          })),
        warnings: qualityMetrics.quality_issues
          .filter(issue => issue.severity !== "critical")
          .map(issue => issue.description),
      };
    }, "Facebook data fetch");
  }

  private getRequiredFields(type: string): string[] {
    switch (type) {
      case "posts":
        return ["id", "message", "created_time"];
      case "page":
        return ["id", "name", "fan_count"];
      default:
        return [];
    }
  }
}

// Connector Factory
export class EnhancedConnectorFactory {
  static createInstagramConnector(
    config: InstagramBusinessConfig,
    rateLimitConfig?: Partial<RateLimitConfig>
  ): EnhancedInstagramConnector {
    return new EnhancedInstagramConnector(config, rateLimitConfig);
  }

  static createLinkedInConnector(
    config: LinkedInConfig,
    rateLimitConfig?: Partial<RateLimitConfig>
  ): EnhancedLinkedInConnector {
    return new EnhancedLinkedInConnector(config, rateLimitConfig);
  }

  static createFacebookConnector(
    config: FacebookConfig,
    rateLimitConfig?: Partial<RateLimitConfig>
  ): EnhancedFacebookConnector {
    return new EnhancedFacebookConnector(config, rateLimitConfig);
  }
}

// Export Types
export type { EnhancedApiResponse, RateLimitConfig, DataQualityMetrics };
