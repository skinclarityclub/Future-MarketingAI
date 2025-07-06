"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  X,
  Crown,
  Zap,
  Star,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { SubscriptionTier, FeatureKey } from "@/lib/rbac/access-tier-service";
import { cn } from "@/lib/utils";

export interface FeatureComparisonProps {
  currentTier?: SubscriptionTier;
  highlightTier?: SubscriptionTier;
  onSelectTier?: (tier: SubscriptionTier) => void;
  showPricing?: boolean;
  compact?: boolean;
  className?: string;
}

const TIER_CONFIG = {
  free: {
    name: "Free",
    icon: Users,
    color: "from-gray-500 to-gray-600",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect voor beginners",
    popular: false,
  },
  starter: {
    name: "Starter",
    icon: Zap,
    color: "from-blue-500 to-blue-600",
    price: { monthly: 49, yearly: 490 },
    description: "Voor kleine teams",
    popular: false,
  },
  professional: {
    name: "Professional",
    icon: Star,
    color: "from-purple-500 to-purple-600",
    price: { monthly: 149, yearly: 1490 },
    description: "Voor groeiende bedrijven",
    popular: true,
  },
  enterprise: {
    name: "Enterprise",
    icon: Shield,
    color: "from-orange-500 to-orange-600",
    price: { monthly: 449, yearly: 4490 },
    description: "Voor grote organisaties",
    popular: false,
  },
  ultimate: {
    name: "Ultimate",
    icon: Crown,
    color: "from-gradient-start to-gradient-end",
    price: { monthly: 999, yearly: 9990 },
    description: "White-label oplossing",
    popular: false,
  },
};

const FEATURE_CATEGORIES = [
  {
    name: "Dashboard & Analytics",
    features: [
      {
        key: "basic_dashboard",
        name: "Basic Dashboard",
        tiers: ["free", "starter", "professional", "enterprise", "ultimate"],
      },
      {
        key: "advanced_dashboard",
        name: "Advanced Dashboard",
        tiers: ["starter", "professional", "enterprise", "ultimate"],
      },
      {
        key: "executive_dashboard",
        name: "Executive Dashboard",
        tiers: ["professional", "enterprise", "ultimate"],
      },
      {
        key: "real_time_analytics",
        name: "Real-time Analytics",
        tiers: ["starter", "professional", "enterprise", "ultimate"],
      },
      {
        key: "historical_analytics",
        name: "Historical Analytics",
        tiers: ["professional", "enterprise", "ultimate"],
      },
      {
        key: "predictive_analytics",
        name: "Predictive Analytics",
        tiers: ["enterprise", "ultimate"],
      },
    ],
  },
  {
    name: "Integraties",
    features: [
      {
        key: "clickup_integration",
        name: "ClickUp Integration",
        tiers: ["starter", "professional", "enterprise", "ultimate"],
      },
      {
        key: "blotato_integration",
        name: "Blotato Integration",
        tiers: ["professional", "enterprise", "ultimate"],
      },
      {
        key: "n8n_workflows",
        name: "n8n Workflows",
        tiers: ["professional", "enterprise", "ultimate"],
      },
      {
        key: "api_access",
        name: "API Access",
        tiers: ["enterprise", "ultimate"],
      },
      {
        key: "webhook_support",
        name: "Webhook Support",
        tiers: ["enterprise", "ultimate"],
      },
    ],
  },
  {
    name: "AI Functies",
    features: [
      {
        key: "ai_chatbot",
        name: "AI Assistant",
        tiers: ["starter", "professional", "enterprise", "ultimate"],
      },
      {
        key: "ai_content_generation",
        name: "AI Content Generation",
        tiers: ["professional", "enterprise", "ultimate"],
      },
      {
        key: "ai_optimization",
        name: "AI Campaign Optimization",
        tiers: ["enterprise", "ultimate"],
      },
    ],
  },
  {
    name: "Samenwerking",
    features: [
      {
        key: "team_collaboration",
        name: "Team Collaboration",
        tiers: ["starter", "professional", "enterprise", "ultimate"],
      },
      {
        key: "comment_system",
        name: "Comment System",
        tiers: ["starter", "professional", "enterprise", "ultimate"],
      },
      {
        key: "approval_workflows",
        name: "Approval Workflows",
        tiers: ["professional", "enterprise", "ultimate"],
      },
      {
        key: "task_assignment",
        name: "Task Assignment",
        tiers: ["professional", "enterprise", "ultimate"],
      },
    ],
  },
  {
    name: "Security & Enterprise",
    features: [
      {
        key: "sso_integration",
        name: "SSO Integration",
        tiers: ["enterprise", "ultimate"],
      },
      {
        key: "audit_logging",
        name: "Audit Logging",
        tiers: ["enterprise", "ultimate"],
      },
      {
        key: "advanced_permissions",
        name: "Advanced Permissions",
        tiers: ["enterprise", "ultimate"],
      },
      { key: "white_labeling", name: "White Labeling", tiers: ["ultimate"] },
    ],
  },
  {
    name: "Support",
    features: [
      {
        key: "community_support",
        name: "Community Support",
        tiers: ["free", "starter", "professional", "enterprise", "ultimate"],
      },
      {
        key: "priority_support",
        name: "Priority Support",
        tiers: ["professional", "enterprise", "ultimate"],
      },
      {
        key: "dedicated_support",
        name: "Dedicated Support",
        tiers: ["ultimate"],
      },
    ],
  },
];

const TIER_LIMITS = {
  free: { users: 2, projects: 1, workflows: 0, storage: "1 GB" },
  starter: { users: 5, projects: 3, workflows: 10, storage: "10 GB" },
  professional: { users: 25, projects: 10, workflows: 100, storage: "100 GB" },
  enterprise: { users: 100, projects: 50, workflows: 500, storage: "1 TB" },
  ultimate: {
    users: "Unlimited",
    projects: "Unlimited",
    workflows: "Unlimited",
    storage: "Unlimited",
  },
};

export function FeatureComparison({
  currentTier,
  highlightTier = "professional",
  onSelectTier,
  showPricing = true,
  compact = false,
  className,
}: FeatureComparisonProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const tiers: SubscriptionTier[] = [
    "free",
    "starter",
    "professional",
    "enterprise",
    "ultimate",
  ];

  const hasFeature = (featureKey: string, tier: SubscriptionTier): boolean => {
    const feature = FEATURE_CATEGORIES.flatMap(cat => cat.features).find(
      f => f.key === featureKey
    );
    return feature?.tiers.includes(tier) || false;
  };

  const getSavings = (tier: SubscriptionTier) => {
    const config = TIER_CONFIG[tier];
    if (!config.price.yearly || config.price.monthly === 0) return 0;
    return Math.round(
      ((config.price.monthly * 12 - config.price.yearly) /
        (config.price.monthly * 12)) *
        100
    );
  };

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tiers.map(tier => {
            const config = TIER_CONFIG[tier];
            const Icon = config.icon;
            const isHighlighted = tier === highlightTier;
            const isCurrent = tier === currentTier;

            return (
              <motion.div
                key={tier}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative p-4 rounded-lg border",
                  isHighlighted && "ring-2 ring-purple-500 border-purple-500",
                  isCurrent && "ring-2 ring-green-500 border-green-500"
                )}
              >
                {config.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
                    Populair
                  </Badge>
                )}

                <div className="text-center space-y-3">
                  <div
                    className={cn(
                      "mx-auto w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center",
                      config.color
                    )}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <div>
                    <h3 className="font-semibold">{config.name}</h3>
                    <p className="text-sm text-gray-600">
                      {config.description}
                    </p>
                  </div>

                  {showPricing && (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">
                        €
                        {billingPeriod === "monthly"
                          ? config.price.monthly
                          : Math.round(config.price.yearly / 12)}
                        <span className="text-sm font-normal text-gray-500">
                          /maand
                        </span>
                      </div>
                      {billingPeriod === "yearly" && getSavings(tier) > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          -{getSavings(tier)}%
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button
                    variant={isHighlighted ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelectTier?.(tier)}
                    className={cn(
                      isHighlighted && "bg-gradient-to-r",
                      isHighlighted && config.color
                    )}
                  >
                    {isCurrent ? "Huidige Plan" : "Selecteer"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Billing Toggle */}
      {showPricing && (
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Button
              variant={billingPeriod === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingPeriod("monthly")}
            >
              Maandelijks
            </Button>
            <Button
              variant={billingPeriod === "yearly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingPeriod("yearly")}
              className="relative"
            >
              Jaarlijks
              <Badge className="absolute -top-2 -right-2 text-xs bg-green-500">
                Bespaar tot 17%
              </Badge>
            </Button>
          </div>
        </div>
      )}

      {/* Tier Headers */}
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-1"></div>
        {tiers.map(tier => {
          const config = TIER_CONFIG[tier];
          const Icon = config.icon;
          const isHighlighted = tier === highlightTier;
          const isCurrent = tier === currentTier;

          return (
            <motion.div
              key={tier}
              className={cn(
                "relative p-4 rounded-lg border text-center",
                isHighlighted &&
                  "ring-2 ring-purple-500 border-purple-500 shadow-lg",
                isCurrent && "ring-2 ring-green-500 border-green-500"
              )}
            >
              {config.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
                  Populair
                </Badge>
              )}

              <div className="space-y-3">
                <div
                  className={cn(
                    "mx-auto w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center",
                    config.color
                  )}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <div>
                  <h3 className="font-semibold">{config.name}</h3>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>

                {showPricing && (
                  <div className="space-y-1">
                    <div className="text-xl font-bold">
                      €
                      {billingPeriod === "monthly"
                        ? config.price.monthly
                        : Math.round(config.price.yearly / 12)}
                      <span className="text-sm font-normal text-gray-500">
                        /maand
                      </span>
                    </div>
                    {billingPeriod === "yearly" && getSavings(tier) > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        -{getSavings(tier)}%
                      </Badge>
                    )}
                  </div>
                )}

                <Button
                  variant={isHighlighted ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectTier?.(tier)}
                  className={cn(
                    "w-full",
                    isHighlighted && "bg-gradient-to-r",
                    isHighlighted && config.color
                  )}
                >
                  {isCurrent ? "Huidige Plan" : "Selecteer"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Limieten & Quota</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-1 space-y-4">
              <div className="font-medium">Gebruikers</div>
              <div className="font-medium">Projecten</div>
              <div className="font-medium">Workflows</div>
              <div className="font-medium">Opslag</div>
            </div>
            {tiers.map(tier => {
              const limits = TIER_LIMITS[tier];
              return (
                <div key={tier} className="space-y-4 text-center">
                  <div>{limits.users}</div>
                  <div>{limits.projects}</div>
                  <div>{limits.workflows}</div>
                  <div>{limits.storage}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feature Categories */}
      <div className="space-y-4">
        {FEATURE_CATEGORIES.map(category => {
          const isExpanded = expandedCategory === category.name;

          return (
            <Card key={category.name}>
              <CardHeader
                className="cursor-pointer"
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : category.name)
                }
              >
                <CardTitle className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </CardTitle>
              </CardHeader>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent>
                    <div className="space-y-3">
                      {category.features.map(feature => (
                        <div
                          key={feature.key}
                          className="grid grid-cols-6 gap-4 items-center"
                        >
                          <div className="col-span-1">
                            <span className="text-sm font-medium">
                              {feature.name}
                            </span>
                          </div>
                          {tiers.map(tier => (
                            <div key={tier} className="text-center">
                              {hasFeature(feature.key, tier) ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-gray-300 mx-auto" />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
