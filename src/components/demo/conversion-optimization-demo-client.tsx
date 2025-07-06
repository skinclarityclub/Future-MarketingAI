"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Target,
  BarChart3,
  Users,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  MousePointer,
  Crown,
  Zap,
  Gift,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import OptimizedConversionFlow from "@/components/ui/optimized-conversion-flow";
import { SubscriptionTier } from "@/lib/rbac/access-tier-service";

interface ConversionTestMetrics {
  variant: string;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

export default function ConversionOptimizationDemoClient() {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [testScenario, setTestScenario] = useState("new_user");
  const [targetTier, setTargetTier] =
    useState<SubscriptionTier>("professional");
  const [metrics, setMetrics] = useState<ConversionTestMetrics[]>([
    {
      variant: "urgency",
      impressions: 1000,
      clicks: 250,
      conversions: 45,
      conversionRate: 18.0,
      revenue: 1305,
    },
    {
      variant: "value",
      impressions: 1000,
      clicks: 180,
      conversions: 32,
      conversions: 17.8,
      revenue: 928,
    },
    {
      variant: "social_proof",
      impressions: 1000,
      clicks: 220,
      conversions: 48,
      conversionRate: 21.8,
      revenue: 1392,
    },
    {
      variant: "trial",
      impressions: 1000,
      clicks: 350,
      conversions: 126,
      conversionRate: 36.0,
      revenue: 3654,
    },
  ]);

  // Mock user behavior scenarios
  const testScenarios = {
    new_user: {
      pageViews: 3,
      featureAttempts: 1,
      sessionDuration: 120000, // 2 minutes
      dismissalCount: 0,
      urgency: "low" as const,
      description: "Nieuwe gebruiker, eerste sessie",
    },
    frequent_user: {
      pageViews: 15,
      featureAttempts: 8,
      sessionDuration: 450000, // 7.5 minutes
      dismissalCount: 2,
      urgency: "medium" as const,
      description: "Actieve gebruiker, meerdere feature pogingen",
    },
    power_user: {
      pageViews: 45,
      featureAttempts: 20,
      sessionDuration: 900000, // 15 minutes
      dismissalCount: 4,
      urgency: "high" as const,
      description: "Power user, veel feature gebruik",
    },
    skeptical_user: {
      pageViews: 8,
      featureAttempts: 3,
      sessionDuration: 180000, // 3 minutes
      dismissalCount: 5,
      urgency: "low" as const,
      description: "Sceptische gebruiker, vaak dismissed",
    },
  };

  const context = {
    currentTier: "free" as SubscriptionTier,
    targetTier,
    userBehavior: testScenarios[testScenario as keyof typeof testScenarios],
    featureContext: "analytics",
    pricePoint:
      targetTier === "professional"
        ? 49
        : targetTier === "enterprise"
          ? 99
          : 29,
    discount: 20,
  };

  const handleUpgrade = () => {
    alert(
      `🎉 Upgrade naar ${targetTier} gestart! In productie zou dit naar de checkout leiden.`
    );
    setShowPrompt(false);
    setIsTestRunning(false);
  };

  const handleDismiss = () => {
    console.log("Prompt dismissed");
    setShowPrompt(false);
    setIsTestRunning(false);
  };

  const startTest = () => {
    setIsTestRunning(true);
    setShowPrompt(true);
  };

  const resetTest = () => {
    setIsTestRunning(false);
    setShowPrompt(false);
  };

  const getBestVariant = () => {
    return metrics.reduce((best, current) =>
      current.conversionRate > best.conversionRate ? current : best
    );
  };

  const getVariantIcon = (variant: string) => {
    switch (variant) {
      case "urgency":
        return <Clock className="h-4 w-4 text-red-400" />;
      case "value":
        return <BarChart3 className="h-4 w-4 text-blue-400" />;
      case "social_proof":
        return <Users className="h-4 w-4 text-green-400" />;
      case "trial":
        return <Gift className="h-4 w-4 text-orange-400" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Conversion Flow Optimization Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Test verschillende A/B varianten van upgrade prompts en analyseer
            hun effectiviteit
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Hoe deze demo werkt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-300">
                  🎯 A/B Test Varianten:
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>
                    • <strong>Urgency:</strong> Tijdsdruk en schaarste
                  </li>
                  <li>
                    • <strong>Value:</strong> Feature voordelen en ROI
                  </li>
                  <li>
                    • <strong>Social Proof:</strong> Testimonials en
                    populariteit
                  </li>
                  <li>
                    • <strong>Trial:</strong> Gratis trial zonder risico
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-green-300">
                  📊 Smart Selection:
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Gebaseerd op gebruikersgedrag</li>
                  <li>• Dynamische context aanpassing</li>
                  <li>• Real-time performance tracking</li>
                  <li>• Geoptimaliseerd voor conversie</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                Test Configuratie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Gebruiker Scenario</Label>
                <Select value={testScenario} onValueChange={setTestScenario}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(testScenarios).map(([key, scenario]) => (
                      <SelectItem key={key} value={key}>
                        {scenario.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Tier</Label>
                <Select
                  value={targetTier}
                  onValueChange={value =>
                    setTargetTier(value as SubscriptionTier)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter (€29/maand)</SelectItem>
                    <SelectItem value="professional">
                      Professional (€49/maand)
                    </SelectItem>
                    <SelectItem value="enterprise">
                      Enterprise (€99/maand)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-300">Huidige Scenario:</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>
                    •{" "}
                    {
                      testScenarios[testScenario as keyof typeof testScenarios]
                        .pageViews
                    }{" "}
                    pageviews
                  </div>
                  <div>
                    •{" "}
                    {
                      testScenarios[testScenario as keyof typeof testScenarios]
                        .featureAttempts
                    }{" "}
                    feature pogingen
                  </div>
                  <div>
                    •{" "}
                    {
                      testScenarios[testScenario as keyof typeof testScenarios]
                        .dismissalCount
                    }{" "}
                    dismissals
                  </div>
                  <div>
                    •{" "}
                    {Math.round(
                      testScenarios[testScenario as keyof typeof testScenarios]
                        .sessionDuration / 60000
                    )}{" "}
                    min sessie
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <NormalButton
                  onClick={startTest}
                  disabled={isTestRunning}
                  className="w-full"
                  variant="primary"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isTestRunning ? "Test Loopt..." : "Start A/B Test"}
                </NormalButton>

                <NormalButton
                  onClick={resetTest}
                  variant="secondary"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Test
                </NormalButton>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Dashboard */}
          <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                A/B Test Resultaten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Best Performer Alert */}
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertTitle className="text-green-300">
                    Beste Variant
                  </AlertTitle>
                  <AlertDescription className="text-green-200">
                    <strong>{getBestVariant().variant}</strong> presteert het
                    beste met {getBestVariant().conversionRate}% conversie
                  </AlertDescription>
                </Alert>

                {/* Metrics Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {metrics.map(metric => (
                    <Card
                      key={metric.variant}
                      className="bg-gray-700/50 border-gray-600"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getVariantIcon(metric.variant)}
                            <span className="font-medium capitalize">
                              {metric.variant}
                            </span>
                          </div>
                          <Badge
                            variant={
                              metric.variant === getBestVariant().variant
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {metric.conversionRate}%
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Impressions:</span>
                            <span>{metric.impressions.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Clicks:</span>
                            <span>{metric.clicks}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Conversions:</span>
                            <span className="text-green-400">
                              {metric.conversions}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Revenue:</span>
                            <span className="text-blue-400">
                              €{metric.revenue.toLocaleString()}
                            </span>
                          </div>

                          <Progress
                            value={metric.conversionRate}
                            className="h-2 mt-2"
                            max={40}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Test Status */}
        {isTestRunning && (
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Eye className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-300">
                    Test Actief
                  </h3>
                  <p className="text-blue-200">
                    Conversion prompt wordt getoond op basis van het
                    geselecteerde scenario. Check de rechter benedenhoek voor de
                    prompt!
                  </p>
                </div>
                <div className="ml-auto">
                  <Badge variant="default" className="bg-blue-600">
                    <MousePointer className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Showcase */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Optimalisatie Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <h4 className="font-semibold text-green-300">
                    Smart Selection
                  </h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Gedragsgebaseerde variant selectie</li>
                  <li>• Contextuelle timing optimalisatie</li>
                  <li>• Dynamische inhoud aanpassing</li>
                  <li>• Performance-based routing</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  <h4 className="font-semibold text-blue-300">
                    Analytics Integratie
                  </h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Real-time conversie tracking</li>
                  <li>• Time-to-conversion metrieken</li>
                  <li>• Variant performance analyse</li>
                  <li>• ROI en revenue tracking</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  <h4 className="font-semibold text-purple-300">
                    Conversie Optimalisatie
                  </h4>
                </div>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• A/B test framework</li>
                  <li>• Multi-armed bandit algoritme</li>
                  <li>• Statistical significance testing</li>
                  <li>• Automated variant retirement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Flow Component */}
      {showPrompt && (
        <OptimizedConversionFlow
          context={context}
          onUpgrade={handleUpgrade}
          onDismiss={handleDismiss}
          enableAnalytics={true}
        />
      )}
    </div>
  );
}
