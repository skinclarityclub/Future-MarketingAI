"use client";

import React, { Suspense, useState } from "react";
import {
  DashboardLayout,
  DashboardSection,
  DashboardGrid,
  DashboardCard,
} from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChurnPredictionDashboard } from "@/components/customer-intelligence/churn-prediction";
import { CustomerSegmentation } from "@/components/customer-intelligence/customer-segmentation";
import { CustomerJourney as CustomerJourneyComponent } from "@/components/customer-intelligence/customer-journey";
import { Eye, BarChart3, AlertTriangle, Users, Route } from "lucide-react";

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
  return (
    <DashboardGrid>
      <DashboardCard
        title="Total Customers"
        description="All registered customers"
      >
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {customerOverview.totalCustomers.toLocaleString()}
          </div>
          <div className="text-xs text-green-600">
            +{customerOverview.growthRate}% from last month
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Active Customers"
        description="Currently active users"
      >
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {customerOverview.activeCustomers.toLocaleString()}
          </div>
          <div className="text-xs text-green-600">
            +{customerOverview.activeRate}% from last month
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Avg. Lifetime Value"
        description="Average customer value"
      >
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            ${customerOverview.avgLifetimeValue.toLocaleString()}
          </div>
          <div className="text-xs text-green-600">
            +{customerOverview.clvGrowth}% from last month
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Churn Risk" description="Customers at risk">
        <div className="space-y-2">
          <div className="text-2xl font-bold text-orange-600">
            {customerOverview.churnRisk}
          </div>
          <div className="text-xs text-green-600">
            {customerOverview.churnChange}% from last month
          </div>
        </div>
      </DashboardCard>
    </DashboardGrid>
  );
}

function CustomerSegments() {
  const segments = [
    { name: "High Value", count: 1249, percentage: 10, color: "bg-green-500" },
    { name: "Medium Value", count: 4987, percentage: 40, color: "bg-blue-500" },
    { name: "Low Value", count: 3746, percentage: 30, color: "bg-yellow-500" },
    { name: "At Risk", count: 2505, percentage: 20, color: "bg-red-500" },
  ];

  return (
    <DashboardCard
      title="Customer Segments"
      description="Customer distribution by value"
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
    </DashboardCard>
  );
}

function CustomerJourney() {
  const journeyStages = [
    { stage: "Awareness", customers: 25000, conversion: 100 },
    { stage: "Interest", customers: 18500, conversion: 74 },
    { stage: "Consideration", customers: 12300, conversion: 49 },
    { stage: "Purchase", customers: 8100, conversion: 32 },
    { stage: "Retention", customers: 6750, conversion: 27 },
  ];

  return (
    <DashboardCard
      title="Customer Journey"
      description="Conversion funnel analysis"
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
                {stage.customers.toLocaleString()} customers
              </div>
            </div>
            <Badge>{stage.conversion}%</Badge>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export default function CustomerIntelligencePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "churn" | "segments" | "journey"
  >("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "churn", label: "Churn Prediction", icon: AlertTriangle },
    { id: "segments", label: "Segments", icon: Users },
    { id: "journey", label: "Journey Tracking", icon: Route },
  ];

  return (
    <DashboardLayout>
      <DashboardSection
        title="Customer Intelligence Dashboard"
        description="360° customer view, analytics, and insights for data-driven decisions"
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
                <DashboardGrid>
                  {[...Array(4)].map((_, i) => (
                    <DashboardCard key={i} title="" description="">
                      <Skeleton className="h-24 w-full" />
                    </DashboardCard>
                  ))}
                </DashboardGrid>
              }
            >
              <CustomerOverviewCards />
            </Suspense>

            <DashboardGrid>
              <CustomerSegments />
              <CustomerJourney />
            </DashboardGrid>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <DashboardCard
            title="Advanced Analytics"
            description="Detailed customer behavior analysis"
            colSpan={4}
          >
            <div className="text-center py-8 text-muted-foreground">
              Advanced analytics features coming soon...
            </div>
          </DashboardCard>
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
          <DashboardCard
            title="Development Status"
            description="Feature implementation progress"
            colSpan={4}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Badge variant="default">✅ Complete</Badge>
                <span className="text-sm">Customer overview metrics</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default">✅ Complete</Badge>
                <span className="text-sm">Churn prediction algorithms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">🔄 In Progress</Badge>
                <span className="text-sm">Real-time data sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default">✅ Complete</Badge>
                <span className="text-sm">Advanced segmentation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default">✅ Complete</Badge>
                <span className="text-sm">Journey tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">🤖 Planned</Badge>
                <span className="text-sm">ML model optimization</span>
              </div>
            </div>
          </DashboardCard>
        )}
      </DashboardSection>
    </DashboardLayout>
  );
}
