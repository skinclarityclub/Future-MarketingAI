/**
 * Customer Segmentation API Endpoint
 * Handles customer segmentation operations and analytics
 */

import { NextRequest, NextResponse } from "next/server";
import {
  customerSegmentation,
  PREDEFINED_SEGMENTS,
} from "@/lib/customer-intelligence/segmentation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "summary":
        return await getSegmentSummary();
      case "segments":
        return await getAllSegments();
      case "customers":
        const segmentName = searchParams.get("segment");
        if (!segmentName) {
          return NextResponse.json(
            { error: "Missing segment parameter" },
            { status: 400 }
          );
        }
        return await getCustomersInSegment(segmentName);
      case "metrics":
        const metricSegment = searchParams.get("segment");
        if (!metricSegment) {
          return NextResponse.json(
            { error: "Missing segment parameter" },
            { status: 400 }
          );
        }
        return await getSegmentMetrics(metricSegment);
      case "predefined":
        return await getPredefinedSegments();
      default:
        return await getSegmentSummary();
    }
  } catch (error) {
    console.error("Segmentation GET API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch segmentation data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    switch (action) {
      case "apply-all":
        return await applyAllSegments();
      case "apply-segment":
        return await applySpecificSegment(body);
      case "create-custom":
        return await createCustomSegment(body);
      case "remove-segment":
        return await removeSegment(body);
      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Segmentation POST API Error:", error);
    return NextResponse.json(
      { error: "Failed to process segmentation request" },
      { status: 500 }
    );
  }
}

/**
 * Get segment summary with customer counts
 */
async function getSegmentSummary() {
  try {
    const summary = await customerSegmentation.getSegmentSummary();

    return NextResponse.json({
      success: true,
      data: summary,
      meta: {
        action: "segment_summary",
        total_segments: summary.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting segment summary:", error);
    return NextResponse.json(
      { error: "Failed to get segment summary" },
      { status: 500 }
    );
  }
}

/**
 * Get all active segments with detailed information
 */
async function getAllSegments() {
  try {
    const summary = await customerSegmentation.getSegmentSummary();

    // Enhance with predefined segment information
    const enhancedSegments = summary.map(segment => {
      const predefinedSegment = PREDEFINED_SEGMENTS.find(
        ps => ps.name === segment.segment_name
      );

      return {
        ...segment,
        criteria: predefinedSegment?.criteria,
        description: predefinedSegment?.description || segment.description,
        is_predefined: !!predefinedSegment,
      };
    });

    return NextResponse.json({
      success: true,
      data: enhancedSegments,
      meta: {
        action: "all_segments",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting all segments:", error);
    return NextResponse.json(
      { error: "Failed to get segments" },
      { status: 500 }
    );
  }
}

/**
 * Get customers in a specific segment
 */
async function getCustomersInSegment(segmentName: string) {
  try {
    const customers =
      await customerSegmentation.getCustomersInSegment(segmentName);

    return NextResponse.json({
      success: true,
      data: {
        segment_name: segmentName,
        customer_count: customers.length,
        customers: customers.map(customer => ({
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          total_lifetime_value: customer.total_lifetime_value,
          total_orders: customer.total_orders,
          customer_status: customer.customer_status,
          churn_risk_score: customer.churn_risk_score,
          acquisition_source: customer.acquisition_source,
          last_purchase_date: customer.last_purchase_date,
        })),
      },
      meta: {
        action: "customers_in_segment",
        segment: segmentName,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting customers in segment:", error);
    return NextResponse.json(
      { error: "Failed to get customers in segment" },
      { status: 500 }
    );
  }
}

/**
 * Get metrics for a specific segment
 */
async function getSegmentMetrics(segmentName: string) {
  try {
    const metrics = await customerSegmentation.getSegmentMetrics(segmentName);

    return NextResponse.json({
      success: true,
      data: {
        segment_name: segmentName,
        metrics,
      },
      meta: {
        action: "segment_metrics",
        segment: segmentName,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting segment metrics:", error);
    return NextResponse.json(
      { error: "Failed to get segment metrics" },
      { status: 500 }
    );
  }
}

/**
 * Get predefined segment definitions
 */
async function getPredefinedSegments() {
  try {
    return NextResponse.json({
      success: true,
      data: PREDEFINED_SEGMENTS,
      meta: {
        action: "predefined_segments",
        count: PREDEFINED_SEGMENTS.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting predefined segments:", error);
    return NextResponse.json(
      { error: "Failed to get predefined segments" },
      { status: 500 }
    );
  }
}

/**
 * Apply all predefined segments to customers
 */
async function applyAllSegments() {
  try {
    const results = await customerSegmentation.applyAllSegments();

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        action: "apply_all_segments",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error applying all segments:", error);
    return NextResponse.json(
      { error: "Failed to apply all segments" },
      { status: 500 }
    );
  }
}

/**
 * Apply a specific segment to customers
 */
async function applySpecificSegment(body: any) {
  try {
    const { segment_definition } = body;

    if (!segment_definition) {
      return NextResponse.json(
        { error: "Missing segment_definition" },
        { status: 400 }
      );
    }

    const customerIds =
      await customerSegmentation.applySegment(segment_definition);

    return NextResponse.json({
      success: true,
      data: {
        segment_name: segment_definition.name,
        customers_assigned: customerIds.length,
        customer_ids: customerIds,
      },
      meta: {
        action: "apply_specific_segment",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error applying specific segment:", error);
    return NextResponse.json(
      { error: "Failed to apply segment" },
      { status: 500 }
    );
  }
}

/**
 * Create a custom segment
 */
async function createCustomSegment(body: any) {
  try {
    const { segment_definition } = body;

    if (
      !segment_definition ||
      !segment_definition.name ||
      !segment_definition.type ||
      !segment_definition.criteria
    ) {
      return NextResponse.json(
        { error: "Invalid segment definition. Required: name, type, criteria" },
        { status: 400 }
      );
    }

    const customerIds =
      await customerSegmentation.createCustomSegment(segment_definition);

    return NextResponse.json({
      success: true,
      data: {
        segment_name: segment_definition.name,
        segment_type: segment_definition.type,
        customers_assigned: customerIds.length,
        customer_ids: customerIds,
      },
      meta: {
        action: "create_custom_segment",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating custom segment:", error);
    return NextResponse.json(
      { error: "Failed to create custom segment" },
      { status: 500 }
    );
  }
}

/**
 * Remove/deactivate a segment
 */
async function removeSegment(body: any) {
  try {
    const { segment_name } = body;

    if (!segment_name) {
      return NextResponse.json(
        { error: "Missing segment_name" },
        { status: 400 }
      );
    }

    const success = await customerSegmentation.removeSegment(segment_name);

    return NextResponse.json({
      success,
      data: {
        segment_name,
        removed: success,
      },
      meta: {
        action: "remove_segment",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error removing segment:", error);
    return NextResponse.json(
      { error: "Failed to remove segment" },
      { status: 500 }
    );
  }
}
