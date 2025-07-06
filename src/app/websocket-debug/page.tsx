"use client";

import React, { useEffect, useState } from "react";
import { navigationWebSocketService } from "@/lib/realtime/navigation-websocket-service";

export default function WebSocketDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<any[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const addError = (error: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setErrors(prev => [...prev, { timestamp, error }]);
  };

  useEffect(() => {
    addLog("Starting WebSocket debug session...");

    // Subscribe to WebSocket errors
    const unsubscribeError = navigationWebSocketService.onWebSocketError(
      error => {
        addLog(`WebSocket Error Received: ${error.type}`);
        addError(error);
      }
    );

    // Subscribe to connection state
    const unsubscribeConnection =
      navigationWebSocketService.onConnectionStateChange(connected => {
        addLog(`Connection state: ${connected ? "Connected" : "Disconnected"}`);
      });

    return () => {
      unsubscribeError();
      unsubscribeConnection();
    };
  }, []);

  const handleTestConnection = async () => {
    addLog("Testing WebSocket connection...");
    try {
      await navigationWebSocketService.connect(
        `debug-${Date.now()}`,
        "debug-user"
      );
      addLog("Connection attempt completed");
    } catch (error) {
      addLog(`Connection failed: ${error}`);
      addError(error);
    }
  };

  const handleForceError = () => {
    addLog("Forcing WebSocket error for testing...");
    // Try to connect to a non-existent endpoint to trigger an error
    try {
      const ws = new WebSocket("ws://localhost:9999/non-existent");
      ws.onerror = event => {
        addLog("Test WebSocket error triggered");
        // Manually trigger our error handler for testing
        const errorDetails = {
          type: event.type,
          target: event.target
            ? {
                readyState: (event.target as WebSocket).readyState,
                url: (event.target as WebSocket).url,
              }
            : null,
          timestamp: new Date().toISOString(),
        };
        addError(errorDetails);
      };
    } catch (error) {
      addLog(`Force error test: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">WebSocket Debug Page</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Controls</h2>
        <div className="space-x-4">
          <button
            onClick={handleTestConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Test WebSocket Connection
          </button>
          <button
            onClick={handleForceError}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Force WebSocket Error
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
        <div className="bg-gray-50 rounded p-4 max-h-60 overflow-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-sm font-mono mb-1">
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">WebSocket Errors</h2>
        {errors.length > 0 ? (
          <div className="space-y-4">
            {errors.map((errorInfo, index) => (
              <div
                key={index}
                className="bg-red-50 border border-red-200 rounded p-4"
              >
                <div className="font-semibold mb-2">
                  Error #{index + 1} - {errorInfo.timestamp}
                </div>
                <pre className="text-sm bg-white p-3 rounded overflow-auto">
                  {JSON.stringify(errorInfo.error, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No errors captured yet</div>
        )}
      </div>
    </div>
  );
}
