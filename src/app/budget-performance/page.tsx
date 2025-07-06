import { Metadata } from "next";
import BudgetPerformanceTracker from "@/components/dashboard/budget-performance-tracker";

export const metadata: Metadata = {
  title: "Budget Performance Tracker | SKC BI Dashboard",
  description:
    "Enterprise budget vs. actual analysis with forecasting and variance alerts",
};

export default function BudgetPerformancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BudgetPerformanceTracker />
    </div>
  );
}
