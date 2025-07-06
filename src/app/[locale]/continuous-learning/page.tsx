import { Metadata } from "next";
import { ContinuousLearningDashboard } from "@/components/analytics/continuous-learning-dashboard";

export const metadata: Metadata = {
  title: "Continuous Learning Dashboard | SKC BI Dashboard",
  description:
    "Monitor and manage the AI continuous learning system with real-time metrics, model performance tracking, and automated optimization insights.",
};

export default function ContinuousLearningPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Continuous Learning Dashboard
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl">
          Monitor your AI system's continuous learning capabilities with
          real-time performance metrics, automated model updates, and
          intelligent insights discovery. Track how your content optimization
          models improve over time through automated feedback processing.
        </p>
      </div>

      <ContinuousLearningDashboard />
    </div>
  );
}
