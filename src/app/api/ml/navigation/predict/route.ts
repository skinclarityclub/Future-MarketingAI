/**
 * Navigation Prediction API
 * Endpoint for ML-powered navigation predictions
 */

import { NextRequest, NextResponse } from "next/server";
import { NavigationMLEngine } from "@/lib/analytics/navigation-ml-engine";
import {
  PredictionRequest,
  RealtimeMLConfig,
} from "@/lib/analytics/ml-navigation-types";
import { createClient } from "@/lib/supabase/server";

// Initialize ML engine with configuration
const mlConfig: RealtimeMLConfig = {
  enabled: true,
  prediction_interval: 1000,
  batch_size: 10,
  cache_predictions: true,
  cache_ttl: 300, // 5 minutes
  fallback_strategy: "popular_pages",
  min_data_points: 100,
  retrain_threshold: 0.7,
  auto_retrain: false,
};

const mlEngine = new NavigationMLEngine(mlConfig);

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json();

    // Validate request
    if (!body.features || !body.context) {
      return NextResponse.json(
        { error: "Missing required fields: features and context" },
        { status: 400 }
      );
    }

    // Get predictions from ML engine
    const prediction = await mlEngine.predict(body);

    // Log prediction for analytics
    await logPrediction(prediction, body);

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error in navigation prediction:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const currentPage = searchParams.get("current_page");
    const userId = searchParams.get("user_id");

    if (!sessionId || !currentPage) {
      return NextResponse.json(
        { error: "Missing required parameters: session_id and current_page" },
        { status: 400 }
      );
    }

    // Get real-time recommendations
    const recommendations = await mlEngine.getRealtimeRecommendations(
      sessionId,
      currentPage,
      userId || undefined
    );

    return NextResponse.json({
      recommendations,
      model_version: mlEngine.getModelMetrics().last_trained,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to log predictions for analysis
async function logPrediction(prediction: any, request: PredictionRequest) {
  try {
    const supabase = await createClient();

    const logEntry = {
      prediction_id: prediction.prediction_id,
      session_id: request.features.session_id,
      user_id: request.features.user_id,
      current_page: request.features.current_page,
      predicted_pages: prediction.predictions.map((p: any) => p.predicted_page),
      confidence_scores: prediction.predictions.map(
        (p: any) => p.confidence_score
      ),
      model_version: prediction.model_version,
      processing_time: prediction.processing_time,
      fallback_used: prediction.fallback_used,
      user_segment: prediction.user_segment,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("ml_prediction_logs")
      .insert(logEntry);

    if (error) {
      console.warn("Error logging prediction:", error);
    }
  } catch (error) {
    console.warn("Error in prediction logging:", error);
  }
}
