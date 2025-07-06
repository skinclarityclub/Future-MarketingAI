"use client";

import React from "react";
import ContentROICards from "./content-roi-cards";
import ROITrendsChart from "./roi-trends-chart";
import PerformanceMetricsTable from "./performance-metrics-table";

export default function ContentPerformanceOverview() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <ContentROICards />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ROITrendsChart />
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm border border-gray-700/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-white">
              Portfolio Insights
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                • Top performing content: Digital Marketing Course (285% ROI)
              </li>
              <li>• Average content grade: B+ (78% score)</li>
              <li>• Recommended action: Scale successful patterns</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <PerformanceMetricsTable />
    </div>
  );
}
