"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { ReportsCharts } from "@/components/reports/reports-charts";
import { ExportControls } from "@/components/dashboard/export-controls";
import { useLocale } from "@/lib/i18n/context";

export default function ReportsCenterPage() {
  const { t } = useLocale();

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title="Reports Center"
        description="Generate, view and export comprehensive business reports"
        priority="primary"
      >
        <ExportControls />
        <ReportsCharts />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
