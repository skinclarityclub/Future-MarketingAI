import React from "react";
import { Metadata } from "next";
import AIOptimizationDashboard from "@/components/dashboard/ai-optimization-dashboard";

export const metadata: Metadata = {
  title: "AI Optimization Engine Demo - SKC BI Dashboard",
  description:
    "AI-powered optimization recommendations for content, timing, targeting, and performance enhancement.",
};

export default function AIOptimizationDemoPage() {
  return (
    <div className="dark min-h-screen bg-gray-900">
      <AIOptimizationDashboard />
    </div>
  );
}
