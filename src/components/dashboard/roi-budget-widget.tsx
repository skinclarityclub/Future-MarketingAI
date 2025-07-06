"use client";

import React, { useState, useEffect } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { UltraPremiumCard } from "@/components/layout/ultra-premium-dashboard-layout";
import Link from "next/link";

interface CampaignROI {
  campaign_id: string;
  campaign_name: string;
  marketing_channel: string;
  total_spend: number;
  attributed_revenue: number;
  roi: number;
  roas: number;
  conversions: number;
  cost_per_conversion: number;
}

interface BudgetOptimization {
  campaign_id: string;
  campaign_name: string;
  current_spend: number;
  recommended_spend: number;
  expected_roi_improvement: number;
  confidence_score: number;
  reason: string;
}

interface ROIMetrics {
  totalSpend: number;
  totalRevenue: number;
  averageROI: number;
  averageROAS: number;
  topPerformingCampaign: CampaignROI | null;
  underperformingCampaigns: number;
}

interface ROIBudgetData {
  metrics: ROIMetrics;
  budgetRecommendations: BudgetOptimization[];
  topCampaigns: CampaignROI[];
}

export default function ROIBudgetWidget() {
  const [data, setData] = useState<ROIBudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchROIBudgetData();
    const interval = setInterval(fetchROIBudgetData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchROIBudgetData = async () => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(
        today.getTime() - 30 * 24 * 60 * 60 * 1000
      );

      const startDate = thirtyDaysAgo.toISOString().split("T")[0];
      const endDate = today.toISOString().split("T")[0];

      const [campaignResponse, budgetResponse] = await Promise.all([
        fetch(
          `/api/marketing/roi?action=campaigns&startDate=${startDate}&endDate=${endDate}&attributionModel=linear`
        ),
        fetch(
          `/api/marketing/roi?action=budget-optimization&startDate=${startDate}&endDate=${endDate}&attributionModel=linear`
        ),
      ]);

      if (campaignResponse.ok && budgetResponse.ok) {
        const campaignData = await campaignResponse.json();
        const budgetData = await budgetResponse.json();

        const campaigns: CampaignROI[] = campaignData.data || [];
        const budgetRecommendations: BudgetOptimization[] =
          budgetData.data || [];

        // Calculate aggregated metrics
        const totalSpend = campaigns.reduce((sum, c) => sum + c.total_spend, 0);
        const totalRevenue = campaigns.reduce(
          (sum, c) => sum + c.attributed_revenue,
          0
        );
        const averageROI =
          campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length
            : 0;
        const averageROAS =
          campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length
            : 0;
        const topPerformingCampaign =
          campaigns.length > 0
            ? campaigns.reduce((prev, current) =>
                prev.roi > current.roi ? prev : current
              )
            : null;
        const underperformingCampaigns = campaigns.filter(
          c => c.roi < 100
        ).length;

        setData({
          metrics: {
            totalSpend,
            totalRevenue,
            averageROI,
            averageROAS,
            topPerformingCampaign,
            underperformingCampaigns,
          },
          budgetRecommendations: budgetRecommendations.slice(0, 3),
          topCampaigns: campaigns.slice(0, 3),
        });
        setError(null);
      } else {
        throw new Error("Failed to fetch ROI data");
      }
    } catch (err) {
      console.error("Failed to fetch ROI budget data:", err);
      setError("Failed to load ROI data");

      // Fallback data
      setData({
        metrics: {
          totalSpend: 45000,
          totalRevenue: 128000,
          averageROI: 184.4,
          averageROAS: 2.84,
          topPerformingCampaign: {
            campaign_id: "camp_001",
            campaign_name: "Summer Sale Campaign",
            marketing_channel: "social_media",
            total_spend: 8000,
            attributed_revenue: 28000,
            roi: 250,
            roas: 3.5,
            conversions: 120,
            cost_per_conversion: 66.67,
          },
          underperformingCampaigns: 2,
        },
        budgetRecommendations: [
          {
            campaign_id: "camp_001",
            campaign_name: "Summer Sale Campaign",
            current_spend: 8000,
            recommended_spend: 12000,
            expected_roi_improvement: 25,
            confidence_score: 85,
            reason: "High ROI campaign with growth potential",
          },
          {
            campaign_id: "camp_002",
            campaign_name: "Email Marketing",
            current_spend: 5000,
            recommended_spend: 3500,
            expected_roi_improvement: 15,
            confidence_score: 78,
            reason: "Optimize spend allocation for better efficiency",
          },
        ],
        topCampaigns: [
          {
            campaign_id: "camp_001",
            campaign_name: "Summer Sale Campaign",
            marketing_channel: "social_media",
            total_spend: 8000,
            attributed_revenue: 28000,
            roi: 250,
            roas: 3.5,
            conversions: 120,
            cost_per_conversion: 66.67,
          },
          {
            campaign_id: "camp_003",
            campaign_name: "Content Marketing",
            marketing_channel: "organic",
            total_spend: 3000,
            attributed_revenue: 9000,
            roi: 200,
            roas: 3.0,
            conversions: 85,
            cost_per_conversion: 35.29,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getROIColor = (roi: number) => {
    if (roi >= 200) return "text-green-400";
    if (roi >= 100) return "text-yellow-400";
    return "text-red-400";
  };

  const getBudgetChangeIcon = (current: number, recommended: number) => {
    if (recommended > current * 1.1)
      return <ArrowUp className="h-4 w-4 text-green-400" />;
    if (recommended < current * 0.9)
      return <ArrowDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-yellow-400" />;
  };

  const getBudgetChangeColor = (current: number, recommended: number) => {
    if (recommended > current * 1.1) return "text-green-400";
    if (recommended < current * 0.9) return "text-red-400";
    return "text-yellow-400";
  };

  if (loading) {
    return (
      <UltraPremiumCard className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-5 w-5" />
            ROI & Budget Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        </CardContent>
      </UltraPremiumCard>
    );
  }

  if (!data) {
    return (
      <UltraPremiumCard className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-5 w-5" />
            ROI & Budget Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-gray-400">
            No ROI data available
          </div>
        </CardContent>
      </UltraPremiumCard>
    );
  }

  return (
    <UltraPremiumCard className="h-96">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-5 w-5" />
            ROI & Budget Optimization
          </CardTitle>
          <Link href="/campaign-roi">
            <NormalButton variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Detailed ROI
            </NormalButton>
          </Link>
        </div>
        <CardDescription className="text-gray-400">
          Marketing performance tracking en budget aanbevelingen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-yellow-400 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error} - Showing fallback data
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {formatCurrency(data.metrics.totalSpend)}
            </div>
            <div className="text-xs text-gray-400">Total Spend</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(data.metrics.totalRevenue)}
            </div>
            <div className="text-xs text-gray-400">Revenue</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getROIColor(data.metrics.averageROI)}`}
            >
              {formatPercentage(data.metrics.averageROI)}
            </div>
            <div className="text-xs text-gray-400">Avg ROI</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {data.metrics.averageROAS.toFixed(2)}x
            </div>
            <div className="text-xs text-gray-400">Avg ROAS</div>
          </div>
        </div>

        {/* Top Performing Campaign */}
        {data.metrics.topPerformingCampaign && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Top Performer
            </h4>
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white truncate">
                    {data.metrics.topPerformingCampaign.campaign_name}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {data.metrics.topPerformingCampaign.marketing_channel.replace(
                      "_",
                      " "
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${getROIColor(data.metrics.topPerformingCampaign.roi)}`}
                  >
                    {formatPercentage(data.metrics.topPerformingCampaign.roi)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {data.metrics.topPerformingCampaign.roas.toFixed(1)}x ROAS
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Recommendations */}
        {data.budgetRecommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Budget Optimalisatie ({data.budgetRecommendations.length})
            </h4>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {data.budgetRecommendations.map(rec => (
                <div
                  key={rec.campaign_id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-800/30 rounded"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getBudgetChangeIcon(
                      rec.current_spend,
                      rec.recommended_spend
                    )}
                    <span className="text-gray-300 truncate">
                      {rec.campaign_name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-medium ${getBudgetChangeColor(rec.current_spend, rec.recommended_spend)}`}
                    >
                      {formatCurrency(rec.recommended_spend)}
                    </div>
                    <div className="text-xs text-gray-400">
                      +{formatPercentage(rec.expected_roi_improvement)} ROI
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Alert */}
        {data.metrics.underperformingCampaigns > 0 && (
          <div className="flex items-center gap-2 p-2 bg-yellow-900/20 border border-yellow-500/50 rounded text-yellow-300 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {data.metrics.underperformingCampaigns} campaigns onder 100% ROI
            </span>
          </div>
        )}
      </CardContent>
    </UltraPremiumCard>
  );
}
