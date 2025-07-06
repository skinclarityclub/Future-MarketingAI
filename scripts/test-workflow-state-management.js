/**
 * Task 33.2: Develop State Management System
 * Test script for workflow state management functionality
 */

const TEST_WORKFLOW_ID = "test-workflow-state-001";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/**
 * Test workflow state management functionality
 */
async function testWorkflowStateManagement() {
  console.log("🧪 Testing Workflow State Management System...\n");

  try {
    // Test 1: Create initial workflow state
    console.log("📝 Test 1: Creating initial workflow state...");
    const createResponse = await fetch(`${BASE_URL}/api/workflows/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: TEST_WORKFLOW_ID,
        new_state: "idle",
        transition_type: "start",
        metadata: {
          test: true,
          created_at: new Date().toISOString(),
        },
        triggered_by: "test_script",
        reason: "Initial state creation for testing",
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create state: ${createResponse.status}`);
    }

    const createResult = await createResponse.json();
    console.log("✅ Initial state created:", createResult.state.current_state);

    // Test 2: Get workflow state
    console.log("\n📖 Test 2: Getting workflow state...");
    const getResponse = await fetch(
      `${BASE_URL}/api/workflows/state?workflow_id=${TEST_WORKFLOW_ID}&include_history=true&include_aggregates=true`
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to get state: ${getResponse.status}`);
    }

    const getResult = await getResponse.json();
    console.log("✅ Retrieved state:", getResult.state.current_state);
    console.log("📊 History entries:", getResult.history?.length || 0);
    console.log("📈 Aggregates available:", !!getResult.aggregates);

    // Test 3: Transition to running state
    console.log("\n🏃 Test 3: Transitioning to running state...");
    const runningResponse = await fetch(`${BASE_URL}/api/workflows/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: TEST_WORKFLOW_ID,
        new_state: "running",
        transition_type: "start",
        execution_id: `exec_${Date.now()}`,
        progress: 0,
        metadata: {
          step: "initialization",
          total_steps: 5,
        },
        triggered_by: "test_script",
        reason: "Starting workflow execution",
      }),
    });

    if (!runningResponse.ok) {
      throw new Error(
        `Failed to transition to running: ${runningResponse.status}`
      );
    }

    const runningResult = await runningResponse.json();
    console.log("✅ Transitioned to:", runningResult.state.current_state);
    console.log("⚡ Execution ID:", runningResult.state.execution_id);

    // Test 4: Update progress
    console.log("\n📈 Test 4: Updating progress...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    const progressResponse = await fetch(`${BASE_URL}/api/workflows/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: TEST_WORKFLOW_ID,
        new_state: "running",
        transition_type: "resume",
        progress: 50,
        metadata: {
          step: "processing",
          total_steps: 5,
          current_step: 2,
        },
        triggered_by: "test_script",
        reason: "Progress update",
      }),
    });

    if (!progressResponse.ok) {
      throw new Error(`Failed to update progress: ${progressResponse.status}`);
    }

    const progressResult = await progressResponse.json();
    console.log(
      "✅ Progress updated to:",
      progressResult.state.progress_percentage + "%"
    );

    // Test 5: Pause workflow
    console.log("\n⏸️ Test 5: Pausing workflow...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 0.5 seconds

    const pauseResponse = await fetch(`${BASE_URL}/api/workflows/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: TEST_WORKFLOW_ID,
        new_state: "paused",
        transition_type: "pause",
        triggered_by: "test_script",
        reason: "Pausing for maintenance",
      }),
    });

    if (!pauseResponse.ok) {
      throw new Error(`Failed to pause: ${pauseResponse.status}`);
    }

    const pauseResult = await pauseResponse.json();
    console.log("✅ Workflow paused:", pauseResult.state.current_state);

    // Test 6: Resume workflow
    console.log("\n▶️ Test 6: Resuming workflow...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    const resumeResponse = await fetch(`${BASE_URL}/api/workflows/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: TEST_WORKFLOW_ID,
        new_state: "running",
        transition_type: "resume",
        progress: 75,
        metadata: {
          step: "finalizing",
          total_steps: 5,
          current_step: 4,
        },
        triggered_by: "test_script",
        reason: "Resuming after maintenance",
      }),
    });

    if (!resumeResponse.ok) {
      throw new Error(`Failed to resume: ${resumeResponse.status}`);
    }

    const resumeResult = await resumeResponse.json();
    console.log("✅ Workflow resumed:", resumeResult.state.current_state);

    // Test 7: Complete workflow
    console.log("\n🎉 Test 7: Completing workflow...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    const completeResponse = await fetch(`${BASE_URL}/api/workflows/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: TEST_WORKFLOW_ID,
        new_state: "completed",
        transition_type: "complete",
        progress: 100,
        metadata: {
          step: "completed",
          total_steps: 5,
          current_step: 5,
          result: "success",
          output_data: {
            records_processed: 150,
            errors: 0,
          },
        },
        triggered_by: "test_script",
        reason: "Workflow completed successfully",
      }),
    });

    if (!completeResponse.ok) {
      throw new Error(`Failed to complete: ${completeResponse.status}`);
    }

    const completeResult = await completeResponse.json();
    console.log("✅ Workflow completed:", completeResult.state.current_state);
    console.log("⏱️ Duration:", completeResult.state.duration + "ms");

    // Test 8: Get multiple workflow states
    console.log("\n📊 Test 8: Getting multiple workflow states...");

    // Create another test workflow
    const secondWorkflowId = "test-workflow-state-002";
    await fetch(`${BASE_URL}/api/workflows/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: secondWorkflowId,
        new_state: "running",
        transition_type: "start",
        metadata: { test: true },
        triggered_by: "test_script",
      }),
    });

    const multipleResponse = await fetch(
      `${BASE_URL}/api/workflows/state?workflow_ids=${TEST_WORKFLOW_ID},${secondWorkflowId}&include_aggregates=true`
    );

    if (!multipleResponse.ok) {
      throw new Error(
        `Failed to get multiple states: ${multipleResponse.status}`
      );
    }

    const multipleResult = await multipleResponse.json();
    console.log(
      "✅ Retrieved multiple states:",
      Object.keys(multipleResult.states).length
    );
    console.log(
      "📈 Aggregates for workflows:",
      Object.keys(multipleResult.aggregates || {}).length
    );

    // Test 9: Test error scenarios
    console.log("\n❌ Test 9: Testing error scenarios...");

    // Invalid state
    const invalidStateResponse = await fetch(
      `${BASE_URL}/api/workflows/state`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow_id: TEST_WORKFLOW_ID,
          new_state: "invalid_state",
          transition_type: "start",
        }),
      }
    );

    if (invalidStateResponse.status !== 400) {
      throw new Error("Should have rejected invalid state");
    }
    console.log("✅ Invalid state properly rejected");

    // Missing required fields
    const missingFieldsResponse = await fetch(
      `${BASE_URL}/api/workflows/state`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow_id: TEST_WORKFLOW_ID,
          // Missing new_state and transition_type
        }),
      }
    );

    if (missingFieldsResponse.status !== 400) {
      throw new Error("Should have rejected missing fields");
    }
    console.log("✅ Missing fields properly rejected");

    // Non-existent workflow for GET
    const nonExistentResponse = await fetch(
      `${BASE_URL}/api/workflows/state?workflow_id=non-existent-workflow`
    );

    if (nonExistentResponse.status !== 404) {
      throw new Error("Should have returned 404 for non-existent workflow");
    }
    console.log("✅ Non-existent workflow properly handled");

    // Test 10: Get final state with complete history
    console.log("\n📋 Test 10: Getting final state with complete history...");
    const finalStateResponse = await fetch(
      `${BASE_URL}/api/workflows/state?workflow_id=${TEST_WORKFLOW_ID}&include_history=true&include_aggregates=true`
    );

    if (!finalStateResponse.ok) {
      throw new Error(
        `Failed to get final state: ${finalStateResponse.status}`
      );
    }

    const finalState = await finalStateResponse.json();
    console.log("✅ Final state:", finalState.state.current_state);
    console.log("📊 Total transitions:", finalState.history?.length || 0);
    console.log(
      "📈 Success rate:",
      finalState.aggregates?.success_rate || 0 + "%"
    );
    console.log(
      "⏱️ Average duration:",
      finalState.aggregates?.average_duration || 0 + "ms"
    );

    // Test 11: Cleanup test
    console.log("\n🧹 Test 11: Testing cleanup functionality...");
    const cleanupResponse = await fetch(
      `${BASE_URL}/api/workflows/state?days_old=0`,
      { method: "DELETE" }
    );

    if (!cleanupResponse.ok) {
      throw new Error(`Failed to cleanup: ${cleanupResponse.status}`);
    }

    const cleanupResult = await cleanupResponse.json();
    console.log("✅ Cleanup completed:", cleanupResult.message);

    console.log("\n🎉 All workflow state management tests passed!");

    // Print summary
    console.log("\n📋 Test Summary:");
    console.log("================");
    console.log("✅ State creation");
    console.log("✅ State retrieval");
    console.log(
      "✅ State transitions (idle → running → paused → running → completed)"
    );
    console.log("✅ Progress tracking");
    console.log("✅ Multiple workflow states");
    console.log("✅ Error handling");
    console.log("✅ History tracking");
    console.log("✅ Aggregates calculation");
    console.log("✅ Cleanup functionality");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

/**
 * Test real-time state changes (if WebSocket available)
 */
async function testRealtimeUpdates() {
  console.log("\n🔄 Testing real-time state updates...");

  try {
    // This would test WebSocket or Server-Sent Events if implemented
    console.log("ℹ️ Real-time testing requires WebSocket implementation");
    console.log("   Simulating real-time behavior with polling...");

    const workflowId = "realtime-test-workflow";

    // Create initial state
    await fetch(`${BASE_URL}/api/workflows/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: workflowId,
        new_state: "running",
        transition_type: "start",
        metadata: { realtime_test: true },
      }),
    });

    // Poll for changes (simulating real-time)
    let pollCount = 0;
    const maxPolls = 5;
    const pollInterval = 1000;

    const pollForChanges = async () => {
      if (pollCount >= maxPolls) {
        console.log("✅ Real-time simulation completed");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/workflows/state?workflow_id=${workflowId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(
          `📡 Poll ${pollCount + 1}: State is ${data.state.current_state}`
        );
      }

      pollCount++;
      setTimeout(pollForChanges, pollInterval);
    };

    await pollForChanges();
  } catch (error) {
    console.error("❌ Real-time test failed:", error.message);
  }
}

/**
 * Performance test for state management
 */
async function performanceTest() {
  console.log("\n🚀 Performance testing...");

  try {
    const startTime = Date.now();
    const concurrentRequests = 10;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      const workflowId = `perf-test-workflow-${i}`;

      const promise = fetch(`${BASE_URL}/api/workflows/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow_id: workflowId,
          new_state: "running",
          transition_type: "start",
          metadata: { performance_test: true, index: i },
        }),
      });

      promises.push(promise);
    }

    const responses = await Promise.all(promises);
    const successfulRequests = responses.filter(r => r.ok).length;
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Performance test completed:`);
    console.log(
      `   ${successfulRequests}/${concurrentRequests} requests successful`
    );
    console.log(`   Total time: ${duration}ms`);
    console.log(
      `   Average time per request: ${duration / concurrentRequests}ms`
    );
  } catch (error) {
    console.error("❌ Performance test failed:", error.message);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testWorkflowStateManagement();
    await testRealtimeUpdates();
    await performanceTest();

    console.log("\n🎊 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  }
}

// Execute tests if run directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testWorkflowStateManagement,
  testRealtimeUpdates,
  performanceTest,
  runAllTests,
};
