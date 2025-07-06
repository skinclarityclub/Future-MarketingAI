"use client";

import React from "react";
import { UltraPremiumDashboardLayout } from "@/components/layout/ultra-premium-dashboard-layout";
import { ExecutiveOverview } from "../executive-overview";

export default function DashboardPage() {
  return (
    <div className="dark">
      <UltraPremiumDashboardLayout
        currentPage="Executive Dashboard"
        showSidebar={true}
        fullWidth={false}
      >
        <ExecutiveOverview />
      </UltraPremiumDashboardLayout>
    </div>
  );
}
