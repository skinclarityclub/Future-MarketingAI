import { NextRequest, NextResponse } from "next/server";
import {
  ContinuousLearningEngine,
  PerformanceFeedback,
} from "@/lib/ml/continuous-learning-engine";

const learningEngine = new ContinuousLearningEngine();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "metrics";

    switch (action) {
      case "metrics":
        const metrics = await learningEngine.getLearningMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
          message: "Learning metrics retrieved successfully",
        });

      case "insights":
        const insights = await learningEngine.discoverLearningInsights();
        return NextResponse.json({
          success: true,
          data: insights,
          message: "Learning insights discovered successfully",
        });

      case "report":
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");

        if (!startDate || !endDate) {
          return NextResponse.json(
            {
              success: false,
              message:
                "start_date and end_date parameters are required for reports",
            },
            { status: 400 }
          );
        }

        const report = await learningEngine.generateLearningReport({
          start: new Date(startDate),
          end: new Date(endDate),
        });

        return NextResponse.json({
          success: true,
          data: report,
          message: "Learning report generated successfully",
        });

      case "status":
        const status = await learningEngine.getLearningMetrics();
        return NextResponse.json({
          success: true,
          data: {
            learning_status: status.learning_status,
            current_accuracy: status.current_metrics.model_accuracy,
            improvement_rate: status.current_metrics.improvement_rate,
            last_update: status.learning_status.last_update,
          },
          message: "Learning status retrieved successfully",
        });

      case "demo":
        // Generate demo feedback data and process it
        const demoFeedback: PerformanceFeedback[] = [
          {
            content_id: "demo_content_1",
            platform: "instagram",
            predicted_engagement: 0.05,
            actual_engagement: 0.08,
            predicted_reach: 1000,
            actual_reach: 1500,
            predicted_conversion: 0.02,
            actual_conversion: 0.035,
            optimization_applied: true,
            optimization_type: ["hashtag_optimization", "timing_optimization"],
            feedback_timestamp: new Date().toISOString(),
            user_satisfaction_score: 4.5,
            business_impact_score: 4.2,
          },
          {
            content_id: "demo_content_2",
            platform: "linkedin",
            predicted_engagement: 0.03,
            actual_engagement: 0.025,
            predicted_reach: 800,
            actual_reach: 650,
            predicted_conversion: 0.015,
            actual_conversion: 0.012,
            optimization_applied: false,
            optimization_type: [],
            feedback_timestamp: new Date().toISOString(),
            user_satisfaction_score: 3.2,
            business_impact_score: 2.8,
          },
        ];

        const demoResult = await learningEngine.processFeedback(demoFeedback);
        return NextResponse.json({
          success: true,
          data: demoResult,
          message: "Demo feedback processed successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid action. Supported actions: metrics, insights, report, status, demo",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Continuous learning API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "start-learning":
        await learningEngine.startLearningLoop();
        return NextResponse.json({
          success: true,
          message: "Continuous learning loop started successfully",
        });

      case "stop-learning":
        await learningEngine.stopLearningLoop();
        return NextResponse.json({
          success: true,
          message: "Continuous learning loop stopped successfully",
        });

      case "process-feedback":
        const { feedback } = body;

        if (!feedback || !Array.isArray(feedback)) {
          return NextResponse.json(
            {
              success: false,
              message: "feedback array is required",
            },
            { status: 400 }
          );
        }

        const result = await learningEngine.processFeedback(feedback);
        return NextResponse.json({
          success: true,
          data: result,
          message: "Feedback processed successfully",
        });

      case "trigger-retraining":
        const { force = false } = body;

        try {
          const retrainingResult =
            await learningEngine.triggerModelRetraining(force);
          return NextResponse.json({
            success: true,
            data: retrainingResult,
            message: "Model retraining completed successfully",
          });
        } catch (retrainingError) {
          return NextResponse.json(
            {
              success: false,
              message:
                retrainingError instanceof Error
                  ? retrainingError.message
                  : "Retraining failed",
            },
            { status: 400 }
          );
        }

      case "batch-feedback":
        const {
          content_performance_data,
          optimization_results,
          user_feedback,
          business_metrics,
        } = body;

        // Convert various data sources into standardized feedback format
        const batchFeedback: PerformanceFeedback[] = [];

        // Process content performance data
        if (
          content_performance_data &&
          Array.isArray(content_performance_data)
        ) {
          content_performance_data.forEach((data: any) => {
            batchFeedback.push({
              content_id: data.content_id,
              platform: data.platform,
              predicted_engagement: data.predicted_engagement || 0,
              actual_engagement: data.actual_engagement,
              predicted_reach: data.predicted_reach || 0,
              actual_reach: data.actual_reach,
              predicted_conversion: data.predicted_conversion || 0,
              actual_conversion: data.actual_conversion || 0,
              optimization_applied: data.optimization_applied || false,
              optimization_type: data.optimization_type || [],
              feedback_timestamp: data.timestamp || new Date().toISOString(),
              user_satisfaction_score: data.user_satisfaction_score,
              business_impact_score: data.business_impact_score,
            });
          });
        }

        if (batchFeedback.length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: "No valid feedback data provided",
            },
            { status: 400 }
          );
        }

        const batchResult = await learningEngine.processFeedback(batchFeedback);
        return NextResponse.json({
          success: true,
          data: batchResult,
          message: `Processed ${batchFeedback.length} feedback items successfully`,
        });

      case "simulate-learning-cycle":
        // Simulate a complete learning cycle for testing
        const simulatedFeedback: PerformanceFeedback[] = Array.from(
          { length: 50 },
          (_, i) => ({
            content_id: `sim_content_${i}`,
            platform: ["instagram", "linkedin", "twitter"][i % 3],
            predicted_engagement: 0.03 + Math.random() * 0.05,
            actual_engagement: 0.025 + Math.random() * 0.08,
            predicted_reach: 500 + Math.floor(Math.random() * 2000),
            actual_reach: 400 + Math.floor(Math.random() * 2500),
            predicted_conversion: 0.01 + Math.random() * 0.03,
            actual_conversion: 0.008 + Math.random() * 0.04,
            optimization_applied: Math.random() > 0.5,
            optimization_type:
              Math.random() > 0.5 ? ["hashtag_optimization"] : [],
            feedback_timestamp: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            user_satisfaction_score: 2 + Math.random() * 3,
            business_impact_score: 2 + Math.random() * 3,
          })
        );

        const simulationResult =
          await learningEngine.processFeedback(simulatedFeedback);

        // Also trigger insights discovery
        const discoveredInsights =
          await learningEngine.discoverLearningInsights();

        return NextResponse.json({
          success: true,
          data: {
            feedback_processing: simulationResult,
            insights_discovered: discoveredInsights,
            simulation_summary: {
              feedback_items: simulatedFeedback.length,
              platforms_covered: ["instagram", "linkedin", "twitter"],
              optimization_rate:
                simulatedFeedback.filter(f => f.optimization_applied).length /
                simulatedFeedback.length,
            },
          },
          message: "Learning cycle simulation completed successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid action. Supported actions: start-learning, stop-learning, process-feedback, trigger-retraining, batch-feedback, simulate-learning-cycle",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Continuous learning POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "update-config":
        const { config } = body;

        if (!config) {
          return NextResponse.json(
            {
              success: false,
              message: "config object is required",
            },
            { status: 400 }
          );
        }

        // Create new learning engine with updated config
        const updatedEngine = new ContinuousLearningEngine(config);

        return NextResponse.json({
          success: true,
          data: { config },
          message: "Learning configuration updated successfully",
        });

      case "adjust-thresholds":
        const {
          retraining_threshold,
          auto_deployment_threshold,
          feedback_batch_size,
        } = body;

        const newConfig = {
          ...(retraining_threshold !== undefined && { retraining_threshold }),
          ...(auto_deployment_threshold !== undefined && {
            auto_deployment_threshold,
          }),
          ...(feedback_batch_size !== undefined && { feedback_batch_size }),
        };

        return NextResponse.json({
          success: true,
          data: { updated_config: newConfig },
          message: "Learning thresholds adjusted successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid action. Supported actions: update-config, adjust-thresholds",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Continuous learning PATCH error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
