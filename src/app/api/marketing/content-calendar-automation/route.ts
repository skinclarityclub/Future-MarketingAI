/**
 * Content Calendar Automation API
 * Task 36.3: API endpoints for AI-powered content ideation and automatic calendar filling
 *
 * Endpoints:
 * POST /api/marketing/content-calendar-automation - Handle various automation actions
 * GET /api/marketing/content-calendar-automation - Get calendar data and analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import ContentCalendarAutomationService, {
  AutoFillConfig,
  ContentIdea,
  ContentCalendarEntry,
} from "@/lib/marketing/content-calendar-automation";

// Validation schemas
const generateIdeasSchema = z.object({
  action: z.literal("generate_ideas"),
  themes: z.array(z.string()).min(1),
  target_audience: z.string(),
  platforms: z.array(z.string()).min(1),
  count: z.number().min(1).max(50).optional().default(10),
  include_trending: z.boolean().optional().default(true),
});

const autoFillSchema = z.object({
  action: z.literal("auto_fill_calendar"),
  date_range: z.object({
    start_date: z.string().transform(date => new Date(date)),
    end_date: z.string().transform(date => new Date(date)),
  }),
  platforms: z.array(z.string()).min(1),
  content_types: z.array(z.string()).min(1),
  posting_frequency: z.object({
    daily_posts: z.number().min(1).max(20),
    weekly_posts: z.number().optional(),
    monthly_posts: z.number().optional(),
  }),
  time_preferences: z.object({
    preferred_times: z.array(z.string()),
    avoid_times: z.array(z.string()).optional().default([]),
    timezone: z.string().optional().default("UTC"),
  }),
  content_themes: z.array(z.string()).min(1),
  target_audiences: z.array(z.string()).min(1),
  include_trending: z.boolean().optional().default(true),
  include_seasonal: z.boolean().optional().default(true),
  respect_existing_content: z.boolean().optional().default(true),
  auto_approve: z.boolean().optional().default(false),
});

const analyzeGapsSchema = z.object({
  action: z.literal("analyze_gaps"),
  start_date: z.string().transform(date => new Date(date)),
  end_date: z.string().transform(date => new Date(date)),
  platforms: z.array(z.string()).min(1),
});

const setupRecurringSchema = z.object({
  action: z.literal("setup_recurring"),
  content_types: z.array(z.string()).min(1),
  platforms: z.array(z.string()).min(1),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  start_date: z.string().transform(date => new Date(date)),
  end_date: z.string().transform(date => new Date(date)),
  themes: z.array(z.string()).min(1),
});

const getCalendarDataSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  platforms: z.string().optional(), // comma-separated
  status: z.string().optional(),
  include_analytics: z.string().optional(),
});

// GET Handler - Retrieve calendar data and analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validatedParams = getCalendarDataSchema.parse(params);

    // Parse query parameters
    const startDate = validatedParams.start_date
      ? new Date(validatedParams.start_date)
      : new Date();

    const endDate = validatedParams.end_date
      ? new Date(validatedParams.end_date)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const platforms = validatedParams.platforms
      ? validatedParams.platforms.split(",")
      : ["facebook", "instagram", "twitter", "linkedin"];

    const includeAnalytics = validatedParams.include_analytics === "true";

    // Determine the action based on query parameters
    if (searchParams.has("analyze_gaps")) {
      return handleAnalyzeGaps(startDate, endDate, platforms);
    }

    if (searchParams.has("calendar_analytics")) {
      return handleCalendarAnalytics(startDate, endDate, platforms);
    }

    // Default: Get calendar entries
    return handleGetCalendarData(
      startDate,
      endDate,
      platforms,
      validatedParams.status,
      includeAnalytics
    );
  } catch (error) {
    console.error("Error in calendar automation GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve calendar data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

// POST Handler - Handle automation actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Route to appropriate handler based on action
    switch (body.action) {
      case "generate_ideas":
        return handleGenerateIdeas(body);

      case "auto_fill_calendar":
        return handleAutoFillCalendar(body);

      case "analyze_gaps":
        return handleAnalyzeGapsPost(body);

      case "setup_recurring":
        return handleSetupRecurring(body);

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            supported_actions: [
              "generate_ideas",
              "auto_fill_calendar",
              "analyze_gaps",
              "setup_recurring",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in calendar automation POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Action Handlers

async function handleGenerateIdeas(body: any) {
  try {
    const validatedData = generateIdeasSchema.parse(body);

    const ideas = await ContentCalendarAutomationService.generateContentIdeas(
      validatedData.themes,
      validatedData.target_audience,
      validatedData.platforms,
      validatedData.count,
      validatedData.include_trending
    );

    return NextResponse.json({
      success: true,
      data: {
        ideas,
        metadata: {
          total_generated: ideas.length,
          themes_used: validatedData.themes,
          platforms: validatedData.platforms,
          include_trending: validatedData.include_trending,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to generate content ideas: ${error}`);
  }
}

async function handleAutoFillCalendar(body: any) {
  try {
    const validatedData = autoFillSchema.parse(body);

    const config: AutoFillConfig = {
      date_range: validatedData.date_range,
      platforms: validatedData.platforms,
      content_types: validatedData.content_types,
      posting_frequency: validatedData.posting_frequency,
      time_preferences: validatedData.time_preferences,
      content_themes: validatedData.content_themes,
      target_audiences: validatedData.target_audiences,
      include_trending: validatedData.include_trending,
      include_seasonal: validatedData.include_seasonal,
      respect_existing_content: validatedData.respect_existing_content,
      auto_approve: validatedData.auto_approve,
    };

    const calendarEntries =
      await ContentCalendarAutomationService.autoFillCalendar(config);

    return NextResponse.json({
      success: true,
      data: {
        calendar_entries: calendarEntries,
        metadata: {
          entries_created: calendarEntries.length,
          date_range: config.date_range,
          platforms: config.platforms,
          auto_approved: config.auto_approve,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to auto-fill calendar: ${error}`);
  }
}

async function handleAnalyzeGapsPost(body: any) {
  try {
    const validatedData = analyzeGapsSchema.parse(body);

    const analysis = await ContentCalendarAutomationService.analyzeContentGaps(
      validatedData.start_date,
      validatedData.end_date,
      validatedData.platforms
    );

    return NextResponse.json({
      success: true,
      data: {
        gaps_analysis: analysis,
        summary: {
          total_gaps: analysis.gaps.length,
          high_severity_gaps: analysis.gaps.filter(
            gap => gap.severity === "high"
          ).length,
          recommendations_count: analysis.recommendations.length,
          analysis_period: {
            start_date: validatedData.start_date,
            end_date: validatedData.end_date,
          },
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    throw new Error(`Failed to analyze content gaps: ${error}`);
  }
}

async function handleSetupRecurring(body: any) {
  try {
    const validatedData = setupRecurringSchema.parse(body);

    const recurringEntries =
      await ContentCalendarAutomationService.setupSmartRecurring(
        validatedData.content_types,
        validatedData.platforms,
        validatedData.frequency,
        validatedData.start_date,
        validatedData.end_date,
        validatedData.themes
      );

    return NextResponse.json({
      success: true,
      data: {
        recurring_entries: recurringEntries,
        metadata: {
          entries_created: recurringEntries.length,
          frequency: validatedData.frequency,
          platforms: validatedData.platforms,
          content_types: validatedData.content_types,
          date_range: {
            start_date: validatedData.start_date,
            end_date: validatedData.end_date,
          },
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to setup recurring content: ${error}`);
  }
}

// GET Action Handlers

async function handleGetCalendarData(
  startDate: Date,
  endDate: Date,
  platforms: string[],
  status?: string,
  includeAnalytics: boolean = false
) {
  try {
    // Get calendar entries (mock implementation)
    const calendarEntries = await getMockCalendarEntries(
      startDate,
      endDate,
      platforms,
      status
    );

    let analytics = {};
    if (includeAnalytics) {
      analytics = await getCalendarAnalytics(calendarEntries);
    }

    return NextResponse.json({
      success: true,
      data: {
        calendar_entries: calendarEntries,
        ...(includeAnalytics && { analytics }),
        metadata: {
          total_entries: calendarEntries.length,
          date_range: { start_date: startDate, end_date: endDate },
          platforms,
          status_filter: status,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to get calendar data: ${error}`);
  }
}

async function handleAnalyzeGaps(
  startDate: Date,
  endDate: Date,
  platforms: string[]
) {
  try {
    const analysis = await ContentCalendarAutomationService.analyzeContentGaps(
      startDate,
      endDate,
      platforms
    );

    return NextResponse.json({
      success: true,
      data: {
        gaps_analysis: analysis,
        summary: {
          total_gaps: analysis.gaps.length,
          critical_gaps: analysis.gaps.filter(gap => gap.severity === "high")
            .length,
          platforms_analyzed: platforms,
          analysis_period: { start_date: startDate, end_date: endDate },
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    throw new Error(`Failed to analyze gaps: ${error}`);
  }
}

async function handleCalendarAnalytics(
  startDate: Date,
  endDate: Date,
  platforms: string[]
) {
  try {
    const analytics = await getAdvancedCalendarAnalytics(
      startDate,
      endDate,
      platforms
    );

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        metadata: {
          analysis_period: { start_date: startDate, end_date: endDate },
          platforms,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to get calendar analytics: ${error}`);
  }
}

// Helper Functions

async function getMockCalendarEntries(
  startDate: Date,
  endDate: Date,
  platforms: string[],
  status?: string
): Promise<ContentCalendarEntry[]> {
  // Mock implementation - in production, this would fetch from database
  const mockEntries: ContentCalendarEntry[] = [
    {
      id: "cal-auto-001",
      title: "AI-Generated Product Showcase",
      description: "Showcase our latest AI features with engaging visuals",
      calendar_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      time_slot: "10:00",
      content_type: "post",
      target_platforms: ["facebook", "linkedin"],
      target_accounts: [],
      status: "planned",
      priority: "high",
      auto_generated: true,
      ai_suggestions: {
        keywords: ["AI", "innovation", "technology"],
        hashtags: ["#AI", "#Innovation", "#TechTrends"],
        reasoning: "Generated based on trending AI topics with 92% confidence",
      },
      is_recurring: false,
      expected_engagement: 85,
      target_audience: "Tech professionals",
      content_theme: "product showcase",
      seasonal_tag: "winter tech trends",
    },
    {
      id: "cal-auto-002",
      title: "Weekly Industry Insights",
      description: "Share this week's top industry insights and trends",
      calendar_date: new Date(Date.now() + 48 * 60 * 60 * 1000),
      time_slot: "14:00",
      content_type: "video",
      target_platforms: ["youtube", "linkedin"],
      target_accounts: [],
      status: "ready",
      priority: "medium",
      auto_generated: true,
      ai_suggestions: {
        keywords: ["insights", "trends", "industry"],
        hashtags: ["#WeeklyInsights", "#IndustryTrends", "#Business"],
        reasoning: "Generated for recurring weekly content series",
      },
      is_recurring: true,
      recurring_pattern: { frequency: "weekly", optimal_times: ["14:00"] },
      expected_engagement: 78,
      target_audience: "Business professionals",
      content_theme: "industry insights",
    },
  ];

  // Filter by status if provided
  if (status && status !== "all") {
    return mockEntries.filter(entry => entry.status === status);
  }

  return mockEntries;
}

async function getCalendarAnalytics(entries: ContentCalendarEntry[]) {
  return {
    total_entries: entries.length,
    status_distribution: {
      planned: entries.filter(e => e.status === "planned").length,
      ready: entries.filter(e => e.status === "ready").length,
      scheduled: entries.filter(e => e.status === "scheduled").length,
      published: entries.filter(e => e.status === "published").length,
    },
    platform_distribution: entries.reduce(
      (acc, entry) => {
        entry.target_platforms.forEach(platform => {
          acc[platform] = (acc[platform] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    ),
    content_type_distribution: entries.reduce(
      (acc, entry) => {
        acc[entry.content_type] = (acc[entry.content_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    auto_generated_percentage: Math.round(
      (entries.filter(e => e.auto_generated).length / entries.length) * 100
    ),
    average_expected_engagement: Math.round(
      entries.reduce((sum, e) => sum + (e.expected_engagement || 0), 0) /
        entries.length
    ),
  };
}

async function getAdvancedCalendarAnalytics(
  startDate: Date,
  endDate: Date,
  platforms: string[]
) {
  return {
    posting_frequency: {
      daily_average: 2.5,
      weekly_total: 17,
      optimal_vs_actual: "85%",
    },
    content_performance_prediction: {
      expected_reach: 15420,
      expected_engagement: 1240,
      high_performance_content: 3,
    },
    automation_efficiency: {
      auto_generated_percentage: 78,
      manual_intervention_needed: 12,
      approval_rate: 94,
    },
    trending_topics_usage: {
      trending_content_count: 5,
      seasonal_content_count: 3,
      evergreen_content_count: 9,
    },
    platform_optimization: platforms.reduce(
      (acc, platform) => {
        acc[platform] = {
          optimal_times_usage: Math.floor(Math.random() * 20) + 80,
          content_type_match: Math.floor(Math.random() * 15) + 85,
          audience_targeting_score: Math.floor(Math.random() * 10) + 90,
        };
        return acc;
      },
      {} as Record<string, any>
    ),
  };
}
