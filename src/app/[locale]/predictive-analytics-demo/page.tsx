"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PredictiveDashboard } from "@/components/analytics/predictive-dashboard";
import {
  BusinessForecast,
  PredictiveInsight,
} from "@/lib/analytics/predictive-analytics-service";
import { Loader2, Brain, TrendingUp, Zap, BarChart3 } from "lucide-react";

export default function PredictiveAnalyticsDemo() {
  const [forecasts, setForecasts] = useState<BusinessForecast[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch forecasts from API
  const fetchForecasts = async (timeframe: string = "medium") => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/predictive-analytics/forecasts?timeframe=${timeframe}&metrics=revenue,customers,orders`
      );
      const data = await response.json();

      if (data.success) {
        setForecasts(data.data.forecasts);
        setLastUpdated(new Date());
      } else {
        setError(data.error || "Failed to fetch forecasts");
      }
    } catch (err) {
      setError("Network error while fetching forecasts");
      console.error("Forecast fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch insights from API
  const fetchInsights = async () => {
    try {
      const response = await fetch("/api/predictive-analytics/insights");
      const data = await response.json();

      if (data.success) {
        setInsights(data.data.insights);
      } else {
        console.error("Failed to fetch insights:", data.error);
      }
    } catch (err) {
      console.error("Insights fetch error:", err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchForecasts();
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    fetchForecasts();
    fetchInsights();
  };

  const handleConfigChange = () => {
    // Placeholder for configuration dialog
    alert("Configuration panel coming soon!");
  };

  // Generate demo insights if none exist
  const demoInsights: PredictiveInsight[] =
    insights.length > 0
      ? insights
      : [
          {
            id: "insight-1",
            type: "trend",
            priority: "high",
            title: "Revenue Growth Acceleration",
            description:
              "Revenue is showing strong upward momentum with 15% growth expected over the next 30 days.",
            impact: {
              financial: 150000,
              operational: "Increased customer acquisition",
              strategic: "Market expansion opportunity",
            },
            confidence: 0.87,
            actionableRecommendations: [
              "Increase marketing budget to capitalize on growth momentum",
              "Scale customer support team to handle increased volume",
              "Prepare inventory for higher demand",
            ],
            timeRelevance: {
              urgency: "short_term",
              deadline: "2025-01-15",
            },
            dataSupport: {
              sources: ["financial", "marketing"],
              qualityScore: 0.92,
              lastUpdated: new Date().toISOString(),
            },
          },
          {
            id: "insight-2",
            type: "opportunity",
            priority: "medium",
            title: "Customer Acquisition Efficiency",
            description:
              "Customer acquisition costs have decreased by 12% while conversion rates improved.",
            impact: {
              financial: 75000,
              operational: "Improved marketing ROI",
              strategic: "Sustainable growth foundation",
            },
            confidence: 0.79,
            actionableRecommendations: [
              "Allocate more budget to high-performing channels",
              "Analyze successful conversion patterns",
              "Expand winning marketing campaigns",
            ],
            timeRelevance: {
              urgency: "medium_term",
            },
            dataSupport: {
              sources: ["marketing"],
              qualityScore: 0.88,
              lastUpdated: new Date().toISOString(),
            },
          },
          {
            id: "insight-3",
            type: "risk",
            priority: "critical",
            title: "Seasonal Demand Fluctuation",
            description:
              "Historical data suggests potential 20% decline in orders during Q1 due to seasonal patterns.",
            impact: {
              financial: -200000,
              operational: "Revenue volatility",
              strategic: "Cash flow management challenge",
            },
            confidence: 0.82,
            actionableRecommendations: [
              "Develop Q1 promotional campaigns",
              "Diversify product offerings for Q1",
              "Implement predictive inventory management",
              "Create customer retention programs",
            ],
            timeRelevance: {
              urgency: "immediate",
              deadline: "2024-12-31",
            },
            dataSupport: {
              sources: ["financial", "shopify"],
              qualityScore: 0.91,
              lastUpdated: new Date().toISOString(),
            },
          },
        ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Predictive Analytics Demo
            </h1>
          </div>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of business intelligence with AI-powered
            forecasting, real-time insights, and strategic recommendations.
          </p>

          {lastUpdated && (
            <Badge variant="secondary" className="text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Advanced Forecasting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ARIMA, Exponential Smoothing, and Ensemble methods for accurate
                business predictions
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Real-time Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automated anomaly detection and opportunity identification with
                confidence scoring
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Interactive Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dynamic visualizations with confidence intervals and
                customizable timeframes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && forecasts.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                <p className="text-muted-foreground">
                  Generating AI-powered forecasts and insights...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard */}
        {(forecasts.length > 0 || !isLoading) && (
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="api">API Demo</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <PredictiveDashboard
                forecasts={forecasts}
                insights={demoInsights}
                isLoading={isLoading}
                onRefresh={handleRefresh}
                onConfigChange={handleConfigChange}
                className="bg-white rounded-xl shadow-lg p-6"
              />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Detailed Predictive Insights
                  </CardTitle>
                  <CardDescription>
                    AI-generated business intelligence with actionable
                    recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {demoInsights.map(insight => (
                      <div
                        key={insight.id}
                        className="border rounded-lg p-6 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  insight.priority === "critical"
                                    ? "destructive"
                                    : insight.priority === "high"
                                      ? "destructive"
                                      : "default"
                                }
                              >
                                {insight.priority}
                              </Badge>
                              <Badge variant="outline">{insight.type}</Badge>
                            </div>
                            <h3 className="text-lg font-semibold">
                              {insight.title}
                            </h3>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {Math.round(insight.confidence * 100)}% confidence
                          </div>
                        </div>

                        <p className="text-muted-foreground">
                          {insight.description}
                        </p>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-2">
                              Business Impact
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div>
                                Financial:{" "}
                                <span className="font-medium">
                                  {insight.impact.financial > 0 ? "+" : ""}$
                                  {insight.impact.financial.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                Operational:{" "}
                                <span className="font-medium">
                                  {insight.impact.operational}
                                </span>
                              </div>
                              <div>
                                Strategic:{" "}
                                <span className="font-medium">
                                  {insight.impact.strategic}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">
                              Recommended Actions
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {insight.actionableRecommendations
                                .slice(0, 3)
                                .map((rec, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                                    <span>{rec}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                  <CardDescription>
                    Test the predictive analytics API endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Forecasts API</h4>
                      <code className="text-sm bg-muted p-2 rounded block">
                        GET /api/predictive-analytics/forecasts
                      </code>
                      <p className="text-sm text-muted-foreground">
                        Generate business forecasts for revenue, customers, and
                        orders
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Insights API</h4>
                      <code className="text-sm bg-muted p-2 rounded block">
                        GET /api/predictive-analytics/insights
                      </code>
                      <p className="text-sm text-muted-foreground">
                        Get AI-powered business insights and recommendations
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={() => fetchForecasts()}
                      disabled={isLoading}
                    >
                      Test Forecasts API
                    </Button>
                    <Button
                      onClick={() => fetchInsights()}
                      disabled={isLoading}
                      variant="outline"
                    >
                      Test Insights API
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-8">
          <p>
            Powered by Advanced ML Algorithms • ARIMA • Exponential Smoothing •
            Ensemble Methods
          </p>
        </div>
      </div>
    </div>
  );
}
