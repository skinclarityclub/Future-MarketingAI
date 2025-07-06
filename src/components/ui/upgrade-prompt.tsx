"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Crown,
  Zap,
  ArrowRight,
  Check,
  X,
  Star,
  Sparkles,
  Lock,
  Unlock,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Shield,
  Rocket,
} from "lucide-react";
import { SubscriptionTier, FeatureKey } from "@/lib/rbac/access-tier-service";
import { cn } from "@/lib/utils";

export interface UpgradePromptProps {
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  feature?: FeatureKey;
  featureName?: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  showDetailed?: boolean;
  variant?: "modal" | "inline" | "banner" | "card";
  className?: string;
}

const TIER_COLORS = {
  free: "from-gray-500 to-gray-600",
  starter: "from-blue-500 to-blue-600",
  professional: "from-purple-500 to-purple-600",
  enterprise: "from-orange-500 to-orange-600",
  ultimate: "from-gradient-start to-gradient-end",
};

const TIER_ICONS = {
  free: Users,
  starter: Zap,
  professional: Star,
  enterprise: Shield,
  ultimate: Crown,
};

const TIER_BENEFITS = {
  starter: [
    "5 team members",
    "Advanced dashboards",
    "ClickUp integration",
    "AI assistant",
    "Real-time analytics",
  ],
  professional: [
    "25 team members",
    "Full integrations",
    "Content automation",
    "A/B testing",
    "Approval workflows",
    "Priority support",
  ],
  enterprise: [
    "100 team members",
    "API access",
    "SSO integration",
    "Audit logging",
    "Custom reports",
    "Predictive analytics",
  ],
  ultimate: [
    "Unlimited everything",
    "White-label branding",
    "Dedicated support",
    "Custom integrations",
    "Enterprise security",
  ],
};

const TIER_PRICING = {
  starter: { monthly: 49, yearly: 490 },
  professional: { monthly: 149, yearly: 1490 },
  enterprise: { monthly: 449, yearly: 4490 },
  ultimate: { monthly: 999, yearly: 9990 },
};

export function UpgradePrompt({
  currentTier,
  requiredTier,
  feature,
  featureName,
  onUpgrade,
  onDismiss,
  showDetailed = false,
  variant = "card",
  className,
}: UpgradePromptProps) {
  const [showDetails, setShowDetails] = useState(showDetailed);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const TierIcon = TIER_ICONS[requiredTier];
  const tierGradient = TIER_COLORS[requiredTier];
  const benefits =
    TIER_BENEFITS[requiredTier as keyof typeof TIER_BENEFITS] || [];
  const pricing = TIER_PRICING[requiredTier as keyof typeof TIER_PRICING];

  const savings = pricing
    ? Math.round(
        ((pricing.monthly * 12 - pricing.yearly) / (pricing.monthly * 12)) * 100
      )
    : 0;

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={cn(
          "relative w-full bg-gradient-to-r",
          tierGradient,
          "text-white p-4 shadow-lg",
          className
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span className="font-medium">
                {featureName || "Deze functie"} vereist {requiredTier}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onUpgrade}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Upgrade Nu
            </Button>

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "inline") {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "p-4 rounded-lg border-2 border-dashed",
          "bg-gradient-to-br from-gray-50 to-gray-100",
          "dark:from-gray-900 dark:to-gray-800",
          "border-gray-300 dark:border-gray-600",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "p-2 rounded-full bg-gradient-to-r",
                tierGradient,
                "text-white"
              )}
            >
              <TierIcon className="h-5 w-5" />
            </div>

            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Upgrade naar {requiredTier}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {featureName || "Deze functie"} is beschikbaar in {requiredTier}
              </p>
            </div>
          </div>

          <Button onClick={onUpgrade} className="shrink-0">
            <ArrowRight className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={cn("w-full max-w-2xl mx-auto", className)}
      >
        <Card className="relative overflow-hidden border-0 shadow-2xl">
          {/* Premium Header Gradient */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-2 bg-gradient-to-r",
              tierGradient
            )}
          />

          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "p-3 rounded-full bg-gradient-to-r",
                    tierGradient,
                    "text-white shadow-lg"
                  )}
                >
                  <TierIcon className="h-6 w-6" />
                </div>

                <div>
                  <CardTitle className="text-xl">
                    Upgrade naar {requiredTier}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Unlock premium functionaliteit
                  </p>
                </div>
              </div>

              {pricing && (
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    €
                    {billingPeriod === "monthly"
                      ? pricing.monthly
                      : Math.round(pricing.yearly / 12)}
                    <span className="text-sm font-normal text-gray-500">
                      /maand
                    </span>
                  </div>
                  {billingPeriod === "yearly" && savings > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Bespaar {savings}%
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Feature Highlight */}
            {featureName && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{featureName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Deze functie is beschikbaar vanaf {requiredTier}
                    </p>
                  </div>
                </div>
                <Unlock className="h-5 w-5 text-green-500" />
              </div>
            )}

            {/* Billing Toggle */}
            {pricing && (
              <div className="flex items-center justify-center space-x-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Button
                  variant={billingPeriod === "monthly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingPeriod("monthly")}
                  className="flex-1"
                >
                  Maandelijks
                </Button>
                <Button
                  variant={billingPeriod === "yearly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingPeriod("yearly")}
                  className="flex-1 relative"
                >
                  Jaarlijks
                  {savings > 0 && (
                    <Badge className="absolute -top-2 -right-2 text-xs bg-green-500">
                      -{savings}%
                    </Badge>
                  )}
                </Button>
              </div>
            )}

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">
                  Wat krijg je met {requiredTier}?
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? "Minder" : "Meer"} details
                  <ArrowRight
                    className={cn(
                      "h-4 w-4 ml-2 transition-transform",
                      showDetails && "rotate-90"
                    )}
                  />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {benefits
                  .slice(0, showDetails ? benefits.length : 4)
                  .map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className={cn(
                          "p-1 rounded-full bg-gradient-to-r",
                          tierGradient
                        )}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </motion.div>
                  ))}
              </div>

              {!showDetails && benefits.length > 4 && (
                <p className="text-sm text-gray-500 mt-2">
                  +{benefits.length - 4} meer functies...
                </p>
              )}
            </div>

            {/* Upgrade Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">{currentTier}</span>
                <span className="capitalize">{requiredTier}</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                Je bent bijna bij {requiredTier}!
              </p>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={onUpgrade}
                className={cn(
                  "flex-1 bg-gradient-to-r",
                  tierGradient,
                  "hover:opacity-90 text-white shadow-lg"
                )}
                size="lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Upgrade naar {requiredTier}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {onDismiss && (
                <Button variant="outline" onClick={onDismiss} size="lg">
                  Later
                </Button>
              )}
            </div>

            {/* Trust Signals */}
            <div className="flex items-center justify-center space-x-6 pt-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Veilige betaling</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>Annuleer altijd</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>14 dagen gratis</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
