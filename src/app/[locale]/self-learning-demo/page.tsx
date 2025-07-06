"use client";

import React from "react";
import dynamic from "next/dynamic";

const AdvancedSelfLearningDashboard = dynamic(
  () => import("@/components/dashboard/advanced-self-learning-dashboard"),
  { ssr: false }
);

export default function SelfLearningDemoPage() {
  return (
    <div className="dark min-h-screen bg-gray-900">
      <AdvancedSelfLearningDashboard />
    </div>
  );
}
