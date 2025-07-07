"use client";

import React from "react";
import APITestingSuite from "@/components/testing/api-testing-suite";
import { UltraPremiumDashboardLayout } from "@/components/layout/ultra-premium-dashboard-layout";

export default function APITestingSuitePage() {
  return (
    <UltraPremiumDashboardLayout>
      <div className="container-mobile space-y-6">
        <div className="glass-primary p-6 rounded-premium">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-neutral-100">
              API Testing Dashboard
            </h1>
            <p className="text-neutral-400">
              Task 21.5 Implementation - Data Integration & API Endpoint Testing
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-neutral-300">
                Testing Environment Ready
              </span>
            </div>
          </div>
        </div>

        <APITestingSuite
          onTestComplete={results => {
            console.log("API Test results:", results);
          }}
        />

        <div className="glass-secondary p-6 rounded-premium">
          <h2 className="text-xl font-semibold text-neutral-100 mb-4">
            Task 21.5 Implementation Overview
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-neutral-200">
                  API Categories Tested
                </h3>
                <ul className="text-sm text-neutral-400 space-y-1">
                  <li>
                    🏥 <strong>System Health:</strong> Health checks and
                    diagnostics
                  </li>
                  <li>
                    📊 <strong>Dashboard:</strong> Main dashboard data and KPIs
                  </li>
                  <li>
                    👥 <strong>Analytics:</strong> Customer intelligence and
                    insights
                  </li>
                  <li>
                    📈 <strong>Marketing:</strong> Campaign performance and ROI
                  </li>
                  <li>
                    💰 <strong>Financial:</strong> Budget and financial data
                  </li>
                  <li>
                    🤖 <strong>AI/ML:</strong> Machine learning and predictive
                    models
                  </li>
                  <li>
                    📡 <strong>Monitoring:</strong> Real-time data and
                    performance
                  </li>
                  <li>
                    🎯 <strong>Optimization:</strong> Content ROI and
                    recommendations
                  </li>
                  <li>
                    🔒 <strong>Security:</strong> Security testing and
                    validation
                  </li>
                  <li>
                    🗄️ <strong>Database:</strong> Supabase integration testing
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-neutral-200">
                  Key Testing Features
                </h3>
                <ul className="text-sm text-neutral-400 space-y-1">
                  <li>
                    ⚡ <strong>Response Time Monitoring:</strong> Sub-second
                    performance tracking
                  </li>
                  <li>
                    🎯 <strong>Status Code Validation:</strong> Expected vs
                    actual responses
                  </li>
                  <li>
                    📋 <strong>Data Integrity Checks:</strong> JSON validation
                    and structure
                  </li>
                  <li>
                    🔍 <strong>Error Detection:</strong> Comprehensive error
                    reporting
                  </li>
                  <li>
                    📊 <strong>Performance Analytics:</strong> Response time
                    distribution
                  </li>
                  <li>
                    🏗️ <strong>Integration Status:</strong> Service connectivity
                    validation
                  </li>
                  <li>
                    📈 <strong>Real-time Results:</strong> Live testing progress
                  </li>
                  <li>
                    🎛️ <strong>Category Filtering:</strong> Focused testing by
                    service type
                  </li>
                  <li>
                    📑 <strong>Detailed Reporting:</strong> Comprehensive test
                    results
                  </li>
                  <li>
                    🔄 <strong>Automated Testing:</strong> One-click test
                    execution
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-neutral-700/30 pt-4">
              <h3 className="font-medium text-neutral-200 mb-2">
                Data Integration Validation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-neutral-300">
                    <strong>Supabase Database:</strong>
                  </p>
                  <p className="text-neutral-400">
                    PostgreSQL connectivity, schema validation, query
                    performance
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-300">
                    <strong>n8n Workflows:</strong>
                  </p>
                  <p className="text-neutral-400">
                    Automation endpoints, workflow triggers, data transformation
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-300">
                    <strong>Real-time Data:</strong>
                  </p>
                  <p className="text-neutral-400">
                    WebSocket connections, streaming data, live updates
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-700/30 pt-4">
              <h3 className="font-medium text-neutral-200 mb-2">
                Performance Benchmarks
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 rounded glass-primary">
                  <div className="text-success-500 font-bold text-lg">
                    &lt; 100ms
                  </div>
                  <div className="text-neutral-400">Excellent</div>
                </div>
                <div className="text-center p-3 rounded glass-primary">
                  <div className="text-primary-400 font-bold text-lg">
                    &lt; 500ms
                  </div>
                  <div className="text-neutral-400">Good</div>
                </div>
                <div className="text-center p-3 rounded glass-primary">
                  <div className="text-warning-500 font-bold text-lg">
                    &lt; 1s
                  </div>
                  <div className="text-neutral-400">Fair</div>
                </div>
                <div className="text-center p-3 rounded glass-primary">
                  <div className="text-error-500 font-bold text-lg">
                    &gt; 1s
                  </div>
                  <div className="text-neutral-400">Needs Optimization</div>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-700/30 pt-4">
              <h3 className="font-medium text-neutral-200 mb-2">Next Steps</h3>
              <p className="text-sm text-neutral-400">
                After completing the API testing, continue with Task 21.6
                (Multi-Language and Accessibility Testing) to validate
                internationalization support and accessibility compliance across
                the entire system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UltraPremiumDashboardLayout>
  );
}
