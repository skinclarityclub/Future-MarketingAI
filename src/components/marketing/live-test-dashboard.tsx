"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Play,
  Pause,
  Square,
  TrendingUp,
  TrendingDown,
  Crown,
  Target,
  Users,
  MousePointer,
  DollarSign,
  Clock,
  Eye,
  Share2,
  Heart,
  MessageCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Zap,
  Star,
} from "lucide-react";

// Types for test data
interface TestVariant {
  id: string;
  name: string;
  platform: string;
  content: {
    title?: string;
    description?: string;
    image?: string;
    video?: string;
    cta?: string;
  };
  metrics: {
    impressions: number;
    reach: number;
    clicks: number;
    engagements: number;
    conversions: number;
    cost: number;
    ctr: number;
    engagement_rate: number;
    conversion_rate: number;
    cpc: number;
    cpm: number;
    roas: number;
  };
  status: "active" | "paused" | "completed";
  confidence_level: number;
  traffic_allocation: number;
  start_time: Date;
  projected_winner_probability: number;
}

interface LiveTest {
  id: string;
  name: string;
  description: string;
  status: "running" | "completed" | "paused" | "setup";
  test_duration: number; // hours
  elapsed_time: number; // hours
  winner_threshold: number; // confidence %
  auto_deploy: boolean;
  variants: TestVariant[];
  platforms: string[];
  target_audience: string;
  budget_per_platform: number;
  total_budget: number;
  spent_budget: number;
  created_at: Date;
  started_at?: Date;
  winner_variant?: string;
  winner_deployed?: boolean;
}

interface PlatformMetrics {
  platform: string;
  icon: React.ReactNode;
  color: string;
  total_impressions: number;
  total_reach: number;
  total_engagements: number;
  total_conversions: number;
  total_cost: number;
  avg_ctr: number;
  avg_engagement_rate: number;
  avg_conversion_rate: number;
  top_variant: string;
  status: "excellent" | "good" | "warning" | "poor";
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function LiveTestDashboard() {
  const [activeTests, setActiveTests] = useState<LiveTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<LiveTest | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock data generation
  useEffect(() => {
    generateMockData();
    if (autoRefresh) {
      const interval = setInterval(() => {
        updateRealTimeMetrics();
        setLastUpdate(new Date());
      }, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const generateMockData = () => {
    const mockTests: LiveTest[] = [
      {
        id: "test-001",
        name: "Summer Campaign Creative Test",
        description: "Testing 5 creative variations across social platforms",
        status: "running",
        test_duration: 24,
        elapsed_time: 8.5,
        winner_threshold: 95,
        auto_deploy: true,
        platforms: ["Facebook", "Instagram", "LinkedIn", "TikTok", "Twitter"],
        target_audience: "18-35 Tech Professionals",
        budget_per_platform: 500,
        total_budget: 2500,
        spent_budget: 1247,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
        started_at: new Date(Date.now() - 8.5 * 60 * 60 * 1000),
        variants: [
          {
            id: "var-001",
            name: "Control - Original",
            platform: "Multi-platform",
            content: {
              title: "Transform Your Business with AI",
              description: "Discover cutting-edge solutions",
              cta: "Learn More",
            },
            metrics: {
              impressions: 12500,
              reach: 9800,
              clicks: 875,
              engagements: 1240,
              conversions: 67,
              cost: 234.5,
              ctr: 7.0,
              engagement_rate: 9.92,
              conversion_rate: 7.66,
              cpc: 0.27,
              cpm: 18.76,
              roas: 3.2,
            },
            status: "active",
            confidence_level: 78,
            traffic_allocation: 20,
            start_time: new Date(Date.now() - 8.5 * 60 * 60 * 1000),
            projected_winner_probability: 15,
          },
          {
            id: "var-002",
            name: "Variant A - Video Focus",
            platform: "Multi-platform",
            content: {
              title: "See AI in Action",
              description: "Watch real transformations",
              cta: "Watch Demo",
            },
            metrics: {
              impressions: 12800,
              reach: 10200,
              clicks: 1156,
              engagements: 1890,
              conversions: 94,
              cost: 267.3,
              ctr: 9.03,
              engagement_rate: 14.76,
              conversion_rate: 8.13,
              cpc: 0.23,
              cpm: 20.88,
              roas: 4.1,
            },
            status: "active",
            confidence_level: 89,
            traffic_allocation: 20,
            start_time: new Date(Date.now() - 8.5 * 60 * 60 * 1000),
            projected_winner_probability: 35,
          },
          {
            id: "var-003",
            name: "Variant B - Urgency",
            platform: "Multi-platform",
            content: {
              title: "Limited Time: AI Revolution",
              description: "Join 10,000+ companies today",
              cta: "Start Free Trial",
            },
            metrics: {
              impressions: 11900,
              reach: 9400,
              clicks: 1340,
              engagements: 1567,
              conversions: 108,
              cost: 289.7,
              ctr: 11.26,
              engagement_rate: 13.17,
              conversion_rate: 8.06,
              cpc: 0.22,
              cpm: 24.35,
              roas: 4.8,
            },
            status: "active",
            confidence_level: 92,
            traffic_allocation: 20,
            start_time: new Date(Date.now() - 8.5 * 60 * 60 * 1000),
            projected_winner_probability: 45,
          },
          {
            id: "var-004",
            name: "Variant C - Social Proof",
            platform: "Multi-platform",
            content: {
              title: "Trusted by Fortune 500",
              description: "Join industry leaders",
              cta: "See Case Studies",
            },
            metrics: {
              impressions: 12200,
              reach: 9700,
              clicks: 976,
              engagements: 1345,
              conversions: 78,
              cost: 245.8,
              ctr: 8.0,
              engagement_rate: 11.02,
              conversion_rate: 7.99,
              cpc: 0.25,
              cpm: 20.15,
              roas: 3.7,
            },
            status: "active",
            confidence_level: 82,
            traffic_allocation: 20,
            start_time: new Date(Date.now() - 8.5 * 60 * 60 * 1000),
            projected_winner_probability: 5,
          },
          {
            id: "var-005",
            name: "Variant D - Emotional",
            platform: "Multi-platform",
            content: {
              title: "Your Future Starts Today",
              description: "Embrace the change",
              cta: "Begin Journey",
            },
            metrics: {
              impressions: 12600,
              reach: 10100,
              clicks: 893,
              engagements: 1123,
              conversions: 71,
              cost: 256.2,
              ctr: 7.09,
              engagement_rate: 8.91,
              conversion_rate: 7.95,
              cpc: 0.29,
              cpm: 20.33,
              roas: 3.1,
            },
            status: "active",
            confidence_level: 74,
            traffic_allocation: 20,
            start_time: new Date(Date.now() - 8.5 * 60 * 60 * 1000),
            projected_winner_probability: 0,
          },
        ],
      },
    ];

    const mockPlatformMetrics: PlatformMetrics[] = [
      {
        platform: "Facebook",
        icon: <Share2 className="h-5 w-5" />,
        color: "#1877f2",
        total_impressions: 15400,
        total_reach: 12200,
        total_engagements: 1890,
        total_conversions: 89,
        total_cost: 310.5,
        avg_ctr: 8.7,
        avg_engagement_rate: 12.3,
        avg_conversion_rate: 8.1,
        top_variant: "Variant B - Urgency",
        status: "excellent",
      },
      {
        platform: "Instagram",
        icon: <Heart className="h-5 w-5" />,
        color: "#e4405f",
        total_impressions: 13800,
        total_reach: 11600,
        total_engagements: 2140,
        total_conversions: 76,
        total_cost: 289.2,
        avg_ctr: 9.2,
        avg_engagement_rate: 15.5,
        avg_conversion_rate: 7.8,
        top_variant: "Variant A - Video Focus",
        status: "excellent",
      },
      {
        platform: "LinkedIn",
        icon: <Users className="h-5 w-5" />,
        color: "#0a66c2",
        total_impressions: 8900,
        total_reach: 7200,
        total_engagements: 1120,
        total_conversions: 94,
        total_cost: 245.8,
        avg_ctr: 7.1,
        avg_engagement_rate: 12.6,
        avg_conversion_rate: 10.6,
        top_variant: "Variant C - Social Proof",
        status: "good",
      },
      {
        platform: "TikTok",
        icon: <Play className="h-5 w-5" />,
        color: "#ff0050",
        total_impressions: 18200,
        total_reach: 15400,
        total_engagements: 2890,
        total_conversions: 45,
        total_cost: 198.7,
        avg_ctr: 11.8,
        avg_engagement_rate: 15.9,
        avg_conversion_rate: 4.2,
        top_variant: "Variant A - Video Focus",
        status: "good",
      },
      {
        platform: "Twitter",
        icon: <MessageCircle className="h-5 w-5" />,
        color: "#1da1f2",
        total_impressions: 11700,
        total_reach: 9800,
        total_engagements: 1450,
        total_conversions: 58,
        total_cost: 234.9,
        avg_ctr: 6.8,
        avg_engagement_rate: 12.4,
        avg_conversion_rate: 6.9,
        top_variant: "Variant B - Urgency",
        status: "warning",
      },
    ];

    setActiveTests(mockTests);
    setPlatformMetrics(mockPlatformMetrics);
    setSelectedTest(mockTests[0]);
  };

  const updateRealTimeMetrics = () => {
    setActiveTests(prevTests =>
      prevTests.map(test => ({
        ...test,
        elapsed_time: test.elapsed_time + 5 / 3600, // Add 5 seconds in hours
        spent_budget: test.spent_budget + Math.random() * 2,
        variants: test.variants.map(variant => ({
          ...variant,
          metrics: {
            ...variant.metrics,
            impressions:
              variant.metrics.impressions + Math.floor(Math.random() * 50),
            reach: variant.metrics.reach + Math.floor(Math.random() * 40),
            clicks: variant.metrics.clicks + Math.floor(Math.random() * 5),
            engagements:
              variant.metrics.engagements + Math.floor(Math.random() * 8),
            conversions:
              variant.metrics.conversions + Math.floor(Math.random() * 2),
            cost: variant.metrics.cost + Math.random() * 1.5,
          },
          confidence_level: Math.min(
            99,
            variant.confidence_level + Math.random() * 0.5
          ),
        })),
      }))
    );
  };

  const getWinnerVariant = (test: LiveTest) => {
    return test.variants.reduce((prev, current) =>
      current.projected_winner_probability > prev.projected_winner_probability
        ? current
        : prev
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-blue-500";
      case "warning":
        return "bg-yellow-500";
      case "poor":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  if (!selectedTest) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Live Test Dashboard
            </h1>
            <p className="text-slate-400 mt-2">
              Real-time 5-channel content testing with automated winner
              deployment
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`${autoRefresh ? "bg-blue-500/20 border-blue-500/40" : "bg-slate-800/50 border-slate-700"}`}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`}
              />
              Auto Refresh
            </Button>

            <div className="text-xs text-slate-400">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Test Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Test Progress</p>
                  <p className="text-2xl font-bold text-white">
                    {formatPercentage(
                      (selectedTest.elapsed_time / selectedTest.test_duration) *
                        100
                    )}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
              <Progress
                value={
                  (selectedTest.elapsed_time / selectedTest.test_duration) * 100
                }
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                {selectedTest.elapsed_time.toFixed(1)}h /{" "}
                {selectedTest.test_duration}h
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Impressions</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(
                      selectedTest.variants.reduce(
                        (sum, v) => sum + v.metrics.impressions,
                        0
                      )
                    )}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Conversions</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedTest.variants.reduce(
                      (sum, v) => sum + v.metrics.conversions,
                      0
                    )}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Spent Budget</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(selectedTest.spent_budget)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                of {formatCurrency(selectedTest.total_budget)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Winner Alert */}
        {getWinnerVariant(selectedTest).confidence_level > 90 && (
          <Alert className="border-green-500/20 bg-green-500/10">
            <Crown className="h-4 w-4" />
            <AlertDescription className="text-green-400">
              <strong>{getWinnerVariant(selectedTest).name}</strong> is leading
              with{" "}
              {formatPercentage(
                getWinnerVariant(selectedTest).confidence_level
              )}{" "}
              confidence.
              {selectedTest.auto_deploy &&
                getWinnerVariant(selectedTest).confidence_level >=
                  selectedTest.winner_threshold &&
                " Auto-deployment triggered!"}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="variants" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger
              value="variants"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              <Star className="w-4 h-4 mr-2" />
              Variants Performance
            </TabsTrigger>
            <TabsTrigger
              value="platforms"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Platform Analysis
            </TabsTrigger>
            <TabsTrigger
              value="realtime"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              <Zap className="w-4 h-4 mr-2" />
              Real-time Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="variants" className="space-y-6">
            {/* Variants Comparison */}
            <div className="grid grid-cols-1 gap-4">
              {selectedTest.variants.map((variant, index) => (
                <Card
                  key={variant.id}
                  className="bg-slate-800/50 border-slate-700"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <CardTitle className="text-lg text-white">
                          {variant.name}
                        </CardTitle>
                        {variant.projected_winner_probability > 30 && (
                          <Crown className="h-5 w-5 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-white">
                          {formatPercentage(variant.confidence_level)}{" "}
                          confidence
                        </Badge>
                        <Badge
                          variant={
                            variant.projected_winner_probability > 30
                              ? "default"
                              : "secondary"
                          }
                          className={
                            variant.projected_winner_probability > 30
                              ? "bg-green-600"
                              : ""
                          }
                        >
                          {formatPercentage(
                            variant.projected_winner_probability
                          )}{" "}
                          win probability
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">CTR</p>
                        <p className="text-lg font-semibold text-white">
                          {formatPercentage(variant.metrics.ctr)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">
                          Conversion Rate
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {formatPercentage(variant.metrics.conversion_rate)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">ROAS</p>
                        <p className="text-lg font-semibold text-white">
                          {variant.metrics.roas.toFixed(1)}x
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">CPC</p>
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency(variant.metrics.cpc)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">Conversions</p>
                        <p className="text-lg font-semibold text-white">
                          {variant.metrics.conversions}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">Spent</p>
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency(variant.metrics.cost)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-6">
            {/* Platform Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformMetrics.map(platform => (
                <Card
                  key={platform.platform}
                  className="bg-slate-800/50 border-slate-700"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${platform.color}20` }}
                        >
                          {platform.icon}
                        </div>
                        <CardTitle className="text-white">
                          {platform.platform}
                        </CardTitle>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(platform.status)}`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm">Impressions</p>
                        <p className="text-lg font-semibold text-white">
                          {formatNumber(platform.total_impressions)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Conversions</p>
                        <p className="text-lg font-semibold text-white">
                          {platform.total_conversions}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Avg CTR</p>
                        <p className="text-lg font-semibold text-white">
                          {formatPercentage(platform.avg_ctr)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Spent</p>
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency(platform.total_cost)}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-700">
                      <p className="text-slate-400 text-sm">Top Variant</p>
                      <p className="text-sm font-medium text-blue-400">
                        {platform.top_variant}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            {/* Real-time Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Conversion Rate Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={selectedTest.variants.map((variant, index) => ({
                        name: variant.name.split(" - ")[1] || variant.name,
                        conversion_rate: variant.metrics.conversion_rate,
                        confidence: variant.confidence_level,
                        color: COLORS[index],
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="conversion_rate"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">ROAS Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={selectedTest.variants.map((variant, index) => ({
                        name: variant.name.split(" - ")[1] || variant.name,
                        roas: variant.metrics.roas,
                        fill: COLORS[index],
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="roas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Winner Deployment Status */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Deployment Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTest.variants
                    .sort(
                      (a, b) =>
                        b.projected_winner_probability -
                        a.projected_winner_probability
                    )
                    .slice(0, 3)
                    .map((variant, index) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`text-2xl ${index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}`}
                          >
                            {index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {variant.name}
                            </p>
                            <p className="text-sm text-slate-400">
                              {formatPercentage(
                                variant.projected_winner_probability
                              )}{" "}
                              win probability
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {variant.confidence_level >=
                          selectedTest.winner_threshold ? (
                            <Badge className="bg-green-600">
                              Ready to Deploy
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              {formatPercentage(variant.confidence_level)}{" "}
                              confidence
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
