import { AutomaticContentOptimizationDashboard } from "@/components/content/automatic-content-optimization-dashboard";

interface ContentOptimizationPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ContentOptimizationPage({
  params,
}: ContentOptimizationPageProps) {
  const resolvedParams = await params;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Automatische Content Optimalisatie
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          AI-powered content suggestions en automatische optimalisaties voor
          maximale performance
        </p>
      </div>

      <AutomaticContentOptimizationDashboard locale={resolvedParams.locale} />
    </div>
  );
}
