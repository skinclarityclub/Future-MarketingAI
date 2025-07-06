"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BarChart3,
  Calendar,
  Globe,
  RefreshCw,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Crown,
  Lock,
  Unlock,
  Star,
  ChevronRight,
  Eye,
  Lightbulb,
  Rocket,
  Shield,
  CheckCircle,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  UltraPremiumCard,
  UltraPremiumGrid,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";

// Import tier access and optimization components
import {
  AccessTierService,
  SubscriptionTier,
} from "@/lib/rbac/access-tier-service";
import OptimizedConversionFlow from "@/components/ui/optimized-conversion-flow";

// Import original components that we're enhancing
import { MarketingAlertSystem } from "@/components/dashboard/marketing-alert-system";
import CustomWidgetBuilder from "@/components/dashboard/custom-widget-builder";
import ContentCalendarWidget from "@/components/marketing/content-calendar-widget";
import ROIBudgetWidget from "@/components/marketing/roi-budget-widget";
import MarketingTeamCollaboration from "@/components/marketing/marketing-team-collaboration";
import MarketingPerformanceForecasting from "@/components/marketing/marketing-performance-forecasting";
import MarketingExportCapabilities from "@/components/marketing/marketing-export-capabilities";

interface MarketingKPI {
  id: string;
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description?: string;
  requiredTier?: SubscriptionTier;
  usageData?: {
    current: number;
    limit: number;
    percentage: number;
  };
}

interface TierFeatureHighlight {
  feature: string;
  currentTier: boolean;
  upgradeMessage: string;
  icon: React.ComponentType<any>;
  benefitDescription: string;
}

export default function UnifiedMarketingDashboardWithTiers() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentTier, setCurrentTier] =
    useState<SubscriptionTier>("professional");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [conversionVariant, setConversionVariant] = useState<
    "urgency" | "value" | "social" | "trial"
  >("value");

  // Initialize tier service
  const [tierService] = useState(() => new AccessTierService());

  // Enhanced KPIs with tier access information
  const [marketingKPIs, setMarketingKPIs] = useState<MarketingKPI[]>([
    {
      id: "total-campaigns",
      title: "Actieve Campaigns",
      value: 12,
      change: "+8.3%",
      trend: "up",
      icon: Target,
      color: "text-blue-400",
      description: "Totaal aantal actieve marketing campaigns",
      requiredTier: "free",
      usageData: { current: 12, limit: 25, percentage: 48 },
    },
    {
      id: "monthly-revenue",
      title: "Maandelijkse Omzet",
      value: "€45.2K",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-400",
      description: "Totale omzet deze maand",
      requiredTier: "professional",
    },
    {
      id: "conversion-rate",
      title: "Conversie Ratio",
      value: "3.8%",
      change: "+0.4%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-400",
      description: "Gemiddelde conversie ratio",
      requiredTier: "professional",
    },
    {
      id: "ai-recommendations",
      title: "AI Aanbevelingen",
      value: 47,
      change: "+23.1%",
      trend: "up",
      icon: Lightbulb,
      color: "text-yellow-400",
      description: "AI-gegenereerde optimalisatie aanbevelingen",
      requiredTier: "enterprise",
      usageData: { current: 47, limit: 100, percentage: 47 },
    },
    {
      id: "workflow-efficiency",
      title: "Workflow Efficiency",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      icon: Zap,
      color: "text-cyan-400",
      description: "Automatisering workflow efficiency",
      requiredTier: "professional",
    },
    {
      id: "team-productivity",
      title: "Team Productiviteit",
      value: "127%",
      change: "+15.2%",
      trend: "up",
      icon: Users,
      color: "text-indigo-400",
      description: "Team productiviteit index",
      requiredTier: "professional",
    },
  ]);

  // Feature highlights for tier upgrades
  const tierFeatureHighlights: TierFeatureHighlight[] = [
    {
      feature: "Advanced AI Analytics",
      currentTier: tierService.hasFeatureAccess("ai_analytics", currentTier),
      upgradeMessage: "Unlock AI-powered insights en predictive analytics",
      icon: Brain,
      benefitDescription:
        "Get data-driven recommendations dat je ROI met 40% verhoogt",
    },
    {
      feature: "Unlimited Campaigns",
      currentTier: tierService.hasFeatureAccess(
        "unlimited_campaigns",
        currentTier
      ),
      upgradeMessage: "Verwijder campaign limits en schaal onbeperkt",
      icon: Rocket,
      benefitDescription:
        "Run 100+ campaigns simultaneously zonder restrictions",
    },
    {
      feature: "Premium Integrations",
      currentTier: tierService.hasFeatureAccess(
        "premium_integrations",
        currentTier
      ),
      upgradeMessage: "Connect met 50+ premium marketing tools",
      icon: Zap,
      benefitDescription:
        "Salesforce, HubSpot, Marketo en meer - all-in-one platform",
    },
    {
      feature: "Enterprise Security",
      currentTier: tierService.hasFeatureAccess(
        "enterprise_security",
        currentTier
      ),
      upgradeMessage: "Bank-level security en compliance features",
      icon: Shield,
      benefitDescription: "SOC2, GDPR compliance + dedicated security team",
    },
  ];

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Simulate data refresh with tier-aware logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastUpdated(new Date());
      setApiError(null);

      // Check for upgrade opportunities based on usage
      const highUsageKPIs = marketingKPIs.filter(
        kpi => kpi.usageData && kpi.usageData.percentage > 80
      );

      if (highUsageKPIs.length > 0 && !showUpgradePrompt) {
        setShowUpgradePrompt(true);
        setConversionVariant("urgency"); // High usage triggers urgency variant
      }
    } catch (error) {
      setApiError("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const checkFeatureAccess = (feature: string) => {
    return tierService.hasFeatureAccess(feature, currentTier);
  };

  const getTierBadge = (requiredTier?: SubscriptionTier) => {
    if (!requiredTier) return null;

    const hasAccess = tierService.hasFeatureAccess(
      "advanced_analytics",
      currentTier
    );
    if (hasAccess) return null;

    return (
      <Badge variant="secondary" className="ml-2 text-xs">
        <Crown className="w-3 h-3 mr-1" />
        {requiredTier}
      </Badge>
    );
  };

  const getKPIContent = (kpi: MarketingKPI) => {
    const hasAccess =
      !kpi.requiredTier ||
      tierService.hasFeatureAccess("advanced_analytics", currentTier);

    if (!hasAccess) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="text-center space-y-2">
              <Lock className="w-8 h-8 text-yellow-400 mx-auto" />
              <p className="text-sm text-gray-300">
                Upgrade naar {kpi.requiredTier}
              </p>
              <NormalButton
                size="sm"
                onClick={() => setShowUpgradePrompt(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500"
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade Nu
              </NormalButton>
            </div>
          </div>
          <div className="opacity-30">
            <div className="text-2xl font-bold text-white mb-1">••••</div>
            <div className="text-sm text-gray-400">Vergrendeld</div>
          </div>
        </motion.div>
      );
    }

    return (
      <div>
        <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
        <div
          className={`text-sm flex items-center gap-1 ${
            kpi.trend === "up"
              ? "text-green-400"
              : kpi.trend === "down"
                ? "text-red-400"
                : "text-yellow-400"
          }`}
        >
          {kpi.trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : kpi.trend === "down" ? (
            <TrendingDown className="h-3 w-3" />
          ) : (
            <Activity className="h-3 w-3" />
          )}
          {kpi.change}
        </div>
        {kpi.usageData && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{kpi.usageData.current} gebruikt</span>
              <span>{kpi.usageData.limit} limiet</span>
            </div>
            <Progress value={kpi.usageData.percentage} className="h-1" />
            {kpi.usageData.percentage > 80 && (
              <Alert className="mt-2 border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-xs text-yellow-200">
                  Bijna limiet bereikt - overweeg een upgrade
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Tier Information */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">
              Marketing Command Center
            </h1>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none">
              <Crown className="w-3 h-3 mr-1" />
              {currentTier.toUpperCase()}
            </Badge>
          </div>
          <p className="text-gray-300 mb-4">
            Complete oversight van alle marketing operations en performance
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${apiError ? "bg-red-500" : "bg-green-500 animate-pulse"}`}
              ></div>
              <span>
                {apiError ? "API connection error" : "Live data feed actief"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>
                Laatste update: {lastUpdated.toLocaleTimeString("nl-NL")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Tier: {tierService.getTierDisplayName(currentTier)}</span>
            </div>
          </div>
          {apiError && (
            <div className="mt-2 p-2 bg-red-900/20 border border-red-500/50 text-red-300 rounded text-sm">
              API Error: {apiError} - Fallback data wordt gebruikt
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <NormalButton
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Ververs Data
          </NormalButton>

          <NormalButton
            onClick={() => setShowUpgradePrompt(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Plan
          </NormalButton>
        </div>
      </div>

      {/* Tier Feature Highlights */}
      <UltraPremiumCard
        title="Feature Unlock Opportunities"
        description="Ontdek premium features die je marketing resultaten kunnen verbeteren"
        variant="glass"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tierFeatureHighlights.map((highlight, index) => (
            <motion.div
              key={highlight.feature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                highlight.currentTier
                  ? "bg-green-900/20 border-green-500/30"
                  : "bg-gray-800/30 border-gray-600/30 hover:border-yellow-500/50 cursor-pointer"
              }`}
              onClick={() =>
                !highlight.currentTier && setShowUpgradePrompt(true)
              }
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    highlight.currentTier ? "bg-green-600/20" : "bg-gray-700/50"
                  }`}
                >
                  {highlight.currentTier ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <h4 className="font-medium text-white text-sm">
                  {highlight.feature}
                </h4>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                {highlight.benefitDescription}
              </p>
              {!highlight.currentTier && (
                <div className="flex items-center text-xs text-yellow-400">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  {highlight.upgradeMessage}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </UltraPremiumCard>

      {/* Enhanced Primary KPI Grid with Tier Access */}
      <UltraPremiumGrid variant="standard">
        {marketingKPIs.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <UltraPremiumCard
                title={
                  <div className="flex items-center justify-between">
                    <span>{kpi.title}</span>
                    {getTierBadge(kpi.requiredTier)}
                  </div>
                }
                description={kpi.description}
                variant="glass"
                colSpan={1}
              >
                <div className="flex items-center justify-between">
                  {getKPIContent(kpi)}
                  <div
                    className={`p-3 rounded-lg bg-white/10 backdrop-blur-sm ${kpi.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </UltraPremiumCard>
            </motion.div>
          );
        })}
      </UltraPremiumGrid>

      {/* Conversion Optimization Prompt */}
      <AnimatePresence>
        {showUpgradePrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-20"
          >
            <OptimizedConversionFlow
              variant={conversionVariant}
              currentTier={currentTier}
              onClose={() => setShowUpgradePrompt(false)}
              onUpgrade={tier => {
                setCurrentTier(tier);
                setShowUpgradePrompt(false);
              }}
              context="command-center"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Dashboard Components with Enhanced Integrations */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-[600px] mx-auto grid-cols-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced A/B Testing with tier access */}
          <ABTestingWidget />

          {/* Marketing Alert System */}
          <MarketingAlertSystem />

          {/* Content Calendar Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentCalendarWidget />
            <ROIBudgetWidget />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {checkFeatureAccess("usage_analytics") ? (
            <UsageAnalyticsDashboard />
          ) : (
            <UltraPremiumCard
              title="Usage Analytics"
              description="Detailed usage insights en behavior tracking"
            >
              <div className="text-center py-12">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  Premium Feature
                </h3>
                <p className="text-gray-400 mb-4">
                  Unlock detailed usage analytics en user behavior insights
                </p>
                <NormalButton onClick={() => setShowUpgradePrompt(true)}>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade voor Analytics
                </NormalButton>
              </div>
            </UltraPremiumCard>
          )}

          <UpgradeFunnelTracker />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CustomWidgetBuilder />
          <MarketingTeamCollaboration />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {checkFeatureAccess("ai_insights") ? (
            <>
              <MarketingPerformanceForecasting />
              <MarketingExportCapabilities />
            </>
          ) : (
            <UltraPremiumCard
              title="AI Insights"
              description="Artificial intelligence powered marketing insights"
            >
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  AI-Powered Insights
                </h3>
                <p className="text-gray-400 mb-4">
                  Unlock machine learning insights en predictive analytics
                </p>
                <NormalButton onClick={() => setShowUpgradePrompt(true)}>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade voor AI Features
                </NormalButton>
              </div>
            </UltraPremiumCard>
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Action Bar */}
      <div className="flex flex-wrap gap-4">
        <NormalButton variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Dashboard Configuratie
        </NormalButton>
        <NormalButton variant="outline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Uitgebreide Analytics
        </NormalButton>
        <NormalButton variant="outline" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Nieuwe Campagne
        </NormalButton>
        <NormalButton variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Content Kalender
        </NormalButton>
        <NormalButton
          variant="outline"
          className="flex items-center gap-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
          onClick={() => setShowUpgradePrompt(true)}
        >
          <Crown className="h-4 w-4" />
          Tier Management
        </NormalButton>
      </div>
    </div>
  );
}
