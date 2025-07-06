import { Metadata } from "next";
import FinancialIntelligence from "@/components/dashboard/financial-intelligence";

export const metadata: Metadata = {
  title: "Comprehensive Dashboard | SKC BI Dashboard",
  description:
    "Complete business intelligence dashboard with financial intelligence and marketing optimization",
};

export default function ComprehensiveDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <FinancialIntelligence />
    </div>
  );
}
