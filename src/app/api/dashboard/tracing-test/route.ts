import { NextRequest, NextResponse } from "next/server";
import {
  createTracedAPIHandler,
  traceDbOperation,
  traceExternalCall,
} from "@/lib/middleware/tracing";
import { trackUserAction } from "@/lib/tracing";

async function handler(_req: NextRequest) {
  try {
    // Simulate user action tracking
    trackUserAction("tracing_test_api_call", "test-user-123", {
      endpoint: "/api/dashboard/tracing-test",
    });

    // Simulate database operation
    const dbResult = await traceDbOperation(
      "select",
      "dashboard_metrics",
      async () => {
        // Simulate database query delay
        await new Promise(resolve => setTimeout(resolve, 50));
        return { metrics: [{ id: 1, value: 100 }] };
      }
    );

    // Simulate external API call
    const externalData = await traceExternalCall(
      "analytics-service",
      "get_user_stats",
      "https://api.example.com/stats",
      async () => {
        // Simulate external API delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return { stats: { sessions: 42, page_views: 1337 } };
      }
    );

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 25));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        database: dbResult,
        external: externalData,
        processed_at: Date.now(),
      },
      tracing: {
        enabled: true,
        service: "skc-bi-dashboard",
        operation: "tracing-test",
      },
    });
  } catch (error) {
    console.error("Tracing test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Export the traced handler
export const GET = createTracedAPIHandler(handler, {
  spanName: "dashboard.tracing_test",
  attributes: {
    "api.type": "test",
    "api.category": "dashboard",
  },
});

export const POST = createTracedAPIHandler(
  async (req: NextRequest) => {
    const body = await req.json();

    // Simulate processing with tracing
    const result = await traceDbOperation("insert", "test_data", async () => {
      await new Promise(resolve => setTimeout(resolve, 30));
      return { inserted_id: Math.floor(Math.random() * 1000) };
    });

    return NextResponse.json({
      success: true,
      received: body,
      result,
      timestamp: new Date().toISOString(),
    });
  },
  {
    spanName: "dashboard.tracing_test_post",
    attributes: {
      "api.type": "test",
      "api.category": "dashboard",
      "api.method": "POST",
    },
  }
);
