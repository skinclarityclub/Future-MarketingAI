import { Metadata } from "next";
import FinancialIntelligence from "@/components/dashboard/financial-intelligence";

export const metadata: Metadata = {
  title: "Financial Intelligence Dashboard | SKC BI Dashboard",
  description:
    "Real-time financial performance and forecasting dashboard with comprehensive KPI tracking",
};

export default function FinancialIntelligencePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <FinancialIntelligence />
    </div>
  );
}
