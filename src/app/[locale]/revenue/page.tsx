"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { RevenueCharts } from "@/components/revenue/revenue-charts";
import { useLocale } from "@/lib/i18n/context";

export default function RevenuePage() {
  const { t } = useLocale();

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title={t("dashboard.revenue")}
        description={t("dashboard.revenueTrendDesc")}
        priority="primary"
      >
        <RevenueCharts />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
