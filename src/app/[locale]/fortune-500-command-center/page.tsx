import { Metadata, Viewport } from "next";
import Fortune500CommandCenter from "@/components/fortune-500/command-center-layout";

export const metadata: Metadata = {
  title: "Fortune 500 Command Center | SKC BI Dashboard",
  description:
    "Next-generation enterprise marketing command center with real-time monitoring, 4K support, and advanced UI/UX elements designed for Fortune 500 companies",
  keywords: [
    "Fortune 500",
    "Command Center",
    "Marketing Dashboard",
    "Enterprise",
    "Real-time Monitoring",
    "4K Dashboard",
    "Business Intelligence",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Fortune 500 Command Center",
    description:
      "Enterprise-grade marketing command center with futuristic UI/UX",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // For mission-critical interfaces
};

interface Fortune500CommandCenterPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Fortune500CommandCenterPage({
  params,
}: Fortune500CommandCenterPageProps) {
  const { locale } = await params;

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/30 to-purple-900/20">
      <Fortune500CommandCenter locale={locale} />
    </div>
  );
}
