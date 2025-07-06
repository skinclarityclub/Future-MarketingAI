"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  accessTierService,
  FeatureKey,
  SubscriptionTier,
} from "@/lib/rbac/access-tier-service";

// TODO: Replace with actual auth provider when implemented
const useAuth = () => ({
  user: { id: "demo-user-123" }, // Mock user for now
});

export interface AccessTierHookResult {
  // Current user tier
  currentTier: SubscriptionTier | null;

  // Loading states
  isLoading: boolean;

  // Feature access methods
  hasFeature: (feature: FeatureKey) => boolean;
  checkFeatureAccess: (feature: FeatureKey) => Promise<boolean>;

  // Upgrade information
  requiresUpgrade: (feature: FeatureKey) => boolean;
  getUpgradeInfo: (feature: FeatureKey) => {
    required: boolean;
    targetTier: SubscriptionTier;
  };

  // Cached feature access
  featureAccess: Record<FeatureKey, boolean>;

  // Refresh methods
  refreshTier: () => Promise<void>;
  refreshFeatureAccess: () => Promise<void>;
}

/**
 * React hook for managing tiered access control
 */
export function useAccessTier(): AccessTierHookResult {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featureAccess, setFeatureAccess] = useState<
    Record<FeatureKey, boolean>
  >({} as Record<FeatureKey, boolean>);

  // Refresh user tier
  const refreshTier = useCallback(async () => {
    if (!user?.id) {
      setCurrentTier(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Temporarily using "professional" tier for demo until RBAC infinite recursion is fixed
      // const tier = await accessTierService.getUserTier(user.id);
      const tier: SubscriptionTier = "professional"; // Demo tier to avoid RBAC recursion

      console.log("Using demo tier for user:", user.id, "->", tier);
      setCurrentTier(tier);
    } catch (error) {
      console.error("Error fetching user tier:", error);
      setCurrentTier("free");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Refresh feature access cache
  const refreshFeatureAccess = useCallback(async () => {
    if (!user?.id) {
      setFeatureAccess({} as Record<FeatureKey, boolean>);
      return;
    }

    try {
      // TODO: Temporarily grant all features for demo until RBAC is fixed
      const allFeatures: FeatureKey[] = [
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
        "priority_support",
        "dedicated_support",
        "white_labeling",
        "unlimited_users",
        "advanced_permissions",
        "advanced_analytics",
      ];

      // Grant all features for demo (professional tier access)
      const accessMap = Object.fromEntries(
        allFeatures.map(feature => [feature, true])
      ) as Record<FeatureKey, boolean>;

      console.log("Demo: Granting all features for professional tier");
      setFeatureAccess(accessMap);
    } catch (error) {
      console.error("Error refreshing feature access:", error);
    }
  }, [user?.id]);

  // Check if user has access to a feature (from cache)
  const hasFeature = useCallback(
    (feature: FeatureKey): boolean => {
      return featureAccess[feature] ?? false;
    },
    [featureAccess]
  );

  // Check feature access with fresh API call
  const checkFeatureAccess = useCallback(
    async (feature: FeatureKey): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        // TODO: Temporarily grant all features for demo until RBAC is fixed
        const hasAccess = true; // Grant all for professional tier demo

        // Update cache
        setFeatureAccess(prev => ({
          ...prev,
          [feature]: hasAccess,
        }));

        return hasAccess;
      } catch (error) {
        console.error(`Error checking access for feature ${feature}:`, error);
        return false;
      }
    },
    [user?.id]
  );

  // Check if feature requires upgrade
  const requiresUpgrade = useCallback(
    (feature: FeatureKey): boolean => {
      // TODO: Temporarily return false for demo until RBAC is fixed
      // Professional tier has access to all features
      return false;
    },
    [currentTier]
  );

  // Get upgrade information for a feature
  const getUpgradeInfo = useCallback(
    (feature: FeatureKey) => {
      // TODO: Temporarily return no upgrade required for demo
      return {
        required: false,
        targetTier: "professional" as SubscriptionTier,
      };
    },
    [requiresUpgrade]
  );

  // Initialize on mount and when user changes
  useEffect(() => {
    refreshTier();
  }, [refreshTier]);

  // Refresh feature access when tier changes
  useEffect(() => {
    if (currentTier !== null) {
      refreshFeatureAccess();
    }
  }, [currentTier, refreshFeatureAccess]);

  return {
    currentTier,
    isLoading,
    hasFeature,
    checkFeatureAccess,
    requiresUpgrade,
    getUpgradeInfo,
    featureAccess,
    refreshTier,
    refreshFeatureAccess,
  };
}

/**
 * HOC for feature-gated components
 */
export function withFeatureAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredFeature: FeatureKey,
  fallbackComponent?: React.ComponentType<any>
) {
  return function FeatureGatedComponent(props: P) {
    const { hasFeature, isLoading } = useAccessTier();

    if (isLoading) {
      return <div className="animate-pulse bg-gray-200 rounded h-20"></div>;
    }

    if (!hasFeature(requiredFeature)) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent;
        return <FallbackComponent feature={requiredFeature} />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Component for feature access gates
 */
export interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = false,
}: FeatureGateProps) {
  const { hasFeature, isLoading, requiresUpgrade, getUpgradeInfo } =
    useAccessTier();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-20"></div>;
  }

  if (!hasFeature(feature)) {
    if (showUpgradePrompt && requiresUpgrade(feature)) {
      const upgradeInfo = getUpgradeInfo(feature);
      return (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <div className="text-gray-600 mb-2">
            Deze functie vereist een upgrade naar {upgradeInfo.targetTier}
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Upgrade Nu
          </button>
        </div>
      );
    }

    return <>{fallback}</>;
  }

  return <>{children}</>;
}
