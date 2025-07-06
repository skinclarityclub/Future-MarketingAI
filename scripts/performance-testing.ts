#!/usr/bin/env tsx

import { performance } from "perf_hooks";
import os from "os";
import fs from "fs";
import path from "path";

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
  errorRate: number;
  timestamp: string;
}

interface LoadTestResult {
  testName: string;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  cpuUsageAverage: number;
  memoryUsageAverage: number;
  bottlenecks: string[];
  recommendations: string[];
}

interface LoadTestConfig {
  concurrent: number;
  duration: number; // in seconds
  rampUp: number; // ramp up time in seconds
  endpoints: string[];
  baseUrl: string;
}

class PerformanceTester {
  private metrics: PerformanceMetrics[] = [];
  private results: LoadTestResult[] = [];
  private baseUrl: string;

  constructor(baseUrl = "http://localhost:3001") {
    this.baseUrl = baseUrl;
  }

  // Get system resource usage
  private getSystemMetrics(): { cpu: number; memory: number } {
    const cpus = os.cpus();
    const totalCpu = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce(
        (sum, time) => sum + time,
        0
      );
      const idle = cpu.times.idle;
      return acc + (1 - idle / total) * 100;
    }, 0);

    const cpuUsage = totalCpu / cpus.length;
    const memoryUsage = (1 - os.freemem() / os.totalmem()) * 100;

    return { cpu: cpuUsage, memory: memoryUsage };
  }

  // Make HTTP request with performance tracking
  private async makeRequest(url: string): Promise<{
    responseTime: number;
    success: boolean;
    statusCode?: number;
    error?: string;
  }> {
    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "BI-Dashboard-Performance-Tester/1.0",
        },
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      return {
        responseTime,
        success: response.ok,
        statusCode: response.status,
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      return {
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Simulate single user journey
  private async simulateUserJourney(): Promise<{
    totalTime: number;
    requestCount: number;
    successCount: number;
    failCount: number;
    averageResponseTime: number;
  }> {
    const startTime = performance.now();

    // Define typical user journey through the BI Dashboard
    const userJourney = [
      "/api/health", // Health check
      "/api/test-supabase", // Database connection test
      "/api/dashboard", // Main dashboard data
      "/api/financial", // Financial metrics
      "/api/marketing", // Marketing data
      "/api/customer-intelligence", // Customer insights
      "/api/content-roi", // Content ROI analysis
      "/api/budget", // Budget information
      "/api/monitoring/health-check", // System monitoring
    ];

    let requestCount = 0;
    let successCount = 0;
    let failCount = 0;
    let totalResponseTime = 0;

    for (const endpoint of userJourney) {
      const url = `${this.baseUrl}${endpoint}`;
      const result = await this.makeRequest(url);

      requestCount++;
      totalResponseTime += result.responseTime;

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      // Small delay between requests to simulate real user behavior
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const endTime = performance.now();

    return {
      totalTime: endTime - startTime,
      requestCount,
      successCount,
      failCount,
      averageResponseTime: totalResponseTime / requestCount,
    };
  }

  // Load test with concurrent users
  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    console.log(
      `🚀 Starting load test: ${config.concurrent} concurrent users for ${config.duration}s`
    );

    const startTime = performance.now();
    const endTime = startTime + config.duration * 1000;

    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalResponseTime = 0;
    let minResponseTime = Infinity;
    let maxResponseTime = 0;

    const cpuUsages: number[] = [];
    const memoryUsages: number[] = [];
    const errors: string[] = [];

    // Start monitoring system resources
    const resourceMonitor = setInterval(() => {
      const metrics = this.getSystemMetrics();
      cpuUsages.push(metrics.cpu);
      memoryUsages.push(metrics.memory);
    }, 1000);

    // Ramp up users gradually
    const usersPerRampStep = Math.ceil(
      config.concurrent / (config.rampUp || 1)
    );
    const rampStepDuration =
      ((config.rampUp || 1) * 1000) /
      Math.ceil(config.concurrent / usersPerRampStep);

    const activeUsers: Promise<void>[] = [];

    for (let i = 0; i < config.concurrent; i++) {
      // Add delay for ramp-up
      const rampDelay = Math.floor(i / usersPerRampStep) * rampStepDuration;

      const userPromise = new Promise<void>(async resolve => {
        await new Promise(r => setTimeout(r, rampDelay));

        while (performance.now() < endTime) {
          const journey = await this.simulateUserJourney();

          totalRequests += journey.requestCount;
          successfulRequests += journey.successCount;
          failedRequests += journey.failCount;
          totalResponseTime +=
            journey.averageResponseTime * journey.requestCount;

          minResponseTime = Math.min(
            minResponseTime,
            journey.averageResponseTime
          );
          maxResponseTime = Math.max(
            maxResponseTime,
            journey.averageResponseTime
          );

          // Random delay between user journeys (1-5 seconds)
          const delay = Math.random() * 4000 + 1000;
          await new Promise(r => setTimeout(r, delay));
        }

        resolve();
      });

      activeUsers.push(userPromise);
    }

    // Wait for all users to complete
    await Promise.all(activeUsers);

    clearInterval(resourceMonitor);

    const testDuration = (performance.now() - startTime) / 1000;
    const averageResponseTime = totalResponseTime / totalRequests;
    const requestsPerSecond = totalRequests / testDuration;
    const errorRate = (failedRequests / totalRequests) * 100;

    const cpuUsageAverage =
      cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length;
    const memoryUsageAverage =
      memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;

    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks({
      averageResponseTime,
      errorRate,
      cpuUsageAverage,
      memoryUsageAverage,
      requestsPerSecond,
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      averageResponseTime,
      errorRate,
      cpuUsageAverage,
      memoryUsageAverage,
      requestsPerSecond,
      bottlenecks,
    });

    const result: LoadTestResult = {
      testName: `Load Test - ${config.concurrent} Users`,
      duration: testDuration,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      minResponseTime: minResponseTime === Infinity ? 0 : minResponseTime,
      maxResponseTime,
      requestsPerSecond,
      errorRate,
      cpuUsageAverage,
      memoryUsageAverage,
      bottlenecks,
      recommendations,
    };

    this.results.push(result);
    return result;
  }

  // Identify performance bottlenecks
  private identifyBottlenecks(metrics: {
    averageResponseTime: number;
    errorRate: number;
    cpuUsageAverage: number;
    memoryUsageAverage: number;
    requestsPerSecond: number;
  }): string[] {
    const bottlenecks: string[] = [];

    if (metrics.averageResponseTime > 2000) {
      bottlenecks.push("High response times detected (>2s average)");
    }

    if (metrics.errorRate > 5) {
      bottlenecks.push(
        `High error rate detected (${metrics.errorRate.toFixed(2)}%)`
      );
    }

    if (metrics.cpuUsageAverage > 80) {
      bottlenecks.push(
        `High CPU usage detected (${metrics.cpuUsageAverage.toFixed(1)}%)`
      );
    }

    if (metrics.memoryUsageAverage > 85) {
      bottlenecks.push(
        `High memory usage detected (${metrics.memoryUsageAverage.toFixed(1)}%)`
      );
    }

    if (metrics.requestsPerSecond < 10) {
      bottlenecks.push(
        `Low throughput detected (${metrics.requestsPerSecond.toFixed(1)} req/s)`
      );
    }

    return bottlenecks;
  }

  // Generate optimization recommendations
  private generateRecommendations(metrics: {
    averageResponseTime: number;
    errorRate: number;
    cpuUsageAverage: number;
    memoryUsageAverage: number;
    requestsPerSecond: number;
    bottlenecks: string[];
  }): string[] {
    const recommendations: string[] = [];

    if (metrics.averageResponseTime > 1000) {
      recommendations.push(
        "Implement caching strategies for frequently accessed data"
      );
      recommendations.push("Optimize database queries and add indexes");
      recommendations.push("Consider implementing CDN for static assets");
    }

    if (metrics.errorRate > 2) {
      recommendations.push(
        "Implement circuit breaker pattern for external API calls"
      );
      recommendations.push("Add retry logic with exponential backoff");
      recommendations.push("Improve error handling and fallback mechanisms");
    }

    if (metrics.cpuUsageAverage > 70) {
      recommendations.push("Optimize CPU-intensive operations");
      recommendations.push("Consider horizontal scaling with load balancers");
      recommendations.push(
        "Implement background job processing for heavy tasks"
      );
    }

    if (metrics.memoryUsageAverage > 75) {
      recommendations.push(
        "Optimize memory usage and implement garbage collection"
      );
      recommendations.push("Review and optimize data structures");
      recommendations.push("Implement streaming for large data sets");
    }

    if (metrics.requestsPerSecond < 20) {
      recommendations.push(
        "Implement connection pooling for database connections"
      );
      recommendations.push("Optimize API response payloads");
      recommendations.push(
        "Consider implementing GraphQL for efficient data fetching"
      );
    }

    // General recommendations
    recommendations.push("Implement performance monitoring and alerting");
    recommendations.push(
      "Set up APM (Application Performance Monitoring) tools"
    );
    recommendations.push("Regular performance testing in CI/CD pipeline");

    return recommendations;
  }

  // Run stress test
  async runStressTest(): Promise<LoadTestResult> {
    console.log("🔥 Running stress test...");

    const stressConfig: LoadTestConfig = {
      concurrent: 50,
      duration: 60,
      rampUp: 10,
      endpoints: [],
      baseUrl: this.baseUrl,
    };

    return await this.runLoadTest(stressConfig);
  }

  // Run spike test
  async runSpikeTest(): Promise<LoadTestResult> {
    console.log("⚡ Running spike test...");

    const spikeConfig: LoadTestConfig = {
      concurrent: 100,
      duration: 30,
      rampUp: 5,
      endpoints: [],
      baseUrl: this.baseUrl,
    };

    return await this.runLoadTest(spikeConfig);
  }

  // Run endurance test
  async runEnduranceTest(): Promise<LoadTestResult> {
    console.log("🏃‍♂️ Running endurance test...");

    const enduranceConfig: LoadTestConfig = {
      concurrent: 10,
      duration: 300, // 5 minutes
      rampUp: 5,
      endpoints: [],
      baseUrl: this.baseUrl,
    };

    return await this.runLoadTest(enduranceConfig);
  }

  // Performance profiling for specific endpoint
  async profileEndpoint(
    endpoint: string,
    iterations = 100
  ): Promise<{
    endpoint: string;
    iterations: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    successRate: number;
    recommendations: string[];
  }> {
    console.log(`📊 Profiling endpoint: ${endpoint}`);

    const responseTimes: number[] = [];
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      const result = await this.makeRequest(`${this.baseUrl}${endpoint}`);
      responseTimes.push(result.responseTime);

      if (result.success) {
        successCount++;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const averageResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    const successRate = (successCount / iterations) * 100;

    const recommendations: string[] = [];

    if (averageResponseTime > 1000) {
      recommendations.push(
        `Endpoint ${endpoint} has slow response time (${averageResponseTime.toFixed(0)}ms avg)`
      );
      recommendations.push("Consider caching or database optimization");
    }

    if (successRate < 95) {
      recommendations.push(
        `Endpoint ${endpoint} has low success rate (${successRate.toFixed(1)}%)`
      );
      recommendations.push("Investigate error causes and improve reliability");
    }

    return {
      endpoint,
      iterations,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      successRate,
      recommendations,
    };
  }

  // Generate comprehensive performance report
  generateReport(): string {
    let report = "\n" + "=".repeat(80) + "\n";
    report += "📊 BI DASHBOARD PERFORMANCE TESTING REPORT\n";
    report += "=".repeat(80) + "\n";
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `System: ${os.type()} ${os.release()} (${os.arch()})\n`;
    report += `CPU Cores: ${os.cpus().length}\n`;
    report += `Total Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB\n\n`;

    this.results.forEach((result, index) => {
      report += `${index + 1}. ${result.testName}\n`;
      report += "-".repeat(50) + "\n";
      report += `Duration: ${result.duration.toFixed(1)}s\n`;
      report += `Total Requests: ${result.totalRequests}\n`;
      report += `Successful: ${result.successfulRequests} (${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%)\n`;
      report += `Failed: ${result.failedRequests} (${result.errorRate.toFixed(1)}%)\n`;
      report += `Average Response Time: ${result.averageResponseTime.toFixed(0)}ms\n`;
      report += `Min Response Time: ${result.minResponseTime.toFixed(0)}ms\n`;
      report += `Max Response Time: ${result.maxResponseTime.toFixed(0)}ms\n`;
      report += `Throughput: ${result.requestsPerSecond.toFixed(1)} req/s\n`;
      report += `Average CPU Usage: ${result.cpuUsageAverage.toFixed(1)}%\n`;
      report += `Average Memory Usage: ${result.memoryUsageAverage.toFixed(1)}%\n\n`;

      if (result.bottlenecks.length > 0) {
        report += "🚨 BOTTLENECKS IDENTIFIED:\n";
        result.bottlenecks.forEach(bottleneck => {
          report += `• ${bottleneck}\n`;
        });
        report += "\n";
      }

      if (result.recommendations.length > 0) {
        report += "💡 RECOMMENDATIONS:\n";
        result.recommendations.forEach(rec => {
          report += `• ${rec}\n`;
        });
        report += "\n";
      }
    });

    return report;
  }

  // Save report to file
  saveReport(filename?: string): string {
    const report = this.generateReport();
    const reportPath =
      filename ||
      `performance-report-${new Date().toISOString().split("T")[0]}.txt`;

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Performance report saved to: ${reportPath}`);

    return reportPath;
  }

  // Run comprehensive performance test suite
  async runFullTestSuite(): Promise<void> {
    console.log("🎯 Starting comprehensive performance test suite...\n");

    try {
      // 1. Basic load test
      console.log("1️⃣ Running basic load test...");
      await this.runLoadTest({
        concurrent: 10,
        duration: 30,
        rampUp: 5,
        endpoints: [],
        baseUrl: this.baseUrl,
      });

      // 2. Stress test
      console.log("\n2️⃣ Running stress test...");
      await this.runStressTest();

      // 3. Spike test
      console.log("\n3️⃣ Running spike test...");
      await this.runSpikeTest();

      // 4. Profile critical endpoints
      console.log("\n4️⃣ Profiling critical endpoints...");
      const criticalEndpoints = [
        "/api/dashboard",
        "/api/financial",
        "/api/marketing",
        "/api/customer-intelligence",
      ];

      for (const endpoint of criticalEndpoints) {
        await this.profileEndpoint(endpoint, 50);
      }

      // Generate and save report
      console.log("\n📊 Generating performance report...");
      const reportPath = this.saveReport();

      console.log("\n✅ Performance testing completed!");
      console.log(`📄 Report saved to: ${reportPath}`);
    } catch (error) {
      console.error("❌ Performance testing failed:", error);
      throw error;
    }
  }
}

// Export for use in other modules
export { PerformanceTester };
export type { LoadTestConfig, LoadTestResult, PerformanceMetrics };

// Main execution
async function main() {
  const tester = new PerformanceTester();
  await tester.runFullTestSuite();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
