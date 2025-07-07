"use client";

import React from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";
import ContentPerformanceOverview from "@/components/dashboard/content-performance-overview";
import ContentROICards from "@/components/dashboard/content-roi-cards";

export default function ContentPage() {
  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title="Content Performance"
        description="Track and analyze content effectiveness and ROI"
        priority="primary"
      >
        <ContentROICards />
        <ContentPerformanceOverview />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
