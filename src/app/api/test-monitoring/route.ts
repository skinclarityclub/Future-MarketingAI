import { NextResponse } from "next/server";
import {
  serverMonitoring,
  recordPerformanceMetric,
  recordDataSourceQuality,
} from "@/lib/supabase/monitoring";

export async function GET() {
  const startTime = Date.now();

  try {
    console.log("Testing monitoring system integration...");

    // Test 1: Record a performance metric
    const performanceMetric = await recordPerformanceMetric(
      "api_test",
      "monitoring_test",
      120, // 120ms response time
      45 // 45MB memory usage
    );

    console.log("Performance metric recorded:", performanceMetric);

    // Test 2: Record data quality
    const dataQuality = await recordDataSourceQuality(
      "test_source",
      "test_table",
      100, // total records
      95 // valid records
    );

    console.log("Data quality recorded:", dataQuality);

    // Test 3: Get system health
    const systemHealth = await serverMonitoring.getSystemHealth();
    console.log("System health:", systemHealth);

    // Test 4: Get data quality overview
    const dataQualityOverview = await serverMonitoring.getDataQuality();
    console.log("Data quality overview:", dataQualityOverview);

    // Test 5: Get active alerts
    const activeAlerts = await serverMonitoring.getActiveAlerts();
    console.log("Active alerts:", activeAlerts);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: "Monitoring system integration test completed successfully",
      tests: {
        performance_metric: !!performanceMetric,
        data_quality: !!dataQuality,
        system_health: systemHealth,
        data_quality_overview: dataQualityOverview,
        active_alerts: activeAlerts,
      },
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Monitoring test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  const startTime = Date.now();

  try {
    // Test creating a manual alert
    const testAlert = await serverMonitoring.createAlert({
      alert_type: "performance",
      severity: "medium",
      title: "Test Alert - API Monitoring",
      description:
        "This is a test alert to verify the monitoring system works correctly",
      source_service: "api_test",
      metadata: {
        test: true,
        created_at: new Date().toISOString(),
        auto_resolve: false,
      },
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: "Test alert created successfully",
      alert: testAlert,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Alert creation test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
