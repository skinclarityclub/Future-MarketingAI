#!/usr/bin/env node
/**
 * Test script for ML model integration
 * Tests the ML registry, orchestrator, and assistant integration
 */

import "dotenv/config";
import { mlModelRegistry } from "@/lib/assistant/ml/model-registry";
import { mlOrchestrator } from "@/lib/assistant/ml/ml-orchestrator";
import {
  askAdvanced,
  getMLCapabilities,
} from "@/lib/assistant/assistant-service";

async function main() {
  console.log("\n🧠 ML Model Integration Test\n" + "=".repeat(40));

  // Test 1: Model Registry Capabilities
  console.log("\n1. Testing Model Registry Capabilities...");
  try {
    const capabilities = getMLCapabilities();
    console.log(`✅ Found ${capabilities.length} ML models:`);
    capabilities.forEach(cap => {
      console.log(
        `   • ${cap.name}: ${cap.description} (confidence: ${Math.round(cap.confidence * 100)}%)`
      );
    });
  } catch (error) {
    console.log(`❌ Model capabilities test failed:`, error);
  }

  // Test 2: ROI Analysis
  console.log("\n2. Testing ROI Analysis...");
  try {
    const sampleContentMetrics = [
      {
        content_id: "test-content-1",
        title: "Test Course",
        type: "course",
        platform: "kajabi",
        revenue: 5000,
        views: 1000,
        clicks: 100,
        conversions: 10,
        engagement_time: 15,
        bounce_rate: 0.3,
        production_cost: 1000,
        marketing_spend: 500,
        operational_cost: 200,
        sales_count: 10,
        average_order_value: 500,
        created_date: "2024-01-01",
        period_start: "2024-01-01",
        period_end: "2024-12-31",
      },
    ];

    const roiResult = await mlModelRegistry.analyzeROI(sampleContentMetrics);
    if (roiResult.success) {
      console.log(`✅ ROI Analysis completed`);
      console.log(`   Model: ${roiResult.modelUsed}`);
      console.log(`   Confidence: ${Math.round(roiResult.confidence * 100)}%`);
      console.log(
        `   Results: ${roiResult.data.roiResults.length} content pieces analyzed`
      );
    } else {
      console.log(`❌ ROI Analysis failed: ${roiResult.error}`);
    }
  } catch (error) {
    console.log(`❌ ROI Analysis test failed:`, error);
  }

  // Test 3: ML Orchestrator
  console.log("\n3. Testing ML Orchestrator...");
  try {
    const mlQuery = {
      type: "analysis" as const,
      domain: "content" as const,
      parameters: { timeframe: "monthly" },
      context: "Analyze content performance",
    };

    const orchestratorResult = await mlOrchestrator.executeQuery(mlQuery);
    if (orchestratorResult.success) {
      console.log(`✅ ML Orchestrator completed`);
      console.log(
        `   Insights: ${orchestratorResult.insights.length} generated`
      );
      console.log(
        `   Models used: ${orchestratorResult.modelsUsed.join(", ")}`
      );
      console.log(
        `   Confidence: ${Math.round(orchestratorResult.confidence * 100)}%`
      );
      console.log(`   Execution time: ${orchestratorResult.executionTime}ms`);
    } else {
      console.log(`❌ ML Orchestrator failed`);
    }
  } catch (error) {
    console.log(`❌ ML Orchestrator test failed:`, error);
  }

  // Test 4: Assistant Integration
  console.log("\n4. Testing Assistant Integration...");
  try {
    const assistantResult = await askAdvanced({
      question: "What are the key performance insights for our content?",
      includeMLInsights: true,
      domain: "content",
      analysisType: "insights",
    });

    console.log(`✅ Assistant Integration completed`);
    console.log(`   Sources: ${assistantResult.sources.join(", ")}`);
    console.log(
      `   Insights: ${assistantResult.insights?.length || 0} ML insights`
    );
    console.log(
      `   Confidence: ${Math.round((assistantResult.confidence || 0) * 100)}%`
    );
    console.log(
      `   Answer preview: ${assistantResult.answer.slice(0, 100)}...`
    );
  } catch (error) {
    console.log(`❌ Assistant Integration test failed:`, error);
  }

  // Test 5: Strategic Insights Generation
  console.log("\n5. Testing Strategic Insights Generation...");
  try {
    const strategicQuery = {
      type: "strategic_insights" as const,
      parameters: {},
    };

    const strategicResult =
      await mlModelRegistry.generateStrategicInsights(strategicQuery);
    if (strategicResult.success) {
      console.log(`✅ Strategic Insights completed`);
      console.log(`   Model: ${strategicResult.modelUsed}`);
      console.log(
        `   Insights: ${strategicResult.data?.length || 0} strategic insights`
      );
      console.log(
        `   Confidence: ${Math.round(strategicResult.confidence * 100)}%`
      );

      if (strategicResult.data && strategicResult.data.length > 0) {
        console.log(`   Sample insight: ${strategicResult.data[0].title}`);
      }
    } else {
      console.log(`❌ Strategic Insights failed: ${strategicResult.error}`);
    }
  } catch (error) {
    console.log(`❌ Strategic Insights test failed:`, error);
  }

  console.log("\n" + "=".repeat(40));
  console.log("🎉 ML Model Integration Test Complete!");
}

main().catch(console.error);
