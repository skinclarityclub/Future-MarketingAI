"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChannelROI } from "@/lib/marketing/campaign-roi-service";
import { useTranslation } from "@/lib/i18n/client-provider";

interface ChannelROIComparisonProps {
  channelData: ChannelROI[];
  dateRange: { startDate: string; endDate: string };
  attributionModel: string;
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export function ChannelROIComparison({
  channelData,
  dateRange: _dateRange,
  attributionModel: _attributionModel,
}: ChannelROIComparisonProps) {
  const { t } = useTranslation();

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

  // Prepare data for charts
  const barChartData = channelData.map(channel => ({
    channel: channel.channel.replace("_", " ").toUpperCase(),
    spend: channel.total_spend,
    revenue: channel.attributed_revenue,
    roi: channel.roi,
    roas: channel.roas,
  }));

  const pieChartData = channelData.map(channel => ({
    name: channel.channel.replace("_", " ").toUpperCase(),
    value: channel.attributed_revenue,
    spend: channel.total_spend,
  }));

  const totalRevenue = channelData.reduce(
    (sum, channel) => sum + channel.attributed_revenue,
    0
  );
  const bestPerformingChannel = channelData.reduce(
    (best, current) => (current.roi > best.roi ? current : best),
    channelData[0] || { roi: -Infinity }
  );

  return (
    <div className="space-y-6">
      {/* Channel Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("marketing.channelROIComparison")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="channel"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "roi")
                      return [formatPercentage(value), t("common.roi")];
                    if (name === "roas")
                      return [`${value.toFixed(2)}x`, t("common.roas")];
                    return [
                      formatCurrency(value),
                      name === "spend"
                        ? t("marketing.totalSpend")
                        : t("marketing.totalRevenue"),
                    ];
                  }}
                />
                <Bar dataKey="roi" fill="#3B82F6" name="roi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("marketing.revenueDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    t("marketing.totalRevenue"),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("marketing.detailedChannelPerformance")}</CardTitle>
          {bestPerformingChannel && (
            <div className="text-sm text-gray-600">
              {t("marketing.bestPerformingChannel")}{" "}
              <span className="font-medium capitalize">
                {bestPerformingChannel.channel.replace("_", " ")}
              </span>{" "}
              {t("common.with")} {formatPercentage(bestPerformingChannel.roi)}{" "}
              {t("common.roi")}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channelData.map((channel, index) => {
              const revenuePercentage =
                totalRevenue > 0
                  ? (channel.attributed_revenue / totalRevenue) * 100
                  : 0;

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <h3 className="font-medium text-gray-900 capitalize">
                        {channel.channel.replace("_", " ")}
                      </h3>
                    </div>
                    <Badge variant={getROIBadgeVariant(channel.roi)}>
                      {formatPercentage(channel.roi)} {t("common.roi")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("marketing.totalSpend")}
                      </p>
                      <p className="font-medium">
                        {formatCurrency(channel.total_spend)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("marketing.totalRevenue")}
                      </p>
                      <p className="font-medium">
                        {formatCurrency(channel.attributed_revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("common.roas")}
                      </p>
                      <p className="font-medium">{channel.roas.toFixed(2)}x</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("marketing.conversions")}
                      </p>
                      <p className="font-medium">
                        {channel.conversions.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{t("marketing.revenueShare")}</span>
                      <span>{revenuePercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={revenuePercentage} className="h-2" />
                  </div>

                  {/* Campaign breakdown */}
                  {channel.campaigns && channel.campaigns.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">
                        {t("marketing.topCampaigns")}
                      </p>
                      <div className="space-y-1">
                        {channel.campaigns
                          .sort((a, b) => b.roi - a.roi)
                          .slice(0, 3)
                          .map((campaign, campaignIndex) => (
                            <div
                              key={campaignIndex}
                              className="flex justify-between text-xs"
                            >
                              <span className="text-gray-700 truncate flex-1 mr-2">
                                {campaign.campaign_name}
                              </span>
                              <span
                                className={`font-medium ${getROIColor(campaign.roi)}`}
                              >
                                {formatPercentage(campaign.roi)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
