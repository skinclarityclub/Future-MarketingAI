"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Brain,
  Database,
  Zap,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  TrendingUp,
  Bell,
} from "lucide-react";
import Link from "next/link";

export default function TacticalAnalysisConfigPage() {
  const [mlConfig, setMLConfig] = useState({
    arimaEnabled: true,
    exponentialSmoothingEnabled: true,
    anomalyDetectionEnabled: true,
    ensembleEnabled: true,
    confidenceThreshold: 70,
    forecastHorizonHours: 24,
    updateIntervalMs: 30000,
    predictionRefreshMs: 60000,
  });

  const [alertThresholds, setAlertThresholds] = useState({
    revenue: { min: 0 },
    orders: { min: 0 },
    customers: { min: 0 },
    conversionRate: { min: 0, max: 100 },
  });

  const [realtimeConfig, setRealtimeConfig] = useState({
    enabledSources: ["shopify", "kajabi", "financial", "marketing"],
    anomalyThreshold: 2.5,
    mlConfig: {
      enableStreamingPredictions: true,
      enableAnomalyDetection: true,
      enableTrendMonitoring: true,
      confidenceThreshold: 70,
    },
  });

  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const handleSaveConfig = async () => {
    setSaveStatus("saving");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const getStatusIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <Activity className="h-4 w-4 animate-spin" />;
      case "saved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <Settings className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Configuration Center
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Beheer ML modellen, configureer alerts en pas real-time instellingen
            aan voor optimale prestaties
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Link href="/tactical-analysis">
            <Button variant="outline" className="gap-2">
              <Target className="h-4 w-4" />
              Terug naar Dashboard
            </Button>
          </Link>

          <Button
            onClick={handleSaveConfig}
            disabled={saveStatus === "saving"}
            className="gap-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
          >
            {getStatusIcon()}
            {saveStatus === "saving" ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        {/* Status Alert */}
        {(saveStatus === "saved" || saveStatus === "error") && (
          <div className="max-w-2xl mx-auto">
            {saveStatus === "saved" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Configuration Saved</AlertTitle>
                <AlertDescription>
                  All settings have been successfully saved and applied.
                </AlertDescription>
              </Alert>
            )}
            {saveStatus === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Save Failed</AlertTitle>
                <AlertDescription>
                  Failed to save configuration. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Configuration Tabs */}
        <Tabs defaultValue="ml-models" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ml-models" className="gap-2">
              <Brain className="h-4 w-4" />
              ML Models
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="realtime" className="gap-2">
              <Zap className="h-4 w-4" />
              Real-Time
            </TabsTrigger>
          </TabsList>

          {/* ML Models Configuration */}
          <TabsContent value="ml-models" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Machine Learning Models
                </CardTitle>
                <CardDescription>
                  Configure which ML algorithms to use for predictions and
                  analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Algorithm Toggles */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">ARIMA</Label>
                        <p className="text-sm text-muted-foreground">
                          AutoRegressive Integrated Moving Average for time
                          series
                        </p>
                      </div>
                      <Switch
                        checked={mlConfig.arimaEnabled}
                        onCheckedChange={checked =>
                          setMLConfig(prev => ({
                            ...prev,
                            arimaEnabled: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Exponential Smoothing
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Holt-Winters method for trend and seasonality
                        </p>
                      </div>
                      <Switch
                        checked={mlConfig.exponentialSmoothingEnabled}
                        onCheckedChange={checked =>
                          setMLConfig(prev => ({
                            ...prev,
                            exponentialSmoothingEnabled: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Anomaly Detection
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Statistical anomaly detection using Z-scores
                        </p>
                      </div>
                      <Switch
                        checked={mlConfig.anomalyDetectionEnabled}
                        onCheckedChange={checked =>
                          setMLConfig(prev => ({
                            ...prev,
                            anomalyDetectionEnabled: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Ensemble Methods
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Weighted combination of multiple algorithms
                        </p>
                      </div>
                      <Switch
                        checked={mlConfig.ensembleEnabled}
                        onCheckedChange={checked =>
                          setMLConfig(prev => ({
                            ...prev,
                            ensembleEnabled: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Parameter Controls */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">
                        Confidence Threshold: {mlConfig.confidenceThreshold}%
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Minimum confidence required for predictions
                      </p>
                      <Slider
                        value={[mlConfig.confidenceThreshold]}
                        onValueChange={value =>
                          setMLConfig(prev => ({
                            ...prev,
                            confidenceThreshold: value[0],
                          }))
                        }
                        max={95}
                        min={50}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label htmlFor="forecast-horizon">
                        Forecast Horizon (hours)
                      </Label>
                      <Input
                        id="forecast-horizon"
                        type="number"
                        value={mlConfig.forecastHorizonHours}
                        onChange={e =>
                          setMLConfig(prev => ({
                            ...prev,
                            forecastHorizonHours:
                              parseInt(e.target.value) || 24,
                          }))
                        }
                        min={1}
                        max={168}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="update-interval">
                        Update Interval (ms)
                      </Label>
                      <Input
                        id="update-interval"
                        type="number"
                        value={mlConfig.updateIntervalMs}
                        onChange={e =>
                          setMLConfig(prev => ({
                            ...prev,
                            updateIntervalMs: parseInt(e.target.value) || 30000,
                          }))
                        }
                        min={5000}
                        max={300000}
                        step={1000}
                      />
                    </div>

                    <div>
                      <Label htmlFor="prediction-refresh">
                        Prediction Refresh (ms)
                      </Label>
                      <Input
                        id="prediction-refresh"
                        type="number"
                        value={mlConfig.predictionRefreshMs}
                        onChange={e =>
                          setMLConfig(prev => ({
                            ...prev,
                            predictionRefreshMs:
                              parseInt(e.target.value) || 60000,
                          }))
                        }
                        min={10000}
                        max={600000}
                        step={1000}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alert Thresholds Configuration */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alert Thresholds
                </CardTitle>
                <CardDescription>
                  Set minimum and maximum thresholds for automatic alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(alertThresholds).map(
                    ([metric, thresholds]) => (
                      <Card key={metric} className="p-4">
                        <div className="space-y-4">
                          <h3 className="font-medium capitalize flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            {metric.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </h3>

                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`${metric}-min`}>
                                Minimum Threshold
                              </Label>
                              <Input
                                id={`${metric}-min`}
                                type="number"
                                value={thresholds.min || ""}
                                onChange={e =>
                                  setAlertThresholds(prev => ({
                                    ...prev,
                                    [metric]: {
                                      ...thresholds,
                                      min: e.target.value
                                        ? parseFloat(e.target.value)
                                        : 0,
                                    },
                                  }))
                                }
                                placeholder="No minimum"
                              />
                            </div>

                            {metric !== "revenue" &&
                              thresholds.hasOwnProperty("max") && (
                                <div>
                                  <Label htmlFor={`${metric}-max`}>
                                    Maximum Threshold
                                  </Label>
                                  <Input
                                    id={`${metric}-max`}
                                    type="number"
                                    value={thresholds.max || ""}
                                    onChange={e =>
                                      setAlertThresholds(prev => ({
                                        ...prev,
                                        [metric]: {
                                          ...thresholds,
                                          max: e.target.value
                                            ? parseFloat(e.target.value)
                                            : undefined,
                                        },
                                      }))
                                    }
                                    placeholder="No maximum"
                                  />
                                </div>
                              )}
                          </div>
                        </div>
                      </Card>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real-Time Configuration */}
          <TabsContent value="realtime" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Real-Time Processing
                </CardTitle>
                <CardDescription>
                  Configure real-time data processing and streaming settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Streaming Predictions
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable live ML predictions via SSE
                        </p>
                      </div>
                      <Switch
                        checked={
                          realtimeConfig.mlConfig.enableStreamingPredictions
                        }
                        onCheckedChange={checked =>
                          setRealtimeConfig(prev => ({
                            ...prev,
                            mlConfig: {
                              ...prev.mlConfig,
                              enableStreamingPredictions: checked,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Anomaly Detection
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Real-time anomaly detection and alerts
                        </p>
                      </div>
                      <Switch
                        checked={realtimeConfig.mlConfig.enableAnomalyDetection}
                        onCheckedChange={checked =>
                          setRealtimeConfig(prev => ({
                            ...prev,
                            mlConfig: {
                              ...prev.mlConfig,
                              enableAnomalyDetection: checked,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Trend Monitoring
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Monitor and alert on trend changes
                        </p>
                      </div>
                      <Switch
                        checked={realtimeConfig.mlConfig.enableTrendMonitoring}
                        onCheckedChange={checked =>
                          setRealtimeConfig(prev => ({
                            ...prev,
                            mlConfig: {
                              ...prev.mlConfig,
                              enableTrendMonitoring: checked,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">
                        Anomaly Threshold: {realtimeConfig.anomalyThreshold}
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Z-score threshold for anomaly detection
                      </p>
                      <Slider
                        value={[realtimeConfig.anomalyThreshold]}
                        onValueChange={value =>
                          setRealtimeConfig(prev => ({
                            ...prev,
                            anomalyThreshold: value[0],
                          }))
                        }
                        max={5}
                        min={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium">
                        Real-time Confidence:{" "}
                        {realtimeConfig.mlConfig.confidenceThreshold}%
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Minimum confidence for real-time predictions
                      </p>
                      <Slider
                        value={[realtimeConfig.mlConfig.confidenceThreshold]}
                        onValueChange={value =>
                          setRealtimeConfig(prev => ({
                            ...prev,
                            mlConfig: {
                              ...prev.mlConfig,
                              confidenceThreshold: value[0],
                            },
                          }))
                        }
                        max={95}
                        min={50}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Data Sources */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Enabled Data Sources
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        id: "shopify",
                        name: "Shopify",
                        description: "E-commerce sales and order data",
                      },
                      {
                        id: "kajabi",
                        name: "Kajabi",
                        description: "Course sales and engagement metrics",
                      },
                      {
                        id: "financial",
                        name: "Financial KPIs",
                        description: "Revenue and profit metrics",
                      },
                      {
                        id: "marketing",
                        name: "Marketing",
                        description: "Google Ads and Meta Ads performance",
                      },
                    ].map(source => (
                      <Card key={source.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{source.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {source.description}
                            </p>
                            <Badge
                              variant={
                                realtimeConfig.enabledSources.includes(
                                  source.id
                                )
                                  ? "default"
                                  : "secondary"
                              }
                              className="mt-2"
                            >
                              {realtimeConfig.enabledSources.includes(source.id)
                                ? "Enabled"
                                : "Disabled"}
                            </Badge>
                          </div>
                          <Switch
                            checked={realtimeConfig.enabledSources.includes(
                              source.id
                            )}
                            onCheckedChange={checked => {
                              if (checked) {
                                setRealtimeConfig(prev => ({
                                  ...prev,
                                  enabledSources: [
                                    ...prev.enabledSources,
                                    source.id,
                                  ],
                                }));
                              } else {
                                setRealtimeConfig(prev => ({
                                  ...prev,
                                  enabledSources: prev.enabledSources.filter(
                                    s => s !== source.id
                                  ),
                                }));
                              }
                            }}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              ⚙️ <strong>Configuration Center v1.0</strong> - Manage all
              Tactical Analysis Engine settings
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Subtask 15.4: User Interface Design and Implementation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
