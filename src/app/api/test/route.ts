/**
 * Simple Test API
 * Task 37.2: Testing basic API functionality
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "API is working!",
      timestamp: new Date().toISOString(),
      test: "basic-functionality",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
