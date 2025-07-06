/**
 * Real-time Navigation Hook
 * Provides real-time navigation updates with WebSocket integration and fallback
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  navigationWebSocketService,
  NavigationUpdateEvent,
  UserBehaviorEvent,
} from "@/lib/realtime/navigation-websocket-service";
import { NavigationRecommendation } from "@/lib/analytics/ml-navigation-types";

export interface RealtimeNavigationOptions {
  sessionId: string;
  userId?: string;
  enableWebSocket?: boolean;
  fallbackInterval?: number;
  enableBehaviorTracking?: boolean;
  maxRecommendations?: number;
}

export interface RealtimeNavigationState {
  recommendations: NavigationRecommendation[];
  isConnected: boolean;
  isLoading: boolean;
  lastUpdated: Date | null;
  updateTrigger?: string;
  error?: string;
}

export interface BehaviorTrackingData {
  scrollDepth: number;
  clickCount: number;
  timeOnPage: number;
  formInteractions: number;
  searchQueries: number;
}

export function useRealtimeNavigation(options: RealtimeNavigationOptions) {
  const pathname = usePathname();
  const [state, setState] = useState<RealtimeNavigationState>({
    recommendations: [],
    isConnected: false,
    isLoading: false,
    lastUpdated: null,
  });

  const [behaviorData, setBehaviorData] = useState<BehaviorTrackingData>({
    scrollDepth: 0,
    clickCount: 0,
    timeOnPage: 0,
    formInteractions: 0,
    searchQueries: 0,
  });

  // Refs for tracking behavior
  const pageStartTime = useRef(Date.now());
  const scrollDepthRef = useRef(0);
  const clickCountRef = useRef(0);
  const formInteractionRef = useRef(0);
  const searchQueryRef = useRef(0);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const behaviorUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset behavior tracking when page changes
  useEffect(() => {
    pageStartTime.current = Date.now();
    scrollDepthRef.current = 0;
    clickCountRef.current = 0;
    formInteractionRef.current = 0;
    searchQueryRef.current = 0;

    setBehaviorData({
      scrollDepth: 0,
      clickCount: 0,
      timeOnPage: 0,
      formInteractions: 0,
      searchQueries: 0,
    });
  }, [pathname]);

  // Fetch navigation recommendations (fallback method)
  const fetchRecommendations = useCallback(
    async (force = false) => {
      if (state.isLoading && !force) return;

      setState(prev => ({ ...prev, isLoading: true, error: undefined }));

      try {
        const timeOnPage = Math.floor(
          (Date.now() - pageStartTime.current) / 1000
        );

        const response = await fetch("/api/assistant/navigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: {
              currentPage: pathname,
              sessionId: options.sessionId,
              userId: options.userId,
              timeOnPage,
            },
            options: {
              maxSuggestions: options.maxRecommendations || 5,
              includeAIInsights: true,
              includeMLPredictions: true,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();

        if (data.success && data.data.suggestions) {
          setState(prev => ({
            ...prev,
            recommendations: data.data.suggestions,
            lastUpdated: new Date(),
            updateTrigger: "polling_fallback",
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          isLoading: false,
        }));
      }
    },
    [
      pathname,
      options.sessionId,
      options.userId,
      options.maxRecommendations,
      state.isLoading,
    ]
  );

  // Initialize WebSocket connection
  useEffect(() => {
    if (!options.enableWebSocket) {
      // Use polling fallback
      fetchRecommendations();
      if (options.fallbackInterval) {
        fallbackTimerRef.current = setInterval(
          fetchRecommendations,
          options.fallbackInterval
        );
      }
      return;
    }

    const connectWebSocket = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));

        await navigationWebSocketService.connect(
          options.sessionId,
          options.userId
        );

        // Subscribe to navigation updates
        const unsubscribeNav = navigationWebSocketService.onNavigationUpdate(
          (event: NavigationUpdateEvent) => {
            setState(prev => ({
              ...prev,
              recommendations: event.recommendations.slice(
                0,
                options.maxRecommendations || 5
              ),
              lastUpdated: new Date(),
              updateTrigger: event.trigger,
              isLoading: false,
            }));
          }
        );

        // Subscribe to connection state changes
        const unsubscribeConn =
          navigationWebSocketService.onConnectionStateChange(
            (isConnected: boolean) => {
              setState(prev => ({ ...prev, isConnected }));

              if (!isConnected && options.fallbackInterval) {
                // Start polling fallback when disconnected
                fallbackTimerRef.current = setInterval(
                  fetchRecommendations,
                  options.fallbackInterval
                );
              } else if (isConnected && fallbackTimerRef.current) {
                // Stop polling when reconnected
                clearInterval(fallbackTimerRef.current);
                fallbackTimerRef.current = null;
              }
            }
          );

        return () => {
          unsubscribeNav();
          unsubscribeConn();
        };
      } catch (error) {
        console.error("WebSocket connection failed, using fallback:", error);
        setState(prev => ({
          ...prev,
          isConnected: false,
          error: "WebSocket connection failed",
          isLoading: false,
        }));

        // Use polling fallback
        fetchRecommendations();
        if (options.fallbackInterval) {
          fallbackTimerRef.current = setInterval(
            fetchRecommendations,
            options.fallbackInterval
          );
        }
      }
    };

    connectWebSocket();

    return () => {
      navigationWebSocketService.disconnect();
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
      }
    };
  }, [
    options.enableWebSocket,
    options.sessionId,
    options.userId,
    options.fallbackInterval,
    options.maxRecommendations,
    fetchRecommendations,
  ]);

  // Behavior tracking setup
  useEffect(() => {
    if (!options.enableBehaviorTracking) return;

    const trackScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent =
        scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      if (scrollPercent > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercent;

        if (options.enableWebSocket && state.isConnected) {
          navigationWebSocketService.sendBehaviorEvent({
            type: "user_behavior",
            sessionId: options.sessionId,
            userId: options.userId,
            currentPage: pathname,
            behaviorType: "scroll",
            data: { scrollDepth: scrollPercent },
          });
        }
      }
    };

    const trackClick = (event: MouseEvent) => {
      clickCountRef.current++;

      if (options.enableWebSocket && state.isConnected) {
        const target = event.target as HTMLElement;
        navigationWebSocketService.sendBehaviorEvent({
          type: "user_behavior",
          sessionId: options.sessionId,
          userId: options.userId,
          currentPage: pathname,
          behaviorType: "click",
          data: {
            elementType: target.tagName,
            clickCount: clickCountRef.current,
            x: event.clientX,
            y: event.clientY,
          },
        });
      }
    };

    const trackFormInteraction = (event: Event) => {
      formInteractionRef.current++;

      if (options.enableWebSocket && state.isConnected) {
        const target = event.target as HTMLElement;
        navigationWebSocketService.sendBehaviorEvent({
          type: "user_behavior",
          sessionId: options.sessionId,
          userId: options.userId,
          currentPage: pathname,
          behaviorType: "form_interaction",
          data: {
            elementType: target.tagName,
            inputType: target.getAttribute("type"),
            interactionCount: formInteractionRef.current,
          },
        });
      }
    };

    // Add event listeners
    window.addEventListener("scroll", trackScroll, { passive: true });
    document.addEventListener("click", trackClick);
    document.addEventListener("input", trackFormInteraction);
    document.addEventListener("change", trackFormInteraction);

    // Update behavior data periodically
    behaviorUpdateTimerRef.current = setInterval(() => {
      const timeOnPage = Math.floor(
        (Date.now() - pageStartTime.current) / 1000
      );
      setBehaviorData({
        scrollDepth: scrollDepthRef.current,
        clickCount: clickCountRef.current,
        timeOnPage,
        formInteractions: formInteractionRef.current,
        searchQueries: searchQueryRef.current,
      });
    }, 5000); // Update every 5 seconds

    return () => {
      window.removeEventListener("scroll", trackScroll);
      document.removeEventListener("click", trackClick);
      document.removeEventListener("input", trackFormInteraction);
      document.removeEventListener("change", trackFormInteraction);

      if (behaviorUpdateTimerRef.current) {
        clearInterval(behaviorUpdateTimerRef.current);
      }
    };
  }, [
    options.enableBehaviorTracking,
    options.enableWebSocket,
    state.isConnected,
    options.sessionId,
    options.userId,
    pathname,
  ]);

  // Manual refresh function
  const refreshRecommendations = useCallback(() => {
    if (options.enableWebSocket && state.isConnected) {
      navigationWebSocketService.requestNavigationUpdate(pathname, true);
    } else {
      fetchRecommendations(true);
    }
  }, [
    options.enableWebSocket,
    state.isConnected,
    pathname,
    fetchRecommendations,
  ]);

  // Send search query behavior
  const trackSearchQuery = useCallback(
    (query: string) => {
      searchQueryRef.current++;

      if (options.enableWebSocket && state.isConnected) {
        navigationWebSocketService.sendBehaviorEvent({
          type: "user_behavior",
          sessionId: options.sessionId,
          userId: options.userId,
          currentPage: pathname,
          behaviorType: "search",
          data: {
            query,
            searchCount: searchQueryRef.current,
          },
        });
      }
    },
    [
      options.enableWebSocket,
      state.isConnected,
      options.sessionId,
      options.userId,
      pathname,
    ]
  );

  return {
    ...state,
    behaviorData,
    refreshRecommendations,
    trackSearchQuery,
    connectionState: navigationWebSocketService.getConnectionState(),
  };
}
