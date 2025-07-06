import { ErrorAnalyticsDashboard } from "@/components/monitoring/error-analytics-dashboard";

export default function ErrorAnalyticsDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Error Analytics Dashboard Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Dit is een uitgebreide error analytics dashboard met real-time
          monitoring, trend analyse, geautomatiseerde alerting en escalatie
          workflows. Het biedt inzichten in systeem fouten,
          oplossingspercentages en kritieke problemen die directe aandacht
          vereisen.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Features:
          </h2>
          <ul className="text-blue-800 space-y-1">
            <li>• Real-time error monitoring met 30-seconden refresh</li>
            <li>• 24-uur trend analyse met interactieve grafieken</li>
            <li>• Configureerbare alert regels met drempel instellingen</li>
            <li>• Multi-level escalatie workflows met timing delays</li>
            <li>• Error categorisatie en severity tracking</li>
            <li>• Resolution rate tracking en performance metrics</li>
          </ul>
        </div>
      </div>

      <ErrorAnalyticsDashboard />
    </div>
  );
}
