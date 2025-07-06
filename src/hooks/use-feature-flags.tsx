"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  featureFlagService,
  FeatureFlag,
  FeatureFlagEvaluationContext,
  FeatureFlagEvaluationResult,
} from "@/lib/feature-flags/feature-flag-service";
import { FeatureKey, SubscriptionTier } from "@/lib/rbac/access-tier-service";
import { useAccessTier } from "./use-access-tier";

// TODO: Replace with actual auth provider when implemented
const useAuth = () => ({
  user: { id: "demo-user-123" }, // Mock user for now
});

export interface FeatureFlagHookResult {
  // Feature flag evaluation
  isFeatureEnabled: (
    feature: FeatureKey,
    context?: Partial<FeatureFlagEvaluationContext>
  ) => Promise<boolean>;
  isFeatureEnabledSync: (feature: FeatureKey) => boolean;
  getFeatureEvaluation: (
    feature: FeatureKey,
    context?: Partial<FeatureFlagEvaluationContext>
  ) => Promise<FeatureFlagEvaluationResult>;

  // Feature flags management
  allFeatureFlags: FeatureFlag[];
  getFeatureFlag: (key: FeatureKey) => FeatureFlag | undefined;

  // Cache management
  featureCache: Record<FeatureKey, FeatureFlagEvaluationResult>;
  refreshFeatureCache: () => Promise<void>;

  // State
  isLoading: boolean;
  error: string | null;

  // Admin functions (if user has permission)
  updateFeatureFlag: (
    key: FeatureKey,
    updates: Partial<FeatureFlag>
  ) => Promise<void>;
  toggleFeatureFlag: (key: FeatureKey) => Promise<void>;
  updateRolloutPercentage: (
    key: FeatureKey,
    percentage: number
  ) => Promise<void>;
}

/**
 * Hook for integrated feature flag and access tier management
 */
export function useFeatureFlags(): FeatureFlagHookResult {
  const { user } = useAuth();
  const { currentTier, hasFeature } = useAccessTier();

  const [allFeatureFlags, setAllFeatureFlags] = useState<FeatureFlag[]>([]);
  const [featureCache, setFeatureCache] = useState<
    Record<FeatureKey, FeatureFlagEvaluationResult>
  >({} as Record<FeatureKey, FeatureFlagEvaluationResult>);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get base evaluation context
  const getBaseContext = useCallback(
    (): FeatureFlagEvaluationContext => ({
      userId: user?.id,
      userTier: currentTier || "free",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date(),
    }),
    [user?.id, currentTier]
  );

  // Check if feature is enabled (async)
  const isFeatureEnabled = useCallback(
    async (
      feature: FeatureKey,
      additionalContext?: Partial<FeatureFlagEvaluationContext>
    ): Promise<boolean> => {
      try {
        const context = { ...getBaseContext(), ...additionalContext };
        const result = await featureFlagService.isFeatureEnabled(
          feature,
          context
        );

        // Update cache
        setFeatureCache(prev => ({
          ...prev,
          [feature]: result,
        }));

        return result.enabled;
      } catch (err) {
        console.error(`Error checking feature flag ${feature}:`, err);
        return false;
      }
    },
    [getBaseContext]
  );

  // Check if feature is enabled (sync from cache)
  const isFeatureEnabledSync = useCallback(
    (feature: FeatureKey): boolean => {
      return featureCache[feature]?.enabled ?? false;
    },
    [featureCache]
  );

  // Get detailed feature evaluation
  const getFeatureEvaluation = useCallback(
    async (
      feature: FeatureKey,
      additionalContext?: Partial<FeatureFlagEvaluationContext>
    ): Promise<FeatureFlagEvaluationResult> => {
      const context = { ...getBaseContext(), ...additionalContext };
      const result = await featureFlagService.isFeatureEnabled(
        feature,
        context
      );

      // Update cache
      setFeatureCache(prev => ({
        ...prev,
        [feature]: result,
      }));

      return result;
    },
    [getBaseContext]
  );

  // Get specific feature flag
  const getFeatureFlag = useCallback(
    (key: FeatureKey): FeatureFlag | undefined => {
      return featureFlagService.getFeatureFlag(key);
    },
    []
  );

  // Refresh feature cache
  const refreshFeatureCache = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const context = getBaseContext();
      const flags = featureFlagService.getAllFeatureFlags();
      const cacheUpdates: Record<FeatureKey, FeatureFlagEvaluationResult> =
        {} as Record<FeatureKey, FeatureFlagEvaluationResult>;

      // Evaluate all feature flags
      await Promise.all(
        flags.map(async flag => {
          try {
            const result = await featureFlagService.isFeatureEnabled(
              flag.key,
              context
            );
            cacheUpdates[flag.key] = result;
          } catch (err) {
            console.error(`Error evaluating feature ${flag.key}:`, err);
            cacheUpdates[flag.key] = {
              enabled: false,
              reason: "Evaluation error",
            };
          }
        })
      );

      setFeatureCache(cacheUpdates);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh feature cache"
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getBaseContext]);

  // Update feature flag (admin function)
  const updateFeatureFlag = useCallback(
    async (key: FeatureKey, updates: Partial<FeatureFlag>) => {
      try {
        await featureFlagService.updateFeatureFlag(key, updates);

        // Refresh flags and cache
        setAllFeatureFlags(featureFlagService.getAllFeatureFlags());
        await refreshFeatureCache();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update feature flag"
        );
        throw err;
      }
    },
    [refreshFeatureCache]
  );

  // Toggle feature flag (admin function)
  const toggleFeatureFlag = useCallback(
    async (key: FeatureKey) => {
      const flag = featureFlagService.getFeatureFlag(key);
      if (!flag) {
        throw new Error(`Feature flag ${key} not found`);
      }

      await updateFeatureFlag(key, { enabled: !flag.enabled });
    },
    [updateFeatureFlag]
  );

  // Update rollout percentage (admin function)
  const updateRolloutPercentage = useCallback(
    async (key: FeatureKey, percentage: number) => {
      if (percentage < 0 || percentage > 100) {
        throw new Error("Rollout percentage must be between 0 and 100");
      }

      await updateFeatureFlag(key, { rolloutPercentage: percentage });
    },
    [updateFeatureFlag]
  );

  // Initialize and refresh on mount
  useEffect(() => {
    setAllFeatureFlags(featureFlagService.getAllFeatureFlags());
    if (user?.id) {
      refreshFeatureCache();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, refreshFeatureCache]);

  // Refresh cache when tier changes
  useEffect(() => {
    if (currentTier && user?.id) {
      refreshFeatureCache();
    }
  }, [currentTier, user?.id, refreshFeatureCache]);

  return {
    isFeatureEnabled,
    isFeatureEnabledSync,
    getFeatureEvaluation,
    allFeatureFlags,
    getFeatureFlag,
    featureCache,
    refreshFeatureCache,
    isLoading,
    error,
    updateFeatureFlag,
    toggleFeatureFlag,
    updateRolloutPercentage,
  };
}

/**
 * HOC for feature-gated components
 */
export function withEnhancedFeatureAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredFeature: FeatureKey,
  options?: {
    fallbackComponent?: React.ComponentType<any>;
    showUpgradePrompt?: boolean;
    showFeatureFlagInfo?: boolean;
  }
) {
  return function EnhancedFeatureGatedComponent(props: P) {
    const { isFeatureEnabledSync, isLoading, error } = useFeatureFlags();

    if (isLoading) {
      return <div className="animate-pulse bg-gray-200 rounded h-20"></div>;
    }

    if (error) {
      return (
        <div className="text-red-500">Error loading feature flags: {error}</div>
      );
    }

    if (!isFeatureEnabledSync(requiredFeature)) {
      if (options?.fallbackComponent) {
        const FallbackComponent = options.fallbackComponent;
        return <FallbackComponent feature={requiredFeature} />;
      }

      if (options?.showUpgradePrompt) {
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <div className="text-gray-600 mb-2">
              Deze functie is niet beschikbaar in je huidige plan
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Upgrade Nu
            </button>
          </div>
        );
      }

      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Component for enhanced feature access gates
 */
export interface EnhancedFeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  showFeatureFlagInfo?: boolean;
  loadingComponent?: React.ReactNode;
}

export function EnhancedFeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = false,
  showFeatureFlagInfo = false,
  loadingComponent,
}: EnhancedFeatureGateProps) {
  const { isFeatureEnabledSync, isLoading, error, getFeatureFlag } =
    useFeatureFlags();

  if (isLoading) {
    return (
      loadingComponent || (
        <div className="animate-pulse bg-gray-200 rounded h-20"></div>
      )
    );
  }

  if (error) {
    return (
      <div className="text-red-500">Error loading feature flags: {error}</div>
    );
  }

  if (!isFeatureEnabledSync(feature)) {
    if (showFeatureFlagInfo) {
      const featureFlag = getFeatureFlag(feature);
      return (
        <div className="p-4 border border-orange-300 bg-orange-50 rounded-lg">
          <div className="text-orange-800 mb-2">
            Feature '{feature}' is not enabled
          </div>
          {featureFlag && (
            <div className="text-sm text-orange-600">
              Status: {featureFlag.enabled ? "Enabled" : "Disabled"} | Rollout:{" "}
              {featureFlag.rolloutPercentage}%
            </div>
          )}
        </div>
      );
    }

    if (showUpgradePrompt) {
      return (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <div className="text-gray-600 mb-2">
            Deze functie is niet beschikbaar in je huidige plan
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
