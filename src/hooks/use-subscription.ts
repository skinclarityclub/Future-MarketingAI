"use client";

import { useState, useEffect, useCallback } from "react";
import {
  subscriptionService,
  Subscription,
  SubscriptionChangeRequest,
  UpgradeQuote,
} from "@/lib/subscription/subscription-service";
import { SubscriptionTier } from "@/lib/rbac/access-tier-service";

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  isUpgrading: boolean;
  isCanceling: boolean;
}

interface UseSubscriptionReturn extends SubscriptionState {
  // Actions
  refreshSubscription: () => Promise<void>;
  upgradeSubscription: (
    targetTier: SubscriptionTier,
    billingInterval?: "monthly" | "yearly"
  ) => Promise<{ subscription: Subscription; quote: UpgradeQuote } | null>;
  cancelSubscription: (
    cancelAt?: Date,
    reason?: string
  ) => Promise<Subscription | null>;
  generateQuote: (
    targetTier: SubscriptionTier,
    billingInterval?: "monthly" | "yearly"
  ) => Promise<UpgradeQuote | null>;

  // Utilities
  canAccessFeature: (featureKey: string) => boolean;
  isTrialing: boolean;
  daysUntilRenewal: number;
  canUpgrade: boolean;
  canDowngrade: boolean;
}

/**
 * Hook for managing user subscriptions
 */
export function useSubscription(userId: string): UseSubscriptionReturn {
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    isLoading: true,
    error: null,
    isUpgrading: false,
    isCanceling: false,
  });

  /**
   * Refresh subscription data
   */
  const refreshSubscription = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const subscription =
        await subscriptionService.getUserSubscription(userId);
      setState(prev => ({
        ...prev,
        subscription,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load subscription",
        isLoading: false,
      }));
    }
  }, [userId]);

  /**
   * Upgrade/change subscription
   */
  const upgradeSubscription = useCallback(
    async (
      targetTier: SubscriptionTier,
      billingInterval: "monthly" | "yearly" = "monthly"
    ) => {
      if (!state.subscription) return null;

      try {
        setState(prev => ({ ...prev, isUpgrading: true, error: null }));

        const changeRequest: SubscriptionChangeRequest = {
          targetTier,
          billingInterval,
        };

        const result = await subscriptionService.changeSubscription(
          userId,
          changeRequest
        );

        setState(prev => ({
          ...prev,
          subscription: result.subscription,
          isUpgrading: false,
        }));

        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to upgrade subscription",
          isUpgrading: false,
        }));
        return null;
      }
    },
    [userId, state.subscription]
  );

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(
    async (cancelAt?: Date, reason?: string) => {
      try {
        setState(prev => ({ ...prev, isCanceling: true, error: null }));

        const canceledSubscription =
          await subscriptionService.cancelSubscription(
            userId,
            cancelAt,
            reason
          );

        setState(prev => ({
          ...prev,
          subscription: canceledSubscription,
          isCanceling: false,
        }));

        return canceledSubscription;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to cancel subscription",
          isCanceling: false,
        }));
        return null;
      }
    },
    [userId]
  );

  /**
   * Generate upgrade quote
   */
  const generateQuote = useCallback(
    async (
      targetTier: SubscriptionTier,
      billingInterval: "monthly" | "yearly" = "monthly"
    ) => {
      if (!state.subscription) return null;

      try {
        const changeRequest: SubscriptionChangeRequest = {
          targetTier,
          billingInterval,
        };

        return await subscriptionService.generateUpgradeQuote(
          state.subscription,
          changeRequest
        );
      } catch (error) {
        console.error("Failed to generate quote:", error);
        return null;
      }
    },
    [state.subscription]
  );

  /**
   * Check if user can access a specific feature
   */
  const canAccessFeature = useCallback(
    (featureKey: string): boolean => {
      if (!state.subscription) return false;

      // This would integrate with the feature flag service
      // For now, using tier-based access
      const tierOrder = [
        "free",
        "starter",
        "professional",
        "enterprise",
        "ultimate",
      ];
      const currentTierIndex = tierOrder.indexOf(state.subscription.tier);

      // Basic feature access logic - would be more sophisticated in practice
      const featureTierRequirements: Record<string, number> = {
        basic_dashboard: 0, // free
        advanced_dashboard: 1, // starter
        ai_chatbot: 1, // starter
        ai_content_generation: 2, // professional
        api_access: 3, // enterprise
        white_label: 4, // ultimate
      };

      const requiredTierIndex = featureTierRequirements[featureKey] ?? 4;
      return currentTierIndex >= requiredTierIndex;
    },
    [state.subscription]
  );

  // Computed properties
  const isTrialing = state.subscription?.status === "trialing";

  const daysUntilRenewal = state.subscription
    ? Math.ceil(
        (state.subscription.currentPeriodEnd.getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const canUpgrade =
    state.subscription?.tier !== "ultimate" &&
    state.subscription?.status === "active";
  const canDowngrade =
    state.subscription?.tier !== "free" &&
    state.subscription?.status === "active";

  // Load subscription on mount
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return {
    ...state,
    refreshSubscription,
    upgradeSubscription,
    cancelSubscription,
    generateQuote,
    canAccessFeature,
    isTrialing,
    daysUntilRenewal,
    canUpgrade,
    canDowngrade,
  };
}

/**
 * Hook for subscription analytics (admin only)
 */
export function useSubscriptionAnalytics(startDate: Date, endDate: Date) {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await subscriptionService.getSubscriptionAnalytics(
          startDate,
          endDate
        );
        setAnalytics(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [startDate, endDate]);

  return { analytics, isLoading, error };
}

/**
 * Hook for checking subscription requirements
 */
export function useSubscriptionGate(
  requiredTier: SubscriptionTier,
  userId: string
) {
  const { subscription, isLoading } = useSubscription(userId);

  const hasAccess =
    subscription && !isLoading
      ? compareTiers(subscription.tier, requiredTier) >= 0
      : false;

  return {
    hasAccess,
    currentTier: subscription?.tier || "free",
    requiredTier,
    isLoading,
  };
}

// Helper function to compare tiers
function compareTiers(
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
