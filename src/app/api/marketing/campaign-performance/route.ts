import { NextRequest, NextResponse } from "next/server";

// Types for API responses
interface ABTest {
  id: string;
  name: string;
  campaign_id: string;
  status: "draft" | "running" | "completed" | "paused";
  variants: ABVariant[];
  test_type: "subject_line" | "content" | "creative" | "audience" | "timing";
  start_date: string;
  end_date?: string;
  sample_size: number;
  significance_level: number;
  current_significance?: number;
  confidence_level?: number;
  winner?: string;
  created_at: string;
  updated_at: string;
}

interface ABVariant {
  id: string;
  name: string;
  traffic_split: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversion_rate: number;
    cost: number;
    revenue: number;
    roi: number;
  };
  content?: {
    subject_line?: string;
    headline?: string;
    description?: string;
    cta_text?: string;
    creative_url?: string;
  };
}

interface CampaignMetrics {
  id: string;
  name: string;
  status: "active" | "paused" | "completed" | "draft";
  platform: string;
  start_date: string;
  end_date?: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversion_rate: number;
  cpa: number;
  roas: number;
  roi: number;
  ab_tests: ABTest[];
  approval_status: "pending" | "approved" | "rejected" | "needs_review";
  last_updated: string;
}

interface ContentApproval {
  id: string;
  campaign_id: string;
  content_type: "creative" | "copy" | "subject_line" | "landing_page";
  content_preview: string;
  status: "pending" | "approved" | "rejected" | "needs_revision";
  submitted_by: string;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  feedback?: string;
  revision_count: number;
  auto_approval_eligible: boolean;
  approval_rules_met: string[];
  approval_rules_failed: string[];
}

// Mock data
const mockCampaigns: CampaignMetrics[] = [
  {
    id: "camp-001",
    name: "Summer Sale 2024",
    status: "active",
    platform: "Google Ads",
    start_date: "2024-06-10",
    budget: 50000,
    spent: 35420,
    impressions: 124580,
    clicks: 3847,
    conversions: 156,
    ctr: 3.09,
    conversion_rate: 4.05,
    cpa: 227.05,
    roas: 4.2,
    roi: 320,
    ab_tests: [],
    approval_status: "approved",
    last_updated: new Date().toISOString(),
  },
  {
    id: "camp-002",
    name: "Brand Awareness Q3",
    status: "active",
    platform: "Facebook Ads",
    start_date: "2024-06-03",
    budget: 25000,
    spent: 18340,
    impressions: 89230,
    clicks: 2156,
    conversions: 78,
    ctr: 2.42,
    conversion_rate: 3.62,
    cpa: 235.13,
    roas: 3.8,
    roi: 280,
    ab_tests: [],
    approval_status: "approved",
    last_updated: new Date().toISOString(),
  },
  {
    id: "camp-003",
    name: "Product Launch Campaign",
    status: "draft",
    platform: "LinkedIn Ads",
    start_date: "2024-06-20",
    budget: 15000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    conversion_rate: 0,
    cpa: 0,
    roas: 0,
    roi: 0,
    ab_tests: [],
    approval_status: "pending",
    last_updated: new Date().toISOString(),
  },
];

const mockABTests: ABTest[] = [
  {
    id: "ab-001",
    name: "Subject Line Test - Summer Sale",
    campaign_id: "camp-001",
    status: "running",
    test_type: "subject_line",
    start_date: "2024-06-14",
    sample_size: 10000,
    significance_level: 95,
    current_significance: 87,
    confidence_level: 92,
    created_at: "2024-06-14T10:00:00Z",
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "var-001",
        name: "Control",
        traffic_split: 50,
        metrics: {
          impressions: 5000,
          clicks: 185,
          conversions: 12,
          ctr: 3.7,
          conversion_rate: 6.49,
          cost: 890,
          revenue: 2340,
          roi: 162.9,
        },
        content: {
          subject_line: "🌞 Summer Sale - Save up to 50%!",
        },
      },
      {
        id: "var-002",
        name: "Variant A",
        traffic_split: 50,
        metrics: {
          impressions: 5000,
          clicks: 202,
          conversions: 16,
          ctr: 4.04,
          conversion_rate: 7.92,
          cost: 870,
          revenue: 3120,
          roi: 258.6,
        },
        content: {
          subject_line: "Limited Time: 50% Off Everything!",
        },
      },
    ],
  },
  {
    id: "ab-002",
    name: "Creative Test - Brand Awareness",
    campaign_id: "camp-002",
    status: "completed",
    test_type: "creative",
    start_date: "2024-06-01",
    end_date: "2024-06-10",
    sample_size: 8000,
    significance_level: 95,
    current_significance: 97,
    confidence_level: 98,
    winner: "var-004",
    created_at: "2024-06-01T09:00:00Z",
    updated_at: "2024-06-10T18:00:00Z",
    variants: [
      {
        id: "var-003",
        name: "Control",
        traffic_split: 50,
        metrics: {
          impressions: 4000,
          clicks: 120,
          conversions: 8,
          ctr: 3.0,
          conversion_rate: 6.67,
          cost: 650,
          revenue: 1600,
          roi: 146.2,
        },
        content: {
          headline: "Discover Our Premium Products",
          description: "Experience quality like never before",
        },
      },
      {
        id: "var-004",
        name: "Variant B",
        traffic_split: 50,
        metrics: {
          impressions: 4000,
          clicks: 156,
          conversions: 14,
          ctr: 3.9,
          conversion_rate: 8.97,
          cost: 620,
          revenue: 2800,
          roi: 351.6,
        },
        content: {
          headline: "Transform Your Experience Today",
          description: "Join thousands of satisfied customers",
        },
      },
    ],
  },
];

const mockApprovals: ContentApproval[] = [
  {
    id: "app-001",
    campaign_id: "camp-001",
    content_type: "creative",
    content_preview: "Summer sale banner with bright colors and 50% off text",
    status: "pending",
    submitted_by: "Design Team",
    submitted_at: "2024-06-17T16:00:00Z",
    revision_count: 0,
    auto_approval_eligible: false,
    approval_rules_met: ["Brand guidelines", "Size requirements"],
    approval_rules_failed: ["Legal disclaimer missing"],
  },
  {
    id: "app-002",
    campaign_id: "camp-002",
    content_type: "copy",
    content_preview:
      "Discover our premium products with exclusive features that will transform your daily routine. Join thousands of satisfied customers who have already made the switch.",
    status: "approved",
    submitted_by: "Content Team",
    submitted_at: "2024-06-16T10:00:00Z",
    reviewed_by: "Marketing Manager",
    reviewed_at: "2024-06-16T14:30:00Z",
    feedback: "Looks great! Approved for publication.",
    revision_count: 1,
    auto_approval_eligible: true,
    approval_rules_met: [
      "Brand voice",
      "Legal compliance",
      "Length requirements",
    ],
    approval_rules_failed: [],
  },
  {
    id: "app-003",
    campaign_id: "camp-003",
    content_type: "subject_line",
    content_preview:
      "🚀 Revolutionary Product Launch - Be the First to Experience It!",
    status: "needs_revision",
    submitted_by: "Email Marketing Team",
    submitted_at: "2024-06-17T11:00:00Z",
    reviewed_by: "Compliance Officer",
    reviewed_at: "2024-06-17T15:00:00Z",
    feedback:
      "Remove the rocket emoji and tone down the superlatives. Also ensure compliance with email marketing regulations.",
    revision_count: 2,
    auto_approval_eligible: false,
    approval_rules_met: ["Length requirements"],
    approval_rules_failed: ["Brand voice guidelines", "Regulatory compliance"],
  },
  {
    id: "app-004",
    campaign_id: "camp-001",
    content_type: "landing_page",
    content_preview:
      "Landing page for summer sale with hero image, product showcase, and clear call-to-action button",
    status: "rejected",
    submitted_by: "Web Team",
    submitted_at: "2024-06-15T14:00:00Z",
    reviewed_by: "UX Manager",
    reviewed_at: "2024-06-16T09:00:00Z",
    feedback:
      "The layout doesn't follow our accessibility guidelines. Please ensure proper color contrast and keyboard navigation support.",
    revision_count: 0,
    auto_approval_eligible: false,
    approval_rules_met: ["Mobile responsiveness"],
    approval_rules_failed: [
      "Accessibility standards",
      "Color contrast requirements",
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const campaignId = searchParams.get("campaignId");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    switch (action) {
      case "campaigns":
        let filteredCampaigns = mockCampaigns;

        if (status && status !== "all") {
          filteredCampaigns = filteredCampaigns.filter(
            c => c.status === status
          );
        }

        if (dateFrom) {
          filteredCampaigns = filteredCampaigns.filter(
            c => c.start_date >= dateFrom
          );
        }

        if (dateTo) {
          filteredCampaigns = filteredCampaigns.filter(
            c => c.start_date <= dateTo
          );
        }

        return NextResponse.json({
          success: true,
          data: filteredCampaigns,
          total: filteredCampaigns.length,
        });

      case "ab-tests":
        let filteredABTests = mockABTests;

        if (campaignId && campaignId !== "all") {
          filteredABTests = filteredABTests.filter(
            t => t.campaign_id === campaignId
          );
        }

        if (status && status !== "all") {
          filteredABTests = filteredABTests.filter(t => t.status === status);
        }

        return NextResponse.json({
          success: true,
          data: filteredABTests,
          total: filteredABTests.length,
        });

      case "approvals":
        let filteredApprovals = mockApprovals;

        if (campaignId && campaignId !== "all") {
          filteredApprovals = filteredApprovals.filter(
            a => a.campaign_id === campaignId
          );
        }

        if (status && status !== "all") {
          filteredApprovals = filteredApprovals.filter(
            a => a.status === status
          );
        }

        return NextResponse.json({
          success: true,
          data: filteredApprovals,
          total: filteredApprovals.length,
        });

      case "analytics":
        const analytics = {
          campaign_performance: {
            total_campaigns: mockCampaigns.length,
            active_campaigns: mockCampaigns.filter(c => c.status === "active")
              .length,
            total_budget: mockCampaigns.reduce((sum, c) => sum + c.budget, 0),
            total_spent: mockCampaigns.reduce((sum, c) => sum + c.spent, 0),
            avg_roi:
              mockCampaigns.reduce((sum, c) => sum + c.roi, 0) /
              mockCampaigns.length,
            avg_roas:
              mockCampaigns.reduce((sum, c) => sum + c.roas, 0) /
              mockCampaigns.length,
          },
          ab_test_performance: {
            total_tests: mockABTests.length,
            running_tests: mockABTests.filter(t => t.status === "running")
              .length,
            completed_tests: mockABTests.filter(t => t.status === "completed")
              .length,
            avg_significance:
              mockABTests
                .filter(t => t.current_significance)
                .reduce((sum, t) => sum + (t.current_significance || 0), 0) /
              mockABTests.filter(t => t.current_significance).length,
            test_types: [
              {
                name: "Subject Lines",
                count: mockABTests.filter(t => t.test_type === "subject_line")
                  .length,
              },
              {
                name: "Creative",
                count: mockABTests.filter(t => t.test_type === "creative")
                  .length,
              },
              {
                name: "Content",
                count: mockABTests.filter(t => t.test_type === "content")
                  .length,
              },
              {
                name: "Audience",
                count: mockABTests.filter(t => t.test_type === "audience")
                  .length,
              },
              {
                name: "Timing",
                count: mockABTests.filter(t => t.test_type === "timing").length,
              },
            ],
          },
          approval_workflow: {
            total_submissions: mockApprovals.length,
            pending_approvals: mockApprovals.filter(a => a.status === "pending")
              .length,
            approved_content: mockApprovals.filter(a => a.status === "approved")
              .length,
            rejected_content: mockApprovals.filter(a => a.status === "rejected")
              .length,
            auto_approval_rate:
              (mockApprovals.filter(a => a.auto_approval_eligible).length /
                mockApprovals.length) *
              100,
            avg_review_time: 24, // hours
            content_types: [
              {
                name: "Creative",
                count: mockApprovals.filter(a => a.content_type === "creative")
                  .length,
              },
              {
                name: "Copy",
                count: mockApprovals.filter(a => a.content_type === "copy")
                  .length,
              },
              {
                name: "Subject Line",
                count: mockApprovals.filter(
                  a => a.content_type === "subject_line"
                ).length,
              },
              {
                name: "Landing Page",
                count: mockApprovals.filter(
                  a => a.content_type === "landing_page"
                ).length,
              },
            ],
          },
        };

        return NextResponse.json({
          success: true,
          data: analytics,
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            campaigns: mockCampaigns,
            ab_tests: mockABTests,
            approvals: mockApprovals,
          },
        });
    }
  } catch (error) {
    console.error("Campaign Performance API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaign performance data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "create-ab-test":
        const newABTest: ABTest = {
          id: `ab-${Date.now()}`,
          name: data.name,
          campaign_id: data.campaign_id,
          status: "draft",
          test_type: data.test_type,
          start_date: data.start_date,
          sample_size: data.sample_size,
          significance_level: data.significance_level,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          variants: data.variants || [],
        };

        // In a real app, save to database
        mockABTests.push(newABTest);

        return NextResponse.json({
          success: true,
          data: newABTest,
          message: "A/B test created successfully",
        });

      case "update-ab-test":
        const testIndex = mockABTests.findIndex(t => t.id === data.id);
        if (testIndex === -1) {
          return NextResponse.json(
            { success: false, error: "A/B test not found" },
            { status: 404 }
          );
        }

        mockABTests[testIndex] = {
          ...mockABTests[testIndex],
          ...data,
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: mockABTests[testIndex],
          message: "A/B test updated successfully",
        });

      case "submit-approval":
        const newApproval: ContentApproval = {
          id: `app-${Date.now()}`,
          campaign_id: data.campaign_id,
          content_type: data.content_type,
          content_preview: data.content_preview,
          status: "pending",
          submitted_by: data.submitted_by || "Current User",
          submitted_at: new Date().toISOString(),
          revision_count: 0,
          auto_approval_eligible: data.auto_approval_eligible || false,
          approval_rules_met: data.approval_rules_met || [],
          approval_rules_failed: data.approval_rules_failed || [],
        };

        // Auto-approval logic
        if (
          newApproval.auto_approval_eligible &&
          newApproval.approval_rules_failed.length === 0
        ) {
          newApproval.status = "approved";
          newApproval.reviewed_by = "Auto-Approval System";
          newApproval.reviewed_at = new Date().toISOString();
          newApproval.feedback =
            "Automatically approved based on predefined rules";
        }

        mockApprovals.push(newApproval);

        return NextResponse.json({
          success: true,
          data: newApproval,
          message:
            newApproval.status === "approved"
              ? "Content automatically approved"
              : "Content submitted for approval",
        });

      case "approve-content":
        const approvalIndex = mockApprovals.findIndex(a => a.id === data.id);
        if (approvalIndex === -1) {
          return NextResponse.json(
            { success: false, error: "Content approval not found" },
            { status: 404 }
          );
        }

        mockApprovals[approvalIndex] = {
          ...mockApprovals[approvalIndex],
          status: "approved",
          reviewed_by: data.reviewed_by || "Current User",
          reviewed_at: new Date().toISOString(),
          feedback: data.feedback || "Approved",
        };

        return NextResponse.json({
          success: true,
          data: mockApprovals[approvalIndex],
          message: "Content approved successfully",
        });

      case "reject-content":
        const rejectIndex = mockApprovals.findIndex(a => a.id === data.id);
        if (rejectIndex === -1) {
          return NextResponse.json(
            { success: false, error: "Content approval not found" },
            { status: 404 }
          );
        }

        mockApprovals[rejectIndex] = {
          ...mockApprovals[rejectIndex],
          status: "rejected",
          reviewed_by: data.reviewed_by || "Current User",
          reviewed_at: new Date().toISOString(),
          feedback: data.feedback || "Content rejected",
        };

        return NextResponse.json({
          success: true,
          data: mockApprovals[rejectIndex],
          message: "Content rejected",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Campaign Performance POST API Error:", error);
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, ...updateData } = body;

    switch (action) {
      case "update-campaign":
        const campaignIndex = mockCampaigns.findIndex(c => c.id === id);
        if (campaignIndex === -1) {
          return NextResponse.json(
            { success: false, error: "Campaign not found" },
            { status: 404 }
          );
        }

        mockCampaigns[campaignIndex] = {
          ...mockCampaigns[campaignIndex],
          ...updateData,
          last_updated: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: mockCampaigns[campaignIndex],
          message: "Campaign updated successfully",
        });

      case "start-ab-test":
        const testToStart = mockABTests.findIndex(t => t.id === id);
        if (testToStart === -1) {
          return NextResponse.json(
            { success: false, error: "A/B test not found" },
            { status: 404 }
          );
        }

        mockABTests[testToStart].status = "running";
        mockABTests[testToStart].start_date = new Date().toISOString();
        mockABTests[testToStart].updated_at = new Date().toISOString();

        return NextResponse.json({
          success: true,
          data: mockABTests[testToStart],
          message: "A/B test started successfully",
        });

      case "pause-ab-test":
        const testToPause = mockABTests.findIndex(t => t.id === id);
        if (testToPause === -1) {
          return NextResponse.json(
            { success: false, error: "A/B test not found" },
            { status: 404 }
          );
        }

        mockABTests[testToPause].status = "paused";
        mockABTests[testToPause].updated_at = new Date().toISOString();

        return NextResponse.json({
          success: true,
          data: mockABTests[testToPause],
          message: "A/B test paused successfully",
        });

      case "complete-ab-test":
        const testToComplete = mockABTests.findIndex(t => t.id === id);
        if (testToComplete === -1) {
          return NextResponse.json(
            { success: false, error: "A/B test not found" },
            { status: 404 }
          );
        }

        mockABTests[testToComplete].status = "completed";
        mockABTests[testToComplete].end_date = new Date().toISOString();
        mockABTests[testToComplete].updated_at = new Date().toISOString();

        // Determine winner based on highest conversion rate
        const bestVariant = mockABTests[testToComplete].variants.reduce(
          (best, current) =>
            current.metrics.conversion_rate > best.metrics.conversion_rate
              ? current
              : best
        );
        mockABTests[testToComplete].winner = bestVariant.id;

        return NextResponse.json({
          success: true,
          data: mockABTests[testToComplete],
          message: "A/B test completed successfully",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Campaign Performance PUT API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    switch (type) {
      case "ab-test":
        const testIndex = mockABTests.findIndex(t => t.id === id);
        if (testIndex === -1) {
          return NextResponse.json(
            { success: false, error: "A/B test not found" },
            { status: 404 }
          );
        }

        mockABTests.splice(testIndex, 1);

        return NextResponse.json({
          success: true,
          message: "A/B test deleted successfully",
        });

      case "approval":
        const approvalIndex = mockApprovals.findIndex(a => a.id === id);
        if (approvalIndex === -1) {
          return NextResponse.json(
            { success: false, error: "Content approval not found" },
            { status: 404 }
          );
        }

        mockApprovals.splice(approvalIndex, 1);

        return NextResponse.json({
          success: true,
          message: "Content approval deleted successfully",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Campaign Performance DELETE API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
