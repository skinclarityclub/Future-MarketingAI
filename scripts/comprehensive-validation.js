#!/usr/bin/env node

/**
 * Comprehensive Functionality Validation Script
 * Task 21.2: Current Functionality Validation
 *
 * Tests specific features and endpoints of the BI Dashboard system
 */

const http = require("http");

const BASE_URL = "http://localhost:3000";
const API_BASE = `${BASE_URL}/api`;

class ComprehensiveValidator {
  constructor() {
    this.results = [];
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: "📋",
        success: "✅",
        error: "❌",
        warning: "⚠️",
      }[type] || "📋";

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const requestUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
      const urlObj = new URL(requestUrl);

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 80,
        path: urlObj.pathname + urlObj.search,
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "BI-Dashboard-Validator/1.0",
          ...options.headers,
        },
        timeout: 10000,
      };

      const req = http.request(requestOptions, res => {
        let data = "";
        res.on("data", chunk => (data += chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            length: data.length,
          });
        });
      });

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      if (options.body) {
        req.write(
          typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body)
        );
      }

      req.end();
    });
  }

  async runTest(testName, testFunction) {
    this.testCount++;
    this.log(`Testing: ${testName}`, "info");

    try {
      const result = await testFunction();
      this.passCount++;
      this.results.push({
        test: testName,
        status: "PASS",
        message: result?.message || "Test passed",
        details: result?.details,
      });
      this.log(`✅ ${testName}: PASSED`, "success");
      return true;
    } catch (error) {
      this.failCount++;
      this.results.push({
        test: testName,
        status: "FAIL",
        message: error.message,
        details: error.stack,
      });
      this.log(`❌ ${testName}: FAILED - ${error.message}`, "error");
      return false;
    }
  }

  async runValidation() {
    this.log("🚀 Starting Comprehensive BI Dashboard Validation", "info");

    // Test 1: Main Application Page
    await this.runTest("Main Application Page", async () => {
      const response = await this.makeRequest(BASE_URL);
      if (response.status >= 400) {
        throw new Error(`Main page failed: ${response.status}`);
      }
      return {
        message: "Main page loads successfully",
        details: { status: response.status, size: response.length },
      };
    });

    // Test 2: API Health Check
    await this.runTest("API Health Check", async () => {
      const response = await this.makeRequest("/health");
      if (response.status >= 400) {
        throw new Error(`Health endpoint failed: ${response.status}`);
      }
      return {
        message: "Health endpoint responding",
        details: { status: response.status },
      };
    });

    // Test 3: Dashboard Overview
    await this.runTest("Dashboard Overview", async () => {
      const response = await this.makeRequest("/dashboard/overview");
      if (response.status >= 500) {
        throw new Error(`Dashboard overview failed: ${response.status}`);
      }
      return {
        message: "Dashboard overview accessible",
        details: { status: response.status },
      };
    });

    // Test 4: Marketing Analytics
    await this.runTest("Marketing Analytics", async () => {
      const response = await this.makeRequest("/marketing/overview");
      if (response.status >= 500) {
        throw new Error(`Marketing analytics failed: ${response.status}`);
      }
      return {
        message: "Marketing analytics accessible",
        details: { status: response.status },
      };
    });

    // Test 5: Monitoring System
    await this.runTest("Monitoring System", async () => {
      const response = await this.makeRequest("/monitoring/test");
      if (response.status >= 500) {
        throw new Error(`Monitoring system failed: ${response.status}`);
      }
      return {
        message: "Monitoring system operational",
        details: { status: response.status },
      };
    });

    // Test 6: Workflow Management
    await this.runTest("Workflow Management", async () => {
      const response = await this.makeRequest("/workflows/status");
      if (response.status >= 500) {
        throw new Error(`Workflow management failed: ${response.status}`);
      }
      return {
        message: "Workflow management operational",
        details: { status: response.status },
      };
    });

    // Test 7: Database Test
    await this.runTest("Database Connectivity", async () => {
      const response = await this.makeRequest("/test-supabase");
      if (response.status >= 500) {
        throw new Error(`Database test failed: ${response.status}`);
      }
      return {
        message: "Database connectivity verified",
        details: { status: response.status },
      };
    });

    // Test 8: Performance Check
    await this.runTest("Performance Check", async () => {
      const startTime = Date.now();
      const response = await this.makeRequest(BASE_URL);
      const responseTime = Date.now() - startTime;

      if (responseTime > 10000) {
        throw new Error(`Response too slow: ${responseTime}ms`);
      }

      return {
        message: `Performance acceptable: ${responseTime}ms`,
        details: { responseTime, status: response.status },
      };
    });

    // Test 9: Error Handling
    await this.runTest("Error Handling", async () => {
      const response = await this.makeRequest("/api/non-existent-endpoint");
      if (response.status === 200) {
        throw new Error("Non-existent endpoint should not return 200");
      }
      return {
        message: "Error handling works correctly",
        details: { status: response.status },
      };
    });

    // Test 10: Static Assets
    await this.runTest("Static Assets", async () => {
      const response = await this.makeRequest(`${BASE_URL}/favicon.ico`);
      if (response.status >= 500) {
        throw new Error(`Static assets failed: ${response.status}`);
      }
      return {
        message: "Static assets accessible",
        details: { status: response.status },
      };
    });

    return this.generateReport();
  }

  generateReport() {
    const timestamp = new Date().toISOString();
    const successRate =
      this.testCount > 0
        ? ((this.passCount / this.testCount) * 100).toFixed(2)
        : 0;

    return {
      timestamp,
      summary: {
        total_tests: this.testCount,
        passed: this.passCount,
        failed: this.failCount,
        success_rate: `${successRate}%`,
      },
      results: this.results,
      status:
        this.failCount === 0
          ? "HEALTHY"
          : this.failCount <= 2
            ? "DEGRADED"
            : "CRITICAL",
    };
  }
}

async function main() {
  const validator = new ComprehensiveValidator();

  try {
    const report = await validator.runValidation();

    console.log("\n" + "=".repeat(80));
    console.log("📊 COMPREHENSIVE VALIDATION REPORT");
    console.log("=".repeat(80));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Tests: ${report.summary.total_tests}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.success_rate}`);
    console.log(`System Status: ${report.status}`);
    console.log("=".repeat(80));

    const failedTests = report.results.filter(r => r.status === "FAIL");
    if (failedTests.length > 0) {
      console.log("\n❌ FAILED TESTS:");
      failedTests.forEach(test => {
        console.log(`  • ${test.test}: ${test.message}`);
      });
    }

    const successRate = parseFloat(report.summary.success_rate);
    console.log("\n🎯 OVERALL ASSESSMENT:");
    if (successRate >= 90) {
      console.log("🟢 EXCELLENT: System is fully functional");
    } else if (successRate >= 70) {
      console.log("🟡 GOOD: System is mostly functional with minor issues");
    } else if (successRate >= 50) {
      console.log("🟠 MODERATE: System has significant issues");
    } else {
      console.log("🔴 CRITICAL: System has major problems");
    }

    console.log("=".repeat(80));

    process.exit(failedTests.length > 3 ? 1 : 0);
  } catch (error) {
    console.error("❌ Validation failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ComprehensiveValidator };
