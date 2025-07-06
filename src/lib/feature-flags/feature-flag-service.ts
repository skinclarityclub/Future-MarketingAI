"use client";

import {
  AccessTierService,
  FeatureKey,
  SubscriptionTier,
} from "@/lib/rbac/access-tier-service";
import { RBACService, UserRoleType } from "@/lib/rbac/rbac-service";

// Feature Flag Types
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  key: FeatureKey;
  enabled: boolean;
  rolloutPercentage: number;
  environment: "production" | "staging" | "development" | "all";
  category: "ui" | "api" | "workflow" | "analytics" | "integration";
  targetingRules: FeatureTargetingRule[];
  schedule?: FeatureFlagSchedule;
  conditions?: FeatureFlagCondition[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface FeatureTargetingRule {
  id: string;
  name: string;
  condition: "user_tier" | "user_role" | "user_id" | "percentage" | "custom";
  operator:
    | "equals"
    | "not_equals"
    | "in"
    | "not_in"
    | "greater_than"
    | "less_than";
  value: any;
  enabled: boolean;
}

export interface FeatureFlagSchedule {
  startDate?: string;
  endDate?: string;
  timezone: string;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  timeRanges?: Array<{
    start: string; // HH:mm format
    end: string; // HH:mm format
  }>;
}

export interface FeatureFlagCondition {
  key: string;
  operator: "equals" | "contains" | "starts_with" | "ends_with" | "regex";
  value: any;
}

export interface FeatureFlagEvaluationContext {
  userId?: string;
  userTier?: SubscriptionTier;
  userRole?: UserRoleType;
  environment?: string;
  timestamp?: Date;
  customAttributes?: Record<string, any>;
}

export interface FeatureFlagEvaluationResult {
  enabled: boolean;
  reason: string;
  variant?: string;
  metadata?: Record<string, any>;
}

/**
 * Feature Flag Service
 * Provides dynamic feature control integrated with RBAC and access tiers
 */
export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private accessTierService: AccessTierService;
  private rbacService: RBACService;
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private evaluationCache: Map<
    string,
    { result: FeatureFlagEvaluationResult; timestamp: Date }
  > = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.accessTierService = new AccessTierService();
    this.rbacService = new RBACService();
    this.initializeDefaultFlags();
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Initialize default feature flags
   */
  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        id: "advanced_dashboard",
        name: "Advanced Dashboard",
        description:
          "Enable advanced dashboard with custom widgets and layouts",
        key: "advanced_dashboard",
        enabled: true,
        rolloutPercentage: 100,
        environment: "all",
        category: "ui",
        targetingRules: [
          {
            id: "tier_check",
            name: "Tier Access Check",
            condition: "user_tier",
            operator: "in",
            value: ["starter", "professional", "enterprise", "ultimate"],
            enabled: true,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "system",
        updatedBy: "system",
        version: 1,
      },
      {
        id: "ai_content_generation",
        name: "AI Content Generation",
        description: "AI-powered content creation and optimization",
        key: "ai_content_generation",
        enabled: true,
        rolloutPercentage: 75,
        environment: "production",
        category: "workflow",
        targetingRules: [
          {
            id: "tier_check",
            name: "Professional Tier Required",
            condition: "user_tier",
            operator: "in",
            value: ["professional", "enterprise", "ultimate"],
            enabled: true,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "system",
        updatedBy: "system",
        version: 1,
      },
      {
        id: "predictive_analytics",
        name: "Predictive Analytics",
        description:
          "Machine learning powered predictive analytics and forecasting",
        key: "predictive_analytics",
        enabled: false,
        rolloutPercentage: 25,
        environment: "staging",
        category: "analytics",
        targetingRules: [
          {
            id: "tier_check",
            name: "Enterprise Tier Required",
            condition: "user_tier",
            operator: "in",
            value: ["enterprise", "ultimate"],
            enabled: true,
          },
        ],
        schedule: {
          startDate: "2025-02-01T00:00:00Z",
          timezone: "UTC",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "system",
        updatedBy: "system",
        version: 1,
      },
      {
        id: "api_access",
        name: "API Access",
        description: "REST API access for custom integrations",
        key: "api_access",
        enabled: true,
        rolloutPercentage: 100,
        environment: "all",
        category: "api",
        targetingRules: [
          {
            id: "tier_check",
            name: "Enterprise Features",
            condition: "user_tier",
            operator: "in",
            value: ["enterprise", "ultimate"],
            enabled: true,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "system",
        updatedBy: "system",
        version: 1,
      },
    ];

    defaultFlags.forEach(flag => {
      this.featureFlags.set(flag.key, flag);
    });
  }

  /**
   * Check if a feature is enabled for a user
   */
  async isFeatureEnabled(
    featureKey: FeatureKey,
    context: FeatureFlagEvaluationContext
  ): Promise<FeatureFlagEvaluationResult> {
    const cacheKey = `${featureKey}_${context.userId || "anonymous"}_${JSON.stringify(context)}`;

    // Check cache first
    const cached = this.evaluationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < this.cacheTimeout) {
      return cached.result;
    }

    const result = await this.evaluateFeatureFlag(featureKey, context);

    // Cache the result
    this.evaluationCache.set(cacheKey, {
      result,
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * Evaluate feature flag based on context
   */
  private async evaluateFeatureFlag(
    featureKey: FeatureKey,
    context: FeatureFlagEvaluationContext
  ): Promise<FeatureFlagEvaluationResult> {
    const flag = this.featureFlags.get(featureKey);

    if (!flag) {
      return {
        enabled: false,
        reason: "Feature flag not found",
      };
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return {
        enabled: false,
        reason: "Feature flag is globally disabled",
      };
    }

    // Check environment
    if (flag.environment !== "all") {
      const currentEnv =
        context.environment || process.env.NODE_ENV || "development";
      if (flag.environment !== currentEnv) {
        return {
          enabled: false,
          reason: `Feature not enabled for environment: ${currentEnv}`,
        };
      }
    }

    // Check schedule
    if (flag.schedule && !this.isWithinSchedule(flag.schedule)) {
      return {
        enabled: false,
        reason: "Feature not active based on schedule",
      };
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.getUserHash(context.userId || "anonymous", flag.id);
      if (hash >= flag.rolloutPercentage) {
        return {
          enabled: false,
          reason: `User not in rollout percentage (${flag.rolloutPercentage}%)`,
        };
      }
    }

    // Check targeting rules
    const targetingResult = await this.evaluateTargetingRules(
      flag.targetingRules,
      context
    );
    if (!targetingResult.enabled) {
      return targetingResult;
    }

    // Check access tier permissions
    if (context.userId) {
      const hasAccess = await this.accessTierService.hasFeatureAccess(
        context.userId,
        featureKey
      );
      if (!hasAccess) {
        return {
          enabled: false,
          reason: "Insufficient access tier for feature",
        };
      }
    }

    return {
      enabled: true,
      reason: "All conditions met",
    };
  }

  /**
   * Evaluate targeting rules
   */
  private async evaluateTargetingRules(
    rules: FeatureTargetingRule[],
    context: FeatureFlagEvaluationContext
  ): Promise<FeatureFlagEvaluationResult> {
    for (const rule of rules) {
      if (!rule.enabled) continue;

      const result = await this.evaluateTargetingRule(rule, context);
      if (!result.enabled) {
        return result;
      }
    }

    return { enabled: true, reason: "All targeting rules passed" };
  }

  /**
   * Evaluate individual targeting rule
   */
  private async evaluateTargetingRule(
    rule: FeatureTargetingRule,
    context: FeatureFlagEvaluationContext
  ): Promise<FeatureFlagEvaluationResult> {
    let actualValue: any;

    switch (rule.condition) {
      case "user_tier":
        actualValue =
          context.userTier ||
          (context.userId
            ? await this.accessTierService.getUserTier(context.userId)
            : "free");
        break;
      case "user_role":
        actualValue =
          context.userRole ||
          (context.userId
            ? await this.rbacService.getUserHighestRole(context.userId)
            : "user");
        break;
      case "user_id":
        actualValue = context.userId;
        break;
      case "percentage":
        const hash = this.getUserHash(context.userId || "anonymous", rule.id);
        actualValue = hash;
        break;
      default:
        actualValue = context.customAttributes?.[rule.condition];
    }

    const passes = this.evaluateCondition(
      actualValue,
      rule.operator,
      rule.value
    );

    return {
      enabled: passes,
      reason: passes
        ? `Rule ${rule.name} passed`
        : `Rule ${rule.name} failed: ${actualValue} ${rule.operator} ${rule.value}`,
    };
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(
    actual: any,
    operator: string,
    expected: any
  ): boolean {
    switch (operator) {
      case "equals":
        return actual === expected;
      case "not_equals":
        return actual !== expected;
      case "in":
        return Array.isArray(expected) && expected.includes(actual);
      case "not_in":
        return Array.isArray(expected) && !expected.includes(actual);
      case "greater_than":
        return actual > expected;
      case "less_than":
        return actual < expected;
      default:
        return false;
    }
  }

  /**
   * Check if current time is within schedule
   */
  private isWithinSchedule(schedule: FeatureFlagSchedule): boolean {
    const now = new Date();

    if (schedule.startDate && new Date(schedule.startDate) > now) {
      return false;
    }

    if (schedule.endDate && new Date(schedule.endDate) < now) {
      return false;
    }

    if (schedule.daysOfWeek && !schedule.daysOfWeek.includes(now.getDay())) {
      return false;
    }

    if (schedule.timeRanges) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const inTimeRange = schedule.timeRanges.some(range => {
        const [startHour, startMin] = range.start.split(":").map(Number);
        const [endHour, endMin] = range.end.split(":").map(Number);
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        return currentTime >= startTime && currentTime <= endTime;
      });

      if (!inTimeRange) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate consistent hash for user/feature combination
   */
  private getUserHash(userId: string, featureId: string): number {
    const combined = `${userId}_${featureId}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  /**
   * Get all feature flags
   */
  getAllFeatureFlags(): FeatureFlag[] {
    return Array.from(this.featureFlags.values());
  }

  /**
   * Get feature flag by key
   */
  getFeatureFlag(key: FeatureKey): FeatureFlag | undefined {
    return this.featureFlags.get(key);
  }

  /**
   * Update feature flag
   */
  async updateFeatureFlag(
    key: FeatureKey,
    updates: Partial<FeatureFlag>
  ): Promise<void> {
    const existing = this.featureFlags.get(key);
    if (!existing) {
      throw new Error(`Feature flag ${key} not found`);
    }

    const updated: FeatureFlag = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    this.featureFlags.set(key, updated);
    this.clearCache(key);

    // In production, this would persist to database
    console.log(`Feature flag ${key} updated:`, updated);
  }

  /**
   * Create new feature flag
   */
  async createFeatureFlag(
    flag: Omit<FeatureFlag, "createdAt" | "updatedAt" | "version">
  ): Promise<void> {
    const newFlag: FeatureFlag = {
      ...flag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    this.featureFlags.set(flag.key, newFlag);

    // In production, this would persist to database
    console.log(`Feature flag ${flag.key} created:`, newFlag);
  }

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(key: FeatureKey): Promise<void> {
    this.featureFlags.delete(key);
    this.clearCache(key);

    // In production, this would remove from database
    console.log(`Feature flag ${key} deleted`);
  }

  /**
   * Clear cache for specific feature
   */
  private clearCache(featureKey?: FeatureKey): void {
    if (featureKey) {
      // Clear cache entries for specific feature
      for (const [key] of this.evaluationCache) {
        if (key.startsWith(featureKey)) {
          this.evaluationCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.evaluationCache.clear();
    }
  }

  /**
   * Get feature flag usage analytics
   */
  async getFeatureFlagAnalytics(key: FeatureKey): Promise<{
    totalEvaluations: number;
    enabledCount: number;
    disabledCount: number;
    reasons: Record<string, number>;
  }> {
    // In production, this would query analytics database
    return {
      totalEvaluations: 1000,
      enabledCount: 750,
      disabledCount: 250,
      reasons: {
        "All conditions met": 750,
        "Insufficient access tier for feature": 200,
        "User not in rollout percentage": 50,
      },
    };
  }
}

// Export singleton instance
export const featureFlagService = FeatureFlagService.getInstance();
