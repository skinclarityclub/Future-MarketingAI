"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import { CustomerCharts } from "@/components/customers/customer-charts";
import { useLocale } from "@/lib/i18n/context";

export default function CustomersPage() {
  const { t } = useLocale();

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title={t("navigation.customers")}
        description={t("analytics.conversions")}
        priority="primary"
      >
        <CustomerCharts />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
