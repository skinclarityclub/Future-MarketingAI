"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  Users,
  Target,
  Brain,
  Sparkles,
  Activity,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavigationSuggestion {
  id: string;
  title: string;
  description?: string;
  path: string;
  confidence: number;
  type: "ai" | "ml" | "behavior" | "contextual" | "popular" | "recent";
  metadata?: {
    estimatedTime?: string;
    category?: string;
    priority?: "high" | "medium" | "low";
  };
}

interface EnhancedNavigationSuggestionsProps {
  suggestions: NavigationSuggestion[];
  onSuggestionClick: (suggestion: NavigationSuggestion) => void;
  onSuggestionFeedback: (suggestionId: string, helpful: boolean) => void;
  onSuggestionBookmark: (suggestionId: string, bookmarked: boolean) => void;
  preferences: {
    maxSuggestions: number;
    showConfidenceScores: boolean;
    showRecommendationTypes: boolean;
    enableAnimations: boolean;
    compactMode: boolean;
  };
  loading?: boolean;
  error?: string;
}

const getTypeConfig = (type: NavigationSuggestion["type"]) => {
  const configs = {
    ai: {
      color: "bg-purple-500/10 text-purple-700 border-purple-200",
      icon: Brain,
      label: "AI",
    },
    ml: {
      color: "bg-blue-500/10 text-blue-700 border-blue-200",
      icon: TrendingUp,
      label: "ML",
    },
    behavior: {
      color: "bg-green-500/10 text-green-700 border-green-200",
      icon: Activity,
      label: "Gedrag",
    },
    contextual: {
      color: "bg-orange-500/10 text-orange-700 border-orange-200",
      icon: Target,
      label: "Context",
    },
    popular: {
      color: "bg-pink-500/10 text-pink-700 border-pink-200",
      icon: Users,
      label: "Populair",
    },
    recent: {
      color: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
      icon: Clock,
      label: "Recent",
    },
  };

  return configs[type] || configs.contextual;
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return "text-green-600";
  if (confidence >= 0.6) return "text-yellow-600";
  return "text-red-600";
};

export function EnhancedNavigationSuggestions({
  suggestions,
  onSuggestionClick,
  onSuggestionFeedback,
  onSuggestionBookmark,
  preferences,
  loading = false,
  error,
}: EnhancedNavigationSuggestionsProps) {
  const [sortedSuggestions, setSortedSuggestions] = useState<
    NavigationSuggestion[]
  >([]);
  const [bookmarkedSuggestions, setBookmarkedSuggestions] = useState<
    Set<string>
  >(new Set());
  const [showActions, setShowActions] = useState<string | null>(null);

  useEffect(() => {
    const sorted = [...suggestions]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, preferences.maxSuggestions);
    setSortedSuggestions(sorted);
  }, [suggestions, preferences.maxSuggestions]);

  const handleSuggestionFeedback = (suggestionId: string, helpful: boolean) => {
    onSuggestionFeedback(suggestionId, helpful);
  };

  const handleSuggestionBookmark = (
    suggestionId: string,
    bookmarked: boolean
  ) => {
    const newBookmarked = new Set(bookmarkedSuggestions);
    if (bookmarked) {
      newBookmarked.add(suggestionId);
    } else {
      newBookmarked.delete(suggestionId);
    }
    setBookmarkedSuggestions(newBookmarked);
    onSuggestionBookmark(suggestionId, bookmarked);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-spin" />
            Suggesties laden...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (sortedSuggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Geen suggesties beschikbaar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Navigatie Suggesties ({sortedSuggestions.length})
        </h3>

        {bookmarkedSuggestions.size > 0 && (
          <Badge variant="outline">
            <BookmarkCheck className="h-3 w-3 mr-1" />
            {bookmarkedSuggestions.size} opgeslagen
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {sortedSuggestions.map((suggestion, index) => {
          const typeConfig = getTypeConfig(suggestion.type);
          const IconComponent = typeConfig.icon;
          const isBookmarked = bookmarkedSuggestions.has(suggestion.id);
          const showActionsForThis = showActions === suggestion.id;

          return (
            <Card
              key={suggestion.id}
              className={cn(
                "group cursor-pointer transition-all duration-200 border-l-4 hover:shadow-md",
                preferences.enableAnimations && "hover:scale-[1.02]",
                typeConfig.color.includes("purple")
                  ? "border-l-purple-500"
                  : typeConfig.color.includes("blue")
                    ? "border-l-blue-500"
                    : typeConfig.color.includes("green")
                      ? "border-l-green-500"
                      : typeConfig.color.includes("orange")
                        ? "border-l-orange-500"
                        : typeConfig.color.includes("pink")
                          ? "border-l-pink-500"
                          : "border-l-indigo-500"
              )}
              onMouseEnter={() => setShowActions(suggestion.id)}
              onMouseLeave={() => setShowActions(null)}
            >
              <CardContent
                className={cn("p-4", preferences.compactMode && "p-2")}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4
                        className={cn(
                          "font-medium truncate cursor-pointer hover:text-primary transition-colors",
                          preferences.compactMode ? "text-sm" : "text-base"
                        )}
                        onClick={() => onSuggestionClick(suggestion)}
                      >
                        {suggestion.title}
                      </h4>

                      <div className="flex items-center gap-1 ml-2">
                        {preferences.showRecommendationTypes && (
                          <Badge
                            variant="outline"
                            className={cn("text-xs", typeConfig.color)}
                          >
                            <IconComponent className="h-3 w-3 mr-1" />
                            {typeConfig.label}
                          </Badge>
                        )}

                        {showActionsForThis && (
                          <div className="flex items-center gap-1">
                            <NormalButton
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                handleSuggestionBookmark(
                                  suggestion.id,
                                  !isBookmarked
                                )
                              }
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="h-3 w-3 text-primary" />
                              ) : (
                                <Bookmark className="h-3 w-3" />
                              )}
                            </NormalButton>

                            <NormalButton
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                handleSuggestionFeedback(suggestion.id, true)
                              }
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </NormalButton>

                            <NormalButton
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                handleSuggestionFeedback(suggestion.id, false)
                              }
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </NormalButton>
                          </div>
                        )}
                      </div>
                    </div>

                    {suggestion.description && (
                      <p
                        className={cn(
                          "text-muted-foreground mb-2",
                          preferences.compactMode ? "text-xs" : "text-sm"
                        )}
                      >
                        {suggestion.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {preferences.showConfidenceScores && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Zekerheid:
                            </span>
                            <div className="flex items-center gap-1">
                              <Progress
                                value={suggestion.confidence * 100}
                                className="w-12 h-2"
                              />
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  getConfidenceColor(suggestion.confidence)
                                )}
                              >
                                {Math.round(suggestion.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        )}

                        {suggestion.metadata?.estimatedTime && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {suggestion.metadata.estimatedTime}
                          </div>
                        )}
                      </div>

                      <NormalButton
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 ml-2"
                        onClick={() => onSuggestionClick(suggestion)}
                      >
                        <ArrowUpRight className="h-3 w-3" />
                      </NormalButton>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
        Hover over suggesties voor acties • Klik om te navigeren
      </div>
    </div>
  );
}
