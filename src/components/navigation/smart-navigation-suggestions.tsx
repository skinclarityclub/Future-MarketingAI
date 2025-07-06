"use client";

/**
 * Smart Navigation Suggestions Component
 * Displays AI-powered navigation recommendations
 * Task 13.1: Design AI-Powered Navigation Framework - UI Component
 */

import React from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  TrendingUp,
  Zap,
  Target,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useSmartNavigation } from "./smart-navigation-provider";
import { cn } from "@/lib/utils";
import type { SmartNavigationSuggestion } from "@/lib/navigation/ai-navigation-framework";

interface SmartNavigationSuggestionsProps {
  className?: string;
  maxSuggestions?: number;
  showConfidence?: boolean;
  compact?: boolean;
}

const SUGGESTION_ICONS = {
  ai_predicted: Brain,
  ml_recommended: TrendingUp,
  pattern_based: Target,
  contextual: Zap,
} as const;

const DISPLAY_STYLE_CLASSES = {
  prominent:
    "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md",
  subtle: "border-gray-200 bg-gray-50/50",
  contextual: "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50",
} as const;

export function SmartNavigationSuggestions({
  className,
  maxSuggestions = 5,
  showConfidence = true,
  compact = false,
}: SmartNavigationSuggestionsProps) {
  const { t } = useLocale();
  const { suggestions, isLoading, trackInteraction } = useSmartNavigation();

  const displaySuggestions = suggestions.slice(0, maxSuggestions);

  const handleSuggestionClick = async (
    suggestion: SmartNavigationSuggestion
  ) => {
    await trackInteraction("click", {
      suggestionId: suggestion.id,
      suggestionType: suggestion.type,
      confidence: suggestion.prediction.confidence,
      url: suggestion.page.url,
    });
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">
            {t("navigation.smartNavigation")}
          </h3>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (displaySuggestions.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">{t("navigation.noSuggestions")}</p>
        <p className="text-sm text-gray-400 mt-1">
          {t("navigation.continueNavigating")}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">
          {t("navigation.smartNavigation")}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {t("navigation.aiPowered")}
        </Badge>
      </div>

      {displaySuggestions.map(suggestion => (
        <NavigationSuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onClick={() => handleSuggestionClick(suggestion)}
          showConfidence={showConfidence}
          compact={compact}
        />
      ))}
    </div>
  );
}

interface NavigationSuggestionCardProps {
  suggestion: SmartNavigationSuggestion;
  onClick: () => void;
  showConfidence: boolean;
  compact: boolean;
}

function NavigationSuggestionCard({
  suggestion,
  onClick,
  showConfidence,
  compact,
}: NavigationSuggestionCardProps) {
  const Icon = SUGGESTION_ICONS[suggestion.type];
  const cardStyle = DISPLAY_STYLE_CLASSES[suggestion.presentation.displayStyle];

  return (
    <Card
      className={cn(cardStyle, "hover:shadow-lg transition-all duration-200")}
    >
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-blue-600" />
            <CardTitle className={cn("text-base", compact && "text-sm")}>
              {suggestion.page.title}
            </CardTitle>
          </div>

          {showConfidence && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-gray-600">
                {Math.round(suggestion.prediction.confidence * 100)}%
              </span>
            </div>
          )}
        </div>

        {!compact && (
          <CardDescription className="text-sm">
            {suggestion.page.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className={cn("pt-0", compact && "pt-0")}>
        <div className="space-y-3">
          {/* Reasoning */}
          {!compact && suggestion.prediction.reasoning.length > 0 && (
            <div className="text-sm text-gray-600">
              <strong>Why this matters:</strong>{" "}
              {suggestion.prediction.reasoning[0]}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{suggestion.prediction.timeToComplete}s</span>
            </div>

            <Badge variant="outline" className="text-xs">
              {suggestion.page.category}
            </Badge>

            <Badge
              variant={
                suggestion.type === "ai_predicted" ? "default" : "secondary"
              }
              className="text-xs"
            >
              {suggestion.type.replace("_", " ")}
            </Badge>
          </div>

          {/* Action Button */}
          <NormalButton asChild size="sm" className="w-full" onClick={onClick}>
            <Link
              href={suggestion.page.url}
              className="flex items-center gap-2"
            >
              <span>Visit Page</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </NormalButton>
        </div>
      </CardContent>
    </Card>
  );
}

export default SmartNavigationSuggestions;
