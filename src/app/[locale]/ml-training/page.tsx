/**
 * ML Training Page
 * Task 71.5: ML Auto-Retraining Dashboard Page
 *
 * Main page voor ML model retraining monitoring en management
 */

import { Metadata } from "next";
import { MLRetrainingDashboard } from "@/components/analytics/ml-retraining-dashboard";

export const metadata: Metadata = {
  title: "ML Training | SKC BI Dashboard",
  description: "Monitor and manage automated ML model retraining workflows",
};

export default function MLTrainingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <MLRetrainingDashboard />
      </div>
    </div>
  );
}
