import { Metadata } from "next";
import { CrossPlatformAnalysisDashboard } from "@/components/analytics/cross-platform-analysis-dashboard";

export const metadata: Metadata = {
  title: "Cross-Platform Content Analysis | SKC BI Dashboard",
  description:
    "Analyze content performance across multiple social media platforms with AI-powered insights and competitor benchmarking.",
};

export default function CrossPlatformAnalysisPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Cross-Platform Content Analysis
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl">
          Leverage AI-powered cross-platform learning to optimize your content
          strategy. Analyze performance patterns, benchmark against competitors,
          and get universal optimization recommendations.
        </p>
      </div>

      <CrossPlatformAnalysisDashboard />
    </div>
  );
}
