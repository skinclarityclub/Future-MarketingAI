import { NextRequest, NextResponse } from "next/server";
import { enterpriseApprovalEngine } from "@/lib/approval/enterprise-approval-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "analytics":
        const startDate =
          searchParams.get("start") ||
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = searchParams.get("end") || new Date().toISOString();

        const analytics = await enterpriseApprovalEngine.getApprovalAnalytics({
          start: startDate,
          end: endDate,
        });
        return NextResponse.json(analytics);

      case "compliance-report":
        const requestId = searchParams.get("requestId");
        if (!requestId) {
          return NextResponse.json(
            { error: "Request ID is required for compliance reports" },
            { status: 400 }
          );
        }

        const complianceReport =
          await enterpriseApprovalEngine.generateComplianceReport(requestId);
        return NextResponse.json(complianceReport);

      case "workflows":
        return NextResponse.json({
          workflows: [
            {
              id: "budget_approval",
              name: "Budget Approval Workflow",
              type: "budget",
              approval_rate: 85.5,
              avg_completion_time: 4.2,
            },
            {
              id: "campaign_approval",
              name: "Marketing Campaign Approval",
              type: "campaign",
              approval_rate: 92.1,
              avg_completion_time: 2.8,
            },
          ],
        });

      default:
        return NextResponse.json({
          message: "Enterprise Approval System API",
          endpoints: {
            analytics:
              "/api/enterprise-approval?action=analytics&start=2024-01-01&end=2024-12-31",
            compliance:
              "/api/enterprise-approval?action=compliance-report&requestId=REQ123",
            workflows: "/api/enterprise-approval?action=workflows",
          },
        });
    }
  } catch (error) {
    console.error("Enterprise Approval API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "submit-request":
        const requestId = await enterpriseApprovalEngine.submitRequest({
          title: body.title || "New Approval Request",
          description: body.description || "Request description",
          requester: body.requester || {
            id: "user_001",
            name: "John Doe",
            email: "john.doe@company.com",
            department: "Marketing",
          },
          type: body.type || "campaign",
          priority: body.priority || "medium",
          amount: body.amount,
          currency: body.currency || "USD",
          attachments: body.attachments || [],
          metadata: body.metadata || {},
          deadline: body.deadline,
          business_impact: body.business_impact || {
            revenue_impact: 0,
            risk_level: "low",
            compliance_required: false,
            stakeholders: [],
          },
        });

        return NextResponse.json({
          success: true,
          request_id: requestId,
          message: "Approval request submitted successfully",
        });

      case "approve-step":
        await enterpriseApprovalEngine.approveStep(
          body.requestId,
          body.stepId,
          body.approverId,
          body.comments
        );

        return NextResponse.json({
          success: true,
          message: "Step approved successfully",
        });

      case "bulk-approve":
        const bulkResult = await enterpriseApprovalEngine.bulkApprove(
          body.requests
        );

        return NextResponse.json({
          success: true,
          result: bulkResult,
          message: `Bulk approval completed: ${bulkResult.success.length} succeeded, ${bulkResult.failed.length} failed`,
        });

      case "emergency-bypass":
        await enterpriseApprovalEngine.emergencyBypass(
          body.requestId,
          body.bypasserId,
          body.reason,
          body.justification
        );

        return NextResponse.json({
          success: true,
          message: "Emergency bypass executed successfully",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Enterprise Approval POST Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
