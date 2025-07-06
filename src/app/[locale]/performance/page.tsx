"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { PerformanceCharts } from "@/components/performance/performance-charts";
import { useLocale } from "@/lib/i18n/context";

export default function PerformancePage() {
  const { t } = useLocale();

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title={t("dashboard.topMetrics")}
        description={t("dashboard.topMetricsDesc")}
        priority="primary"
      >
        <PerformanceCharts />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
