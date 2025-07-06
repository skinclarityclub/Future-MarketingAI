import ClickUpDashboard from "@/components/dashboard/clickup-dashboard";

export default function ClickUpIntegrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            ClickUp Integration Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete ClickUp integration with team collaboration, task
            management, and bidirectional sync capabilities.
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ✨ Recent Update: Team Collaboration Features
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              New team collaboration tab added with space management, member
              overview, task commenting, and activity tracking.
            </p>
          </div>
        </div>
        <ClickUpDashboard />
      </div>
    </div>
  );
}
