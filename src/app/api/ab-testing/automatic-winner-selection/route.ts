import { NextRequest, NextResponse } from "next/server";
import {
  TestConclusionEngine,
  createTestConclusionEngine,
  TestConclusion,
  WinnerSelection,
} from "@/lib/ab-testing/test-conclusion-engine";
import {
  StatisticalSignificanceEngine,
  PerformanceMonitor,
  VariantData,
} from "@/lib/ab-testing/statistical-engine";
import { createAdminClient } from "@/lib/supabase/server";

interface AutoWinnerRequest {
  test_id: string;
  force_evaluation?: boolean;
  implementation_strategy?: "immediate" | "gradual" | "staged" | "delayed";
  custom_criteria?: {
    minimum_confidence?: number;
    minimum_improvement?: number;
    risk_tolerance?: "conservative" | "moderate" | "aggressive";
  };
}

interface AutoWinnerResponse {
  test_id: string;
  evaluation_completed: boolean;
  conclusion?: TestConclusion;
  next_evaluation_time?: string;
  status: "concluded" | "continuing" | "insufficient_data" | "error";
  message: string;
}

/**
 * POST /api/ab-testing/automatic-winner-selection
 * Evaluate A/B test and automatically select winner based on predefined criteria
 */
export async function POST(request: NextRequest) {
  try {
    const body: AutoWinnerRequest = await request.json();
    const {
      test_id,
      force_evaluation = false,
      implementation_strategy,
      custom_criteria,
    } = body;

    if (!test_id) {
      return NextResponse.json(
        { error: "test_id is required" },
        { status: 400 }
      );
    }

    // Initialize engines
    const statisticalEngine = new StatisticalSignificanceEngine();
    const performanceMonitor = new PerformanceMonitor(statisticalEngine);
    const conclusionEngine = createTestConclusionEngine(
      statisticalEngine,
      performanceMonitor,
      undefined
    );

    // Fetch test data and variants
    const testData = await fetchTestData(test_id);
    if (!testData) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Check if test is eligible for evaluation
    const isEligible = await isTestEligibleForEvaluation(
      testData,
      force_evaluation
    );
    if (!isEligible.eligible) {
      return NextResponse.json<AutoWinnerResponse>({
        test_id,
        evaluation_completed: false,
        next_evaluation_time: isEligible.next_check_time,
        status: "continuing",
        message: isEligible.reason || "Test not ready for evaluation",
      });
    }

    // Evaluate test for conclusion
    const conclusion = await conclusionEngine.evaluateTestConclusion(
      test_id,
      testData.variants
    );

    if (!conclusion) {
      return NextResponse.json<AutoWinnerResponse>({
        test_id,
        evaluation_completed: true,
        status: "continuing",
        message: "Test evaluated but no conclusion reached. Continuing test.",
      });
    }

    // If we have a conclusion, implement it
    if (conclusion.selectedWinner) {
      await implementWinnerAutomatically(conclusion, implementation_strategy);

      // Log the automatic implementation
      await logAutomaticImplementation(conclusion);

      // Send notifications
      await sendImplementationNotifications(conclusion);
    }

    // Update test status in database
    await updateTestStatus(test_id, conclusion);

    return NextResponse.json<AutoWinnerResponse>({
      test_id,
      evaluation_completed: true,
      conclusion,
      status: conclusion.selectedWinner ? "concluded" : "continuing",
      message: conclusion.selectedWinner
        ? `Winner selected: ${conclusion.selectedWinner.variantName}. Implementation started.`
        : "Test evaluated but no clear winner found. Continuing test.",
    });
  } catch (error) {
    console.error("Error in automatic winner selection:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ab-testing/automatic-winner-selection?test_id=xxx
 * Get current status of automatic winner selection for a test
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const test_id = url.searchParams.get("test_id");

    if (!test_id) {
      return NextResponse.json(
        { error: "test_id parameter is required" },
        { status: 400 }
      );
    }

    const testData = await fetchTestData(test_id);
    if (!testData) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const isEligible = await isTestEligibleForEvaluation(testData, false);
    const implementationStatus = await getImplementationStatus(test_id);

    return NextResponse.json({
      test_id,
      current_status: testData.status,
      eligible_for_evaluation: isEligible.eligible,
      evaluation_reason: isEligible.reason,
      next_evaluation_time: isEligible.next_check_time,
      implementation_status: implementationStatus,
      auto_selection_config: {
        enabled: testData.auto_declare_winner || false,
        minimum_confidence: testData.minimum_confidence || 95,
        minimum_duration_hours: testData.minimum_duration_hours || 24,
        minimum_sample_size: testData.minimum_sample_size || 100,
      },
    });
  } catch (error) {
    console.error("Error fetching automatic winner selection status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions

async function fetchTestData(testId: string): Promise<any | null> {
  try {
    const supabase = createAdminClient();

    // Try to fetch from different test tables
    const { data: contentTest } = await supabase
      .from("content_ab_tests")
      .select("*")
      .eq("id", testId)
      .single();

    if (contentTest) {
      return {
        ...contentTest,
        type: "content",
        variants: await fetchTestVariants(testId, "content"),
      };
    }

    const { data: workflowTest } = await supabase
      .from("workflow_ab_tests")
      .select("*")
      .eq("id", testId)
      .single();

    if (workflowTest) {
      return {
        ...workflowTest,
        type: "workflow",
        variants: await fetchTestVariants(testId, "workflow"),
      };
    }

    // Fallback to mock data for development
    return getMockTestData(testId);
  } catch (error) {
    console.error("Error fetching test data:", error);
    return null;
  }
}

async function fetchTestVariants(
  testId: string,
  testType: string
): Promise<VariantData[]> {
  const supabase = createAdminClient();

  const { data: variants } = await supabase
    .from(`${testType}_ab_test_variants`)
    .select("*")
    .eq("test_id", testId);

  return (
    variants?.map(variant => ({
      id: variant.id,
      name: variant.name,
      metrics: {
        impressions: variant.metrics?.impressions || 0,
        clicks: variant.metrics?.clicks || 0,
        conversions: variant.metrics?.conversions || 0,
        revenue: variant.metrics?.revenue || 0,
        cost: variant.metrics?.cost || 0,
      },
      isControl: variant.is_control || false,
      trafficAllocation: variant.traffic_percentage || 50,
      startTime: new Date(variant.created_at),
    })) || []
  );
}

async function isTestEligibleForEvaluation(
  testData: any,
  forceEvaluation: boolean
): Promise<{ eligible: boolean; reason?: string; next_check_time?: string }> {
  if (forceEvaluation) {
    return { eligible: true, reason: "Force evaluation requested" };
  }

  // Check if test is running
  if (testData.status !== "running") {
    return {
      eligible: false,
      reason: `Test status is ${testData.status}, not running`,
    };
  }

  // Check minimum duration
  const testStartTime = new Date(testData.start_date || testData.created_at);
  const minimumDuration =
    (testData.minimum_duration_hours || 24) * 60 * 60 * 1000;
  const elapsedTime = Date.now() - testStartTime.getTime();

  if (elapsedTime < minimumDuration) {
    const nextCheckTime = new Date(testStartTime.getTime() + minimumDuration);
    return {
      eligible: false,
      reason: `Test hasn't run for minimum duration (${testData.minimum_duration_hours || 24} hours)`,
      next_check_time: nextCheckTime.toISOString(),
    };
  }

  // Check minimum sample size per variant
  const minimumSampleSize = testData.minimum_sample_size || 100;
  const hasInsufficientSamples = testData.variants?.some(
    (variant: any) => (variant.metrics?.impressions || 0) < minimumSampleSize
  );

  if (hasInsufficientSamples) {
    return {
      eligible: false,
      reason: `Some variants don't have minimum sample size (${minimumSampleSize})`,
      next_check_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Check again in 4 hours
    };
  }

  return { eligible: true };
}

async function implementWinnerAutomatically(
  conclusion: TestConclusion,
  strategy?: string
) {
  if (!conclusion.selectedWinner) return;

  const implementationStrategy =
    strategy || conclusion.selectedWinner.implementationStrategy;

  // Start implementation based on strategy
  switch (implementationStrategy) {
    case "immediate":
      await implementImmediately(conclusion);
      break;
    case "gradual":
      await implementGradually(conclusion);
      break;
    case "staged":
      await implementInStages(conclusion);
      break;
    case "delayed":
      await scheduleDelayedImplementation(conclusion);
      break;
  }
}

async function implementImmediately(conclusion: TestConclusion) {
  // Implement winner across all traffic immediately
  const supabase = createAdminClient();

  await supabase.from("ab_test_implementations").insert({
    test_id: conclusion.testId,
    implementation_type: "immediate",
    winner_variant_id: conclusion.selectedWinner?.variantId,
    rollout_percentage: 100,
    status: "active",
    implemented_at: new Date().toISOString(),
  });

  // Update content/workflow systems
  await updateSystemsWithWinner(conclusion);
}

async function implementGradually(conclusion: TestConclusion) {
  // Implement winner with gradual rollout (10%, 25%, 50%, 100%)
  const rolloutSteps = [10, 25, 50, 100];

  for (let i = 0; i < rolloutSteps.length; i++) {
    const percentage = rolloutSteps[i];
    const delay = i * 24 * 60 * 60 * 1000; // 24 hours between steps

    setTimeout(async () => {
      await updateRolloutPercentage(conclusion.testId, percentage);
    }, delay);
  }
}

async function implementInStages(conclusion: TestConclusion) {
  // Implement according to the specific phases in the implementation plan
  for (const phase of conclusion.implementationPlan.phases) {
    const delay = phase.duration * 60 * 60 * 1000; // Convert hours to milliseconds

    setTimeout(async () => {
      await updateRolloutPercentage(conclusion.testId, phase.rolloutPercentage);
    }, delay);
  }
}

async function scheduleDelayedImplementation(conclusion: TestConclusion) {
  // Schedule implementation for later (e.g., next business day)
  const nextBusinessDay = getNextBusinessDay();

  const supabase = createAdminClient();
  await supabase.from("scheduled_implementations").insert({
    test_id: conclusion.testId,
    scheduled_for: nextBusinessDay.toISOString(),
    implementation_type: "delayed",
    winner_variant_id: conclusion.selectedWinner?.variantId,
  });
}

async function updateRolloutPercentage(testId: string, percentage: number) {
  const supabase = createAdminClient();

  await supabase
    .from("ab_test_implementations")
    .update({
      rollout_percentage: percentage,
      updated_at: new Date().toISOString(),
    })
    .eq("test_id", testId);
}

async function updateSystemsWithWinner(conclusion: TestConclusion) {
  // Update content management system
  if (conclusion.selectedWinner) {
    await updateContentSystem(
      conclusion.testId,
      conclusion.selectedWinner.variantId
    );
    await updateWorkflowSystem(
      conclusion.testId,
      conclusion.selectedWinner.variantId
    );
  }
}

async function updateContentSystem(testId: string, winnerVariantId: string) {
  // Implementation would update the content management system
  console.log(
    `Updating content system with winner ${winnerVariantId} for test ${testId}`
  );
}

async function updateWorkflowSystem(testId: string, winnerVariantId: string) {
  // Implementation would update workflow automation
  console.log(
    `Updating workflow system with winner ${winnerVariantId} for test ${testId}`
  );
}

async function logAutomaticImplementation(conclusion: TestConclusion) {
  const supabase = createAdminClient();

  await supabase.from("ab_test_activity_log").insert({
    test_id: conclusion.testId,
    action: "automatic_winner_implementation",
    details: {
      winner_variant: conclusion.selectedWinner?.variantId,
      confidence: conclusion.selectedWinner?.confidence,
      expected_improvement: conclusion.selectedWinner?.expectedImprovement,
      implementation_strategy:
        conclusion.selectedWinner?.implementationStrategy,
    },
    timestamp: new Date().toISOString(),
  });
}

async function sendImplementationNotifications(conclusion: TestConclusion) {
  // Send notifications to stakeholders
  const notifications = [
    {
      type: "email",
      recipients: ["marketing@company.com", "data@company.com"],
      subject: `A/B Test Winner Automatically Implemented: ${conclusion.testId}`,
      body: `Winner: ${conclusion.selectedWinner?.variantName} with ${conclusion.selectedWinner?.expectedImprovement}% improvement`,
    },
    {
      type: "slack",
      channel: "#ab-testing",
      message: `🎉 A/B Test ${conclusion.testId} automatically implemented winner: ${conclusion.selectedWinner?.variantName}`,
    },
  ];

  // Implementation would send these notifications
  console.log("Sending notifications:", notifications);
}

async function updateTestStatus(testId: string, conclusion: TestConclusion) {
  const supabase = createAdminClient();

  const updates = {
    status: conclusion.selectedWinner ? "completed" : "running",
    winner_variant_id: conclusion.selectedWinner?.variantId || null,
    conclusion_time: conclusion.selectedWinner
      ? new Date().toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  // Update in all possible test tables
  await Promise.all([
    supabase.from("content_ab_tests").update(updates).eq("id", testId),
    supabase.from("workflow_ab_tests").update(updates).eq("id", testId),
    supabase.from("ab_tests").update(updates).eq("id", testId),
  ]);
}

async function getImplementationStatus(testId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("ab_test_implementations")
    .select("*")
    .eq("test_id", testId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

function getNextBusinessDay(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0); // 9 AM next day

  // If tomorrow is weekend, move to Monday
  if (tomorrow.getDay() === 0) {
    // Sunday
    tomorrow.setDate(tomorrow.getDate() + 1);
  } else if (tomorrow.getDay() === 6) {
    // Saturday
    tomorrow.setDate(tomorrow.getDate() + 2);
  }

  return tomorrow;
}

function getMockTestData(testId: string) {
  // Mock data for development/testing
  return {
    id: testId,
    name: `Test ${testId}`,
    status: "running",
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    auto_declare_winner: true,
    minimum_confidence: 95,
    minimum_duration_hours: 48,
    minimum_sample_size: 200,
    variants: [
      {
        id: "control",
        name: "Control",
        metrics: {
          impressions: 1000,
          clicks: 50,
          conversions: 5,
          conversion_rate: 10,
          revenue: 500,
          cost: 100,
        },
        is_control: true,
        traffic_percentage: 50,
        created_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "variant_a",
        name: "Variant A",
        metrics: {
          impressions: 1000,
          clicks: 65,
          conversions: 8,
          conversion_rate: 12.3,
          revenue: 740,
          cost: 100,
        },
        is_control: false,
        traffic_percentage: 50,
        created_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ],
  };
}
