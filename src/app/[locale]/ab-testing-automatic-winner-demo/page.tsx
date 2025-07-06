import { Metadata } from "next";
import { ABTestingAutomaticWinnerDemo } from "@/components/ab-testing/automatic-winner-demo";

export const metadata: Metadata = {
  title: "A/B Testing Automatic Winner Selection - Demo",
  description:
    "Live demonstration of automatic A/B test winner selection and implementation",
};

interface ABTestingAutomaticWinnerDemoPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ABTestingAutomaticWinnerDemoPage({
  params,
}: ABTestingAutomaticWinnerDemoPageProps) {
  const { locale } = await params;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🏆 Automatic Winner Selection Demo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience live A/B testing with intelligent automatic winner
              selection, real-time statistical analysis, and seamless
              implementation across content and workflows.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Statistical Significance
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Advanced statistical analysis with confidence intervals,
                  p-values, and effect sizes
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Automatic Implementation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Seamless rollout across content systems, workflows, and
                  analytics platforms
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Real-time Monitoring
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Live performance tracking with alerts, rollback capabilities,
                  and safety checks
                </p>
              </div>
            </div>
          </div>

          {/* Main Demo Component */}
          <ABTestingAutomaticWinnerDemo />

          {/* Technical Details */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🔧 Technical Implementation
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Core Components
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>
                      <strong>Test Conclusion Engine:</strong> Statistical
                      analysis and decision making
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>
                      <strong>Automatic Scheduler:</strong> Continuous
                      monitoring and evaluation
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>
                      <strong>Integration Service:</strong> Content and workflow
                      system updates
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>
                      <strong>Central Control Center:</strong> Management and
                      monitoring interface
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Integration Points
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    <span>
                      <strong>Content Management:</strong> Email, Social Media,
                      Landing Pages
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    <span>
                      <strong>Workflow Systems:</strong> n8n, Blotato, Internal
                      Processes
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    <span>
                      <strong>Analytics Platforms:</strong> Google Analytics,
                      Internal BI
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    <span>
                      <strong>Notification Systems:</strong> Email, Slack, Teams
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🚀 Implementation Strategies
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                The system supports multiple implementation strategies:{" "}
                <strong>Immediate</strong> (100% rollout),
                <strong>Gradual</strong> (staged rollout with monitoring),{" "}
                <strong>Staged</strong> (custom phases), and{" "}
                <strong>Delayed</strong> (scheduled implementation). Each
                strategy includes safety checks, rollback capabilities, and
                real-time monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
