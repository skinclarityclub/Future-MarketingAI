"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePersonalization } from "./enhanced-personalization-engine";
import { useBehaviorTracking } from "@/lib/analytics/behavior-tracking-provider";
import {
  TrendingUp,
  Target,
  Zap,
  Shield,
  Settings,
  Users,
  BarChart3,
  Rocket,
} from "lucide-react";

interface PersonalizedContentProps {
  stage: "awareness" | "consideration" | "decision" | "action";
  defaultContent?: React.ReactNode;
}

export function PersonalizedContent({
  stage,
  defaultContent,
}: PersonalizedContentProps) {
  const { personalizationData, trackPersonalizationEvent, runABTest } =
    usePersonalization();
  const { trackCustomEvent } = useBehaviorTracking();

  // Run A/B test for content variation
  const contentVariant = runABTest(`${stage}_content`, [
    "variant_a",
    "variant_b",
  ]);

  const getPersonalizedMessage = () => {
    const { userSegment, conversionLikelihood, recommendations } =
      personalizationData;

    switch (stage) {
      case "awareness":
        return getAwarenessContent(userSegment, conversionLikelihood);
      case "consideration":
        return getConsiderationContent(userSegment, recommendations);
      case "decision":
        return getDecisionContent(userSegment, conversionLikelihood);
      case "action":
        return getActionContent(userSegment, contentVariant);
      default:
        return null;
    }
  };

  const getAwarenessContent = (segment: string, likelihood: number) => {
    const isHighIntent = likelihood > 0.7;

    switch (segment) {
      case "power_users":
        return {
          title: isHighIntent
            ? "Advanced Marketing Automation"
            : "Enterprise-Grade Analytics",
          subtitle:
            "Deep insights and complete control over your marketing machine",
          icon: <BarChart3 className="w-12 h-12" />,
          features: [
            "Custom dashboard configurations",
            "Advanced API integrations",
            "White-label solutions",
            "Priority technical support",
          ],
          cta: isHighIntent ? "See Advanced Features" : "Explore Capabilities",
        };

      case "enterprise":
        return {
          title: "Enterprise Marketing Solutions",
          subtitle: "Scalable, compliant, and fully integrated",
          icon: <Shield className="w-12 h-12" />,
          features: [
            "Enterprise SSO integration",
            "Compliance-ready features",
            "Dedicated account management",
            "Custom deployment options",
          ],
          cta: "Schedule Enterprise Demo",
        };

      case "casual_browsers":
        return {
          title: "Simple Marketing Automation",
          subtitle: "Get results fast with our easy-to-use platform",
          icon: <Zap className="w-12 h-12" />,
          features: [
            "Quick 5-minute setup",
            "Pre-built templates",
            "Mobile-friendly interface",
            "24/7 chat support",
          ],
          cta: "Start Free Trial",
        };

      default:
        return {
          title: "Transform Your Marketing",
          subtitle: "Grow your business with intelligent automation",
          icon: <TrendingUp className="w-12 h-12" />,
          features: [
            "Automated content creation",
            "Smart audience targeting",
            "Real-time performance tracking",
            "Integration with popular tools",
          ],
          cta: "See How It Works",
        };
    }
  };

  const getConsiderationContent = (
    segment: string,
    recommendations: string[]
  ) => {
    const topRecommendations = recommendations.slice(0, 3);

    return {
      title: "See What's Possible",
      subtitle: `Recommended features for ${segment.replace("_", " ")}`,
      icon: <Target className="w-12 h-12" />,
      features:
        topRecommendations.length > 0
          ? topRecommendations
          : [
              "Intelligent content optimization",
              "Multi-channel distribution",
              "Performance analytics",
            ],
      cta: "Explore Platform",
    };
  };

  const getDecisionContent = (segment: string, likelihood: number) => {
    const urgency =
      likelihood > 0.8 ? "high" : likelihood > 0.5 ? "medium" : "low";

    return {
      title: "Your ROI Potential",
      subtitle: `Calculate your expected returns`,
      icon: <Rocket className="w-12 h-12" />,
      features: [
        `${Math.round(likelihood * 300)}% increase in content engagement`,
        `${Math.round(likelihood * 150)}% faster content production`,
        `${Math.round(likelihood * 200)}% improvement in lead quality`,
        urgency === "high"
          ? "Premium consultation included"
          : "Free setup assistance",
      ],
      cta: urgency === "high" ? "Book Strategy Call" : "Calculate Full ROI",
    };
  };

  const getActionContent = (segment: string, variant: string) => {
    const baseContent = {
      title:
        variant === "variant_a"
          ? "Ready to Transform?"
          : "Start Your Growth Journey",
      subtitle:
        variant === "variant_a"
          ? "Join thousands of growing businesses"
          : "See results in your first month",
      icon: <Users className="w-12 h-12" />,
    };

    switch (segment) {
      case "enterprise":
        return {
          ...baseContent,
          cta: "Schedule Enterprise Consultation",
          urgency: "Limited slots available for Q1 2025",
        };

      case "power_users":
        return {
          ...baseContent,
          cta: "Get Advanced Access",
          urgency: "Early adopter pricing ends soon",
        };

      default:
        return {
          ...baseContent,
          cta: variant === "variant_a" ? "Start Free Trial" : "Get Started Now",
          urgency: "No credit card required",
        };
    }
  };

  const handleContentInteraction = (action: string) => {
    trackPersonalizationEvent("content_interaction", {
      stage,
      action,
      userSegment: personalizationData.userSegment,
      contentVariant,
    });

    trackCustomEvent("personalized_content_click", {
      stage,
      action,
      conversionLikelihood: personalizationData.conversionLikelihood,
    });
  };

  const content = getPersonalizedMessage();

  if (!content) {
    return <>{defaultContent}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
          {content.icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {content.title}
          </h3>
          <p className="text-purple-200">{content.subtitle}</p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {content.features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 text-gray-200"
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400" />
            <span>{feature}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col space-y-3">
        <motion.button
          onClick={() => handleContentInteraction("cta_click")}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {content.cta}
        </motion.button>

        {content.urgency && (
          <p className="text-center text-sm text-yellow-300 font-medium">
            {content.urgency}
          </p>
        )}
      </div>

      {/* Personalization Debug Info (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg text-xs text-gray-400">
          <p>Segment: {personalizationData.userSegment}</p>
          <p>
            Conversion Likelihood:{" "}
            {Math.round(personalizationData.conversionLikelihood * 100)}%
          </p>
          <p>Content Variant: {contentVariant}</p>
        </div>
      )}
    </motion.div>
  );
}
