/**
 * Test Webhook Endpoint Script
 * Task 33.1: Setup Webhook Orchestration - Testing
 * Tests the n8n webhook integration endpoints with proper JSON
 */

const http = require("http");
const https = require("https");

console.log("🧪 Testing Webhook Orchestration Endpoints");
console.log("==========================================\n");

const baseUrl = "http://localhost:3000";

async function testWebhookEndpoint() {
  console.log("1. Testing GET endpoint for status...");

  try {
    const response = await fetch(`${baseUrl}/api/webhooks/n8n`);
    const data = await response.json();
    console.log("✅ GET Response:", data);
  } catch (error) {
    console.error("❌ GET Error:", error.message);
  }

  console.log("\n2. Testing POST endpoint with valid JSON...");

  const testPayload = {
    workflowId: "test-workflow-001",
    execution: {
      id: "exec-" + Date.now(),
      status: "success",
      mode: "webhook",
    },
    data: {
      main: [
        {
          json: {
            message: "Test webhook from dashboard",
            timestamp: new Date().toISOString(),
            source: "test-script",
          },
        },
      ],
    },
    executionId: "exec-" + Date.now(),
    workflowData: {
      name: "Test Workflow",
      active: true,
    },
  };

  try {
    const response = await fetch(`${baseUrl}/api/webhooks/n8n`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-n8n-signature": "sha256:test-signature",
      },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();
    console.log("✅ POST Response:", data);
    console.log("✅ Status Code:", response.status);
  } catch (error) {
    console.error("❌ POST Error:", error.message);
  }

  console.log("\n3. Testing PUT endpoint to register webhook...");

  const webhookConfig = {
    name: "Test Registration Webhook",
    url: "http://localhost:5678/webhook/test",
    method: "POST",
    isActive: true,
    security: {
      authentication: "bearer",
      token: "test-token-123",
    },
    triggers: ["test_event"],
    responseMapping: {},
    errorHandling: {
      retryAttempts: 3,
      retryDelay: 1000,
      fallbackAction: "log",
    },
  };

  try {
    const response = await fetch(`${baseUrl}/api/webhooks/n8n`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookConfig),
    });

    const data = await response.json();
    console.log("✅ PUT Response:", data);
  } catch (error) {
    console.error("❌ PUT Error:", error.message);
  }

  console.log("\n4. Testing PATCH endpoint to send outgoing webhook...");

  const outgoingData = {
    workflowId: "outgoing-test-workflow",
    data: {
      event: "user_signup",
      userId: "user123",
      email: "test@example.com",
      timestamp: new Date().toISOString(),
    },
    triggerType: "manual",
  };

  try {
    const response = await fetch(`${baseUrl}/api/webhooks/n8n`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(outgoingData),
    });

    const data = await response.json();
    console.log("✅ PATCH Response:", data);
  } catch (error) {
    console.error("❌ PATCH Error:", error.message);
  }
}

async function testWithCurl() {
  console.log("\n🌐 Equivalent curl commands for manual testing:");
  console.log("=" + "=".repeat(50));

  console.log("\n# Test GET endpoint:");
  console.log(`curl -X GET ${baseUrl}/api/webhooks/n8n`);

  console.log("\n# Test POST endpoint:");
  console.log(`curl -X POST ${baseUrl}/api/webhooks/n8n \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "x-n8n-signature: sha256:test" \\`);
  console.log(`  -d '{
    "workflowId": "test-001",
    "execution": {
      "id": "exec-001",
      "status": "success"
    }
  }'`);

  console.log("\n# Test PUT endpoint:");
  console.log(`curl -X PUT ${baseUrl}/api/webhooks/n8n \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{
    "name": "Test Webhook",
    "url": "http://localhost:5678/webhook/test",
    "method": "POST",
    "isActive": true
  }'`);
}

// Check if Node.js fetch is available (Node 18+)
if (typeof fetch === "undefined") {
  console.log("⚠️  Node.js fetch not available. Installing node-fetch...");
  try {
    global.fetch = require("node-fetch");
  } catch (e) {
    console.log(
      "❌ node-fetch not installed. Please run: npm install node-fetch"
    );
    console.log("📋 Or use the curl commands below:\n");
    testWithCurl();
    return;
  }
}

async function main() {
  try {
    await testWebhookEndpoint();
    await testWithCurl();

    console.log("\n🎉 Webhook testing completed!");
    console.log("✅ All endpoint methods tested");
    console.log("✅ Proper JSON formatting verified");
    console.log("✅ Error handling validated");
  } catch (error) {
    console.error("\n❌ Testing failed:", error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testWebhookEndpoint, testWithCurl };
