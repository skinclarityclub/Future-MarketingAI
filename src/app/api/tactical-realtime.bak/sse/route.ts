/**
 * Real-Time Tactical Analysis Server-Sent Events (SSE) API
 * Provides live streaming of business insights, alerts, and forecasts
 * Compatible with Next.js and standard browsers
 */

import { NextRequest, NextResponse } from "next/server";
import { tacticalRealtimeEngine } from "@/lib/realtime/tactical-realtime-engine";

// Active SSE connections
const connections = new Map<string, ReadableStreamDefaultController>();
const subscriptions = new Map<string, string[]>(); // clientId -> channels

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId") || generateClientId();
  const channels = searchParams.get("channels")?.split(",") || [
    "insights",
    "alerts",
    "forecasts",
  ];
  const authToken = searchParams.get("token");

  // Basic authentication
  if (!authToken || !isValidToken(authToken)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      connections.set(clientId, controller);
      subscriptions.set(clientId, channels);

      console.log(`SSE client ${clientId} connected to channels:`, channels);

      // Subscribe to real-time engine
      tacticalRealtimeEngine.subscribe(clientId, data => {
        sendSSEMessage(controller, {
          type: "data",
          payload: data,
          timestamp: new Date().toISOString(),
        });
      });

      // Send initial connection message
      sendSSEMessage(controller, {
        type: "connected",
        clientId,
        channels,
        timestamp: new Date().toISOString(),
      });

      // Send initial data
      sendInitialData(controller);

      // Set up keep-alive ping
      const pingInterval = setInterval(() => {
        try {
          sendSSEMessage(controller, {
            type: "ping",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          clearInterval(pingInterval);
          cleanup(clientId);
        }
      }, 30000); // Ping every 30 seconds

      // Store interval for cleanup
      (controller as any).pingInterval = pingInterval;
    },

    cancel() {
      cleanup(clientId);
    },
  });

  // Return SSE response
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload, clientId } = body;

    switch (action) {
      case "get_status":
        return NextResponse.json({
          success: true,
          data: {
            engine_running: true,
            connected_clients: connections.size,
            active_channels: Array.from(
              new Set(Array.from(subscriptions.values()).flat())
            ),
            sse_endpoint: "/api/tactical-realtime/sse",
            supported_channels: ["insights", "alerts", "forecasts"],
          },
        });

      case "inject_data":
        if (payload.authLevel === "admin") {
          await tacticalRealtimeEngine.injectData(payload.data);
          return NextResponse.json({
            success: true,
            message: "Data injected successfully",
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "Unauthorized",
            },
            { status: 401 }
          );
        }

      case "send_to_client":
        if (clientId && connections.has(clientId)) {
          const controller = connections.get(clientId)!;
          sendSSEMessage(controller, payload);
          return NextResponse.json({
            success: true,
            message: "Message sent to client",
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "Client not found",
            },
            { status: 404 }
          );
        }

      case "broadcast":
        broadcastToAll(payload);
        return NextResponse.json({
          success: true,
          message: "Message broadcasted to all clients",
        });

      case "get_forecasts":
        const forecasts = Array.from(
          tacticalRealtimeEngine.getCurrentForecasts().values()
        );
        return NextResponse.json({
          success: true,
          data: forecasts,
          count: forecasts.length,
        });

      case "get_alerts":
        const alerts = tacticalRealtimeEngine.getActiveAlerts();
        return NextResponse.json({
          success: true,
          data: alerts,
          count: alerts.length,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported action: ${action}`,
            supported_actions: [
              "get_status",
              "inject_data",
              "send_to_client",
              "broadcast",
              "get_forecasts",
              "get_alerts",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Real-time SSE API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Send SSE message to client
 */
function sendSSEMessage(
  controller: ReadableStreamDefaultController,
  data: any
) {
  try {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(new TextEncoder().encode(message));
  } catch (error) {
    console.error("Error sending SSE message:", error);
  }
}

/**
 * Send initial data to newly connected client
 */
function sendInitialData(controller: ReadableStreamDefaultController) {
  // Send current forecasts
  const forecasts = Array.from(
    tacticalRealtimeEngine.getCurrentForecasts().values()
  );

  sendSSEMessage(controller, {
    type: "initial_forecasts",
    data: forecasts,
    count: forecasts.length,
    timestamp: new Date().toISOString(),
  });

  // Send active alerts
  const alerts = tacticalRealtimeEngine.getActiveAlerts();

  sendSSEMessage(controller, {
    type: "initial_alerts",
    data: alerts,
    count: alerts.length,
    timestamp: new Date().toISOString(),
  });

  // Send engine status
  sendSSEMessage(controller, {
    type: "engine_status",
    data: {
      status: "running",
      connected_clients: connections.size,
      last_updated: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast message to all connected clients
 */
function broadcastToAll(data: any) {
  connections.forEach((controller, clientId) => {
    try {
      sendSSEMessage(controller, {
        type: "broadcast",
        payload: data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error broadcasting to client ${clientId}:`, error);
      cleanup(clientId);
    }
  });
}

/**
 * Broadcast message to clients subscribed to specific channels
 */
function broadcastToChannels(channels: string[], data: any) {
  subscriptions.forEach((clientChannels, clientId) => {
    const hasMatchingChannel = channels.some(channel =>
      clientChannels.includes(channel)
    );

    if (hasMatchingChannel) {
      const controller = connections.get(clientId);
      if (controller) {
        sendSSEMessage(controller, {
          type: "channel_message",
          channels,
          payload: data,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });
}

/**
 * Clean up client connection
 */
function cleanup(clientId: string) {
  console.log(`Cleaning up SSE client ${clientId}`);

  const controller = connections.get(clientId);
  if (controller) {
    // Clean up ping interval
    if ((controller as any).pingInterval) {
      clearInterval((controller as any).pingInterval);
    }

    // Close controller
    try {
      controller.close();
    } catch (error) {
      // Controller might already be closed
    }
  }

  // Remove from collections
  connections.delete(clientId);
  subscriptions.delete(clientId);

  // Unsubscribe from real-time engine
  tacticalRealtimeEngine.unsubscribe(clientId);
}

/**
 * Generate unique client ID
 */
function generateClientId(): string {
  return `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate authentication token
 */
function isValidToken(token: string): boolean {
  // Implement proper token validation
  // For demo purposes, accept any non-empty token
  return token.length > 0;
}

// Start the real-time engine when the module loads (server-side only)
if (typeof window === "undefined") {
  // Initialize real-time engine
  tacticalRealtimeEngine.start().catch(console.error);

  // Set up periodic cleanup of dead connections
  setInterval(() => {
    const deadClients: string[] = [];

    connections.forEach((controller, clientId) => {
      try {
        // Try to send a test message to check if connection is alive
        sendSSEMessage(controller, {
          type: "heartbeat",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        deadClients.push(clientId);
      }
    });

    // Clean up dead connections
    deadClients.forEach(clientId => cleanup(clientId));

    if (deadClients.length > 0) {
      console.log(`Cleaned up ${deadClients.length} dead SSE connections`);
    }
  }, 60000); // Clean up every minute
}
