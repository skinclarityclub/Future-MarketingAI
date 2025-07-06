import React from "react";
import { Metadata } from "next";
import CrossPlatformContentDashboard from "@/components/dashboard/cross-platform-content-dashboard";

export const metadata: Metadata = {
  title: "Cross-Platform Content Management Demo | SKC BI Dashboard",
  description:
    "Unified scheduling, publishing, and analytics for Instagram, LinkedIn, Facebook, Twitter/X, and TikTok",
};

export default function CrossPlatformContentDemoPage() {
  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50">
      <div className="container mx-auto py-8">
        <CrossPlatformContentDashboard />
      </div>
    </div>
  );
}
