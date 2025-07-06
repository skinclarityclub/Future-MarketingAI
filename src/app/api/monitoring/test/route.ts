import { NextResponse } from "next/server";
import {
  monitoringService,
  createHealthMetric,
  createDataQualityIndicator,
} from "@/lib/services/monitoring-service";

export async function GET() {
  try {
    console.log("Testing monitoring database connection...");

    // Test 1: Record a health metric
    const healthMetric = createHealthMetric(
      "test_service",
      "response_time",
      250.5,
      "milliseconds",
      { max: 1000 }
    );

    const recordedMetric =
      await monitoringService.recordHealthMetric(healthMetric);
    console.log("✅ Health metric recorded:", recordedMetric.id);

    // Test 2: Record a data quality indicator
    const qualityIndicator = createDataQualityIndicator(
      "test_source",
      "test_table",
      "completeness",
      92.5,
      1000,
      925
    );

    const recordedIndicator =
      await monitoringService.recordDataQualityIndicator(qualityIndicator);
    console.log("✅ Data quality indicator recorded:", recordedIndicator.id);

    // Test 3: Get system health summary
    const healthSummary = await monitoringService.getSystemHealthSummary();
    console.log("✅ System health summary retrieved:", healthSummary);

    // Test 4: Get recent health metrics
    const recentMetrics = await monitoringService.getHealthMetrics(
      undefined,
      undefined,
      5
    );
    console.log(
      "✅ Recent metrics retrieved:",
      recentMetrics.length,
      "metrics"
    );

    // Test 5: Get data quality overview
    const qualityOverview = await monitoringService.getDataQualityOverview();
    console.log("✅ Data quality overview:", qualityOverview);

    return NextResponse.json({
      success: true,
      message: "All monitoring database tests passed! ✅",
      results: {
        healthMetricId: recordedMetric.id,
        qualityIndicatorId: recordedIndicator.id,
        systemStatus: healthSummary,
        recentMetricsCount: recentMetrics.length,
        qualityOverview,
      },
    });
  } catch (error) {
    console.error("❌ Monitoring test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Monitoring database test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log("Creating test alert...");

    // Test creating a system alert
    const alert = await monitoringService.createAlert({
      alert_type: "performance",
      severity: "medium",
      title: "Test Alert",
      description: "This is a test alert created via API",
      source_service: "test_service",
      alert_data: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    });

    console.log("✅ Test alert created:", alert.id);

    // Get active alerts
    const activeAlerts = await monitoringService.getActiveAlerts();

    return NextResponse.json({
      success: true,
      message: "Test alert created successfully! ✅",
      results: {
        alertId: alert.id,
        activeAlertsCount: activeAlerts.length,
      },
    });
  } catch (error) {
    console.error("❌ Alert test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Alert test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
