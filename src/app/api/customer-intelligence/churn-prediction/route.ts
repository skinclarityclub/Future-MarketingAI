/**
 * Advanced Churn Prediction API Endpoint
 * Provides comprehensive churn prediction with machine learning models
 */

import { NextRequest, NextResponse } from "next/server";
import {
  churnPredictionEngine,
  ChurnPredictionInput,
} from "@/lib/customer-intelligence/churn-prediction";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const customerId = searchParams.get("customerId");
    const useAdvancedModels = searchParams.get("advanced") === "true";

    switch (action) {
      case "predict":
        return await predictCustomerChurn(customerId, useAdvancedModels);
      case "batch":
        return await batchPredictChurn(searchParams);
      case "risk-levels":
        return await getRiskLevelDistribution();
      case "high-risk":
        return await getHighRiskCustomers();
      default:
        return NextResponse.json(
          {
            error:
              "Invalid action specified. Use: predict, batch, risk-levels, or high-risk",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Churn Prediction API Error:", error);
    return NextResponse.json(
      { error: "Failed to process churn prediction request" },
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
      case "predict":
        return await predictCustomerChurnFromBody(body);
      case "batch":
        return await batchPredictChurnFromBody(body);
      case "update-model":
        return await updateChurnModel(body);
      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Churn Prediction API Error:", error);
    return NextResponse.json(
      { error: "Failed to process churn prediction request" },
      { status: 500 }
    );
  }
}

/**
 * Predict churn for a single customer (GET)
 */
async function predictCustomerChurn(
  customerId: string | null,
  useAdvancedModels: boolean
) {
  try {
    if (!customerId) {
      return NextResponse.json(
        { error: "customerId parameter is required" },
        { status: 400 }
      );
    }

    const input: ChurnPredictionInput = {
      customerId,
      includeExplanation: true,
      useAdvancedModels,
    };

    const prediction = await churnPredictionEngine.predictChurn(input);

    return NextResponse.json({
      success: true,
      data: prediction,
      meta: {
        action: "predict",
        timestamp: new Date().toISOString(),
        modelType: useAdvancedModels ? "advanced" : "basic",
      },
    });
  } catch (error) {
    console.error("Error predicting customer churn:", error);
    return NextResponse.json(
      {
        error: `Failed to predict churn: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Predict churn for a single customer (POST)
 */
async function predictCustomerChurnFromBody(body: any) {
  try {
    const {
      customerId,
      includeExplanation = true,
      useAdvancedModels = true,
    } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required in request body" },
        { status: 400 }
      );
    }

    const input: ChurnPredictionInput = {
      customerId,
      includeExplanation,
      useAdvancedModels,
    };

    const prediction = await churnPredictionEngine.predictChurn(input);

    return NextResponse.json({
      success: true,
      data: prediction,
      meta: {
        action: "predict",
        timestamp: new Date().toISOString(),
        modelType: useAdvancedModels ? "advanced" : "basic",
      },
    });
  } catch (error) {
    console.error("Error predicting customer churn:", error);
    return NextResponse.json(
      {
        error: `Failed to predict churn: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Batch predict churn for multiple customers (GET)
 */
async function batchPredictChurn(searchParams: URLSearchParams) {
  try {
    const status = searchParams.get("status");
    const riskThreshold = searchParams.get("riskThreshold");
    const limit = searchParams.get("limit");

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (riskThreshold) {
      const threshold = parseFloat(riskThreshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 1) {
        return NextResponse.json(
          { error: "riskThreshold must be a number between 0 and 1" },
          { status: 400 }
        );
      }
      filter.riskThreshold = threshold;
    }

    const results = await churnPredictionEngine.batchPredictChurn(filter);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          processed: results.processed,
          highRisk: results.highRisk,
          highRiskPercentage:
            results.processed > 0
              ? (results.highRisk / results.processed) * 100
              : 0,
          errors: results.errors.length,
        },
        errors: results.errors,
        filter: filter,
      },
      meta: {
        action: "batch_predict",
        timestamp: new Date().toISOString(),
        requestParams: {
          status,
          riskThreshold,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in batch churn prediction:", error);
    return NextResponse.json(
      {
        error: `Failed to process batch prediction: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Batch predict churn for multiple customers (POST)
 */
async function batchPredictChurnFromBody(body: any) {
  try {
    const { customerIds, filter = {} } = body;

    if (customerIds && !Array.isArray(customerIds)) {
      return NextResponse.json(
        { error: "customerIds must be an array" },
        { status: 400 }
      );
    }

    if (customerIds) {
      // Process specific customer IDs
      const predictions = [];
      const errors = [];

      for (const customerId of customerIds) {
        try {
          const prediction = await churnPredictionEngine.predictChurn({
            customerId,
            useAdvancedModels: true,
            includeExplanation: true,
          });
          predictions.push(prediction);
        } catch (error) {
          errors.push({
            customerId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          predictions,
          summary: {
            total: customerIds.length,
            successful: predictions.length,
            failed: errors.length,
            highRisk: predictions.filter(
              p => p.riskLevel === "high" || p.riskLevel === "critical"
            ).length,
          },
          errors,
        },
        meta: {
          action: "batch_predict_specific",
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      // Use filter for batch processing
      const results = await churnPredictionEngine.batchPredictChurn(filter);

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            processed: results.processed,
            highRisk: results.highRisk,
            highRiskPercentage:
              results.processed > 0
                ? (results.highRisk / results.processed) * 100
                : 0,
            errors: results.errors.length,
          },
          errors: results.errors,
          filter,
        },
        meta: {
          action: "batch_predict_filter",
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error("Error in batch churn prediction:", error);
    return NextResponse.json(
      {
        error: `Failed to process batch prediction: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Get risk level distribution across all customers
 */
async function getRiskLevelDistribution() {
  try {
    // This would be implemented by querying the database
    // For now, return mock data structure
    const distribution = {
      total: 12487,
      low: 8943,
      medium: 2456,
      high: 804,
      critical: 284,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: {
        distribution,
        percentages: {
          low: (distribution.low / distribution.total) * 100,
          medium: (distribution.medium / distribution.total) * 100,
          high: (distribution.high / distribution.total) * 100,
          critical: (distribution.critical / distribution.total) * 100,
        },
        trends: {
          // This would include historical comparison
          weekOverWeek: {
            low: 1.2,
            medium: -0.8,
            high: 2.3,
            critical: 5.1,
          },
        },
      },
      meta: {
        action: "risk_level_distribution",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting risk level distribution:", error);
    return NextResponse.json(
      { error: "Failed to get risk level distribution" },
      { status: 500 }
    );
  }
}

/**
 * Get high-risk customers with details
 */
async function getHighRiskCustomers() {
  try {
    // This would query the database for high-risk customers
    // For now, return mock data structure
    const highRiskCustomers = [
      {
        id: "customer-1",
        email: "john.doe@example.com",
        name: "John Doe",
        churnRiskScore: 0.85,
        riskLevel: "critical",
        predictedChurnDate: "2025-02-15T00:00:00.000Z",
        totalLifetimeValue: 2450.0,
        daysSinceLastPurchase: 127,
        primaryConcerns: ["Long time since purchase", "Declining engagement"],
        recommendedActions: ["Immediate personal outreach", "Exclusive offer"],
      },
      {
        id: "customer-2",
        email: "jane.smith@example.com",
        name: "Jane Smith",
        churnRiskScore: 0.72,
        riskLevel: "high",
        predictedChurnDate: "2025-03-01T00:00:00.000Z",
        totalLifetimeValue: 890.0,
        daysSinceLastPurchase: 89,
        primaryConcerns: ["Low engagement score", "Support tickets"],
        recommendedActions: [
          "Re-engagement campaign",
          "Address support issues",
        ],
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        customers: highRiskCustomers,
        summary: {
          total: highRiskCustomers.length,
          critical: highRiskCustomers.filter(c => c.riskLevel === "critical")
            .length,
          high: highRiskCustomers.filter(c => c.riskLevel === "high").length,
          totalValueAtRisk: highRiskCustomers.reduce(
            (sum, c) => sum + c.totalLifetimeValue,
            0
          ),
          averageRiskScore:
            highRiskCustomers.reduce((sum, c) => sum + c.churnRiskScore, 0) /
            highRiskCustomers.length,
        },
      },
      meta: {
        action: "high_risk_customers",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting high-risk customers:", error);
    return NextResponse.json(
      { error: "Failed to get high-risk customers" },
      { status: 500 }
    );
  }
}

/**
 * Update churn model parameters (for future ML model retraining)
 */
async function updateChurnModel(body: any) {
  try {
    const { modelType, parameters, trainingData } = body;

    // This would update model parameters or trigger retraining
    // For now, just return success
    return NextResponse.json({
      success: true,
      data: {
        message: "Model update initiated",
        modelType,
        parameters,
        status: "queued",
      },
      meta: {
        action: "update_model",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating churn model:", error);
    return NextResponse.json(
      { error: "Failed to update churn model" },
      { status: 500 }
    );
  }
}
