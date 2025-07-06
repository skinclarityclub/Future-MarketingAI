import { Metadata, Viewport } from "next";
import MultiUserCollaborationDashboard from "@/components/dashboard/multi-user-collaboration-dashboard";

export const metadata: Metadata = {
  title: "Multi-User Collaboration System - SKC BI Dashboard",
  description:
    "Real-time collaboration platform with user management, workspaces, live sessions, and team productivity analytics",
  keywords:
    "collaboration, teamwork, real-time, workspace, productivity, analytics",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#1f2937",
};

export default function MultiUserCollaborationDemo() {
  return (
    <div className="dark min-h-screen bg-gray-900">
      <MultiUserCollaborationDashboard />
    </div>
  );
}
