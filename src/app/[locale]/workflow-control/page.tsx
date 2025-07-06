import React from "react";
import { Metadata } from "next";
import MasterWorkflowControllerDashboard from "@/components/workflows/master-workflow-controller-dashboard";

export const metadata: Metadata = {
  title: "WorkFlow Control | SKC BI Dashboard",
  description:
    "Master workflow automation and process control dashboard for enterprise marketing operations",
  keywords: [
    "workflow",
    "automation",
    "process control",
    "orchestration",
    "marketing",
  ],
};

interface WorkflowControlPageProps {
  params: Promise<{ locale: string }>;
}

export default async function WorkflowControlPage({
  params,
}: WorkflowControlPageProps) {
  await params;
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <MasterWorkflowControllerDashboard />
    </div>
  );
}
