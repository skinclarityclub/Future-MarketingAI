import PerformanceMonitoringDashboard from "@/components/admin/performance-monitoring-dashboard";

export default function PerformanceMonitoringPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Performance Monitoring
          </h1>
          <p className="text-muted-foreground">
            Real-time performance monitoring and load testing for optimal system
            performance
          </p>
        </div>

        <PerformanceMonitoringDashboard />
      </div>
    </div>
  );
}
