/**
 * Orchestration Monitor Dashboard
 * Task 73: Geleidelijke integratie monitoring
 *
 * Dashboard om beide orchestrators te monitoren:
 * - Webhook Orchestrator v2.0 (bestaand)
 * - Master Workflow Controller v3.0 (AI-enhanced)
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orchestration Monitor - SKC BI Dashboard",
  description: "Monitor beide workflow orchestrators en hun performance",
};

export default function OrchestrationMonitorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                🎛️ Orchestration Monitor
              </h1>
              <p className="text-slate-600 mt-2">
                Monitor workflow orchestrators en routing decisions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Gateway Active
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                v1.0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-slate-900">1,247</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">📊</div>
          </div>
          <div className="mt-2">
            <span className="text-green-600 text-sm">+12% vandaag</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Webhook Orchestrator</p>
              <p className="text-2xl font-bold text-slate-900">892</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">🔄</div>
          </div>
          <div className="mt-2">
            <span className="text-slate-600 text-sm">71.5% van requests</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Master Controller</p>
              <p className="text-2xl font-bold text-slate-900">355</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">✨</div>
          </div>
          <div className="mt-2">
            <span className="text-purple-600 text-sm">28.5% AI-enhanced</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Avg Response Time</p>
              <p className="text-2xl font-bold text-slate-900">124ms</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">⚡</div>
          </div>
          <div className="mt-2">
            <span className="text-green-600 text-sm">-8% improvement</span>
          </div>
        </div>
      </div>

      {/* Orchestrator Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Webhook Orchestrator Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">
              🔄 Webhook Orchestrator v2.0
            </h3>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Healthy
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Status</span>
              <span className="text-green-600 font-medium">✅ Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Endpoint</span>
              <span className="text-slate-900 text-sm font-mono">
                orchestrator-v2
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Last Response</span>
              <span className="text-slate-900">127ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Success Rate</span>
              <span className="text-green-600 font-medium">99.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Request Types</span>
              <span className="text-slate-900">Callbacks, Messages</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <h4 className="font-medium text-slate-900 mb-2">Recent Activity</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Telegram Callbacks</span>
                <span className="text-slate-900">542 today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Scheduled Content</span>
                <span className="text-slate-900">187 today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Chat Messages</span>
                <span className="text-slate-900">163 today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Workflow Controller Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">
              ✨ Master Controller v3.0
            </h3>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              AI-Enhanced
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Status</span>
              <span className="text-purple-600 font-medium">✨ AI Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Endpoint</span>
              <span className="text-slate-900 text-sm font-mono">
                master-controller
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Last Response</span>
              <span className="text-slate-900">89ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Success Rate</span>
              <span className="text-purple-600 font-medium">97.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Learning Mode</span>
              <span className="text-purple-600">🧠 Active</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <h4 className="font-medium text-slate-900 mb-2">AI Features</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Cross-Platform Learning</span>
                <span className="text-purple-600">✅ Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Intelligent Scheduling</span>
                <span className="text-purple-600">✅ Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Optimization Feedback</span>
                <span className="text-purple-600">✅ Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Routing Decision Examples */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          🎯 Routing Decision Examples
        </h3>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-800">
                Simple Telegram Callback
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                → Webhook
              </span>
            </div>
            <p className="text-green-700 text-sm">
              AIP_1234_image-approval → Routed to Webhook Orchestrator
              (complexity: simple)
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-purple-800">
                AI-Enhanced Content Creation
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                → Master
              </span>
            </div>
            <p className="text-purple-700 text-sm">
              Multi-platform post with learning_enabled → Routed to Master
              Controller (AI-enhanced)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800">
                Complex Marketing Strategy
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                → Master
              </span>
            </div>
            <p className="text-blue-700 text-sm">
              carousel_creation with optimization_enabled → Routed to Master
              Controller (complex)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-yellow-800">
                Scheduled Content
              </span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                → Webhook
              </span>
            </div>
            <p className="text-yellow-700 text-sm">
              Standard scheduled post → Routed to Webhook Orchestrator (standard
              processing)
            </p>
          </div>
        </div>
      </div>

      {/* Gateway Configuration */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          ⚙️ Gateway Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Routing Rules</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">AI Enhancement Threshold</span>
                <span className="text-slate-900">70%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Complexity Scoring</span>
                <span className="text-slate-900">Multi-factor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Fallback Strategy</span>
                <span className="text-slate-900">Webhook Orchestrator</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Admin User Priority</span>
                <span className="text-slate-900">+15 score boost</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-3">
              Performance Targets
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Max Response Time</span>
                <span className="text-slate-900">200ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Success Rate Target</span>
                <span className="text-slate-900">99%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">AI Enhancement Rate</span>
                <span className="text-slate-900">25-35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Load Balancing</span>
                <span className="text-slate-900">Intelligent</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Gateway Health</h4>
              <p className="text-slate-600 text-sm">All systems operational</p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Test Gateway
              </button>
              <button className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                View Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
