import { NextRequest, NextResponse } from "next/server";
import { SecurityAssessment } from "@/../scripts/security-assessment";

export async function GET(_request: NextRequest) {
  try {
    console.log("🔒 Starting Security Assessment API...");

    const assessment = new SecurityAssessment();
    const report = await assessment.runAllTests();

    // Return the comprehensive security report
    return NextResponse.json(
      {
        success: true,
        data: report,
        message: "Security assessment completed successfully",
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Security headers for this endpoint
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      }
    );
  } catch (error) {
    console.error("Security assessment error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Security assessment failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      }
    );
  }
}

// Only allow GET requests
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed",
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed",
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed",
    },
    { status: 405 }
  );
}
