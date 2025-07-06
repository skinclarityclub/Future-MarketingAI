"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  RefreshCw,
  Compass,
  Target,
  Eye,
  Wifi,
  WifiOff,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ContextualNavigationSuggestion,
  EnhancedNavigationResponse,
} from "@/lib/assistant/navigation-assistant-bridge";
import { useRealtimeNavigation } from "@/hooks/use-realtime-navigation";

interface SmartNavigationPanelProps {
  className?: string;
  currentQuery?: string;
  conversationHistory?: string[];
  dashboardContext?: any;
  sessionId: string;
  userId?: string;
  maxSuggestions?: number;
  enableRealtime?: boolean;
  enableBehaviorTracking?: boolean;
  fallbackInterval?: number;
}

interface NavigationData {
  suggestions: ContextualNavigationSuggestion[];
  contextualExplanation?: string;
  suggestedActions?: string[];
  relatedQueries?: string[];
  navigationStrategy?: string;
}

export function SmartNavigationPanel({
  className,
  currentQuery,
  conversationHistory = [],
  dashboardContext,
  sessionId,
  userId,
  maxSuggestions = 4,
  enableRealtime = true,
  enableBehaviorTracking = true,
  fallbackInterval = 30000, // 30 seconds
}: SmartNavigationPanelProps) {
  const pathname = usePathname();
  const [legacyNavigationData, setLegacyNavigationData] =
    useState<NavigationData | null>(null);
  const [previousPages, setPreviousPages] = useState<string[]>([]);

  // Use real-time navigation hook
  const {
    recommendations,
    isConnected,
    isLoading,
    lastUpdated,
    updateTrigger,
    error,
    behaviorData,
    refreshRecommendations,
    trackSearchQuery,
  } = useRealtimeNavigation({
    sessionId,
    userId,
    enableWebSocket: enableRealtime,
    fallbackInterval,
    enableBehaviorTracking,
    maxRecommendations: maxSuggestions,
  });

  // Track page visits
  useEffect(() => {
    // Add current page to history if it's different from the last one
    if (
      previousPages.length === 0 ||
      previousPages[previousPages.length - 1] !== pathname
    ) {
      setPreviousPages(prev => [...prev.slice(-5), pathname]); // Keep last 5 pages
    }
  }, [pathname]);

  // Track search queries from currentQuery prop
  useEffect(() => {
    if (currentQuery && currentQuery.trim()) {
      trackSearchQuery(currentQuery);
    }
  }, [currentQuery, trackSearchQuery]);

  // Fetch legacy navigation suggestions for contextual information
  const fetchLegacyNavigationSuggestions = async () => {
    try {
      const response = await fetch("/api/assistant/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            currentPage: pathname,
            sessionId,
            userId,
            previousPages: previousPages.slice(0, -1),
            currentQuery,
            dashboardContext,
          },
          conversationContext: {
            previousQueries: conversationHistory.slice(-5),
            currentDashboardState: {
              page: pathname,
              timestamp: new Date().toISOString(),
            },
          },
          options: {
            maxSuggestions,
            includeAIInsights: true,
            includeMLPredictions: true,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLegacyNavigationData({
            suggestions: [],
            contextualExplanation: data.data.contextual_explanation,
            suggestedActions: data.data.suggested_actions || [],
            relatedQueries: data.data.related_queries || [],
            navigationStrategy: data.data.navigation_strategy,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching legacy navigation suggestions:", error);
    }
  };

  // Fetch legacy data initially for contextual information
  useEffect(() => {
    fetchLegacyNavigationSuggestions();
  }, [pathname, currentQuery]);

  // Convert real-time recommendations to legacy format for compatibility
  const navigationData: NavigationData = {
    suggestions: recommendations.map(rec => ({
      page_url: rec.page_url,
      page_title: rec.page_title,
      recommendation_type: mapRecommendationType(rec.recommendation_type),
      confidence: rec.confidence,
      reasoning: rec.reasoning,
      ml_prediction: true,
      expected_value: rec.expected_engagement_score,
      personalization_factors: rec.personalization_factors,
      display_priority: rec.display_priority,
    })),
    contextualExplanation: legacyNavigationData?.contextualExplanation,
    suggestedActions: legacyNavigationData?.suggestedActions,
    relatedQueries: legacyNavigationData?.relatedQueries,
    navigationStrategy:
      updateTrigger || legacyNavigationData?.navigationStrategy,
  };

  // Helper function to map recommendation types
  function mapRecommendationType(
    type: string
  ): "ml_predicted" | "ai_suggested" | "contextual" | "intelligent" {
    switch (type) {
      case "next_page":
      case "alternative_path":
        return "ml_predicted";
      case "content_suggestion":
        return "ai_suggested";
      case "action_prompt":
        return "contextual";
      default:
        return "intelligent";
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "ai_suggested":
        return <Brain className="h-3 w-3" />;
      case "ml_predicted":
        return <TrendingUp className="h-3 w-3" />;
      case "intelligent":
        return <Lightbulb className="h-3 w-3" />;
      default:
        return <Compass className="h-3 w-3" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case "ai_suggested":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "ml_predicted":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "intelligent":
        return "bg-purple-500/10 text-purple-700 border-purple-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const formatRecommendationType = (type: string) => {
    switch (type) {
      case "ai_suggested":
        return "AI";
      case "ml_predicted":
        return "ML";
      case "intelligent":
        return "Smart";
      default:
        return "Basis";
    }
  };

  if (!navigationData && !isLoading) {
    return null; // Hide component if no data and not loading
  }

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Smart Navigatie
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            {enableRealtime && (
              <div
                className="flex items-center gap-1"
                title={
                  isConnected ? "Real-time connected" : "Using fallback polling"
                }
              >
                {isConnected ? (
                  <Wifi className="h-3 w-3 text-green-600" />
                ) : (
                  <WifiOff className="h-3 w-3 text-amber-600" />
                )}
              </div>
            )}

            {/* Behavior Tracking Indicator */}
            {enableBehaviorTracking && behaviorData && (
              <div
                className="flex items-center gap-1"
                title={`Clicks: ${behaviorData.clickCount}, Scroll: ${behaviorData.scrollDepth}%`}
              >
                <Activity className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-muted-foreground">
                  {behaviorData.clickCount}
                </span>
              </div>
            )}

            {navigationData?.navigationStrategy && (
              <Badge variant="secondary" className="text-xs">
                {navigationData.navigationStrategy}
              </Badge>
            )}

            <NormalButton
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => refreshRecommendations()}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-3 w-3", isLoading && "animate-spin")}
              />
            </NormalButton>
          </div>
        </div>

        {navigationData?.contextualExplanation && (
          <p className="text-xs text-muted-foreground mt-1">
            {navigationData.contextualExplanation}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Navigation Suggestions */}
        {navigationData?.suggestions &&
        navigationData.suggestions.length > 0 ? (
          <div className="space-y-2">
            {navigationData.suggestions.map((suggestion, index) => {
              const isCurrentPage = suggestion.page_url === pathname;

              return (
                <Link
                  key={`${suggestion.page_url}-${index}`}
                  href={suggestion.page_url as any}
                  className={cn(
                    "block p-2 rounded-lg border transition-all",
                    isCurrentPage
                      ? "bg-muted/50 border-muted cursor-default opacity-60"
                      : "hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-sm border-transparent hover:border-border"
                  )}
                  onClick={isCurrentPage ? e => e.preventDefault() : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {suggestion.page_title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs px-1.5 py-0.5 shrink-0",
                            getRecommendationColor(
                              suggestion.recommendation_type
                            )
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {getRecommendationIcon(
                              suggestion.recommendation_type
                            )}
                            {formatRecommendationType(
                              suggestion.recommendation_type
                            )}
                          </span>
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {suggestion.reasoning}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-current opacity-30" />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>

                        {suggestion.expected_value > 7 && (
                          <Badge variant="secondary" className="text-xs px-1">
                            Hoge waarde
                          </Badge>
                        )}
                      </div>
                    </div>

                    {!isCurrentPage && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-2 rounded-lg bg-muted/20 animate-pulse">
                <div className="h-4 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Geen navigatie aanbevelingen beschikbaar
            </p>
          </div>
        )}

        {/* Suggested Actions */}
        {navigationData?.suggestedActions &&
          navigationData.suggestedActions.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">
                Aanbevolen acties
              </h5>
              <div className="space-y-1">
                {navigationData.suggestedActions
                  .slice(0, 2)
                  .map((action, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      • {action}
                    </p>
                  ))}
              </div>
            </div>
          )}

        {/* Related Queries */}
        {navigationData?.relatedQueries &&
          navigationData.relatedQueries.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">
                Gerelateerde vragen
              </h5>
              <div className="flex flex-wrap gap-1">
                {navigationData.relatedQueries
                  .slice(0, 3)
                  .map((query, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {query}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Laatst bijgewerkt: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
