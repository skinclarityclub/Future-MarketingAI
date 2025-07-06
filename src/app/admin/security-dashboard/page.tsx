"use client";

/**
 * Security & Scalability Dashboard Page
 * Task 13.5: Ensure Scalability and Data Security
 *
 * Admin page for monitoring the AI Navigation System's security and scalability
 */

import SecurityTestDashboard from "@/components/admin/security-test-dashboard";

export default function SecurityDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Security Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive security assessment and monitoring for the BI
            Dashboard system
          </p>
        </div>

        <SecurityTestDashboard />
      </div>
    </div>
  );
}
