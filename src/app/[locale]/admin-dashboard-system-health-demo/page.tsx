/**
 * Admin Dashboard System Health Demo Page
 * Subtask 82.4: Develop System Health Monitoring Module
 *
 * Demo page to showcase the comprehensive System Health Monitoring Module
 * with real-time metrics, service status, and resource utilization tracking.
 */

import { Metadata } from "next";
import { SystemHealthMonitoringModule } from "@/components/admin/system-health-monitoring-module";

export const metadata: Metadata = {
  title: "Admin Dashboard - System Health Monitor | SKC BI Dashboard",
  description:
    "Real-time system health monitoring for enterprise admin dashboard with comprehensive metrics and alerting.",
  keywords: [
    "system health",
    "admin dashboard",
    "real-time monitoring",
    "infrastructure monitoring",
    "performance metrics",
    "uptime tracking",
    "enterprise",
    "BI dashboard",
  ],
};

export default function AdminDashboardSystemHealthDemoPage() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-400 uppercase tracking-wider">
              Live Demo - Admin Dashboard
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            System Health Monitoring Module
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Real-time monitoring of system performance, service availability,
            and resource utilization for enterprise-grade operational awareness.
          </p>
        </div>

        {/* Demo Features Info */}
        <div className="mb-8 p-6 rounded-lg bg-gray-800/50 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">
            Demo Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-gray-300">Real-time Data Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-300">Service Health Monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-gray-300">
                Resource Utilization Tracking
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-gray-300">Performance Analytics</span>
            </div>
          </div>
        </div>

        {/* System Health Monitoring Module */}
        <SystemHealthMonitoringModule
          className="mb-8"
          showDetailedView={true}
          refreshInterval={15000} // 15 seconds for demo
        />

        {/* Technical Architecture Info */}
        <div className="mt-12 p-6 rounded-lg bg-gray-800/30 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">
            Technical Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-white mb-2">
                Real-Time Data Sources
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• System Health Metrics</li>
                <li>• Infrastructure Monitoring</li>
                <li>• Service Status Checks</li>
                <li>• Performance Analytics</li>
                <li>• Third-party API Health</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">
                Monitoring Capabilities
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• CPU & Memory Usage</li>
                <li>• Network I/O Monitoring</li>
                <li>• Service Response Times</li>
                <li>• Uptime Tracking</li>
                <li>• Alert Management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">
                Enterprise Features
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Role-based Access Control</li>
                <li>• Custom Alert Thresholds</li>
                <li>• Historical Data Analysis</li>
                <li>• SLA Compliance Tracking</li>
                <li>• Executive Reporting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/20">
          <h2 className="text-lg font-semibold text-white mb-3">
            Implementation Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-green-400 mb-2">
                ✅ Completed Features
              </h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Comprehensive system health monitoring interface</li>
                <li>• Real-time data integration framework</li>
                <li>• Service status tracking and alerting</li>
                <li>• Resource utilization monitoring</li>
                <li>• Performance metrics dashboard</li>
                <li>• Multi-tab interface with detailed views</li>
                <li>• Live connection status indicators</li>
                <li>• Alert acknowledgment system</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-400 mb-2">
                🔄 Integration Points
              </h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Admin Dashboard Real-time Data Aggregator</li>
                <li>• useSystemHealthRealtime Hook</li>
                <li>• Health Monitoring Engine Integration</li>
                <li>• Alert Management System</li>
                <li>• Role-based Access Control (RBAC)</li>
                <li>• WebSocket & SSE Real-time Updates</li>
                <li>• Supabase Health Metrics Storage</li>
                <li>• n8n Workflow Health Integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Task Master Context */}
        <div className="mt-8 p-4 rounded-lg bg-gray-800/50 border border-gray-600">
          <p className="text-xs text-gray-400">
            <strong>Task Master Context:</strong> Task 82.4 - Develop System
            Health Monitoring Module | Part of Integrated Admin Dashboard
            (Master Command Center) | Implements comprehensive real-time system
            health monitoring with enterprise-grade features
          </p>
        </div>
      </div>
    </div>
  );
}
