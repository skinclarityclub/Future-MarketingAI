// Google Analytics 4 integration for MarketingMachine
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Analytics configuration
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

// Initialize Google Analytics
export const initializeGA = () => {
  if (
    typeof window === "undefined" ||
    !GA_MEASUREMENT_ID ||
    GA_MEASUREMENT_ID === "G-XXXXXXXXXX"
  ) {
    return;
  }

  // Load Google Analytics script
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url?: string, title?: string) => {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_title: title || document.title,
    page_location: url || window.location.href,
  });
};

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters?: {
    event_category?: string;
    event_label?: string;
    value?: number;
    custom_parameters?: Record<string, any>;
  }
) => {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", eventName, {
    event_category: parameters?.event_category,
    event_label: parameters?.event_label,
    value: parameters?.value,
    ...parameters?.custom_parameters,
  });
};

// MarketingMachine specific event tracking
export const trackMarketingEvent = {
  // Lead generation events
  leadGenerated: (source: string, campaign?: string) => {
    trackEvent("lead_generated", {
      event_category: "lead_generation",
      event_label: source,
      custom_parameters: {
        lead_source: source,
        campaign: campaign,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Trial signup
  trialSignup: (plan: string, source: string) => {
    trackEvent("trial_signup", {
      event_category: "conversion",
      event_label: plan,
      value: 1,
      custom_parameters: {
        plan_type: plan,
        signup_source: source,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // ROI calculator interaction
  roiCalculatorUsed: (monthlyRevenue: number, projectedROI: number) => {
    trackEvent("roi_calculator_used", {
      event_category: "engagement",
      event_label: "roi_calculation",
      value: projectedROI,
      custom_parameters: {
        monthly_revenue: monthlyRevenue,
        projected_roi: projectedROI,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Demo interactions
  demoViewed: (demoType: string, duration?: number) => {
    trackEvent("demo_viewed", {
      event_category: "engagement",
      event_label: demoType,
      value: duration,
      custom_parameters: {
        demo_type: demoType,
        view_duration: duration,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Social sharing
  socialShare: (platform: string, content: string) => {
    trackEvent("social_share", {
      event_category: "social",
      event_label: platform,
      custom_parameters: {
        platform: platform,
        shared_content: content,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Contact and sales
  contactSales: (source: string) => {
    trackEvent("contact_sales", {
      event_category: "conversion",
      event_label: source,
      value: 1,
      custom_parameters: {
        contact_source: source,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Pricing interactions
  pricingViewed: (plan: string) => {
    trackEvent("pricing_viewed", {
      event_category: "engagement",
      event_label: plan,
      custom_parameters: {
        plan_viewed: plan,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Video/demo completions
  videoCompleted: (videoId: string, completionRate: number) => {
    trackEvent("video_completed", {
      event_category: "engagement",
      event_label: videoId,
      value: completionRate,
      custom_parameters: {
        video_id: videoId,
        completion_rate: completionRate,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Newsletter signup
  newsletterSignup: (source: string) => {
    trackEvent("newsletter_signup", {
      event_category: "lead_generation",
      event_label: source,
      custom_parameters: {
        signup_source: source,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Feature usage
  featureUsed: (featureName: string, context?: string) => {
    trackEvent("feature_used", {
      event_category: "engagement",
      event_label: featureName,
      custom_parameters: {
        feature_name: featureName,
        feature_context: context,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Fortune 500 demo
  fortune500DemoAccessed: (source: string) => {
    trackEvent("fortune500_demo_accessed", {
      event_category: "enterprise_engagement",
      event_label: source,
      value: 1,
      custom_parameters: {
        access_source: source,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // CTA clicks
  ctaClicked: (ctaText: string, ctaLocation: string, destination: string) => {
    trackEvent("cta_clicked", {
      event_category: "engagement",
      event_label: ctaText,
      custom_parameters: {
        cta_text: ctaText,
        cta_location: ctaLocation,
        cta_destination: destination,
        timestamp: new Date().toISOString(),
      },
    });
  },
};

// Enhanced ecommerce tracking for subscription conversions
export const trackPurchase = (
  transactionId: string,
  plan: string,
  value: number
) => {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "purchase", {
    transaction_id: transactionId,
    value: value,
    currency: "EUR",
    items: [
      {
        item_id: plan,
        item_name: `MarketingMachine ${plan}`,
        item_category: "subscription",
        quantity: 1,
        price: value,
      },
    ],
  });
};

// Track user journey milestones
export const trackMilestone = (
  milestone: string,
  data?: Record<string, any>
) => {
  trackEvent("milestone_reached", {
    event_category: "user_journey",
    event_label: milestone,
    custom_parameters: {
      milestone: milestone,
      milestone_data: data,
      timestamp: new Date().toISOString(),
    },
  });
};
