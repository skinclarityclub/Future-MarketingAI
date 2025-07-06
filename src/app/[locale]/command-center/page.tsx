import { Metadata, Viewport } from "next";
import UnifiedCommandCenter from "@/components/fortune-500/command-center-layout";

export const metadata: Metadata = {
  title: "Command Center | SKC BI Dashboard",
  description:
    "MarketingMachine Command Center - Ultimate control hub for marketing automation, publishing, and campaign management with real-time monitoring and 4K support",
  keywords: [
    "Command Center",
    "Marketing Automation",
    "Publishing Control",
    "Campaign Management",
    "Real-time Monitoring",
    "4K Dashboard",
    "Business Intelligence",
  ],
  robots: "index, follow",
  openGraph: {
    title: "MarketingMachine Command Center",
    description:
      "Enterprise-grade marketing command center with futuristic UI/UX",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e293b",
};

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CommandCenterPage({ params }: Props) {
  const { locale } = await params;
  return <UnifiedCommandCenter locale={locale} />;
}
