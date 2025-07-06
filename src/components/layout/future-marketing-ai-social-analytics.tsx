"use client";

import { useEffect } from "react";
import { SocialShareButtons } from "@/components/ui/social-share-buttons";
import {
  initializeGA,
  trackMarketingEvent,
  trackPageView,
} from "@/lib/analytics/google-analytics";

interface FutureMarketingAISocialAnalyticsProps {
  className?: string;
  title?: string;
  description?: string;
}

export function FutureMarketingAISocialAnalytics({
  title = "FutureMarketingAI - Transform Business Growth. Fortune 500 Powered.",
  description = "Enterprise-grade AI marketing automation for Fortune 500-level growth.",
  className: _className = "",
}: FutureMarketingAISocialAnalyticsProps) {
  useEffect(() => {
    // Get current URL
    const url = typeof window !== "undefined" ? window.location.href : "";

    // Initialize Google Analytics
    initializeGA();

    // Track homepage view
    trackPageView(url, title);

    // Track homepage milestone
    trackMarketingEvent.featureUsed(
      "homepage_viewed",
      "marketing_machine_homepage"
    );

    // Track scroll depth milestones
    let scrollDepth25 = false;
    let scrollDepth50 = false;
    let scrollDepth75 = false;
    let scrollDepth100 = false;

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
          100
      );

      if (scrollPercent >= 25 && !scrollDepth25) {
        scrollDepth25 = true;
        trackMarketingEvent.featureUsed("scroll_depth_25", "homepage");
      }
      if (scrollPercent >= 50 && !scrollDepth50) {
        scrollDepth50 = true;
        trackMarketingEvent.featureUsed("scroll_depth_50", "homepage");
      }
      if (scrollPercent >= 75 && !scrollDepth75) {
        scrollDepth75 = true;
        trackMarketingEvent.featureUsed("scroll_depth_75", "homepage");
      }
      if (scrollPercent >= 100 && !scrollDepth100) {
        scrollDepth100 = true;
        trackMarketingEvent.featureUsed("scroll_depth_100", "homepage");
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Track time on page
    const startTime = Date.now();
    const trackTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackMarketingEvent.featureUsed("time_on_page", `${timeSpent}_seconds`);
    };

    // Track time milestones
    const timeouts = [
      setTimeout(
        () => trackMarketingEvent.featureUsed("engaged_user_30s", "homepage"),
        30000
      ),
      setTimeout(
        () => trackMarketingEvent.featureUsed("engaged_user_60s", "homepage"),
        60000
      ),
      setTimeout(
        () => trackMarketingEvent.featureUsed("engaged_user_120s", "homepage"),
        120000
      ),
    ];

    // Cleanup on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      timeouts.forEach(clearTimeout);
      trackTimeOnPage();
    };
  }, [title]);

  // Get current URL for social sharing
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl p-4 shadow-2xl">
        <div className="text-white text-sm font-medium mb-3">
          Share FutureMarketingAI
        </div>
        <SocialShareButtons
          title={title}
          description={description}
          url={currentUrl}
          className="flex flex-col gap-2"
          showLabels={false}
          size="sm"
        />
      </div>
    </div>
  );
}

// Analytics integration hook for components
export function useMarketingAnalytics() {
  const trackCTA = (ctaText: string, location: string, destination: string) => {
    trackMarketingEvent.ctaClicked(ctaText, location, destination);
  };

  const trackDemo = (demoType: string) => {
    trackMarketingEvent.demoViewed(demoType);
  };

  const trackROICalculation = (
    monthlyRevenue: number,
    projectedROI: number
  ) => {
    trackMarketingEvent.roiCalculatorUsed(monthlyRevenue, projectedROI);
  };

  const trackTrialSignup = (plan: string, source: string) => {
    trackMarketingEvent.trialSignup(plan, source);
  };

  const trackContactSales = (source: string) => {
    trackMarketingEvent.contactSales(source);
  };

  const trackFortune500Demo = (source: string) => {
    trackMarketingEvent.fortune500DemoAccessed(source);
  };

  const trackPricingViewed = (plan: string) => {
    trackMarketingEvent.pricingViewed(plan);
  };

  const trackNewsletterSignup = (source: string) => {
    trackMarketingEvent.newsletterSignup(source);
  };

  return {
    trackCTA,
    trackDemo,
    trackROICalculation,
    trackTrialSignup,
    trackContactSales,
    trackFortune500Demo,
    trackPricingViewed,
    trackNewsletterSignup,
  };
}
