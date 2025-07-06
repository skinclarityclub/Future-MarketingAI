/**
 * Test Script for Webhook Orchestration
 * Task 33.1: Setup Webhook Orchestration
 * Tests webhook endpoints and data flow between dashboard and n8n
 */

const https = require("https");
const http = require("http");

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const WEBHOOK_ENDPOINT = `${BASE_URL}/api/webhooks/n8n`;

// Test configurations
const testConfigs = {
  webhookSecret: process.env.N8N_WEBHOOK_SECRET || "test-secret",
  workflowId: "test-workflow-001",
  executionId: "exec-test-001",
};

/**
 * Create HMAC signature for webhook validation
 */
function createSignature(payload, secret) {
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return `sha256=${hmac.digest("hex")}`;
}

/**
 * Send HTTP request
 */
function sendRequest(options, data) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === "https:" ? https : http;

    const req = protocol.request(options, res => {
      let responseData = "";

      res.on("data", chunk => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        }
      });
    });

    req.on("error", error => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

/**
 * Test 1: POST - Send webhook from n8n (simulated)
 */
async function testIncomingWebhook() {
  console.log("\n🔄 Testing incoming webhook from n8n...");

  const payload = JSON.stringify({
    workflowId: testConfigs.workflowId,
    executionId: testConfigs.executionId,
    execution: {
      id: testConfigs.executionId,
      status: "success",
      data: {
        result: "Email sent successfully",
        recipient: "test@example.com",
      },
    },
    timestamp: new Date().toISOString(),
  });

  const signature = createSignature(payload, testConfigs.webhookSecret);

  const url = new URL(WEBHOOK_ENDPOINT);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      "x-n8n-signature": signature,
      "User-Agent": "n8n-webhook/1.0",
    },
  };

  try {
    const response = await sendRequest(options, payload);

    if (response.statusCode === 200) {
      console.log("✅ Incoming webhook test passed");
      console.log("Response:", response.data);
    } else {
      console.log("❌ Incoming webhook test failed");
      console.log("Status:", response.statusCode);
      console.log("Response:", response.data);
    }
  } catch (error) {
    console.log("❌ Incoming webhook test error:", error.message);
  }
}

/**
 * Test 2: GET - Check orchestration status
 */
async function testOrchestrationStatus() {
  console.log("\n🔄 Testing orchestration status...");

  const url = new URL(WEBHOOK_ENDPOINT);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await sendRequest(options);

    if (response.statusCode === 200) {
      console.log("✅ Orchestration status test passed");
      console.log("Status:", response.data);
    } else {
      console.log("❌ Orchestration status test failed");
      console.log("Status:", response.statusCode);
      console.log("Response:", response.data);
    }
  } catch (error) {
    console.log("❌ Orchestration status test error:", error.message);
  }
}

/**
 * Test 3: PUT - Register new webhook endpoint
 */
async function testWebhookRegistration() {
  console.log("\n🔄 Testing webhook endpoint registration...");

  const payload = JSON.stringify({
    name: "Test Webhook Endpoint",
    url: "https://test.example.com/webhook",
    method: "POST",
    security: {
      authentication: "bearer",
      token: "test-token-123",
    },
    triggers: ["execution_completed", "execution_failed"],
    errorHandling: {
      retryAttempts: 5,
      retryDelay: 2000,
      fallbackAction: "alert",
    },
  });

  const url = new URL(WEBHOOK_ENDPOINT);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  try {
    const response = await sendRequest(options, payload);

    if (response.statusCode === 200) {
      console.log("✅ Webhook registration test passed");
      console.log("Response:", response.data);
    } else {
      console.log("❌ Webhook registration test failed");
      console.log("Status:", response.statusCode);
      console.log("Response:", response.data);
    }
  } catch (error) {
    console.log("❌ Webhook registration test error:", error.message);
  }
}

/**
 * Test 4: PATCH - Send webhook to n8n
 */
async function testOutgoingWebhook() {
  console.log("\n🔄 Testing outgoing webhook to n8n...");

  const payload = JSON.stringify({
    workflowId: testConfigs.workflowId,
    triggerType: "webhook",
    data: {
      event: "user_signup",
      user: {
        id: "user-123",
        email: "newuser@example.com",
        name: "New User",
      },
      timestamp: new Date().toISOString(),
    },
  });

  const url = new URL(WEBHOOK_ENDPOINT);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname,
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  try {
    const response = await sendRequest(options, payload);

    if (response.statusCode === 200) {
      console.log("✅ Outgoing webhook test passed");
      console.log("Response:", response.data);
    } else {
      console.log("❌ Outgoing webhook test failed");
      console.log("Status:", response.statusCode);
      console.log("Response:", response.data);
    }
  } catch (error) {
    console.log("❌ Outgoing webhook test error:", error.message);
  }
}

/**
 * Test 5: Test invalid webhook signature
 */
async function testInvalidSignature() {
  console.log("\n🔄 Testing invalid webhook signature...");

  const payload = JSON.stringify({
    workflowId: testConfigs.workflowId,
    executionId: "invalid-test",
    execution: { status: "success" },
  });

  const invalidSignature = "sha256=invalid-signature";

  const url = new URL(WEBHOOK_ENDPOINT);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      "x-n8n-signature": invalidSignature,
    },
  };

  try {
    const response = await sendRequest(options, payload);

    if (response.statusCode === 401) {
      console.log("✅ Invalid signature test passed (correctly rejected)");
    } else {
      console.log(
        "❌ Invalid signature test failed (should have been rejected)"
      );
      console.log("Status:", response.statusCode);
      console.log("Response:", response.data);
    }
  } catch (error) {
    console.log("❌ Invalid signature test error:", error.message);
  }
}

/**
 * Test 6: Test missing required fields
 */
async function testMissingFields() {
  console.log("\n🔄 Testing missing required fields...");

  const payload = JSON.stringify({
    // Missing workflowId
    executionId: "test-missing-fields",
    execution: { status: "success" },
  });

  const url = new URL(WEBHOOK_ENDPOINT);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  try {
    const response = await sendRequest(options, payload);

    if (response.statusCode === 400) {
      console.log("✅ Missing fields test passed (correctly rejected)");
    } else {
      console.log("❌ Missing fields test failed (should have been rejected)");
      console.log("Status:", response.statusCode);
      console.log("Response:", response.data);
    }
  } catch (error) {
    console.log("❌ Missing fields test error:", error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("🚀 Starting Webhook Orchestration Tests");
  console.log("Target URL:", WEBHOOK_ENDPOINT);
  console.log("=".repeat(50));

  // Run tests sequentially to avoid conflicts
  await testIncomingWebhook();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

  await testOrchestrationStatus();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testWebhookRegistration();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testOutgoingWebhook();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testInvalidSignature();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testMissingFields();

  console.log("\n" + "=".repeat(50));
  console.log("🏁 Webhook Orchestration Tests Completed");
}

// Run tests if script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testIncomingWebhook,
  testOrchestrationStatus,
  testWebhookRegistration,
  testOutgoingWebhook,
  testInvalidSignature,
  testMissingFields,
};
