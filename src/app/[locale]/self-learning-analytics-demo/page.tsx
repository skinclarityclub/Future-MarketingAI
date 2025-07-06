/**
 * Self-Learning Analytics Demo Page
 * Task 36.4: Demo page for ML-powered content performance analysis and optimization
 * Located in [locale] for internationalization support
 */

import React from "react";
import SelfLearningAnalyticsDashboard from "@/components/marketing/self-learning-analytics-dashboard";

export default function SelfLearningAnalyticsDemo() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SelfLearningAnalyticsDashboard />
    </div>
  );
}

export function generateMetadata() {
  return {
    title: "Self-Learning Analytics Demo | SKC BI Dashboard",
    description:
      "ML-powered content performance analysis and optimization dashboard with predictive analytics, audience segmentation, and real-time insights.",
  };
}
