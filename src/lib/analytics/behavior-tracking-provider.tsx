/**
 * Behavior Tracking Provider
 * React context provider for user behavior tracking
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { UserBehaviorTracker } from "./user-behavior-tracker";
import {
  TrackingConfig,
  UserSession,
  UserBehaviorEvent,
  UserBehaviorEventType,
  EventData,
} from "./user-behavior-types";

interface BehaviorTrackingContextType {
  tracker: UserBehaviorTracker | null;
  session: UserSession | null;
  isEnabled: boolean;
  trackEvent: (eventType: UserBehaviorEventType, eventData?: EventData) => void;
  trackPageView: (url?: string, title?: string) => void;
  trackClick: (elementId: string, elementText?: string) => void;
  trackSearch: (query: string, resultsCount?: number) => void;
  trackFormSubmit: (formId: string, formData?: Record<string, any>) => void;
  trackError: (error: Error, context?: string) => void;
  trackCustomEvent: (eventName: string, data?: Record<string, any>) => void;
  setUserId: (userId: string) => void;
  getQueuedEvents: () => UserBehaviorEvent[];
  flushEvents: () => void;
  enable: () => void;
  disable: () => void;
}

const BehaviorTrackingContext =
  createContext<BehaviorTrackingContextType | null>(null);

interface BehaviorTrackingProviderProps {
  children: React.ReactNode;
  config?: Partial<TrackingConfig>;
  enabled?: boolean;
}

export function BehaviorTrackingProvider({
  children,
  config = {},
  enabled = true,
}: BehaviorTrackingProviderProps) {
  const trackerRef = useRef<UserBehaviorTracker | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isClient, setIsClient] = useState(false);

  // Set client state to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize tracker
  useEffect(() => {
    if (typeof window === "undefined" || !isEnabled || !isClient) return;

    const defaultConfig: Partial<TrackingConfig> = {
      enabled: true,
      track_page_views: true,
      track_clicks: true,
      track_scrolls: true,
      track_forms: true,
      track_videos: true,
      track_searches: true,
      track_errors: true,
      sample_rate: 1.0,
      batch_size: 20,
      flush_interval: 30000, // 30 seconds
      storage_type: "sessionStorage",
      include_pii: false,
      endpoint_url: "/api/tracking/events", // Add the tracking endpoint
      exclude_elements: [
        '[data-tracking="false"]',
        ".no-track",
        "script",
        "style",
        "meta",
        "link",
        "[data-testid]", // Exclude test elements
      ],
      ...config,
    };

    try {
      trackerRef.current = new UserBehaviorTracker(defaultConfig);

      // Update session state when it changes
      const updateSession = () => {
        try {
          if (trackerRef.current) {
            setSession(trackerRef.current.getSession());
          }
        } catch (error) {
          // Silently handle session update errors
          if (process.env.NODE_ENV === "development") {
            console.warn("Session update error:", error);
          }
        }
      };

      // Update session every 10 seconds
      const sessionInterval = setInterval(updateSession, 10000);
      updateSession(); // Initial update

      if (process.env.NODE_ENV === "development") {
        console.log("Behavior tracking initialized");
      }

      return () => {
        clearInterval(sessionInterval);
        if (trackerRef.current) {
          try {
            trackerRef.current.destroy();
          } catch (error) {
            // Silently handle cleanup errors
            if (process.env.NODE_ENV === "development") {
              console.warn("Tracker cleanup error:", error);
            }
          }
          trackerRef.current = null;
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to initialize behavior tracking:", error);
      }
      // Set tracker to null to prevent further errors
      trackerRef.current = null;
    }
  }, [isEnabled, config, isClient]);

  // Helper functions for common tracking scenarios
  const trackEvent = (
    eventType: UserBehaviorEventType,
    eventData: EventData = {}
  ) => {
    if (trackerRef.current && isEnabled && isClient) {
      try {
        trackerRef.current.trackEvent(eventType, eventData);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Track event error:", error);
        }
      }
    }
  };

  const trackPageView = (url?: string, title?: string) => {
    if (trackerRef.current && isEnabled && isClient) {
      trackerRef.current.trackPageView({
        url: url || window.location.href,
        title: title || document.title,
        load_time: 0,
      });
    }
  };

  const trackClick = (elementId: string, elementText?: string) => {
    trackEvent("click", {
      element_id: elementId,
      element_text: elementText,
      element_type: "button",
    });
  };

  const trackSearch = (query: string, resultsCount?: number) => {
    trackEvent("search", {
      search_query: query,
      search_results_count: resultsCount,
    });
  };

  const trackFormSubmit = (formId: string, formData?: Record<string, any>) => {
    trackEvent("form_submit", {
      form_id: formId,
      form_data: formData,
    });
  };

  const trackError = (error: Error, context?: string) => {
    trackEvent("error", {
      error_message: error.message,
      error_stack: error.stack,
      error_context: context,
    });
  };

  const trackCustomEvent = (eventName: string, data?: Record<string, any>) => {
    trackEvent("custom", {
      custom_event_name: eventName,
      custom_event_data: data,
    });
  };

  const setUserId = (userId: string) => {
    if (trackerRef.current) {
      trackerRef.current.setUserId(userId);
      setSession(trackerRef.current.getSession());
    }
  };

  const getQueuedEvents = (): UserBehaviorEvent[] => {
    return trackerRef.current?.getQueuedEvents() || [];
  };

  const flushEvents = () => {
    if (trackerRef.current) {
      trackerRef.current.flushQueue();
    }
  };

  const enable = () => {
    setIsEnabled(true);
  };

  const disable = () => {
    setIsEnabled(false);
    if (trackerRef.current) {
      trackerRef.current.destroy();
      trackerRef.current = null;
    }
  };

  const contextValue: BehaviorTrackingContextType = {
    tracker: trackerRef.current,
    session,
    isEnabled: isEnabled && isClient,
    trackEvent,
    trackPageView,
    trackClick,
    trackSearch,
    trackFormSubmit,
    trackError,
    trackCustomEvent,
    setUserId,
    getQueuedEvents,
    flushEvents,
    enable,
    disable,
  };

  return (
    <BehaviorTrackingContext.Provider value={contextValue}>
      {children}
    </BehaviorTrackingContext.Provider>
  );
}

export function useBehaviorTracking() {
  const context = useContext(BehaviorTrackingContext);

  if (!context) {
    throw new Error(
      "useBehaviorTracking must be used within a BehaviorTrackingProvider"
    );
  }

  return context;
}

// Higher-order component for automatic page view tracking
export function withBehaviorTracking<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  options?: {
    trackPageView?: boolean;
    eventName?: string;
    eventData?: EventData;
  }
) {
  const WrappedComponent = (props: T) => {
    const { trackPageView, trackEvent } = useBehaviorTracking();

    useEffect(() => {
      if (options?.trackPageView !== false) {
        trackPageView();
      }

      if (options?.eventName) {
        trackEvent("custom", {
          custom_event_name: options.eventName,
          custom_event_data: options.eventData,
        });
      }
    }, [trackPageView, trackEvent]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withBehaviorTracking(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for tracking component interactions
export function useTrackInteraction() {
  const { trackEvent } = useBehaviorTracking();

  return {
    trackButtonClick: (buttonId: string, buttonText?: string) => {
      trackEvent("click", {
        element_type: "button",
        element_id: buttonId,
        element_text: buttonText,
      });
    },

    trackLinkClick: (linkUrl: string, linkText?: string) => {
      trackEvent("click", {
        element_type: "link",
        element_text: linkText,
        to_url: linkUrl,
        navigation_type: linkUrl.startsWith("http") ? "external" : "internal",
      });
    },

    trackModalOpen: (modalId: string) => {
      trackEvent("custom", {
        custom_event_name: "modal_open",
        modal_id: modalId,
      });
    },

    trackModalClose: (modalId: string) => {
      trackEvent("custom", {
        custom_event_name: "modal_close",
        modal_id: modalId,
      });
    },

    trackTabSwitch: (tabId: string, previousTab?: string) => {
      trackEvent("custom", {
        custom_event_name: "tab_switch",
        tab_id: tabId,
        previous_tab: previousTab,
      });
    },

    trackFeatureUsage: (
      featureName: string,
      featureData?: Record<string, any>
    ) => {
      trackEvent("custom", {
        custom_event_name: "feature_usage",
        feature_name: featureName,
        feature_data: featureData,
      });
    },

    trackUserAction: (actionName: string, actionData?: Record<string, any>) => {
      trackEvent("custom", {
        custom_event_name: "user_action",
        action_name: actionName,
        action_data: actionData,
      });
    },
  };
}

// Hook for A/B testing support
export function useTrackExperiment() {
  const { trackEvent } = useBehaviorTracking();

  return {
    trackExperimentView: (experimentId: string, variant: string) => {
      trackEvent("custom", {
        custom_event_name: "experiment_view",
        experiment_id: experimentId,
        variant,
      });
    },

    trackExperimentConversion: (
      experimentId: string,
      variant: string,
      conversionType: string
    ) => {
      trackEvent("custom", {
        custom_event_name: "experiment_conversion",
        experiment_id: experimentId,
        variant,
        conversion_type: conversionType,
      });
    },
  };
}

export default BehaviorTrackingProvider;
