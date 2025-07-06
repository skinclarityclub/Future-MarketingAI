/**
 * Customer Data Ingestion API Endpoint
 * Handles data ingestion from multiple sources (Shopify, Kajabi, Social Media)
 */

import { NextRequest, NextResponse } from "next/server";
import { customerDataIngestion } from "@/lib/customer-intelligence/data-ingestion";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    switch (action) {
      case "shopify":
        return await ingestShopifyData(body);
      case "kajabi":
        return await ingestKajabiData(body);
      case "social":
        return await linkSocialProfile(body);
      case "bulk":
        return await bulkImport(body);
      case "churn-risk":
        return await calculateChurnRisk(body);
      case "touchpoint":
        return await recordTouchpoint(body);
      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Data Ingestion API Error:", error);
    return NextResponse.json(
      { error: "Failed to process data ingestion request" },
      { status: 500 }
    );
  }
}

/**
 * Ingest Shopify customer data
 */
async function ingestShopifyData(body: any) {
  try {
    const { customers } = body;

    if (!customers || !Array.isArray(customers)) {
      return NextResponse.json(
        { error: "Invalid customers data provided" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const customerData of customers) {
      try {
        const customerId =
          await customerDataIngestion.ingestShopifyCustomer(customerData);
        if (customerId) {
          results.push({
            shopify_id: customerData.id,
            customer_id: customerId,
          });
        } else {
          errors.push(`Failed to ingest customer: ${customerData.email}`);
        }
      } catch (error) {
        errors.push(`Error processing ${customerData.email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: results.length,
        customers: results,
        errors,
      },
      meta: {
        action: "shopify_ingestion",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Shopify ingestion error:", error);
    return NextResponse.json(
      { error: "Failed to ingest Shopify data" },
      { status: 500 }
    );
  }
}

/**
 * Ingest Kajabi customer data
 */
async function ingestKajabiData(body: any) {
  try {
    const { customers } = body;

    if (!customers || !Array.isArray(customers)) {
      return NextResponse.json(
        { error: "Invalid customers data provided" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const customerData of customers) {
      try {
        const customerId =
          await customerDataIngestion.ingestKajabiCustomer(customerData);
        if (customerId) {
          results.push({ kajabi_id: customerData.id, customer_id: customerId });
        } else {
          errors.push(`Failed to ingest customer: ${customerData.email}`);
        }
      } catch (error) {
        errors.push(`Error processing ${customerData.email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: results.length,
        customers: results,
        errors,
      },
      meta: {
        action: "kajabi_ingestion",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Kajabi ingestion error:", error);
    return NextResponse.json(
      { error: "Failed to ingest Kajabi data" },
      { status: 500 }
    );
  }
}

/**
 * Link social media profile to customer
 */
async function linkSocialProfile(body: any) {
  try {
    const { customer_id, social_profile } = body;

    if (!customer_id || !social_profile) {
      return NextResponse.json(
        { error: "Missing customer_id or social_profile data" },
        { status: 400 }
      );
    }

    const success = await customerDataIngestion.linkSocialProfile(
      customer_id,
      social_profile
    );

    return NextResponse.json({
      success,
      data: {
        customer_id,
        platform: social_profile.platform,
        linked: success,
      },
      meta: {
        action: "social_linking",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Social profile linking error:", error);
    return NextResponse.json(
      { error: "Failed to link social profile" },
      { status: 500 }
    );
  }
}

/**
 * Bulk import from multiple sources
 */
async function bulkImport(body: any) {
  try {
    const { shopifyCustomers, kajabiCustomers } = body;

    if (!shopifyCustomers && !kajabiCustomers) {
      return NextResponse.json(
        { error: "No customer data provided for bulk import" },
        { status: 400 }
      );
    }

    const results = await customerDataIngestion.bulkImport({
      shopifyCustomers,
      kajabiCustomers,
    });

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        action: "bulk_import",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk import" },
      { status: 500 }
    );
  }
}

/**
 * Calculate churn risk for a customer
 */
async function calculateChurnRisk(body: any) {
  try {
    const { customer_id } = body;

    if (!customer_id) {
      return NextResponse.json(
        { error: "Missing customer_id" },
        { status: 400 }
      );
    }

    const churnRisk =
      await customerDataIngestion.calculateChurnRisk(customer_id);

    return NextResponse.json({
      success: true,
      data: {
        customer_id,
        churn_risk_score: churnRisk,
        risk_level:
          churnRisk >= 0.7 ? "high" : churnRisk >= 0.4 ? "medium" : "low",
      },
      meta: {
        action: "churn_risk_calculation",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Churn risk calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate churn risk" },
      { status: 500 }
    );
  }
}

/**
 * Record customer touchpoint
 */
async function recordTouchpoint(body: any) {
  try {
    const touchpoint = body;

    if (!touchpoint.customer_id || !touchpoint.touchpoint_type) {
      return NextResponse.json(
        { error: "Missing required touchpoint data" },
        { status: 400 }
      );
    }

    const success = await customerDataIngestion.recordTouchpoint(touchpoint);

    return NextResponse.json({
      success,
      data: {
        touchpoint_recorded: success,
        customer_id: touchpoint.customer_id,
        type: touchpoint.touchpoint_type,
      },
      meta: {
        action: "touchpoint_recording",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Touchpoint recording error:", error);
    return NextResponse.json(
      { error: "Failed to record touchpoint" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const customerId = searchParams.get("customer_id");

    switch (action) {
      case "find-customer":
        if (!customerId) {
          return NextResponse.json(
            { error: "Missing customer_id parameter" },
            { status: 400 }
          );
        }

        const customer = await customerDataIngestion.findExistingCustomer(
          searchParams.get("email") || "",
          searchParams.get("shopify_id") || undefined,
          searchParams.get("kajabi_id") || undefined
        );

        return NextResponse.json({
          success: true,
          data: customer,
          meta: {
            action: "find_customer",
            timestamp: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json(
          {
            success: true,
            message: "Customer Data Ingestion API",
            endpoints: {
              POST: {
                "?action=shopify": "Ingest Shopify customer data",
                "?action=kajabi": "Ingest Kajabi customer data",
                "?action=social": "Link social media profile",
                "?action=bulk": "Bulk import from multiple sources",
                "?action=churn-risk": "Calculate churn risk score",
                "?action=touchpoint": "Record customer touchpoint",
              },
              GET: {
                "?action=find-customer": "Find existing customer by email/ID",
              },
            },
          },
          { status: 200 }
        );
    }
  } catch (error) {
    console.error("Data Ingestion GET API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
