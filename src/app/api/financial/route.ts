import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseFinancialSource } from "@/lib/assistant/data-sources/supabase-financial-source";

interface FinancialQueryParams {
  type?: string;
  metric_name?: string;
  startDate?: string;
  endDate?: string;
  limit?: string;
  category?: string;
  aggregation?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: FinancialQueryParams = {
      type: searchParams.get("type") || "general",
      metric_name: searchParams.get("metric_name") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      limit: searchParams.get("limit") || undefined,
      category: searchParams.get("category") || undefined,
      aggregation: searchParams.get("aggregation") || undefined,
    };

    // Validate query type
    const validTypes = ["metrics", "general", "analysis", "trends"];
    if (!validTypes.includes(params.type!)) {
      return NextResponse.json(
        {
          error: `Invalid query type. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Convert string limit to number
    const limit = params.limit ? parseInt(params.limit, 10) : undefined;

    // Build query for financial data source
    const query = {
      type: params.type as "metrics" | "general" | "analysis" | "trends",
      params: {
        metric_name: params.metric_name,
        startDate: params.startDate,
        endDate: params.endDate,
        limit,
        category: params.category,
        aggregation: params.aggregation as
          | "daily"
          | "weekly"
          | "monthly"
          | undefined,
      },
    };

    // Test connection first
    const connectionOk = await supabaseFinancialSource.testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: "Financial data source connection failed" },
        { status: 503 }
      );
    }

    // Fetch data using the enhanced data source
    const data = await supabaseFinancialSource.fetch(query);

    // Enhance response with metadata
    const response = {
      data,
      metadata: {
        count: data.length,
        query_type: params.type,
        parameters: query.params,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Financial API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch financial data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric_name, value, date, category, metadata } = body;

    // Validate required fields
    if (!metric_name || value === undefined || !date) {
      return NextResponse.json(
        { error: "Missing required fields: metric_name, value, date" },
        { status: 400 }
      );
    }

    // Create server client for database operations
    const supabase = await createClient();

    // Insert new financial data
    const { data, error } = await supabase
      .from("business_kpi_daily")
      .insert([
        {
          metric_name,
          value: parseFloat(value),
          date: new Date(date).toISOString().split("T")[0], // Format as YYYY-MM-DD
          category: category || "general",
          metadata: metadata || {},
        },
      ])
      .select();

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json(
        { error: "Failed to insert financial data", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: "Financial data inserted successfully",
    });
  } catch (error) {
    console.error("Financial POST API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process financial data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, metric_name, value, date, category, metadata } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    // Create server client for database operations
    const supabase = await createClient();

    // Build update object
    const updateData: any = {};
    if (metric_name) updateData.metric_name = metric_name;
    if (value !== undefined) updateData.value = parseFloat(value);
    if (date) updateData.date = new Date(date).toISOString().split("T")[0];
    if (category) updateData.category = category;
    if (metadata) updateData.metadata = metadata;

    // Update financial data
    const { data, error } = await supabase
      .from("business_kpi_daily")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Failed to update financial data", details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Financial record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: "Financial data updated successfully",
    });
  } catch (error) {
    console.error("Financial PUT API error:", error);
    return NextResponse.json(
      {
        error: "Failed to update financial data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    // Create server client for database operations
    const supabase = await createClient();

    // Delete financial data
    const { error } = await supabase
      .from("business_kpi_daily")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete financial data", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Financial data deleted successfully",
    });
  } catch (error) {
    console.error("Financial DELETE API error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete financial data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
