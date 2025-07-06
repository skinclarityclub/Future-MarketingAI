/**
 * Test Script for Audit Logging System
 * Task 37.3: Develop Centralized Audit Logging System
 *
 * Comprehensive test for audit logging functionality
 */

const BASE_URL = "http://localhost:3005";

// Test data samples
const testEvents = [
  {
    eventCategory: "authentication",
    eventType: "login_success",
    eventName: "User Login Test",
    message: "Test user login successful",
    severity: "info",
    userId: "test-user-123",
    sessionId: "test-session-456",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 Test Browser",
  },
  {
    eventCategory: "security_event",
    eventType: "failed_login",
    eventName: "Failed Login Attempt",
    message: "Multiple failed login attempts detected",
    severity: "security",
    status: "failure",
    ipAddress: "192.168.1.200",
    riskScore: 8,
    requiresReview: true,
    details: {
      attempts: 5,
      last_attempt: new Date().toISOString(),
    },
  },
  {
    eventCategory: "data_access",
    eventType: "data_read",
    eventName: "Customer Data Access",
    message: "User accessed customer financial records",
    severity: "info",
    userId: "admin-user-789",
    resourceType: "customer",
    resourceId: "cust-12345",
    resourceName: "John Doe Customer Record",
    complianceTags: ["GDPR_DATA_PROCESSING", "SOC2_CONFIDENTIALITY"],
  },
  {
    eventCategory: "data_modification",
    eventType: "data_update",
    eventName: "User Profile Update",
    message: "User profile information updated",
    severity: "info",
    userId: "user-abc123",
    resourceType: "user_profile",
    resourceId: "profile-456",
    oldValues: {
      email: "old.email@example.com",
      name: "Old Name",
    },
    newValues: {
      email: "new.email@example.com",
      name: "New Name",
    },
    changedFields: ["email", "name"],
  },
  {
    eventCategory: "api_access",
    eventType: "api_call",
    eventName: "Financial API Access",
    message: "GET /api/financial/reports",
    severity: "info",
    userId: "api-user-999",
    requestMethod: "GET",
    requestPath: "/api/financial/reports",
    responseStatus: 200,
    responseTimeMs: 145,
    ipAddress: "10.0.0.50",
  },
];

let testResults = [];

/**
 * Helper function to make API requests
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    return {
      status: response.status,
      data,
      ok: response.ok,
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      ok: false,
    };
  }
}

/**
 * Test 1: Create Audit Log Entries
 */
async function testCreateAuditLogs() {
  console.log("\n🧪 Test 1: Creating Audit Log Entries...");

  for (let i = 0; i < testEvents.length; i++) {
    const event = testEvents[i];
    console.log(`  📝 Creating ${event.eventType} event...`);

    const result = await makeRequest("/api/audit/logs", {
      method: "POST",
      body: JSON.stringify(event),
    });

    if (result.ok) {
      console.log(`  ✅ Created audit log: ${result.data.eventId}`);
      testResults.push({
        test: `Create audit log ${i + 1}`,
        status: "PASS",
        details: `Event ID: ${result.data.eventId}`,
      });
    } else {
      console.log(`  ❌ Failed to create audit log: ${result.data.error}`);
      testResults.push({
        test: `Create audit log ${i + 1}`,
        status: "FAIL",
        details: result.data.error,
      });
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Test 2: Retrieve Audit Logs
 */
async function testRetrieveAuditLogs() {
  console.log("\n🧪 Test 2: Retrieving Audit Logs...");

  // Test basic retrieval
  console.log("  📖 Fetching recent audit logs...");
  const result = await makeRequest("/api/audit/logs?limit=10");

  if (result.ok) {
    console.log(`  ✅ Retrieved ${result.data.data.length} audit logs`);
    console.log(`  📊 Total logs in system: ${result.data.total}`);

    testResults.push({
      test: "Retrieve audit logs",
      status: "PASS",
      details: `Retrieved ${result.data.data.length} logs`,
    });

    // Display sample logs
    if (result.data.data.length > 0) {
      console.log("  📋 Sample logs:");
      result.data.data.slice(0, 3).forEach((log, index) => {
        console.log(
          `    ${index + 1}. ${log.event_name} (${log.severity}) - ${log.event_timestamp}`
        );
      });
    }
  } else {
    console.log(`  ❌ Failed to retrieve audit logs: ${result.data.error}`);
    testResults.push({
      test: "Retrieve audit logs",
      status: "FAIL",
      details: result.data.error,
    });
  }
}

/**
 * Test 3: Test Filtering
 */
async function testFiltering() {
  console.log("\n🧪 Test 3: Testing Audit Log Filtering...");

  // Test severity filter
  console.log("  🔍 Testing severity filter (security events)...");
  const securityResult = await makeRequest(
    "/api/audit/logs?severity=security&limit=5"
  );

  if (securityResult.ok) {
    console.log(
      `  ✅ Found ${securityResult.data.data.length} security events`
    );
    testResults.push({
      test: "Filter by severity",
      status: "PASS",
      details: `Found ${securityResult.data.data.length} security events`,
    });
  } else {
    console.log(
      `  ❌ Failed to filter by severity: ${securityResult.data.error}`
    );
    testResults.push({
      test: "Filter by severity",
      status: "FAIL",
      details: securityResult.data.error,
    });
  }

  // Test category filter
  console.log("  🔍 Testing category filter (authentication events)...");
  const authResult = await makeRequest(
    "/api/audit/logs?category=authentication&limit=5"
  );

  if (authResult.ok) {
    console.log(
      `  ✅ Found ${authResult.data.data.length} authentication events`
    );
    testResults.push({
      test: "Filter by category",
      status: "PASS",
      details: `Found ${authResult.data.data.length} authentication events`,
    });
  } else {
    console.log(`  ❌ Failed to filter by category: ${authResult.data.error}`);
    testResults.push({
      test: "Filter by category",
      status: "FAIL",
      details: authResult.data.error,
    });
  }

  // Test date filter
  console.log("  🔍 Testing date filter (last hour)...");
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const dateResult = await makeRequest(
    `/api/audit/logs?startDate=${oneHourAgo}&limit=20`
  );

  if (dateResult.ok) {
    console.log(
      `  ✅ Found ${dateResult.data.data.length} events in the last hour`
    );
    testResults.push({
      test: "Filter by date",
      status: "PASS",
      details: `Found ${dateResult.data.data.length} events in last hour`,
    });
  } else {
    console.log(`  ❌ Failed to filter by date: ${dateResult.data.error}`);
    testResults.push({
      test: "Filter by date",
      status: "FAIL",
      details: dateResult.data.error,
    });
  }
}

/**
 * Test 4: Pagination
 */
async function testPagination() {
  console.log("\n🧪 Test 4: Testing Pagination...");

  // Test first page
  console.log("  📄 Testing first page...");
  const page1Result = await makeRequest("/api/audit/logs?limit=5&offset=0");

  if (page1Result.ok) {
    console.log(`  ✅ Page 1: Retrieved ${page1Result.data.data.length} logs`);

    // Test second page
    console.log("  📄 Testing second page...");
    const page2Result = await makeRequest("/api/audit/logs?limit=5&offset=5");

    if (page2Result.ok) {
      console.log(
        `  ✅ Page 2: Retrieved ${page2Result.data.data.length} logs`
      );

      // Verify different results
      const page1Ids = page1Result.data.data.map(log => log.id);
      const page2Ids = page2Result.data.data.map(log => log.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));

      if (overlap.length === 0) {
        console.log(
          "  ✅ Pagination working correctly (no overlap between pages)"
        );
        testResults.push({
          test: "Pagination",
          status: "PASS",
          details: "Pages contain different records",
        });
      } else {
        console.log("  ⚠️  Warning: Some overlap between pages detected");
        testResults.push({
          test: "Pagination",
          status: "PARTIAL",
          details: `${overlap.length} overlapping records`,
        });
      }
    } else {
      console.log(`  ❌ Failed to retrieve page 2: ${page2Result.data.error}`);
      testResults.push({
        test: "Pagination",
        status: "FAIL",
        details: page2Result.data.error,
      });
    }
  } else {
    console.log(`  ❌ Failed to retrieve page 1: ${page1Result.data.error}`);
    testResults.push({
      test: "Pagination",
      status: "FAIL",
      details: page1Result.data.error,
    });
  }
}

/**
 * Test 5: Error Handling
 */
async function testErrorHandling() {
  console.log("\n🧪 Test 5: Testing Error Handling...");

  // Test invalid event creation
  console.log("  ❗ Testing invalid event creation...");
  const invalidResult = await makeRequest("/api/audit/logs", {
    method: "POST",
    body: JSON.stringify({
      // Missing required fields
      message: "This should fail",
    }),
  });

  if (invalidResult.status === 400) {
    console.log("  ✅ Invalid request properly rejected with 400 status");
    testResults.push({
      test: "Error handling",
      status: "PASS",
      details: "Invalid requests properly rejected",
    });
  } else {
    console.log(`  ❌ Expected 400 error, got ${invalidResult.status}`);
    testResults.push({
      test: "Error handling",
      status: "FAIL",
      details: `Expected 400, got ${invalidResult.status}`,
    });
  }
}

/**
 * Test 6: Performance Test
 */
async function testPerformance() {
  console.log("\n🧪 Test 6: Performance Testing...");

  console.log("  ⚡ Testing concurrent log creation...");
  const startTime = Date.now();

  // Create 10 concurrent requests
  const promises = Array(10)
    .fill(0)
    .map((_, index) =>
      makeRequest("/api/audit/logs", {
        method: "POST",
        body: JSON.stringify({
          eventCategory: "api_access",
          eventType: "performance_test",
          eventName: `Performance Test Event ${index + 1}`,
          message: `Concurrent test event number ${index + 1}`,
          severity: "info",
        }),
      })
    );

  try {
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const successCount = results.filter(r => r.ok).length;
    console.log(`  ✅ Created ${successCount}/10 events in ${duration}ms`);
    console.log(
      `  📊 Average time per request: ${Math.round(duration / 10)}ms`
    );

    testResults.push({
      test: "Performance test",
      status: successCount === 10 ? "PASS" : "PARTIAL",
      details: `${successCount}/10 successful, ${duration}ms total`,
    });
  } catch (error) {
    console.log(`  ❌ Performance test failed: ${error.message}`);
    testResults.push({
      test: "Performance test",
      status: "FAIL",
      details: error.message,
    });
  }
}

/**
 * Generate Test Report
 */
function generateReport() {
  console.log("\n📊 TEST REPORT");
  console.log("=".repeat(50));

  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.status === "PASS").length;
  const failedTests = testResults.filter(r => r.status === "FAIL").length;
  const partialTests = testResults.filter(r => r.status === "PARTIAL").length;

  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⚠️  Partial: ${partialTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  console.log("\nDetailed Results:");
  testResults.forEach((result, index) => {
    const icon =
      result.status === "PASS" ? "✅" : result.status === "FAIL" ? "❌" : "⚠️";
    console.log(`${index + 1}. ${icon} ${result.test}: ${result.details}`);
  });

  // Overall assessment
  if (failedTests === 0) {
    console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("The Audit Logging System is functioning correctly.");
  } else if (passedTests > failedTests) {
    console.log("\n⚠️  TESTS COMPLETED WITH SOME ISSUES");
    console.log(
      "Most functionality is working, but some issues need attention."
    );
  } else {
    console.log("\n❌ SIGNIFICANT ISSUES DETECTED");
    console.log("The Audit Logging System needs troubleshooting.");
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log("🚀 Starting Audit Logging System Tests");
  console.log("Target URL:", BASE_URL);
  console.log("Timestamp:", new Date().toISOString());

  try {
    await testCreateAuditLogs();
    await testRetrieveAuditLogs();
    await testFiltering();
    await testPagination();
    await testErrorHandling();
    await testPerformance();

    generateReport();
  } catch (error) {
    console.error("❌ Test execution failed:", error);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testEvents,
  makeRequest,
};
