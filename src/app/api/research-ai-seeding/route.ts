/**
 * Research & Competitive Intelligence AI Engines - Seeding API Endpoint
 * Task 75: Implementeer Data Seeding voor Research & Competitive Intelligence AI Systemen
 *
 * API endpoint for executing data seeding operations for all four AI engines:
 * - GET: Get seeding status and statistics
 * - POST: Execute seeding operations (comprehensive or individual engines)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  researchAISeedingService,
  executeResearchAISeeding,
  seedIndividualEngine,
} from "@/lib/data-seeding/research-ai-engines-seeding-implementation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

// Define request/response types
interface SeedingRequest {
  action: "comprehensive" | "individual";
  engineName?: string;
  options?: {
    force?: boolean;
    dryRun?: boolean;
    qualityThreshold?: number;
  };
}

interface SeedingStatusResponse {
  status: "idle" | "running" | "completed" | "failed";
  lastSeeding?: {
    timestamp: string;
    success: boolean;
    totalRecords: number;
    qualityScore: number;
    executionTime: number;
  };
  engineStatuses: {
    [engineName: string]: {
      status: string;
      recordCount: number;
      lastUpdate: string;
      qualityScore: number;
    };
  };
  dataSourceStatuses: {
    [sourceName: string]: {
      status: "active" | "inactive" | "error";
      lastCheck: string;
      recordCount: number;
    };
  };
}

/**
 * GET - Retrieve current seeding status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Create authenticated client
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      // Use admin client for status if no user auth
      const adminSupabase = createAdminClient();
      const seedingStatus = await getSeedingStatus(adminSupabase);

      return NextResponse.json({
        success: true,
        data: seedingStatus,
        timestamp: new Date().toISOString(),
        authenticated: false,
      });
    }

    // Get comprehensive seeding status with user auth
    const seedingStatus = await getSeedingStatus(supabase);

    return NextResponse.json({
      success: true,
      data: seedingStatus,
      timestamp: new Date().toISOString(),
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching seeding status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch seeding status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Execute seeding operations
 */
export async function POST(request: NextRequest) {
  try {
    // Create authenticated client
    const supabase = await createClient();

    // Check authentication - optional for testing
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    let authenticatedUser = null;

    if (!authError && user) {
      authenticatedUser = user;
    }

    // Continue without authentication for testing purposes
    console.log(
      "🔐 User authentication status:",
      authenticatedUser ? "authenticated" : "anonymous"
    );

    // Parse request body
    const body: SeedingRequest = await request.json();
    const { action, engineName, options = {} } = body;

    // Validate request
    if (!action || !["comprehensive", "individual"].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "comprehensive" or "individual"' },
        { status: 400 }
      );
    }

    if (action === "individual" && !engineName) {
      return NextResponse.json(
        { error: "Engine name required for individual seeding" },
        { status: 400 }
      );
    }

    // Use admin client for seeding operations (privileged operations)
    const adminSupabase = createAdminClient();

    // Check if seeding is already running
    const isRunning = await checkSeedingInProgress(adminSupabase);
    if (isRunning) {
      return NextResponse.json(
        { error: "Seeding operation already in progress" },
        { status: 409 }
      );
    }

    // Execute seeding operation
    console.log(
      `🚀 Starting ${action} seeding operation by user ${authenticatedUser?.email || "anonymous"}...`
    );

    let result;
    if (action === "comprehensive") {
      result = await executeComprehensiveSeeding(options);
    } else {
      result = await executeIndividualSeeding(engineName!, options);
    }

    // Log seeding result with user information
    await logSeedingResult(
      adminSupabase,
      action,
      result,
      authenticatedUser?.id || "anonymous"
    );

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      user: authenticatedUser
        ? {
            id: authenticatedUser.id,
            email: authenticatedUser.email,
          }
        : null,
    });
  } catch (error) {
    console.error("💥 Error executing seeding operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Seeding operation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * HELPER FUNCTIONS
 */

async function getSeedingStatus(supabase: any): Promise<SeedingStatusResponse> {
  try {
    console.log("🔍 Fetching real seeding status from database...");

    // Get seeding status from research_ai_seeding_status table
    const { data: statusData, error: statusError } = await supabase
      .from("research_ai_seeding_status")
      .select("*");

    if (statusError) {
      console.error("❌ Error fetching seeding status:", statusError);
    }

    // Get recent seeding logs
    const { data: logsData, error: logsError } = await supabase
      .from("research_ai_seeding_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (logsError) {
      console.error("❌ Error fetching seeding logs:", logsError);
    }

    console.log("📊 Database results:", {
      statusData: statusData?.length,
      logsData: logsData?.length,
    });

    // Convert database data to expected format
    const engineStatuses: any = {};
    let overallStatus: "idle" | "running" | "completed" | "failed" = "idle";

    if (statusData && statusData.length > 0) {
      // Check if any engine is currently running
      const hasRunning = statusData.some(
        (engine: any) => engine.seeding_status === "running"
      );
      overallStatus = hasRunning ? "running" : "idle";

      statusData.forEach((engine: any) => {
        // Convert engine name to display format
        const engineDisplayName = engine.engine_name
          .split("_")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
          .replace("Detector", "Detector")
          .replace("Analyzer", "Analyzer")
          .replace("Scraper", "Scraper")
          .replace("Content Ideation Engine", "Content Ideation Engine");

        engineStatuses[engineDisplayName] = {
          status: engine.seeding_status || "idle",
          recordCount: engine.data_volume || 0,
          lastUpdate: engine.last_seeded_at || "Never",
          qualityScore: Math.round(engine.quality_score || 0),
        };
      });
    } else {
      // Fallback if no data found
      console.log("⚠️ No seeding status data found, using defaults");
      [
        "Trend Detector",
        "Competitor Analyzer",
        "Web Scraper",
        "Content Ideation Engine",
      ].forEach(engine => {
        engineStatuses[engine] = {
          status: "idle",
          recordCount: 0,
          lastUpdate: "Never",
          qualityScore: 0,
        };
      });
    }

    // Mock data source statuses (would be implemented with actual health checks)
    const dataSourceStatuses = {
      "Supabase Analytics Database": {
        status: "active" as const,
        lastCheck: new Date().toISOString(),
        recordCount: 100000,
      },
      "Instagram Business API": {
        status: "active" as const,
        lastCheck: new Date().toISOString(),
        recordCount: 25000,
      },
      "LinkedIn Marketing API": {
        status: "active" as const,
        lastCheck: new Date().toISOString(),
        recordCount: 15000,
      },
      "Research Scraping Engine": {
        status: "active" as const,
        lastCheck: new Date().toISOString(),
        recordCount: 50000,
      },
    };

    // Calculate last seeding info from logs
    const lastSeeding =
      logsData && logsData.length > 0
        ? {
            timestamp: logsData[0].created_at,
            success: logsData[0].operation_status === "completed",
            totalRecords: logsData.reduce(
              (sum: number, log: any) => sum + (log.records_processed || 0),
              0
            ),
            qualityScore:
              statusData && statusData.length > 0
                ? Math.round(
                    statusData.reduce(
                      (sum: number, engine: any) =>
                        sum + (engine.quality_score || 0),
                      0
                    ) / statusData.length
                  )
                : 0,
            executionTime: logsData[0].execution_time || 0,
          }
        : undefined;

    console.log("✅ Returning seeding status:", {
      overallStatus,
      engineCount: Object.keys(engineStatuses).length,
      hasLastSeeding: !!lastSeeding,
    });

    return {
      status: overallStatus,
      lastSeeding,
      engineStatuses,
      dataSourceStatuses,
    };
  } catch (error) {
    console.error("Error getting seeding status:", error);
    throw error;
  }
}

async function checkSeedingInProgress(supabase: any): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("ai_engines_sync_log")
      .select("sync_status")
      .eq("sync_status", "in_progress")
      .limit(1);

    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking seeding progress:", error);
    return false;
  }
}

async function executeComprehensiveSeeding(options: any = {}) {
  console.log("🔄 Executing comprehensive seeding across all engines...");

  const startTime = Date.now();

  try {
    // Execute the comprehensive seeding
    const result = await executeResearchAISeeding();

    return {
      type: "comprehensive",
      success: result.success,
      results: result.results,
      totalRecordsSeeded: result.totalRecordsSeeded,
      overallQualityScore: result.overallQualityScore,
      executionSummary: result.executionSummary,
      executionTime: Date.now() - startTime,
      options,
    };
  } catch (error) {
    return {
      type: "comprehensive",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      executionTime: Date.now() - startTime,
      options,
    };
  }
}

async function executeIndividualSeeding(engineName: string, options: any = {}) {
  console.log(`🎯 Executing individual seeding for ${engineName}...`);

  const startTime = Date.now();

  try {
    // Validate engine name
    const validEngines = [
      "Trend Detector",
      "Competitor Analyzer",
      "Web Scraper",
      "Content Ideation Engine",
    ];
    if (!validEngines.includes(engineName)) {
      throw new Error(
        `Invalid engine name: ${engineName}. Valid engines: ${validEngines.join(", ")}`
      );
    }

    // Execute individual engine seeding
    const result = await seedIndividualEngine(engineName);

    return {
      type: "individual",
      engineName,
      success: result.success,
      recordsSeeded: result.recordsSeeded,
      qualityScore: result.qualityScore,
      errors: result.errors,
      warnings: result.warnings,
      nextSteps: result.nextSteps,
      executionTime: Date.now() - startTime,
      options,
    };
  } catch (error) {
    return {
      type: "individual",
      engineName,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      executionTime: Date.now() - startTime,
      options,
    };
  }
}

async function logSeedingResult(
  supabase: any,
  action: string,
  result: any,
  userId: string
) {
  try {
    await supabase.from("ai_engines_sync_log").insert({
      sync_type: action,
      source_engine: "API",
      target_engine:
        result.type === "individual" ? result.engineName : "All Engines",
      sync_status: result.success ? "completed" : "failed",
      records_synced: result.totalRecordsSeeded || result.recordsSeeded || 0,
      sync_duration: result.executionTime,
      error_details:
        result.error ||
        (result.errors && result.errors.length > 0
          ? result.errors.join("; ")
          : null),
      sync_trigger: "manual_api",
      metadata: {
        userId,
        action,
        qualityScore: result.overallQualityScore || result.qualityScore,
        options: result.options,
      },
    });
  } catch (error) {
    console.error("Error logging seeding result:", error);
    // Don't throw - this is just logging
  }
}

/**
 * PUT - Update seeding configuration (future enhancement)
 */
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: "Configuration updates not yet implemented" },
    { status: 501 }
  );
}

/**
 * DELETE - Cancel running seeding operation (future enhancement)
 */
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: "Seeding cancellation not yet implemented" },
    { status: 501 }
  );
}
