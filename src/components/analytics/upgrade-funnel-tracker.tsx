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
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowRight,
  DollarSign,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Filter,
  Download,
  RefreshCw,
  Eye,
  MousePointer,
  CreditCard,
  Star,
  Sparkles,
} from "lucide-react";
import { useBehaviorTracking } from "@/lib/analytics/behavior-tracking-provider";

interface UpgradeFunnelMetrics {
  totalUsers: number;
  freeUsers: number;
  trialUsers: number;
  paidUsers: number;
  conversionRates: {
    freeToTrial: number;
    trialToPaid: number;
    overall: number;
  };
  upgradeEvents: {
    upgradeHintShown: number;
    upgradeButtonClicked: number;
    pricingPageViewed: number;
    trialStarted: number;
    paymentCompleted: number;
  };
  dropOffPoints: Array<{
    step: string;
    users: number;
    dropOffRate: number;
    reasons: string[];
  }>;
  revenuePotential: number;
}

interface UpgradeFunnelTrackerProps {
  className?: string;
  timeRange?: "1h" | "24h" | "7d" | "30d";
  showRevenue?: boolean;
}

export default function UpgradeFunnelTracker({
  className = "",
  timeRange = "24h",
  showRevenue = true,
}: UpgradeFunnelTrackerProps) {
  const { getQueuedEvents, trackCustomEvent, isEnabled } =
    useBehaviorTracking();
  const [metrics, setMetrics] = useState<UpgradeFunnelMetrics>({
    totalUsers: 0,
    freeUsers: 0,
    trialUsers: 0,
    paidUsers: 0,
    conversionRates: {
      freeToTrial: 0,
      trialToPaid: 0,
      overall: 0,
    },
    upgradeEvents: {
      upgradeHintShown: 0,
      upgradeButtonClicked: 0,
      pricingPageViewed: 0,
      trialStarted: 0,
      paymentCompleted: 0,
    },
    dropOffPoints: [],
    revenuePotential: 0,
  });

  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Calculate upgrade funnel metrics from events
  useEffect(() => {
    if (!isEnabled) return;

    const calculateUpgradeMetrics = () => {
      const events = getQueuedEvents();

      // Track upgrade-related events
      const upgradeHintEvents = events.filter(
        e =>
          e.event_type === "custom" &&
          e.event_data.custom_event_name === "upgrade_hint_shown"
      );

      const upgradeClickEvents = events.filter(
        e =>
          e.event_type === "click" &&
          (e.event_data.element_text?.toLowerCase().includes("upgrade") ||
            e.event_data.element_id?.toLowerCase().includes("upgrade"))
      );

      const pricingPageEvents = events.filter(
        e => e.event_type === "page_view" && e.page_url.includes("pricing")
      );

      const trialEvents = events.filter(
        e =>
          e.event_type === "custom" &&
          e.event_data.custom_event_name === "trial_started"
      );

      const paymentEvents = events.filter(
        e =>
          e.event_type === "custom" &&
          e.event_data.custom_event_name === "payment_completed"
      );

      // Calculate user tiers (mock data for now)
      const totalUsers = Math.max(50, Math.floor(Math.random() * 200));
      const paidUsers = Math.floor(totalUsers * 0.15);
      const trialUsers = Math.floor(totalUsers * 0.12);
      const freeUsers = totalUsers - paidUsers - trialUsers;

      // Calculate conversion rates
      const freeToTrial = freeUsers > 0 ? (trialUsers / freeUsers) * 100 : 0;
      const trialToPaid = trialUsers > 0 ? (paidUsers / trialUsers) * 100 : 0;
      const overall = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;

      // Mock drop-off analysis
      const dropOffPoints = [
        {
          step: "Upgrade Hint Shown",
          users: upgradeHintEvents.length,
          dropOffRate: 65,
          reasons: [
            "Not interested in premium features",
            "Price concerns",
            "Feature not clear",
          ],
        },
        {
          step: "Pricing Page Visit",
          users: pricingPageEvents.length,
          dropOffRate: 45,
          reasons: [
            "Price too high",
            "No immediate need",
            "Comparing alternatives",
          ],
        },
        {
          step: "Trial Started",
          users: trialEvents.length,
          dropOffRate: 30,
          reasons: [
            "Limited trial period",
            "Feature limitations",
            "Setup complexity",
          ],
        },
        {
          step: "Payment Page",
          users: Math.floor(trialEvents.length * 0.7),
          dropOffRate: 20,
          reasons: [
            "Payment method issues",
            "Last-minute hesitation",
            "Need approval",
          ],
        },
      ];

      // Calculate revenue potential
      const avgRevenuePerUser = 29; // Mock average monthly revenue
      const revenuePotential =
        (freeUsers + trialUsers) * avgRevenuePerUser * (overall / 100);

      setMetrics({
        totalUsers,
        freeUsers,
        trialUsers,
        paidUsers,
        conversionRates: {
          freeToTrial,
          trialToPaid,
          overall,
        },
        upgradeEvents: {
          upgradeHintShown: upgradeHintEvents.length,
          upgradeButtonClicked: upgradeClickEvents.length,
          pricingPageViewed: pricingPageEvents.length,
          trialStarted: trialEvents.length,
          paymentCompleted: paymentEvents.length,
        },
        dropOffPoints,
        revenuePotential,
      });

      setLastUpdate(new Date());
    };

    calculateUpgradeMetrics();
    const interval = setInterval(calculateUpgradeMetrics, 30000);

    return () => clearInterval(interval);
  }, [getQueuedEvents, isEnabled]);

  const refreshData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const trackUpgradeIntent = (step: string) => {
    trackCustomEvent("upgrade_funnel_interaction", {
      step,
      timestamp: new Date().toISOString(),
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Upgrade Funnel Analytics
          </h2>
          <p className="text-gray-400 mt-1">
            Track user conversion journey from free tier to paid subscriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-sm text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="bg-gray-800 border-gray-600"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-white">
                  {metrics.totalUsers}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {timeRange} period
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">
                  {formatPercentage(metrics.conversionRates.overall)}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">
                +2.3% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Paid Users</p>
                <p className="text-2xl font-bold text-white">
                  {metrics.paidUsers}
                </p>
              </div>
              <Crown className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-yellow-400">
                {formatPercentage(
                  (metrics.paidUsers / metrics.totalUsers) * 100
                )}{" "}
                of total
              </span>
            </div>
          </CardContent>
        </Card>

        {showRevenue && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Revenue Potential</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(metrics.revenuePotential)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-400">Monthly potential</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Tier Distribution */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-400" />
            User Tier Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-500 rounded" />
                <span className="text-sm">Free Users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.freeUsers}</span>
                <span className="text-xs text-gray-400">
                  (
                  {formatPercentage(
                    (metrics.freeUsers / metrics.totalUsers) * 100
                  )}
                  )
                </span>
              </div>
            </div>
            <Progress
              value={(metrics.freeUsers / metrics.totalUsers) * 100}
              className="h-2"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm">Trial Users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {metrics.trialUsers}
                </span>
                <span className="text-xs text-gray-400">
                  (
                  {formatPercentage(
                    (metrics.trialUsers / metrics.totalUsers) * 100
                  )}
                  )
                </span>
              </div>
            </div>
            <Progress
              value={(metrics.trialUsers / metrics.totalUsers) * 100}
              className="h-2"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <span className="text-sm">Paid Users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.paidUsers}</span>
                <span className="text-xs text-gray-400">
                  (
                  {formatPercentage(
                    (metrics.paidUsers / metrics.totalUsers) * 100
                  )}
                  )
                </span>
              </div>
            </div>
            <Progress
              value={(metrics.paidUsers / metrics.totalUsers) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Conversion Funnel
          </CardTitle>
          <CardDescription>
            Track user journey through the upgrade process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.upgradeEvents).map(
              ([event, count], index) => {
                const eventNames = {
                  upgradeHintShown: "Upgrade Hint Shown",
                  upgradeButtonClicked: "Upgrade Button Clicked",
                  pricingPageViewed: "Pricing Page Viewed",
                  trialStarted: "Trial Started",
                  paymentCompleted: "Payment Completed",
                };

                const maxCount = Math.max(
                  ...Object.values(metrics.upgradeEvents)
                );
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <div key={event} className="relative">
                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">
                          {eventNames[event as keyof typeof eventNames]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">{count}</span>
                        <div className="w-32">
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </div>
                    </div>
                    {index <
                      Object.entries(metrics.upgradeEvents).length - 1 && (
                      <div className="flex justify-center my-2">
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Analysis */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            Drop-off Analysis
          </CardTitle>
          <CardDescription>
            Identify where users abandon the upgrade process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.dropOffPoints.map((point, index) => (
              <div key={point.step} className="p-4 bg-gray-700/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{point.step}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      {formatPercentage(point.dropOffRate)} drop-off
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {point.users} users
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-2">Common reasons:</p>
                  <div className="flex flex-wrap gap-2">
                    {point.reasons.map((reason, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actionable Insights */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-400" />
            Optimization Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="font-semibold text-green-300">
                  High Impact
                </span>
              </div>
              <p className="text-sm text-gray-300">
                Improve pricing page conversion by reducing drop-off rate from
                45% to 35%. This could increase paid users by ~15%.
              </p>
            </div>

            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-blue-300">Quick Win</span>
              </div>
              <p className="text-sm text-gray-300">
                Add more contextual upgrade hints. Current hint-to-click ratio
                is low. Consider showing benefits-focused hints at key friction
                points.
              </p>
            </div>

            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-purple-400" />
                <span className="font-semibold text-purple-300">
                  Revenue Growth
                </span>
              </div>
              <p className="text-sm text-gray-300">
                Potential monthly revenue increase of{" "}
                {formatCurrency(metrics.revenuePotential * 0.25)}
                by improving overall conversion rate by 25%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
