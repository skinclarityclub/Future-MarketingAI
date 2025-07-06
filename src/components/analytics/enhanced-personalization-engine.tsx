"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useBehaviorTracking } from "@/lib/analytics/behavior-tracking-provider";

interface PersonalizationData {
  userId?: string;
  userSegment:
    | "power_users"
    | "casual_browsers"
    | "regular_users"
    | "enterprise";
  preferences: {
    contentType: "visual" | "text" | "interactive";
    complexityLevel: "basic" | "intermediate" | "advanced";
    focusArea: "roi" | "features" | "integration" | "compliance";
  };
  recommendations: string[];
  abTestGroup?: string;
  conversionLikelihood: number;
}

interface PersonalizationContextType {
  personalizationData: PersonalizationData;
  updatePersonalization: (data: Partial<PersonalizationData>) => void;
  trackPersonalizationEvent: (event: string, data: any) => void;
  getRecommendedContent: () => string[];
  getUserSegment: () => string;
  runABTest: (testName: string, variants: string[]) => string;
}

const PersonalizationContext = createContext<PersonalizationContextType | null>(
  null
);

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error(
      "usePersonalization must be used within an EnhancedPersonalizationEngine"
    );
  }
  return context;
};

interface EnhancedPersonalizationEngineProps {
  children: React.ReactNode;
  userId?: string;
}

export function EnhancedPersonalizationEngine({
  children,
  userId,
}: EnhancedPersonalizationEngineProps) {
  const { tracker, trackCustomEvent } = useBehaviorTracking();
  const [personalizationData, setPersonalizationData] =
    useState<PersonalizationData>({
      userSegment: "regular_users",
      preferences: {
        contentType: "interactive",
        complexityLevel: "intermediate",
        focusArea: "features",
      },
      recommendations: [],
      conversionLikelihood: 0.5,
    });

  // Initialize personalization data based on user behavior
  useEffect(() => {
    if (tracker) {
      initializePersonalization();
    }
  }, [tracker, userId]);

  const initializePersonalization = async () => {
    try {
      // Get user's historical behavior
      const queuedEvents = tracker?.getQueuedEvents() || [];

      // Determine user segment based on behavior patterns
      const segment = determineUserSegment(queuedEvents);

      // Get personalized recommendations
      const recommendations = generatePersonalizedRecommendations(segment);

      // Calculate conversion likelihood
      const conversionLikelihood = calculateConversionLikelihood(queuedEvents);

      setPersonalizationData(prev => ({
        ...prev,
        userId,
        userSegment: segment,
        recommendations,
        conversionLikelihood,
      }));

      trackPersonalizationEvent("personalization_initialized", {
        userSegment: segment,
        conversionLikelihood,
      });
    } catch (error) {
      console.error("Failed to initialize personalization:", error);
    }
  };

  const determineUserSegment = (
    events: any[]
  ): PersonalizationData["userSegment"] => {
    if (events.length === 0) return "regular_users";

    const sessionDuration = events.reduce((total, event) => {
      return total + (event.session_duration || 0);
    }, 0);

    const interactionCount = events.filter(
      e => e.event_type === "click"
    ).length;
    const scrollDepth = Math.max(
      ...events
        .filter(e => e.event_data?.scroll_depth)
        .map(e => e.event_data.scroll_depth || 0)
    );

    // Advanced user detection
    if (sessionDuration > 600 && interactionCount > 20 && scrollDepth > 80) {
      return "power_users";
    }

    // Enterprise user detection
    if (
      events.some(
        e =>
          e.event_data?.element_text?.includes("enterprise") ||
          e.event_data?.element_text?.includes("custom integration")
      )
    ) {
      return "enterprise";
    }

    // Mobile/quick browse detection
    if (sessionDuration < 120 && scrollDepth < 30) {
      return "casual_browsers";
    }

    return "regular_users";
  };

  const generatePersonalizedRecommendations = (
    segment: PersonalizationData["userSegment"]
  ): string[] => {
    const recommendations = [];

    switch (segment) {
      case "power_users":
        recommendations.push(
          "Advanced analytics dashboard available",
          "Custom API integration options",
          "White-label solutions",
          "Priority support included"
        );
        break;

      case "enterprise":
        recommendations.push(
          "Enterprise SSO integration",
          "Dedicated account manager",
          "Custom compliance features",
          "Volume pricing available"
        );
        break;

      case "casual_browsers":
        recommendations.push(
          "Quick setup guide",
          "Mobile-optimized features",
          "Basic plan trial",
          "Video tutorials"
        );
        break;

      default:
        recommendations.push(
          "Free trial available",
          "Getting started guide",
          "Feature comparison",
          "ROI calculator"
        );
    }

    return recommendations;
  };

  const calculateConversionLikelihood = (events: any[]): number => {
    let score = 0.3; // Base score

    // High engagement indicators
    const highEngagementEvents = events.filter(
      e =>
        e.event_type === "click" ||
        e.event_type === "form_interaction" ||
        e.event_data?.scroll_depth > 70
    );

    score += Math.min(highEngagementEvents.length * 0.05, 0.4);

    // ROI calculator usage
    if (events.some(e => e.event_data?.element_id?.includes("roi"))) {
      score += 0.2;
    }

    // Pricing page visits
    if (events.some(e => e.page_url?.includes("pricing"))) {
      score += 0.15;
    }

    // Return user
    if (events.some(e => e.event_data?.is_returning_visitor)) {
      score += 0.1;
    }

    return Math.min(score, 0.95);
  };

  const updatePersonalization = (data: Partial<PersonalizationData>) => {
    setPersonalizationData(prev => ({ ...prev, ...data }));
    trackPersonalizationEvent("personalization_updated", data);
  };

  const trackPersonalizationEvent = (event: string, data: any) => {
    trackCustomEvent(`personalization_${event}`, {
      ...data,
      userSegment: personalizationData.userSegment,
      conversionLikelihood: personalizationData.conversionLikelihood,
    });
  };

  const getRecommendedContent = (): string[] => {
    return personalizationData.recommendations;
  };

  const getUserSegment = (): string => {
    return personalizationData.userSegment;
  };

  const runABTest = (testName: string, variants: string[]): string => {
    // Simple deterministic A/B testing based on user ID or session
    const seed =
      userId ||
      (typeof window !== "undefined"
        ? window.sessionStorage.getItem("temp-user-id")
        : null) ||
      "anonymous";

    const hash = seed.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const variant = variants[Math.abs(hash) % variants.length];

    trackPersonalizationEvent("ab_test_assignment", {
      testName,
      variant,
      userId,
    });

    // Store assignment for consistency
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(`ab_test_${testName}`, variant);
    }

    return variant;
  };

  const contextValue: PersonalizationContextType = {
    personalizationData,
    updatePersonalization,
    trackPersonalizationEvent,
    getRecommendedContent,
    getUserSegment,
    runABTest,
  };

  return (
    <PersonalizationContext.Provider value={contextValue}>
      {children}
    </PersonalizationContext.Provider>
  );
}
