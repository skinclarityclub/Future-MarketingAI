import { Metadata } from "next";
import EnterpriseApprovalDashboard from "@/components/dashboard/enterprise-approval-dashboard";

export const metadata: Metadata = {
  title: "Enterprise Approval Workflow Demo | SKC BI Dashboard",
  description:
    "Comprehensive enterprise-grade approval workflow management system with multi-level reviews, permissions, and audit trails.",
  keywords: [
    "approval workflow",
    "enterprise",
    "compliance",
    "audit trail",
    "business process",
  ],
};

export default function EnterpriseApprovalDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <EnterpriseApprovalDashboard />
    </div>
  );
}
