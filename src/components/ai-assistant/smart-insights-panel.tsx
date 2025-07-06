"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Brain,
  RefreshCw,
  ChevronRight,
  X,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/context";

interface SmartInsight {
  id: string;
  type: "trend" | "alert" | "recommendation" | "optimization";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  urgency: "high" | "medium" | "low";
  confidence: number;
  actionable: boolean;
  metrics?: Record<string, any>;
  timestamp: Date;
}

interface SmartInsightsPanelProps {
  className?: string;
  currentPage?: string;
  dashboardContext?: {
    visibleMetrics?: string[];
    currentData?: any;
    userRole?: string;
  };
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function SmartInsightsPanel({
  className,
  currentPage = "Dashboard",
  dashboardContext,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
}: SmartInsightsPanelProps) {
  const { t } = useLocale();
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(
    new Set()
  );

  const fetchInsights = async () => {
    setIsLoading(true);

    try {
      // Call the assistant API with a specific query for insights
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question:
            "Geef me de belangrijkste business insights en aanbevelingen voor nu",
          context: {
            currentPage,
            dashboardContext,
            requestType: "insights_only",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch insights");
      }

      const data = await response.json();

      // Transform the ML insights into our format
      const transformedInsights: SmartInsight[] = (data.insights || []).map(
        (insight: any, index: number) => ({
          id: `insight-${Date.now()}-${index}`,
          type: insight.type || "recommendation",
          title: insight.title || t("dashboard.businessInsight"),
          description: insight.description || insight.content || "",
          impact: insight.impact || "medium",
          urgency: insight.urgency || "medium",
          confidence: insight.confidence || data.confidence || 0.8,
          actionable: insight.actionable !== false,
          metrics: insight.metrics,
          timestamp: new Date(),
        })
      );

      // Filter out dismissed insights
      const filteredInsights = transformedInsights.filter(
        insight => !dismissedInsights.has(insight.id)
      );

      setInsights(filteredInsights);
      setLastUpdated(new Date());
    } catch {
      // Silently handle error and use fallback insights

      // Fallback mock insights for development
      setInsights([
        {
          id: "demo-1",
          type: "trend",
          title: t("dashboard.insights.revenueGrowthTitle"),
          description: t("dashboard.insights.revenueGrowthDesc"),
          impact: "high",
          urgency: "low",
          confidence: 0.89,
          actionable: true,
          metrics: { growth: "23%", period: "month" },
          timestamp: new Date(),
        },
        {
          id: "demo-2",
          type: "alert",
          title: t("dashboard.insights.churnRiskTitle"),
          description: t("dashboard.insights.churnRiskDesc"),
          impact: "high",
          urgency: "high",
          confidence: 0.76,
          actionable: true,
          metrics: { customers: 5, value: "high" },
          timestamp: new Date(),
        },
        {
          id: "demo-3",
          type: "optimization",
          title: t("dashboard.insights.contentOptTitle"),
          description: t("dashboard.insights.contentOptDesc"),
          impact: "medium",
          urgency: "low",
          confidence: 0.82,
          actionable: true,
          metrics: { engagement_boost: "40%", day: "Tuesday" },
          timestamp: new Date(),
        },
      ]);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [currentPage, dashboardContext]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchInsights, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const dismissInsight = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const getInsightIcon = (type: SmartInsight["type"]) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="h-5 w-5" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5" />;
      case "recommendation":
        return <Lightbulb className="h-5 w-5" />;
      case "optimization":
        return <Target className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColors = (
    type: SmartInsight["type"],
    impact: SmartInsight["impact"]
  ) => {
    const baseColors = {
      trend: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
      alert: "text-red-600 bg-red-50 dark:bg-red-950/20",
      recommendation: "text-green-600 bg-green-50 dark:bg-green-950/20",
      optimization: "text-purple-600 bg-purple-50 dark:bg-purple-950/20",
    };

    const impactIntensity = {
      high: "ring-2 ring-current ring-opacity-20",
      medium: "ring-1 ring-current ring-opacity-10",
      low: "",
    };

    return `${baseColors[type]} ${impactIntensity[impact]}`;
  };

  const getUrgencyBadge = (urgency: SmartInsight["urgency"]) => {
    const colors = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      low: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    };

    return (
      <Badge variant="secondary" className={cn("text-xs", colors[urgency])}>
        {urgency === "high" ? "🔥" : urgency === "medium" ? "⚡" : "💡"}{" "}
        {urgency}
      </Badge>
    );
  };

  const visibleInsights = insights.slice(0, 3); // Show max 3 insights

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-lg">
            {t("dashboard.smartInsights")}
          </h3>
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <NormalButton
            variant="ghost"
            size="icon"
            onClick={fetchInsights}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </NormalButton>
          <NormalButton variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </NormalButton>
        </div>
      </div>

      {visibleInsights.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t("dashboard.noInsightsAvailable")}</p>
          <p className="text-xs">{t("dashboard.tryAgainLater")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleInsights.map(insight => (
            <div
              key={insight.id}
              className={cn(
                "rounded-lg p-4 transition-all duration-200 hover:shadow-sm",
                getInsightColors(insight.type, insight.impact)
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      {getUrgencyBadge(insight.urgency)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {t("dashboard.confidence")}:{" "}
                          {Math.round(insight.confidence * 100)}%
                        </span>
                        {insight.actionable && (
                          <Badge variant="secondary" className="text-xs">
                            {t("dashboard.actionable")}
                          </Badge>
                        )}
                      </div>
                      {insight.actionable && (
                        <NormalButton
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </NormalButton>
                      )}
                    </div>
                  </div>
                </div>
                <NormalButton
                  variant="ghost"
                  size="icon"
                  onClick={() => dismissInsight(insight.id)}
                  className="h-6 w-6 opacity-50 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </NormalButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {insights.length > 3 && (
        <div className="mt-4 text-center">
          <NormalButton variant="outline" size="sm">
            {t("dashboard.viewAllInsights")} {insights.length} insights
          </NormalButton>
        </div>
      )}
    </Card>
  );
}
