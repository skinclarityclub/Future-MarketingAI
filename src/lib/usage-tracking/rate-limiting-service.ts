/**
 * Rate Limiting Service
 * Task 36.3: API Rate Limiting and control per tenant
 */

import { createBrowserClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

export interface RateLimitRule {
  id: string;
  rule_name: string;
  tenant_id?: string;
  billing_tier: string;
  endpoint_pattern: string;
  http_methods: string[];
  max_requests: number;
  time_window_seconds: number;
  burst_allowance: number;
  rate_limit_type: "fixed" | "sliding" | "token_bucket";
  priority_level: number;
  enable_queuing: boolean;
  queue_timeout_seconds: number;
  block_action: "reject" | "queue" | "throttle";
  retry_after_seconds: number;
  custom_error_message?: string;
  is_active: boolean;
}

export interface RateLimitCheck {
  allowed: boolean;
  current_count: number;
  max_requests: number;
  window_start: Date;
  window_end: Date;
  retry_after_seconds?: number;
  rule_applied?: RateLimitRule;
  identifier_key: string;
}

export interface RateLimitStatus {
  tenant_id: string;
  endpoint_path: string;
  current_limits: RateLimitCheck[];
  is_blocked: boolean;
  violations_today: number;
  remaining_quota: Record<string, number>;
}

export class RateLimitingService {
  private supabase;
  private memoryCache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Check if a request should be rate limited
   */
  async checkRateLimit(
    request: NextRequest,
    tenantId: string,
    userId?: string,
    billingTier: string = "free"
  ): Promise<RateLimitCheck> {
    try {
      const endpointPath = new URL(request.url).pathname;
      const method = request.method;
      const clientIp = this.getClientIp(request);

      // Find applicable rate limiting rules
      const applicableRules = await this.getApplicableRules(
        endpointPath,
        method,
        billingTier,
        tenantId
      );

      if (applicableRules.length === 0) {
        // No rules apply, allow the request
        return {
          allowed: true,
          current_count: 0,
          max_requests: -1,
          window_start: new Date(),
          window_end: new Date(),
          identifier_key: this.generateIdentifierKey(
            tenantId,
            userId,
            clientIp,
            endpointPath
          ),
        };
      }

      // Apply the highest priority rule (lowest priority_level number)
      const rule = applicableRules.sort(
        (a, b) => a.priority_level - b.priority_level
      )[0];

      // Generate identifier key
      const identifierKey = this.generateIdentifierKey(
        tenantId,
        userId,
        clientIp,
        endpointPath,
        rule.id
      );

      // Check current rate limit status
      const rateLimitStatus = await this.getCurrentRateLimitStatus(
        rule,
        identifierKey,
        tenantId,
        userId,
        clientIp
      );

      if (!rateLimitStatus.allowed) {
        // Log the violation
        await this.logRateLimitViolation(
          rule,
          identifierKey,
          tenantId,
          endpointPath,
          method
        );
      }

      return {
        ...rateLimitStatus,
        rule_applied: rule,
        identifier_key: identifierKey,
      };
    } catch (error) {
      console.error("Rate limit check error:", error);
      // On error, allow the request to avoid blocking legitimate traffic
      return {
        allowed: true,
        current_count: 0,
        max_requests: -1,
        window_start: new Date(),
        window_end: new Date(),
        identifier_key: "error",
      };
    }
  }

  /**
   * Get applicable rate limiting rules for an endpoint
   */
  private async getApplicableRules(
    endpointPath: string,
    method: string,
    billingTier: string,
    tenantId?: string
  ): Promise<RateLimitRule[]> {
    const cacheKey = `rules_${billingTier}_${endpointPath}_${method}`;
    const cached = this.memoryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      let query = this.supabase
        .from("api_rate_limiting_rules")
        .select("*")
        .eq("is_active", true)
        .or(`billing_tier.eq.${billingTier},billing_tier.is.null`)
        .order("priority_level", { ascending: true });

      // Add tenant-specific rules if tenant ID is provided
      if (tenantId) {
        query = query.or(`tenant_id.is.null,tenant_id.eq.${tenantId}`);
      } else {
        query = query.is("tenant_id", null);
      }

      const { data: rules, error } = await query;

      if (error) {
        // Check if error is due to missing table
        if (
          error.message?.includes(
            'relation "public.api_rate_limiting_rules" does not exist'
          )
        ) {
          console.warn(
            "Rate limiting tables not set up yet, allowing all requests"
          );
          return [];
        }
        console.error("Rules fetch error:", error);
        return [];
      }

      // Filter rules that match the endpoint pattern and HTTP method
      const applicableRules = (rules || []).filter(rule => {
        // Check endpoint pattern match
        const pattern = new RegExp(rule.endpoint_pattern);
        const endpointMatches = pattern.test(endpointPath);

        // Check HTTP method match
        const methodMatches =
          !rule.http_methods ||
          rule.http_methods.length === 0 ||
          rule.http_methods.includes(method);

        return endpointMatches && methodMatches;
      });

      // Cache the results
      this.memoryCache.set(cacheKey, {
        data: applicableRules,
        timestamp: Date.now(),
      });

      return applicableRules;
    } catch (error) {
      console.error("Error getting applicable rules:", error);
      return [];
    }
  }

  /**
   * Get current rate limit status for a specific rule and identifier
   */
  private async getCurrentRateLimitStatus(
    rule: RateLimitRule,
    identifierKey: string,
    tenantId: string,
    userId?: string,
    clientIp?: string
  ): Promise<RateLimitCheck> {
    try {
      const now = new Date();
      let windowStart: Date;
      let windowEnd: Date;

      // Calculate window based on rate limit type
      if (rule.rate_limit_type === "sliding") {
        windowStart = new Date(now.getTime() - rule.time_window_seconds * 1000);
        windowEnd = now;
      } else {
        // Fixed window
        const windowStartMs =
          Math.floor(now.getTime() / (rule.time_window_seconds * 1000)) *
          (rule.time_window_seconds * 1000);
        windowStart = new Date(windowStartMs);
        windowEnd = new Date(windowStartMs + rule.time_window_seconds * 1000);
      }

      // Get or create rate limit tracking record
      const { data: tracking, error } = await this.supabase
        .from("rate_limit_tracking")
        .select("*")
        .eq("identifier_key", identifierKey)
        .eq("rule_id", rule.id)
        .gte("window_end", now.toISOString())
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Rate limit tracking fetch error:", error);
        return this.createDefaultAllowedResponse(windowStart, windowEnd);
      }

      // If no existing tracking or window expired, create new one
      if (!tracking || new Date(tracking.window_end) <= now) {
        const { error: insertError } = await this.supabase
          .from("rate_limit_tracking")
          .insert({
            rule_id: rule.id,
            tenant_id: tenantId,
            user_id: userId,
            client_ip: clientIp,
            identifier_key: identifierKey,
            current_count: 1,
            window_start: windowStart.toISOString(),
            window_end: windowEnd.toISOString(),
            endpoint_path: identifierKey.split("|")[3], // Extract endpoint from identifier
          })
          .select()
          .single();

        if (insertError) {
          console.error("Rate limit tracking insert error:", insertError);
          return this.createDefaultAllowedResponse(windowStart, windowEnd);
        }

        return {
          allowed: true,
          current_count: 1,
          max_requests: rule.max_requests,
          window_start: windowStart,
          window_end: windowEnd,
          identifier_key: identifierKey,
        };
      }

      // Check if current count would exceed limit
      const newCount = tracking.current_count + 1;
      const effectiveLimit = rule.max_requests + (rule.burst_allowance || 0);
      const allowed = newCount <= effectiveLimit;

      if (allowed) {
        // Increment counter
        await this.supabase
          .from("rate_limit_tracking")
          .update({
            current_count: newCount,
            last_request_at: now.toISOString(),
          })
          .eq("id", tracking.id);
      } else {
        // Mark as blocked
        await this.supabase
          .from("rate_limit_tracking")
          .update({
            is_blocked: true,
            blocked_until: new Date(
              now.getTime() + rule.retry_after_seconds * 1000
            ).toISOString(),
            violation_count: (tracking.violation_count || 0) + 1,
          })
          .eq("id", tracking.id);
      }

      return {
        allowed,
        current_count: allowed ? newCount : tracking.current_count,
        max_requests: rule.max_requests,
        window_start: new Date(tracking.window_start),
        window_end: new Date(tracking.window_end),
        retry_after_seconds: allowed ? undefined : rule.retry_after_seconds,
        identifier_key: identifierKey,
      };
    } catch (error) {
      console.error("Rate limit status check error:", error);
      return this.createDefaultAllowedResponse(new Date(), new Date());
    }
  }

  /**
   * Log rate limit violation for monitoring
   */
  private async logRateLimitViolation(
    rule: RateLimitRule,
    identifierKey: string,
    tenantId: string,
    endpointPath: string,
    method: string
  ): Promise<void> {
    try {
      // This could be extended to log to external monitoring services
      console.warn(
        `Rate limit violation: ${rule.rule_name} for ${identifierKey}`,
        {
          rule_id: rule.id,
          tenant_id: tenantId,
          endpoint: endpointPath,
          method: method,
          limit: rule.max_requests,
          window: rule.time_window_seconds,
        }
      );

      // Could also implement webhook notifications, Slack alerts, etc.
    } catch (error) {
      console.error("Error logging rate limit violation:", error);
    }
  }

  /**
   * Generate a unique identifier key for rate limiting
   */
  private generateIdentifierKey(
    tenantId: string,
    userId?: string,
    clientIp?: string,
    endpointPath?: string,
    ruleId?: string
  ): string {
    // Create composite key: tenant|user|ip|endpoint|rule
    const parts = [
      tenantId || "anonymous",
      userId || "guest",
      clientIp || "unknown",
      endpointPath || "unknown",
      ruleId || "default",
    ];

    return parts.join("|");
  }

  /**
   * Get client IP address from request
   */
  private getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const remoteAddr = request.headers.get("x-remote-addr");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    return realIp || remoteAddr || "unknown";
  }

  /**
   * Create default allowed response
   */
  private createDefaultAllowedResponse(
    windowStart: Date,
    windowEnd: Date,
    identifierKey: string = "default"
  ): RateLimitCheck {
    return {
      allowed: true,
      current_count: 0,
      max_requests: -1,
      window_start: windowStart,
      window_end: windowEnd,
      identifier_key: identifierKey,
    };
  }

  /**
   * Get rate limit status for a tenant
   */
  async getTenantRateLimitStatus(tenantId: string): Promise<RateLimitStatus[]> {
    try {
      const { data: tracking, error } = await this.supabase
        .from("rate_limit_tracking")
        .select(
          `
          *,
          api_rate_limiting_rules (*)
        `
        )
        .eq("tenant_id", tenantId)
        .gte("window_end", new Date().toISOString())
        .order("last_request_at", { ascending: false });

      if (error) {
        console.error("Rate limit status fetch error:", error);
        return [];
      }

      // Group by endpoint
      const statusByEndpoint = new Map<string, RateLimitStatus>();

      for (const track of tracking || []) {
        const endpoint = track.endpoint_path;

        if (!statusByEndpoint.has(endpoint)) {
          statusByEndpoint.set(endpoint, {
            tenant_id: tenantId,
            endpoint_path: endpoint,
            current_limits: [],
            is_blocked: false,
            violations_today: 0,
            remaining_quota: {},
          });
        }

        const status = statusByEndpoint.get(endpoint)!;

        status.current_limits.push({
          allowed: !track.is_blocked,
          current_count: track.current_count,
          max_requests: track.api_rate_limiting_rules?.max_requests || -1,
          window_start: new Date(track.window_start),
          window_end: new Date(track.window_end),
          identifier_key: track.identifier_key,
          retry_after_seconds: track.is_blocked
            ? Math.ceil(
                (new Date(track.blocked_until).getTime() - Date.now()) / 1000
              )
            : undefined,
        });

        if (track.is_blocked) {
          status.is_blocked = true;
        }

        status.violations_today += track.violation_count || 0;

        if (track.api_rate_limiting_rules) {
          const remaining = Math.max(
            0,
            track.api_rate_limiting_rules.max_requests - track.current_count
          );
          status.remaining_quota[track.api_rate_limiting_rules.rule_name] =
            remaining;
        }
      }

      return Array.from(statusByEndpoint.values());
    } catch (error) {
      console.error("Tenant rate limit status error:", error);
      return [];
    }
  }

  /**
   * Create or update rate limiting rules
   */
  async createRateLimitRule(
    rule: Omit<RateLimitRule, "id">
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("api_rate_limiting_rules")
        .insert(rule)
        .select("id")
        .single();

      if (error) {
        console.error("Rate limit rule creation error:", error);
        return null;
      }

      // Clear cache since rules have changed
      this.clearRulesCache();

      return data.id;
    } catch (error) {
      console.error("Create rate limit rule error:", error);
      return null;
    }
  }

  /**
   * Update existing rate limiting rule
   */
  async updateRateLimitRule(
    ruleId: string,
    updates: Partial<RateLimitRule>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("api_rate_limiting_rules")
        .update(updates)
        .eq("id", ruleId);

      if (error) {
        console.error("Rate limit rule update error:", error);
        return false;
      }

      // Clear cache since rules have changed
      this.clearRulesCache();

      return true;
    } catch (error) {
      console.error("Update rate limit rule error:", error);
      return false;
    }
  }

  /**
   * Clear rules cache
   */
  private clearRulesCache(): void {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith("rules_")) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Reset rate limits for a tenant (emergency use)
   */
  async resetTenantRateLimits(tenantId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("rate_limit_tracking")
        .delete()
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("Rate limit reset error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Reset tenant rate limits error:", error);
      return false;
    }
  }
}
