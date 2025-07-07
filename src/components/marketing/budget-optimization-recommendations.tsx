"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  InfoIcon,
} from "lucide-react";
import { BudgetOptimization } from "@/lib/marketing/campaign-roi-service";
import { useTranslation } from "@/lib/i18n/client-provider";

interface BudgetOptimizationRecommendationsProps {
  dateRange: { startDate: string; endDate: string };
  attributionModel: string;
}

export function BudgetOptimizationRecommendations({
  dateRange,
  attributionModel,
}: BudgetOptimizationRecommendationsProps) {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<BudgetOptimization[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [dateRange, attributionModel]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/marketing/roi?action=budget-optimization&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&attributionModel=${attributionModel}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch budget recommendations");
      }

      const data = await response.json();
      setRecommendations(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getRecommendationIcon = (recommendation: BudgetOptimization) => {
    const change =
      recommendation.recommended_spend - recommendation.current_spend;
    if (change > 0) return TrendingUpIcon;
    if (change < 0) return TrendingDownIcon;
    return CheckCircleIcon;
  };

  const getRecommendationColor = (recommendation: BudgetOptimization) => {
    const change =
      recommendation.recommended_spend - recommendation.current_spend;
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-blue-600";
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return "default";
    if (confidence >= 0.6) return "secondary";
    return "outline";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Calculate summary metrics
  const totalCurrentSpend = recommendations.reduce(
    (sum, rec) => sum + rec.current_spend,
    0
  );
  const totalRecommendedSpend = recommendations.reduce(
    (sum, rec) => sum + rec.recommended_spend,
    0
  );
  const totalPotentialImprovement = recommendations.reduce(
    (sum, rec) => sum + rec.expected_roi_improvement,
    0
  );
  const avgConfidence =
    recommendations.length > 0
      ? recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) /
        recommendations.length
      : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-600 font-medium">
            {t("errors.errorLoadingRecommendations")}
          </div>
          <div className="text-red-500 text-sm mt-1">{error}</div>
          <NormalButton
            onClick={fetchRecommendations}
            className="mt-4"
            variant="secondary"
          >
            {t("errors.tryAgain")}
          </NormalButton>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("marketing.budgetOptimizationRecommendations")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              {t("marketing.noBudgetRecommendationsMessage")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              {t("marketing.currentBudget")}
            </div>
            <div className="text-xl font-bold">
              {formatCurrency(totalCurrentSpend)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              {t("marketing.recommendedBudget")}
            </div>
            <div className="text-xl font-bold">
              {formatCurrency(totalRecommendedSpend)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              {t("marketing.budgetChange")}
            </div>
            <div
              className={`text-xl font-bold ${
                totalRecommendedSpend > totalCurrentSpend
                  ? "text-green-600"
                  : totalRecommendedSpend < totalCurrentSpend
                    ? "text-red-600"
                    : "text-blue-600"
              }`}
            >
              {formatCurrency(totalRecommendedSpend - totalCurrentSpend)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              {t("marketing.avgConfidence")}
            </div>
            <div className="text-xl font-bold">
              {(avgConfidence * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("marketing.campaignBudgetRecommendations")}</CardTitle>
          <div className="text-sm text-gray-600">
            {t("marketing.aiPoweredRecommendationsDescription").replace(
              "{attributionModel}",
              attributionModel
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => {
              const Icon = getRecommendationIcon(recommendation);
              const budgetChange =
                recommendation.recommended_spend - recommendation.current_spend;
              const budgetChangePercentage =
                recommendation.current_spend > 0
                  ? (budgetChange / recommendation.current_spend) * 100
                  : 0;

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 ${getRecommendationColor(recommendation)}`}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {recommendation.campaign_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {recommendation.reason}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={getConfidenceBadgeVariant(
                        recommendation.confidence_score
                      )}
                    >
                      {(recommendation.confidence_score * 100).toFixed(0)}%{" "}
                      {t("marketing.confidence")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        {t("marketing.currentSpend")}
                      </div>
                      <div className="font-medium">
                        {formatCurrency(recommendation.current_spend)}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-600 mb-1">
                        {t("marketing.recommendedSpend")}
                      </div>
                      <div className="font-medium text-blue-900">
                        {formatCurrency(recommendation.recommended_spend)}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600 mb-1">
                        {t("marketing.expectedROIImprovement")}
                      </div>
                      <div className="font-medium text-green-900">
                        {formatPercentage(
                          recommendation.expected_roi_improvement
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">
                        {t("marketing.budgetChangeLabel")}:
                      </span>
                      <span
                        className={`font-medium ${
                          budgetChange > 0
                            ? "text-green-600"
                            : budgetChange < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {formatCurrency(Math.abs(budgetChange))} (
                        {formatPercentage(Math.abs(budgetChangePercentage))})
                        {budgetChange > 0
                          ? ` ${t("marketing.increase")}`
                          : budgetChange < 0
                            ? ` ${t("marketing.decrease")}`
                            : ` ${t("marketing.noChange")}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getConfidenceColor(recommendation.confidence_score)} transition-all duration-500`}
                          style={{
                            width: `${recommendation.confidence_score * 100}%`,
                          }}
                        />
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Alert */}
      <Alert>
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>{t("marketing.implementationNote")}:</strong>{" "}
          {t("marketing.implementationWarning")}
        </AlertDescription>
      </Alert>
    </div>
  );
}
