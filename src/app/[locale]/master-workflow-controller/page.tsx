/**
 * Master Workflow Controller Dashboard
 * Task 73: Universal n8n AI/ML Workflow Orchestration Platform
 *
 * Comprehensive dashboard for monitoring and controlling the Master Workflow Controller
 * with real-time AI/ML orchestration insights, cross-platform learning, and automated optimization
 */

import { Metadata } from "next";
import MasterWorkflowControllerDashboard from "@/components/workflows/master-workflow-controller-dashboard";

export const metadata: Metadata = {
  title: "Master Workflow Controller | SKC BI Dashboard",
  description:
    "Universal n8n AI/ML Workflow Orchestration Platform - Master controller for intelligent workflow management, cross-platform learning, and automated optimization",
  keywords: [
    "workflow orchestration",
    "AI/ML automation",
    "n8n workflows",
    "cross-platform learning",
    "intelligent scheduling",
    "anomaly detection",
    "model retraining",
    "performance optimization",
  ],
};

export default function MasterWorkflowControllerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 animate-gradient-shift"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      {/* Header Section */}
      <div className="relative z-10 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
              Master Workflow Controller
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Universal n8n AI/ML Orchestration Platform with intelligent
              workflow management, cross-platform learning, automated
              optimization, and comprehensive monitoring.
            </p>

            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                System Active - All Controllers Online
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                12
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Workflows
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                98.7%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Success Rate
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                127
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Learning Patterns
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                32
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Optimizations
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                3
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Anomalies
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                2
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Models Retraining
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="relative z-10">
        <MasterWorkflowControllerDashboard />
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-16 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Powered by Enterprise n8n Orchestration Platform</span>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Real-time Monitoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>AI-Enhanced</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Cross-Platform Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
