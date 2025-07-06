import { Metadata } from "next";
import IntegrationTestingSuite from "@/components/ui/integration-testing-suite";

export const metadata: Metadata = {
  title: "Integration Testing Suite - Complete Growth Platform Demo",
  description:
    "Comprehensive testing and integration management for the Complete Growth Platform Demo",
  keywords:
    "integration testing, Complete Growth Platform, customer journey, QA",
};

export default function IntegrationTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <IntegrationTestingSuite />
    </div>
  );
}
