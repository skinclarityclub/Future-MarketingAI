"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  TargetIcon,
} from "lucide-react";
import { CampaignROI, ChannelROI } from "@/lib/marketing/campaign-roi-service";
import { ChannelROIComparison } from "./channel-roi-comparison";
import { ROITrendsChart } from "./roi-trends-chart";
import { BudgetOptimizationRecommendations } from "./budget-optimization-recommendations";
import { useLocale } from "@/lib/i18n/context";

interface CampaignROIOverviewProps {
  className?: string;
}

export function CampaignROIOverview({
  className = "",
}: CampaignROIOverviewProps) {
  const { t } = useLocale();
  const [campaignROI, setCampaignROI] = useState<CampaignROI[]>([]);
  const [channelROI, setChannelROI] = useState<ChannelROI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days ago
    endDate: new Date().toISOString().split("T")[0], // today
  });
  const [attributionModel, setAttributionModel] = useState("linear");

  useEffect(() => {
    fetchROIData();
  }, [dateRange, attributionModel]);

  const fetchROIData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [campaignResponse, channelResponse] = await Promise.all([
        fetch(
          `/api/marketing/roi?action=campaigns&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&attributionModel=${attributionModel}`
        ),
        fetch(
          `/api/marketing/roi?action=channels&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&attributionModel=${attributionModel}`
        ),
      ]);

      if (!campaignResponse.ok || !channelResponse.ok) {
        throw new Error("Failed to fetch ROI data");
      }

      const campaignData = await campaignResponse.json();
      const channelData = await channelResponse.json();

      setCampaignROI(campaignData.data || []);
      setChannelROI(channelData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const totalSpend = campaignROI.reduce(
    (sum, campaign) => sum + campaign.total_spend,
    0
  );
  const totalRevenue = campaignROI.reduce(
    (sum, campaign) => sum + campaign.attributed_revenue,
    0
  );
  const overallROI =
    totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
  const overallROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const totalConversions = campaignROI.reduce(
    (sum, campaign) => sum + campaign.conversions,
    0
  );

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

  const getROIColor = (roi: number) => {
    if (roi > 100) return "text-green-600";
    if (roi > 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getROIBadgeVariant = (roi: number) => {
    if (roi > 100) return "default";
    if (roi > 0) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-red-600 font-medium">
              {t("errors.errorLoadingData")}
            </div>
            <div className="text-red-500 text-sm mt-1">{error}</div>
            <NormalButton
              onClick={fetchROIData}
              className="mt-4"
              variant="secondary"
            >
              {t("errors.tryAgain")}
            </NormalButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("marketing.campaignROIOverview")}
          </h2>
          <p className="text-gray-600 mt-1">
            {t("marketing.trackPerformanceDescription")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              aria-label={t("dates.startDate")}
              title={t("dates.startDate")}
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e =>
                setDateRange(prev => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              aria-label={t("dates.endDate")}
              title={t("dates.endDate")}
            />
          </div>

          <Select value={attributionModel} onValueChange={setAttributionModel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("placeholders.attributionModel")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first_touch">
                {t("marketing.firstTouch")}
              </SelectItem>
              <SelectItem value="last_touch">
                {t("marketing.lastTouch")}
              </SelectItem>
              <SelectItem value="linear">{t("marketing.linear")}</SelectItem>
              <SelectItem value="time_decay">
                {t("marketing.timeDecay")}
              </SelectItem>
              <SelectItem value="position_based">
                {t("marketing.positionBased")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Spend</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(totalSpend)}
                </p>
              </div>
              <DollarSignIcon className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">
                  Attributed Revenue
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">
                  Overall ROI
                </p>
                <p className={`text-2xl font-bold text-white`}>
                  {formatPercentage(overallROI)}
                </p>
              </div>
              <TargetIcon className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">
                  Total Conversions
                </p>
                <p className="text-2xl font-bold text-white">
                  {totalConversions.toLocaleString()}
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Campaign
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Channel
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">
                        Spend
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">
                        Revenue
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">
                        ROI
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">
                        ROAS
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">
                        Conversions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignROI.map((campaign, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700/30 hover:bg-gray-800/30"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {campaign.campaign_name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {campaign.marketing_channel.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(campaign.total_spend)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(campaign.attributed_revenue)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant={getROIBadgeVariant(campaign.roi)}>
                            {formatPercentage(campaign.roi)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {campaign.roas.toFixed(2)}x
                        </td>
                        <td className="py-3 px-4 text-right">
                          {campaign.conversions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <ChannelROIComparison
            channelData={channelROI}
            dateRange={dateRange}
            attributionModel={attributionModel}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <ROITrendsChart
            dateRange={dateRange}
            attributionModel={attributionModel}
          />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <BudgetOptimizationRecommendations
            dateRange={dateRange}
            attributionModel={attributionModel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
