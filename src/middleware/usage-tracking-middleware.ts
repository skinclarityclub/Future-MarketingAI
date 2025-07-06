/**
 * Usage Tracking and Rate Limiting Middleware
 * Task 36.3: Automatic tracking and rate limiting for all API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { UsageTrackingService } from "@/lib/usage-tracking/usage-tracking-service";
import { RateLimitingService } from "@/lib/usage-tracking/rate-limiting-service";

export interface MiddlewareConfig {
  enableUsageTracking: boolean;
  enableRateLimiting: boolean;
  trackingOptions?: {
    trackApiCalls: boolean;
    trackAiTokens: boolean;
    trackContentGeneration: boolean;
    trackStorage: boolean;
    trackBandwidth: boolean;
  };
  rateLimitOptions?: {
    enableTenantLimits: boolean;
    enableGlobalLimits: boolean;
    defaultBillingTier: string;
  };
  excludePatterns?: string[]; // Regex patterns to exclude from tracking/limiting
}

export interface RequestContext {
  tenantId?: string;
  userId?: string;
  billingTier?: string;
  requestStart: number;
  endpointPath: string;
  method: string;
}

const defaultConfig: MiddlewareConfig = {
  enableUsageTracking: true,
  enableRateLimiting: true,
  trackingOptions: {
    trackApiCalls: true,
    trackAiTokens: true,
    trackContentGeneration: true,
    trackStorage: true,
    trackBandwidth: true,
  },
  rateLimitOptions: {
    enableTenantLimits: true,
    enableGlobalLimits: true,
    defaultBillingTier: "free",
  },
  excludePatterns: [
    "^/api/health.*",
    "^/_next/.*",
    "^/favicon.ico",
    "^/api/debug.*",
  ],
};

export class UsageTrackingMiddleware {
  private usageService: UsageTrackingService;
  private rateLimitService: RateLimitingService;
  private config: MiddlewareConfig;

  constructor(config: Partial<MiddlewareConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.usageService = new UsageTrackingService();
    this.rateLimitService = new RateLimitingService();
  }

  /**
   * Main middleware function to be used in API routes
   */
  async handleRequest(
    request: NextRequest,
    context: Partial<RequestContext> = {}
  ): Promise<NextResponse | null> {
    const requestContext: RequestContext = {
      requestStart: Date.now(),
      endpointPath: new URL(request.url).pathname,
      method: request.method,
      tenantId: context.tenantId || this.extractTenantId(request),
      userId: context.userId || this.extractUserId(request),
      billingTier:
        context.billingTier ||
        this.config.rateLimitOptions?.defaultBillingTier ||
        "free",
    };

    // Check if this endpoint should be excluded
    if (this.shouldExclude(requestContext.endpointPath)) {
      return null; // Continue without tracking/limiting
    }

    try {
      // 1. Rate Limiting Check (before processing)
      if (this.config.enableRateLimiting) {
        const rateLimitResult = await this.checkRateLimit(
          request,
          requestContext
        );
        if (rateLimitResult) {
          return rateLimitResult; // Return rate limit response
        }
      }

      // 2. Pre-request quota check
      if (this.config.enableUsageTracking && requestContext.tenantId) {
        const quotaCheck = await this.checkQuotas(requestContext);
        if (quotaCheck) {
          return quotaCheck; // Return quota exceeded response
        }
      }

      // Continue to the actual API handler
      return null;
    } catch (error) {
      console.error("Usage tracking middleware error:", error);
      // On error, allow the request to continue
      return null;
    }
  }

  /**
   * Post-request tracking (call this after API processing)
   */
  async trackResponse(
    request: NextRequest,
    response: NextResponse,
    context: Partial<RequestContext> = {},
    additionalMetrics?: {
      aiTokensUsed?: number;
      contentGenerated?: number;
      storageUsed?: number;
      bandwidthUsed?: number;
    }
  ): Promise<void> {
    if (!this.config.enableUsageTracking) {
      return;
    }

    const requestContext: RequestContext = {
      requestStart: context.requestStart || Date.now(),
      endpointPath: new URL(request.url).pathname,
      method: request.method,
      tenantId: context.tenantId || this.extractTenantId(request),
      userId: context.userId || this.extractUserId(request),
      billingTier: context.billingTier || "free",
    };

    // Skip tracking if no tenant ID or excluded endpoint
    if (
      !requestContext.tenantId ||
      this.shouldExclude(requestContext.endpointPath)
    ) {
      return;
    }

    const processingTime = Date.now() - requestContext.requestStart;
    const statusCode = response.status;

    try {
      // Track API call
      if (this.config.trackingOptions?.trackApiCalls) {
        await this.usageService.trackApiCall(
          requestContext.tenantId,
          requestContext.endpointPath,
          requestContext.method,
          statusCode,
          processingTime,
          requestContext.billingTier
        );
      }

      // Track additional metrics if provided
      if (additionalMetrics) {
        if (
          additionalMetrics.aiTokensUsed &&
          this.config.trackingOptions?.trackAiTokens
        ) {
          await this.usageService.trackAiTokens(
            requestContext.tenantId,
            additionalMetrics.aiTokensUsed,
            "gpt-4", // This should be dynamic based on actual model used
            "api_call",
            0.002, // Cost per token
            requestContext.billingTier
          );
        }

        if (
          additionalMetrics.contentGenerated &&
          this.config.trackingOptions?.trackContentGeneration
        ) {
          await this.usageService.trackContentGeneration(
            requestContext.tenantId,
            "api_generated",
            additionalMetrics.contentGenerated,
            0.5,
            requestContext.billingTier
          );
        }

        if (
          additionalMetrics.storageUsed &&
          this.config.trackingOptions?.trackStorage
        ) {
          await this.usageService.trackStorageUsage(
            requestContext.tenantId,
            additionalMetrics.storageUsed,
            "api_storage",
            requestContext.billingTier
          );
        }

        if (
          additionalMetrics.bandwidthUsed &&
          this.config.trackingOptions?.trackBandwidth
        ) {
          await this.usageService.trackUsage({
            tenant_id: requestContext.tenantId,
            resource_type: "bandwidth",
            resource_category: "api_bandwidth",
            quantity_used: additionalMetrics.bandwidthUsed,
            unit_type: "mb",
            endpoint_path: requestContext.endpointPath,
            request_method: requestContext.method,
            response_status: statusCode,
            processing_time_ms: processingTime,
            billing_tier: requestContext.billingTier,
          });
        }
      }
    } catch (error) {
      console.error("Post-request tracking error:", error);
      // Don't throw error to avoid affecting the API response
    }
  }

  /**
   * Check rate limits for the request
   */
  private async checkRateLimit(
    request: NextRequest,
    context: RequestContext
  ): Promise<NextResponse | null> {
    try {
      if (!context.tenantId) {
        return null; // Skip rate limiting for requests without tenant ID
      }

      const rateLimitCheck = await this.rateLimitService.checkRateLimit(
        request,
        context.tenantId,
        context.userId,
        context.billingTier
      );

      if (!rateLimitCheck.allowed) {
        const headers = new Headers({
          "X-RateLimit-Limit": rateLimitCheck.max_requests.toString(),
          "X-RateLimit-Remaining": Math.max(
            0,
            rateLimitCheck.max_requests - rateLimitCheck.current_count
          ).toString(),
          "X-RateLimit-Reset": rateLimitCheck.window_end.toISOString(),
          "Content-Type": "application/json",
        });

        if (rateLimitCheck.retry_after_seconds) {
          headers.set(
            "Retry-After",
            rateLimitCheck.retry_after_seconds.toString()
          );
        }

        const errorMessage =
          rateLimitCheck.rule_applied?.custom_error_message ||
          "Rate limit exceeded. Please try again later.";

        return new NextResponse(
          JSON.stringify({
            error: "Rate limit exceeded",
            message: errorMessage,
            retry_after_seconds: rateLimitCheck.retry_after_seconds,
            current_usage: rateLimitCheck.current_count,
            limit: rateLimitCheck.max_requests,
            window_reset: rateLimitCheck.window_end.toISOString(),
          }),
          {
            status: 429,
            headers,
          }
        );
      }

      return null; // Rate limit passed
    } catch (error) {
      console.error("Rate limit check error:", error);
      return null; // Allow request on error
    }
  }

  /**
   * Check quota limits before processing
   */
  private async checkQuotas(
    context: RequestContext
  ): Promise<NextResponse | null> {
    try {
      if (!context.tenantId) {
        return null;
      }

      // Check API calls quota
      const apiQuotaCheck = await this.usageService.canPerformAction(
        context.tenantId,
        "api_calls",
        1,
        context.billingTier
      );

      if (!apiQuotaCheck.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: "Quota exceeded",
            message:
              apiQuotaCheck.reason ||
              "API calls quota exceeded for this billing period.",
            quota_status: apiQuotaCheck.quota_status,
            upgrade_url: "/upgrade", // Link to upgrade billing tier
          }),
          {
            status: 402, // Payment Required
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      return null; // Quota check passed
    } catch (error) {
      console.error("Quota check error:", error);
      return null; // Allow request on error
    }
  }

  /**
   * Extract tenant ID from request (various methods)
   */
  private extractTenantId(request: NextRequest): string | undefined {
    // Try multiple sources for tenant ID

    // 1. From authorization header (JWT token)
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      try {
        // This would need actual JWT parsing
        const token = authHeader.replace("Bearer ", "");
        // const decoded = jwt.decode(token);
        // return decoded?.tenant_id;
      } catch (error) {
        // JWT parsing failed
      }
    }

    // 2. From custom tenant header
    const tenantHeader = request.headers.get("x-tenant-id");
    if (tenantHeader) {
      return tenantHeader;
    }

    // 3. From query parameter
    const url = new URL(request.url);
    const tenantParam = url.searchParams.get("tenant_id");
    if (tenantParam) {
      return tenantParam;
    }

    // 4. From subdomain (if using subdomain-based tenancy)
    const hostname = url.hostname;
    const subdomainMatch = hostname.match(/^([^.]+)\./);
    if (
      subdomainMatch &&
      subdomainMatch[1] !== "www" &&
      subdomainMatch[1] !== "api"
    ) {
      return subdomainMatch[1];
    }

    return undefined;
  }

  /**
   * Extract user ID from request
   */
  private extractUserId(request: NextRequest): string | undefined {
    // Similar to tenant ID extraction
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      try {
        // JWT parsing would go here
        // return decoded?.user_id;
      } catch (error) {
        // JWT parsing failed
      }
    }

    const userHeader = request.headers.get("x-user-id");
    if (userHeader) {
      return userHeader;
    }

    return undefined;
  }

  /**
   * Check if endpoint should be excluded from tracking/limiting
   */
  private shouldExclude(endpointPath: string): boolean {
    if (!this.config.excludePatterns) {
      return false;
    }

    return this.config.excludePatterns.some(pattern => {
      const regex = new RegExp(pattern);
      return regex.test(endpointPath);
    });
  }

  /**
   * Create middleware instance with default config
   */
  static create(
    config: Partial<MiddlewareConfig> = {}
  ): UsageTrackingMiddleware {
    return new UsageTrackingMiddleware(config);
  }

  /**
   * Helper to wrap an API handler with automatic tracking
   */
  static withTracking(
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
    config: Partial<MiddlewareConfig> = {}
  ) {
    const middleware = UsageTrackingMiddleware.create(config);

    return async (req: NextRequest, context?: any): Promise<NextResponse> => {
      const requestStart = Date.now();

      // Pre-request checks
      const preCheckResult = await middleware.handleRequest(req, {
        requestStart,
      });
      if (preCheckResult) {
        return preCheckResult; // Rate limited or quota exceeded
      }

      // Call the original handler
      const response = await handler(req, context);

      // Post-request tracking
      await middleware.trackResponse(req, response, { requestStart });

      return response;
    };
  }
}

// Export a default instance for easy use
export const usageTrackingMiddleware = UsageTrackingMiddleware.create();

// Export helper functions for manual usage
export async function trackApiCall(
  req: NextRequest,
  res: NextResponse,
  tenantId: string,
  additionalMetrics?: {
    aiTokensUsed?: number;
    contentGenerated?: number;
    storageUsed?: number;
    bandwidthUsed?: number;
  }
): Promise<void> {
  await usageTrackingMiddleware.trackResponse(
    req,
    res,
    { tenantId },
    additionalMetrics
  );
}

export async function checkRateLimit(
  req: NextRequest,
  tenantId: string,
  userId?: string,
  billingTier: string = "free"
): Promise<NextResponse | null> {
  return await usageTrackingMiddleware.handleRequest(req, {
    tenantId,
    userId,
    billingTier,
  });
}
