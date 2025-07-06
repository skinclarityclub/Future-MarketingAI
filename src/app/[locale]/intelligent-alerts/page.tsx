import { IntelligentAlertsDashboard } from "@/components/dashboard/intelligent-alerts-dashboard";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function IntelligentAlertsPage({ params }: PageProps) {
  const { locale } = await params;
  return <IntelligentAlertsDashboard locale={locale} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const isNL = locale === "nl";

  return {
    title: isNL
      ? "SKC BI Dashboard - Intelligente Waarschuwingen"
      : "SKC BI Dashboard - Intelligent Alerts",
    description: isNL
      ? "Real-time monitoring en anomaly detection dashboard voor je bedrijfsprocessen"
      : "Real-time monitoring and anomaly detection dashboard for your business processes",
  };
}
