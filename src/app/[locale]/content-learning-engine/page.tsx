/**
 * Self-Learning Content Engine Demo Page
 * Task 67.1 Implementation: Content Performance Data Collection and Analysis
 * Located in [locale] for internationalization support
 */

import React from "react";
import { Metadata } from "next";
import ContentLearningEngineDashboard from "@/components/marketing/content-learning-engine-dashboard";

export default function ContentLearningEnginePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Self-Learning Content Engine
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
          AI-powered content performance analysis en optimization systeem dat
          automatisch leert van succesvolle content patronen en realtime
          optimalisaties voorstelt voor maximum engagement.
        </p>
      </div>

      <ContentLearningEngineDashboard />
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Self-Learning Content Engine | SKC BI Dashboard",
    description:
      "AI-powered content performance analysis and optimization engine with real-time learning, pattern recognition, and automatic content suggestions for maximum engagement.",
    keywords: [
      "content analysis",
      "AI optimization",
      "performance tracking",
      "machine learning",
      "content marketing",
      "engagement optimization",
    ],
  };
}
