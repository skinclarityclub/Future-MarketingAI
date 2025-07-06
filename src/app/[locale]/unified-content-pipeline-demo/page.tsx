import React from "react";
import { Metadata } from "next";
import UnifiedContentPipelineDashboard from "@/components/dashboard/unified-content-pipeline-dashboard";

export const metadata: Metadata = {
  title: "Unified Content Pipeline Demo | SKC BI Dashboard",
  description:
    "Experience the power of unified content pipeline automation from research to publishing",
};

export default function UnifiedContentPipelineDemoPage() {
  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50">
      <div className="container mx-auto py-8">
        <UnifiedContentPipelineDashboard />
      </div>
    </div>
  );
}
