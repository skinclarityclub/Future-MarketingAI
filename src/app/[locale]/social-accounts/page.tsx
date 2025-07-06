import React from "react";
import { Metadata } from "next";
import SocialMediaOversightDashboard from "@/components/marketing/social-media-oversight-dashboard";

export const metadata: Metadata = {
  title: "Social Accounts | SKC BI Dashboard",
  description:
    "Social media accounts management and oversight dashboard for Fortune 500 marketing operations",
  keywords: [
    "social media",
    "accounts",
    "marketing",
    "oversight",
    "management",
  ],
};

interface SocialAccountsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SocialAccountsPage({
  params,
}: SocialAccountsPageProps) {
  await params;
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <SocialMediaOversightDashboard />
    </div>
  );
}
