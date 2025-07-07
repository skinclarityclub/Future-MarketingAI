"use client";

import React, { Suspense, useState } from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
  UltraPremiumGrid,
  UltraPremiumCard,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChurnPredictionDashboard } from "@/components/customer-intelligence/churn-prediction";
import { CustomerSegmentation } from "@/components/customer-intelligence/customer-segmentation";
import { CustomerJourney as CustomerJourneyComponent } from "@/components/customer-intelligence/customer-journey";
import { Eye, BarChart3, AlertTriangle, Users, Route } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client-provider";

// Mock data
const customerOverview = {
  totalCustomers: 12487,
  activeCustomers: 9654,
  avgLifetimeValue: 1247,
  churnRisk: 284,
  growthRate: 8.2,
  activeRate: 5.7,
  clvGrowth: 12.3,
  churnChange: -15.2,
};

function CustomerOverviewCards() {
  const { t } = useTranslation();

  return (
    <UltraPremiumGrid>
      <UltraPremiumCard
        title={t("customerIntelligence.overview.totalCustomers")}
        description={t("customerIntelligence.overview.totalCustomersDesc")}
      >
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {customerOverview.totalCustomers.toLocaleString()}
          </div>
          <div className="text-xs text-green-600">
            +{customerOverview.growthRate}%{" "}
            {t("customerIntelligence.overview.fromLastMonth")}
          </div>
        </div>
      </UltraPremiumCard>

      <UltraPremiumCard
        title={t("customerIntelligence.overview.activeCustomers")}
        description={t("customerIntelligence.overview.activeCustomersDesc")}
      >
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {customerOverview.activeCustomers.toLocaleString()}
          </div>
          <div className="text-xs text-green-600">
            +{customerOverview.activeRate}%{" "}
            {t("customerIntelligence.overview.fromLastMonth")}
          </div>
        </div>
      </UltraPremiumCard>

      <UltraPremiumCard
        title={t("customerIntelligence.overview.avgLifetimeValue")}
        description={t("customerIntelligence.overview.avgLifetimeValueDesc")}
      >
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            ${customerOverview.avgLifetimeValue.toLocaleString()}
          </div>
          <div className="text-xs text-green-600">
            +{customerOverview.clvGrowth}%{" "}
            {t("customerIntelligence.overview.fromLastMonth")}
          </div>
        </div>
      </UltraPremiumCard>

      <UltraPremiumCard
        title={t("customerIntelligence.overview.churnRisk")}
        description={t("customerIntelligence.overview.churnRiskDesc")}
      >
        <div className="space-y-2">
          <div className="text-2xl font-bold text-orange-600">
            {customerOverview.churnRisk}
          </div>
          <div className="text-xs text-green-600">
            {customerOverview.churnChange}%{" "}
            {t("customerIntelligence.overview.fromLastMonth")}
          </div>
        </div>
      </UltraPremiumCard>
    </UltraPremiumGrid>
  );
}

function CustomerSegments() {
  const { t } = useTranslation();

  const segments = [
    {
      name: t("customerIntelligence.segments.highValue"),
      count: 1249,
      percentage: 10,
      color: "bg-green-500",
    },
    {
      name: t("customerIntelligence.segments.mediumValue"),
      count: 4987,
      percentage: 40,
      color: "bg-blue-500",
    },
    {
      name: t("customerIntelligence.segments.lowValue"),
      count: 3746,
      percentage: 30,
      color: "bg-yellow-500",
    },
    {
      name: t("customerIntelligence.segments.atRisk"),
      count: 2505,
      percentage: 20,
      color: "bg-red-500",
    },
  ];

  return (
    <UltraPremiumCard
      title={t("customerIntelligence.segments.title")}
      description={t("customerIntelligence.segments.description")}
      colSpan={2}
    >
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{segment.name}</span>
              <Badge variant="outline">{segment.count.toLocaleString()}</Badge>
            </div>
            <Progress value={segment.percentage} className="h-2" />
          </div>
        ))}
      </div>
    </UltraPremiumCard>
  );
}

function CustomerJourney() {
  const { t } = useTranslation();

  const journeyStages = [
    {
      stage: t("customerIntelligence.journey.stages.awareness"),
      customers: 25000,
      conversion: 100,
    },
    {
      stage: t("customerIntelligence.journey.stages.interest"),
      customers: 18500,
      conversion: 74,
    },
    {
      stage: t("customerIntelligence.journey.stages.consideration"),
      customers: 12300,
      conversion: 49,
    },
    {
      stage: t("customerIntelligence.journey.stages.purchase"),
      customers: 8100,
      conversion: 32,
    },
    {
      stage: t("customerIntelligence.journey.stages.retention"),
      customers: 6750,
      conversion: 27,
    },
  ];

  return (
    <UltraPremiumCard
      title={t("customerIntelligence.journey.title")}
      description={t("customerIntelligence.journey.description")}
      colSpan={2}
    >
      <div className="space-y-3">
        {journeyStages.map((stage, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div>
              <span className="font-medium">{stage.stage}</span>
              <div className="text-sm text-muted-foreground">
                {stage.customers.toLocaleString()}{" "}
                {t("customerIntelligence.journey.customers")}
              </div>
            </div>
            <Badge>{stage.conversion}%</Badge>
          </div>
        ))}
      </div>
    </UltraPremiumCard>
  );
}

export default function CustomerIntelligencePage() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "churn" | "segments" | "journey"
  >("overview");

  const tabs = [
    {
      id: "overview",
      label: t("customerIntelligence.tabs.overview"),
      icon: Eye,
    },
    {
      id: "analytics",
      label: t("customerIntelligence.tabs.analytics"),
      icon: BarChart3,
    },
    {
      id: "churn",
      label: t("customerIntelligence.tabs.churn"),
      icon: AlertTriangle,
    },
    {
      id: "segments",
      label: t("customerIntelligence.tabs.segments"),
      icon: Users,
    },
    {
      id: "journey",
      label: t("customerIntelligence.tabs.journey"),
      icon: Route,
    },
  ];

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title={t("customerIntelligence.title")}
        description={t("customerIntelligence.description")}
      >
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <Suspense
              fallback={
                <UltraPremiumGrid>
                  {[...Array(4)].map((_, i) => (
                    <UltraPremiumCard key={i} title="" description="">
                      <Skeleton className="h-24 w-full" />
                    </UltraPremiumCard>
                  ))}
                </UltraPremiumGrid>
              }
            >
              <CustomerOverviewCards />
            </Suspense>

            <UltraPremiumGrid>
              <CustomerSegments />
              <CustomerJourney />
            </UltraPremiumGrid>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <UltraPremiumCard
            title={t("customerIntelligence.analytics.title")}
            description={t("customerIntelligence.analytics.description")}
            colSpan={4}
          >
            <div className="text-center py-8 text-muted-foreground">
              {t("customerIntelligence.analytics.comingSoon")}
            </div>
          </UltraPremiumCard>
        )}

        {/* Churn Prediction Tab */}
        {activeTab === "churn" && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <ChurnPredictionDashboard />
          </Suspense>
        )}

        {/* Segments Tab */}
        {activeTab === "segments" && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <CustomerSegmentation />
          </Suspense>
        )}

        {/* Journey Tracking Tab */}
        {activeTab === "journey" && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <CustomerJourneyComponent />
          </Suspense>
        )}

        {/* Development Status - Only show on overview tab */}
        {activeTab === "overview" && (
          <UltraPremiumCard
            title={t("customerIntelligence.development.title")}
            description={t("customerIntelligence.development.description")}
            colSpan={4}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Badge variant="default">
                  {t("customerIntelligence.development.complete")}
                </Badge>
                <span className="text-sm">
                  {t(
                    "customerIntelligence.development.features.overviewMetrics"
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default">
                  {t("customerIntelligence.development.complete")}
                </Badge>
                <span className="text-sm">
                  {t(
                    "customerIntelligence.development.features.churnPrediction"
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {t("customerIntelligence.development.inProgress")}
                </Badge>
                <span className="text-sm">
                  {t("customerIntelligence.development.features.realtimeSync")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default">
                  {t("customerIntelligence.development.complete")}
                </Badge>
                <span className="text-sm">
                  {t("customerIntelligence.development.features.segmentation")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default">
                  {t("customerIntelligence.development.complete")}
                </Badge>
                <span className="text-sm">
                  {t(
                    "customerIntelligence.development.features.journeyTracking"
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {t("customerIntelligence.development.planned")}
                </Badge>
                <span className="text-sm">
                  {t(
                    "customerIntelligence.development.features.mlOptimization"
                  )}
                </span>
              </div>
            </div>
          </UltraPremiumCard>
        )}
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
