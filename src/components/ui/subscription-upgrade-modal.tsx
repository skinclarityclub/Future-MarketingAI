"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  CreditCard,
  Calendar,
  Calculator,
  DollarSign,
  Shield,
  Users,
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import {
  SubscriptionTier,
  TIER_CONFIGURATIONS,
} from "@/lib/rbac/access-tier-service";
import { useSubscription } from "@/hooks/use-subscription";
import { UpgradeQuote } from "@/lib/subscription/subscription-service";

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentTier?: SubscriptionTier;
  targetTier?: SubscriptionTier;
  onUpgradeComplete?: (newTier: SubscriptionTier) => void;
}

export function SubscriptionUpgradeModal({
  isOpen,
  onClose,
  userId,
  currentTier,
  targetTier,
  onUpgradeComplete,
}: SubscriptionUpgradeModalProps) {
  const { subscription, upgradeSubscription, generateQuote, isUpgrading } =
    useSubscription(userId);

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    targetTier || "professional"
  );
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [quote, setQuote] = useState<UpgradeQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "selection" | "quote" | "payment" | "processing"
  >("selection");

  const tiers: SubscriptionTier[] = [
    "starter",
    "professional",
    "enterprise",
    "ultimate",
  ];
  const activeTier = subscription?.tier || currentTier || "free";

  // Load quote when tier or billing changes
  useEffect(() => {
    if (selectedTier && selectedTier !== activeTier) {
      loadQuote();
    }
  }, [selectedTier, billingInterval]);

  const loadQuote = async () => {
    setIsLoadingQuote(true);
    try {
      const newQuote = await generateQuote(selectedTier, billingInterval);
      setQuote(newQuote);
    } catch (error) {
      console.error("Failed to generate quote:", error);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleUpgrade = async () => {
    setPaymentStep("processing");

    try {
      const result = await upgradeSubscription(selectedTier, billingInterval);

      if (result) {
        onUpgradeComplete?.(selectedTier);
        onClose();
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
      setPaymentStep("payment");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case "starter":
        return <Zap className="h-5 w-5" />;
      case "professional":
        return <Users className="h-5 w-5" />;
      case "enterprise":
        return <Shield className="h-5 w-5" />;
      case "ultimate":
        return <Crown className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getTierGradient = (tier: SubscriptionTier) => {
    switch (tier) {
      case "starter":
        return "from-blue-500 to-blue-600";
      case "professional":
        return "from-purple-500 to-purple-600";
      case "enterprise":
        return "from-indigo-500 to-indigo-600";
      case "ultimate":
        return "from-gradient-to-r from-purple-600 to-pink-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getSavings = (tier: SubscriptionTier) => {
    const config = TIER_CONFIGURATIONS[tier];
    if (!config.yearlyPrice || config.monthlyPrice === 0) return 0;
    return Math.round(
      ((config.monthlyPrice * 12 - config.yearlyPrice) /
        (config.monthlyPrice * 12)) *
        100
    );
  };

  const isCurrentTier = (tier: SubscriptionTier) => tier === activeTier;
  const isUpgradeTier = (tier: SubscriptionTier) => {
    const tierOrder: Record<SubscriptionTier, number> = {
      free: 0,
      starter: 1,
      professional: 2,
      enterprise: 3,
      ultimate: 4,
    };
    return tierOrder[tier] > tierOrder[activeTier];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
            Upgrade Your Subscription
          </DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your needs and start unlocking
            premium features today.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Button
                variant={billingInterval === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingInterval("monthly")}
              >
                Maandelijks
              </Button>
              <Button
                variant={billingInterval === "yearly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingInterval("yearly")}
                className="relative"
              >
                Jaarlijks
                <Badge className="absolute -top-2 -right-2 text-xs bg-green-500">
                  Bespaar tot 17%
                </Badge>
              </Button>
            </div>
          </div>

          {/* Tier Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map(tier => {
              const config = TIER_CONFIGURATIONS[tier];
              const price =
                billingInterval === "yearly"
                  ? config.yearlyPrice
                  : config.monthlyPrice;
              const monthlyPrice =
                billingInterval === "yearly" ? config.yearlyPrice / 12 : price;
              const savings = getSavings(tier);
              const isCurrent = isCurrentTier(tier);
              const canUpgrade = isUpgradeTier(tier);

              return (
                <Card
                  key={tier}
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    selectedTier === tier
                      ? "ring-2 ring-purple-500 shadow-lg"
                      : ""
                  } ${isCurrent ? "opacity-50" : ""}`}
                  onClick={() => !isCurrent && setSelectedTier(tier)}
                >
                  {config.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-600 text-white">
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`mx-auto p-3 rounded-lg bg-gradient-to-r ${getTierGradient(tier)}`}
                    >
                      <div className="text-white">{getTierIcon(tier)}</div>
                    </div>

                    <CardTitle className="text-xl capitalize">
                      {config.name}
                    </CardTitle>

                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        {formatCurrency(monthlyPrice)}
                        <span className="text-sm font-normal text-gray-500">
                          /maand
                        </span>
                      </div>
                      {billingInterval === "yearly" && savings > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          Bespaar {savings}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {config.description}
                    </p>

                    {/* Key Features */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Key Features:</h4>
                      <ul className="space-y-1">
                        {config.features.slice(0, 4).map(feature => (
                          <li
                            key={feature}
                            className="flex items-center text-sm"
                          >
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="capitalize">
                              {feature.replace(/_/g, " ")}
                            </span>
                          </li>
                        ))}
                        {config.features.length > 4 && (
                          <li className="text-sm text-gray-500">
                            +{config.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Limits */}
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        Users:{" "}
                        {config.limits.maxUsers === -1
                          ? "Unlimited"
                          : config.limits.maxUsers}
                      </div>
                      <div>
                        Projects:{" "}
                        {config.limits.maxProjects === -1
                          ? "Unlimited"
                          : config.limits.maxProjects}
                      </div>
                      <div>Support: {config.limits.supportLevel}</div>
                    </div>

                    {!isCurrent && canUpgrade && (
                      <Button
                        className="w-full"
                        variant={selectedTier === tier ? "default" : "outline"}
                        disabled={isUpgrading}
                      >
                        {selectedTier === tier ? "Selected" : "Select Plan"}
                      </Button>
                    )}

                    {isCurrent && (
                      <Button className="w-full" variant="secondary" disabled>
                        Current Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quote Summary */}
          {quote && selectedTier !== activeTier && (
            <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Upgrade Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Immediate Charge
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(quote.immediateCharge)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Prorated for current period
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Next Billing Amount
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(quote.nextBillingAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Starting{" "}
                      {new Intl.DateTimeFormat("nl-NL").format(
                        quote.nextBillingDate
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Billing Cycle
                    </p>
                    <p className="text-2xl font-bold capitalize">
                      {billingInterval}
                    </p>
                    <p className="text-xs text-gray-500">
                      {billingInterval === "yearly" &&
                        `Save ${getSavings(selectedTier)}%`}
                    </p>
                  </div>
                </div>

                {quote.addedFeatures.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">
                      New Features You'll Get:
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {quote.addedFeatures.map(feature => (
                        <div
                          key={feature}
                          className="flex items-center text-sm"
                        >
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span className="capitalize">
                            {feature.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <div className="space-x-3">
              {selectedTier !== activeTier && quote && (
                <Button
                  onClick={handleUpgrade}
                  disabled={isUpgrading || isLoadingQuote}
                  className="min-w-32"
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
