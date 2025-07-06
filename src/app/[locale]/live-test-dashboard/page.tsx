import React from "react";
import LiveTestDashboard from "@/components/marketing/live-test-dashboard";

interface LiveTestDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LiveTestDashboardPage({
  params,
}: LiveTestDashboardPageProps) {
  const { locale } = await params;

  return <LiveTestDashboard />;
}
