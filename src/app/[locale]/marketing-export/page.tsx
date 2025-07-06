import { Metadata } from "next";
import MarketingExportCapabilities from "@/components/dashboard/marketing-export-capabilities";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";

export const metadata: Metadata = {
  title: "Marketing Export Capabilities - SKC BI Dashboard",
  description:
    "Exporteer marketing dashboard data naar executive-vriendelijke formaten zoals PDF, Excel en CSV",
  keywords: [
    "export",
    "marketing",
    "dashboard",
    "PDF",
    "Excel",
    "CSV",
    "executive",
    "reporting",
  ],
};

export default function MarketingExportPage() {
  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title="Marketing Export Capabilities"
        subtitle="Exporteer marketing data voor executive reporting en analyse"
      >
        <MarketingExportCapabilities />
      </UltraPremiumSection>
    </UltraPremiumDashboardLayout>
  );
}
