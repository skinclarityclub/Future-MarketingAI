// @ts-nocheck
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Enterprise Contract Detail API
 * Task 36.6: Single contract operations (GET, PUT, DELETE)
 */

// Create Supabase client
function createClient() {
  const cookieStore = cookies() as any;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET: Fetch single contract with full details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const { id: contractId } = await params;

    // Fetch basic contract data
    const { data: contract, error } = await supabase
      .from("enterprise_contracts")
      .select("*")
      .eq("id", contractId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Contract not found" },
          { status: 404 }
        );
      }

      console.error("Error fetching contract:", error);
      return NextResponse.json(
        { error: "Failed to fetch contract", details: error.message },
        { status: 500 }
      );
    }

    // Basic analytics placeholder
    const analytics = {
      total_milestones: 0,
      completed_milestones: 0,
      overdue_milestones: 0,
      total_invoiced: 0,
      total_paid: 0,
      outstanding_amount: 0,
      avg_uptime: null,
      avg_csat: null,
      days_active: 0,
      days_remaining: 0,
      contract_progress: 0,
      risk_factors: [],
      overall_health_score: 0.8,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...contract,
        analytics,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update specific contract
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id: contractId } = await params;
  try {
    const supabase = createClient();
    const updates = await request.json();

    const { data, error } = await supabase
      .from("enterprise_contracts")
      .update(updates)
      .eq("id", contractId)
      .select()
      .single();

    if (error) {
      console.error("Error updating contract:", error);
      return NextResponse.json(
        { error: "Failed to update contract", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove contract
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const { id: contractId } = await params;

    const { error } = await supabase
      .from("enterprise_contracts")
      .delete()
      .eq("id", contractId);

    if (error) {
      console.error("Error deleting contract:", error);
      return NextResponse.json(
        { error: "Failed to delete contract", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contract deleted successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
