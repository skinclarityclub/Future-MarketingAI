import { RBACService, UserRoleType } from "./rbac-service";
import { MarketingRoleType } from "./marketing-rbac";

// ====================================================================
// EXTENSIBLE TIER SYSTEM - FUTURE-READY ARCHITECTURE
// ====================================================================

// Base subscription tier type - extensible via configuration
export type SubscriptionTier = string;

// Feature category system - dynamically extensible
export interface FeatureCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  priority: number;
}

// Dynamic feature key system
export type FeatureKey = string;

// Enhanced feature definition with extensibility in mind
export interface ExtensibleFeatureDefinition {
  key: FeatureKey;
  name: string;
  description: string;
  category: string; // Reference to category ID
  requiredTier: SubscriptionTier;
  requiredRole?: UserRoleType | MarketingRoleType;
  usageLimit?: {
    type:
      | "requests"
      | "storage"
      | "users"
      | "projects"
      | "workflows"
      | "custom";
    limit: number;
    period: "hour" | "day" | "month" | "year" | "lifetime";
    resetOn?: "tier_change" | "subscription_renewal" | "manual";
  };
  dependencies?: FeatureKey[];
  conditions?: FeatureCondition[];
  metadata?: Record<string, any>;

  // Extensibility features
  experimental?: boolean;
  betaAccess?: boolean;
  deprecatedAt?: Date;
  replacedBy?: FeatureKey;
  customValidation?: (userId: string, context: any) => Promise<boolean>;
}

// Feature condition system for complex gating
export interface FeatureCondition {
  type:
    | "user_attribute"
    | "usage_threshold"
    | "date_range"
    | "ab_test"
    | "custom";
  operator:
    | "equals"
    | "greater_than"
    | "less_than"
    | "contains"
    | "not_equals"
    | "in_range";
  value: any;
  context?: Record<string, any>;
}

// Enhanced tier configuration with extensibility
export interface ExtensibleTierConfiguration {
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: FeatureKey[];
  limits: Record<string, number>; // Extensible limits
  metadata: {
    popular?: boolean;
    recommended?: boolean;
    targetAudience?: string[];
    businessSize?: "individual" | "small" | "medium" | "large" | "enterprise";
    supportLevel: "community" | "email" | "priority" | "dedicated" | "custom";
    customization?: Record<string, boolean>;
    addOns?: string[];
    tags?: string[];
  };

  // Extensibility features
  parentTier?: SubscriptionTier; // Inheritance support
  overrides?: Partial<ExtensibleTierConfiguration>; // Override parent config
  conditions?: TierCondition[];
  customPricing?: {
    formula?: string;
    factors?: Record<string, number>;
    discounts?: TierDiscount[];
  };
}

// Tier access conditions
export interface TierCondition {
  type:
    | "minimum_users"
    | "contract_length"
    | "annual_commitment"
    | "custom_approval"
    | "geographic"
    | "industry";
  value: any;
  description: string;
}

// Tier discount system
export interface TierDiscount {
  type: "percentage" | "fixed" | "credits";
  value: number;
  conditions: string[];
  validUntil?: Date;
}

// Enhanced feature access result with extensibility
export interface ExtensibleFeatureAccessResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: {
    requiredTier: SubscriptionTier;
    missingFeatures: FeatureKey[];
    estimatedCost?: number;
    alternativeTiers?: SubscriptionTier[];
    upgradeUrl?: string;
  };
  usageInfo?: {
    current: number;
    limit: number;
    resetDate?: Date;
    type: string;
    remainingAllowance?: number;
  };
  restrictions?: FeatureRestriction[];

  // Extensibility
  metadata?: Record<string, any>;
  customData?: any;
}

// Feature restriction system
export interface FeatureRestriction {
  type: "time_limited" | "usage_capped" | "readonly" | "watermarked" | "custom";
  description: string;
  expiresAt?: Date;
  maxUsage?: number;
  customData?: any;
}

// Tier configuration registry
export interface TierConfigurationRegistry {
  tiers: Record<SubscriptionTier, ExtensibleTierConfiguration>;
  features: Record<FeatureKey, ExtensibleFeatureDefinition>;
  categories: Record<string, FeatureCategory>;
  tierOrder: SubscriptionTier[];

  // Extension hooks
  addTier: (config: ExtensibleTierConfiguration) => void;
  addFeature: (feature: ExtensibleFeatureDefinition) => void;
  addCategory: (category: FeatureCategory) => void;
  updateTierOrder: (order: SubscriptionTier[]) => void;
}

// Base configuration - can be extended dynamically
export const BASE_CATEGORIES: Record<string, FeatureCategory> = {
  dashboard: {
    id: "dashboard",
    name: "Dashboard Access",
    description: "Dashboard viewing and customization features",
    icon: "BarChart3",
    color: "blue",
    priority: 1,
  },
  analytics: {
    id: "analytics",
    name: "Analytics",
    description: "Data analysis and reporting capabilities",
    icon: "TrendingUp",
    color: "green",
    priority: 2,
  },
  ai: {
    id: "ai",
    name: "AI Features",
    description: "Artificial intelligence and automation",
    icon: "Brain",
    color: "purple",
    priority: 3,
  },
  integrations: {
    id: "integrations",
    name: "Integrations",
    description: "Third-party service connections",
    icon: "Plug",
    color: "orange",
    priority: 4,
  },
  collaboration: {
    id: "collaboration",
    name: "Team Collaboration",
    description: "Team features and workflow management",
    icon: "Users",
    color: "indigo",
    priority: 5,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Security, compliance, and advanced admin features",
    icon: "Shield",
    color: "red",
    priority: 6,
  },
};

// Base tier definitions - extensible foundation
export const BASE_TIER_ORDER: SubscriptionTier[] = [
  "free",
  "starter",
  "professional",
  "enterprise",
  "ultimate",
];

/**
 * Extensible Tier Service
 * Designed for easy addition of new tiers and features without code changes
 */
export class ExtensibleTierService {
  private rbacService: RBACService;
  private userTierCache = new Map<string, SubscriptionTier>();
  private registry: TierConfigurationRegistry;

  constructor(initialConfig?: Partial<TierConfigurationRegistry>) {
    this.rbacService = new RBACService();
    this.registry = this.initializeRegistry(initialConfig);
  }

  /**
   * Initialize the tier configuration registry
   */
  private initializeRegistry(
    config?: Partial<TierConfigurationRegistry>
  ): TierConfigurationRegistry {
    const registry: TierConfigurationRegistry = {
      tiers: config?.tiers || this.getDefaultTiers(),
      features: config?.features || this.getDefaultFeatures(),
      categories: config?.categories || BASE_CATEGORIES,
      tierOrder: config?.tierOrder || BASE_TIER_ORDER,

      // Extension methods
      addTier: (tierConfig: ExtensibleTierConfiguration) => {
        registry.tiers[tierConfig.tier] = tierConfig;
        if (!registry.tierOrder.includes(tierConfig.tier)) {
          registry.tierOrder.push(tierConfig.tier);
          registry.tierOrder.sort((a, b) => {
            const aConfig = registry.tiers[a];
            const bConfig = registry.tiers[b];
            return aConfig.monthlyPrice - bConfig.monthlyPrice;
          });
        }
      },

      addFeature: (feature: ExtensibleFeatureDefinition) => {
        registry.features[feature.key] = feature;
      },

      addCategory: (category: FeatureCategory) => {
        registry.categories[category.id] = category;
      },

      updateTierOrder: (order: SubscriptionTier[]) => {
        registry.tierOrder = order;
      },
    };

    return registry;
  }

  /**
   * Get default tier configurations
   */
  private getDefaultTiers(): Record<
    SubscriptionTier,
    ExtensibleTierConfiguration
  > {
    return {
      free: {
        tier: "free",
        name: "Free",
        description: "Basic features to get started",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: ["basic_dashboard", "team_collaboration"],
        limits: {
          maxUsers: 2,
          maxProjects: 1,
          maxWorkflows: 0,
          apiCallsPerMonth: 0,
          storageGB: 1,
        },
        metadata: {
          supportLevel: "community",
          businessSize: "individual",
          tags: ["free", "trial", "basic"],
        },
      },

      starter: {
        tier: "starter",
        name: "Starter",
        description: "Essential tools for small teams",
        monthlyPrice: 49,
        yearlyPrice: 490,
        features: [
          "basic_dashboard",
          "advanced_dashboard",
          "clickup_integration",
          "ai_chatbot",
          "real_time_analytics",
        ],
        limits: {
          maxUsers: 5,
          maxProjects: 3,
          maxWorkflows: 10,
          apiCallsPerMonth: 1000,
          storageGB: 10,
        },
        metadata: {
          supportLevel: "email",
          businessSize: "small",
          targetAudience: ["startups", "small_teams"],
          tags: ["popular", "small_business"],
        },
      },

      professional: {
        tier: "professional",
        name: "Professional",
        description: "Advanced features for growing teams",
        monthlyPrice: 149,
        yearlyPrice: 1490,
        features: [
          "basic_dashboard",
          "advanced_dashboard",
          "executive_dashboard",
          "clickup_integration",
          "ai_chatbot",
          "ai_content_generation",
          "real_time_analytics",
          "historical_analytics",
          "ab_testing",
          "data_export",
        ],
        limits: {
          maxUsers: 25,
          maxProjects: 10,
          maxWorkflows: 100,
          apiCallsPerMonth: 10000,
          storageGB: 100,
        },
        metadata: {
          popular: true,
          supportLevel: "priority",
          businessSize: "medium",
          targetAudience: ["growing_companies", "agencies"],
          customization: {
            brandingRemoval: false,
            customDomain: false,
            advancedSecurity: true,
          },
          tags: ["recommended", "popular", "business"],
        },
      },

      enterprise: {
        tier: "enterprise",
        name: "Enterprise",
        description: "Complete solution for large organizations",
        monthlyPrice: 449,
        yearlyPrice: 4490,
        features: [
          "basic_dashboard",
          "advanced_dashboard",
          "executive_dashboard",
          "clickup_integration",
          "ai_chatbot",
          "ai_content_generation",
          "ai_optimization",
          "real_time_analytics",
          "historical_analytics",
          "predictive_analytics",
          "ab_testing",
          "data_export",
          "api_access",
          "sso_integration",
          "audit_logging",
        ],
        limits: {
          maxUsers: 100,
          maxProjects: 50,
          maxWorkflows: 500,
          apiCallsPerMonth: 100000,
          storageGB: 1000,
        },
        metadata: {
          supportLevel: "priority",
          businessSize: "large",
          targetAudience: ["large_companies", "enterprises"],
          customization: {
            brandingRemoval: true,
            customDomain: true,
            advancedSecurity: true,
          },
          tags: ["enterprise", "advanced", "security"],
        },
      },

      ultimate: {
        tier: "ultimate",
        name: "Ultimate",
        description: "White-label solution with unlimited everything",
        monthlyPrice: 999,
        yearlyPrice: 9990,
        features: [], // Will be populated with all features
        limits: {
          maxUsers: -1, // Unlimited
          maxProjects: -1,
          maxWorkflows: -1,
          apiCallsPerMonth: -1,
          storageGB: -1,
        },
        metadata: {
          supportLevel: "dedicated",
          businessSize: "enterprise",
          targetAudience: ["enterprise", "white_label"],
          customization: {
            brandingRemoval: true,
            customDomain: true,
            advancedSecurity: true,
            whiteLabel: true,
          },
          tags: ["premium", "unlimited", "white_label"],
        },
      },
    };
  }

  /**
   * Get default feature definitions
   */
  private getDefaultFeatures(): Record<
    FeatureKey,
    ExtensibleFeatureDefinition
  > {
    return {
      basic_dashboard: {
        key: "basic_dashboard",
        name: "Basic Dashboard",
        description: "Access to basic analytics and metrics overview",
        category: "dashboard",
        requiredTier: "free",
      },

      advanced_dashboard: {
        key: "advanced_dashboard",
        name: "Advanced Dashboard",
        description: "Advanced widgets, custom layouts, and detailed metrics",
        category: "dashboard",
        requiredTier: "starter",
      },

      executive_dashboard: {
        key: "executive_dashboard",
        name: "Executive Dashboard",
        description: "High-level strategic insights and executive reporting",
        category: "dashboard",
        requiredTier: "professional",
        requiredRole: "executive",
      },

      clickup_integration: {
        key: "clickup_integration",
        name: "ClickUp Integration",
        description: "Sync tasks, projects, and team data with ClickUp",
        category: "integrations",
        requiredTier: "starter",
      },

      ai_chatbot: {
        key: "ai_chatbot",
        name: "AI Assistant",
        description:
          "Intelligent chatbot for marketing insights and automation",
        category: "ai",
        requiredTier: "starter",
        usageLimit: {
          type: "requests",
          limit: 1000,
          period: "month",
        },
      },

      ai_content_generation: {
        key: "ai_content_generation",
        name: "AI Content Generation",
        description: "Automated content creation using AI models",
        category: "ai",
        requiredTier: "professional",
        usageLimit: {
          type: "requests",
          limit: 500,
          period: "month",
        },
      },

      ai_optimization: {
        key: "ai_optimization",
        name: "AI Campaign Optimization",
        description: "AI-powered campaign optimization and recommendations",
        category: "ai",
        requiredTier: "enterprise",
        dependencies: ["ai_chatbot", "historical_analytics"],
      },

      real_time_analytics: {
        key: "real_time_analytics",
        name: "Real-time Analytics",
        description: "Live data updates and real-time performance tracking",
        category: "analytics",
        requiredTier: "starter",
      },

      historical_analytics: {
        key: "historical_analytics",
        name: "Historical Analytics",
        description: "Access to historical data and trend analysis",
        category: "analytics",
        requiredTier: "professional",
      },

      predictive_analytics: {
        key: "predictive_analytics",
        name: "Predictive Analytics",
        description: "ML-powered forecasting and predictive insights",
        category: "analytics",
        requiredTier: "enterprise",
        dependencies: ["historical_analytics"],
      },

      ab_testing: {
        key: "ab_testing",
        name: "A/B Testing",
        description: "Split testing for campaigns and content optimization",
        category: "analytics",
        requiredTier: "professional",
      },

      team_collaboration: {
        key: "team_collaboration",
        name: "Team Collaboration",
        description:
          "Team workspaces, shared projects, and collaboration tools",
        category: "collaboration",
        requiredTier: "free",
      },

      data_export: {
        key: "data_export",
        name: "Data Export",
        description: "Export data in various formats (CSV, Excel, PDF)",
        category: "analytics",
        requiredTier: "professional",
      },

      api_access: {
        key: "api_access",
        name: "API Access",
        description: "REST API access for custom integrations",
        category: "integrations",
        requiredTier: "enterprise",
        usageLimit: {
          type: "requests",
          limit: 100000,
          period: "month",
        },
      },

      sso_integration: {
        key: "sso_integration",
        name: "SSO Integration",
        description: "Single Sign-On with SAML/OAuth providers",
        category: "enterprise",
        requiredTier: "enterprise",
      },

      audit_logging: {
        key: "audit_logging",
        name: "Audit Logging",
        description: "Comprehensive audit logs and compliance reporting",
        category: "enterprise",
        requiredTier: "enterprise",
      },
    };
  }

  /**
   * Add a new tier dynamically
   */
  async addNewTier(tierConfig: ExtensibleTierConfiguration): Promise<void> {
    this.registry.addTier(tierConfig);

    // Clear cache to force re-evaluation
    this.userTierCache.clear();

    // Optionally persist to database
    await this.persistTierConfiguration(tierConfig);
  }

  /**
   * Add a new feature dynamically
   */
  async addNewFeature(feature: ExtensibleFeatureDefinition): Promise<void> {
    this.registry.addFeature(feature);

    // Clear cache
    this.userTierCache.clear();

    // Persist to database
    await this.persistFeatureConfiguration(feature);
  }

  /**
   * Get all available tiers
   */
  getAllTiers(): ExtensibleTierConfiguration[] {
    return this.registry.tierOrder.map(tier => this.registry.tiers[tier]);
  }

  /**
   * Get tier configuration
   */
  getTierConfiguration(
    tier: SubscriptionTier
  ): ExtensibleTierConfiguration | undefined {
    return this.registry.tiers[tier];
  }

  /**
   * Get feature definition
   */
  getFeatureDefinition(
    feature: FeatureKey
  ): ExtensibleFeatureDefinition | undefined {
    return this.registry.features[feature];
  }

  /**
   * Compare two tiers
   */
  compareTiers(tier1: SubscriptionTier, tier2: SubscriptionTier): number {
    const index1 = this.registry.tierOrder.indexOf(tier1);
    const index2 = this.registry.tierOrder.indexOf(tier2);

    if (index1 === -1 || index2 === -1) {
      throw new Error(`Invalid tier comparison: ${tier1} vs ${tier2}`);
    }

    return index1 - index2;
  }

  /**
   * Get user's current tier (enhanced)
   */
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    if (this.userTierCache.has(userId)) {
      return this.userTierCache.get(userId)!;
    }

    try {
      // This would integrate with your subscription service
      // For now, using RBAC fallback
      const userRoles = await this.rbacService.getUserRoles(userId);
      const tier = this.mapRolesToTier(userRoles);

      this.userTierCache.set(userId, tier);
      return tier;
    } catch (error) {
      console.error("Error getting user tier:", error);
      return "free";
    }
  }

  /**
   * Check enhanced feature access
   */
  async hasFeatureAccess(
    userId: string,
    feature: FeatureKey,
    context?: any
  ): Promise<ExtensibleFeatureAccessResult> {
    try {
      const userTier = await this.getUserTier(userId);
      const featureDefinition = this.registry.features[feature];

      if (!featureDefinition) {
        return {
          allowed: false,
          reason: "Feature not found",
          metadata: { feature, userId },
        };
      }

      // Check tier requirement
      const tierComparison = this.compareTiers(
        userTier,
        featureDefinition.requiredTier
      );
      if (tierComparison < 0) {
        return {
          allowed: false,
          reason: "Insufficient tier level",
          upgradeRequired: {
            requiredTier: featureDefinition.requiredTier,
            missingFeatures: [feature],
            estimatedCost: this.calculateUpgradeCost(
              userTier,
              featureDefinition.requiredTier
            ),
            alternativeTiers: this.getAlternativeTiers(feature),
          },
        };
      }

      // Check role requirements
      if (featureDefinition.requiredRole) {
        const hasRole = await this.rbacService.hasRole(
          userId,
          featureDefinition.requiredRole as any
        );
        if (!hasRole) {
          return {
            allowed: false,
            reason: "Insufficient role permissions",
            metadata: { requiredRole: featureDefinition.requiredRole },
          };
        }
      }

      // Check dependencies
      if (featureDefinition.dependencies) {
        for (const dependency of featureDefinition.dependencies) {
          const dependencyAccess = await this.hasFeatureAccess(
            userId,
            dependency,
            context
          );
          if (!dependencyAccess.allowed) {
            return {
              allowed: false,
              reason: `Missing dependency: ${dependency}`,
              upgradeRequired: dependencyAccess.upgradeRequired,
            };
          }
        }
      }

      // Check usage limits
      if (featureDefinition.usageLimit) {
        const usageInfo = await this.checkUsageLimit(
          userId,
          feature,
          featureDefinition.usageLimit
        );
        if (usageInfo.current >= usageInfo.limit && usageInfo.limit > 0) {
          return {
            allowed: false,
            reason: "Usage limit exceeded",
            usageInfo,
            upgradeRequired: {
              requiredTier: this.getNextTierWithHigherLimit(userTier, feature),
              missingFeatures: [feature],
              estimatedCost: 0, // Could be calculated based on usage overage
            },
          };
        }
      }

      // Check custom conditions
      if (featureDefinition.conditions) {
        for (const condition of featureDefinition.conditions) {
          const conditionMet = await this.evaluateCondition(
            condition,
            userId,
            context
          );
          if (!conditionMet) {
            return {
              allowed: false,
              reason: `Condition not met: ${condition.type}`,
              metadata: { condition },
            };
          }
        }
      }

      // Check custom validation
      if (featureDefinition.customValidation) {
        const customValid = await featureDefinition.customValidation(
          userId,
          context
        );
        if (!customValid) {
          return {
            allowed: false,
            reason: "Custom validation failed",
          };
        }
      }

      return {
        allowed: true,
        usageInfo: featureDefinition.usageLimit
          ? await this.checkUsageLimit(
              userId,
              feature,
              featureDefinition.usageLimit
            )
          : undefined,
      };
    } catch (error) {
      console.error("Error checking feature access:", error);
      return {
        allowed: false,
        reason: "Access check failed",
        metadata: { error: error.message },
      };
    }
  }

  // ====================================================================
  // PRIVATE HELPER METHODS
  // ====================================================================

  private mapRolesToTier(roles: string[]): SubscriptionTier {
    const roleTierMap: Record<string, SubscriptionTier> = {
      super_admin: "ultimate",
      admin: "enterprise",
      executive: "enterprise",
      marketing_director: "professional",
      marketing_manager: "professional",
      content_manager: "starter",
      analyst: "starter",
      user: "free",
    };

    const highestRole = roles.find(role => roleTierMap[role]);
    return roleTierMap[highestRole || "user"] || "free";
  }

  private calculateUpgradeCost(
    currentTier: SubscriptionTier,
    targetTier: SubscriptionTier
  ): number {
    const currentConfig = this.registry.tiers[currentTier];
    const targetConfig = this.registry.tiers[targetTier];

    if (!currentConfig || !targetConfig) return 0;

    return targetConfig.monthlyPrice - currentConfig.monthlyPrice;
  }

  private getAlternativeTiers(feature: FeatureKey): SubscriptionTier[] {
    return this.registry.tierOrder.filter(tier => {
      const config = this.registry.tiers[tier];
      return config.features.includes(feature);
    });
  }

  private getNextTierWithHigherLimit(
    currentTier: SubscriptionTier,
    feature: FeatureKey
  ): SubscriptionTier {
    const currentIndex = this.registry.tierOrder.indexOf(currentTier);

    for (let i = currentIndex + 1; i < this.registry.tierOrder.length; i++) {
      const tier = this.registry.tierOrder[i];
      const config = this.registry.tiers[tier];

      if (config.features.includes(feature)) {
        return tier;
      }
    }

    return this.registry.tierOrder[this.registry.tierOrder.length - 1];
  }

  private async checkUsageLimit(
    userId: string,
    feature: FeatureKey,
    usageLimit: NonNullable<ExtensibleFeatureDefinition["usageLimit"]>
  ) {
    // This would integrate with usage tracking service
    // For now, return mock data
    return {
      current: 100,
      limit: usageLimit.limit,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      type: usageLimit.type,
      remainingAllowance: Math.max(0, usageLimit.limit - 100),
    };
  }

  private async evaluateCondition(
    condition: FeatureCondition,
    userId: string,
    context: any
  ): Promise<boolean> {
    // This would implement condition evaluation logic
    // For now, return true (all conditions pass)
    return true;
  }

  private async persistTierConfiguration(
    tierConfig: ExtensibleTierConfiguration
  ): Promise<void> {
    // This would persist to database
    console.log("Persisting tier configuration:", tierConfig.tier);
  }

  private async persistFeatureConfiguration(
    feature: ExtensibleFeatureDefinition
  ): Promise<void> {
    // This would persist to database
    console.log("Persisting feature configuration:", feature.key);
  }

  /**
   * Clear user cache
   */
  clearUserCache(userId?: string): void {
    if (userId) {
      this.userTierCache.delete(userId);
    } else {
      this.userTierCache.clear();
    }
  }

  /**
   * Get registry for external use
   */
  getRegistry(): TierConfigurationRegistry {
    return this.registry;
  }
}

// Export singleton instance
export const extensibleTierService = new ExtensibleTierService();
