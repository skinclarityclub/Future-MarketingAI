import { InteractiveROICalculator } from "@/components/marketing/interactive-roi-calculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-Powered ROI Calculator Demo | SKC BI Dashboard",
  description:
    "Ontdek je marketing potentieel met onze geavanceerde AI-powered ROI calculator met real-time berekeningen en inzichten.",
  keywords: [
    "ROI calculator",
    "marketing ROI",
    "AI analytics",
    "business intelligence",
  ],
};

export default function ROICalculatorDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="relative">
        <InteractiveROICalculator />
      </div>
    </div>
  );
}
