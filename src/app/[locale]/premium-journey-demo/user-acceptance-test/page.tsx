import { Metadata } from "next";
import UserAcceptanceTesting from "@/components/ui/user-acceptance-testing";

export const metadata: Metadata = {
  title: "User Acceptance Testing - Complete Growth Platform Demo",
  description:
    "Comprehensive UAT framework for Complete Growth Platform Demo validation",
  keywords:
    "UAT, testing, Complete Growth Platform, customer journey, validation",
};

export default function UserAcceptanceTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <UserAcceptanceTesting />
    </div>
  );
}
