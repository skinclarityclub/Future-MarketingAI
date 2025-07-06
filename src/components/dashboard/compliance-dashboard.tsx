"use client";

import React from "react";

interface ComplianceDashboardProps {
  className?: string;
}

export default function ComplianceDashboard({
  className = "",
}: ComplianceDashboardProps) {
  return (
    <div className={`p-6 ${className}`}>
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">
          Compliance Dashboard
        </h2>
        <p className="text-gray-300">
          This compliance dashboard is currently under development.
        </p>
      </div>
    </div>
  );
}
