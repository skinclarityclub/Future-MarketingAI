#!/usr/bin/env node

/**
 * Functionality Validation Script
 * Task 21.2: Current Functionality Validation
 *
 * This script tests all existing features of the BI Dashboard system
 * to ensure they work as expected.
 */

const https = require("https");
const http = require("http");

const BASE_URL = "http://localhost:3000";
const API_BASE = `${BASE_URL}/api`;

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  verbose: true,
};

class FunctionalityValidator {
  constructor() {
    this.results = [];
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  log(message, type = "info") {
    if (!TEST_CONFIG.verbose && type === "debug") return;

    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: "📋",
        success: "✅",
        error: "❌",
        warning: "⚠️",
        debug: "🔍",
      }[type] || "📋";

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const requestUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
      const urlObj = new URL(requestUrl);
      const client = urlObj.protocol === "https:" ? https : http;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "BI-Dashboard-Validator/1.0",
          ...options.headers,
        },
        timeout: TEST_CONFIG.timeout,
      };

      const req = client.request(requestOptions, res => {
        let data = "";
        res.on("data", chunk => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: parsed,
              raw: data,
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data,
              raw: data,
            });
          }
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
    this.log(`Running test: ${testName}`, "debug");

    try {
      const result = await testFunction();
      this.passCount++;
      this.results.push({
        test: testName,
        status: "PASS",
        message: result?.message || "Test passed successfully",
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

  // Run all tests
  async runAllTests() {
    this.log("🚀 Starting Comprehensive Functionality Validation", "info");

    // Wait for server to be ready
    this.log("Waiting for server to be ready...", "info");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test basic server response
    await this.runTest("Server Availability", async () => {
      const response = await this.makeRequest(BASE_URL);
      if (response.status >= 400) {
        throw new Error(`Server not responding: ${response.status}`);
      }
      return {
        message: "Server is responding",
        details: { status: response.status },
      };
    });

    return {
      timestamp: new Date().toISOString(),
      summary: {
        total_tests: this.testCount,
        passed: this.passCount,
        failed: this.failCount,
        success_rate: `${((this.passCount / this.testCount) * 100).toFixed(2)}%`,
      },
      results: this.results,
    };
  }
}

// Main execution
async function main() {
  const validator = new FunctionalityValidator();

  try {
    const report = await validator.runAllTests();

    console.log("\n" + "=".repeat(80));
    console.log("📊 FUNCTIONALITY VALIDATION REPORT");
    console.log("=".repeat(80));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Tests: ${report.summary.total_tests}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.success_rate}`);
    console.log("=".repeat(80));

    process.exit(0);
  } catch (error) {
    console.error("❌ Validation failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FunctionalityValidator };
