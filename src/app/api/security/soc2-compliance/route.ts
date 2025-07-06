import { NextRequest, NextResponse } from "next/server";
import { soc2ComplianceManager } from "@/lib/security/soc2-compliance";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/security/soc2-compliance
 * Retrieve SOC 2 compliance information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const criteria = searchParams.get("criteria");
    const controlId = searchParams.get("controlId");

    switch (action) {
      case "controls":
        const controls = criteria
          ? soc2ComplianceManager.getControls(criteria as any)
          : soc2ComplianceManager.getControls();

        return NextResponse.json({
          success: true,
          data: controls,
          count: controls.length,
        });

      case "control":
        if (!controlId) {
          return NextResponse.json(
            {
              success: false,
              error: "Control ID is required",
            },
            { status: 400 }
          );
        }

        const control = soc2ComplianceManager.getControl(controlId);
        if (!control) {
          return NextResponse.json(
            {
              success: false,
              error: "Control not found",
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: control,
        });

      case "metrics":
        const metrics = soc2ComplianceManager.getComplianceMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
        });

      case "readiness":
        const readinessReport =
          await soc2ComplianceManager.generateReadinessReport();
        return NextResponse.json({
          success: true,
          data: readinessReport,
        });

      case "automated-check":
        const checkResults =
          await soc2ComplianceManager.performAutomatedCheck();
        return NextResponse.json({
          success: true,
          data: checkResults,
        });

      case "dashboard":
        // Get dashboard data from database view
        const { data: dashboardData, error: dashboardError } = await supabase
          .from("soc2_dashboard")
          .select("*");

        if (dashboardError) {
          throw dashboardError;
        }

        return NextResponse.json({
          success: true,
          data: dashboardData,
        });

      case "requiring-attention":
        // Get controls requiring attention
        const { data: attentionData, error: attentionError } = await supabase
          .from("soc2_controls_requiring_attention")
          .select("*")
          .limit(20);

        if (attentionError) {
          throw attentionError;
        }

        return NextResponse.json({
          success: true,
          data: attentionData,
        });

      case "evidence-summary":
        // Get evidence summary
        const { data: evidenceData, error: evidenceError } = await supabase
          .from("soc2_evidence_summary")
          .select("*");

        if (evidenceError) {
          throw evidenceError;
        }

        return NextResponse.json({
          success: true,
          data: evidenceData,
        });

      default:
        // Return overview data
        const overview = {
          metrics: soc2ComplianceManager.getComplianceMetrics(),
          readiness: await soc2ComplianceManager.generateReadinessReport(),
          controls_count: soc2ComplianceManager.getControls().length,
        };

        return NextResponse.json({
          success: true,
          data: overview,
        });
    }
  } catch (error) {
    console.error("SOC 2 Compliance API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/security/soc2-compliance
 * Create or update SOC 2 compliance data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "update-control-status":
        const { controlId, status, exceptions, remediationPlan } = data;

        if (!controlId || !status) {
          return NextResponse.json(
            {
              success: false,
              error: "Control ID and status are required",
            },
            { status: 400 }
          );
        }

        await soc2ComplianceManager.updateControlStatus(
          controlId,
          status,
          exceptions,
          remediationPlan
        );

        return NextResponse.json({
          success: true,
          message: "Control status updated successfully",
        });

      case "add-evidence":
        const evidenceData = {
          control_id: data.controlId,
          evidence_type: data.evidenceType,
          title: data.title,
          description: data.description,
          file_path: data.filePath,
          data: data.evidenceData || {},
          collected_by: data.collectedBy,
        };

        const newEvidence =
          await soc2ComplianceManager.addEvidence(evidenceData);

        return NextResponse.json({
          success: true,
          data: newEvidence,
          message: "Evidence added successfully",
        });

      case "create-assessment":
        const assessmentData = {
          assessment_type: data.assessmentType || "internal",
          assessor: data.assessor,
          overall_score: data.overallScore,
          security_score: data.securityScore,
          availability_score: data.availabilityScore,
          processing_integrity_score: data.processingIntegrityScore,
          confidentiality_score: data.confidentialityScore,
          privacy_score: data.privacyScore,
          findings: data.findings || {},
          recommendations: data.recommendations || [],
          next_assessment_date: data.nextAssessmentDate,
          status: data.status || "in_progress",
        };

        const { data: assessment, error: assessmentError } = await supabase
          .from("soc2_assessments")
          .insert(assessmentData)
          .select()
          .single();

        if (assessmentError) {
          throw assessmentError;
        }

        return NextResponse.json({
          success: true,
          data: assessment,
          message: "Assessment created successfully",
        });

      case "update-compliance-metrics":
        // Call the database function to update metrics
        const { error: metricsError } = await supabase.rpc(
          "update_compliance_metrics"
        );

        if (metricsError) {
          throw metricsError;
        }

        return NextResponse.json({
          success: true,
          message: "Compliance metrics updated successfully",
        });

      case "initialize-controls":
        // Initialize SOC 2 controls in the database
        const controls = soc2ComplianceManager.getControls();

        for (const control of controls) {
          const { error: insertError } = await supabase
            .from("soc2_controls")
            .upsert({
              id: control.id,
              criteria: control.criteria,
              category: control.category,
              title: control.title,
              description: control.description,
              implementation: control.implementation,
              evidence_procedures: control.evidence_procedures,
              responsible_party: control.responsible_party,
              frequency: control.frequency,
              last_tested: control.last_tested.toISOString(),
              next_test_due: control.next_test_due.toISOString(),
              status: control.status,
              exceptions: control.exceptions,
              remediation_plan: control.remediation_plan,
            });

          if (insertError) {
            console.error(
              `Error inserting control ${control.id}:`,
              insertError
            );
          }
        }

        return NextResponse.json({
          success: true,
          message: `${controls.length} SOC 2 controls initialized successfully`,
        });

      case "run-compliance-check":
        // Perform automated compliance check
        const automatedResults =
          await soc2ComplianceManager.performAutomatedCheck();

        // Update compliance metrics after the check
        await supabase.rpc("update_compliance_metrics");

        return NextResponse.json({
          success: true,
          data: automatedResults,
          message: "Automated compliance check completed",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action specified",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("SOC 2 Compliance API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/security/soc2-compliance
 * Update existing SOC 2 compliance data
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, ...data } = body;

    switch (action) {
      case "update-evidence":
        if (!id) {
          return NextResponse.json(
            {
              success: false,
              error: "Evidence ID is required",
            },
            { status: 400 }
          );
        }

        const { data: updatedEvidence, error: evidenceError } = await supabase
          .from("soc2_evidence")
          .update({
            review_status: data.reviewStatus,
            reviewer: data.reviewer,
            review_notes: data.reviewNotes,
            reviewed_at:
              data.reviewStatus !== "pending" ? new Date().toISOString() : null,
          })
          .eq("id", id)
          .select()
          .single();

        if (evidenceError) {
          throw evidenceError;
        }

        return NextResponse.json({
          success: true,
          data: updatedEvidence,
          message: "Evidence updated successfully",
        });

      case "update-assessment":
        if (!id) {
          return NextResponse.json(
            {
              success: false,
              error: "Assessment ID is required",
            },
            { status: 400 }
          );
        }

        const { data: updatedAssessment, error: assessmentError } =
          await supabase
            .from("soc2_assessments")
            .update(data)
            .eq("id", id)
            .select()
            .single();

        if (assessmentError) {
          throw assessmentError;
        }

        return NextResponse.json({
          success: true,
          data: updatedAssessment,
          message: "Assessment updated successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action specified",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("SOC 2 Compliance API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/security/soc2-compliance
 * Delete SOC 2 compliance data
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID is required",
        },
        { status: 400 }
      );
    }

    switch (action) {
      case "evidence":
        const { error: evidenceError } = await supabase
          .from("soc2_evidence")
          .delete()
          .eq("id", id);

        if (evidenceError) {
          throw evidenceError;
        }

        return NextResponse.json({
          success: true,
          message: "Evidence deleted successfully",
        });

      case "assessment":
        const { error: assessmentError } = await supabase
          .from("soc2_assessments")
          .delete()
          .eq("id", id);

        if (assessmentError) {
          throw assessmentError;
        }

        return NextResponse.json({
          success: true,
          message: "Assessment deleted successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action specified",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("SOC 2 Compliance API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
