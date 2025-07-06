"use client";

/**
 * Smart Navigation Provider
 * React context provider for AI-powered navigation system
 * Task 13.1: Design AI-Powered Navigation Framework - UI Integration
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  aiNavigationFramework,
  type SmartNavigationSuggestion,
  type NavigationContext,
} from "@/lib/navigation/ai-navigation-framework";

interface SmartNavigationContextType {
  suggestions: SmartNavigationSuggestion[];
  isLoading: boolean;
  refreshSuggestions: () => Promise<void>;
  trackInteraction: (
    type: "page_view" | "click" | "search" | "conversion",
    metadata?: Record<string, any>
  ) => Promise<void>;
  currentContext: NavigationContext | null;
}

const SmartNavigationContext = createContext<
  SmartNavigationContextType | undefined
>(undefined);

interface SmartNavigationProviderProps {
  children: React.ReactNode;
  userId?: string;
  sessionId: string;
}

export function SmartNavigationProvider({
  children,
  userId,
  sessionId,
}: SmartNavigationProviderProps) {
  const pathname = usePathname();
  const [suggestions, setSuggestions] = useState<SmartNavigationSuggestion[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [previousPages, setPreviousPages] = useState<string[]>([]);
  const [currentContext, setCurrentContext] =
    useState<NavigationContext | null>(null);

  // Track page navigation
  useEffect(() => {
    const newContext: NavigationContext = {
      currentPage: pathname,
      sessionId,
      userId,
      previousPages,
      timeOnPage: 0,
    };

    setCurrentContext(newContext);
    setPreviousPages(prev => [...prev.slice(-4), pathname]); // Keep last 5 pages

    // Track page view
    trackInteraction("page_view");

    // Load suggestions for new page
    refreshSuggestions();
  }, [pathname, sessionId, userId]);

  const refreshSuggestions = useCallback(async () => {
    if (!currentContext) return;

    setIsLoading(true);
    try {
      const newSuggestions =
        await aiNavigationFramework.getSmartNavigationSuggestions(
          currentContext
        );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Failed to refresh navigation suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentContext]);

  const trackInteraction = useCallback(
    async (
      type: "page_view" | "click" | "search" | "conversion",
      metadata?: Record<string, any>
    ) => {
      if (!userId) return;

      try {
        await aiNavigationFramework.trackUserInteraction(userId, {
          type,
          page: pathname,
          timestamp: new Date(),
          metadata,
        });
      } catch (error) {
        console.error("Failed to track user interaction:", error);
      }
    },
    [userId, pathname]
  );

  const contextValue: SmartNavigationContextType = {
    suggestions,
    isLoading,
    refreshSuggestions,
    trackInteraction,
    currentContext,
  };

  return (
    <SmartNavigationContext.Provider value={contextValue}>
      {children}
    </SmartNavigationContext.Provider>
  );
}

export function useSmartNavigation() {
  const context = useContext(SmartNavigationContext);
  if (context === undefined) {
    throw new Error(
      "useSmartNavigation must be used within a SmartNavigationProvider"
    );
  }
  return context;
}
