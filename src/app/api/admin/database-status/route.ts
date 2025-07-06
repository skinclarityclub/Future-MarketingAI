import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check which Marketing Machine tables exist
    const tablesToCheck = [
      "content_posts",
      "social_accounts",
      "content_calendar",
      "content_analytics",
      "content_research",
      "learning_patterns",
    ];

    const tableStatus = [];

    for (const tableName of tablesToCheck) {
      try {
        // Check if table exists and get row count
        const { data, error, count } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true });

        if (error) {
          tableStatus.push({
            table: tableName,
            exists: false,
            error: error.message,
            rowCount: 0,
          });
        } else {
          tableStatus.push({
            table: tableName,
            exists: true,
            rowCount: count || 0,
            error: null,
          });
        }
      } catch (err) {
        tableStatus.push({
          table: tableName,
          exists: false,
          error: err instanceof Error ? err.message : "Unknown error",
          rowCount: 0,
        });
      }
    }

    // Check for specific columns in existing tables
    const columnChecks = [];

    for (const table of tableStatus.filter(t => t.exists)) {
      try {
        // Get table structure
        const { data: structureData, error: structureError } =
          await supabase.rpc("get_table_structure", {
            table_name: table.table,
          });

        if (!structureError && structureData) {
          columnChecks.push({
            table: table.table,
            columns: structureData,
          });
        }
      } catch (err) {
        // Ignore column check errors for now
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        tables: tableStatus,
        summary: {
          totalTables: tablesToCheck.length,
          existingTables: tableStatus.filter(t => t.exists).length,
          missingTables: tableStatus.filter(t => !t.exists).length,
          totalRows: tableStatus.reduce((sum, t) => sum + t.rowCount, 0),
        },
        marketingMachineStatus: tableStatus.every(t => t.exists)
          ? "complete"
          : "incomplete",
      },
      message: "Database status checked successfully",
    });
  } catch (error) {
    console.error("Database status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
