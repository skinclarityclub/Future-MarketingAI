"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { ReportsCharts } from "@/components/reports/reports-charts";
import { useLocale } from "@/lib/i18n/context";

export default function ReportsPage() {
  const { t } = useLocale();

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title={t("navigation.reports")}
        description={t("reports.generate")}
        priority="primary"
      >
        <ReportsCharts />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
