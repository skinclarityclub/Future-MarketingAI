"use client";

import { createClient } from "@/lib/supabase/client";
import {
  AccessTierService,
  SubscriptionTier,
  TIER_CONFIGURATIONS,
} from "@/lib/rbac/access-tier-service";
import { UsageTrackingService } from "@/lib/usage-tracking/usage-tracking-service";
import { trackPurchase } from "@/lib/analytics/google-analytics";

// Subscription Status Types
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type PaymentProvider = "stripe" | "paddle" | "lemonsqueezy" | "manual";
export type BillingInterval = "monthly" | "yearly" | "lifetime";

// Subscription Interfaces
export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  provider: PaymentProvider;

  // Pricing
  amount: number;
  currency: string;

  // Lifecycle dates
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAt?: Date;
  canceledAt?: Date;

  // Provider-specific data
  providerSubscriptionId?: string;
  providerCustomerId?: string;

  // Metadata
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionChangeRequest {
  targetTier: SubscriptionTier;
  billingInterval?: BillingInterval;
  effectiveDate?: Date;
  prorationBehavior?: "create_prorations" | "none" | "always_invoice";
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank_account" | "paypal" | "crypto";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  metadata?: Record<string, any>;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  userId: string;

  // Invoice details
  invoiceNumber: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";

  // Financial details
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;

  // Line items
  lineItems: InvoiceLineItem[];

  // Dates
  invoiceDate: Date;
  dueDate: Date;
  paidAt?: Date;

  // Documents
  invoicePdf?: string;
  hostedInvoiceUrl?: string;

  // Provider data
  providerInvoiceId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  periodStart?: Date;
  periodEnd?: Date;
  metadata?: Record<string, any>;
}

export interface SubscriptionAnalytics {
  // Revenue metrics
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;

  // Customer metrics
  totalSubscribers: number;
  activeSubscribers: number;
  trialSubscribers: number;
  churnedSubscribers: number;

  // Conversion metrics
  trialToActiveRate: number;
  upgradRate: number;
  downgradRate: number;
  churnRate: number;

  // Tier distribution
  tierDistribution: Record<SubscriptionTier, number>;

  // Period
  periodStart: Date;
  periodEnd: Date;
}

export interface UpgradeQuote {
  currentTier: SubscriptionTier;
  targetTier: SubscriptionTier;
  billingInterval: BillingInterval;

  // Pricing breakdown
  currentPeriodCredit: number;
  newTierProration: number;
  immediateCharge: number;
  nextBillingAmount: number;

  // Effective dates
  effectiveDate: Date;
  nextBillingDate: Date;

  // Feature changes
  addedFeatures: string[];
  removedFeatures: string[];
  limitChanges: Record<string, { from: number; to: number }>;
}

/**
 * Comprehensive Subscription Management Service
 * Handles billing, upgrades, payment processing, and lifecycle management
 */
export class SubscriptionService {
  private static instance: SubscriptionService;
  private supabase = createClient();
  private accessTierService = new AccessTierService();
  private usageTrackingService = new UsageTrackingService();

  // Cache for subscription data
  private subscriptionCache = new Map<string, Subscription>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      // Check cache first
      if (this.subscriptionCache.has(userId)) {
        return this.subscriptionCache.get(userId) || null;
      }

      const { data, error } = await this.supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        // Return default free tier subscription
        const freeSubscription: Subscription = {
          id: `free_${userId}`,
          userId,
          tier: "free",
          status: "active",
          billingInterval: "monthly",
          provider: "manual",
          amount: 0,
          currency: "EUR",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.subscriptionCache.set(userId, freeSubscription);
        return freeSubscription;
      }

      const subscription: Subscription = {
        id: data.id,
        userId: data.user_id,
        tier: data.tier,
        status: data.status,
        billingInterval: data.billing_interval,
        provider: data.provider,
        amount: data.amount,
        currency: data.currency,
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end),
        trialStart: data.trial_start ? new Date(data.trial_start) : undefined,
        trialEnd: data.trial_end ? new Date(data.trial_end) : undefined,
        cancelAt: data.cancel_at ? new Date(data.cancel_at) : undefined,
        canceledAt: data.canceled_at ? new Date(data.canceled_at) : undefined,
        providerSubscriptionId: data.provider_subscription_id,
        providerCustomerId: data.provider_customer_id,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      this.subscriptionCache.set(userId, subscription);
      return subscription;
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      return null;
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    tier: SubscriptionTier,
    billingInterval: BillingInterval,
    paymentMethodId?: string,
    metadata?: Record<string, any>
  ): Promise<Subscription> {
    try {
      const tierConfig = TIER_CONFIGURATIONS[tier];
      const amount =
        billingInterval === "yearly"
          ? tierConfig.yearlyPrice
          : tierConfig.monthlyPrice;

      const subscriptionData = {
        user_id: userId,
        tier,
        status: "active" as SubscriptionStatus,
        billing_interval: billingInterval,
        provider: "stripe" as PaymentProvider,
        amount,
        currency: "EUR",
        current_period_start: new Date().toISOString(),
        current_period_end:
          this.calculatePeriodEnd(billingInterval).toISOString(),
        metadata: metadata || {},
      };

      const { data, error } = await this.supabase
        .from("user_subscriptions")
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;

      const subscription: Subscription = {
        id: data.id,
        userId: data.user_id,
        tier: data.tier,
        status: data.status,
        billingInterval: data.billing_interval,
        provider: data.provider,
        amount: data.amount,
        currency: data.currency,
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end),
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      // Clear cache and update
      this.subscriptionCache.delete(userId);
      this.subscriptionCache.set(userId, subscription);

      // Track analytics
      trackPurchase(data.id, tier, amount);

      return subscription;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw new Error("Failed to create subscription");
    }
  }

  /**
   * Upgrade/downgrade subscription
   */
  async changeSubscription(
    userId: string,
    changeRequest: SubscriptionChangeRequest
  ): Promise<{ subscription: Subscription; quote: UpgradeQuote }> {
    try {
      const currentSubscription = await this.getUserSubscription(userId);
      if (!currentSubscription) {
        throw new Error("No active subscription found");
      }

      // Generate upgrade quote
      const quote = await this.generateUpgradeQuote(
        currentSubscription,
        changeRequest
      );

      // Update subscription
      const updatedData = {
        tier: changeRequest.targetTier,
        billing_interval:
          changeRequest.billingInterval || currentSubscription.billingInterval,
        amount: quote.nextBillingAmount,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("user_subscriptions")
        .update(updatedData)
        .eq("id", currentSubscription.id)
        .select()
        .single();

      if (error) throw error;

      const updatedSubscription: Subscription = {
        ...currentSubscription,
        tier: data.tier,
        billingInterval: data.billing_interval,
        amount: data.amount,
        updatedAt: new Date(data.updated_at),
      };

      // Clear cache
      this.subscriptionCache.delete(userId);

      // Track analytics
      if (
        this.compareTiers(changeRequest.targetTier, currentSubscription.tier) >
        0
      ) {
        trackPurchase(
          `upgrade_${data.id}`,
          changeRequest.targetTier,
          quote.immediateCharge
        );
      }

      return { subscription: updatedSubscription, quote };
    } catch (error) {
      console.error("Error changing subscription:", error);
      throw new Error("Failed to change subscription");
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    userId: string,
    cancelAt?: Date,
    reason?: string
  ): Promise<Subscription> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        throw new Error("No active subscription found");
      }

      const cancelDate = cancelAt || subscription.currentPeriodEnd;

      const { data, error } = await this.supabase
        .from("user_subscriptions")
        .update({
          cancel_at: cancelDate.toISOString(),
          status: cancelAt && cancelAt <= new Date() ? "canceled" : "active",
          metadata: {
            ...subscription.metadata,
            cancellation_reason: reason,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id)
        .select()
        .single();

      if (error) throw error;

      const canceledSubscription: Subscription = {
        ...subscription,
        status: data.status,
        cancelAt: new Date(data.cancel_at),
        metadata: data.metadata,
        updatedAt: new Date(data.updated_at),
      };

      // Clear cache
      this.subscriptionCache.delete(userId);

      return canceledSubscription;
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  }

  /**
   * Generate upgrade quote
   */
  async generateUpgradeQuote(
    currentSubscription: Subscription,
    changeRequest: SubscriptionChangeRequest
  ): Promise<UpgradeQuote> {
    const currentTierConfig = TIER_CONFIGURATIONS[currentSubscription.tier];
    const targetTierConfig = TIER_CONFIGURATIONS[changeRequest.targetTier];

    const billingInterval =
      changeRequest.billingInterval || currentSubscription.billingInterval;

    const currentAmount =
      billingInterval === "yearly"
        ? currentTierConfig.yearlyPrice
        : currentTierConfig.monthlyPrice;

    const targetAmount =
      billingInterval === "yearly"
        ? targetTierConfig.yearlyPrice
        : targetTierConfig.monthlyPrice;

    // Calculate proration
    const now = new Date();
    const periodLength =
      currentSubscription.currentPeriodEnd.getTime() -
      currentSubscription.currentPeriodStart.getTime();
    const timeRemaining =
      currentSubscription.currentPeriodEnd.getTime() - now.getTime();
    const prorationFactor = timeRemaining / periodLength;

    const currentPeriodCredit = Math.round(currentAmount * prorationFactor);
    const newTierProration = Math.round(targetAmount * prorationFactor);
    const immediateCharge = Math.max(0, newTierProration - currentPeriodCredit);

    // Get feature differences
    const addedFeatures = targetTierConfig.features.filter(
      f => !currentTierConfig.features.includes(f)
    );
    const removedFeatures = currentTierConfig.features.filter(
      f => !targetTierConfig.features.includes(f)
    );

    // Calculate limit changes
    const limitChanges: Record<string, { from: number; to: number }> = {};
    Object.keys(targetTierConfig.limits).forEach(key => {
      const currentLimit = (currentTierConfig.limits as any)[key];
      const targetLimit = (targetTierConfig.limits as any)[key];
      if (currentLimit !== targetLimit) {
        limitChanges[key] = { from: currentLimit, to: targetLimit };
      }
    });

    return {
      currentTier: currentSubscription.tier,
      targetTier: changeRequest.targetTier,
      billingInterval,
      currentPeriodCredit,
      newTierProration,
      immediateCharge,
      nextBillingAmount: targetAmount,
      effectiveDate: changeRequest.effectiveDate || now,
      nextBillingDate: currentSubscription.currentPeriodEnd,
      addedFeatures,
      removedFeatures,
      limitChanges,
    };
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<SubscriptionAnalytics> {
    try {
      const { data: subscriptions, error } = await this.supabase
        .from("user_subscriptions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw error;

      // Calculate metrics
      const activeSubscriptions = subscriptions.filter(
        s => s.status === "active"
      );
      const trialSubscriptions = subscriptions.filter(
        s => s.status === "trialing"
      );
      const churnedSubscriptions = subscriptions.filter(
        s => s.status === "canceled"
      );

      const mrr = activeSubscriptions.reduce((sum, sub) => {
        const monthlyAmount =
          sub.billing_interval === "yearly" ? sub.amount / 12 : sub.amount;
        return sum + monthlyAmount;
      }, 0);

      const tierDistribution: Record<SubscriptionTier, number> = {
        free: 0,
        starter: 0,
        professional: 0,
        enterprise: 0,
        ultimate: 0,
      };

      activeSubscriptions.forEach(sub => {
        tierDistribution[sub.tier as SubscriptionTier]++;
      });

      return {
        monthlyRecurringRevenue: mrr,
        annualRecurringRevenue: mrr * 12,
        averageRevenuePerUser:
          activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0,
        totalSubscribers: subscriptions.length,
        activeSubscribers: activeSubscriptions.length,
        trialSubscribers: trialSubscriptions.length,
        churnedSubscribers: churnedSubscriptions.length,
        trialToActiveRate: 0, // Would need historical data
        upgradRate: 0, // Would need upgrade tracking
        downgradRate: 0, // Would need downgrade tracking
        churnRate:
          churnedSubscriptions.length / Math.max(subscriptions.length, 1),
        tierDistribution,
        periodStart: startDate,
        periodEnd: endDate,
      };
    } catch (error) {
      console.error("Error getting subscription analytics:", error);
      throw new Error("Failed to get subscription analytics");
    }
  }

  /**
   * Handle webhook events from payment providers
   */
  async handleWebhook(
    provider: PaymentProvider,
    eventType: string,
    eventData: any
  ): Promise<void> {
    try {
      switch (provider) {
        case "stripe":
          await this.handleStripeWebhook(eventType, eventData);
          break;
        default:
          console.warn(`Unsupported webhook provider: ${provider}`);
      }
    } catch (error) {
      console.error("Error handling webhook:", error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  private async handleStripeWebhook(
    eventType: string,
    eventData: any
  ): Promise<void> {
    switch (eventType) {
      case "customer.subscription.updated":
        await this.syncSubscriptionFromStripe(eventData);
        break;
      case "customer.subscription.deleted":
        await this.markSubscriptionCanceled(eventData.id);
        break;
      case "invoice.payment_succeeded":
        await this.markInvoicePaid(eventData);
        break;
      case "invoice.payment_failed":
        await this.handleFailedPayment(eventData);
        break;
      default:
        console.log(`Unhandled Stripe event: ${eventType}`);
    }
  }

  /**
   * Sync subscription data from Stripe
   */
  private async syncSubscriptionFromStripe(
    stripeSubscription: any
  ): Promise<void> {
    const { data, error } = await this.supabase
      .from("user_subscriptions")
      .update({
        status: stripeSubscription.status,
        current_period_start: new Date(
          stripeSubscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          stripeSubscription.current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", stripeSubscription.id);

    if (error) {
      console.error("Error syncing subscription from Stripe:", error);
    }
  }

  /**
   * Mark subscription as canceled
   */
  private async markSubscriptionCanceled(
    providerSubscriptionId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from("user_subscriptions")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", providerSubscriptionId);

    if (error) {
      console.error("Error marking subscription as canceled:", error);
    }
  }

  /**
   * Mark invoice as paid
   */
  private async markInvoicePaid(stripeInvoice: any): Promise<void> {
    // Implementation would update invoice status in database
    console.log("Invoice paid:", stripeInvoice.id);
  }

  /**
   * Handle failed payment
   */
  private async handleFailedPayment(stripeInvoice: any): Promise<void> {
    // Implementation would handle failed payment logic
    console.log("Payment failed:", stripeInvoice.id);
  }

  /**
   * Calculate period end date
   */
  private calculatePeriodEnd(billingInterval: BillingInterval): Date {
    const now = new Date();
    switch (billingInterval) {
      case "monthly":
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case "yearly":
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      case "lifetime":
        return new Date(now.getFullYear() + 100, now.getMonth(), now.getDate());
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }

  /**
   * Compare subscription tiers
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
   * Clear subscription cache
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.subscriptionCache.delete(userId);
    } else {
      this.subscriptionCache.clear();
    }
  }
}

// Export singleton instance
export const subscriptionService = SubscriptionService.getInstance();
