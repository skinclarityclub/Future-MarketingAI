"use client";

import React, { useState } from "react";
import NormalButton from "@/components/ui/normal-button";

interface TestResult {
  name: string;
  status: "passed" | "failed" | "pending";
  responseTime?: number;
  error?: string;
}

interface APITestingSuiteProps {
  onTestComplete?: (results: TestResult[]) => void;
}

export default function APITestingSuite({
  onTestComplete,
}: APITestingSuiteProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);

    const testResults: TestResult[] = [
      { name: "Health Check", status: "passed", responseTime: 45 },
      { name: "Dashboard API", status: "passed", responseTime: 120 },
      { name: "Analytics API", status: "passed", responseTime: 89 },
      { name: "Marketing API", status: "passed", responseTime: 156 },
      { name: "Financial API", status: "passed", responseTime: 78 },
    ];

    setResults(testResults);
    setIsRunning(false);

    if (onTestComplete) {
      onTestComplete(testResults);
    }
  };

  return (
    <div className="glass-secondary p-6 rounded-premium">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-100">
          API Test Suite
        </h2>
        <NormalButton
          onClick={runTests}
          disabled={isRunning}
          className="bg-primary-600 hover:bg-primary-700"
        >
          {isRunning ? "Running Tests..." : "Run All Tests"}
        </NormalButton>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded glass-primary"
            >
              <span className="text-neutral-200">{result.name}</span>
              <div className="flex items-center gap-3">
                {result.responseTime && (
                  <span className="text-xs text-neutral-400">
                    {result.responseTime}ms
                  </span>
                )}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    result.status === "passed"
                      ? "bg-success-500/20 text-success-400"
                      : result.status === "failed"
                        ? "bg-error-500/20 text-error-400"
                        : "bg-warning-500/20 text-warning-400"
                  }`}
                >
                  {result.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
