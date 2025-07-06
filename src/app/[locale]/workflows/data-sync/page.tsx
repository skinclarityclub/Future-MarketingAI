/**
 * Data Synchronization Demo Page
 * Task 33.4: Enable Bidirectional Data Synchronization
 * Demonstrates bidirectional data sync between dashboard and n8n workflows
 */

import { Metadata } from "next";
import DataSyncDashboard from "@/components/workflows/data-sync-dashboard";

export const metadata: Metadata = {
  title: "Data Synchronization | SKC BI Dashboard",
  description:
    "Manage bidirectional data synchronization between dashboard and n8n workflows",
};

export default function DataSyncPage() {
  return (
    <div className="container mx-auto py-6">
      <DataSyncDashboard />
    </div>
  );
}
