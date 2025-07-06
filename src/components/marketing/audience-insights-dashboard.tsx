"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/context";
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
  RefreshCw,
  Users,
  TrendingUp,
  Target,
  Zap,
  AlertCircle,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

interface AudienceSegment {
  id: string;
  segment_name: string;
  segment_type: string;
  total_customers: number;
  avg_clv: number;
  avg_conversion_rate: number;
  primary_channel?: string;
}

interface AudienceInsight {
  segment: AudienceSegment;
  clv: number;
  growth_trend: number;
  top_channels: string[];
  recommendations: string[];
}

interface BudgetRecommendation {
  channel: string;
  current_allocation: number;
  recommended_allocation: number;
  expected_roi_improvement: number;
  reasoning: string;
}

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AudienceInsightsDashboard() {
  const { t } = useLocale();
  const [insights, setInsights] = useState<AudienceInsight[]>([]);
  const [budgetRecommendations, setBudgetRecommendations] = useState<
    BudgetRecommendation[]
  >([]);
  const [selectedSegment, _setSelectedSegment] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [totalBudget, _setTotalBudget] = useState(10000);

  useEffect(() => {
    loadInsights();
    loadBudgetRecommendations();
  }, [selectedSegment, timeRange]);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        action: "insights",
        ...(selectedSegment !== "all" && { segmentId: selectedSegment }),
      });

      const response = await fetch(
        `/api/marketing/audience-insights?${params}`
      );
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBudgetRecommendations = async () => {
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const params = new URLSearchParams({
        action: "budget-recommendations",
        totalBudget: totalBudget.toString(),
        startDate,
        endDate,
      });

      const response = await fetch(
        `/api/marketing/audience-insights?${params}`
      );
      const data = await response.json();
      setBudgetRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error loading budget recommendations:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getSegmentTypeColor = (type: string) => {
    const colors = {
      demographic: "bg-blue-100 text-blue-800",
      behavioral: "bg-green-100 text-green-800",
      geographic: "bg-purple-100 text-purple-800",
      psychographic: "bg-orange-100 text-orange-800",
      custom: "bg-gray-800/50 text-gray-300",
    };
    return (
      colors[type as keyof typeof colors] || "bg-gray-800/50 text-gray-300"
    );
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    );
  };

  const prepareSegmentPerformanceData = () => {
    return insights.map(insight => ({
      name: insight.segment.segment_name,
      clv: insight.clv,
      conversion_rate: insight.segment.avg_conversion_rate * 100,
      customers: insight.segment.total_customers,
    }));
  };

  const prepareBudgetAllocationData = () => {
    return budgetRecommendations.map(rec => ({
      channel: rec.channel,
      current: rec.current_allocation,
      recommended: rec.recommended_allocation,
      improvement: rec.expected_roi_improvement,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {t("audience.audienceInsights")}
          </h1>
          <p className="text-gray-600">
            {t("audience.advancedAnalysisDescription")}
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t("dates.sevenDays")}</SelectItem>
              <SelectItem value="30d">{t("dates.thirtyDays")}</SelectItem>
              <SelectItem value="90d">{t("dates.ninetyDays")}</SelectItem>
            </SelectContent>
          </Select>
          <NormalButton onClick={loadInsights} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </NormalButton>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="segments">{t("tabs.segments")}</TabsTrigger>
          <TabsTrigger value="budget">{t("tabs.budget")}</TabsTrigger>
          <TabsTrigger value="predictions">{t("tabs.predictions")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("audience.totalSegments")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.length}</div>
                <p className="text-xs text-muted-foreground">
                  {t("audience.activeAudiences")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("audience.averageClv")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    insights.reduce((sum, insight) => sum + insight.clv, 0) /
                      insights.length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("audience.customerLifetimeValue")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("audience.bestPerformingSegment")}
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights.find(
                    i => i.clv === Math.max(...insights.map(i => i.clv))
                  )?.segment.segment_name || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("audience.highestClvSegment")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("audience.growthTrend")}
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(
                    insights.reduce(
                      (sum, insight) => sum + insight.growth_trend,
                      0
                    ) / insights.length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("audience.averageGrowth")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("audience.segmentPerformance")}</CardTitle>
                <CardDescription>
                  {t("audience.clvVsConversionRate")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={prepareSegmentPerformanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "clv"
                          ? formatCurrency(Number(value))
                          : formatPercentage(Number(value)),
                        name === "clv" ? "CLV" : "Conversieratio",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="clv"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversion_rate"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("audience.budgetAllocation")}</CardTitle>
                <CardDescription>
                  {t("audience.currentVsRecommended")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareBudgetAllocationData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip
                      formatter={value => formatCurrency(Number(value))}
                    />
                    <Bar
                      dataKey="current"
                      fill="#8884d8"
                      name={t("audience.current")}
                    />
                    <Bar
                      dataKey="recommended"
                      fill="#82ca9d"
                      name={t("audience.recommended")}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments">
          <div className="grid gap-6">
            {insights.map(insight => (
              <Card key={insight.segment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {insight.segment.segment_name}
                        <Badge
                          className={getSegmentTypeColor(
                            insight.segment.segment_type
                          )}
                        >
                          {insight.segment.segment_type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {insight.segment.total_customers.toLocaleString()}{" "}
                        {t("audience.customers")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(insight.growth_trend)}
                      <span
                        className={`font-semibold ${insight.growth_trend > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatPercentage(insight.growth_trend)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Customer Lifetime Value
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(insight.clv)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Conversieratio</p>
                      <p className="text-lg font-semibold">
                        {formatPercentage(
                          insight.segment.avg_conversion_rate * 100
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Primair Kanaal</p>
                      <p className="text-lg font-semibold">
                        {insight.segment.primary_channel || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Top Kanalen</h4>
                    <div className="flex gap-2 flex-wrap">
                      {insight.top_channels.map(channel => (
                        <Badge key={channel} variant="outline">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Aanbevelingen
                    </h4>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 flex items-start gap-2"
                        >
                          <span className="text-blue-500 font-bold">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Optimalisatie</CardTitle>
                <CardDescription>
                  AI-gestuurde aanbevelingen voor betere ROI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {budgetRecommendations.map(rec => (
                    <div key={rec.channel} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold capitalize">
                          {rec.channel}
                        </h3>
                        <Badge
                          variant={
                            rec.expected_roi_improvement > 0
                              ? "default"
                              : "destructive"
                          }
                        >
                          {rec.expected_roi_improvement > 0 ? "+" : ""}
                          {formatPercentage(rec.expected_roi_improvement)} ROI
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-sm text-gray-600">Huidig Budget</p>
                          <p className="font-semibold">
                            {formatCurrency(rec.current_allocation)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Aanbevolen Budget
                          </p>
                          <p className="font-semibold">
                            {formatCurrency(rec.recommended_allocation)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle>Prestatie Voorspellingen</CardTitle>
              <CardDescription>
                Machine learning voorspellingen voor toekomstige prestaties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Voorspellingsmodellen worden geladen...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
