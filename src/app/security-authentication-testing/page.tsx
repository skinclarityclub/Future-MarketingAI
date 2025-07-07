"use client";

import React from "react";
import SecurityAuthenticationTestingSuite from "@/components/testing/security-authentication-testing-suite";

export default function SecurityAuthenticationTestingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-100 mb-2">
            Task 21.7 - Security & Authentication Testing
          </h1>
          <p className="text-neutral-400 text-lg">
            Comprehensive security assessment and vulnerability testing for the
            BI Dashboard system
          </p>
        </div>

        <SecurityAuthenticationTestingSuite
          onTestComplete={results => {
            console.log("Security testing completed:", results);
          }}
        />
      </div>
    </div>
  );
}
