import { Metadata } from "next";
import SocialMediaOversightDashboard from "@/components/marketing/social-media-oversight-dashboard";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "Social Media Oversight Demo | SKC BI Dashboard",
  description:
    "Demo of social media oversight tools for monitoring engagement metrics across platforms",
  keywords: [
    "social media oversight",
    "engagement monitoring",
    "social media analytics",
    "platform management",
    "real-time metrics",
  ],
};

export default function SocialMediaOversightDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <ErrorBoundary>
        <SocialMediaOversightDashboard />
      </ErrorBoundary>
    </div>
  );
}
