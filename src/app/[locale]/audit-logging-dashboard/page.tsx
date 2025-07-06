/**
 * Task 71.10: Audit & Logging Dashboard
 * Enterprise-grade audit trail and error handling management interface
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit & Logging Dashboard - SKC BI Dashboard",
  description:
    "Enterprise audit trail management, error handling monitoring, and workflow documentation system",
  keywords: [
    "audit",
    "logging",
    "compliance",
    "error handling",
    "workflow documentation",
  ],
};

export default function AuditLoggingDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Audit & Logging Dashboard
              </h1>
              <p className="text-slate-600 text-lg">
                Enterprise-grade audit trails, error handling, and compliance
                monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-600">
                  System Operational
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Audit System
              </h3>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">1,247</div>
              <div className="text-sm text-slate-600">
                Events processed (24h)
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">98.5%</span>
                <span className="text-slate-500 ml-1">compliance rate</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Error Handling
              </h3>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">23</div>
              <div className="text-sm text-slate-600">Errors handled (24h)</div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">87.3%</span>
                <span className="text-slate-500 ml-1">recovery rate</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Documentation
              </h3>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">45</div>
              <div className="text-sm text-slate-600">Workflows documented</div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">92.1%</span>
                <span className="text-slate-500 ml-1">coverage rate</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Compliance
              </h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">98.9%</div>
              <div className="text-sm text-slate-600">Overall compliance</div>
              <div className="flex items-center text-sm">
                <span className="text-blue-600 font-medium">2</span>
                <span className="text-slate-500 ml-1">recommendations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Audit Events */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Recent Audit Events
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">
                    Workflow Started
                  </div>
                  <div className="text-sm text-slate-600">
                    competitor_monitoring_001 execution began
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Just now</div>
                </div>
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  WORKFLOW_START
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">
                    Error Recovered
                  </div>
                  <div className="text-sm text-slate-600">
                    Rate limit error in Instagram scraper
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    2 minutes ago
                  </div>
                </div>
                <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  WORKFLOW_ERROR
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">
                    Security Alert
                  </div>
                  <div className="text-sm text-slate-600">
                    Suspicious data access detected
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    5 minutes ago
                  </div>
                </div>
                <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  SECURITY_EVENT
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">
                    Documentation Generated
                  </div>
                  <div className="text-sm text-slate-600">
                    User guide created for competitor monitoring
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    10 minutes ago
                  </div>
                </div>
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  SYSTEM_EVENT
                </div>
              </div>
            </div>
          </div>

          {/* Error Analytics */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Error Analytics
              </h2>
              <select className="text-sm border border-slate-300 rounded-lg px-3 py-1">
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">156</div>
                  <div className="text-sm text-slate-600">Total Errors</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">134</div>
                  <div className="text-sm text-slate-600">Auto Recovered</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Network Errors</span>
                  <span className="text-sm font-medium">45</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "29%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Rate Limits</span>
                  <span className="text-sm font-medium">34</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: "22%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Validation Errors
                  </span>
                  <span className="text-sm font-medium">28</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "18%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Authentication</span>
                  <span className="text-sm font-medium">23</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: "15%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Compliance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                GDPR Compliance
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-1">
                99.2%
              </div>
              <div className="text-sm text-slate-600">2 minor issues</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                SOX Compliance
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-1">100%</div>
              <div className="text-sm text-slate-600">No issues</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                ISO 27001
              </h3>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                97.8%
              </div>
              <div className="text-sm text-slate-600">3 recommendations</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            System Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Generate Audit Report
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Update Documentation
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Test Error Handling
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Run Compliance Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
