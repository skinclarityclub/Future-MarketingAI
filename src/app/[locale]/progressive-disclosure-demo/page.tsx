import React from "react";
import { Metadata } from "next";
import ProgressiveDisclosureDemoClient from "@/components/demo/progressive-disclosure-demo-client";

export const metadata: Metadata = {
  title: "Progressive Disclosure Demo - SKC BI Dashboard",
  description:
    "Demonstratie van Progressive Disclosure UI patterns voor contextual upgrade hints",
};

export default function ProgressiveDisclosureDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <ProgressiveDisclosureDemoClient />
    </div>
  );
}
