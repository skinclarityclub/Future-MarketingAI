/**
 * Usage Tracking Service
 * Task 36.3: Monitor and control resource consumption per tenant
 */

import { createBrowserClient } from "@supabase/ssr";

export interface UsageMetrics {
  tenant_id: string;
  resource_type:
    | "api_calls"
    | "storage"
    | "bandwidth"
    | "ai_tokens"
    | "content_generations";
  resource_category?: string;
  quantity_used: number;
  unit_type: "requests" | "mb" | "tokens" | "generations" | "executions";
  endpoint_path?: string;
  request_method?: string;
  response_status?: number;
  processing_time_ms?: number;
  cost_per_unit?: number;
  billing_tier?: string;
}

export interface UsageQuotaStatus {
  current_usage: number;
  quota_limit: number;
  usage_percentage: number;
  quota_exceeded: boolean;
  approaching_limit: boolean;
  remaining_quota: number;
}

export interface TenantUsageOverview {
  tenant_id: string;
  billing_period_start: string;
  billing_period_end: string;
  api_calls: UsageQuotaStatus;
  storage: UsageQuotaStatus;
  bandwidth: UsageQuotaStatus;
  ai_tokens: UsageQuotaStatus;
  content_generations: UsageQuotaStatus;
  current_bill_amount: number;
  overage_charges: number;
  quota_exceeded: boolean;
  is_suspended: boolean;
}

export class UsageTrackingService {
  private supabase;

  constructor() {
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Track resource usage for a tenant
   */
  async trackUsage(metrics: UsageMetrics): Promise<void> {
    try {
      const now = new Date();
      const periodStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours()
      );
      const periodEnd = new Date(periodStart.getTime() + 60 * 60 * 1000); // 1 hour window

      // Insert usage tracking record
      const { error: trackingError } = await this.supabase
        .from("tenant_usage_tracking")
        .insert({
          tenant_id: metrics.tenant_id,
          resource_type: metrics.resource_type,
          resource_category: metrics.resource_category,
          quantity_used: Math.round(metrics.quantity_used), // Convert to integer for BIGINT compatibility
          unit_type: metrics.unit_type,
          usage_period: "hourly",
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          endpoint_path: metrics.endpoint_path,
          request_method: metrics.request_method,
          response_status: metrics.response_status,
          processing_time_ms: metrics.processing_time_ms,
          cost_per_unit: metrics.cost_per_unit,
          total_cost: metrics.cost_per_unit
            ? metrics.quantity_used * metrics.cost_per_unit
            : null,
          billing_tier: metrics.billing_tier || "free",
        });

      if (trackingError) {
        console.error("Usage tracking error:", trackingError);
        return;
      }

      // Update current usage totals using the database function
      // Convert to integer for BIGINT compatibility
      const { error: updateError } = await this.supabase.rpc(
        "update_tenant_current_usage",
        {
          p_tenant_id: metrics.tenant_id,
          p_resource_type: metrics.resource_type,
          p_quantity: Math.round(metrics.quantity_used), // Convert to integer
          p_billing_tier: metrics.billing_tier || "free",
        }
      );

      if (updateError) {
        console.error("Current usage update error:", updateError);
      }
    } catch (error) {
      console.error("Usage tracking service error:", error);
    }
  }

  /**
   * Check quota status for a specific resource
   */
  async checkQuotaStatus(
    tenantId: string,
    resourceType: string,
    billingTier: string = "free"
  ): Promise<UsageQuotaStatus | null> {
    try {
      const { data, error } = await this.supabase.rpc("check_quota_limit", {
        p_tenant_id: tenantId,
        p_resource_type: resourceType,
        p_billing_tier: billingTier,
      });

      if (error) {
        // Check if error is due to missing function
        if (error.message?.includes("function public.check_quota_limit")) {
          console.warn(
            "Usage tracking database functions not set up yet, allowing all actions"
          );
          return {
            current_usage: 0,
            quota_limit: -1,
            usage_percentage: 0,
            quota_exceeded: false,
            approaching_limit: false,
            remaining_quota: -1,
          };
        }
        console.error("Quota check error:", error);
        return null;
      }

      const result = data as any;
      return {
        current_usage: result.current_usage,
        quota_limit: result.quota_limit,
        usage_percentage: result.usage_percentage,
        quota_exceeded: result.quota_exceeded,
        approaching_limit: result.approaching_limit,
        remaining_quota: Math.max(0, result.quota_limit - result.current_usage),
      };
    } catch (error) {
      console.error("Quota status check error:", error);
      return null;
    }
  }

  /**
   * Get comprehensive usage overview for a tenant
   */
  async getTenantUsageOverview(
    tenantId: string
  ): Promise<TenantUsageOverview | null> {
    try {
      const { data: currentUsage, error } = await this.supabase
        .from("tenant_current_usage")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq(
          "billing_period_start",
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ).toISOString()
        )
        .single();

      if (error || !currentUsage) {
        console.error("Usage overview error:", error);
        return null;
      }

      // Get billing tier for the tenant (you might need to implement this)
      const billingTier = "free"; // This should come from tenant configuration

      // Check quotas for each resource type
      const resourceTypes = [
        "api_calls",
        "storage",
        "bandwidth",
        "ai_tokens",
        "content_generations",
      ];
      const quotaStatuses: Record<string, UsageQuotaStatus> = {};

      for (const resourceType of resourceTypes) {
        const status = await this.checkQuotaStatus(
          tenantId,
          resourceType,
          billingTier
        );
        if (status) {
          quotaStatuses[resourceType] = status;
        }
      }

      return {
        tenant_id: tenantId,
        billing_period_start: currentUsage.billing_period_start,
        billing_period_end: currentUsage.billing_period_end,
        api_calls: quotaStatuses.api_calls,
        storage: quotaStatuses.storage,
        bandwidth: quotaStatuses.bandwidth,
        ai_tokens: quotaStatuses.ai_tokens,
        content_generations: quotaStatuses.content_generations,
        current_bill_amount: currentUsage.current_bill_amount,
        overage_charges: currentUsage.overage_charges,
        quota_exceeded: currentUsage.quota_exceeded,
        is_suspended: currentUsage.is_suspended,
      };
    } catch (error) {
      console.error("Tenant usage overview error:", error);
      return null;
    }
  }

  /**
   * Get usage analytics summaries
   */
  async getUsageAnalytics(
    tenantId: string,
    resourceType?: string,
    summaryPeriod: "hourly" | "daily" | "weekly" | "monthly" = "daily",
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      let query = this.supabase
        .from("usage_analytics_summaries")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("summary_period", summaryPeriod)
        .order("period_start", { ascending: false });

      if (resourceType) {
        query = query.eq("resource_type", resourceType);
      }

      if (startDate) {
        query = query.gte("period_start", startDate.toISOString());
      }

      if (endDate) {
        query = query.lte("period_start", endDate.toISOString());
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error("Usage analytics error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Usage analytics service error:", error);
      return [];
    }
  }

  /**
   * Track API call with automatic metrics
   */
  async trackApiCall(
    tenantId: string,
    endpointPath: string,
    method: string,
    statusCode: number,
    processingTime: number,
    billingTier: string = "free"
  ): Promise<void> {
    await this.trackUsage({
      tenant_id: tenantId,
      resource_type: "api_calls",
      resource_category: "api",
      quantity_used: 1,
      unit_type: "requests",
      endpoint_path: endpointPath,
      request_method: method,
      response_status: statusCode,
      processing_time_ms: processingTime,
      billing_tier: billingTier,
    });
  }

  /**
   * Track AI token usage
   */
  async trackAiTokens(
    tenantId: string,
    tokenCount: number,
    model: string,
    operation: string,
    costPerToken: number = 0.002,
    billingTier: string = "free"
  ): Promise<void> {
    await this.trackUsage({
      tenant_id: tenantId,
      resource_type: "ai_tokens",
      resource_category: `ai_${model}`,
      quantity_used: tokenCount,
      unit_type: "tokens",
      endpoint_path: `/api/ai/${operation}`,
      cost_per_unit: costPerToken,
      billing_tier: billingTier,
    });
  }

  /**
   * Track content generation
   */
  async trackContentGeneration(
    tenantId: string,
    contentType: string,
    generationCount: number = 1,
    costPerGeneration: number = 0.5,
    billingTier: string = "free"
  ): Promise<void> {
    await this.trackUsage({
      tenant_id: tenantId,
      resource_type: "content_generations",
      resource_category: `content_${contentType}`,
      quantity_used: generationCount,
      unit_type: "generations",
      endpoint_path: "/api/content/generate",
      cost_per_unit: costPerGeneration,
      billing_tier: billingTier,
    });
  }

  /**
   * Track storage usage
   */
  async trackStorageUsage(
    tenantId: string,
    sizeMb: number,
    storageType: string,
    billingTier: string = "free"
  ): Promise<void> {
    await this.trackUsage({
      tenant_id: tenantId,
      resource_type: "storage",
      resource_category: `storage_${storageType}`,
      quantity_used: sizeMb,
      unit_type: "mb",
      billing_tier: billingTier,
    });
  }

  /**
   * Check if tenant can perform an action based on quotas
   */
  async canPerformAction(
    tenantId: string,
    resourceType: string,
    requestedQuantity: number = 1,
    billingTier: string = "free"
  ): Promise<{
    allowed: boolean;
    reason?: string;
    quota_status?: UsageQuotaStatus;
  }> {
    try {
      const quotaStatus = await this.checkQuotaStatus(
        tenantId,
        resourceType,
        billingTier
      );

      if (!quotaStatus) {
        return { allowed: true }; // If we can't check, allow by default
      }

      // Check if quota is unlimited
      if (quotaStatus.quota_limit === -1) {
        return { allowed: true, quota_status: quotaStatus };
      }

      // Check if adding the requested quantity would exceed the quota
      const wouldExceed =
        quotaStatus.current_usage + requestedQuantity > quotaStatus.quota_limit;

      if (wouldExceed) {
        return {
          allowed: false,
          reason: `Quota exceeded. Current usage: ${quotaStatus.current_usage}/${quotaStatus.quota_limit}`,
          quota_status: quotaStatus,
        };
      }

      return { allowed: true, quota_status: quotaStatus };
    } catch (error) {
      console.error("Action permission check error:", error);
      return { allowed: true }; // Allow by default on error
    }
  }

  /**
   * Get usage trends and predictions
   */
  async getUsageTrends(
    tenantId: string,
    resourceType: string,
    days: number = 30
  ) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await this.getUsageAnalytics(
        tenantId,
        resourceType,
        "daily",
        startDate
      );

      // Calculate trends
      const usageByDay = analytics.map(item => ({
        date: item.period_start,
        usage: item.total_usage,
        cost: item.total_cost,
      }));

      // Simple trend calculation (could be enhanced with ML)
      const recentDays = usageByDay.slice(0, 7);
      const olderDays = usageByDay.slice(7, 14);

      const recentAverage =
        recentDays.length > 0
          ? recentDays.reduce((sum, day) => sum + day.usage, 0) /
            recentDays.length
          : 0;
      const olderAverage =
        olderDays.length > 0
          ? olderDays.reduce((sum, day) => sum + day.usage, 0) /
            olderDays.length
          : 0;

      const trendDirection =
        recentAverage > olderAverage ? "increasing" : "decreasing";
      const trendPercentage =
        olderAverage > 0
          ? ((recentAverage - olderAverage) / olderAverage) * 100
          : 0;

      return {
        usage_by_day: usageByDay,
        trend_direction: trendDirection,
        trend_percentage: Math.abs(trendPercentage),
        recent_average: recentAverage,
        predicted_monthly_usage: recentAverage * 30,
      };
    } catch (error) {
      console.error("Usage trends error:", error);
      return null;
    }
  }
}
