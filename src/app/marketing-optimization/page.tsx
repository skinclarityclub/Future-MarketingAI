import { Metadata } from "next";
import MarketingOptimization from "@/components/dashboard/marketing-optimization";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "Marketing Optimization | SKC BI Dashboard",
  description:
    "Marketing spend optimization with ROI tracking and budget analysis across all channels",
};

export default function MarketingOptimizationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary
        componentName="MarketingOptimization"
        enableReporting={true}
      >
        <MarketingOptimization />
      </ErrorBoundary>
    </div>
  );
}
