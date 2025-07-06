import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AutomaticContentOptimizationService } from "@/lib/ml/automatic-content-optimization-service";
import { NotificationService } from "@/lib/approval/notification-service";

const optimizationService = new AutomaticContentOptimizationService();
const notificationService = new NotificationService();

interface DistributionRequest {
  content_id: string;
  content_title?: string;
  suggestions?: any[];
  distribution_channels?: ("email" | "slack" | "dashboard" | "webhook")[];
  stakeholder_groups?: (
    | "content_team"
    | "marketing_team"
    | "management"
    | "all"
  )[];
  priority_filter?: ("critical" | "high" | "medium" | "low")[];
  immediate?: boolean;
  template_type?: "urgent" | "priority" | "standard" | "summary";
}

interface DistributionResponse {
  success: boolean;
  distribution_id: string;
  message: string;
  distribution_summary: {
    content_id: string;
    channels_used: string[];
    stakeholders_notified: number;
    suggestions_distributed: number;
    distribution_type: string;
    timestamp: string;
  };
  delivery_status: {
    email: { sent: boolean; recipients: string[]; error?: string };
    slack: { sent: boolean; channels: string[]; error?: string };
    dashboard: { sent: boolean; users: number; error?: string };
    webhook: { sent: boolean; endpoints: number; error?: string };
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body: DistributionRequest = await request.json();

    // Validate required fields
    if (!body.content_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: content_id",
        },
        { status: 400 }
      );
    }

    // Get suggestions if not provided
    let suggestions = body.suggestions;
    if (!suggestions || suggestions.length === 0) {
      console.log(`Fetching suggestions for content_id: ${body.content_id}`);
      const { data: storedSuggestions } = await supabase
        .from("content_optimization_suggestions")
        .select("*")
        .eq("content_id", body.content_id)
        .order("created_at", { ascending: false });

      suggestions = storedSuggestions || [];
    }

    if (suggestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No optimization suggestions found for this content",
        },
        { status: 404 }
      );
    }

    // Process and categorize suggestions
    const criticalSuggestions = suggestions.filter(
      s => s.priority === "critical"
    );
    const highSuggestions = suggestions.filter(s => s.priority === "high");
    const mediumSuggestions = suggestions.filter(s => s.priority === "medium");
    const lowSuggestions = suggestions.filter(s => s.priority === "low");

    // Determine distribution type based on suggestion priorities
    const distributionType =
      criticalSuggestions.length > 0
        ? "urgent"
        : highSuggestions.length > 0
          ? "priority"
          : "standard";

    // Filter suggestions based on priority filter
    let filteredSuggestions = suggestions;
    if (body.priority_filter && body.priority_filter.length > 0) {
      filteredSuggestions = suggestions.filter(s =>
        body.priority_filter!.includes(s.priority)
      );
    }

    // Default distribution channels and stakeholder groups
    const channels = body.distribution_channels || [
      "email",
      "slack",
      "dashboard",
    ];
    const stakeholderGroups = body.stakeholder_groups || [
      "content_team",
      "marketing_team",
    ];

    // Get stakeholder contact information
    const stakeholderData = await getStakeholderContacts(
      supabase,
      stakeholderGroups
    );

    // Create distribution record
    const distributionId = `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store distribution request in database
    await supabase.from("content_optimization_distributions").insert({
      id: distributionId,
      content_id: body.content_id,
      content_title: body.content_title || "Content Optimization",
      suggestions_count: filteredSuggestions.length,
      distribution_type: distributionType,
      channels: channels,
      stakeholder_groups: stakeholderGroups,
      status: "processing",
      created_at: new Date().toISOString(),
    });

    // Initialize delivery status
    const deliveryStatus = {
      email: { sent: false, recipients: [], error: undefined },
      slack: { sent: false, channels: [], error: undefined },
      dashboard: { sent: false, users: 0, error: undefined },
      webhook: { sent: false, endpoints: 0, error: undefined },
    };

    // Execute distribution through selected channels
    const distributionPromises = [];

    // Email distribution
    if (channels.includes("email")) {
      distributionPromises.push(
        distributeViaEmail(
          body.content_id,
          body.content_title || "Content Optimization",
          filteredSuggestions,
          stakeholderData.emails,
          distributionType
        )
          .then(result => {
            deliveryStatus.email = result;
          })
          .catch(error => {
            deliveryStatus.email = {
              sent: false,
              recipients: [],
              error: error.message,
            };
          })
      );
    }

    // Slack distribution
    if (channels.includes("slack")) {
      distributionPromises.push(
        distributeViaSlack(
          body.content_id,
          body.content_title || "Content Optimization",
          filteredSuggestions,
          stakeholderData.slackChannels,
          distributionType
        )
          .then(result => {
            deliveryStatus.slack = result;
          })
          .catch(error => {
            deliveryStatus.slack = {
              sent: false,
              channels: [],
              error: error.message,
            };
          })
      );
    }

    // Dashboard distribution
    if (channels.includes("dashboard")) {
      distributionPromises.push(
        distributeViaDashboard(
          body.content_id,
          body.content_title || "Content Optimization",
          filteredSuggestions,
          stakeholderData.users,
          distributionType
        )
          .then(result => {
            deliveryStatus.dashboard = result;
          })
          .catch(error => {
            deliveryStatus.dashboard = {
              sent: false,
              users: 0,
              error: error.message,
            };
          })
      );
    }

    // Webhook distribution
    if (channels.includes("webhook")) {
      distributionPromises.push(
        distributeViaWebhook(
          body.content_id,
          body.content_title || "Content Optimization",
          filteredSuggestions,
          stakeholderData.webhookUrls,
          distributionType
        )
          .then(result => {
            deliveryStatus.webhook = result;
          })
          .catch(error => {
            deliveryStatus.webhook = {
              sent: false,
              endpoints: 0,
              error: error.message,
            };
          })
      );
    }

    // Wait for all distributions to complete
    await Promise.allSettled(distributionPromises);

    // Update distribution status
    const finalStatus = Object.values(deliveryStatus).some(
      status => status.sent
    )
      ? "completed"
      : "failed";

    await supabase
      .from("content_optimization_distributions")
      .update({
        status: finalStatus,
        delivery_status: deliveryStatus,
        completed_at: new Date().toISOString(),
      })
      .eq("id", distributionId);

    // Calculate total stakeholders notified
    const totalStakeholders = [
      ...deliveryStatus.email.recipients,
      ...deliveryStatus.slack.channels,
      deliveryStatus.dashboard.users,
      deliveryStatus.webhook.endpoints,
    ].length;

    const response: DistributionResponse = {
      success: finalStatus === "completed",
      distribution_id: distributionId,
      message:
        finalStatus === "completed"
          ? "Content optimization suggestions distributed successfully"
          : "Distribution completed with some errors",
      distribution_summary: {
        content_id: body.content_id,
        channels_used: channels.filter(
          channel => deliveryStatus[channel as keyof typeof deliveryStatus].sent
        ),
        stakeholders_notified: totalStakeholders,
        suggestions_distributed: filteredSuggestions.length,
        distribution_type: distributionType,
        timestamp: new Date().toISOString(),
      },
      delivery_status: deliveryStatus,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Content optimization distribution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to distribute content optimization suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to get stakeholder contact information
async function getStakeholderContacts(
  supabase: any,
  stakeholderGroups: string[]
) {
  // Mock data - in production, this would query the database for stakeholder preferences
  const mockData = {
    emails: [
      "content-team@company.com",
      "marketing-team@company.com",
      "social-media@company.com",
    ],
    slackChannels: [
      "#content-optimization",
      "#marketing-alerts",
      "#content-team",
    ],
    users: 15, // Number of dashboard users to notify
    webhookUrls: [
      "https://hooks.slack.com/services/...",
      "https://api.clickup.com/webhooks/...",
    ],
  };

  // TODO: Replace with actual database queries
  // const { data: stakeholderPreferences } = await supabase
  //   .from('stakeholder_notification_preferences')
  //   .select('*')
  //   .in('group', stakeholderGroups);

  return mockData;
}

// Distribution helper functions
async function distributeViaEmail(
  contentId: string,
  contentTitle: string,
  suggestions: any[],
  recipients: string[],
  distributionType: string
) {
  try {
    // Here you would integrate with your email service (SendGrid, SES, etc.)
    console.log(
      `Sending ${distributionType} email to ${recipients.length} recipients for content: ${contentTitle}`
    );

    // Mock email sending
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      sent: true,
      recipients: recipients,
      error: undefined,
    };
  } catch (error) {
    return {
      sent: false,
      recipients: [],
      error:
        error instanceof Error ? error.message : "Email distribution failed",
    };
  }
}

async function distributeViaSlack(
  contentId: string,
  contentTitle: string,
  suggestions: any[],
  channels: string[],
  distributionType: string
) {
  try {
    // Here you would integrate with Slack API
    console.log(
      `Sending ${distributionType} Slack notification to ${channels.length} channels for content: ${contentTitle}`
    );

    // Mock Slack sending
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      sent: true,
      channels: channels,
      error: undefined,
    };
  } catch (error) {
    return {
      sent: false,
      channels: [],
      error:
        error instanceof Error ? error.message : "Slack distribution failed",
    };
  }
}

async function distributeViaDashboard(
  contentId: string,
  contentTitle: string,
  suggestions: any[],
  userCount: number,
  distributionType: string
) {
  try {
    // Here you would store in-app notifications in the database
    console.log(
      `Creating ${distributionType} dashboard notifications for ${userCount} users for content: ${contentTitle}`
    );

    // Mock dashboard notification creation
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      sent: true,
      users: userCount,
      error: undefined,
    };
  } catch (error) {
    return {
      sent: false,
      users: 0,
      error:
        error instanceof Error
          ? error.message
          : "Dashboard distribution failed",
    };
  }
}

async function distributeViaWebhook(
  contentId: string,
  contentTitle: string,
  suggestions: any[],
  webhookUrls: string[],
  distributionType: string
) {
  try {
    // Here you would send HTTP requests to webhook URLs
    console.log(
      `Sending ${distributionType} webhook notifications to ${webhookUrls.length} endpoints for content: ${contentTitle}`
    );

    // Mock webhook sending
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      sent: true,
      endpoints: webhookUrls.length,
      error: undefined,
    };
  } catch (error) {
    return {
      sent: false,
      endpoints: 0,
      error:
        error instanceof Error ? error.message : "Webhook distribution failed",
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const distributionId = searchParams.get("distribution_id");
    const contentId = searchParams.get("content_id");

    if (distributionId) {
      // Get specific distribution status
      const { data: distribution } = await supabase
        .from("content_optimization_distributions")
        .select("*")
        .eq("id", distributionId)
        .single();

      if (!distribution) {
        return NextResponse.json(
          { error: "Distribution not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        distribution: distribution,
      });
    }

    if (contentId) {
      // Get all distributions for a content item
      const { data: distributions } = await supabase
        .from("content_optimization_distributions")
        .select("*")
        .eq("content_id", contentId)
        .order("created_at", { ascending: false });

      return NextResponse.json({
        success: true,
        distributions: distributions || [],
      });
    }

    // Get recent distributions
    const { data: distributions } = await supabase
      .from("content_optimization_distributions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      distributions: distributions || [],
    });
  } catch (error) {
    console.error("Error fetching distribution data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch distribution data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
