import { RBACService, UserRoleType } from "./rbac-service";
import { MarketingRoleType } from "./marketing-rbac";

// Subscription Tier Definitions
export type SubscriptionTier =
  | "free"
  | "starter"
  | "professional"
  | "enterprise"
  | "ultimate";

// Feature Categories for access control
export type FeatureCategory =
  | "dashboard_access"
  | "analytics"
  | "automation"
  | "ai_features"
  | "integrations"
  | "collaboration"
  | "content_management"
  | "reporting"
  | "support"
  | "data_export"
  | "custom_widgets"
  | "api_access"
  | "workflow_automation"
  | "advanced_analytics"
  | "multi_platform"
  | "team_management"
  | "audit_logs"
  | "sso"
  | "white_label";

// Individual Feature Definitions
export type FeatureKey =
  | "basic_dashboard"
  | "advanced_dashboard"
  | "executive_dashboard"
  | "clickup_integration"
  | "blotato_integration"
  | "n8n_workflows"
  | "ai_chatbot"
  | "ai_content_generation"
  | "ai_optimization"
  | "real_time_analytics"
  | "historical_analytics"
  | "predictive_analytics"
  | "ab_testing"
  | "content_calendar"
  | "social_media_scheduling"
  | "approval_workflows"
  | "team_collaboration"
  | "comment_system"
  | "task_assignment"
  | "budget_tracking"
  | "roi_analytics"
  | "custom_reports"
  | "data_export"
  | "api_access"
  | "webhook_support"
  | "sso_integration"
  | "audit_logging"
  | "priority_support"
  | "dedicated_support"
  | "white_labeling"
  | "unlimited_users"
  | "advanced_permissions"
  | "advanced_analytics";

// Feature Definition Interface
export interface FeatureDefinition {
  key: FeatureKey;
  name: string;
  description: string;
  category: FeatureCategory;
  requiredTier: SubscriptionTier;
  requiredRole?: UserRoleType | MarketingRoleType;
  usageLimit?: {
    type: "requests" | "storage" | "users" | "projects";
    limit: number;
    period: "hour" | "day" | "month" | "year";
  };
  dependencies?: FeatureKey[];
}

// Subscription Tier Configuration
export interface TierConfiguration {
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: FeatureKey[];
  limits: {
    maxUsers: number;
    maxProjects: number;
    maxWorkflows: number;
    apiCallsPerMonth: number;
    storageGB: number;
    supportLevel: "community" | "email" | "priority" | "dedicated";
  };
  popular?: boolean;
  customization?: {
    brandingRemoval: boolean;
    customDomain: boolean;
    advancedSecurity: boolean;
  };
}

// Feature Access Result
export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: {
    requiredTier: SubscriptionTier;
    missingFeatures: FeatureKey[];
    estimatedCost?: number;
  };
  usageInfo?: {
    current: number;
    limit: number;
    resetDate?: Date;
  };
}

// Complete Feature Registry
export const FEATURE_REGISTRY: Record<FeatureKey, FeatureDefinition> = {
  // Dashboard Features
  basic_dashboard: {
    key: "basic_dashboard",
    name: "Basic Dashboard",
    description: "Access to basic analytics and metrics overview",
    category: "dashboard_access",
    requiredTier: "free",
  },
  advanced_dashboard: {
    key: "advanced_dashboard",
    name: "Advanced Dashboard",
    description: "Advanced widgets, custom layouts, and detailed metrics",
    category: "dashboard_access",
    requiredTier: "starter",
  },
  executive_dashboard: {
    key: "executive_dashboard",
    name: "Executive Dashboard",
    description: "High-level strategic insights and executive reporting",
    category: "dashboard_access",
    requiredTier: "professional",
    requiredRole: "executive",
  },

  // Integration Features
  clickup_integration: {
    key: "clickup_integration",
    name: "ClickUp Integration",
    description: "Sync tasks, projects, and team data with ClickUp",
    category: "integrations",
    requiredTier: "starter",
  },
  blotato_integration: {
    key: "blotato_integration",
    name: "Blotato Integration",
    description: "Social media automation and scheduling through Blotato",
    category: "integrations",
    requiredTier: "professional",
  },
  n8n_workflows: {
    key: "n8n_workflows",
    name: "n8n Workflow Automation",
    description: "Advanced workflow automation and custom integrations",
    category: "workflow_automation",
    requiredTier: "professional",
    usageLimit: {
      type: "requests",
      limit: 10000,
      period: "month",
    },
  },

  // AI Features
  ai_chatbot: {
    key: "ai_chatbot",
    name: "AI Assistant",
    description: "Intelligent chatbot for marketing insights and automation",
    category: "ai_features",
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
    category: "ai_features",
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
    category: "ai_features",
    requiredTier: "enterprise",
    dependencies: ["ai_chatbot", "advanced_analytics"],
  },

  // Analytics Features
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
    category: "advanced_analytics",
    requiredTier: "enterprise",
    dependencies: ["historical_analytics"],
  },

  // Content & Campaign Management
  ab_testing: {
    key: "ab_testing",
    name: "A/B Testing",
    description: "Split testing for campaigns and content optimization",
    category: "analytics",
    requiredTier: "professional",
  },
  content_calendar: {
    key: "content_calendar",
    name: "Content Calendar",
    description: "Advanced content planning and scheduling tools",
    category: "content_management",
    requiredTier: "starter",
  },
  social_media_scheduling: {
    key: "social_media_scheduling",
    name: "Social Media Scheduling",
    description: "Multi-platform social media post scheduling",
    category: "content_management",
    requiredTier: "professional",
    dependencies: ["content_calendar"],
  },

  // Collaboration Features
  approval_workflows: {
    key: "approval_workflows",
    name: "Approval Workflows",
    description: "Content approval processes and workflow management",
    category: "collaboration",
    requiredTier: "professional",
  },
  team_collaboration: {
    key: "team_collaboration",
    name: "Team Collaboration",
    description: "Team workspaces, shared projects, and collaboration tools",
    category: "collaboration",
    requiredTier: "starter",
  },
  comment_system: {
    key: "comment_system",
    name: "Comment System",
    description: "Commenting and feedback on campaigns and content",
    category: "collaboration",
    requiredTier: "starter",
  },
  task_assignment: {
    key: "task_assignment",
    name: "Task Assignment",
    description: "Assign tasks and track progress across team members",
    category: "team_management",
    requiredTier: "professional",
  },

  // Reporting & Analytics
  budget_tracking: {
    key: "budget_tracking",
    name: "Budget Tracking",
    description: "Campaign budget management and spend tracking",
    category: "reporting",
    requiredTier: "professional",
  },
  roi_analytics: {
    key: "roi_analytics",
    name: "ROI Analytics",
    description: "Return on investment tracking and analysis",
    category: "reporting",
    requiredTier: "professional",
  },
  custom_reports: {
    key: "custom_reports",
    name: "Custom Reports",
    description: "Create custom reports and automated report delivery",
    category: "reporting",
    requiredTier: "enterprise",
  },

  // Data & API Features
  data_export: {
    key: "data_export",
    name: "Data Export",
    description: "Export data in various formats (CSV, Excel, PDF)",
    category: "data_export",
    requiredTier: "professional",
  },
  api_access: {
    key: "api_access",
    name: "API Access",
    description: "REST API access for custom integrations",
    category: "api_access",
    requiredTier: "enterprise",
    usageLimit: {
      type: "requests",
      limit: 100000,
      period: "month",
    },
  },
  webhook_support: {
    key: "webhook_support",
    name: "Webhook Support",
    description: "Real-time webhooks for external system integration",
    category: "api_access",
    requiredTier: "enterprise",
  },

  // Security & Enterprise Features
  sso_integration: {
    key: "sso_integration",
    name: "SSO Integration",
    description: "Single Sign-On with SAML/OAuth providers",
    category: "sso",
    requiredTier: "enterprise",
  },
  audit_logging: {
    key: "audit_logging",
    name: "Audit Logging",
    description: "Comprehensive audit logs and compliance reporting",
    category: "audit_logs",
    requiredTier: "enterprise",
  },
  advanced_permissions: {
    key: "advanced_permissions",
    name: "Advanced Permissions",
    description: "Granular role-based permissions and access control",
    category: "team_management",
    requiredTier: "enterprise",
  },

  // Support Features
  priority_support: {
    key: "priority_support",
    name: "Priority Support",
    description: "Priority email support with faster response times",
    category: "support",
    requiredTier: "professional",
  },
  dedicated_support: {
    key: "dedicated_support",
    name: "Dedicated Support",
    description: "Dedicated account manager and phone support",
    category: "support",
    requiredTier: "ultimate",
  },

  // Customization Features
  white_labeling: {
    key: "white_labeling",
    name: "White Labeling",
    description: "Remove branding and customize with your own",
    category: "white_label",
    requiredTier: "ultimate",
  },
  unlimited_users: {
    key: "unlimited_users",
    name: "Unlimited Users",
    description: "No limit on team member accounts",
    category: "team_management",
    requiredTier: "ultimate",
  },

  // Advanced Analytics Features
  advanced_analytics: {
    key: "advanced_analytics",
    name: "Advanced Analytics",
    description: "Advanced data analysis and machine learning insights",
    category: "advanced_analytics",
    requiredTier: "enterprise",
    dependencies: ["real_time_analytics", "historical_analytics"],
  },
};

// Tier Configurations
export const TIER_CONFIGURATIONS: Record<SubscriptionTier, TierConfiguration> =
  {
    free: {
      tier: "free",
      name: "Free",
      description: "Basic features to get started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ["basic_dashboard", "team_collaboration", "comment_system"],
      limits: {
        maxUsers: 2,
        maxProjects: 1,
        maxWorkflows: 0,
        apiCallsPerMonth: 0,
        storageGB: 1,
        supportLevel: "community",
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
        "content_calendar",
        "team_collaboration",
        "comment_system",
      ],
      limits: {
        maxUsers: 5,
        maxProjects: 3,
        maxWorkflows: 10,
        apiCallsPerMonth: 1000,
        storageGB: 10,
        supportLevel: "email",
      },
    },

    professional: {
      tier: "professional",
      name: "Professional",
      description: "Advanced features for growing teams",
      monthlyPrice: 149,
      yearlyPrice: 1490,
      popular: true,
      features: [
        "basic_dashboard",
        "advanced_dashboard",
        "executive_dashboard",
        "clickup_integration",
        "blotato_integration",
        "n8n_workflows",
        "ai_chatbot",
        "ai_content_generation",
        "real_time_analytics",
        "historical_analytics",
        "ab_testing",
        "content_calendar",
        "social_media_scheduling",
        "approval_workflows",
        "team_collaboration",
        "comment_system",
        "task_assignment",
        "budget_tracking",
        "roi_analytics",
        "data_export",
        "priority_support",
      ],
      limits: {
        maxUsers: 25,
        maxProjects: 10,
        maxWorkflows: 100,
        apiCallsPerMonth: 10000,
        storageGB: 100,
        supportLevel: "priority",
      },
      customization: {
        brandingRemoval: false,
        customDomain: false,
        advancedSecurity: true,
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
        "blotato_integration",
        "n8n_workflows",
        "ai_chatbot",
        "ai_content_generation",
        "ai_optimization",
        "real_time_analytics",
        "historical_analytics",
        "predictive_analytics",
        "ab_testing",
        "content_calendar",
        "social_media_scheduling",
        "approval_workflows",
        "team_collaboration",
        "comment_system",
        "task_assignment",
        "budget_tracking",
        "roi_analytics",
        "custom_reports",
        "data_export",
        "api_access",
        "webhook_support",
        "sso_integration",
        "audit_logging",
        "advanced_permissions",
        "priority_support",
      ],
      limits: {
        maxUsers: 100,
        maxProjects: 50,
        maxWorkflows: 500,
        apiCallsPerMonth: 100000,
        storageGB: 1000,
        supportLevel: "priority",
      },
      customization: {
        brandingRemoval: true,
        customDomain: true,
        advancedSecurity: true,
      },
    },

    ultimate: {
      tier: "ultimate",
      name: "Ultimate",
      description: "White-label solution with unlimited everything",
      monthlyPrice: 999,
      yearlyPrice: 9990,
      features: Object.keys(FEATURE_REGISTRY) as FeatureKey[], // All features
      limits: {
        maxUsers: -1, // Unlimited
        maxProjects: -1, // Unlimited
        maxWorkflows: -1, // Unlimited
        apiCallsPerMonth: -1, // Unlimited
        storageGB: -1, // Unlimited
        supportLevel: "dedicated",
      },
      customization: {
        brandingRemoval: true,
        customDomain: true,
        advancedSecurity: true,
      },
    },
  };

/**
 * Access Tier Service
 * Manages subscription-based feature access control
 */
export class AccessTierService {
  private rbacService: RBACService;
  private userTierCache = new Map<string, SubscriptionTier>();

  constructor() {
    this.rbacService = new RBACService();
  }

  /**
   * Get user's current subscription tier
   */
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    // Check cache first
    if (this.userTierCache.has(userId)) {
      return this.userTierCache.get(userId)!;
    }

    try {
      const userRoles = await this.rbacService.getUserRoles(userId);
      if (userRoles.length === 0) {
        return "free";
      }

      const highestRole = await this.rbacService.getUserHighestRole(userId);

      // Map roles to tiers (temporary logic)
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

      const tier = roleTierMap[highestRole || "user"] || "free";
      this.userTierCache.set(userId, tier);
      return tier;
    } catch (error) {
      console.error("Error getting user tier:", error);
      return "free";
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(
    userId: string,
    feature: FeatureKey
  ): Promise<boolean> {
    try {
      const userTier = await this.getUserTier(userId);
      const featureDefinition = FEATURE_REGISTRY[feature];

      if (!featureDefinition) {
        return false;
      }

      // Check tier requirement
      const hasRequiredTier =
        this.compareTiers(userTier, featureDefinition.requiredTier) >= 0;
      if (!hasRequiredTier) {
        return false;
      }

      // Check role requirement if specified
      if (featureDefinition.requiredRole) {
        const hasRequiredRole = await this.rbacService.hasRole(
          userId,
          featureDefinition.requiredRole as any
        );
        if (!hasRequiredRole) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking feature access:", error);
      return false;
    }
  }

  /**
   * Compare two subscription tiers
   */
  private compareTiers(
    tier1: SubscriptionTier,
    tier2: SubscriptionTier
  ): number {
    const tierOrder: Record<SubscriptionTier, number> = {
      free: 0,
      starter: 1,
      professional: 2,
      enterprise: 3,
      ultimate: 4,
    };

    return tierOrder[tier1] - tierOrder[tier2];
  }

  /**
   * Public method to compare tiers (for hook usage)
   */
  compareTiers(tier1: SubscriptionTier, tier2: SubscriptionTier): number {
    return this.compareTiers(tier1, tier2);
  }

  /**
   * Get feature definition
   */
  getFeatureDefinition(feature: FeatureKey): FeatureDefinition | undefined {
    return FEATURE_REGISTRY[feature];
  }

  /**
   * Clear user tier cache
   */
  clearUserCache(userId?: string): void {
    if (userId) {
      this.userTierCache.delete(userId);
    } else {
      this.userTierCache.clear();
    }
  }
}

// Export singleton instance
export const accessTierService = new AccessTierService();
