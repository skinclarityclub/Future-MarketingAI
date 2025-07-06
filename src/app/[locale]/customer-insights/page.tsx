"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { CustomerSegmentation } from "@/components/customer-intelligence/customer-segmentation";
import { CustomerJourney } from "@/components/customer-intelligence/customer-journey";
import { ChurnPredictionDashboard } from "@/components/customer-intelligence/churn-prediction";
import { useLocale } from "@/lib/i18n/context";

export default function CustomerInsightsPage() {
  const { t } = useLocale();

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title="Customer Insights"
        description="Understand customer behavior, segments and journey patterns"
        priority="primary"
      >
        <CustomerSegmentation />
        <CustomerJourney />
        <ChurnPredictionDashboard />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
