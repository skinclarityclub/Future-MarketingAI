"use client";

import React, { Suspense } from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { CustomerSegmentation } from "@/components/customer-intelligence/customer-segmentation";
import { CustomerJourney } from "@/components/customer-intelligence/customer-journey";
import { ChurnPredictionDashboard } from "@/components/customer-intelligence/churn-prediction";
import { useLocale } from "@/lib/i18n/context";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface CustomerInsightsPageProps {
  params: Promise<{ locale: string }>;
}

function CustomerInsightsPageContent() {
  const { t } = useLocale();

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title={t("navigation.customerInsights")}
        description={t("dashboard.customerInsightsDesc")}
        priority="primary"
      >
        <CustomerSegmentation />
        <CustomerJourney />
        <ChurnPredictionDashboard />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}

export default function CustomerInsightsPage({
  params: _params,
}: CustomerInsightsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <CustomerInsightsPageContent />
    </Suspense>
  );
}
