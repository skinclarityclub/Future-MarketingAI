"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import UnifiedMarketingDashboard from "@/components/dashboard/unified-marketing-dashboard";
import { Metadata } from "next";

export default function MarketingOversightPage() {
  return (
    <div className="dark">
      <UltraPremiumDashboardLayout>
        <UltraPremiumSection
          title="Marketing Machine Oversight"
          description="Complete overzicht en controle van alle marketing operations, workflows en performance metrics"
          priority="primary"
        >
          <UnifiedMarketingDashboard />
        </UltraPremiumSection>
      </UltraPremiumDashboardLayout>
    </div>
  );
}
