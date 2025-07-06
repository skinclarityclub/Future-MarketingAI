import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/error-handling/error-config";

interface ErrorMetric {
  timestamp: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  count: number;
  resolved: number;
  escalated: boolean;
}

interface TrendData {
  time: string;
  errors: number;
  resolved: number;
  critical: number;
  escalated: number;
}

interface AnalyticsStats {
  totalErrors: number;
  resolvedErrors: number;
  criticalErrors: number;
  escalatedErrors: number;
  resolutionRate: number;
  avgResponseTime: number;
}

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would fetch from database
    // For now, we'll generate mock data based on current time
    const mockMetrics = generateRealtimeMetrics();
    const mockTrends = generateTrendData();
    const stats = calculateStats(mockMetrics);

    const response = {
      metrics: mockMetrics,
      trends: mockTrends,
      stats,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    logError(error as Error, "analytics-api", "API_ERROR");

    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        metrics: [],
        trends: [],
        stats: {
          totalErrors: 0,
          resolvedErrors: 0,
          criticalErrors: 0,
          escalatedErrors: 0,
          resolutionRate: 0,
          avgResponseTime: 0,
        },
      },
      { status: 500 }
    );
  }
}

function generateRealtimeMetrics(): ErrorMetric[] {
  const categories = [
    "API_ERROR",
    "SYSTEM_ERROR",
    "VALIDATION_ERROR",
    "DATABASE_ERROR",
    "NETWORK_ERROR",
  ];
  const severities: Array<"low" | "medium" | "high" | "critical"> = [
    "low",
    "medium",
    "high",
    "critical",
  ];

  const metrics: ErrorMetric[] = [];
  const now = new Date();

  // Generate last 5 error events
  for (let i = 0; i < 5; i++) {
    const timestamp = new Date(now.getTime() - i * 60000); // Each minute apart
    const category = categories[Math.floor(Math.random() * categories.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const count = Math.floor(Math.random() * 20) + 1;
    const resolved = Math.floor(count * (0.6 + Math.random() * 0.3)); // 60-90% resolution rate
    const escalated =
      severity === "critical" || (severity === "high" && Math.random() > 0.7);

    metrics.push({
      timestamp: timestamp.toISOString(),
      category,
      severity,
      count,
      resolved,
      escalated,
    });
  }

  return metrics.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function generateTrendData(): TrendData[] {
  const data: TrendData[] = [];
  const now = new Date();

  // Generate 24 hours of trend data
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseErrors = 20 + Math.floor(Math.random() * 30);
    const errors = Math.max(0, baseErrors + Math.floor(Math.sin(i * 0.3) * 10)); // Add some wave pattern
    const resolved = Math.floor(errors * (0.7 + Math.random() * 0.2)); // 70-90% resolution
    const critical = Math.floor(errors * 0.1 + Math.random() * 5); // ~10% critical
    const escalated = Math.floor(critical * 0.8 + Math.random() * 3); // Most critical get escalated

    data.push({
      time: time.getHours().toString().padStart(2, "0") + ":00",
      errors,
      resolved,
      critical,
      escalated,
    });
  }

  return data;
}

function calculateStats(metrics: ErrorMetric[]): AnalyticsStats {
  const totalErrors = metrics.reduce((sum, m) => sum + m.count, 0);
  const resolvedErrors = metrics.reduce((sum, m) => sum + m.resolved, 0);
  const criticalErrors = metrics
    .filter(m => m.severity === "critical")
    .reduce((sum, m) => sum + m.count, 0);
  const escalatedErrors = metrics
    .filter(m => m.escalated)
    .reduce((sum, m) => sum + m.count, 0);

  const resolutionRate =
    totalErrors > 0 ? Math.round((resolvedErrors / totalErrors) * 100) : 100;
  const avgResponseTime = 120 + Math.floor(Math.random() * 180); // 2-5 minutes response time

  return {
    totalErrors,
    resolvedErrors,
    criticalErrors,
    escalatedErrors,
    resolutionRate,
    avgResponseTime,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "acknowledge":
        // Handle error acknowledgment
        return NextResponse.json({
          success: true,
          message: "Error acknowledged",
        });

      case "resolve":
        // Handle error resolution
        return NextResponse.json({
          success: true,
          message: "Error marked as resolved",
        });

      case "escalate":
        // Handle manual escalation
        return NextResponse.json({ success: true, message: "Error escalated" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    logError(error as Error, "analytics-api-post", "API_ERROR");
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
