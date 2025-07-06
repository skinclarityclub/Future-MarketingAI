/**
 * Performance Test Script voor SKC BI Dashboard API Optimalisaties
 *
 * Dit script test de performance van de geoptimaliseerde APIs
 * en vergelijkt de resultaten met de oude tijden.
 */

const BASE_URL = "http://localhost:3000";

// Oude performance metrieken (voor optimalisatie)
const OLD_METRICS = {
  credentialsAPI: 9300, // 9.3 seconden
  trackingAPI: 2600, // 2.6 seconden
  healthAPI: 1000, // 1 seconde
};

// Test functie voor API performance
async function testAPIPerformance(endpoint, description) {
  console.log(`🧪 Testing: ${description}`);
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        duration,
        endpoint,
        description,
        data:
          typeof data === "object"
            ? {
                hasData: !!data,
                dataSize: JSON.stringify(data).length,
              }
            : data,
      };
    } else {
      return {
        success: false,
        duration,
        endpoint,
        description,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: false,
      duration,
      endpoint,
      description,
      error: error.message,
    };
  }
}

// Test tracking events API
async function testTrackingAPI() {
  const testEvents = [
    {
      event_type: "page_view",
      page_url: "/performance-test",
      timestamp: new Date().toISOString(),
      session_id: "test_session_performance",
    },
  ];

  console.log(`🧪 Testing: Tracking Events API`);
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}/api/tracking/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ events: testEvents }),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        duration,
        endpoint: "/api/tracking/events",
        description: "Tracking Events API",
        data,
      };
    } else {
      return {
        success: false,
        duration,
        endpoint: "/api/tracking/events",
        description: "Tracking Events API",
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: false,
      duration,
      endpoint: "/api/tracking/events",
      description: "Tracking Events API",
      error: error.message,
    };
  }
}

// Performance grade functie
function getPerformanceGrade(duration, oldDuration) {
  const improvement = ((oldDuration - duration) / oldDuration) * 100;

  if (duration < 100) return { grade: "A+", color: "🟢", status: "Excellent" };
  if (duration < 500) return { grade: "A", color: "🟢", status: "Good" };
  if (duration < 1000) return { grade: "B", color: "🟡", status: "Acceptable" };
  if (duration < 3000) return { grade: "C", color: "🟠", status: "Slow" };
  return { grade: "F", color: "🔴", status: "Critical" };
}

// Main test functie
async function runPerformanceTests() {
  console.log("🚀 SKC BI Dashboard Performance Test Starting...");
  console.log("================================================");

  const results = [];

  // Test 1: Command Center Credentials API
  const credentialsTest = await testAPIPerformance(
    "/api/command-center/credentials?action=providers",
    "Command Center Credentials API"
  );
  results.push(credentialsTest);

  // Test 2: Health Check API
  const healthTest = await testAPIPerformance(
    "/api/command-center/credentials?action=health",
    "Health Check API"
  );
  results.push(healthTest);

  // Test 3: Tracking Events API
  const trackingTest = await testTrackingAPI();
  results.push(trackingTest);

  // Test 4: Performance Test API (self-test)
  const performanceAPITest = await testAPIPerformance(
    "/api/performance-test",
    "Performance Test API"
  );
  results.push(performanceAPITest);

  // Analyseer resultaten
  console.log("\n📊 PERFORMANCE RESULTS");
  console.log("================================================");

  results.forEach(result => {
    const oldDuration = result.endpoint.includes("credentials")
      ? OLD_METRICS.credentialsAPI
      : result.endpoint.includes("tracking")
        ? OLD_METRICS.trackingAPI
        : OLD_METRICS.healthAPI;

    const grade = getPerformanceGrade(result.duration, oldDuration);
    const improvement = ((oldDuration - result.duration) / oldDuration) * 100;

    console.log(`\n${grade.color} ${result.description}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Grade: ${grade.grade} (${grade.status})`);
    console.log(`   Old Duration: ${oldDuration}ms`);
    console.log(`   Improvement: ${improvement.toFixed(1)}% faster`);
    console.log(`   Status: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`);

    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });

  // Overzicht
  const successfulTests = results.filter(r => r.success);
  const averageDuration =
    successfulTests.reduce((sum, r) => sum + r.duration, 0) /
    successfulTests.length;

  console.log("\n🎯 SUMMARY");
  console.log("================================================");
  console.log(`Total Tests: ${results.length}`);
  console.log(`Successful: ${successfulTests.length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  console.log(`Average Response Time: ${averageDuration.toFixed(0)}ms`);

  const fastTests = successfulTests.filter(r => r.duration < 500).length;
  const percentage = (fastTests / successfulTests.length) * 100;
  console.log(
    `Fast APIs (< 500ms): ${fastTests}/${successfulTests.length} (${percentage.toFixed(0)}%)`
  );

  if (percentage >= 80) {
    console.log("\n🎉 PERFORMANCE OPTIMIZATION SUCCESSFUL! 🚀");
  } else if (percentage >= 60) {
    console.log("\n✅ Good performance improvements detected");
  } else {
    console.log("\n⚠️ More optimization needed");
  }

  return results;
}

// Browser/Node.js compatibility
if (typeof window !== "undefined") {
  // Browser environment
  window.runPerformanceTests = runPerformanceTests;
  console.log("Performance test loaded. Run: runPerformanceTests()");
} else {
  // Node.js environment
  runPerformanceTests().catch(console.error);
}

module.exports = { runPerformanceTests, testAPIPerformance };
