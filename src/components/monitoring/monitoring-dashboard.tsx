"use client";

import { SystemHealthWidget } from "./system-health-widget";
import { DataQualityWidget } from "./data-quality-widget";
import { SystemAlertsWidget } from "./system-alerts-widget";
import { ErrorDetectionWidget } from "./error-detection-widget";

export function MonitoringDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            System Monitoring
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring of system health, data quality, and alerts
          </p>
        </div>
      </div>

      {/* Main Monitoring Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SystemHealthWidget />
        <DataQualityWidget />
        <SystemAlertsWidget />
      </div>

      {/* Error Detection Section */}
      <div className="grid gap-6 md:grid-cols-1">
        <ErrorDetectionWidget />
      </div>

      {/* Additional Monitoring Sections */}
      <div className="grid gap-6 md:grid-cols-1">
        {/* Could add more detailed monitoring components here */}
      </div>
    </div>
  );
}
