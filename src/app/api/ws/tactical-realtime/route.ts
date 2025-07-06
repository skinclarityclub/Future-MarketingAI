/**
 * Real-Time Tactical Analysis WebSocket API
 * Provides live streaming of business insights, alerts, and forecasts
 * Supports multiple client connections with subscription management
 */

import { NextRequest, NextResponse } from "next/server";
import {
  tacticalRealtimeEngine,
  RealtimeInsight,
  RealtimeAlert,
  StreamingForecast,
} from "@/lib/realtime/tactical-realtime-engine";

// WebSocket connection management
const connections = new Map<string, WebSocket>();
const subscriptions = new Map<string, Set<string>>(); // channelId -> clientIds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const upgrade = request.headers.get("upgrade");

  if (upgrade !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 400 });
  }

  // Extract client configuration
  const clientId = searchParams.get("clientId") || generateClientId();
  const subscribeToChannels = searchParams.get("channels")?.split(",") || [
    "insights",
    "alerts",
    "forecasts",
  ];
  const authToken = searchParams.get("token");

  // Basic authentication (extend with proper auth)
  if (!authToken || !isValidToken(authToken)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // WebSocket is not supported in Next.js App Router
    // This endpoint now serves as a polling endpoint for real-time data
    console.log(`Real-time data request from client ${clientId}`);

    // Get current data
    const forecasts = tacticalRealtimeEngine.getCurrentForecasts();
    const forecastArray = Array.from(forecasts.values());
    const alerts = tacticalRealtimeEngine.getActiveAlerts();

    // Return current state
    return NextResponse.json({
      type: "realtime_data",
      clientId,
      subscriptions: subscribeToChannels,
      data: {
        forecasts: forecastArray,
        alerts: alerts,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Real-time data fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch real-time data" },
      { status: 500 }
    );
  }
}

/**
 * Handle messages from WebSocket clients
 */
function handleClientMessage(clientId: string, message: any) {
  const { type, payload } = message;

  switch (type) {
    case "subscribe":
      handleSubscription(clientId, payload.channels, true);
      break;

    case "unsubscribe":
      handleSubscription(clientId, payload.channels, false);
      break;

    case "get_forecasts":
      sendCurrentForecasts(clientId);
      break;

    case "get_alerts":
      sendActiveAlerts(clientId);
      break;

    case "inject_data":
      // Allow clients to inject test data (admin only)
      if (payload.authLevel === "admin") {
        tacticalRealtimeEngine.injectData(payload.data);
      }
      break;

    case "configure":
      // Allow clients to update real-time engine configuration
      if (payload.authLevel === "admin") {
        configureEngine(payload.config);
      }
      break;

    case "ping":
      sendToClient(clientId, {
        type: "pong",
        timestamp: new Date().toISOString(),
      });
      break;

    default:
      sendToClient(clientId, {
        type: "error",
        message: `Unknown message type: ${type}`,
        timestamp: new Date().toISOString(),
      });
  }
}

/**
 * Handle subscription/unsubscription requests
 */
function handleSubscription(
  clientId: string,
  channels: string[],
  subscribe: boolean
) {
  channels.forEach(channel => {
    if (subscribe) {
      if (!subscriptions.has(channel)) {
        subscriptions.set(channel, new Set());
      }
      subscriptions.get(channel)!.add(clientId);
    } else {
      subscriptions.get(channel)?.delete(clientId);
      if (subscriptions.get(channel)?.size === 0) {
        subscriptions.delete(channel);
      }
    }
  });

  sendToClient(clientId, {
    type: "subscription_updated",
    action: subscribe ? "subscribed" : "unsubscribed",
    channels,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send current forecasts to client
 */
function sendCurrentForecasts(clientId: string) {
  const forecasts = tacticalRealtimeEngine.getCurrentForecasts();
  const forecastArray = Array.from(forecasts.values());

  sendToClient(clientId, {
    type: "current_forecasts",
    data: forecastArray,
    count: forecastArray.length,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send active alerts to client
 */
function sendActiveAlerts(clientId: string) {
  const alerts = tacticalRealtimeEngine.getActiveAlerts();

  sendToClient(clientId, {
    type: "active_alerts",
    data: alerts,
    count: alerts.length,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send initial data to newly connected client
 */
function sendInitialData(clientId: string) {
  // Send current forecasts
  sendCurrentForecasts(clientId);

  // Send active alerts
  sendActiveAlerts(clientId);

  // Send engine status
  sendToClient(clientId, {
    type: "engine_status",
    data: {
      status: "running",
      connected_clients: connections.size,
      active_subscriptions: Array.from(subscriptions.keys()),
      last_updated: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Configure real-time engine
 */
function configureEngine(config: any) {
  // Implementation would depend on your specific configuration needs
  console.log("Engine configuration update requested:", config);

  // Notify all connected clients about configuration change
  broadcastToAll({
    type: "engine_configured",
    config,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send data to specific client
 */
function sendToClient(clientId: string, data: any) {
  const socket = connections.get(clientId);
  if (socket && socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify(data));
    } catch (error) {
      console.error(`Error sending data to client ${clientId}:`, error);
      // Remove dead connection
      connections.delete(clientId);
    }
  }
}

/**
 * Broadcast data to all connected clients
 */
function broadcastToAll(data: any) {
  connections.forEach((socket, clientId) => {
    sendToClient(clientId, data);
  });
}

/**
 * Broadcast data to clients subscribed to specific channel
 */
function broadcastToChannel(channel: string, data: any) {
  const clientIds = subscriptions.get(channel);
  if (clientIds) {
    clientIds.forEach(clientId => {
      sendToClient(clientId, data);
    });
  }
}

/**
 * Generate unique client ID
 */
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate authentication token
 */
function isValidToken(token: string): boolean {
  // Implement proper token validation
  // For demo purposes, accept any non-empty token
  return token.length > 0;
}

// Start the real-time engine when the module loads
if (typeof window === "undefined") {
  // Server-side only
  tacticalRealtimeEngine.start().catch(console.error);

  // Set up periodic cleanup of dead connections
  setInterval(() => {
    connections.forEach((socket, clientId) => {
      if (socket.readyState === WebSocket.CLOSED) {
        connections.delete(clientId);

        // Clean up subscriptions
        subscriptions.forEach((clientIds, channel) => {
          clientIds.delete(clientId);
          if (clientIds.size === 0) {
            subscriptions.delete(channel);
          }
        });
      }
    });
  }, 30000); // Clean up every 30 seconds
}

// HTTP fallback for non-WebSocket requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      case "get_status":
        return Response.json({
          success: true,
          data: {
            engine_running: true,
            connected_clients: connections.size,
            active_channels: Array.from(subscriptions.keys()),
            websocket_endpoint: "/api/ws/tactical-realtime",
            supported_actions: [
              "subscribe",
              "unsubscribe",
              "get_forecasts",
              "get_alerts",
              "inject_data",
              "configure",
              "ping",
            ],
          },
        });

      case "inject_data":
        if (payload.authLevel === "admin") {
          await tacticalRealtimeEngine.injectData(payload.data);
          return Response.json({
            success: true,
            message: "Data injected successfully",
          });
        } else {
          return Response.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
          );
        }

      case "get_forecasts":
        const forecasts = Array.from(
          tacticalRealtimeEngine.getCurrentForecasts().values()
        );
        return Response.json({
          success: true,
          data: forecasts,
          count: forecasts.length,
        });

      case "get_alerts":
        const alerts = tacticalRealtimeEngine.getActiveAlerts();
        return Response.json({
          success: true,
          data: alerts,
          count: alerts.length,
        });

      default:
        return Response.json(
          {
            success: false,
            error: `Unsupported action: ${action}`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Real-time API error:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
        message: String(error),
      },
      { status: 500 }
    );
  }
}
