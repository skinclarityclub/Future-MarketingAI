/**
 * Admin Usage Tracking and Rate Limiting API
 * Task 36.3: Admin endpoints for managing usage and rate limits
 */

import { NextRequest, NextResponse } from "next/server";
import { UsageTrackingService } from "@/lib/usage-tracking/usage-tracking-service";
import { RateLimitingService } from "@/lib/usage-tracking/rate-limiting-service";

const usageService = new UsageTrackingService();
const rateLimitService = new RateLimitingService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const tenantId = searchParams.get("tenant_id");
    const resourceType = searchParams.get("resource_type");
    const billingTier = searchParams.get("billing_tier") || "free";

    switch (action) {
      case "usage_overview":
        if (!tenantId) {
          return NextResponse.json(
            { error: "tenant_id is required for usage overview" },
            { status: 400 }
          );
        }

        const overview = await usageService.getTenantUsageOverview(tenantId);
        return NextResponse.json({
          success: true,
          data: overview,
        });

      case "usage_analytics":
        if (!tenantId) {
          return NextResponse.json(
            { error: "tenant_id is required for usage analytics" },
            { status: 400 }
          );
        }

        const analytics = await usageService.getUsageAnalytics(
          tenantId,
          resourceType || undefined,
          "daily",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          new Date()
        );

        return NextResponse.json({
          success: true,
          data: analytics,
        });

      case "usage_trends":
        if (!tenantId || !resourceType) {
          return NextResponse.json(
            {
              error:
                "tenant_id and resource_type are required for usage trends",
            },
            { status: 400 }
          );
        }

        const trends = await usageService.getUsageTrends(
          tenantId,
          resourceType,
          30
        );
        return NextResponse.json({
          success: true,
          data: trends,
        });

      case "quota_status":
        if (!tenantId || !resourceType) {
          return NextResponse.json(
            {
              error:
                "tenant_id and resource_type are required for quota status",
            },
            { status: 400 }
          );
        }

        const quotaStatus = await usageService.checkQuotaStatus(
          tenantId,
          resourceType,
          billingTier
        );

        return NextResponse.json({
          success: true,
          data: quotaStatus,
        });

      case "rate_limit_status":
        if (!tenantId) {
          return NextResponse.json(
            { error: "tenant_id is required for rate limit status" },
            { status: 400 }
          );
        }

        const rateLimitStatus =
          await rateLimitService.getTenantRateLimitStatus(tenantId);
        return NextResponse.json({
          success: true,
          data: rateLimitStatus,
        });

      case "can_perform_action":
        if (!tenantId || !resourceType) {
          return NextResponse.json(
            { error: "tenant_id and resource_type are required" },
            { status: 400 }
          );
        }

        const quantity = parseInt(searchParams.get("quantity") || "1");
        const canPerform = await usageService.canPerformAction(
          tenantId,
          resourceType,
          quantity,
          billingTier
        );

        return NextResponse.json({
          success: true,
          data: canPerform,
        });

      default:
        return NextResponse.json({
          success: true,
          message: "Usage Tracking Admin API",
          endpoints: {
            "GET ?action=usage_overview&tenant_id=xxx":
              "Get tenant usage overview",
            "GET ?action=usage_analytics&tenant_id=xxx": "Get usage analytics",
            "GET ?action=usage_trends&tenant_id=xxx&resource_type=xxx":
              "Get usage trends",
            "GET ?action=quota_status&tenant_id=xxx&resource_type=xxx":
              "Check quota status",
            "GET ?action=rate_limit_status&tenant_id=xxx":
              "Get rate limit status",
            "GET ?action=can_perform_action&tenant_id=xxx&resource_type=xxx":
              "Check if action is allowed",
            POST: "Create/update rate limit rules",
            PUT: "Update usage quotas",
            DELETE: "Reset rate limits",
          },
        });
    }
  } catch (error) {
    console.error("Usage tracking admin API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create_rate_limit_rule":
        const { rule } = body;
        if (!rule) {
          return NextResponse.json(
            { error: "rule is required" },
            { status: 400 }
          );
        }

        const ruleId = await rateLimitService.createRateLimitRule(rule);
        return NextResponse.json({
          success: !!ruleId,
          data: { rule_id: ruleId },
          message: ruleId
            ? "Rate limit rule created successfully"
            : "Failed to create rule",
        });

      case "track_usage":
        const { metrics } = body;
        if (!metrics) {
          return NextResponse.json(
            { error: "metrics is required" },
            { status: 400 }
          );
        }

        await usageService.trackUsage(metrics);
        return NextResponse.json({
          success: true,
          message: "Usage tracked successfully",
        });

      case "track_api_call":
        const {
          tenantId,
          endpointPath,
          method,
          statusCode,
          processingTime,
          billingTier,
        } = body;
        if (!tenantId || !endpointPath || !method || statusCode === undefined) {
          return NextResponse.json(
            {
              error:
                "tenantId, endpointPath, method, and statusCode are required",
            },
            { status: 400 }
          );
        }

        await usageService.trackApiCall(
          tenantId,
          endpointPath,
          method,
          statusCode,
          processingTime || 0,
          billingTier || "free"
        );

        return NextResponse.json({
          success: true,
          message: "API call tracked successfully",
        });

      case "track_ai_tokens":
        const {
          tenantId: aiTenantId,
          tokenCount,
          model,
          operation,
          costPerToken,
          billingTier: aiBillingTier,
        } = body;
        if (!aiTenantId || !tokenCount || !model || !operation) {
          return NextResponse.json(
            {
              error: "tenantId, tokenCount, model, and operation are required",
            },
            { status: 400 }
          );
        }

        await usageService.trackAiTokens(
          aiTenantId,
          tokenCount,
          model,
          operation,
          costPerToken || 0.002,
          aiBillingTier || "free"
        );

        return NextResponse.json({
          success: true,
          message: "AI tokens tracked successfully",
        });

      case "track_content_generation":
        const {
          tenantId: contentTenantId,
          contentType,
          generationCount,
          costPerGeneration,
          billingTier: contentBillingTier,
        } = body;
        if (!contentTenantId || !contentType) {
          return NextResponse.json(
            { error: "tenantId and contentType are required" },
            { status: 400 }
          );
        }

        await usageService.trackContentGeneration(
          contentTenantId,
          contentType,
          generationCount || 1,
          costPerGeneration || 0.5,
          contentBillingTier || "free"
        );

        return NextResponse.json({
          success: true,
          message: "Content generation tracked successfully",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Usage tracking admin POST error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "update_rate_limit_rule":
        const { ruleId, updates } = body;
        if (!ruleId || !updates) {
          return NextResponse.json(
            { error: "ruleId and updates are required" },
            { status: 400 }
          );
        }

        const success = await rateLimitService.updateRateLimitRule(
          ruleId,
          updates
        );
        return NextResponse.json({
          success,
          message: success
            ? "Rate limit rule updated successfully"
            : "Failed to update rule",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Usage tracking admin PUT error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const tenantId = searchParams.get("tenant_id");

    switch (action) {
      case "reset_rate_limits":
        if (!tenantId) {
          return NextResponse.json(
            { error: "tenant_id is required" },
            { status: 400 }
          );
        }

        const success = await rateLimitService.resetTenantRateLimits(tenantId);
        return NextResponse.json({
          success,
          message: success
            ? "Rate limits reset successfully"
            : "Failed to reset rate limits",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Usage tracking admin DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
