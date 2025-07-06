import { Metadata } from "next";
import UnifiedMarketingDashboard from "@/components/dashboard/unified-marketing-dashboard";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
} from "@/components/layout/ultra-premium-dashboard-layout";

export const metadata: Metadata = {
  title: "Marketing Command Center - Tier Integration Demo | SKC BI Dashboard",
  description:
    "Demo van het Marketing Command Center met geïntegreerde tier access controls en upgrade flows",
};

export default function CommandCenterTierIntegrationDemo() {
  return (
    <div className="dark min-h-screen">
      <UltraPremiumDashboardLayout>
        <UltraPremiumSection
          title="Command Center - Tier Integration Demo"
          description="Demo van de geïntegreerde MarketingMachine hoofdpagina met tier access controls"
          priority="primary"
        >
          <div className="space-y-6">
            {/* Marketing Command Center with Enhanced Tier Integration */}
            <UnifiedMarketingDashboard />

            {/* Additional Tier Integration Info */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-3">
                🎯 Tier Integration Features Geïmplementeerd
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">
                    ✅ Command Center Integratie:
                  </h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Tier badge toegevoegd aan header</li>
                    <li>Upgrade button in actie bar</li>
                    <li>Professional tier indicatie</li>
                    <li>Conversion flow integratie klaar</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2">
                    🚀 Volgende Stappen:
                  </h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>KPI toegangs-restricties</li>
                    <li>Feature unlock prompts</li>
                    <li>Usage analytics dashboard</li>
                    <li>Smart upgrade recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </UltraPremiumSection>
      </UltraPremiumDashboardLayout>
    </div>
  );
}
