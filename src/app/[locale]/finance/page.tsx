import { Metadata } from "next";
import { UltraPremiumDashboardLayout } from "@/components/layout/ultra-premium-dashboard-layout";
import FinancialIntelligence from "@/components/dashboard/financial-intelligence";

export const metadata: Metadata = {
  title: "Finance Dashboard | SKC BI Dashboard",
  description:
    "Financial intelligence and analytics dashboard with comprehensive KPI tracking, budget analysis, and financial reporting",
  keywords: [
    "Finance Dashboard",
    "Financial Intelligence",
    "Financial KPIs",
    "Budget Analysis",
    "Financial Reporting",
    "Revenue Analytics",
    "Financial Metrics",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Finance Dashboard - Financial Intelligence",
    description:
      "Comprehensive financial dashboard with intelligent analytics and reporting",
    type: "website",
  },
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function FinancePage({ params }: Props) {
  await params;

  const breadcrumbItems = [
    { label: "Finance", href: "/finance", current: true },
  ];

  return (
    <div className="dark">
      <UltraPremiumDashboardLayout
        currentPage="Finance Dashboard"
        showSidebar={true}
        fullWidth={false}
        showBreadcrumbs={true}
        breadcrumbItems={breadcrumbItems}
      >
        <FinancialIntelligence />
      </UltraPremiumDashboardLayout>
    </div>
  );
}
