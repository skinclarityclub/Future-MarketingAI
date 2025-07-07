"use client";

import React from "react";
import DeploymentReadinessAssessment from "@/components/testing/deployment-readiness-assessment";

export default function DeploymentReadinessAssessmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-100 mb-2">
            Task 21.8 - Deployment Readiness Assessment
          </h1>
          <p className="text-neutral-400 text-lg">
            Final documentation and deployment readiness evaluation for the BI
            Dashboard system
          </p>
        </div>

        <DeploymentReadinessAssessment
          onAssessmentComplete={results => {
            console.log("Deployment assessment completed:", results);
          }}
        />
      </div>
    </div>
  );
}
