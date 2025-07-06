import { Metadata, Viewport } from "next";
import { ExecutiveSummaryDashboard } from "@/components/dashboard/executive-summary-dashboard";
import { UltraPremiumDashboardLayout } from "@/components/layout/ultra-premium-dashboard-layout";

export const metadata: Metadata = {
  title: "Executive Dashboard | SKC BI Dashboard",
  description:
    "Strategic executive overview with high-level KPIs, performance metrics, and business intelligence insights for leadership decision making",
  keywords: [
    "Executive Dashboard",
    "Strategic KPIs",
    "Business Intelligence",
    "Leadership Analytics",
    "Performance Metrics",
    "Executive Overview",
    "Strategic Insights",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Executive Dashboard - Strategic Overview",
    description:
      "High-level executive dashboard with strategic KPIs and business intelligence",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ExecutiveDashboardPage({ params }: Props) {
  await params;

  return (
    <div className="dark">
      <UltraPremiumDashboardLayout
        currentPage="Executive Dashboard"
        showSidebar={true}
        fullWidth={false}
      >
        <ExecutiveSummaryDashboard />
      </UltraPremiumDashboardLayout>
    </div>
  );
}
