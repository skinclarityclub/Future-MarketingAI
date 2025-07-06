/**
 * Admin Dashboard Revenue & Business Analytics Demo Page
 * Subtask 82.5: Build Revenue & Business Analytics Module
 */

import { Metadata } from "next";
import { RevenueBusinessAnalyticsModule } from "@/components/admin/revenue-business-analytics-module";

export const metadata: Metadata = {
  title: "Admin Dashboard - Revenue & Business Analytics | SKC BI Dashboard",
  description:
    "Comprehensive revenue and business analytics for enterprise admin dashboard with MRR, CAC, LTV tracking.",
  keywords: [
    "revenue analytics",
    "business metrics",
    "admin dashboard",
    "MRR tracking",
    "CAC optimization",
    "LTV analysis",
    "enterprise analytics",
    "BI dashboard",
  ],
};

export default function AdminDashboardRevenueDemoPage() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">
              Live Demo - Admin Dashboard
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Revenue & Business Analytics Module
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Comprehensive business performance monitoring with MRR, CAC, LTV
            analysis, funnel optimization, and financial health tracking for
            data-driven decisions.
          </p>
        </div>

        {/* Demo Features Info */}
        <div className="mb-8 p-6 rounded-lg bg-gray-800/50 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">
            Analytics Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-gray-300">Revenue Metrics (MRR/ARR)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-300">
                Customer Analytics (LTV/CAC)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-gray-300">Conversion Funnel Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-gray-300">Financial Health Monitoring</span>
            </div>
          </div>
        </div>

        {/* Revenue & Business Analytics Module */}
        <RevenueBusinessAnalyticsModule
          className="mb-8"
          refreshInterval={30000} // 30 seconds for demo
        />

        {/* Business Metrics Overview */}
        <div className="mt-12 p-6 rounded-lg bg-gray-800/30 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">
            Key Business Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-white mb-2">Revenue Tracking</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Monthly Recurring Revenue (MRR)</li>
                <li>• Annual Recurring Revenue (ARR)</li>
                <li>• Revenue Growth Trends</li>
                <li>• Average Revenue Per User (ARPU)</li>
                <li>• Revenue by Pricing Tier</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">
                Customer Analytics
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Customer Lifetime Value (LTV)</li>
                <li>• Customer Acquisition Cost (CAC)</li>
                <li>• LTV:CAC Ratio Optimization</li>
                <li>• Churn Rate Analysis</li>
                <li>• Customer Growth Metrics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Financial Health</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Gross Margin Tracking</li>
                <li>• Burn Rate Monitoring</li>
                <li>• Cash Runway Analysis</li>
                <li>• Payback Period Calculation</li>
                <li>• Financial Forecasting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-blue-500/20">
          <h2 className="text-lg font-semibold text-white mb-3">
            Implementation Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-green-400 mb-2">
                ✅ Completed Features
              </h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Comprehensive revenue analytics interface</li>
                <li>• Real-time business metrics tracking</li>
                <li>• KPI dashboard with trend indicators</li>
                <li>• Revenue growth visualization</li>
                <li>• Customer lifecycle value analysis</li>
                <li>• Business health monitoring</li>
                <li>• Export and reporting capabilities</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-400 mb-2">
                🔄 Integration Points
              </h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Admin Dashboard Real-time Data Aggregator</li>
                <li>• Business Metrics Real-time Hook</li>
                <li>• Revenue Analytics Data Sources</li>
                <li>• Financial Intelligence Dashboard</li>
                <li>• Customer Intelligence Systems</li>
                <li>• Revenue Chart Components</li>
                <li>• Business Analytics Services</li>
                <li>• Executive Summary Integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Analytics Architecture */}
        <div className="mt-8 p-6 rounded-lg bg-gray-800/50 border border-gray-600">
          <h2 className="text-lg font-semibold text-white mb-3">
            Analytics Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-white mb-2">Data Sources</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Subscription Management System</li>
                <li>• Customer Database</li>
                <li>• Payment Processing Data</li>
                <li>• Usage Analytics</li>
                <li>• Support System Metrics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Analytics Engine</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Real-time Data Aggregation</li>
                <li>• Business Logic Processing</li>
                <li>• Metric Calculations</li>
                <li>• Trend Analysis</li>
                <li>• Forecasting Algorithms</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Visualization</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Interactive Charts & Graphs</li>
                <li>• KPI Dashboard Cards</li>
                <li>• Trend Indicators</li>
                <li>• Comparative Analysis</li>
                <li>• Executive Reporting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Task Master Context */}
        <div className="mt-8 p-4 rounded-lg bg-gray-800/50 border border-gray-600">
          <p className="text-xs text-gray-400">
            <strong>Task Master Context:</strong> Task 82.5 - Build Revenue &
            Business Analytics Module | Part of Integrated Admin Dashboard
            (Master Command Center) | Implements comprehensive business
            analytics with MRR, CAC, LTV tracking and financial health
            monitoring
          </p>
        </div>
      </div>
    </div>
  );
}
