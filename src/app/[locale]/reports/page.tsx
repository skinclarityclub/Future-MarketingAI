"use client";

import React, { Suspense } from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { ReportsCharts } from "@/components/reports/reports-charts";
import { useLocale } from "@/lib/i18n/context";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface ReportsPageProps {
  params: Promise<{ locale: string }>;
}

function ReportsPageContent() {
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

export default function ReportsPage({ params: _params }: ReportsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <ReportsPageContent />
    </Suspense>
  );
}
