"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { RealtimeRevenueCharts } from "@/components/revenue/realtime-revenue-charts";
import { RevenueCharts } from "@/components/revenue/revenue-charts";
import { useLocale } from "@/lib/i18n/context";

export default function RevenueAnalyticsPage() {
  const { t } = useLocale();

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title="Revenue Analytics"
        description="Advanced revenue tracking and analysis"
        priority="primary"
      >
        <RealtimeRevenueCharts />
        <RevenueCharts />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
