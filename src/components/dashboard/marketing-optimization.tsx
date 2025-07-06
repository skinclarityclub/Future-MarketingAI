"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  AlertTriangle,
  Zap,
  Trophy,
} from "lucide-react";

interface MarketingChannel {
  id: string;
  name: string;
  spend: number;
  revenue: number;
  roi: number;
  conversions: number;
  cpa: number;
  budget: number;
  budgetUsed: number;
  performance: "excellent" | "good" | "average" | "poor";
}

interface OptimizationRecommendation {
  id: string;
  channel: string;
  type:
    | "increase_budget"
    | "decrease_budget"
    | "optimize_targeting"
    | "pause_campaign";
  impact: "high" | "medium" | "low";
  description: string;
  potential_roi_improvement: number;
  recommended_action: string;
}

const mockChannels: MarketingChannel[] = [
  {
    id: "1",
    name: "Google Ads",
    spend: 15000,
    revenue: 45000,
    roi: 200,
    conversions: 150,
    cpa: 100,
    budget: 20000,
    budgetUsed: 75,
    performance: "excellent",
  },
  {
    id: "2",
    name: "Facebook Ads",
    spend: 8000,
    revenue: 16000,
    roi: 100,
    conversions: 80,
    cpa: 100,
    budget: 10000,
    budgetUsed: 80,
    performance: "good",
  },
  {
    id: "3",
    name: "LinkedIn Ads",
    spend: 5000,
    revenue: 8000,
    roi: 60,
    conversions: 25,
    cpa: 200,
    budget: 6000,
    budgetUsed: 83,
    performance: "average",
  },
  {
    id: "4",
    name: "YouTube Ads",
    spend: 3000,
    revenue: 2400,
    roi: -20,
    conversions: 12,
    cpa: 250,
    budget: 4000,
    budgetUsed: 75,
    performance: "poor",
  },
];

const mockRecommendations: OptimizationRecommendation[] = [
  {
    id: "1",
    channel: "Google Ads",
    type: "increase_budget",
    impact: "high",
    description:
      "Google Ads shows excellent ROI (200%). Consider increasing budget by 25%.",
    potential_roi_improvement: 15,
    recommended_action: "Increase budget to €25,000",
  },
  {
    id: "2",
    channel: "YouTube Ads",
    type: "pause_campaign",
    impact: "medium",
    description:
      "YouTube Ads showing negative ROI (-20%). Consider pausing or optimizing targeting.",
    potential_roi_improvement: 20,
    recommended_action: "Pause campaign",
  },
];

export default function MarketingOptimization() {
  const [channels, setChannels] = useState<MarketingChannel[]>(mockChannels);
  const [recommendations] =
    useState<OptimizationRecommendation[]>(mockRecommendations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch marketing data from API
  const fetchMarketingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/marketing");
      if (!response.ok) {
        throw new Error("Failed to fetch marketing data");
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        setChannels(data.data);
      }
    } catch (err) {
      console.error("Error fetching marketing data:", err);
      setError("Failed to load marketing data. Using demo data.");
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    fetchMarketingData();
  }, []);

  const totalSpend = channels.reduce((sum, channel) => sum + channel.spend, 0);
  const totalRevenue = channels.reduce(
    (sum, channel) => sum + channel.revenue,
    0
  );
  const totalConversions = channels.reduce(
    (sum, channel) => sum + channel.conversions,
    0
  );
  const averageROI =
    channels.reduce((sum, channel) => sum + channel.roi, 0) / channels.length;
  const averageCPA = totalSpend / totalConversions;

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "default";
      case "good":
        return "secondary";
      case "average":
        return "outline";
      case "poor":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "increase_budget":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "decrease_budget":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "optimize_targeting":
        return <Target className="h-4 w-4 text-blue-600" />;
      case "pause_campaign":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Marketing Spend Optimization
          </h2>
          <p className="text-gray-300">Loading marketing data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Marketing Spend Optimization
        </h2>
        <p className="text-gray-300">
          ROI tracking and budget optimization across all channels
        </p>
        {error && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{totalSpend?.toLocaleString("nl-NL") || "0"}
            </div>
            <Badge variant="secondary" className="mt-1">
              Marketing Investment
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{totalRevenue?.toLocaleString("nl-NL") || "0"}
            </div>
            <Badge variant="default" className="mt-1">
              Generated Revenue
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${averageROI >= 100 ? "text-green-600" : "text-red-600"}`}
            >
              {averageROI.toFixed(0)}%
            </div>
            <Badge
              variant={averageROI >= 100 ? "default" : "destructive"}
              className="mt-1"
            >
              Return on Investment
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CPA</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{averageCPA.toFixed(0)}</div>
            <Badge variant="outline" className="mt-1">
              Cost Per Acquisition
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Channels */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold text-white">
          Marketing Channels Performance
        </h3>
        {channels.map(channel => (
          <Card key={channel.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {channel.name}
                  <Badge variant={getPerformanceBadge(channel.performance)}>
                    {channel.performance}
                  </Badge>
                </CardTitle>
                <div
                  className={`text-lg font-bold ${channel.roi >= 100 ? "text-green-600" : "text-red-600"}`}
                >
                  ROI: {channel.roi}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-300">Spend</p>
                  <p className="font-semibold text-white">
                    €{channel.spend?.toLocaleString("nl-NL") || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Revenue</p>
                  <p className="font-semibold text-white">
                    €{channel.revenue?.toLocaleString("nl-NL") || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Conversions</p>
                  <p className="font-semibold text-white">
                    {channel.conversions}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">CPA</p>
                  <p className="font-semibold text-white">€{channel.cpa}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Usage</span>
                  <span>
                    {channel.budgetUsed}% (€
                    {channel.spend?.toLocaleString("nl-NL") || "0"} / €
                    {channel.budget?.toLocaleString("nl-NL") || "0"})
                  </span>
                </div>
                <Progress value={channel.budgetUsed} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optimization Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Optimization Recommendations
        </h3>
        {recommendations.map(rec => (
          <Card key={rec.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getRecommendationIcon(rec.type)}
                  {rec.channel}
                </CardTitle>
                <Badge
                  variant={
                    rec.impact === "high"
                      ? "default"
                      : rec.impact === "medium"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {rec.impact} impact
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 mb-3">{rec.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    Potential ROI Improvement
                  </p>
                  <p className="font-semibold text-green-600">
                    +{rec.potential_roi_improvement}%
                  </p>
                </div>
                <NormalButton size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  {rec.recommended_action}
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
