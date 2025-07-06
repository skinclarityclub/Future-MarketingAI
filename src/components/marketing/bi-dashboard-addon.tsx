"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface BIDashboardProps {
  subscriptionTier: "basic" | "premium" | "enterprise";
  customerId?: string;
  organizationId?: string;
}

interface MarketingMetrics {
  totalRevenue: number;
  monthlyGrowth: number;
  contentPerformance: number;
  roiImprovement: number;
  conversionRate: number;
  audienceEngagement: number;
}

interface ContentAnalytics {
  id: string;
  title: string;
  platform: string;
  views: number;
  engagementRate: number;
  conversionRate: number;
  revenue: number;
  roi: number;
  publishedDate: Date;
}

export default function BIDashboardAddon({
  subscriptionTier,
  customerId,
  organizationId,
}: BIDashboardProps) {
  const [marketingMetrics, setMarketingMetrics] =
    useState<MarketingMetrics | null>(null);
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics[]>(
    []
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const metrics = await fetchMarketingMetrics(selectedTimeframe);
      const analytics = await fetchContentAnalytics(selectedTimeframe);

      setMarketingMetrics(metrics);
      setContentAnalytics(analytics);
    } catch (error) {
      console.error("Failed to load BI dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPremiumFeature = subscriptionTier === "basic";

  if (isPremiumFeature) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BI Dashboard Add-on
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Advanced analytics for Marketing Machine data
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                🚀 Upgrade to Premium
              </h3>
              <p className="text-gray-700 mb-6">
                Unlock advanced BI analytics, custom reports, and deep insights
                into your marketing performance.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+€15K</div>
                  <div className="text-sm text-gray-600">
                    Avg. Monthly Revenue Increase
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">400%</div>
                  <div className="text-sm text-gray-600">
                    ROI on BI Investment
                  </div>
                </div>
              </div>
              <NormalButton
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Upgrade to Premium - €10K/month
              </NormalButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BI Dashboard Add-on
            </h1>
            <p className="text-gray-600 mt-1">
              Advanced analytics for Marketing Machine performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeframe}
              onChange={e => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Badge variant="default" className="bg-purple-600">
              Premium Add-on
            </Badge>
          </div>
        </div>

        {marketingMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">
                  Total Revenue
                </CardTitle>
                <span className="text-green-600">💰</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  €{marketingMetrics.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  +{marketingMetrics.monthlyGrowth}% from last period
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">
                  Content Performance
                </CardTitle>
                <span className="text-blue-600">📊</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {marketingMetrics.contentPerformance}/100
                </div>
                <Progress
                  value={marketingMetrics.contentPerformance}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">
                  ROI Improvement
                </CardTitle>
                <span className="text-purple-600">📈</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  +{marketingMetrics.roiImprovement}%
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  vs baseline performance
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="grid w-full max-w-[600px] grid-cols-4">
            <TabsTrigger value="content">Content Analytics</TabsTrigger>
            <TabsTrigger value="platforms">Platform Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentAnalytics.slice(0, 5).map(content => (
                    <div
                      key={content.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{content.title}</div>
                        <div className="text-sm text-gray-600">
                          {content.platform} •{" "}
                          {content.publishedDate.toDateString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-sm font-bold">
                            {content.views.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Views</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold">
                            {content.engagementRate}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Engagement
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold">
                            {content.conversionRate}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Conversion
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-green-600">
                            €{content.revenue.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-gray-500">
                Platform performance analytics coming soon...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-gray-500">Trend analysis coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-gray-500">AI insights coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

async function fetchMarketingMetrics(
  timeframe: string
): Promise<MarketingMetrics> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    totalRevenue: 125000,
    monthlyGrowth: 18.5,
    contentPerformance: 85,
    roiImprovement: 142,
    conversionRate: 8.3,
    audienceEngagement: 72,
  };
}

async function fetchContentAnalytics(
  timeframe: string
): Promise<ContentAnalytics[]> {
  await new Promise(resolve => setTimeout(resolve, 800));

  return [
    {
      id: "1",
      title: "AI Marketing Automation: Complete Guide",
      platform: "LinkedIn",
      views: 15420,
      engagementRate: 12.3,
      conversionRate: 8.5,
      revenue: 18500,
      roi: 340,
      publishedDate: new Date("2024-06-15"),
    },
    {
      id: "2",
      title: "Scale-up Marketing Strategy Framework",
      platform: "Blog",
      views: 8750,
      engagementRate: 15.7,
      conversionRate: 11.2,
      revenue: 22100,
      roi: 425,
      publishedDate: new Date("2024-06-12"),
    },
  ];
}
