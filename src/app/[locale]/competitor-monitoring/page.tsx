/**
 * Task 71.8: Concurrentie Monitoring Dashboard
 * Een uitgebreide dashboard voor het monitoren van concurrenten en het genereren van alerts
 */

import { CompetitorMonitoringDashboard } from "@/components/marketing/competitor-monitoring-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Concurrentie Monitoring | SKC BI Dashboard",
  description:
    "Monitor en analyseer concurrentie performance met real-time alerts en insights",
};

interface CompetitorMonitoringPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CompetitorMonitoringPage({
  params,
}: CompetitorMonitoringPageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Concurrentie Monitoring
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Monitor je concurrentie, analyseer hun performance en ontvang alerts
            bij belangrijke veranderingen
          </p>
        </div>

        {/* Dashboard Component */}
        <CompetitorMonitoringDashboard locale={locale} />
      </div>
    </div>
  );
}
