/**
 * Smart Scheduling Engine API - Task 103.5
 * Enterprise-grade API for intelligent scheduling using audience analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import SmartSchedulingEngine from "@/lib/marketing/smart-scheduling-engine";

// Initialize Smart Scheduling Engine
const smartScheduler = new SmartSchedulingEngine();

// Validation schemas
const scheduleContentSchema = z.object({
  content_id: z.string().min(1, "Content ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content_type: z.enum(["post", "story", "video", "email", "ad", "campaign"]),
  target_platforms: z
    .array(z.string())
    .min(1, "At least one platform is required"),
  preferred_time: z
    .string()
    .datetime()
    .optional()
    .transform(date => (date ? new Date(date) : undefined)),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  target_audience: z.string().optional(),
  optimization_goals: z
    .object({
      maximize_engagement: z.boolean().optional().default(true),
      maximize_reach: z.boolean().optional().default(false),
      minimize_conflicts: z.boolean().optional().default(true),
      respect_frequency_caps: z.boolean().optional().default(true),
    })
    .default({}),
});

// POST: Handle scheduling actions
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "schedule_content": {
        const validatedRequest = scheduleContentSchema.parse(data);

        const smartRequest = {
          ...validatedRequest,
          optimization_goals: {
            ...validatedRequest.optimization_goals,
          },
        };

        const result = await smartScheduler.scheduleContent(smartRequest);

        return NextResponse.json({
          success: true,
          result,
          metadata: {
            processingTime: Date.now() - startTime,
            action: "schedule_content",
            contentId: validatedRequest.content_id,
            timestamp: new Date().toISOString(),
          },
        });
      }

      case "get_optimal_times": {
        const schema = z.object({
          platform: z.string().min(1, "Platform is required"),
          audience: z.string().optional(),
        });

        const { platform, audience } = schema.parse(data);
        const optimalTimes = await smartScheduler.getOptimalTimes(
          platform,
          audience
        );

        return NextResponse.json({
          success: true,
          optimal_times: optimalTimes,
          platform,
          audience: audience || "general",
          metadata: {
            processingTime: Date.now() - startTime,
            action: "get_optimal_times",
            timestamp: new Date().toISOString(),
          },
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            supported_actions: ["schedule_content", "get_optimal_times"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[SmartScheduling API] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve scheduling analytics and insights
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "queue_analytics";

    switch (action) {
      case "queue_analytics": {
        const analytics = await smartScheduler.getQueueAnalytics();

        return NextResponse.json({
          success: true,
          analytics,
          metadata: {
            processingTime: Date.now() - startTime,
            action: "queue_analytics",
            timestamp: new Date().toISOString(),
          },
        });
      }

      case "audience_insights": {
        const platforms = searchParams.get("platforms")?.split(",") || [
          "instagram",
        ];
        const audience = searchParams.get("audience") || "general";

        // Mock audience analytics
        const insights = {
          timezone: "Europe/Amsterdam",
          peak_activity_hours: [9, 12, 15, 18],
          preferred_days: [1, 2, 3, 4, 5],
          engagement_patterns: [
            {
              hour: 9,
              day_of_week: 2,
              engagement_score: 8.5,
              audience_size: 1250,
            },
            {
              hour: 12,
              day_of_week: 3,
              engagement_score: 7.8,
              audience_size: 1180,
            },
            {
              hour: 15,
              day_of_week: 4,
              engagement_score: 8.2,
              audience_size: 1320,
            },
            {
              hour: 18,
              day_of_week: 5,
              engagement_score: 9.1,
              audience_size: 1450,
            },
          ],
          platform_preferences: platforms.reduce(
            (acc, platform) => {
              acc[platform] = {
                optimal_times: ["09:00", "12:00", "15:00", "18:00"],
                engagement_multiplier: 1.2,
                best_content_types: ["post", "video", "image"],
              };
              return acc;
            },
            {} as Record<string, any>
          ),
          demographic_insights: {
            age_groups: {
              "25-34": 0.4,
              "35-44": 0.3,
              "18-24": 0.2,
              "45+": 0.1,
            },
            geographical_distribution: {
              Netherlands: 0.6,
              Germany: 0.2,
              Belgium: 0.1,
              Other: 0.1,
            },
            behavior_patterns: [
              "Peak engagement during business hours",
              "Higher engagement on weekdays",
              "Visual content performs better in evenings",
            ],
          },
        };

        return NextResponse.json({
          success: true,
          insights,
          parameters: { platforms, audience },
          metadata: {
            processingTime: Date.now() - startTime,
            action: "audience_insights",
            timestamp: new Date().toISOString(),
          },
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            supported_actions: ["queue_analytics", "audience_insights"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[SmartScheduling GET API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
