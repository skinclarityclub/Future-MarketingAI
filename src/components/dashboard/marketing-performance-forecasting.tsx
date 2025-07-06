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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Brain,
  Target,
  DollarSign,
  Users,
  BarChart3,
  Lightbulb,
  Zap,
  Calendar,
  RefreshCw,
  Settings,
} from "lucide-react";
import { UltraPremiumCard } from "@/components/layout/ultra-premium-dashboard-layout";

// Types for forecasting data
interface MarketingForecast {
  metric: string;
  current_value: number;
  forecasts: {
    date: string;
    predicted_value: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
    confidence_score: number;
    trend: "up" | "down" | "stable";
  }[];
  insights: {
    summary: string;
    trend: "upward" | "downward" | "stable" | "volatile";
    seasonality_detected: boolean;
    volatility_level: "low" | "medium" | "high";
    key_drivers: string[];
    risk_factors: string[];
    opportunities: string[];
  };
  model_performance: {
    accuracy: number;
    confidence: number;
    last_updated: string;
  };
  alerts: {
    type: "warning" | "opportunity" | "critical";
    message: string;
    severity: number;
  }[];
}

interface ForecastChartData {
  date: string;
  actual?: number;
  predicted: number;
  lower: number;
  upper: number;
  confidence: number;
}

type ForecastTimeframe = "short" | "medium" | "long";
type ForecastMetric = "roi" | "leads" | "conversion_rate" | "spend" | "revenue";

const FORECAST_METRICS: Record<
  ForecastMetric,
  {
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    unit: string;
    format: (value: number) => string;
  }
> = {
  roi: {
    label: "Campaign ROI",
    icon: Target,
    color: "text-green-500",
    unit: "%",
    format: value => `${value.toFixed(1)}%`,
  },
  leads: {
    label: "Lead Generation",
    icon: Users,
    color: "text-blue-500",
    unit: "leads",
    format: value => value.toLocaleString("nl-NL"),
  },
  conversion_rate: {
    label: "Conversion Rate",
    icon: BarChart3,
    color: "text-purple-500",
    unit: "%",
    format: value => `${value.toFixed(2)}%`,
  },
  spend: {
    label: "Marketing Spend",
    icon: DollarSign,
    color: "text-orange-500",
    unit: "EUR",
    format: value => `€${(value / 1000).toFixed(1)}K`,
  },
  revenue: {
    label: "Attributed Revenue",
    icon: TrendingUp,
    color: "text-emerald-500",
    unit: "EUR",
    format: value => `€${(value / 1000).toFixed(1)}K`,
  },
};

const TIMEFRAME_OPTIONS = {
  short: { label: "7 dagen", days: 7 },
  medium: { label: "30 dagen", days: 30 },
  long: { label: "90 dagen", days: 90 },
};

// Mock forecast data (in real implementation, this would come from ML service)
const generateMockForecast = (
  metric: ForecastMetric,
  timeframe: ForecastTimeframe
): MarketingForecast => {
  const baseValues: Record<ForecastMetric, number> = {
    roi: 325,
    leads: 1247,
    conversion_rate: 3.8,
    spend: 45000,
    revenue: 142000,
  };

  const baseValue = baseValues[metric];
  const days = TIMEFRAME_OPTIONS[timeframe].days;

  const forecasts = [];
  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Simulate trend with some seasonality and noise
    const trendFactor =
      1 + Math.sin(i / 7) * 0.05 + (Math.random() - 0.5) * 0.02;
    const baseGrowth = metric === "spend" ? 1.002 : 1.005; // Spending grows slower
    const predicted_value = baseValue * Math.pow(baseGrowth, i) * trendFactor;

    const confidence = Math.max(0.6, 0.95 - (i / days) * 0.3); // Confidence decreases over time
    const uncertainty = predicted_value * (0.1 + (i / days) * 0.1);

    forecasts.push({
      date: date.toISOString().split("T")[0],
      predicted_value,
      confidence_interval: {
        lower: Math.max(0, predicted_value - uncertainty),
        upper: predicted_value + uncertainty,
      },
      confidence_score: confidence * 100,
      trend:
        predicted_value > baseValue
          ? "up"
          : predicted_value < baseValue * 0.95
            ? "down"
            : "stable",
    });
  }

  const finalValue = forecasts[forecasts.length - 1].predicted_value;
  const changePercent = ((finalValue - baseValue) / baseValue) * 100;

  return {
    metric,
    current_value: baseValue,
    forecasts,
    insights: {
      summary: `${FORECAST_METRICS[metric].label} voorspeld om ${changePercent > 0 ? "te stijgen" : changePercent < -5 ? "te dalen" : "stabiel te blijven"} met ${Math.abs(changePercent).toFixed(1)}% verandering`,
      trend:
        changePercent > 5
          ? "upward"
          : changePercent < -5
            ? "downward"
            : "stable",
      seasonality_detected: Math.random() > 0.5,
      volatility_level:
        Math.abs(changePercent) > 15
          ? "high"
          : Math.abs(changePercent) > 8
            ? "medium"
            : "low",
      key_drivers: [
        "Historical performance",
        "Seasonal patterns",
        "Market trends",
      ],
      risk_factors:
        changePercent < -10 ? ["Budget constraints", "Market saturation"] : [],
      opportunities:
        changePercent > 10
          ? ["Scale successful campaigns", "Invest in growth"]
          : [],
    },
    model_performance: {
      accuracy: 0.85 + Math.random() * 0.1,
      confidence: 0.78 + Math.random() * 0.15,
      last_updated: new Date().toISOString(),
    },
    alerts:
      changePercent < -10
        ? [
            {
              type: "warning",
              message: `${FORECAST_METRICS[metric].label} verwacht significant te dalen`,
              severity: Math.abs(changePercent) / 10,
            },
          ]
        : changePercent > 15
          ? [
              {
                type: "opportunity",
                message: `Sterke groei voorspeld voor ${FORECAST_METRICS[metric].label}`,
                severity: changePercent / 20,
              },
            ]
          : [],
  };
};

interface MarketingPerformanceForecastingProps {
  className?: string;
}

export default function MarketingPerformanceForecasting({
  className = "",
}: MarketingPerformanceForecastingProps) {
  const [selectedMetric, setSelectedMetric] = useState<ForecastMetric>("roi");
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<ForecastTimeframe>("medium");
  const [forecastData, setForecastData] = useState<MarketingForecast | null>(
    null
  );
  const [chartData, setChartData] = useState<ForecastChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch forecast data
  const fetchForecastData = async () => {
    setIsLoading(true);
    try {
      // Try to call the marketing performance forecast API
      const response = await fetch(
        `/api/marketing/performance-forecast?metric=${selectedMetric}&timeframe=${selectedTimeframe}&includeConfidence=true&includeAnomalies=true&includeSeasonality=true`
      );

      if (!response.ok) {
        console.warn(
          `API error: ${response.status}, falling back to mock data`
        );
        throw new Error(`API error: ${response.status}`);
      }

      const apiData = await response.json();

      if (!apiData.success) {
        console.warn(
          `API returned error: ${apiData.error}, falling back to mock data`
        );
        throw new Error(apiData.error || "API returned error");
      }

      // Use real API data
      setForecastData(apiData.data);

      // Transform data for chart
      const chartData: ForecastChartData[] = apiData.data.forecasts.map(
        (forecast: any) => ({
          date: new Date(forecast.date).toLocaleDateString("nl-NL", {
            month: "short",
            day: "numeric",
          }),
          predicted: forecast.predicted_value,
          lower: forecast.confidence_interval.lower,
          upper: forecast.confidence_interval.upper,
          confidence: forecast.confidence_score,
        })
      );

      // Add current value as starting point
      chartData.unshift({
        date: "Vandaag",
        actual: apiData.data.current_value,
        predicted: apiData.data.current_value,
        lower: apiData.data.current_value,
        upper: apiData.data.current_value,
        confidence: 100,
      });

      setChartData(chartData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch forecast data, using mock data:", error);

      // Fallback to mock data when API fails
      const mockData = generateMockForecast(selectedMetric, selectedTimeframe);
      setForecastData(mockData);

      // Transform mock data for chart
      const chartData: ForecastChartData[] = mockData.forecasts.map(
        forecast => ({
          date: new Date(forecast.date).toLocaleDateString("nl-NL", {
            month: "short",
            day: "numeric",
          }),
          predicted: forecast.predicted_value,
          lower: forecast.confidence_interval.lower,
          upper: forecast.confidence_interval.upper,
          confidence: forecast.confidence_score,
        })
      );

      // Add current value as starting point
      chartData.unshift({
        date: "Vandaag",
        actual: mockData.current_value,
        predicted: mockData.current_value,
        lower: mockData.current_value,
        upper: mockData.current_value,
        confidence: 100,
      });

      setChartData(chartData);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and data refresh
  useEffect(() => {
    fetchForecastData();
  }, [selectedMetric, selectedTimeframe]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "upward":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "downward":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getVolatilityColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "opportunity":
        return <Lightbulb className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const selectedMetricConfig = FORECAST_METRICS[selectedMetric];
  const Icon = selectedMetricConfig.icon;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Controls */}
      <UltraPremiumCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Brain className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  Predictive Marketing Analytics
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30"
                  >
                    AI-Powered
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  ML-driven performance forecasting en trend analyse
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NormalButton
                onClick={fetchForecastData}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Ververs
              </NormalButton>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Metric:</label>
              <Select
                value={selectedMetric}
                onValueChange={(value: string) =>
                  setSelectedMetric(value as ForecastMetric)
                }
              >
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {Object.entries(FORECAST_METRICS).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Periode:</label>
              <Select
                value={selectedTimeframe}
                onValueChange={(value: string) =>
                  setSelectedTimeframe(value as ForecastTimeframe)
                }
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {Object.entries(TIMEFRAME_OPTIONS).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-gray-400">
              Laatste update: {lastUpdated.toLocaleTimeString("nl-NL")}
            </div>
          </div>
        </CardHeader>
      </UltraPremiumCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Chart */}
        <UltraPremiumCard colSpan={2}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Icon className={`h-5 w-5 ${selectedMetricConfig.color}`} />
              {selectedMetricConfig.label} Forecast
            </CardTitle>
            <CardDescription className="text-gray-400">
              Voorspelde waarden met confidence intervals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-400">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span>ML modellen aan het analyseren...</span>
                </div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={value =>
                        selectedMetricConfig.format(value)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#F3F4F6",
                      }}
                      formatter={(value: any, name: string) => [
                        selectedMetricConfig.format(value),
                        name === "predicted"
                          ? "Voorspeld"
                          : name === "actual"
                            ? "Werkelijk"
                            : name === "lower"
                              ? "Ondergrens"
                              : "Bovengrens",
                      ]}
                    />

                    {/* Confidence interval area */}
                    <Area
                      dataKey="upper"
                      stackId="1"
                      stroke="transparent"
                      fill="url(#confidenceGradient)"
                      fillOpacity={0.2}
                    />
                    <Area
                      dataKey="lower"
                      stackId="1"
                      stroke="transparent"
                      fill="transparent"
                      fillOpacity={0}
                    />

                    {/* Actual values line */}
                    <Line
                      dataKey="actual"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: "#10B981", r: 4 }}
                      connectNulls={false}
                    />

                    {/* Predicted values line */}
                    <Line
                      dataKey="predicted"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "#3B82F6", r: 3 }}
                    />

                    {/* Reference line for current value */}
                    <ReferenceLine
                      x="Vandaag"
                      stroke="#6B7280"
                      strokeDasharray="2 2"
                      label={{ value: "Nu", position: "topLeft" }}
                    />

                    <defs>
                      <linearGradient
                        id="confidenceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </UltraPremiumCard>

        {/* Insights & Analytics */}
        <div className="space-y-6">
          {/* Current Metrics */}
          <UltraPremiumCard>
            <CardHeader>
              <CardTitle className="text-sm text-white">
                Huidige Waarde
              </CardTitle>
            </CardHeader>
            <CardContent>
              {forecastData && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {selectedMetricConfig.format(forecastData.current_value)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {selectedMetricConfig.label}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    {getTrendIcon(forecastData.insights.trend)}
                    <span className="text-sm text-gray-300 capitalize">
                      {forecastData.insights.trend} trend
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-white font-medium">
                        {(
                          forecastData.model_performance.accuracy * 100
                        ).toFixed(1)}
                        %
                      </div>
                      <div className="text-gray-400">Nauwkeurigheid</div>
                    </div>
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-white font-medium">
                        {(
                          forecastData.model_performance.confidence * 100
                        ).toFixed(1)}
                        %
                      </div>
                      <div className="text-gray-400">Vertrouwen</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </UltraPremiumCard>

          {/* Insights */}
          <UltraPremiumCard>
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {forecastData && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-300">
                    {forecastData.insights.summary}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Seizoenaliteit:</span>
                      <Badge
                        variant={
                          forecastData.insights.seasonality_detected
                            ? "default"
                            : "secondary"
                        }
                      >
                        {forecastData.insights.seasonality_detected
                          ? "Gedetecteerd"
                          : "Niet gevonden"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Volatiliteit:</span>
                      <span
                        className={`capitalize ${getVolatilityColor(forecastData.insights.volatility_level)}`}
                      >
                        {forecastData.insights.volatility_level}
                      </span>
                    </div>
                  </div>

                  {forecastData.insights.opportunities.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-green-400 mb-2">
                        Kansen:
                      </div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {forecastData.insights.opportunities.map(
                          (opportunity, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                              {opportunity}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {forecastData.insights.risk_factors.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-yellow-400 mb-2">
                        Risico's:
                      </div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {forecastData.insights.risk_factors.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </UltraPremiumCard>
        </div>
      </div>

      {/* Alerts */}
      {forecastData && forecastData.alerts.length > 0 && (
        <UltraPremiumCard>
          <CardHeader>
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecastData.alerts.map((alert, i) => (
                <Alert
                  key={i}
                  className={`border-l-4 ${
                    alert.type === "critical"
                      ? "border-red-500 bg-red-500/10"
                      : alert.type === "warning"
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-green-500 bg-green-500/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <AlertDescription className="text-white">
                      {alert.message}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </UltraPremiumCard>
      )}
    </div>
  );
}
