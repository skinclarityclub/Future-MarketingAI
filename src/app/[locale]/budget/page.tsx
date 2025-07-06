"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import BudgetPerformanceTracker from "@/components/dashboard/budget-performance-tracker";
import { useLocale } from "@/lib/i18n/context";

export default function BudgetPage() {
  const { t } = useLocale();

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title="Budget Management"
        description="Budget planning, tracking and performance analysis"
        priority="primary"
      >
        <BudgetPerformanceTracker />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
