import { WorkflowDashboard } from "@/components/workflows/workflow-dashboard";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";

interface PageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function WorkflowMonitoringPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {dict.monitoring?.workflows?.title || "Workflow Monitoring"}
          </h1>
          <p className="text-purple-200 text-lg">
            {dict.monitoring?.workflows?.subtitle ||
              "N8N workflow monitoring and management"}
          </p>
        </div>
        <WorkflowDashboard />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "nl" }];
}
