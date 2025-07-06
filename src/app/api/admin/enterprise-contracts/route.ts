// @ts-nocheck
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Enterprise Contract Management API
 * Task 36.6: Enterprise Contract Management System
 * Handles CRUD operations for Fortune 500 enterprise contracts
 */

// Create Supabase client
async function createClient() {
  const cookieStore = await cookies();

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

// GET: List all enterprise contracts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    let query = supabase
      .from("enterprise_contracts")
      .select("*")
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: contracts, error } = await query;

    if (error) {
      console.error("Error fetching contracts:", error);
      return NextResponse.json(
        { error: "Failed to fetch contracts", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contracts || [],
      meta: {
        total_contracts: contracts?.length || 0,
        active_contracts:
          contracts?.filter((c: any) => c.status === "active").length || 0,
        pending_renewal: 0,
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

// POST: Create new enterprise contract
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const requiredFields = [
      "tenant_id",
      "contract_name",
      "annual_contract_value",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const contractNumber = `ENT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const contractData = {
      ...body,
      contract_number: contractNumber,
      status: "draft",
    };

    const { data: contract, error } = await supabase
      .from("enterprise_contracts")
      .insert(contractData)
      .select()
      .single();

    if (error) {
      console.error("Error creating contract:", error);
      return NextResponse.json(
        { error: "Failed to create contract", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contract,
      message: "Enterprise contract created successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update existing contract
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Contract ID required for update" },
        { status: 400 }
      );
    }

    const { id, ...updateData } = body;

    const { data: contract, error } = await supabase
      .from("enterprise_contracts")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
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
      data: contract,
      message: "Contract updated successfully",
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
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get("id");

    if (!contractId) {
      return NextResponse.json(
        { error: "Contract ID required for deletion" },
        { status: 400 }
      );
    }

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
