/**
 * Navigation Integration Usage Example
 * Task 74.4: Complete implementation example
 */

import {
  SupabaseNavigationIntegration,
  createNavigationIntegration,
} from "./supabase-navigation-integration";
import {
  DATA_RETENTION_CONFIG,
  calculateOptimalTier,
} from "./supabase-optimization-config";

// =====================================================
// INITIALIZATION
// =====================================================

export async function initializeNavigationSystem() {
  // Create navigation integration instance
  const integration = createNavigationIntegration("production");

  // Enable real-time monitoring
  integration.enableRealtimeMonitoring({
    onUserEvent: payload => {
      console.log("New user event:", payload);
      // Process real-time user events
    },
    onPerformanceAlert: payload => {
      console.log("Performance alert:", payload);
      // Handle performance degradation
    },
  });

  return integration;
}

// =====================================================
// DATA COLLECTION EXAMPLES
// =====================================================

export async function trackUserActivity(
  integration: SupabaseNavigationIntegration
) {
  // Example user events
  const userEvents = [
    {
      session_id: "session_123",
      user_id: "user_456",
      event_type: "page_view" as const,
      page_url: "/dashboard",
      page_title: "Analytics Dashboard",
      viewport_width: 1920,
      viewport_height: 1080,
      referrer_url: "/login",
      custom_properties: {
        utm_source: "google",
        utm_medium: "organic",
      },
    },
    {
      session_id: "session_123",
      user_id: "user_456",
      event_type: "click" as const,
      page_url: "/dashboard",
      element_selector: ".chart-filter-button",
      element_text: "Last 30 Days",
    },
  ];

  // Batch insert events
  const result = await integration.batchInsertUserEvents(userEvents);
  console.log("Inserted events:", result);

  return result;
}

export async function trackPerformanceMetrics(
  integration: SupabaseNavigationIntegration
) {
  // Example performance metric
  const performanceData = {
    session_id: "session_123",
    user_id: "user_456",
    page_url: "/dashboard",
    largest_contentful_paint: 2100,
    first_input_delay: 85,
    cumulative_layout_shift: 0.08,
    performance_score: 92,
    resource_timings: {
      "dashboard.js": { loadTime: 450, size: 234567 },
      "chart-lib.js": { loadTime: 123, size: 45678 },
    },
  };

  const result = await integration.insertPerformanceMetric(performanceData);
  console.log("Performance metric inserted:", result);

  return result;
}

// =====================================================
// DATA RETRIEVAL EXAMPLES
// =====================================================

export async function getAnalyticsDashboard(
  integration: SupabaseNavigationIntegration
) {
  const dateRange = {
    from: "2025-01-01",
    to: "2025-01-31",
  };

  const analytics = await integration.getNavigationAnalytics(dateRange);

  return {
    userEngagement: analytics.userEngagement,
    performanceSummary: analytics.performanceSummary,
    popularPaths: analytics.popularPaths,
  };
}

export async function getUserJourneyAnalysis(
  integration: SupabaseNavigationIntegration
) {
  // Query user events for specific user
  const userEvents = await integration.queryUserEvents(
    {
      user_id: "user_456",
      date_from: "2025-01-01",
      date_to: "2025-01-31",
    },
    {
      limit: 1000,
      orderBy: "timestamp",
      orderDirection: "asc",
    }
  );

  return userEvents;
}

// =====================================================
// MAINTENANCE & OPTIMIZATION
// =====================================================

export async function performDailyMaintenance(
  integration: SupabaseNavigationIntegration
) {
  console.log("Starting daily maintenance...");

  // Perform data tiering
  const tieringResult = await integration.performDataTiering();
  console.log("Data tiering completed:", tieringResult);

  return {
    maintenance: "completed",
    tiering: tieringResult,
  };
}

export function calculateStorageCosts() {
  // Example usage calculation
  const currentUsage = {
    users: 15000,
    eventsPerDay: 150000,
    features: ["basic_analytics", "performance_monitoring", "ab_testing"],
  };

  const optimalTier = calculateOptimalTier(currentUsage);
  console.log("Recommended tier:", optimalTier);

  return optimalTier;
}

// =====================================================
// COMPLETE WORKFLOW EXAMPLE
// =====================================================

export async function runCompleteWorkflow() {
  try {
    // 1. Initialize system
    const integration = await initializeNavigationSystem();

    // 2. Track user activity
    await trackUserActivity(integration);

    // 3. Track performance
    await trackPerformanceMetrics(integration);

    // 4. Get analytics
    const analytics = await getAnalyticsDashboard(integration);
    console.log("Analytics data:", analytics);

    // 5. Perform maintenance
    await performDailyMaintenance(integration);

    // 6. Calculate costs
    const costAnalysis = calculateStorageCosts();
    console.log("Cost analysis:", costAnalysis);

    console.log("✅ Complete workflow executed successfully");

    return {
      success: true,
      analytics,
      costAnalysis,
    };
  } catch (error) {
    console.error("❌ Workflow failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  initializeNavigationSystem,
  trackUserActivity,
  trackPerformanceMetrics,
  getAnalyticsDashboard,
  getUserJourneyAnalysis,
  performDailyMaintenance,
  calculateStorageCosts,
  runCompleteWorkflow,
};
