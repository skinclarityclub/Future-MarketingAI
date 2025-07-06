/**
 * Task 33.3: Implement Real-Time Monitoring
 * Comprehensive test script for workflow monitoring system
 */

const BASE_URL = "http://localhost:3000";

// Test data
const testWorkflowId = "test-wf-monitoring-001";
const testExecutionId = `exec-${Date.now()}`;

// Test scenarios
const testScenarios = [
  "Create Log Entries",
  "Create Error Entries",
  "Create Performance Metrics",
  "Create Alerts",
  "Retrieve Execution Logs",
  "Retrieve Workflow Errors",
  "Retrieve Performance Metrics",
  "Retrieve Monitoring Alerts",
  "Get Live Execution Status",
  "Get Dashboard Summary",
  "Update Error Resolution",
  "Update Alert Acknowledgment",
  "Batch Operations",
  "Real-time Monitoring Simulation",
  "Performance Stress Test",
  "Data Cleanup",
];

let testResults = [];
let createdIds = {
  logs: [],
  errors: [],
  performance: [],
  alerts: [],
};

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();

  return {
    status: response.status,
    data,
    ok: response.ok,
  };
}

// Helper function to log test results
function logResult(testName, success, message, data = null) {
  const result = {
    test: testName,
    success,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  testResults.push(result);

  const status = success ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} ${testName}: ${message}`);

  if (data && !success) {
    console.log("   Error details:", JSON.stringify(data, null, 2));
  }
}

// Test 1: Create Log Entries
async function testCreateLogEntries() {
  console.log("\n🧪 Testing: Create Log Entries");

  const logEntries = [
    {
      workflow_id: testWorkflowId,
      execution_id: testExecutionId,
      log_level: "info",
      message: "Workflow execution started",
      node_name: "Start Node",
      duration: 0,
      metadata: { step: 1 },
    },
    {
      workflow_id: testWorkflowId,
      execution_id: testExecutionId,
      log_level: "info",
      message: "Processing data validation",
      node_name: "Validation Node",
      step_number: 2,
      duration: 1500,
      metadata: { records_processed: 100 },
    },
    {
      workflow_id: testWorkflowId,
      execution_id: testExecutionId,
      log_level: "warn",
      message: "Rate limit approaching",
      node_name: "API Node",
      step_number: 3,
      duration: 2300,
      metadata: { rate_limit_remaining: 10 },
    },
  ];

  for (let i = 0; i < logEntries.length; i++) {
    try {
      const response = await makeRequest("/api/workflows/monitoring?type=log", {
        method: "POST",
        body: JSON.stringify(logEntries[i]),
      });

      if (response.ok) {
        createdIds.logs.push(response.data.data.id);
        logResult(
          `Create Log Entry ${i + 1}`,
          true,
          `Log entry created with ID: ${response.data.data.id}`
        );
      } else {
        logResult(
          `Create Log Entry ${i + 1}`,
          false,
          "Failed to create log entry",
          response.data
        );
      }
    } catch (error) {
      logResult(`Create Log Entry ${i + 1}`, false, `Error: ${error.message}`);
    }
  }
}

// Test 2: Create Error Entries
async function testCreateErrorEntries() {
  console.log("\n🧪 Testing: Create Error Entries");

  const errorEntries = [
    {
      workflow_id: testWorkflowId,
      execution_id: testExecutionId,
      error_type: "network",
      error_message: "Connection timeout to external API",
      error_code: "TIMEOUT_001",
      node_name: "API Node",
      severity: "high",
      metadata: { timeout_duration: 30000, retry_count: 3 },
    },
    {
      workflow_id: testWorkflowId,
      execution_id: testExecutionId,
      error_type: "validation",
      error_message: "Invalid email format in input data",
      node_name: "Validation Node",
      severity: "medium",
      metadata: { invalid_emails: ["test@", "invalid.email"] },
    },
  ];

  for (let i = 0; i < errorEntries.length; i++) {
    try {
      const response = await makeRequest(
        "/api/workflows/monitoring?type=error",
        {
          method: "POST",
          body: JSON.stringify(errorEntries[i]),
        }
      );

      if (response.ok) {
        createdIds.errors.push(response.data.data.id);
        logResult(
          `Create Error Entry ${i + 1}`,
          true,
          `Error entry created with ID: ${response.data.data.id}`
        );
      } else {
        logResult(
          `Create Error Entry ${i + 1}`,
          false,
          "Failed to create error entry",
          response.data
        );
      }
    } catch (error) {
      logResult(
        `Create Error Entry ${i + 1}`,
        false,
        `Error: ${error.message}`
      );
    }
  }
}

// Test 3: Create Performance Metrics
async function testCreatePerformanceMetrics() {
  console.log("\n🧪 Testing: Create Performance Metrics");

  const performanceMetrics = {
    workflow_id: testWorkflowId,
    execution_id: testExecutionId,
    total_duration: 45000,
    node_count: 6,
    successful_nodes: 5,
    failed_nodes: 1,
    memory_peak: 134217728, // 128MB
    memory_average: 67108864, // 64MB
    cpu_peak: 85.5,
    cpu_average: 45.2,
    network_requests: 15,
    network_data_transferred: 2048000, // 2MB
    throughput: 2.5,
    bottleneck_nodes: ["API Node", "Database Node"],
    metadata: {
      execution_environment: "production",
      worker_id: "worker-001",
    },
  };

  try {
    const response = await makeRequest(
      "/api/workflows/monitoring?type=performance",
      {
        method: "POST",
        body: JSON.stringify(performanceMetrics),
      }
    );

    if (response.ok) {
      createdIds.performance.push(response.data.data.id);
      logResult(
        "Create Performance Metrics",
        true,
        `Performance metrics created with ID: ${response.data.data.id}`
      );
    } else {
      logResult(
        "Create Performance Metrics",
        false,
        "Failed to create performance metrics",
        response.data
      );
    }
  } catch (error) {
    logResult("Create Performance Metrics", false, `Error: ${error.message}`);
  }
}

// Test 4: Create Alerts
async function testCreateAlerts() {
  console.log("\n🧪 Testing: Create Alerts");

  const alerts = [
    {
      workflow_id: testWorkflowId,
      alert_type: "performance",
      severity: "warning",
      title: "High Execution Time",
      description:
        "Workflow execution time exceeded recommended threshold of 30 seconds",
      metadata: {
        actual_duration: 45000,
        threshold: 30000,
        recommendation: "Consider optimizing API calls",
      },
    },
    {
      workflow_id: testWorkflowId,
      alert_type: "error",
      severity: "critical",
      title: "API Connection Failures",
      description: "Multiple consecutive failures connecting to external API",
      metadata: {
        failure_count: 5,
        last_success: "2024-01-15T10:30:00Z",
        affected_endpoints: ["/api/data", "/api/users"],
      },
    },
  ];

  for (let i = 0; i < alerts.length; i++) {
    try {
      const response = await makeRequest(
        "/api/workflows/monitoring?type=alert",
        {
          method: "POST",
          body: JSON.stringify(alerts[i]),
        }
      );

      if (response.ok) {
        createdIds.alerts.push(response.data.data.id);
        logResult(
          `Create Alert ${i + 1}`,
          true,
          `Alert created with ID: ${response.data.data.id}`
        );
      } else {
        logResult(
          `Create Alert ${i + 1}`,
          false,
          "Failed to create alert",
          response.data
        );
      }
    } catch (error) {
      logResult(`Create Alert ${i + 1}`, false, `Error: ${error.message}`);
    }
  }
}

// Test 5: Retrieve Execution Logs
async function testRetrieveExecutionLogs() {
  console.log("\n🧪 Testing: Retrieve Execution Logs");

  const testCases = [
    {
      name: "Get all logs for workflow",
      params: `workflow_id=${testWorkflowId}`,
    },
    {
      name: "Get logs for specific execution",
      params: `workflow_id=${testWorkflowId}&execution_id=${testExecutionId}`,
    },
    {
      name: "Get only warning and error logs",
      params: `workflow_id=${testWorkflowId}&log_levels=warn,error`,
    },
    {
      name: "Get logs with limit",
      params: `workflow_id=${testWorkflowId}&limit=2`,
    },
  ];

  for (const testCase of testCases) {
    try {
      const response = await makeRequest(
        `/api/workflows/monitoring?type=logs&${testCase.params}`
      );

      if (response.ok) {
        const logCount = response.data.data?.length || 0;
        logResult(testCase.name, true, `Retrieved ${logCount} log entries`);
      } else {
        logResult(
          testCase.name,
          false,
          "Failed to retrieve logs",
          response.data
        );
      }
    } catch (error) {
      logResult(testCase.name, false, `Error: ${error.message}`);
    }
  }
}

// Test 6: Retrieve Workflow Errors
async function testRetrieveWorkflowErrors() {
  console.log("\n🧪 Testing: Retrieve Workflow Errors");

  const testCases = [
    {
      name: "Get all errors for workflow",
      params: `workflow_id=${testWorkflowId}`,
    },
    {
      name: "Get unresolved errors only",
      params: `workflow_id=${testWorkflowId}&resolved=false`,
    },
    {
      name: "Get high severity errors",
      params: `workflow_id=${testWorkflowId}&severity=high,critical`,
    },
  ];

  for (const testCase of testCases) {
    try {
      const response = await makeRequest(
        `/api/workflows/monitoring?type=errors&${testCase.params}`
      );

      if (response.ok) {
        const errorCount = response.data.data?.length || 0;
        logResult(testCase.name, true, `Retrieved ${errorCount} error entries`);
      } else {
        logResult(
          testCase.name,
          false,
          "Failed to retrieve errors",
          response.data
        );
      }
    } catch (error) {
      logResult(testCase.name, false, `Error: ${error.message}`);
    }
  }
}

// Test 7: Retrieve Performance Metrics
async function testRetrievePerformanceMetrics() {
  console.log("\n🧪 Testing: Retrieve Performance Metrics");

  try {
    const response = await makeRequest(
      `/api/workflows/monitoring?type=performance&workflow_id=${testWorkflowId}`
    );

    if (response.ok) {
      const metricsCount = response.data.data?.length || 0;
      logResult(
        "Retrieve Performance Metrics",
        true,
        `Retrieved ${metricsCount} performance metric entries`
      );
    } else {
      logResult(
        "Retrieve Performance Metrics",
        false,
        "Failed to retrieve performance metrics",
        response.data
      );
    }
  } catch (error) {
    logResult("Retrieve Performance Metrics", false, `Error: ${error.message}`);
  }
}

// Test 8: Retrieve Monitoring Alerts
async function testRetrieveMonitoringAlerts() {
  console.log("\n🧪 Testing: Retrieve Monitoring Alerts");

  const testCases = [
    {
      name: "Get all alerts for workflow",
      params: `workflow_id=${testWorkflowId}`,
    },
    {
      name: "Get unacknowledged alerts",
      params: `workflow_id=${testWorkflowId}&acknowledged=false`,
    },
    {
      name: "Get critical alerts",
      params: `workflow_id=${testWorkflowId}&severity=critical`,
    },
  ];

  for (const testCase of testCases) {
    try {
      const response = await makeRequest(
        `/api/workflows/monitoring?type=alerts&${testCase.params}`
      );

      if (response.ok) {
        const alertCount = response.data.data?.length || 0;
        logResult(testCase.name, true, `Retrieved ${alertCount} alert entries`);
      } else {
        logResult(
          testCase.name,
          false,
          "Failed to retrieve alerts",
          response.data
        );
      }
    } catch (error) {
      logResult(testCase.name, false, `Error: ${error.message}`);
    }
  }
}

// Test 9: Get Live Execution Status
async function testGetLiveExecutionStatus() {
  console.log("\n🧪 Testing: Get Live Execution Status");

  try {
    const response = await makeRequest(
      `/api/workflows/monitoring?type=live-status&workflow_id=${testWorkflowId}`
    );

    if (response.ok) {
      const hasStatus = response.data.data !== null;
      logResult(
        "Get Live Execution Status",
        true,
        hasStatus
          ? "Live status retrieved successfully"
          : "No active execution found"
      );
    } else {
      logResult(
        "Get Live Execution Status",
        false,
        "Failed to get live status",
        response.data
      );
    }
  } catch (error) {
    logResult("Get Live Execution Status", false, `Error: ${error.message}`);
  }
}

// Test 10: Get Dashboard Summary
async function testGetDashboardSummary() {
  console.log("\n🧪 Testing: Get Dashboard Summary");

  try {
    const response = await makeRequest(
      "/api/workflows/monitoring?type=dashboard"
    );

    if (response.ok) {
      const summary = response.data.data;
      logResult(
        "Get Dashboard Summary",
        true,
        `Dashboard summary retrieved - Health: ${summary.system_health}`
      );
    } else {
      logResult(
        "Get Dashboard Summary",
        false,
        "Failed to get dashboard summary",
        response.data
      );
    }
  } catch (error) {
    logResult("Get Dashboard Summary", false, `Error: ${error.message}`);
  }
}

// Test 11: Update Error Resolution
async function testUpdateErrorResolution() {
  console.log("\n🧪 Testing: Update Error Resolution");

  if (createdIds.errors.length === 0) {
    logResult(
      "Update Error Resolution",
      false,
      "No error IDs available for testing"
    );
    return;
  }

  const errorId = createdIds.errors[0];
  const updateData = {
    resolved: true,
    resolution_notes: "Fixed by updating API timeout configuration",
    resolved_by: "test-user",
  };

  try {
    const response = await makeRequest(
      `/api/workflows/monitoring?type=error&id=${errorId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updateData),
      }
    );

    if (response.ok) {
      logResult(
        "Update Error Resolution",
        true,
        `Error ${errorId} marked as resolved`
      );
    } else {
      logResult(
        "Update Error Resolution",
        false,
        "Failed to update error",
        response.data
      );
    }
  } catch (error) {
    logResult("Update Error Resolution", false, `Error: ${error.message}`);
  }
}

// Test 12: Update Alert Acknowledgment
async function testUpdateAlertAcknowledgment() {
  console.log("\n🧪 Testing: Update Alert Acknowledgment");

  if (createdIds.alerts.length === 0) {
    logResult(
      "Update Alert Acknowledgment",
      false,
      "No alert IDs available for testing"
    );
    return;
  }

  const alertId = createdIds.alerts[0];
  const updateData = {
    acknowledged: true,
    acknowledged_by: "test-user",
  };

  try {
    const response = await makeRequest(
      `/api/workflows/monitoring?type=alert&id=${alertId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updateData),
      }
    );

    if (response.ok) {
      logResult(
        "Update Alert Acknowledgment",
        true,
        `Alert ${alertId} acknowledged`
      );
    } else {
      logResult(
        "Update Alert Acknowledgment",
        false,
        "Failed to update alert",
        response.data
      );
    }
  } catch (error) {
    logResult("Update Alert Acknowledgment", false, `Error: ${error.message}`);
  }
}

// Test 13: Batch Operations
async function testBatchOperations() {
  console.log("\n🧪 Testing: Batch Operations");

  const batchData = {
    logs: [
      {
        workflow_id: testWorkflowId,
        execution_id: `${testExecutionId}-batch`,
        log_level: "info",
        message: "Batch operation test log 1",
        node_name: "Batch Node",
      },
      {
        workflow_id: testWorkflowId,
        execution_id: `${testExecutionId}-batch`,
        log_level: "info",
        message: "Batch operation test log 2",
        node_name: "Batch Node",
      },
    ],
    errors: [
      {
        workflow_id: testWorkflowId,
        execution_id: `${testExecutionId}-batch`,
        error_type: "system",
        error_message: "Batch test error",
        severity: "low",
      },
    ],
    alerts: [
      {
        workflow_id: testWorkflowId,
        alert_type: "performance",
        severity: "info",
        title: "Batch Test Alert",
        description: "This is a test alert from batch operations",
      },
    ],
  };

  try {
    const response = await makeRequest("/api/workflows/monitoring?type=batch", {
      method: "POST",
      body: JSON.stringify(batchData),
    });

    if (response.ok) {
      const results = response.data.data;
      const totalCreated =
        (results.logs?.length || 0) +
        (results.errors?.length || 0) +
        (results.alerts?.length || 0);
      logResult(
        "Batch Operations",
        true,
        `Batch created ${totalCreated} entries successfully`
      );
    } else {
      logResult(
        "Batch Operations",
        false,
        "Failed to execute batch operations",
        response.data
      );
    }
  } catch (error) {
    logResult("Batch Operations", false, `Error: ${error.message}`);
  }
}

// Test 14: Real-time Monitoring Simulation
async function testRealtimeMonitoringSimulation() {
  console.log("\n🧪 Testing: Real-time Monitoring Simulation");

  const simulationWorkflowId = `realtime-test-${Date.now()}`;
  const simulationExecutionId = `exec-realtime-${Date.now()}`;

  // Simulate a workflow execution with multiple steps
  const steps = [
    { message: "Workflow started", duration: 0 },
    { message: "Data validation completed", duration: 1200 },
    { message: "API call in progress", duration: 2500 },
    { message: "Processing results", duration: 1800 },
    { message: "Workflow completed", duration: 500 },
  ];

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Create log entry
      await makeRequest("/api/workflows/monitoring?type=log", {
        method: "POST",
        body: JSON.stringify({
          workflow_id: simulationWorkflowId,
          execution_id: simulationExecutionId,
          log_level: "info",
          message: step.message,
          node_name: `Step ${i + 1}`,
          step_number: i + 1,
          duration: step.duration,
        }),
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Add performance metrics
    await makeRequest("/api/workflows/monitoring?type=performance", {
      method: "POST",
      body: JSON.stringify({
        workflow_id: simulationWorkflowId,
        execution_id: simulationExecutionId,
        total_duration: steps.reduce((sum, step) => sum + step.duration, 0),
        node_count: steps.length,
        successful_nodes: steps.length,
        failed_nodes: 0,
        memory_peak: 67108864,
        memory_average: 33554432,
        cpu_peak: 65.0,
        cpu_average: 35.5,
        network_requests: 3,
        network_data_transferred: 1024000,
        throughput: 1.5,
        bottleneck_nodes: [],
      }),
    });

    logResult(
      "Real-time Monitoring Simulation",
      true,
      `Simulated ${steps.length} step workflow execution`
    );
  } catch (error) {
    logResult(
      "Real-time Monitoring Simulation",
      false,
      `Error: ${error.message}`
    );
  }
}

// Test 15: Performance Stress Test
async function testPerformanceStressTest() {
  console.log("\n🧪 Testing: Performance Stress Test");

  const stressTestWorkflowId = `stress-test-${Date.now()}`;
  const concurrentRequests = 10;
  const requestsPerBatch = 5;

  try {
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      const batchPromise = async () => {
        const batchRequests = [];

        for (let j = 0; j < requestsPerBatch; j++) {
          const logRequest = makeRequest("/api/workflows/monitoring?type=log", {
            method: "POST",
            body: JSON.stringify({
              workflow_id: stressTestWorkflowId,
              execution_id: `stress-exec-${i}-${j}`,
              log_level: "info",
              message: `Stress test log ${i}-${j}`,
              node_name: `Stress Node ${i}`,
              duration: Math.floor(Math.random() * 1000),
            }),
          });

          batchRequests.push(logRequest);
        }

        return Promise.all(batchRequests);
      };

      promises.push(batchPromise());
    }

    const startTime = Date.now();
    await Promise.all(promises);
    const endTime = Date.now();

    const totalRequests = concurrentRequests * requestsPerBatch;
    const duration = endTime - startTime;
    const requestsPerSecond = ((totalRequests / duration) * 1000).toFixed(2);

    logResult(
      "Performance Stress Test",
      true,
      `Completed ${totalRequests} requests in ${duration}ms (${requestsPerSecond} req/s)`
    );
  } catch (error) {
    logResult("Performance Stress Test", false, `Error: ${error.message}`);
  }
}

// Test 16: Data Cleanup
async function testDataCleanup() {
  console.log("\n🧪 Testing: Data Cleanup");

  try {
    const response = await makeRequest(
      "/api/workflows/monitoring?retention_days=0",
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      const deletedCount = response.data.deleted_count || 0;
      logResult(
        "Data Cleanup",
        true,
        `Cleaned up ${deletedCount} old monitoring records`
      );
    } else {
      logResult("Data Cleanup", false, "Failed to cleanup data", response.data);
    }
  } catch (error) {
    logResult("Data Cleanup", false, `Error: ${error.message}`);
  }
}

// Main test execution
async function runAllTests() {
  console.log("🚀 Starting Workflow Monitoring System Tests");
  console.log(`📊 Running ${testScenarios.length} test scenarios\n`);

  const startTime = Date.now();

  try {
    await testCreateLogEntries();
    await testCreateErrorEntries();
    await testCreatePerformanceMetrics();
    await testCreateAlerts();
    await testRetrieveExecutionLogs();
    await testRetrieveWorkflowErrors();
    await testRetrievePerformanceMetrics();
    await testRetrieveMonitoringAlerts();
    await testGetLiveExecutionStatus();
    await testGetDashboardSummary();
    await testUpdateErrorResolution();
    await testUpdateAlertAcknowledgment();
    await testBatchOperations();
    await testRealtimeMonitoringSimulation();
    await testPerformanceStressTest();
    await testDataCleanup();
  } catch (error) {
    console.error("Test execution failed:", error);
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Generate test summary
  console.log("\n📋 Test Summary");
  console.log("================");

  const passed = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  const total = testResults.length;

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    testResults
      .filter(r => !r.success)
      .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
  }

  console.log("\n🎯 Test Coverage:");
  console.log("   - ✅ Log creation and retrieval");
  console.log("   - ✅ Error tracking and resolution");
  console.log("   - ✅ Performance metrics collection");
  console.log("   - ✅ Alert management and acknowledgment");
  console.log("   - ✅ Live execution status monitoring");
  console.log("   - ✅ Dashboard summary generation");
  console.log("   - ✅ Batch operations");
  console.log("   - ✅ Real-time monitoring simulation");
  console.log("   - ✅ Performance stress testing");
  console.log("   - ✅ Data cleanup and retention");

  console.log("\n🏁 Workflow Monitoring System Testing Complete!");

  return {
    passed,
    failed,
    total,
    duration,
    successRate: (passed / total) * 100,
    results: testResults,
  };
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testResults,
};
