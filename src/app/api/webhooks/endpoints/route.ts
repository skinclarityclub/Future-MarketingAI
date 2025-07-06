import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("webhook_endpoints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching webhook endpoints:", error);
      return NextResponse.json(
        { error: "Failed to fetch webhook endpoints" },
        { status: 500 }
      );
    }

    // Transform data to match frontend interface
    const endpoints =
      data?.map(endpoint => ({
        id: endpoint.id,
        name: endpoint.name,
        url: endpoint.url,
        method: endpoint.method,
        isActive: endpoint.is_active,
        lastTriggered: endpoint.last_triggered,
        triggerCount: endpoint.trigger_count || 0,
        successCount: endpoint.success_count || 0,
        errorCount: endpoint.error_count || 0,
        status: endpoint.is_active
          ? endpoint.error_count > endpoint.success_count
            ? "error"
            : "active"
          : "inactive",
      })) || [];

    return NextResponse.json(endpoints);
  } catch (error) {
    console.error("Error in webhook endpoints GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      url,
      method = "POST",
      isActive = true,
      security,
      triggers,
    } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("webhook_endpoints")
      .insert({
        name,
        url,
        method,
        is_active: isActive,
        security: security || { authentication: "none" },
        triggers: triggers || [],
        trigger_count: 0,
        success_count: 0,
        error_count: 0,
        response_mapping: {},
        error_handling: {
          retryAttempts: 3,
          retryDelay: 1000,
          fallbackAction: "log",
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating webhook endpoint:", error);
      return NextResponse.json(
        { error: "Failed to create webhook endpoint" },
        { status: 500 }
      );
    }

    // Transform response to match frontend interface
    const endpoint = {
      id: data.id,
      name: data.name,
      url: data.url,
      method: data.method,
      isActive: data.is_active,
      lastTriggered: data.last_triggered,
      triggerCount: data.trigger_count || 0,
      successCount: data.success_count || 0,
      errorCount: data.error_count || 0,
      status: data.is_active ? "active" : "inactive",
    };

    return NextResponse.json(endpoint, { status: 201 });
  } catch (error) {
    console.error("Error in webhook endpoints POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
