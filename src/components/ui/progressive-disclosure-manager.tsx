"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Lightbulb,
  Crown,
  Sparkles,
  ArrowRight,
  X,
  TrendingUp,
  Users,
  Shield,
  Star,
  ChevronRight,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ProgressiveTooltip,
  SmartUpgradeHint,
  FeaturePreview,
} from "./interactive-elements";
import { SubscriptionTier, FeatureKey } from "@/lib/rbac/access-tier-service";
import { cn } from "@/lib/utils";

interface DisclosurePattern {
  id: string;
  type: "tooltip" | "overlay" | "notification" | "hint" | "preview";
  trigger: "hover" | "click" | "time" | "interaction" | "context";
  target: string;
  content: React.ReactNode;
  conditions: {
    userTier?: SubscriptionTier;
    featureAccess?: FeatureKey;
    interactionCount?: number;
    timeDelay?: number;
    contextual?: boolean;
  };
  timing: {
    showDelay?: number;
    hideDelay?: number;
    maxShow?: number;
    cooldown?: number;
  };
  placement: {
    position?: "top" | "bottom" | "left" | "right";
    offset?: number;
    smart?: boolean;
  };
  analytics: {
    shown: number;
    interacted: number;
    dismissed: number;
    converted: number;
  };
}

interface UserInteractionData {
  elementId: string;
  interactions: number;
  lastInteraction: Date;
  patterns: string[];
  conversion: boolean;
}

interface ProgressiveDisclosureManagerProps {
  children: React.ReactNode;
  userTier: SubscriptionTier;
  userId?: string;
  enableAnalytics?: boolean;
  enableSmartTiming?: boolean;
  enableContextualHints?: boolean;
  maxConcurrentDisclosures?: number;
  className?: string;
}

interface SmartPromptData {
  id: string;
  title: string;
  description: string;
  action: string;
  tier: SubscriptionTier;
  benefits: string[];
  confidence: number;
  urgency: "low" | "medium" | "high";
  context: string;
}

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  professional: 2,
  enterprise: 3,
  ultimate: 4,
};

const DEFAULT_UPGRADE_PATTERNS: Record<SubscriptionTier, SmartPromptData[]> = {
  free: [
    {
      id: "starter-analytics",
      title: "Unlock Advanced Analytics",
      description: "Get deeper insights into your business performance",
      action: "Upgrade to Starter",
      tier: "starter",
      benefits: ["Real-time dashboards", "Advanced charts", "Export reports"],
      confidence: 0.8,
      urgency: "medium",
      context: "analytics",
    },
    {
      id: "starter-team",
      title: "Collaborate with Your Team",
      description: "Invite team members and work together",
      action: "Upgrade to Starter",
      tier: "starter",
      benefits: ["5 team members", "Shared dashboards", "Comments"],
      confidence: 0.7,
      urgency: "low",
      context: "collaboration",
    },
  ],
  starter: [
    {
      id: "pro-automation",
      title: "Automate Your Workflows",
      description: "Save time with advanced automation features",
      action: "Upgrade to Professional",
      tier: "professional",
      benefits: ["Content automation", "A/B testing", "Approval workflows"],
      confidence: 0.75,
      urgency: "medium",
      context: "workflow",
    },
  ],
  professional: [
    {
      id: "enterprise-security",
      title: "Enterprise-Grade Security",
      description: "Advanced security and compliance features",
      action: "Upgrade to Enterprise",
      tier: "enterprise",
      benefits: ["SSO integration", "Audit logging", "Advanced permissions"],
      confidence: 0.9,
      urgency: "high",
      context: "security",
    },
  ],
  enterprise: [
    {
      id: "ultimate-branding",
      title: "White-Label Your Platform",
      description: "Complete customization and branding control",
      action: "Upgrade to Ultimate",
      tier: "ultimate",
      benefits: [
        "White-label branding",
        "Custom integrations",
        "Dedicated support",
      ],
      confidence: 0.85,
      urgency: "medium",
      context: "branding",
    },
  ],
  ultimate: [],
};

export function ProgressiveDisclosureManager({
  children,
  userTier,
  userId,
  enableAnalytics = true,
  enableSmartTiming = true,
  enableContextualHints = true,
  maxConcurrentDisclosures = 2,
  className,
}: ProgressiveDisclosureManagerProps) {
  const [disclosurePatterns, setDisclosurePatterns] = useState<
    DisclosurePattern[]
  >([]);
  const [activeDisclosures, setActiveDisclosures] = useState<Set<string>>(
    new Set()
  );
  const [userInteractions, setUserInteractions] = useState<
    Map<string, UserInteractionData>
  >(new Map());
  const [contextualPrompts, setContextualPrompts] = useState<SmartPromptData[]>(
    []
  );
  const [currentContext, setCurrentContext] = useState<string>("general");

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const interactionTimerRef = useRef<NodeJS.Timeout>();

  // Initialize contextual prompts based on user tier
  useEffect(() => {
    const availablePrompts = DEFAULT_UPGRADE_PATTERNS[userTier] || [];
    setContextualPrompts(availablePrompts);
  }, [userTier]);

  // Track user interactions
  const trackInteraction = useCallback(
    (elementId: string, interactionType: string) => {
      if (!enableAnalytics) return;

      setUserInteractions(prev => {
        const current = prev.get(elementId) || {
          elementId,
          interactions: 0,
          lastInteraction: new Date(),
          patterns: [],
          conversion: false,
        };

        return new Map(
          prev.set(elementId, {
            ...current,
            interactions: current.interactions + 1,
            lastInteraction: new Date(),
            patterns: [...current.patterns, interactionType],
          })
        );
      });
    },
    [enableAnalytics]
  );

  // Smart timing for showing disclosures
  const shouldShowDisclosure = useCallback(
    (pattern: DisclosurePattern): boolean => {
      if (!enableSmartTiming) return true;

      const interactions = userInteractions.get(pattern.target);
      const { conditions, timing } = pattern;

      // Check interaction count
      if (
        conditions.interactionCount &&
        (!interactions ||
          interactions.interactions < conditions.interactionCount)
      ) {
        return false;
      }

      // Check tier requirements
      if (
        conditions.userTier &&
        TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[conditions.userTier]
      ) {
        return false;
      }

      // Check cooldown
      if (timing.cooldown && interactions) {
        const timeSinceLastInteraction =
          Date.now() - interactions.lastInteraction.getTime();
        if (timeSinceLastInteraction < timing.cooldown) {
          return false;
        }
      }

      // Check max show limit
      if (timing.maxShow && pattern.analytics.shown >= timing.maxShow) {
        return false;
      }

      return true;
    },
    [enableSmartTiming, userInteractions, userTier]
  );

  // Context detection
  const detectContext = useCallback(() => {
    if (!enableContextualHints) return;

    // Clear existing timer
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }

    // Set timer to detect user context
    interactionTimerRef.current = setTimeout(() => {
      const recentInteractions = Array.from(userInteractions.values()).filter(
        interaction => {
          const timeDiff = Date.now() - interaction.lastInteraction.getTime();
          return timeDiff < 30000; // Last 30 seconds
        }
      );

      if (recentInteractions.length > 0) {
        // Analyze patterns to determine context
        const patterns = recentInteractions.flatMap(i => i.patterns);
        if (patterns.includes("analytics")) {
          setCurrentContext("analytics");
        } else if (patterns.includes("workflow")) {
          setCurrentContext("workflow");
        } else if (patterns.includes("collaboration")) {
          setCurrentContext("collaboration");
        }
      }
    }, 2000);
  }, [enableContextualHints, userInteractions]);

  // Update context when interactions change
  useEffect(() => {
    detectContext();
  }, [userInteractions, detectContext]);

  // Get contextual prompts for current context
  const getContextualPrompts = useCallback((): SmartPromptData[] => {
    return contextualPrompts
      .filter(
        prompt =>
          prompt.context === currentContext || prompt.context === "general"
      )
      .sort((a, b) => b.confidence - a.confidence);
  }, [contextualPrompts, currentContext]);

  // Smart upgrade suggestion component
  const SmartUpgradeSuggestion = ({ prompt }: { prompt: SmartPromptData }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-4 right-4 z-50 max-w-sm"
    >
      <Card className="border-l-4 border-l-blue-500 shadow-xl bg-gray-900/95 backdrop-blur-sm text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-400" />
              <CardTitle className="text-sm font-semibold">
                {prompt.title}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              onClick={() => {
                setActiveDisclosures(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(prompt.id);
                  return newSet;
                });
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Badge variant="outline" className="w-fit">
            <TrendingUp className="h-3 w-3 mr-1" />
            {Math.round(prompt.confidence * 100)}% relevant
          </Badge>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-sm text-gray-300">{prompt.description}</p>

          <div className="space-y-1">
            {prompt.benefits.slice(0, 2).map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <Sparkles className="h-3 w-3 text-blue-400" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => {
                trackInteraction(prompt.id, "upgrade_clicked");
                // Handle upgrade logic here
              }}
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              {prompt.action}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                trackInteraction(prompt.id, "dismissed");
                setActiveDisclosures(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(prompt.id);
                  return newSet;
                });
              }}
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Show contextual prompts when appropriate
  useEffect(() => {
    if (!enableContextualHints) return;

    const relevantPrompts = getContextualPrompts();
    const currentlyActive = activeDisclosures.size;

    if (
      currentlyActive < maxConcurrentDisclosures &&
      relevantPrompts.length > 0
    ) {
      const prompt = relevantPrompts[0];

      // Check if this prompt should be shown
      const interactions = userInteractions.get(currentContext);
      if (interactions && interactions.interactions >= 3) {
        setActiveDisclosures(prev => new Set([...prev, prompt.id]));
      }
    }
  }, [
    currentContext,
    enableContextualHints,
    getContextualPrompts,
    maxConcurrentDisclosures,
    activeDisclosures.size,
    userInteractions,
  ]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {children}

      {/* Render active contextual prompts */}
      <AnimatePresence>
        {Array.from(activeDisclosures).map(promptId => {
          const prompt = contextualPrompts.find(p => p.id === promptId);
          return prompt ? (
            <SmartUpgradeSuggestion key={promptId} prompt={prompt} />
          ) : null;
        })}
      </AnimatePresence>

      {/* Development debug panel - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-4 right-4 p-3 bg-black/80 text-white text-xs rounded max-w-xs">
          <div>Context: {currentContext}</div>
          <div>Active: {activeDisclosures.size}</div>
          <div>Interactions: {userInteractions.size}</div>
        </div>
      )}
    </div>
  );
}

export default ProgressiveDisclosureManager;
