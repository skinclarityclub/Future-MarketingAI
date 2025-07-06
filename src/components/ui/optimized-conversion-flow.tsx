"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
  Target,
  Star,
  Lock,
  Unlock,
  Check,
  X,
  Gift,
  Clock,
  Shield,
  Users,
  BarChart3,
  Brain,
  Settings,
  Rocket,
  ChevronRight,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SubscriptionTier } from "@/lib/rbac/access-tier-service";
import { cn } from "@/lib/utils";

// ====================================================================
// TYPES & INTERFACES
// ====================================================================

interface ConversionMetrics {
  variant: string;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  averageTimeToConversion: number;
  revenue: number;
}

interface UpgradeContext {
  currentTier: SubscriptionTier;
  targetTier: SubscriptionTier;
  userBehavior: {
    pageViews: number;
    featureAttempts: number;
    sessionDuration: number;
    lastUpgradePromptSeen?: Date;
    dismissalCount: number;
  };
  featureContext?: string;
  urgency?: "low" | "medium" | "high";
  pricePoint?: number;
  discount?: number;
}

interface ConversionPromptVariant {
  id: string;
  name: string;
  type:
    | "urgency"
    | "value"
    | "social_proof"
    | "feature_comparison"
    | "discount"
    | "trial";
  description: string;
  component: React.ComponentType<any>;
  expectedLift: number;
  targetAudience: string[];
}

// ====================================================================
// A/B TEST VARIANTS
// ====================================================================

// Variant A: Urgency-based prompt
const UrgencyVariant = ({ context, onUpgrade, onDismiss }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="fixed bottom-6 right-6 z-50 max-w-sm"
  >
    <Card className="border-l-4 border-l-red-500 shadow-2xl bg-gray-900/95 backdrop-blur-sm text-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-full">
            <Clock className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Beperkte Tijd!</h3>
            <p className="text-sm text-gray-300">50% korting eindigt vandaag</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Upgrade nu naar {context.targetTier} en ontgrendel alle premium
            features
          </p>

          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              Nog 3 uur beschikbaar
            </div>
          </div>

          <div className="flex gap-2">
            <NormalButton
              onClick={onUpgrade}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Upgrade Nu
            </NormalButton>
            <NormalButton
              variant="secondary"
              onClick={onDismiss}
              className="px-3"
            >
              <X className="h-4 w-4" />
            </NormalButton>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Variant B: Value-focused prompt
const ValueVariant = ({ context, onUpgrade, onDismiss }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed bottom-6 right-6 z-50 max-w-sm"
  >
    <Card className="border-l-4 border-l-blue-500 shadow-2xl bg-gray-900/95 backdrop-blur-sm text-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-full">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Meer Kunnen Doen</h3>
            <p className="text-sm text-gray-300">
              Met {context.targetTier} features
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            {[
              "Real-time analytics dashboard",
              "Team collaboration tools",
              "Advanced AI insights",
              "Priority support",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
            <p className="text-blue-300 text-sm font-medium">
              💎 Geschatte waarde: €{(context.pricePoint || 29) * 3}/maand
            </p>
          </div>

          <div className="flex gap-2">
            <NormalButton
              onClick={onUpgrade}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Upgrade Voor €{context.pricePoint || 29}
            </NormalButton>
            <NormalButton
              variant="secondary"
              onClick={onDismiss}
              className="px-3"
            >
              Later
            </NormalButton>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Variant C: Social proof prompt
const SocialProofVariant = ({ context, onUpgrade, onDismiss }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="fixed bottom-6 right-6 z-50 max-w-sm"
  >
    <Card className="border-l-4 border-l-green-500 shadow-2xl bg-gray-900/95 backdrop-blur-sm text-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-full">
            <Users className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Word Onderdeel Van</h3>
            <p className="text-sm text-gray-300">15.000+ tevreden gebruikers</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 border-2 border-gray-900"
                />
              ))}
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">+347 vandaag</p>
              <p className="text-gray-400">
                nieuwe {context.targetTier} gebruikers
              </p>
            </div>
          </div>

          <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-green-300 text-sm font-medium">
                4.9/5 sterren (2,843 reviews)
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-300 italic">
            "Deze upgrade heeft onze productiviteit met 300% verhoogd!" - Sarah
            K.
          </div>

          <div className="flex gap-2">
            <NormalButton
              onClick={onUpgrade}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Doe Mee
            </NormalButton>
            <NormalButton
              variant="secondary"
              onClick={onDismiss}
              className="px-3"
            >
              Later
            </NormalButton>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Variant D: Feature comparison prompt
const FeatureComparisonVariant = ({ context, onUpgrade, onDismiss }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="fixed bottom-6 right-6 z-50 max-w-md"
  >
    <Card className="border-l-4 border-l-purple-500 shadow-2xl bg-gray-900/95 backdrop-blur-sm text-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-full">
            <Target className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Vergelijk Features</h3>
            <p className="text-sm text-gray-300">
              {context.currentTier} vs {context.targetTier}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-400 mb-2">Huidige Plan</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-400" />
                  <span>Basis dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-3 w-3 text-red-400" />
                  <span>Team features</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-3 w-3 text-red-400" />
                  <span>Advanced analytics</span>
                </div>
              </div>
            </div>

            <div>
              <p className="font-medium text-purple-300 mb-2">
                {context.targetTier} Plan
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-400" />
                  <span>Alles van {context.currentTier}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-400" />
                  <span>Team collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-400" />
                  <span>Advanced analytics</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
            <p className="text-purple-300 text-sm font-medium">
              🚀 3x meer features voor slechts €{context.pricePoint}/maand
            </p>
          </div>

          <div className="flex gap-2">
            <NormalButton
              onClick={onUpgrade}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Upgrade Nu
            </NormalButton>
            <NormalButton
              variant="secondary"
              onClick={onDismiss}
              className="px-3"
            >
              Vergelijk Later
            </NormalButton>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Variant E: Trial-based prompt
const TrialVariant = ({ context, onUpgrade, onDismiss }: any) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="fixed bottom-6 right-6 z-50 max-w-sm"
  >
    <Card className="border-l-4 border-l-orange-500 shadow-2xl bg-gray-900/95 backdrop-blur-sm text-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/20 rounded-full">
            <Gift className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Probeer Gratis</h3>
            <p className="text-sm text-gray-300">
              14 dagen {context.targetTier} trial
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Test alle premium features risico-vrij. Geen creditcard vereist.
          </p>

          <div className="space-y-2">
            {[
              "14 dagen volledige toegang",
              "Alle premium features",
              "Annuleer wanneer je wilt",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
            <p className="text-orange-300 text-sm font-medium">
              🎁 Na trial: €{context.pricePoint || 29}/maand (stop elk moment)
            </p>
          </div>

          <div className="flex gap-2">
            <NormalButton
              onClick={onUpgrade}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <Gift className="h-4 w-4 mr-2" />
              Start Gratis Trial
            </NormalButton>
            <NormalButton
              variant="secondary"
              onClick={onDismiss}
              className="px-3"
            >
              Nee Bedankt
            </NormalButton>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ====================================================================
// MAIN COMPONENT
// ====================================================================

interface OptimizedConversionFlowProps {
  context: UpgradeContext;
  onUpgrade: () => void;
  onDismiss: () => void;
  enableAnalytics?: boolean;
  className?: string;
}

export default function OptimizedConversionFlow({
  context,
  onUpgrade,
  onDismiss,
  enableAnalytics = true,
  className,
}: OptimizedConversionFlowProps) {
  const [activeVariant, setActiveVariant] = useState<string>("");
  const [metrics, setMetrics] = useState<ConversionMetrics[]>([]);
  const [impressionLogged, setImpressionLogged] = useState(false);
  const startTimeRef = useRef<Date>(new Date());

  // A/B Test Variants Configuration
  const variants: ConversionPromptVariant[] = [
    {
      id: "urgency",
      name: "Urgency Scarcity",
      type: "urgency",
      description: "Time-limited offers with countdown",
      component: UrgencyVariant,
      expectedLift: 25,
      targetAudience: ["high_intent", "price_sensitive"],
    },
    {
      id: "value",
      name: "Value Proposition",
      type: "value",
      description: "Feature benefits and ROI focus",
      component: ValueVariant,
      expectedLift: 18,
      targetAudience: ["business_users", "feature_seekers"],
    },
    {
      id: "social_proof",
      name: "Social Proof",
      type: "social_proof",
      description: "User testimonials and popularity",
      component: SocialProofVariant,
      expectedLift: 22,
      targetAudience: ["new_users", "skeptical"],
    },
    {
      id: "comparison",
      name: "Feature Comparison",
      type: "feature_comparison",
      description: "Side-by-side plan comparison",
      component: FeatureComparisonVariant,
      expectedLift: 15,
      targetAudience: ["research_oriented", "comparison_shoppers"],
    },
    {
      id: "trial",
      name: "Free Trial",
      type: "trial",
      description: "Risk-free trial offering",
      component: TrialVariant,
      expectedLift: 35,
      targetAudience: ["hesitant", "trial_seekers"],
    },
  ];

  // Smart variant selection based on user behavior
  const selectOptimalVariant = (): string => {
    const { userBehavior, urgency } = context;

    if (userBehavior.dismissalCount >= 3) return "trial";
    if (userBehavior.featureAttempts >= 5) return "value";
    if (userBehavior.sessionDuration > 600000) return "social_proof";
    if (urgency === "high") return "urgency";

    // Default rotation
    const options = ["trial", "urgency", "social_proof", "value"];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Initialize variant selection
  useEffect(() => {
    const selectedVariant = selectOptimalVariant();
    setActiveVariant(selectedVariant);

    if (enableAnalytics && !impressionLogged) {
      console.log(`Conversion Impression: ${selectedVariant}`, {
        context,
        timestamp: new Date().toISOString(),
      });
      setImpressionLogged(true);
    }
  }, [context, enableAnalytics, impressionLogged]);

  const handleUpgradeClick = () => {
    const timeToClick = new Date().getTime() - startTimeRef.current.getTime();

    if (enableAnalytics) {
      console.log(`Conversion Click: ${activeVariant}`, {
        context,
        timeToClick,
        timestamp: new Date().toISOString(),
      });
    }

    onUpgrade();
  };

  const handleDismiss = () => {
    if (enableAnalytics) {
      console.log(`Conversion Dismissed: ${activeVariant}`, {
        context,
        timestamp: new Date().toISOString(),
      });
    }

    onDismiss();
  };

  // Render selected variant
  const renderVariant = () => {
    const variant = variants.find(v => v.id === activeVariant);
    if (!variant) return null;

    const VariantComponent = variant.component;
    return (
      <VariantComponent
        context={context}
        onUpgrade={handleUpgradeClick}
        onDismiss={handleDismiss}
      />
    );
  };

  return (
    <div className={cn("conversion-flow", className)}>
      <AnimatePresence mode="wait">
        {activeVariant && renderVariant()}
      </AnimatePresence>

      {/* Development Analytics Panel */}
      {process.env.NODE_ENV === "development" && enableAnalytics && (
        <div className="fixed top-4 left-4 p-3 bg-black/80 text-white text-xs rounded max-w-xs z-50">
          <h4 className="font-bold mb-2">A/B Test Debug</h4>
          <div>Active Variant: {activeVariant}</div>
          <div>Dismissals: {context.userBehavior.dismissalCount}</div>
          <div>Feature Attempts: {context.userBehavior.featureAttempts}</div>
          <div>
            Session: {Math.round(context.userBehavior.sessionDuration / 1000)}s
          </div>
        </div>
      )}
    </div>
  );
}
