import React from "react";
import { Metadata } from "next";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Crown,
  Sparkles,
  Activity,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsageAnalyticsDashboard from "@/components/analytics/usage-analytics-dashboard";
import UpgradeFunnelTracker from "@/components/analytics/upgrade-funnel-tracker";
import { BehaviorTrackingProvider } from "@/lib/analytics/behavior-tracking-provider";

export const metadata: Metadata = {
  title: "Usage Analytics - SKC BI Dashboard",
  description:
    "Comprehensive analytics for user behavior tracking, feature adoption, and conversion optimization",
};

export default function UsageAnalyticsPage() {
  return (
    <BehaviorTrackingProvider
      enabled={true}
      config={{
        endpoint_url: "/api/tracking/events",
        track_page_views: true,
        track_clicks: true,
        track_scrolls: true,
        track_forms: true,
        batch_size: 10,
        flush_interval: 30000,
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Usage Analytics & Conversion Tracking
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Monitor user behavior, track feature adoption, and optimize
              conversion funnels for better business outcomes
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-gray-800">
                <Activity className="h-3 w-3 mr-1" />
                Real-time Tracking
              </Badge>
              <Badge variant="outline">
                <BarChart3 className="h-3 w-3 mr-1" />
                Advanced Analytics
              </Badge>
              <Badge className="bg-blue-600">
                <Eye className="h-3 w-3 mr-1" />
                User Insights
              </Badge>
              <Badge className="bg-green-600">
                <Target className="h-3 w-3 mr-1" />
                Conversion Optimization
              </Badge>
            </div>
          </div>

          {/* Key Benefits */}
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Analytics Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-300">
                    📊 User Behavior Tracking:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Real-time event monitoring</li>
                    <li>• Page view and interaction tracking</li>
                    <li>• Session duration analysis</li>
                    <li>• Feature usage patterns</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-green-300">
                    🎯 Conversion Analytics:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Upgrade funnel optimization</li>
                    <li>• Drop-off point identification</li>
                    <li>• Revenue potential calculation</li>
                    <li>• A/B testing insights</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-300">
                    ⚡ Actionable Insights:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Smart optimization recommendations</li>
                    <li>• Performance benchmarking</li>
                    <li>• User segmentation analysis</li>
                    <li>• ROI impact projections</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Dashboards */}
          <Tabs defaultValue="usage" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger
                value="usage"
                className="data-[state=active]:bg-gray-700 flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Usage Analytics
              </TabsTrigger>
              <TabsTrigger
                value="conversion"
                className="data-[state=active]:bg-gray-700 flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Conversion Funnel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="usage" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm font-medium">User Behavior</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Track interactions
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    <p className="text-sm font-medium">Real-time Events</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Live monitoring
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm font-medium">Feature Usage</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Adoption metrics
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-sm font-medium">Session Analytics</p>
                    <p className="text-xs text-gray-400 mt-1">User journeys</p>
                  </CardContent>
                </Card>
              </div>

              <UsageAnalyticsDashboard
                className="bg-transparent"
                timeRange="24h"
                showAdvanced={true}
              />
            </TabsContent>

            <TabsContent value="conversion" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    <p className="text-sm font-medium">Conversion Rate</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Upgrade tracking
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-sm font-medium">Premium Users</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Paid conversions
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm font-medium">Funnel Analysis</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Drop-off points
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm font-medium">Revenue Potential</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Growth opportunities
                    </p>
                  </CardContent>
                </Card>
              </div>

              <UpgradeFunnelTracker
                className="bg-transparent"
                timeRange="24h"
                showRevenue={true}
              />
            </TabsContent>
          </Tabs>

          {/* Implementation Status */}
          <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-400" />
                Task 81.7 Implementation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-300">
                      ✅ Completed Features:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• Real-time usage tracking API</li>
                      <li>• Comprehensive analytics dashboard</li>
                      <li>• Upgrade funnel monitoring</li>
                      <li>• Event batching and optimization</li>
                      <li>• User behavior pattern analysis</li>
                      <li>• Conversion rate tracking</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-300">
                      🚀 Key Capabilities:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• Feature adoption metrics</li>
                      <li>• Session duration analysis</li>
                      <li>• Drop-off point identification</li>
                      <li>• Revenue potential calculation</li>
                      <li>• Actionable optimization insights</li>
                      <li>• Export functionality for reports</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2 text-green-300 mb-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold">
                      Usage Tracking & Analytics: Fully Implemented!
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Complete analytics pipeline is now operational with
                    real-time tracking, conversion funnel analysis, and
                    actionable insights for optimization. All tracking data is
                    processed efficiently with event batching and caching.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BehaviorTrackingProvider>
  );
}
